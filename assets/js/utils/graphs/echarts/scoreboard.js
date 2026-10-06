import { mergeObjects } from "../../objects";
import { getCartesianChartTheme } from "./chart-theme";
import { getThemeSeriesColor } from "../theme-palette";
import dayjs from "dayjs";

export function getOption(mode, places, optionMerge) {
  let option = {
    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        data: [],
      },
    ],
    yAxis: [
      {
        type: "value",
      },
    ],
    series: [],
  };

  const teams = Object.keys(places);
  const legendData = teams.map(team => places[team].name);
  const timestamps = [];
  const teamEvents = teams.map(team => {
    const events = [];

    for (const solve of places[team].solves) {
      const date = dayjs(solve.date);
      if (!date.isValid()) {
        continue;
      }

      const timestamp = date.valueOf();
      timestamps.push(timestamp);
      events.push({
        timestamp,
        value: Number(solve.value),
      });
    }

    return events.sort((a, b) => a.timestamp - b.timestamp);
  });

  const timeline = [...new Set(timestamps)].sort((a, b) => a - b);
  const sameDay =
    timeline.length < 2 ||
    dayjs(timeline[0]).isSame(dayjs(timeline[timeline.length - 1]), "day");
  let timeFormat = sameDay ? "HH:mm" : "MMM D HH:mm";
  let timelineLabels = timeline.map(timestamp =>
    dayjs(timestamp).format(timeFormat),
  );

  if (new Set(timelineLabels).size !== timelineLabels.length) {
    timeFormat = sameDay ? "HH:mm:ss" : "MMM D HH:mm:ss";
    timelineLabels = timeline.map(timestamp =>
      dayjs(timestamp).format(timeFormat),
    );
  }

  option.xAxis[0].data = timelineLabels;

  option = mergeObjects(
    getCartesianChartTheme({
      legendData,
      legendBottom: 35,
    }),
    option,
  );

  option.tooltip = mergeObjects(option.tooltip, {
    trigger: "axis",
    axisPointer: {
      type: "cross",
    },
  });

  for (let i = 0; i < teams.length; i++) {
    let runningScore = 0;
    let eventIndex = 0;
    const scores = timeline.map(timestamp => {
      while (
        eventIndex < teamEvents[i].length &&
        teamEvents[i][eventIndex].timestamp <= timestamp
      ) {
        runningScore += teamEvents[i][eventIndex].value;
        eventIndex += 1;
      }
      return runningScore;
    });

    const data = {
      name: places[teams[i]]["name"],
      type: "line",
      step: "end",
      showSymbol: timeline.length <= 20,
      symbol: "circle",
      symbolSize: 6,
      lineStyle: {
        width: 2.25,
        color: getThemeSeriesColor(i),
      },
      itemStyle: {
        color: getThemeSeriesColor(i),
      },
      emphasis: {
        focus: "series",
      },
      data: scores,
    };
    option.series.push(data);
  }

  if (optionMerge) {
    option = mergeObjects(option, optionMerge);
  }

  return option;
}

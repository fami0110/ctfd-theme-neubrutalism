import { mergeObjects } from "../../objects";
import { cumulativeSum } from "../../math";
import { getCartesianChartTheme } from "./chart-theme";
import { getThemeSeriesColor } from "../theme-palette";
import dayjs from "dayjs";

export function getOption(mode, places, optionMerge) {
  let option = {
    xAxis: [
      {
        type: "time",
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
  const legendData = teams.map((team) => places[team].name);
  const firstSolveTime = teams
    .flatMap((team) => places[team]["solves"])
    .map((solve) => dayjs(solve.date).valueOf())
    .filter(Number.isFinite)
    .reduce((earliest, time) => Math.min(earliest, time), Infinity);

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
    const team_score = [];
    const times = [];
    for (let j = 0; j < places[teams[i]]["solves"].length; j++) {
      team_score.push(places[teams[i]]["solves"][j].value);
      const date = dayjs(places[teams[i]]["solves"][j].date);
      times.push(date.toDate());
    }

    const total_scores = cumulativeSum(team_score);
    let scores = times.map(function (e, i) {
      return [e, total_scores[i]];
    });

    if (scores.length > 0 && Number.isFinite(firstSolveTime)) {
      scores.unshift([new Date(firstSolveTime), 0]);
    }

    const data = {
      name: places[teams[i]]["name"],
      type: "line",
      showSymbol: true,
      showAllSymbol: true,
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

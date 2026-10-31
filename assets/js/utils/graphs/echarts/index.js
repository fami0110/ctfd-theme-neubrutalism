import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  LineChart,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
]);

export function embed(target, option) {
  let chart = echarts.getInstanceByDom(target);
  if (!chart) {
    chart = echarts.init(target);
    window.addEventListener("resize", () => {
      const activeChart = echarts.getInstanceByDom(target);
      if (activeChart) {
        activeChart.resize();
      }
    });
  }

  // https://echarts.apache.org/en/api.html#echartsInstance.setOption
  // https://github.com/apache/echarts/issues/6202#issuecomment-315054637
  // https://stackoverflow.com/a/72211534
  chart.setOption(option, true);
}

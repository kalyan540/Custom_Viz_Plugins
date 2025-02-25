import { SupersetTheme } from "@superset-ui/core";
import { LegendFormData, LegendOrientation, LegendType } from "./types";
import type { GaugeSeriesOption } from "echarts/charts";

export const defaultGaugeSeriesOption = (
  theme: SupersetTheme
): GaugeSeriesOption => ({
  splitLine: {
    lineStyle: {
      color: theme.colors.primary.base,
    },
  },
  axisLine: {
    lineStyle: {
      color: [[1, theme.colors.primary.light4]],
    },
  },
  axisLabel: {
    color: theme.colors.grayscale.dark1,
  },
  axisTick: {
    lineStyle: {
      width: 2,
      color: theme.colors.primary.base,
    },
  },
  detail: {
    color: "auto",
  },
});

export const DEFAULT_LEGEND_FORM_DATA: LegendFormData = {
  legendMargin: null,
  legendOrientation: LegendOrientation.Top,
  legendType: LegendType.Scroll,
  showLegend: true,
};

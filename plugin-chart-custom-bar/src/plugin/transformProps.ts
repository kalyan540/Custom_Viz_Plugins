/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
/* eslint-disable camelcase */
import { invert } from 'lodash';
import {
  AnnotationLayer,
  AxisType,
  buildCustomFormatters,
  CategoricalColorNamespace,
  CurrencyFormatter,
  ensureIsArray,
  tooltipHtml,
  GenericDataType,
  getCustomFormatter,
  getMetricLabel,
  getNumberFormatter,
  getXAxisLabel,
  isDefined,
  isEventAnnotationLayer,
  isFormulaAnnotationLayer,
  isIntervalAnnotationLayer,
  isPhysicalColumn,
  isTimeseriesAnnotationLayer,
  t,
  TimeseriesChartDataResponseResult,
  NumberFormats,
} from '@superset-ui/core';
import {
  extractExtraMetrics,
  getOriginalSeries,
  isDerivedSeries,
  getTimeOffset,
} from '@superset-ui/chart-controls';
import type { EChartsCoreOption } from 'echarts/core';
import type { LineStyleOption } from 'echarts/types/src/util/types';
import type { SeriesOption } from 'echarts';
import {
  EchartsTimeseriesChartProps,
  EchartsTimeseriesFormData,
  OrientationType,
  TimeseriesChartTransformedProps,
} from '../Timeseries/types';
import { DEFAULT_FORM_DATA } from '../constants';
import { ForecastSeriesEnum, ForecastValue, Refs } from '../Timeseries/types';
import { parseAxisBound } from '../utils/controls';
import {
  calculateLowerLogTick,
  dedupSeries,
  extractDataTotalValues,
  extractSeries,
  extractShowValueIndexes,
  extractTooltipKeys,
  getAxisType,
  getColtypesMapping,
  getLegendProps,
  getMinAndMaxFromBounds,
} from '../utils/series';
import {
  extractAnnotationLabels,
  getAnnotationData,
} from '../utils/annotation';
import {
  extractForecastSeriesContext,
  extractForecastSeriesContexts,
  extractForecastValuesFromTooltipParams,
  formatForecastTooltipSeries,
  rebaseForecastDatum,
} from '../utils/forecast';
import { convertInteger } from '../utils/convertInteger';
import { defaultGrid, defaultYAxis } from '../defaults';
import {
  getBaselineSeriesForStream,
  getPadding,
  transformEventAnnotation,
  transformFormulaAnnotation,
  transformIntervalAnnotation,
  transformSeries,
  transformTimeseriesAnnotation,
} from '../transformers';
import {
  OpacityEnum,
  StackControlsValue,
  TIMEGRAIN_TO_TIMESTAMP,
  TIMESERIES_CONSTANTS,
} from '../constants';
import { getDefaultTooltip } from '../utils/tooltip';
import {
  getPercentFormatter,
  getTooltipTimeFormatter,
  getXAxisFormatter,
  getYAxisFormatter,
} from '../utils/formatters';

export default function transformProps(
  chartProps: EchartsTimeseriesChartProps,
): TimeseriesChartTransformedProps {
  const {
    width,
    height,
    filterState,
    legendState,
    formData,
    hooks,
    queriesData,
    datasource,
    theme,
    inContextMenu,
    emitCrossFilters,
  } = chartProps;


  let focusedSeries: string | null = null;

  const {
    verboseMap = {},
    columnFormats = {},
    currencyFormats = {},
  } = datasource;
  const [queryData] = queriesData;
  const { data = [], label_map = {} } =
    queryData as TimeseriesChartDataResponseResult;

  const dataTypes = getColtypesMapping(queryData);
  const annotationData = getAnnotationData(chartProps);

  const {
    area,
    annotationLayers,
    colorScheme,
    contributionMode,
    forecastEnabled,
    groupby,
    legendOrientation,
    legendType,
    legendMargin,
    logAxis,
    markerEnabled,
    markerSize,
    metrics,
    minorSplitLine,
    minorTicks,
    onlyTotal,
    opacity,
    orientation,
    percentageThreshold,
    richTooltip,
    seriesType,
    showLegend,
    showValue,
    sliceId,
    sortSeriesType,
    sortSeriesAscending,
    timeGrainSqla,
    timeCompare,
    timeShiftColor,
    stack,
    tooltipTimeFormat,
    tooltipSortByMetric,
    showTooltipTotal,
    showTooltipPercentage,
    truncateXAxis,
    truncateYAxis,
    xAxis: xAxisOrig,
    xAxisBounds,
    xAxisForceCategorical,
    xAxisLabelRotation,
    xAxisSortSeries,
    xAxisSortSeriesAscending,
    xAxisTimeFormat,
    xAxisTitle,
    xAxisTitleMargin,
    yAxisBounds,
    yAxisFormat,
    currencyFormat,
    yAxisTitle,
    yAxisTitleMargin,
    yAxisTitlePosition,
    zoomable,
    defaultTooltip,
    customTooltip,
    customTooltipText,
    showTooltipTotalNet,
  }: EchartsTimeseriesFormData = { ...DEFAULT_FORM_DATA, ...formData };
  const refs: Refs = {};
  const groupBy = ensureIsArray(groupby);
  const labelMap: { [key: string]: string[] } = Object.entries(
    label_map,
  ).reduce((acc, entry) => {
    if (
      entry[1].length > groupBy.length &&
      Array.isArray(timeCompare) &&
      timeCompare.includes(entry[1][0])
    ) {
      entry[1].shift();
    }
    return { ...acc, [entry[0]]: entry[1] };
  }, {});
  console.log(data);

  const monthOrder: { [key: string]: number } = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  if (xAxisTimeFormat === "%b'%y") {
    // Custom sort function
    data.sort((a, b) => {
      // Check if "Selection Month" exists in both objects
      if (!a[xAxisOrig] || !b[xAxisOrig]) {
        return 0; // Leave the order unchanged if either is missing
      }

      // Split the "Selection Month" into month and year
      const [monthA, yearA] = a[xAxisOrig].split("'");
      const [monthB, yearB] = b[xAxisOrig].split("'");

      // Compare by year first
      const yearComparison = parseInt(yearA) - parseInt(yearB);
      if (yearComparison !== 0) {
        return yearComparison;
      }

      // If years are the same, compare by month order
      return (monthOrder[monthA] || 0) - (monthOrder[monthB] || 0);
    });
  }
  console.log(data, xAxisOrig);
  const colorScale = CategoricalColorNamespace.getScale(colorScheme as string);
  const rebasedData = rebaseForecastDatum(data, verboseMap);
  console.log('rebasedData: ', rebasedData);
  let xAxisLabel = getXAxisLabel(chartProps.rawFormData) as string;
  if (
    isPhysicalColumn(chartProps.rawFormData?.x_axis) &&
    isDefined(verboseMap[xAxisLabel])
  ) {
    xAxisLabel = verboseMap[xAxisLabel];
  }
  const isHorizontal = orientation === OrientationType.Horizontal;
  const { totalStackedValues, thresholdValues } = extractDataTotalValues(
    rebasedData,
    {
      stack,
      percentageThreshold,
      xAxisCol: xAxisLabel,
      legendState,
    },
  );
  const extraMetricLabels = extractExtraMetrics(chartProps.rawFormData).map(
    getMetricLabel,
  );
  console.log('xAxisTimeFormat', xAxisTimeFormat);
  const isMultiSeries = groupBy.length || metrics?.length > 1;

  console.log('rebasedData:', rebasedData);
  console.log('fillNeighborValue:', stack && !forecastEnabled ? 0 : undefined);
  console.log('xAxisLabel:', xAxisLabel);
  console.log('extraMetricLabels:', extraMetricLabels);
  console.log('stack:', stack);
  console.log('totalStackedValues:', totalStackedValues);
  console.log('isHorizontal:', isHorizontal);
  console.log('sortSeriesType:', sortSeriesType);
  console.log('sortSeriesAscending:', sortSeriesAscending);
  console.log('xAxisSortSeries:', isMultiSeries ? xAxisSortSeries : undefined);
  console.log('xAxisSortSeriesAscending:', isMultiSeries ? xAxisSortSeriesAscending : undefined);

  const [rawSeries, sortedTotalValues, minPositiveValue] = extractSeries(
    rebasedData,
    {
      fillNeighborValue: stack && !forecastEnabled ? 0 : undefined,
      xAxis: xAxisLabel,
      extraMetricLabels,
      stack,
      totalStackedValues,
      isHorizontal,
      sortSeriesType,
      sortSeriesAscending,
      xAxisSortSeries: isMultiSeries ? xAxisSortSeries : undefined,
      xAxisSortSeriesAscending: isMultiSeries
        ? xAxisSortSeriesAscending
        : undefined,
    },
  );
  console.log('rawSeries:', rawSeries);
  console.log('totalStackedValues:', totalStackedValues);
  console.log('sortedTotalValues:', sortedTotalValues);

  const showValueIndexes = extractShowValueIndexes(rawSeries, {
    stack,
    onlyTotal,
    isHorizontal,
    legendState,
  });
  const seriesContexts = extractForecastSeriesContexts(
    rawSeries.map(series => series.name as string),
  );
  console.log(seriesContexts);
  const isAreaExpand = stack === StackControlsValue.Expand;
  const xAxisDataType = dataTypes?.[xAxisLabel] ?? dataTypes?.[xAxisOrig];

  const xAxisType = getAxisType(stack, xAxisForceCategorical, xAxisDataType);
  const series: SeriesOption[] = [];
  console.log('series:', series);

  const forcePercentFormatter = Boolean(contributionMode || isAreaExpand);
  const percentFormatter = forcePercentFormatter
    ? getPercentFormatter(yAxisFormat)
    : getPercentFormatter(NumberFormats.PERCENT_2_POINT);
  const defaultFormatter = currencyFormat?.symbol
    ? new CurrencyFormatter({ d3Format: yAxisFormat, currency: currencyFormat })
    : getNumberFormatter(yAxisFormat);
  const customFormatters = buildCustomFormatters(
    metrics,
    currencyFormats,
    columnFormats,
    yAxisFormat,
    currencyFormat,
  );

  const array = ensureIsArray(chartProps.rawFormData?.time_compare);
  const inverted = invert(verboseMap);

  const offsetLineWidths: { [key: string]: number } = {};

  rawSeries.forEach(entry => {
    const derivedSeries = isDerivedSeries(entry, chartProps.rawFormData);
    const lineStyle: LineStyleOption = {};
    if (derivedSeries) {
      const offset = getTimeOffset(
        entry,
        ensureIsArray(chartProps.rawFormData?.time_compare),
      )!;
      if (!offsetLineWidths[offset]) {
        offsetLineWidths[offset] = Object.keys(offsetLineWidths).length + 1;
      }
      lineStyle.type = 'dashed';
      lineStyle.width = offsetLineWidths[offset];
      lineStyle.opacity = OpacityEnum.DerivedSeries;
    }

    const entryName = String(entry.name || '');
    const seriesName = inverted[entryName] || entryName;
    const colorScaleKey = getOriginalSeries(seriesName, array);
    console.log(entry);
    const transformedSeries = transformSeries(
      entry,
      colorScale,
      colorScaleKey,
      {
        area,
        connectNulls: derivedSeries,
        filterState,
        seriesContexts,
        markerEnabled,
        markerSize,
        areaOpacity: opacity,
        seriesType,
        legendState,
        stack,
        formatter: forcePercentFormatter
          ? percentFormatter
          : (getCustomFormatter(
            customFormatters,
            metrics,
            labelMap?.[seriesName]?.[0],
          ) ?? defaultFormatter),
        showValue,
        onlyTotal,
        totalStackedValues: sortedTotalValues,
        showValueIndexes,
        thresholdValues,
        richTooltip,
        sliceId,
        isHorizontal,
        lineStyle,
        timeCompare: array,
        timeShiftColor,
      },
    );
    console.log('transformedSeries:', transformedSeries);
    if (transformedSeries) {
      if (stack === StackControlsValue.Stream) {
        // bug in Echarts - `stackStrategy: 'all'` doesn't work with nulls, so we cast them to 0
        series.push({
          ...transformedSeries,
          data: (transformedSeries.data as any).map(
            (row: [string | number, number]) => [row[0], row[1] ?? 0],
          ),
        });
      } else {
        series.push(transformedSeries);
      }
    }
  });
  console.log('series:', series);

  if (stack === StackControlsValue.Stream) {
    const baselineSeries = getBaselineSeriesForStream(
      series.map(entry => entry.data) as [string | number, number][][],
      seriesType,
    );

    series.unshift(baselineSeries);
  }
  console.log('series:', series);
  const selectedValues = (filterState.selectedValues || []).reduce(
    (acc: Record<string, number>, selectedValue: string) => {
      const index = series.findIndex(({ name }) => name === selectedValue);
      return {
        ...acc,
        [index]: selectedValue,
      };
    },
    {},
  );
  console.log('series:', series);

  annotationLayers
    .filter((layer: AnnotationLayer) => layer.show)
    .forEach((layer: AnnotationLayer) => {
      if (isFormulaAnnotationLayer(layer))
        series.push(
          transformFormulaAnnotation(
            layer,
            data,
            xAxisLabel,
            xAxisType,
            colorScale,
            sliceId,
            orientation,
          ),
        );
      else if (isIntervalAnnotationLayer(layer)) {
        series.push(
          ...transformIntervalAnnotation(
            layer,
            data,
            annotationData,
            colorScale,
            theme,
            sliceId,
            orientation,
          ),
        );
      } else if (isEventAnnotationLayer(layer)) {
        series.push(
          ...transformEventAnnotation(
            layer,
            data,
            annotationData,
            colorScale,
            theme,
            sliceId,
            orientation,
          ),
        );
      } else if (isTimeseriesAnnotationLayer(layer)) {
        series.push(
          ...transformTimeseriesAnnotation(
            layer,
            markerSize,
            data,
            annotationData,
            colorScale,
            sliceId,
            orientation,
          ),
        );
      }
    });
  console.log('series:', series);
  // axis bounds need to be parsed to replace incompatible values with undefined
  const [xAxisMin, xAxisMax] = (xAxisBounds || []).map(parseAxisBound);
  let [yAxisMin, yAxisMax] = (yAxisBounds || []).map(parseAxisBound);

  // default to 0-100% range when doing row-level contribution chart
  if ((contributionMode === 'row' || isAreaExpand) && stack) {
    if (yAxisMin === undefined) yAxisMin = 0;
    if (yAxisMax === undefined) yAxisMax = 1;
  } else if (
    logAxis &&
    yAxisMin === undefined &&
    minPositiveValue !== undefined
  ) {
    yAxisMin = calculateLowerLogTick(minPositiveValue);
  }

  const tooltipFormatter =
    xAxisDataType === GenericDataType.Temporal
      ? getTooltipTimeFormatter(tooltipTimeFormat)
      : String;
  const xAxisFormatter =
    xAxisDataType === GenericDataType.Temporal
      ? getXAxisFormatter(xAxisTimeFormat)
      : String;
  console.log(xAxisFormatter);
  const {
    setDataMask = () => { },
    setControlValue = () => { },
    onContextMenu,
    onLegendStateChanged,
  } = hooks;

  const addYAxisLabelOffset = !!yAxisTitle;
  const addXAxisLabelOffset = !!xAxisTitle;
  const padding = getPadding(
    showLegend,
    legendOrientation,
    addYAxisLabelOffset,
    zoomable,
    legendMargin,
    addXAxisLabelOffset,
    yAxisTitlePosition,
    convertInteger(yAxisTitleMargin),
    convertInteger(xAxisTitleMargin),
    isHorizontal,
  );

  const legendData = rawSeries
    .filter(
      entry =>
        extractForecastSeriesContext(entry.name || '').type ===
        ForecastSeriesEnum.Observation,
    )
    .map(entry => entry.name || '')
    .concat(extractAnnotationLabels(annotationLayers, annotationData));

  let xAxis: any = {
    type: xAxisType,
    name: xAxisTitle,
    nameGap: convertInteger(xAxisTitleMargin),
    nameLocation: 'middle',
    axisLabel: {
      hideOverlap: true,
      formatter: xAxisFormatter,
      rotate: xAxisLabelRotation,
    },
    minorTick: { show: minorTicks },
    minInterval:
      xAxisType === AxisType.Time && timeGrainSqla
        ? TIMEGRAIN_TO_TIMESTAMP[
        timeGrainSqla as keyof typeof TIMEGRAIN_TO_TIMESTAMP
        ]
        : 0,
    ...getMinAndMaxFromBounds(
      xAxisType,
      truncateXAxis,
      xAxisMin,
      xAxisMax,
      seriesType,
    ),
  };
  //console.log(xAxis);

  let yAxis: any = {
    ...defaultYAxis,
    type: logAxis ? AxisType.Log : AxisType.Value,
    min: yAxisMin,
    max: yAxisMax,
    minorTick: { show: minorTicks },
    minorSplitLine: { show: minorSplitLine },
    axisLabel: {
      formatter: getYAxisFormatter(
        metrics,
        forcePercentFormatter,
        customFormatters,
        defaultFormatter,
        yAxisFormat,
      ),
    },
    scale: truncateYAxis,
    name: yAxisTitle,
    nameGap: convertInteger(yAxisTitleMargin),
    nameLocation: yAxisTitlePosition === 'Left' ? 'middle' : 'end',
  };
  console.log('xAxis:', xAxis);
  console.log('yAxis:', yAxis);

  if (isHorizontal) {
    [xAxis, yAxis] = [yAxis, xAxis];
    [padding.bottom, padding.left] = [padding.left, padding.bottom];
  }

  function processSeries(
    series: any[],
    data: any[],
    xAxisTimeFormat: string,
    xAxisOrig: string,
  ): any[] {
    if (
      xAxisTimeFormat === "%b'%y" &&
      data.length > 0 &&
      /^[A-Z][a-z]{2}'\d{2}$/.test(data[0][xAxisOrig]) // Matches format like Jan'24
    ) {
      // Define the order of months
      const monthOrder: { [key: string]: number } = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };

      // Sort each series' data array
      return series.map((serie) => {
        const sortedData = serie.data.sort((a: [string, number], b: [string, number]) => {
          const [monthA, yearA] = a[0].split("'"); // Extract month and year from the date string
          const [monthB, yearB] = b[0].split("'");

          // Compare by year first
          const yearComparison = parseInt(yearA) - parseInt(yearB);
          if (yearComparison !== 0) {
            return yearComparison;
          }

          // If years are the same, compare by month order
          return (monthOrder[monthA] || 0) - (monthOrder[monthB] || 0);
        });

        // Return the updated series with sorted data
        return {
          ...serie,
          data: sortedData,
        };
      });
    } else {
      // If conditions are not met, call dedupSeries
      return dedupSeries(series);
    }
  }
  if (xAxisOrig) {
    console.log('Process Series:', processSeries(series, data, xAxisTimeFormat || '', xAxisOrig));
  }



  const echartOptions: EChartsCoreOption = {
    useUTC: true,
    grid: {
      ...defaultGrid,
      ...padding,
    },
    xAxis,
    yAxis,
    tooltip: {
      ...getDefaultTooltip(refs),
      show: !inContextMenu,
      trigger: richTooltip ? 'axis' : 'item',
      formatter: (params: any) => {
        const [xIndex, yIndex] = isHorizontal ? [1, 0] : [0, 1];
        const xValue: number = richTooltip
          ? params[0].value[xIndex]
          : params.value[xIndex];
        const forecastValue: any[] = richTooltip ? params : [params];
        const sortedKeys = extractTooltipKeys(
          forecastValue,
          yIndex,
          richTooltip,
          tooltipSortByMetric,
        );
        const forecastValues: Record<string, ForecastValue> =
          extractForecastValuesFromTooltipParams(forecastValue, isHorizontal);

        const isForecast = Object.values(forecastValues).some(
          value =>
            value.forecastTrend || value.forecastLower || value.forecastUpper,
        );

        const formatter = forcePercentFormatter
          ? percentFormatter
          : (getCustomFormatter(customFormatters, metrics) ?? defaultFormatter);

        const rows: string[][] = [];
        const total = Object.values(forecastValues).reduce(
          (acc, value) =>
            value.observation !== undefined ? acc + value.observation : acc,
          0,
        );
        const allowTotal = Boolean(isMultiSeries) && richTooltip && !isForecast;
        const showPercentage =
          allowTotal && !forcePercentFormatter && showTooltipPercentage;
        const keys = Object.keys(forecastValues);
        let focusedRow;
        sortedKeys
          .filter(key => keys.includes(key))
          .forEach(key => {
            const value = forecastValues[key];
            if (value.observation === 0 && stack) {
              return;
            }
            const row = formatForecastTooltipSeries({
              ...value,
              seriesName: key,
              formatter,
            });
            if (showPercentage && value.observation !== undefined) {
              row.push(
                percentFormatter.format(value.observation / (total || 1)),
              );
            }
            rows.push(row);
            if (key === focusedSeries) {
              focusedRow = rows.length - 1;
            }
          });
        if (stack) {
          rows.reverse();
          if (focusedRow !== undefined) {
            focusedRow = rows.length - focusedRow - 1;
          }
        }
        console.log('rows:', rows);
        if (allowTotal && showTooltipTotal) {
          const totalRow = ['Total', formatter.format(total)];
          if (showPercentage) {
            totalRow.push(percentFormatter.format(1));
          }
          rows.push(totalRow);
        }

        function calculateCumulativeTotalNetFromSeries(series: any[]) {
          const monthlyNetCounts: { [key: string]: number } = {}; // To store net counts per month
          const totalNetList: { [key: string]: number } = {};    // To store cumulative total net per month
          let cumulativeTotal = 0;    // Running total net

          // Calculate net counts directly from sorted series
          series.forEach((item) => {
            item.data.forEach(([month, count]: [string, number]) => {
              // Ignore null counts
              if (count === null) return;

              // Check if it's an onboard or offboard category
              const isOnboard = item.id.includes("Onboarded");
              const isOffboard = item.id.includes("No Show");

              // Initialize the month's net count if not present
              if (!monthlyNetCounts[month]) {
                monthlyNetCounts[month] = 0;
              }

              // Update net count
              if (isOnboard) {
                monthlyNetCounts[month] += count;
              } else if (isOffboard) {
                monthlyNetCounts[month] -= count;
              }
            });
          });

          // Calculate cumulative totals for each month
          for (const month in monthlyNetCounts) {
            cumulativeTotal += monthlyNetCounts[month];
            totalNetList[month] = cumulativeTotal;
          }

          return totalNetList;
        }

        const totalNetList = calculateCumulativeTotalNetFromSeries(series);
        console.log('totalNetList:', totalNetList);

        if (showTooltipTotalNet) {
          const totalRow = ['Total Net', totalNetList[xValue].toString()];
          rows.push(totalRow);
        }
        console.log(rows);
        console.log(focusedRow);
        console.log(xValue);
        console.log(legendData);
        console.log(formData);
        console.log(customTooltip);
        console.log(customTooltipText);

        /*if (customTooltip) {
          const formattedRow = rows.map(item => ({
            name: item[0].replace(/<[^>]+>/g, '').trim(),  // Remove HTML tags
            value: parseInt(item[1], 10),  // Convert to integer
            percentage: item[2]  // Keep percentage as string
          }));
          console.log(formattedRow);
          let tooltipText = customTooltipText;

          // Replace <xValue> with the dynamic month value
          tooltipText = tooltipText.replace("<xValue>", xValue);

          // Replace <total.value> and <total.name> using the formattedRow's last item (Total)
          const total = formattedRow[formattedRow.length - 1];
          tooltipText = tooltipText.replace("<total.value>", total.value)
            .replace("<total.name>", total.name);

          // Replace <row1.value>, <row1.percentage>, <row1.name> dynamically with row data
          const row1 = formattedRow[0];  // Assuming you want to replace with the first row (Joined in Altimetrik & Unbilled)
          tooltipText = tooltipText.replace("<row1.value>", row1.value)
            .replace("<row1.percentage>", row1.percentage)
            .replace("<row1.name>", row1.name);

          // Final output
          console.log(tooltipText);
          // Example output: "During Jan'23, out of 8 Total members, 3 (37.50%) Joined in Altimetrik & Unbilled."
          if(defaultTooltip){
            return tooltipHtml(rows, tooltipFormatter(xValue), focusedRow, tooltipText);
          }else {
            return tooltipHtml(undefined, undefined, undefined, tooltipText);
          }
          
        }*/
        if (customTooltip) {
          // Initialize formattedRow based on legendData
          const formattedRow = legendData.map((rowName, index) => {
            const matchedRow = rows.find(item => item[0].replace(/<[^>]+>/g, '').trim() === rowName);
            const rowKey = `row${index + 1}`;

            return {
              [rowKey]: {
                name: matchedRow ? matchedRow[0].replace(/<[^>]+>/g, '').trim() : rowName,
                value: matchedRow ? parseInt(matchedRow[1], 10) : 0,
                percentage: matchedRow ? matchedRow[2] : '0%'
              }
            };
          });

          // Add "Total" row in the formattedRow
          const total = rows.find(item => item[0] === "Total");
          formattedRow.push({
            total: {
              name: total[0],
              value: parseInt(total[1], 10),
              percentage: total[2]
            }
          });

          console.log(formattedRow);

          let tooltipText = customTooltipText;

          // Replace <xValue> with the dynamic month value
          tooltipText = tooltipText.replace("<xValue>", xValue);

          // Replace <total.value> and <total.name> using the last row (Total)
          const totalRow = formattedRow.find(row => row.total);
          tooltipText = tooltipText.replace("<total.value>", totalRow.total.value)
            .replace("<total.name>", totalRow.total.name);

          // Prepare to handle dynamic parts
          const dynamicParts = [];
          const staticParts = tooltipText.split(/(\{[^}]+\})/); // Split by curly braces

          staticParts.forEach(part => {
            if (part.startsWith('{') && part.endsWith('}')) {
              // Extract the row number from the part
              const rowMatch = part.match(/<row(\d+)\.(value|name)>/);
              if (rowMatch) {
                const rowIndex = parseInt(rowMatch[1], 10) - 1; // Convert to zero-based index
                const row = formattedRow[rowIndex][`row${rowIndex + 1}`];

                // Check if the value is not zero
                if (row.value !== 0) {
                  // Replace placeholders with actual values and add to dynamic parts
                  const replacedPart = part
                    .replace(`<row${rowIndex + 1}.value>`, row.value)
                    .replace(`<row${rowIndex + 1}.name>`, row.name);
                  dynamicParts.push(replacedPart); // Keep the curly brackets
                }
              } else {
                // Static part, just add it
                dynamicParts.push(part);
              }
            });

          // Join the static parts and dynamic parts to form the final tooltip text
          const finalTooltipText = dynamicParts.join('').replace(/,\s*$/, ''); // Remove trailing comma if any

          // Remove any remaining curly brackets from the final output
          const cleanedFinalText = finalTooltipText.replace(/\{|\}/g, ''); // Remove curly brackets

          console.log(cleanedFinalText);

          // Final output
          if (defaultTooltip) {
            return tooltipHtml(rows, tooltipFormatter(xValue), focusedRow, cleanedFinalText);
          } else {
            return tooltipHtml(undefined, undefined, undefined, cleanedFinalText);
          }
        }



        if (defaultTooltip && !customTooltip) {
          return tooltipHtml(rows, tooltipFormatter(xValue), focusedRow);
        }



      },
    },
    legend: {
      ...getLegendProps(
        legendType,
        legendOrientation,
        showLegend,
        theme,
        zoomable,
        legendState,
      ),
      data: legendData as string[],
    },
    series: processSeries(series, data, xAxisTimeFormat || '', xAxisOrig),
    toolbox: {
      show: zoomable,
      top: TIMESERIES_CONSTANTS.toolboxTop,
      right: TIMESERIES_CONSTANTS.toolboxRight,
      feature: {
        dataZoom: {
          ...(stack ? { yAxisIndex: false } : {}), // disable y-axis zoom for stacked charts
          title: {
            zoom: t('zoom area'),
            back: t('restore zoom'),
          },
        },
      },
    },
    dataZoom: zoomable
      ? [
        {
          type: 'slider',
          start: TIMESERIES_CONSTANTS.dataZoomStart,
          end: TIMESERIES_CONSTANTS.dataZoomEnd,
          bottom: TIMESERIES_CONSTANTS.zoomBottom,
          yAxisIndex: isHorizontal ? 0 : undefined,
        },
        {
          type: 'inside',
          yAxisIndex: 0,
          zoomOnMouseWheel: false,
          moveOnMouseWheel: true,
        },
        {
          type: 'inside',
          xAxisIndex: 0,
          zoomOnMouseWheel: false,
          moveOnMouseWheel: true,
        },
      ]
      : [],
  };
  console.log('dedupSeries series:', dedupSeries(series));

  const onFocusedSeries = (seriesName: string | null) => {
    focusedSeries = seriesName;
  };

  return {
    echartOptions,
    emitCrossFilters,
    formData,
    groupby: groupBy,
    height,
    labelMap,
    selectedValues,
    setDataMask,
    setControlValue,
    width,
    legendData,
    onContextMenu,
    onLegendStateChanged,
    onFocusedSeries,
    xValueFormatter: tooltipFormatter,
    xAxis: {
      label: xAxisLabel,
      type: xAxisType,
    },
    refs,
    coltypeMapping: dataTypes,
  };
}

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
import {
  QueryFormData,
  supersetTheme,
  TimeseriesDataRecord,
  SetDataMaskHook,
  ContributionType,
  QueryFormMetric,
  QueryFormColumn,
} from "@superset-ui/core";
import { DEFAULT_LEGEND_FORM_DATA } from "./constants";
import { SupersetTheme } from "./styles";

export interface EngineeringMetricsInputFormStylesProps {
  height: number;
  width: number;
  headerFontSize: keyof typeof supersetTheme.typography.sizes;
  boldText: boolean;
  theme: SupersetTheme;
}

interface EngineeringMetricsInputFormCustomizeProps {
  headerText: string;
}

export type EngineeringMetricsInputFormQueryFormData = QueryFormData &
  EngineeringMetricsInputFormStylesProps &
  EngineeringMetricsInputFormCustomizeProps;

export interface BaseTransformedProps<F> {
  setDataMask?: SetDataMaskHook;
  formData: F;
}

export type LegendFormData = {
  legendMargin: number | null | string;
  legendOrientation: LegendOrientation;
  legendType: LegendType;
  showLegend: boolean;
};

export enum LegendOrientation {
  Top = "top",
  Bottom = "bottom",
  Left = "left",
  Right = "right",
}

export enum LegendType {
  Scroll = "scroll",
  Plain = "plain",
}

export type EngineeringMetricsFormData = QueryFormData & {
  colorScheme?: string;
  timeShiftColor?: boolean;
  contributionMode?: ContributionType;
  forecastEnabled: boolean;
  forecastPeriods: number;
  forecastInterval: number;
  forecastSeasonalityDaily: null;
  forecastSeasonalityWeekly: null;
  forecastSeasonalityYearly: null;
  logAxis: boolean;
  markerEnabled: boolean;
  markerSize: number;
  metrics: QueryFormMetric[];
  minorSplitLine: boolean;
  minorTicks: boolean;
  groupby: QueryFormColumn[];
  metric?: string;
  rowLimit: number;
  minVal: number | null;
  maxVal: number | null;
  fontSize: number;
  numberFormat: string;
  animation: boolean;
  showProgress: boolean;
  overlap: boolean;
  roundCap: boolean;
  showAxisTick: boolean;
  showSplitLine: boolean;
  splitNumber: number;
  startAngle: number;
  endAngle: number;
  showPointer: boolean;
  intervals: string;
  intervalColorIndices: string;
  valueFormatter: string;
};

export const DEFAULT_FORM_DATA: Partial<EngineeringMetricsFormData> = {
  groupby: [],
  rowLimit: 10,
  minVal: null,
  maxVal: null,
  fontSize: 15,
  numberFormat: "SMART_NUMBER",
  animation: true,
  showProgress: true,
  overlap: true,
  roundCap: false,
  showAxisTick: false,
  showSplitLine: false,
  splitNumber: 10,
  startAngle: 225,
  endAngle: -45,
  showPointer: true,
  intervals: "",
  intervalColorIndices: "",
  valueFormatter: "{value}",
};

export type EngineeringMetricsInputFormProps =
  BaseTransformedProps<EngineeringMetricsFormData> &
    EngineeringMetricsInputFormStylesProps &
    EngineeringMetricsInputFormCustomizeProps & {
      data: TimeseriesDataRecord[];
      datasource: string;
      // add typing here for the props you pass in from transformProps.ts!
    };

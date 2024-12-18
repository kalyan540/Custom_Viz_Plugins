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
import { t, ChartMetadata, Behavior, AnnotationType } from '@superset-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from '../images/thumbnail.png';
import example1 from '../images/Bar1.png';
import example2 from '../images/Bar2.png';
import example3 from '../images/Bar3.png';
import {
  EchartsTimeseriesChartProps,
  EchartsTimeseriesFormData,
  EchartsTimeseriesSeriesType,
} from '../Timeseries/types';
import { EchartsChartPlugin } from '../Timeseries/types';

const barTransformProps = (chartProps: EchartsTimeseriesChartProps) =>
  transformProps({
    ...chartProps,
    formData: {
      ...chartProps.formData,
      seriesType: EchartsTimeseriesSeriesType.Bar,
    },
  });

export default class PluginChartCustomBar extends EchartsChartPlugin <
EchartsTimeseriesFormData,
EchartsTimeseriesChartProps
>{
  /**
   * The constructor is used to pass relevant metadata and callbacks that get
   * registered in respective registries that are used throughout the library
   * and application. A more thorough description of each property is given in
   * the respective imported file.
   *
   * It is worth noting that `buildQuery` and is optional, and only needed for
   * advanced visualizations that require either post processing operations
   * (pivoting, rolling aggregations, sorting etc) or submitting multiple queries.
   */
  constructor() {
    const metadata = new ChartMetadata({
      description: 'This Plugin Created by Altimetrian.',
      name: t('CustomBarChart'),
      thumbnail,
      behaviors: [
        Behavior.InteractiveChart,
        Behavior.DrillToDetail,
        Behavior.DrillBy,
      ],
      category: t('Evolution'),
      exampleGallery: [
        { url: example1 },
        { url: example2 },
        { url: example3 },
      ],
      supportedAnnotationTypes: [
        AnnotationType.Event,
        AnnotationType.Formula,
        AnnotationType.Interval,
        AnnotationType.Timeseries,
      ],
      tags: [
        t('ECharts'),
        t('Predictive'),
        t('Advanced-Analytics'),
        t('Time'),
        t('Transformable'),
        t('Stacked'),
        t('Bar'),
        t('Featured'),
      ],
    });

    super({
      buildQuery,
      controlPanel,
      //loadChart: () => import('../PluginChartCustomBar'),
      loadChart: () => import('../EchartsTimeseries'),
      metadata,
      transformProps: barTransformProps,
    });
  }
}

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
import React, { useEffect, createRef } from 'react';
import { styled } from '@superset-ui/core';
import { EngineeringMetricsInputFormProps, EngineeringMetricsInputFormStylesProps } from './types';
import { Dropdown } from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.css';
import './styles.css';

// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled

// Theming variables are provided for your use via a ThemeProvider
// imported from @superset-ui/core. For variables available, please visit
// https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts

const Styles = styled.div<EngineeringMetricsInputFormStylesProps>`
  background-color: ${({ theme }) => theme.colors.secondary.light2};
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;

  /* Dropdown button styling */
  .rs-dropdown-toggle {
    background-color: ${({ theme }) => theme.colors.primary.base}; /* Button background color */
    color: white; /* Button text color */
    border: none; /* Remove border */
    border-radius: 4px; /* Rounded corners */
    padding: 8px 16px; /* Padding for the button */
    font-size: 14px; /* Font size */
    cursor: pointer; /* Pointer cursor on hover */
    transition: background-color 0.3s; /* Smooth transition for hover effect */
  }

  .rs-dropdown-toggle:hover {
    background-color: ${({ theme }) => theme.colors.primary.dark}; /* Darker shade on hover */
  }

  /* Dropdown menu styling */
  .rs-dropdown-menu {
    background-color: white; /* Set background color for dropdown menu */
    border-radius: 4px; /* Rounded corners for dropdown */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); /* Subtle shadow for depth */
    min-width: 120px; /* Minimum width for dropdown */
    width: auto; /* Allow the width to be determined by content */
    padding: 0; /* Remove padding from the menu */
  }

  .rs-dropdown-item {
    padding: 8px 12px; /* Padding for dropdown items */
    color: #333; /* Text color */
    list-style: none; /* Remove list-style markers */
  }

  .rs-dropdown-item:hover {
    background-color: #f5f5f5; /* Hover effect for dropdown items */
  }
`;

/**
 * ******************* WHAT YOU CAN BUILD HERE *******************
 *  In essence, a chart is given a few key ingredients to work with:
 *  * Data: provided via `props.data`
 *  * A DOM element
 *  * FormData (your controls!) provided as props by transformProps.ts
 */

export default function EngineeringMetricsInputForm(props: EngineeringMetricsInputFormProps) {
  // height and width are the height and width of the DOM element as it exists in the dashboard.
  // There is also a `data` prop, which is, of course, your DATA 🎉
  const { data, height, width } = props;

  const rootElem = createRef<HTMLDivElement>();

  // Often, you just want to access the DOM and do whatever you want.
  // Here, you can do that with createRef, and the useEffect hook.
  useEffect(() => {
    const root = rootElem.current as HTMLElement;
    console.log('Plugin element', root);
  });

  console.log('Plugin props', props);

  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      {/* Multilevel Dropdown Implementation */}
      <Dropdown title="Dropdown" menuStyle={{ minWidth: 120 }} placement="bottomStart">
        <Dropdown.Item>Item 1</Dropdown.Item>
        <Dropdown.Menu title="Item 2" style={{ minWidth: 120 }}>
          <Dropdown.Menu title="Item 2-1">
            <Dropdown.Item>Item 2-1-1</Dropdown.Item>
            <Dropdown.Item>Item 2-1-2</Dropdown.Item>
            <Dropdown.Item>Item 2-1-3</Dropdown.Item>
          </Dropdown.Menu>
          <Dropdown.Item>Item 2-2</Dropdown.Item>
          <Dropdown.Item>Item 2-3</Dropdown.Item>
        </Dropdown.Menu>
        <Dropdown.Menu title="Item 3">
          <Dropdown.Menu title="Item 3-1">
            <Dropdown.Item>Item 3-1-1</Dropdown.Item>
            <Dropdown.Item>Item 3-1-2</Dropdown.Item>
            <Dropdown.Item>Item 3-1-3</Dropdown.Item>
          </Dropdown.Menu>
          <Dropdown.Item>Item 3-2</Dropdown.Item>
          <Dropdown.Item>Item 3-3</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Styles>
  );
}
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
import React, { useEffect, createRef, useState } from 'react';
import { styled } from '@superset-ui/core';
import { EngineeringMetricsInputFormProps, EngineeringMetricsInputFormStylesProps } from './types';
import { Dropdown, Modal, Button, Input } from 'rsuite';
import "rsuite/dist/rsuite.css";
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

  h3 {
    /* You can use your props to control CSS! */
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.gridUnit * 3}px;
    font-size: ${({ theme, headerFontSize }) =>
    theme.typography.sizes[headerFontSize]}px;
    font-weight: ${({ theme, boldText }) =>
    theme.typography.weights[boldText ? 'bold' : 'normal']};
  }

  pre {
    height: ${({ theme, headerFontSize, height }) =>
    height - theme.gridUnit * 12 - theme.typography.sizes[headerFontSize]}px;
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
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Often, you just want to access the DOM and do whatever you want.
  // Here, you can do that with createRef, and the useEffect hook.
  useEffect(() => {
    const root = rootElem.current as HTMLElement;
    console.log('Plugin element', root);
  });

  console.log('Plugin props', props);

  const getUniqueBusinessUnits = (data: any[]) => {
    const businessUnits = data.map(item => item["Business Unit"]);

    // Use a Set to get unique business units
    const uniqueBusinessUnits = [...new Set(businessUnits)];

    console.log('Unique Business Units:', uniqueBusinessUnits);
    return uniqueBusinessUnits; // Return the unique business units if needed
  };

  const filterAccountsByBusinessUnit = (businessUnit: any) => {
    const filteredAccounts = data
      .filter(item => item["Business Unit"] === businessUnit)
      .map(item => item.Account);

    // Use a Set to get unique accounts
    return [...new Set(filteredAccounts)];
  };

  const filterProjectsByAccountAndBusinessUnit = (businessUnit, account) => {
    const filteredProjects = data
      .filter(item => item["Business Unit"] === businessUnit && item.Account === account)
      .map(item => item.Project);

    // Use a Set to get unique projects
    const uniqueProjects = [...new Set(filteredProjects)];

    console.log('Projects associated with account', account, 'in business unit', businessUnit, ':', uniqueProjects);
    return uniqueProjects; // Return the unique projects
  };

  const uniqueBusinessUnits = getUniqueBusinessUnits(data);

  const handleDropdownSelect = () => {
    console.log('Dropdown item selected');
    setModalVisible(true);
  };

  const handleSubmit = () => {
    console.log('Submitted value:', inputValue);
    setModalVisible(false);
    setInputValue('');
  };

  const handleCancel = () => {
    setModalVisible(false);
    setInputValue('');
  };

  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
        {uniqueBusinessUnits.map((unit, index) => (
          <Dropdown title={unit} menuStyle={{ minWidth: 120 }}>
            {filterAccountsByBusinessUnit(unit).map((account, idx) => (
              <Dropdown.Menu title={account} style={{ minWidth: 120 }}>
                {filterProjectsByAccountAndBusinessUnit(unit, account).map((project, idx) => (
                  <Dropdown.Item onSelect={handleDropdownSelect}>{project}</Dropdown.Item>
                ))}
              </Dropdown.Menu>
            ))}

          </Dropdown>
        ))}

        <Modal show={modalVisible} onHide={handleCancel}>
          <Modal.Header>
            <Modal.Title>Input Form</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Input
              placeholder="Enter your input"
              value={inputValue}
              onChange={value => setInputValue(value)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleSubmit} appearance="primary">Submit</Button>
            <Button onClick={handleCancel} appearance="default">Cancel</Button>
          </Modal.Footer>
        </Modal>
      </div>

    </Styles>
  );
}

/*<Dropdown title="Dropdown" menuStyle={{ minWidth: 120 }}>
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
      </Dropdown>*/

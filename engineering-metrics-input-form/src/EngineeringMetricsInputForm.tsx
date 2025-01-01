import React, { useEffect, createRef, useState } from 'react';
import { styled } from '@superset-ui/core';
import { Dropdown } from 'rsuite';
import 'rsuite/dist/rsuite.css';
import { EngineeringMetricsInputFormProps, EngineeringMetricsInputFormStylesProps } from './types';

const Styles = styled.div<EngineeringMetricsInputFormStylesProps>`
  background-color: ${({ theme }) => theme.colors.secondary.light2};
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
  display: flex; /* Use flexbox for horizontal layout */
  gap: 16px; /* Space between dropdowns */
`;

export default function EngineeringMetricsInputForm(props: EngineeringMetricsInputFormProps) {
  const { data, height, width } = props;
  const rootElem = createRef<HTMLDivElement>();

  // Transform data into a structured format
  const businessUnits = data.reduce((acc, item) => {
    const { "Business Unit": businessUnit, Account, Project } = item;

    if (!acc[businessUnit]) {
      acc[businessUnit] = { accounts: {} };
    }

    if (!acc[businessUnit].accounts[Account]) {
      acc[businessUnit].accounts[Account] = [];
    }

    acc[businessUnit].accounts[Account].push(Project);
    return acc;
  }, {});

  const [selectedAccounts, setSelectedAccounts] = useState({});

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
      {Object.keys(businessUnits).map((businessUnit) => (
        <div key={businessUnit}>
          <Dropdown title={businessUnit} placement="bottomStart">
            {Object.keys(businessUnits[businessUnit].accounts).map((account) => (
              <Dropdown.Item
                key={account}
                onClick={() => {
                  setSelectedAccounts((prev) => ({
                    ...prev,
                    [businessUnit]: account,
                  }));
                }}
              >
                {account}
              </Dropdown.Item>
            ))}
          </Dropdown>

          {/* Show projects for the selected account */}
          {selectedAccounts[businessUnit] && (
            <Dropdown title={selectedAccounts[businessUnit]} placement="bottomStart">
              {businessUnits[businessUnit].accounts[selectedAccounts[businessUnit]].map((project) => (
                <Dropdown.Item key={project}>{project}</Dropdown.Item>
              ))}
            </Dropdown>
          )}
        </div>
      ))}
    </Styles>
  );
}
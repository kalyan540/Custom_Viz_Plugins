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
  flex-direction: column; /* Stack vertically */
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

  const [selectedPath, setSelectedPath] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState(null);

  useEffect(() => {
    const root = rootElem.current as HTMLElement;
    console.log('Plugin element', root);
  });

  console.log('Plugin props', props);

  const handleBusinessUnitSelect = (businessUnit) => {
    setSelectedBusinessUnit(businessUnit);
    setSelectedAccount(null); // Reset account selection
  };

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
  };

  const handleProjectSelect = (project) => {
    setSelectedPath(`${selectedBusinessUnit} > ${selectedAccount} > ${project}`);
    setSelectedAccount(null); // Reset account selection after project selection
    setSelectedBusinessUnit(null); // Reset business unit selection after project selection
  };

  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      {/* Business Unit Dropdown */}
      <Dropdown title={selectedBusinessUnit || "Select Business Unit"} placement="bottomStart">
        {Object.keys(businessUnits).map((businessUnit) => (
          <Dropdown.Item key={businessUnit} onClick={() => handleBusinessUnitSelect(businessUnit)}>
            {businessUnit}
          </Dropdown.Item>
        ))}
      </Dropdown>

      {/* Account Dropdown */}
      {selectedBusinessUnit && (
        <Dropdown title={selectedAccount || "Select Account"} placement="bottomStart">
          {Object.keys(businessUnits[selectedBusinessUnit].accounts).map((account) => (
            <Dropdown.Item key={account} onClick={() => handleAccountSelect(account)}>
              {account}
            </Dropdown.Item>
          ))}
        </Dropdown>
      )}

      {/* Project Dropdown */}
      {selectedAccount && (
        <Dropdown title="Select Project" placement="bottomStart">
          {businessUnits[selectedBusinessUnit].accounts[selectedAccount].map((project) => (
            <Dropdown.Item key={project} onClick={() => handleProjectSelect(project)}>
              {project}
            </Dropdown.Item>
          ))}
        </Dropdown>
      )}

      {/* Display Selected Path */}
      {selectedPath && <div>Selected Path: {selectedPath}</div>}
    </Styles>
  );
}
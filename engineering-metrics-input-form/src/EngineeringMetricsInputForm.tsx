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

  const [selectedPath, setSelectedPath] = useState('');
  const [selectedAccount, setSelectedAccount] = useState({});
  const [openDropdown, setOpenDropdown] = useState({}); // Track which business unit dropdown is open

  useEffect(() => {
    const root = rootElem.current as HTMLElement;
    console.log('Plugin element', root);
  });

  console.log('Plugin props', props);

  const handleBusinessUnitSelect = (businessUnit) => {
    setOpenDropdown((prev) => ({
      ...prev,
      [businessUnit]: !prev[businessUnit], // Toggle dropdown open/close
    }));
  };

  const handleAccountSelect = (businessUnit, account) => {
    setSelectedAccount((prev) => ({
      ...prev,
      [businessUnit]: account,
    }));
  };

  const handleProjectSelect = (businessUnit, project) => {
    const account = selectedAccount[businessUnit];
    setSelectedPath(`${businessUnit} > ${account} > ${project}`);
    setSelectedAccount((prev) => ({
      ...prev,
      [businessUnit]: null, // Reset account selection after project selection
    }));
    setOpenDropdown((prev) => ({
      ...prev,
      [businessUnit]: false, // Close the dropdown after selection
    }));
  };

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
          <Dropdown title={businessUnit} placement="bottomStart" onClick={() => handleBusinessUnitSelect(businessUnit)}>
            {openDropdown[businessUnit] && (
              <>
                {Object.keys(businessUnits[businessUnit].accounts).map((account) => (
                  <Dropdown.Item key={account} onClick={() => handleAccountSelect(businessUnit, account)}>
                    {account}
                  </Dropdown.Item>
                ))}
              </>
            )}
          </Dropdown>

          {/* Nested Dropdown for Projects */}
          {selectedAccount[businessUnit] && (
            <Dropdown title={selectedAccount[businessUnit]} placement="rightStart">
              {businessUnits[businessUnit].accounts[selectedAccount[businessUnit]].map((project) => (
                <Dropdown.Item key={project} onClick={() => handleProjectSelect(businessUnit, project)}>
                  {project}
                </Dropdown.Item>
              ))}
            </Dropdown>
          )}
        </div>
      ))}

      {/* Display Selected Path */}
      {selectedPath && <div>Selected Path: {selectedPath}</div>}
    </Styles>
  );
}
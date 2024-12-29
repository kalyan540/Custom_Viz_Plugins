import React, { useEffect, createRef, useState } from 'react';
import { styled } from '@superset-ui/core';
import { EngineeringMetricsInputFormProps, EngineeringMetricsInputFormStylesProps } from './types';

const Styles = styled.div<EngineeringMetricsInputFormStylesProps>`
  background-color: #f7f7f7; /* Set background to light grey */
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* Add subtle shadow for depth */

  .dropdown-container {
    display: flex;
    gap: 15px; /* Space between dropdowns */
    margin-bottom: ${({ theme }) => theme.gridUnit * 2}px;
    position: relative; /* Position relative for nested dropdowns */
  }

  label {
    font-weight: bold; /* Make labels bold */
    margin-right: 5px; /* Space between label and dropdown */
  }

  .dropdown-menu {
    display: none; /* Hide dropdowns by default */
    position: absolute;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000; /* Ensure it appears above other elements */
  }

  .dropdown:hover .dropdown-menu {
    display: block; /* Show dropdown on hover */
  }

  .dropdown-submenu {
    position: relative;
  }

  .dropdown-submenu .dropdown-menu {
    top: 0;
    left: 100%;
    margin-top: -1px;
  }

  .project-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .project-list li {
    padding: 5px 10px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .project-list li:hover {
    background-color: #f0f0f0; /* Highlight on hover */
  }

  .selected-info {
    margin-top: 20px;
    font-weight: bold;
  }
`;

export default function EngineeringMetricsInputForm(props: EngineeringMetricsInputFormProps) {
  const { data, height, width } = props;
  const rootElem = createRef<HTMLDivElement>();

  // Extract unique business units
  const businessUnits = Array.from(new Set(data.map(item => item['Business Unit'])));

  // State to hold selected accounts for each business unit dropdown
  const [selectedAccounts, setSelectedAccounts] = useState<{ [key: string]: string | null }>({});

  // State to hold selected projects for each account
  const [selectedProjects, setSelectedProjects] = useState<{ [key: string]: string | null }>({});

  // State to hold selected business unit, account, and project for display
  const [selectedInfo, setSelectedInfo] = useState<{ businessUnit: string | null, account: string | null, project: string | null }>({
    businessUnit: null,
    account: null,
    project: null,
  });

  useEffect(() => {
    const root = rootElem.current as HTMLElement;
    console.log('Plugin element', root);
  }, [rootElem]);

  // Function to handle account selection
  const handleAccountChange = (businessUnit: string, account: string | null) => {
    setSelectedAccounts(prev => ({ ...prev, [businessUnit]: account }));
    setSelectedProjects(prev => ({ ...prev, [businessUnit]: null })); // Reset projects when account changes
  };

  // Function to handle project selection
  const handleProjectSelect = (businessUnit: string, account: string | null, project: string | null) => {
    setSelectedProjects(prev => ({ ...prev, [businessUnit]: project }));
    setSelectedInfo({ businessUnit, account, project }); // Update selected info
  };

  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      {/* Dropdowns for Business Units */}
      <div className="dropdown-container">
        {businessUnits.map(unit => (
          <div key={unit} className="dropdown" style={{ position: 'relative' }}>
            <label htmlFor={`account-${unit}`}>{unit}:</label>
            <select
              id={`account-${unit}`}
              onChange={(e) => handleAccountChange(unit, e.target.value)}
              value={selectedAccounts[unit] || ''}
            >
              <option value="">-- Select Account --</option>
              {Array.from(new Set(data.filter(item => item['Business Unit'] === unit).map(item => item['Account']))).map(account => (
                <option key={account} value={account}>{account}</option>
              ))}
            </select>

            {/* Nested Dropdown for Projects */}
            {selectedAccounts[unit] && (
              <div className="dropdown-submenu">
                <a className="test" href="#">{selectedAccounts[unit]} <span className="caret"></span></a>
                <ul className="dropdown-menu">
                  {Array.from(new Set(data.filter(item => item['Account'] === selectedAccounts[unit]).map(item => item['Project']))).map(project => (
                    <li key={project} onClick={() => handleProjectSelect(unit, selectedAccounts[unit], project)}>
                      {project}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Display Selected Information */}
      <div className="selected-info">
        {selectedInfo.businessUnit && selectedInfo.account && selectedInfo.project ? (
          <p>
            Selected: Business Unit - {selectedInfo.businessUnit}, Account - {selectedInfo.account}, Project - {selectedInfo.project}
          </p>
        ) : (
          <p>No selection made yet.</p>
        )}
      </div>
    </Styles>
  );
}
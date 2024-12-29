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
  }

  label {
    font-weight: bold; /* Make labels bold */
    margin-right: 5px; /* Space between label and dropdown */
  }

  select {
    padding: 8px 12px; /* Add padding for a modern look */
    border: 1px solid #ccc; /* Light border */
    border-radius: 4px; /* Rounded corners */
    font-size: 14px; /* Font size */
    transition: border-color 0.3s; /* Smooth transition for border color */
    
    &:focus {
      border-color: ${({ theme }) => theme.colors.primary.base}; /* Change border color on focus */
      outline: none; /* Remove default outline */
    }
  }

  .project-popover {
    position: absolute;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000; /* Ensure it appears above other elements */
    margin-top: 5px; /* Space between account dropdown and project popover */
    padding: 10px;
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
`;

export default function EngineeringMetricsInputForm(props: EngineeringMetricsInputFormProps) {
  const { data, height, width } = props;
  const rootElem = createRef<HTMLDivElement>();
  
  // Extract unique business units
  const businessUnits = Array.from(new Set(data.map(item => item['Business Unit'])));
  
  // State to hold selected accounts for each business unit dropdown
  const [selectedAccounts, setSelectedAccounts] = useState<{ [key: string]: string | null }>({});
  
  // State to hold the currently hovered account for showing projects
  const [hoveredAccount, setHoveredAccount] = useState<string | null>(null);

  useEffect(() => {
    const root = rootElem.current as HTMLElement;
    console.log('Plugin element', root);
  }, [rootElem]);

  // Function to handle account selection
  const handleAccountChange = (businessUnit: string, account: string | null) => {
    setSelectedAccounts(prev => ({ ...prev, [businessUnit]: account }));
  };

  // Function to handle project selection
  const handleProjectSelect = (project: string | null) => {
    console.log('Selected Project:', project);
    // You can add further logic here for what happens when a project is selected
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
          <div key={unit} style={{ position: 'relative' }}>
            <label htmlFor={`account-${unit }`}>{unit}:</label>
            <select
              id={`account-${unit}`}
              onChange={(e) => handleAccountChange(unit, e.target.value)}
              value={selectedAccounts[unit] || ''}
              onMouseEnter={() => setHoveredAccount(selectedAccounts[unit])}
              onMouseLeave={() => setHoveredAccount(null)}
            >
              <option value="">-- Select Account --</option>
              {Array.from(new Set(data.filter(item => item['Business Unit'] === unit).map(item => item['Account']))).map(account => (
                <option key={account} value={account}>{account}</option>
              ))}
            </select>

            {/* Popover for Projects */}
            {hoveredAccount === selectedAccounts[unit] && selectedAccounts[unit] && (
              <div className="project-popover">
                <ul className="project-list">
                  {Array.from(new Set(data.filter(item => item['Account'] === selectedAccounts[unit]).map(item => item['Project']))).map(project => (
                    <li key={project} onClick={() => handleProjectSelect(project)}>
                      {project}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </Styles>
  );
}
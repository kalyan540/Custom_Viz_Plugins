import React, { useEffect, createRef, useState } from 'react';
import { styled } from '@superset-ui/core';
import { EngineeringMetricsInputFormProps, EngineeringMetricsInputFormStylesProps } from './types';

const Styles = styled.div<EngineeringMetricsInputFormStylesProps>`
  background-color: white; /* Set background to white */
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

  .card {
    border: 1px solid ${({ theme }) => theme.colors.secondary.dark2};
    border-radius: 4px;
    padding: 10px;
    margin-top: 10px;
    background-color: ${({ theme }) => theme.colors.secondary.light1}; /* Light background for cards */
  }

  h4 {
    margin: 0; /* Remove default margin */
    font-size: 16px; /* Font size for project title */
    font-weight: bold; /* Make project title bold */
  }

  ul {
    padding-left: 20px; /* Indent list items */
  }

  li {
    margin: 5px 0; /* Space between list items */
  }
`;

export default function EngineeringMetricsInputForm(props: EngineeringMetricsInputFormProps) {
  const { data, height, width } = props;
  const rootElem = createRef<HTMLDivElement>();
  
  // Extract unique business units
  const businessUnits = Array.from(new Set(data.map(item => item['Business Unit'])));
  
  // State to hold selected accounts for each business unit dropdown
  const [selectedAccounts, setSelectedAccounts] = useState<{ [key: string]: string | null }>({});
  
  useEffect(() => {
    const root = rootElem.current as HTMLElement;
    console.log('Plugin element', root);
  }, [rootElem]);

  // Function to handle account selection
  const handleAccountChange = (businessUnit: string, account: string | null) => {
    setSelectedAccounts(prev => ({ ...prev, [businessUnit]: account }));
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
          <div key={unit}>
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

            {/* Display Projects Card */}
            {selectedAccounts[unit] && (
              <div className="card">
                <h4>Projects for {selectedAccounts[unit]}:</h4>
                <ul>
                  {data.filter(item => item['Account'] === selectedAccounts[unit]).map(project => (
                    <li key={project.Project}>{project.Project}</li>
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
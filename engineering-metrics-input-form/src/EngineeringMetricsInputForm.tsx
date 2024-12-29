import React, { useEffect, createRef, useState } from 'react';
import { styled } from '@superset-ui/core';
import { EngineeringMetricsInputFormProps, EngineeringMetricsInputFormStylesProps } from './types';

const Styles = styled.div<EngineeringMetricsInputFormStylesProps>`
  background-color: ${({ theme }) => theme.colors.secondary.light2};
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;

  h3 {
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.gridUnit * 3}px;
    font-size: ${({ theme, headerFontSize }) => theme.typography.sizes[headerFontSize]}px;
    font-weight: ${({ theme, boldText }) => theme.typography.weights[boldText ? 'bold' : 'normal']};
  }

  .dropdown-container {
    display: flex;
    gap: 10px; /* Space between dropdowns */
    margin-bottom: ${({ theme }) => theme.gridUnit * 2}px;
  }

  .card {
    border: 1px solid ${({ theme }) => theme.colors.secondary.dark2};
    border-radius: 4px;
    padding: 10px;
    margin-top: 10px;
  }
`;

export default function EngineeringMetricsInputForm(props: EngineeringMetricsInputFormProps) {
  const { data, height, width, headerText } = props;
  const rootElem = createRef<HTMLDivElement>();
  
  // Extract unique business units
  const businessUnits = Array.from(new Set(data.map(item => item['Business Unit'])));
  
  // State to hold selected accounts for each business unit dropdown
  const [selectedAccounts, setSelectedAccounts] = useState<{ [key: string]: string | null }>({});
  
  // State to hold selected projects for each account
  const [selectedProjects, setSelectedProjects] = useState<{ [key: string]: string | null }>({});

  useEffect(() => {
    const root = rootElem.current as HTMLElement;
    console.log('Plugin element', root);
  }, [rootElem]);

  // Function to handle account selection
  const handleAccountChange = (businessUnit: string, account: string | null) => {
    setSelectedAccounts(prev => ({ ...prev, [businessUnit]: account }));
    setSelectedProjects(prev => ({ ...prev, [businessUnit]: null })); // Reset projects when account changes
  };

  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      <h3>{headerText}</h3>
      
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

      {/* Display JSON Data for Debugging */}
      <pre>${JSON.stringify(data, null, 2)}</pre>
    </Styles>
  );
}
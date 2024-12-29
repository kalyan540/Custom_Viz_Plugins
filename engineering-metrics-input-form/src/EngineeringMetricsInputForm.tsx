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

  pre {
    height: ${({ theme, headerFontSize, height }) => height - theme.gridUnit * 12 - theme.typography.sizes[headerFontSize]}px;
  }

  .dropdown {
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

  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  // Extract unique business units
  const businessUnits = Array.from(new Set(data.map(item => item['Business Unit'])));

  // Filter accounts based on selected business unit
  const filteredAccounts = selectedBusinessUnit ?
    Array.from(new Set(data.filter(item => item['Business Unit'] === selectedBusinessUnit).map(item => item['Account'])))
    : [];

  // Filter projects based on selected account
  const filteredProjects = selectedAccount ?
    data.filter(item => item['Account'] === selectedAccount)
    : [];

  useEffect(() => {
    const root = rootElem.current as HTMLElement;
    console.log('Plugin element', root);
  }, [rootElem]);

  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      <h3>{headerText}</h3>

      {/* Dropdown for Business Units */}
      <div className="dropdown">
        <label htmlFor="business-unit">Select Business Unit:</label>
        <select id="business-unit" onChange={(e) => setSelectedBusinessUnit(e.target.value)} value={selectedBusinessUnit || ''}>
          <option value="">-- Select Business Unit --</option>
          {businessUnits.map(unit => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
      </div>

      {/* Dropdown for Accounts */}
      {selectedBusinessUnit && (
        <div className="dropdown">
          <label htmlFor="account">Select Account:</label>
          <select id="account" onChange={(e) => setSelectedAccount(e.target.value)} value={selectedAccount || ''}>
            <option value="">-- Select Account --</option>
            {filteredAccounts.map(account => (
              <option key={account} value={account}>{account}</option>
            ))}
          </select>
        </div>
      )}

      {/* Display Accounts Card */}
      {selectedBusinessUnit && filteredAccounts.length > 0 && (
        <div className="card">
          <h4>Accounts for {selectedBusinessUnit}:</h4>
          <ul>
            {filteredAccounts.map(account => (
              <li key={account}>{account}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Display Projects Card */}
      {selectedAccount && filteredProjects.length > 0 && (
        <div className="card">
          <h4>Projects for {selectedAccount}:</h4>
          <ul>
            {filteredProjects.map(project => (
              <li key={project.Project}>{project.Project}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Display JSON Data for Debugging */}
      <pre>${JSON.stringify(data, null, 2)}</pre>
    </Styles>
  );
}
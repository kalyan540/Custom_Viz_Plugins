import React, { useState } from 'react';
import { styled } from '@superset-ui/core';
import { EngineeringMetricsInputFormProps } from './types';

const Styles = styled.div`
  background-color: ${({ theme }) => theme.colors.secondary.light2};
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;

  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.gridUnit * 3}px;

  .dropdown-container {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.gridUnit * 2}px;
  }

  select {
    padding: ${({ theme }) => theme.gridUnit * 2}px;
    border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
    border-radius: ${({ theme }) => theme.gridUnit}px;
    font-size: ${({ theme }) => theme.typography.sizes.m}px;
  }

  .result-text {
    font-size: ${({ theme }) => theme.typography.sizes.m}px;
    padding: ${({ theme }) => theme.gridUnit * 2}px;
    background-color: ${({ theme }) => theme.colors.grayscale.light4};
    border-radius: ${({ theme }) => theme.gridUnit}px;
  }
`;

export default function EngineeringMetricsInputForm(props: EngineeringMetricsInputFormProps) {
  const { data, height, width } = props;

  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  const businessUnits = [...new Set(data.map(item => item['Business Unit']))];
  
  // Get accounts and projects for selected business unit
  const getAccountsAndProjects = (businessUnit: string) => {
    const accounts = [...new Set(data.filter(item => item['Business Unit'] === businessUnit).map(item => item.Account))];
    const projects = selectedAccount
      ? [...new Set(
          data.filter(item => item['Business Unit'] === businessUnit && item.Account === selectedAccount)
            .map(item => item.Project),
        )]
      : [];
    return { accounts, projects };
  };

  const handleBusinessUnitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBusinessUnit(event.target.value);
    setSelectedAccount('');
    setSelectedProject('');
  };

  const handleAccountChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAccount(event.target.value);
    setSelectedProject('');
  };

  const handleProjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProject(event.target.value);
  };

  return (
    <Styles height={height} width={width}>
      <div className="dropdown-container">
        {businessUnits.map((unit) => {
          const { accounts, projects } = getAccountsAndProjects(unit);

          return (
            <div key={unit}>
              <h4>{unit} Business Unit</h4>

              {/* Business Unit Dropdown */}
              <select onChange={handleBusinessUnitChange} value={selectedBusinessUnit}>
                <option value="">Select Business Unit</option>
                {businessUnits.map(unit => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>

              {/* Account Dropdown */}
              {selectedBusinessUnit && (
                <select onChange={handleAccountChange} value={selectedAccount}>
                  <option value="">Select Account</option>
                  {accounts.map(account => (
                    <option key={account} value={account}>
                      {account}
                    </option>
                  ))}
                </select>
              )}

              {/* Project Dropdown */}
              {selectedAccount && (
                <select onChange={handleProjectChange} value={selectedProject}>
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        })}
      </div>

      {selectedBusinessUnit && selectedAccount && selectedProject && (
        <div className="result-text">
          Selected: {selectedBusinessUnit}, {selectedAccount}, {selectedProject}
        </div>
      )}
    </Styles>
  );
}

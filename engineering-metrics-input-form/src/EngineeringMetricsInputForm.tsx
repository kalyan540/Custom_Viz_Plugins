import React, { useState } from 'react';
import { styled } from '@superset-ui/core';

const Styles = styled.div`
  background-color: ${({ theme }) => theme.colors.secondary.light2};
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;

  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.gridUnit * 4}px;

  .business-unit-container {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.gridUnit * 2}px;
  }

  .dropdown {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${({ theme }) => theme.gridUnit * 3}px;
  }

  select {
    padding: ${({ theme }) => theme.gridUnit * 2}px;
    border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
    border-radius: ${({ theme }) => theme.gridUnit}px;
    font-size: ${({ theme }) => theme.typography.sizes.m}px;
    min-width: 150px;
  }

  .result-text {
    font-size: ${({ theme }) => theme.typography.sizes.m}px;
    padding: ${({ theme }) => theme.gridUnit * 2}px;
    background-color: ${({ theme }) => theme.colors.grayscale.light4};
    border-radius: ${({ theme }) => theme.gridUnit}px;
  }
`;

export default function NestedDropdownComponent({ data, height, width }) {
  const [selectedValues, setSelectedValues] = useState({});

  const businessUnits = [...new Set(data.map(item => item['Business Unit']))];

  const getAccountsForBusinessUnit = businessUnit =>
    [...new Set(data.filter(item => item['Business Unit'] === businessUnit).map(item => item.Account))];

  const getProjectsForAccount = (businessUnit, account) =>
    [...new Set(data.filter(item => item['Business Unit'] === businessUnit && item.Account === account).map(item => item.Project))];

  const handleSelectionChange = (businessUnit, key, value) => {
    setSelectedValues(prevState => ({
      ...prevState,
      [businessUnit]: {
        ...prevState[businessUnit],
        [key]: value,
        ...(key === 'account' ? { project: '' } : {}),
      },
    }));
  };

  return (
    <Styles height={height} width={width}>
      {businessUnits.map(businessUnit => {
        const accounts = getAccountsForBusinessUnit(businessUnit);
        const selectedAccount = selectedValues[businessUnit]?.account;
        const projects = selectedAccount ? getProjectsForAccount(businessUnit, selectedAccount) : [];

        return (
          <div key={businessUnit} className="business-unit-container">
            <div className="dropdown">
              <label>{businessUnit}</label>
              <select
                onChange={e => handleSelectionChange(businessUnit, 'account', e.target.value)}
                value={selectedValues[businessUnit]?.account || ''}
              >
                <option value="">Select Account</option>
                {accounts.map(account => (
                  <option key={account} value={account}>
                    {account}
                  </option>
                ))}
              </select>

              {selectedAccount && (
                <select
                  onChange={e => handleSelectionChange(businessUnit, 'project', e.target.value)}
                  value={selectedValues[businessUnit]?.project || ''}
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedValues[businessUnit]?.account && selectedValues[businessUnit]?.project && (
              <div className="result-text">
                {`Selected: ${businessUnit}, ${selectedValues[businessUnit].account}, ${selectedValues[businessUnit].project}`}
              </div>
            )}
          </div>
        );
      })}
    </Styles>
  );
}

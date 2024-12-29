import React, { useEffect, useState } from 'react';
import { styled } from '@superset-ui/core';
import { EngineeringMetricsInputFormProps } from './types';

const Styles = styled.div<{ height: number; width: number }>`
  background-color: ${({ theme }) => theme.colors.secondary.light2};
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;

  h3 {
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.gridUnit * 3}px;
    font-size: ${({ theme }) => theme.typography.sizes.xl}px;
    font-weight: bold;
  }

  .dropdown-container {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 1px solid #ccc;
    padding: 20px;
    z-index: 1000;
    max-height: 80%;
    overflow-y: auto;
  }

  .card {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 10px;
    margin: 10px 0;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .card:hover {
    background-color: #f0f0f0;
  }

  select {
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-size: 16px;
    width: 100%;
  }
`;

const EngineeringMetricsInputForm: React.FC<EngineeringMetricsInputFormProps> = (props) => {
  const { data, height, width } = props;

  const [businessUnits, setBusinessUnits] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<{ [key: string]: string[] }>({});
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
  const [showProjectModal, setShowProjectModal] = useState<boolean>(false);
  const [projects, setProjects] = useState<string[]>([]);

  useEffect(() => {
    // Extract unique business units from the data
    const uniqueBusinessUnits = Array.from(new Set(data.map(item => item['Business Unit'])));
    setBusinessUnits(uniqueBusinessUnits);

    // Populate accounts based on business units
    const accountMap: { [key: string]: string[] } = {};
    data.forEach(item => {
      if (!accountMap[item['Business Unit']]) {
        accountMap[item['Business Unit']] = [];
      }
      if (!accountMap[item['Business Unit']].includes(item['Account'])) {
        accountMap[item['Business Unit']].push(item['Account']);
      }
    });
    setAccounts(accountMap);
  }, [data]);

  const handleBusinessUnitChange = (unit: string) => {
    setSelectedBusinessUnit(unit);
    setShowAccountModal(true);
    setSelectedAccount('');
  };

  const handleAccountClick = (account: string) => {
    setSelectedAccount(account);
    const projectList = data
      .filter(item => item['Account'] === account)
      .map(item => item['Project']);
    setProjects(['New Project', ...new Set(projectList)]);
    setShowProjectModal(true);
  };

  const handleModalClose = () => {
    setShowAccountModal(false);
    setShowProjectModal(false);
    setSelectedAccount('');
  };

  return (
    <Styles height={height} width={width}>
      <h3>{props.headerText}</h3>
      <div className="dropdown-container">
        <select onChange={(e) => handleBusinessUnitChange(e.target.value)} defaultValue="">
          <option value="" disabled>Select Business Unit</option>
          {businessUnits.map((unit) => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
      </div>
      {showAccountModal && (
        <div className="modal">
          <h4>Accounts for {selectedBusinessUnit}</h4>
          {accounts[selectedBusinessUnit]?.map((account) => (
            <div key={account} className="card" onClick={() => handleAccountClick(account)}>
              {account}
            </div>
          ))}
          <button onClick={handleModalClose}>Close</button>
        </div>
      )}
      {showProjectModal && (
        <div className="modal">
          <h4>Projects for {selectedAccount}</h4>
          {projects.map((project) => (
            <div key={project} className="card">
              {project}
            </div>
          ))}
          <button onClick={handleModalClose}>Close</button>
        </div>
      )}
    </Styles>
  );
};

export default EngineeringMetricsInputForm;
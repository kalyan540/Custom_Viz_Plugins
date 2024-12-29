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
  }
`;

const EngineeringMetricsInputForm: React.FC<EngineeringMetricsInputFormProps> = (props) => {
  const { data, height, width } = props;

  const [businessUnits, setBusinessUnits] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<{ [key: string]: string[] }>({});
  const [projects, setProjects] = useState<{ [key: string]: string[] }>({});
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentProject, setCurrentProject] = useState<string>('');

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
    setSelectedAccount('');
    setCurrentProject('');
  };

  const handleAccountChange = (account: string) => {
    setSelectedAccount(account);
    setCurrentProject('');
  };

  const handleProjectClick = (project: string) => {
    setCurrentProject(project);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCurrentProject('');
  };

  return (
    <Styles height={height} width={width}>
      <h3>{props.headerText}</h3>
      <div className="dropdown-container">
        {businessUnits.map((unit) => (
          <select key={unit} onChange={(e) => handleBusinessUnitChange(e.target.value)} defaultValue="">
            <option value="" disabled>Select Business Unit</option>
            <option value={unit}>{unit}</option>
          </select>
        ))}
      </div>
      {selectedBusinessUnit && (
        <div className="dropdown-container">
          <select onChange={(e) => handleAccountChange(e.target.value)} defaultValue="">
            <option value="" disabled>Select Account</option>
            <option value="New Account">New Account</option>
            {accounts[selectedBusinessUnit]?.map((account) => (
              <option key={account} value={account}>{account}</option>
            ))}
          </select>
        </div>
      )}
      {selectedAccount && (
        <div className="dropdown-container">
          {data
            .filter(item => item['Account'] === selectedAccount)
            .map(item => (
              <button key={item['Project']} onClick={() => handleProjectClick(item['Project'])}>
                {item['Project']}
              </button>
            ))}
        </div>
      )}
      {showModal && (
        <div className="modal">
          <h4>Selected Project: {currentProject}</h4>
          <button onClick={handleModalClose}>Close</button>
        </div>
      )}
    </Styles>
  );
};

export default EngineeringMetricsInputForm;
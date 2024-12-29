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
  const [selectedBusinessUnits, setSelectedBusinessUnits] = useState<string[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [projects, setProjects] = useState<string[]>([]);
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
  const [showProjectModal, setShowProjectModal] = useState<boolean>(false);
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

  const handleBusinessUnitChange = (index: number, unit: string) => {
    const newSelectedBusinessUnits = [...selectedBusinessUnits];
    newSelectedBusinessUnits[index] = unit;
    setSelectedBusinessUnits(newSelectedBusinessUnits);
  };

  const handleAccountClick = (account: string) => {
    setSelectedAccount(account);
    const projectList = data
      .filter(item => item['Account'] === account)
      .map(item => item['Project']);
    setProjects(['New Project', ...new Set(projectList)]);
    setShowProjectModal(true);
  };

  const handleProjectClick = (project: string) => {
    setCurrentProject(project);
    setShowAccountModal(true);
  };

  const handleModalClose = () => {
    setShowAccountModal(false);
    setShowProjectModal(false);
    setSelectedAccount('');
    setCurrentProject('');
  };

  return (
    <Styles height={height} width={width}>
      <h3>{props.headerText}</h3>
      <div className="dropdown-container">
        {businessUnits.map((unit, index) => (
          <select key={index} onChange={(e) => handleBusinessUnitChange(index, e.target.value)} defaultValue="">
            <option value="" disabled>Select Business Unit</option>
            {businessUnits.map((bu) => (
              <option key={bu} value={bu}>{bu}</option>
            ))}
          </select>
        ))}
      </div>
      {selectedBusinessUnits.map((unit, index) => (
        unit && (
          <div key={index}>
            <h4>Accounts for {unit}</h4>
            <div className="card-container">
              {accounts[unit]?.map((account) => (
                <div key={account} className="card" onClick={() => handleAccountClick(account)}>
                  {account}
                </div>
              ))}
            </div>
          </div>
        )
      ))}
      {showProjectModal && (
        <div className="modal">
          <h4>Projects for {selectedAccount}</h4>
          {projects.map((project) => (
            <div key={project} className="card" onClick={() => handleProjectClick(project)}>
              {project}
            </div>
          ))}
          <button onClick={handleModalClose}>Close</button>
        </div>
      )}
      {showAccountModal && (
        <div className="modal">
          <h4>Input for {currentProject}</h4>
          <input type="text" placeholder="Enter details..." />
          <button onClick={handleModalClose}>Close</button>
        </div>
      )}
    </Styles>
  );
};

export default EngineeringMetricsInputForm;
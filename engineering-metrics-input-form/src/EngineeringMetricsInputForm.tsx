import React, { useEffect, createRef, useState } from 'react';
import { styled } from '@superset-ui/core';
import Dropdown, {
  DropdownToggle,
  DropdownMenu,
  MenuItem,
  CustomDropdownToggleStyle,
  CustomDropdownMenuStyle
} from './Components/Dropdown'; // Adjust the import path as necessary

const Styles = styled.div`
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
    justify-content: space-between;
    margin-bottom: ${({ theme }) => theme.gridUnit * 3}px;
  }

  .dropdown {
    margin-right: ${({ theme }) => theme.gridUnit * 2}px;
  }

  .selection-display {
    margin-top: ${({ theme }) => theme.gridUnit * 3}px;
    font-weight: bold;
  }
`;

export default function EngineeringMetricsInputForm(props) {
  const { data, height, width } = props;
  const rootElem = createRef<HTMLDivElement>();
  const [selectedAccounts, setSelectedAccounts] = useState({});
  const [selectedProjects, setSelectedProjects] = useState({});
  const [businessUnitSelections, setBusinessUnitSelections] = useState({});

  useEffect(() => {
    const root = rootElem.current as HTMLElement;
    console.log('Plugin element', root);
  });

  // Transform data into a nested structure
  const nestedData = data.data.reduce((acc, item) => {
    const { "Business Unit": businessUnit, Account, Project } = item;
    if (!acc[businessUnit]) {
      acc[businessUnit] = { accounts: {} };
    }
    if (!acc[businessUnit].accounts[Account]) {
      acc[businessUnit].accounts[Account] = [];
    }
    acc[businessUnit].accounts[Account].push(Project);
    return acc;
  }, {});

  // Handle selection changes
  const handleAccountSelect = (businessUnit, account) => {
    setSelectedAccounts((prev) => ({ ...prev, [businessUnit]: account }));
    setSelectedProjects((prev) => ({ ...prev, [businessUnit]: '' })); // Reset project selection
  };

  const handleProjectSelect = (businessUnit, project) => {
    setSelectedProjects((prev) => ({ ...prev, [businessUnit]: project }));
  };

  // Render the dropdowns for each business unit
  const renderDropdowns = () => {
    return Object.entries(nestedData).map(([businessUnit]) => (
      <div className="dropdown-container" key={businessUnit}>
        <Dropdown className="dropdown">
          <DropdownToggle
            btnStyle={"flat"}
            btnSize={"lg"}
            noCaret={false}
            title={selectedAccounts[businessUnit] || "Select Account"}
            style={CustomDropdownToggleStyle}
          />
          <DropdownMenu style={CustomDropdownMenuStyle}>
            {Object.entries(nestedData[businessUnit].accounts).map(([account]) => (
              <MenuItem
                key={account}
                onSelect={() => handleAccountSelect(businessUnit, account)}
              >
                {account}
              </MenuItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        <Dropdown className="dropdown">
          <DropdownToggle
            btnStyle={"flat"}
            btnSize={"lg"}
            noCaret={false}
            title={selectedProjects[businessUnit] || "Select Project"}
            style={CustomDropdownToggleStyle}
            disabled={!selectedAccounts[businessUnit]} // Disable if no account is selected
          />
          <DropdownMenu style={CustomDropdownMenuStyle}>
            {selectedAccounts[businessUnit] &&
              nestedData[businessUnit].accounts[selectedAccounts[businessUnit]].map((project) => (
                <MenuItem
                  key={project}
                  onSelect={() => handleProjectSelect(businessUnit, project)}
                >
                  {project}
                </MenuItem>
              ))}
          </DropdownMenu>
        </Dropdown>
      </div>
    ));
  };

  return (
    <Styles ref={rootElem} height={height} width={width}>
      <h3>Select Business Units, Accounts, and Projects</h3>
      {renderDropdowns()}
      <div className="selection-display">
        {Object.entries(businessUnitSelections).map(([businessUnit]) => (
          <div key={businessUnit}>
            <strong>{businessUnit}:</strong> {selectedAccounts[businessUnit]} - {selectedProjects[businessUnit]}
          </div>
        ))}
      </div>
    </Styles>
  );
}
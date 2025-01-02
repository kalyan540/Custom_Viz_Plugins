import React, { useEffect, createRef, useState } from 'react';
import { styled, SupersetClient } from '@superset-ui/core';
import { EngineeringMetricsInputFormProps, EngineeringMetricsInputFormStylesProps } from './types';
import { Dropdown } from 'rsuite';
import "rsuite/dist/rsuite.css";

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

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .modal-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    width: 500px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .modal-header {
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px;
  }

  .modal-close {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 18px;
    cursor: pointer;
    color: #999;
  }

  .modal-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    width: 100%;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-group label {
    font-size: 14px;
    font-weight: 600;
  }

  .form-group input,
  .form-group select {
    padding: 8px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
    transition: border-color 0.2s ease;
  }

  .form-group input:focus,
  .form-group select:focus {
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
  
  .highlight-text {
    background-color: #f0f0f0;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: bold;
  }

  .submit-button {
    padding: 10px;
    background-color: ${({ theme }) => theme.colors.primary.dark1};
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .submit-button:hover {
    background-color: ${({ theme }) => theme.colors.primary.dark1};
  }

  .submit-button[type="button"] {
    background-color: ${({ theme }) => theme.colors.grayscale.light3};
  }

  .submit-button[type="button"]:hover {
    background-color: ${({ theme }) => theme.colors.grayscale.light2};
  }
`;

export default function EngineeringMetricsInputForm(props: EngineeringMetricsInputFormProps) {
  const { data, height, width } = props;
  const rootElem = createRef<HTMLDivElement>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
  codeCoverage: { scope: '', target: '', condition: '' },
  predictability: { scope: '', target: '', condition: '' },
  sprintVelocity: { scope: '', target: '', condition: '' },
  cycleTime: { scope: '', target: '', condition: '' },
  defectDistribution: { scope: '', target: '', condition: '' },
  scopeChange: { scope: '', target: '', condition: '' },
});

const [selectedInfo, setSelectedInfo] = useState({
  businessUnit: '',
  account: '',
  project: '',
});

  useEffect(() => {
    const root = rootElem.current as HTMLElement;
    console.log('Plugin element', root);
  }, [rootElem]);

  const getUniqueBusinessUnits = (data: any[]) => {
    const businessUnits = data.map(item => item["Business Unit"]);

    // Use a Set to get unique business units
    const uniqueBusinessUnits = [...new Set(businessUnits)];

    console.log('Unique Business Units:', uniqueBusinessUnits);
    return uniqueBusinessUnits; // Return the unique business units if needed
  };

  const filterAccountsByBusinessUnit = (businessUnit: any) => {
    const filteredAccounts = data
      .filter(item => item["Business Unit"] === businessUnit)
      .map(item => item.Account);

    // Use a Set to get unique accounts
    return [...new Set(filteredAccounts)];
  };

  const filterProjectsByAccountAndBusinessUnit = (businessUnit, account) => {
    const filteredProjects = data
      .filter(item => item["Business Unit"] === businessUnit && item.Account === account)
      .map(item => item.Project);

    // Use a Set to get unique projects
    const uniqueProjects = [...new Set(filteredProjects)];

    console.log('Projects associated with account', account, 'in business unit', businessUnit, ':', uniqueProjects);
    return uniqueProjects; // Return the unique projects
  };

  const uniqueBusinessUnits = getUniqueBusinessUnits(data);

  const handleDropdownSelect = () => {
    setIsModalOpen(true);
  };

  const handleProjectSelect = (businessUnit, account, project) => {
    setSelectedInfo({
      businessUnit,
      account,
      project,
    });
    setIsModalOpen(true);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const isAllFilled = Object.values(formData).every((value) => value !== '');
    if (!isAllFilled) {
      alert("Please fill out all fields!");
      return;
    }
    console.log("Form Data Submitted:", formData);
    try {
      const response = await SupersetClient.post({
        endpoint: '/api/dataset/update',
        jsonPayload: { formData: [formData] },
      });
      console.log(response.json.message);
    } catch (error) {
      console.error('Error Submitting form data: ', error);
    }

    setFormData({
      functionName: '',
      group: '',
      business: '',
      assessmentLead: '',
      assessmentID: '',
      maturity: '',
      assessmentDate: '',
      status: '',
      actions: '',
      assessmentType: '',
    });

    setIsModalOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
        {uniqueBusinessUnits.map((unit, index) => (
          <Dropdown title={unit} menuStyle={{ minWidth: 120 }}>
            <Dropdown.Item onSelect={handleDropdownSelect}>Add New Account</Dropdown.Item>
            {filterAccountsByBusinessUnit(unit).map((account, idx) => (
              <Dropdown.Menu title={account} style={{ minWidth: 120 }}>
                <Dropdown.Item onSelect={handleDropdownSelect}>Add New Project</Dropdown.Item>
                {filterProjectsByAccountAndBusinessUnit(unit, account).map((project, idx) => (
                  <Dropdown.Item onSelect={handleProjectSelect(unit, account, project)}>{project}</Dropdown.Item>
                ))}
              </Dropdown.Menu>
            ))}

          </Dropdown>
        ))}

      </div>
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">Metrics Input Form</div>
            <div>
                <span className="highlight-text">{selectedInfo.businessUnit}</span> -
                <span className="highlight-text">{selectedInfo.account}</span> -
                <span className="highlight-text">{selectedInfo.project}</span>
              </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                {[
                  "Code Coverage",
                  "Predictability",
                  "Sprint Velocity",
                  "Cycle Time",
                  "Defect Distribution",
                  "Scope Change",
                ].map((category, index) => (
                  <div key={index} className="form-group">
                    <label>{category}</label>
                    <input
                      type="number"
                      placeholder="Scope"
                      onChange={(e) => handleInputChange(`${category}_scope`, e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Target"
                      onChange={(e) => handleInputChange(`${category}_target`, e.target.value)}
                      required
                    />
                    <select
                      onChange={(e) => handleInputChange(`${category}_condition`, e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Condition
                      </option>
                      <option value="greater_than">Greater Than</option>
                      <option value="less_than">Less Than</option>
                      <option value="greater_than_equal">Greater Than or Equal</option>
                      <option value="less_than_equal">Less Than or Equal</option>
                    </select>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button className="submit-button" type="submit">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Styles>
  );
}
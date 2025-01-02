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

  input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
  }

  button {
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
`;

export default function EngineeringMetricsInputForm(props: EngineeringMetricsInputFormProps) {
  const { data, height, width } = props;
  const rootElem = createRef<HTMLDivElement>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
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
            {filterAccountsByBusinessUnit(unit).map((account, idx) => (
              <Dropdown.Menu title={account} style={{ minWidth: 120 }}>
                {filterProjectsByAccountAndBusinessUnit(unit, account).map((project, idx) => (
                  <Dropdown.Item onSelect={handleDropdownSelect}>{project}</Dropdown.Item>
                ))}
              </Dropdown.Menu>
            ))}

          </Dropdown>
        ))}

      </div>
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <span className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</span>
            <div className="modal-header">Create NPD Assessment</div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Function Name"
                value={formData.functionName}
                onChange={(e) => handleInputChange('functionName', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Group"
                value={formData.group}
                onChange={(e) => handleInputChange('group', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Business"
                value={formData.business}
                onChange={(e) => handleInputChange('business', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Assessment Lead"
                value={formData.assessmentLead}
                onChange={(e) => handleInputChange('assessmentLead', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Assessment ID"
                value={formData.assessmentID}
                onChange={(e) => handleInputChange('assessmentID', e.target.value)}
                required
              />
              <select
                style={{
                  height: '40px',
                  padding: '8px',
                  width: '100%',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  marginBottom: '10px',
                  fontSize: '14px',
                }}
                value={formData.maturity}
                onChange={(e) => handleInputChange('maturity', e.target.value)}
                required
              >
                <option value="" disabled>Maturity</option>
                <option value="Test">Test</option>
                <option value="Launch">Launch</option>
                <option value="Idea Screening">Idea Screening</option>
                <option value="Prototype Development">Prototype Development</option>
              </select>
              <input
                type="date placeholder="Assessment Date"
                value={formData.assessmentDate}
                onChange={(e) => handleInputChange('assessmentDate', e.target.value)}
                required
              />
              <div>
                <label>Status:</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="status"
                      value="Published"
                      checked={formData.status === 'Published'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      required
                    />
                    Published
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="status"
                      value="In Progress"
                      checked={formData.status === 'In Progress'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      required
                    />
                    In Progress
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="status"
                      value="Pending"
                      checked={formData.status === 'Pending'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      required
                    />
                    Pending
                  </label>
                </div>
              </div>
              <input
                type="text"
                placeholder="Actions"
                value={formData.actions}
                onChange={(e) => handleInputChange('actions', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Assessment Type"
                value={formData.assessmentType}
                onChange={(e) => handleInputChange('assessmentType', e.target.value)}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Styles>
  );
}
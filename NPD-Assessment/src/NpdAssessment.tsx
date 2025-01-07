/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { useEffect, useState, createRef } from 'react';
import { styled, SupersetClient } from '@superset-ui/core';
import { NpdAssessmentProps, NpdAssessmentStylesProps } from './types';

// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled

// Theming variables are provided for your use via a ThemeProvider
// imported from @superset-ui/core. For variables available, please visit
// https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts

const Styles = styled.div<NpdAssessmentStylesProps>`
  background-color: ${({ theme }) => theme.colors.secondary.light2};
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;

  h3 {
    /* You can use your props to control CSS! */
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.gridUnit * 3}px;
    font-size: ${({ theme, headerFontSize }) =>
    theme.typography.sizes[headerFontSize]}px;
    font-weight: ${({ theme, boldText }) =>
    theme.typography.weights[boldText ? 'bold' : 'normal']};
  }

  pre {
    height: ${({ theme, headerFontSize, height }) =>
    height - theme.gridUnit * 12 - theme.typography.sizes[headerFontSize]}px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.gridUnit * 3}px;
  }

  .filters {
    display: flex;
    gap: ${({ theme }) => theme.gridUnit * 2}px;
    margin-bottom: ${({ theme }) => theme.gridUnit * 2}px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;

    th,
    td {
        padding: 8px;
        border: 1px solid #ccc;
        text-align: left;
      }

      th {
        position: sticky;
        top: 0;
        background-color: white;
        z-index: 1;
      }

      tbody tr {
        background-color: white;
      }
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
    width: 500px; /* Updated modal width */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center; /* Center content */
  }

  .modal-header {
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px; /* Space below the header */
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
    width: 100%; /* Full width for input alignment */
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
  }

`;

/**
 * ******************* WHAT YOU CAN BUILD HERE *******************
 *  In essence, a chart is given a few key ingredients to work with:
 *  * Data: provided via `props.data`
 *  * A DOM element
 *  * FormData (your controls!) provided as props by transformProps.ts
 */

export default function NpdAssessment(props: NpdAssessmentProps) {
  // height and width are the height and width of the DOM element as it exists in the dashboard.
  // There is also a `data` prop, which is, of course, your DATA 🎉
  const { data, height, width, datasource} = props;
  const rootElem = createRef<HTMLDivElement>();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filteredData, setFilteredData] = useState(data);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [DBName, setDBName] = useState<string | null>(null);
  const [tableName, settableName] = useState<string | null>(null);
  console.log(datasource);

  useEffect(() => {
    async function fetchExploreData() {
      try {
        const [datasource_id, datasource_type]=datasource.split('__');
        const response = await SupersetClient.get({
          endpoint: `/api/v1/explore/?datasource_type=${datasource_type}&datasource_id=${datasource_id}`,

        });

        const dbName = response.json?.result?.dataset?.database?.name;
        const TableName = response.json?.result?.dataset?.datasource_name;
        if (dbName) {
          setDBName(dbName);
          settableName(TableName);
          console.log('Database Name:', dbName);
          console.log('Table Name:', TableName);
        } else {
          console.warn('Database name not found in response');
        }
      } catch (error) {
        console.error('Error fetching explore API:', error);
      }
    }
    fetchExploreData();
  }, [datasource]);

  const columns = Object.keys(data[0] || {});
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  // Update the filtered data based on selected filters
  useEffect(() => {
    let updatedData = data;

    Object.entries(filters).forEach(([column, value]) => {
      if (value) {
        updatedData = updatedData.filter((row) => row[column] === value);
      }
    });

    setFilteredData(updatedData);
  }, [filters, data]);

  // Handle filter changes
  const handleFilterChange = (column: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  // Often, you just want to access the DOM and do whatever you want.
  // Here, you can do that with createRef, and the useEffect hook.
  useEffect(() => {
    const root = rootElem.current as HTMLElement;
    console.log('Plugin element', root);
  });

  console.log('Plugin props', props);

  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      <div className="header">
        <button
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          onClick={() => setIsModalOpen(true)}
        >
          Create Assessment
        </button>
      </div>

       {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card">
              <span
                className="modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </span>
              <div className="modal-header">Create NPD Assessment</div>
              <form
                className="modal-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const isAllFilled = Object.values(formData).every((value) => value !== '');
                  if (!isAllFilled) {
                    alert("Please fill out all fields!");
                    return;
                  }
                  console.log("Form Data Submitted:", formData);
                  try {
                    const responser = await SupersetClient.post({
                      endpoint: '/api/dataset/update',
                      jsonPayload: { formData: [formData], database: DBName, table_name: tableName },
                    });
                    console.log(responser.json.message);
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
                }}
              >
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
                  <option value="" disabled>
                    Maturity
                  </option>
                  <option value="Test">Test</option>
                  <option value="Launch">Launch</option>
                  <option value="Idea Screening">Idea Screening</option>
                  <option value="Prototype Development">Prototype Development</option>
                </select>

                <input
                  type="date"
                  placeholder="Assessment Date"
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
      <div className="filters">
        {columns.map((col) => (
          <div key={col} style={{ flex: 1 }}>
            <select
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                backgroundColor: '#f9f9f9',
              }}
              value={filters[col] || ''}
              onChange={(e) => handleFilterChange(col, e.target.value)}
            >
              <option value="" disabled>
                {col}
              </option>
              {[...new Set(data.map((row) => row[col]))]
                .filter((val): val is string | number => typeof val === 'string' || typeof val === 'nmber')

                .map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
            </select>
          </div>
        ))}
      </div>
      <div style={{ overflowX: 'auto', maxHeight: '100%', width: '100%' }}>
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col) => (
                  <td key={col}>{row[col]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </Styles>
  );
}

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
import { styled } from '@superset-ui/core';
import { UserAction2Props, UserAction2StylesProps } from './types';

const Styles = styled.div<UserAction2StylesProps>`
  background-color: ${({ theme }) => theme.colors.secondary.light2};
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;

  h3 {
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.gridUnit * 3}px;
    font-size: ${({ theme, headerFontSize }) =>
      theme.typography.sizes[headerFontSize]}px;
    font-weight: ${({ theme, boldText }) =>
      theme.typography.weights[boldText ? 'bold' : 'normal']};
  }

  label {
    font-weight: bold;
    display: block;
    margin-top: 10px;
  }

  input {
    width: 100%;
    padding: 8px;
    margin-top: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  input.error {
    border: 2px solid red;
  }

  .error-message {
    color: red;
    font-size: 14px;
    margin-top: 5px;
  }

  button {
    width: 100%;
    padding: 10px;
    margin-top: 15px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }

  button:hover {
    background-color: #218838;
  }
`;

export default function UserAction2(props: UserAction2Props) {
  const { data, height, width } = props;
  const rootElem = createRef<HTMLDivElement>();
  const [formData, setFormData] = useState({
    requestId: '',
    workflowName: '',
    approverEmail: '',
    managerEmails: '',
    status: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const root = rootElem.current as HTMLElement;
    console.log('Plugin element', root);
  });

  console.log('Plugin props', props);

  const validateEmails = (emailString: string) => {
    const emails = emailString.split(',').map(email => email.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emails.every(email => emailRegex.test(email));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    let newErrors: any = {};
    if (!formData.requestId) newErrors.requestId = 'Request ID is required.';
    if (!formData.workflowName) newErrors.workflowName = 'Workflow Name is required.';
    if (!validateEmails(formData.approverEmail)) newErrors.approverEmail = 'Invalid email format.';
    if (!validateEmails(formData.managerEmails)) newErrors.managerEmails = 'Invalid email format.';
    if (!formData.status) newErrors.status = 'Status is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    fetch(props.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: parseInt(formData.requestId),
        workflowName: formData.workflowName,
        approverEmail: formData.approverEmail,
        status: formData.status,
        managerEmails: formData.managerEmails.split(',').map(email => email.trim()),
      }),
    })
      .then(response => response.json())
      .then(result => {
        alert('Workflow initiated successfully!');
        console.log(result);
      })
      .catch(error => {
        alert('Error: ' + error.message);
        console.error(error);
      });
  };

  return (
    <Styles ref={rootElem} boldText={props.boldText} headerFontSize={props.headerFontSize} height={height} width={width}>
      <h3>{props.headerText}</h3>
      <label>Request ID:</label>
      <input type="number" name="requestId" value={formData.requestId} onChange={handleChange} className={errors.requestId ? 'error' : ''} />
      <div className="error-message">{errors.requestId}</div>

      <label>Workflow Name:</label>
      <input type="text" name="workflowName" value={formData.workflowName} onChange={handleChange} className={errors.workflowName ? 'error' : ''} />
      <div className="error-message">{errors.workflowName}</div>

      <label>Approver Email:</label>
      <input type="email" name="approverEmail" value={formData.approverEmail} onChange={handleChange} className={errors.approverEmail ? 'error' : ''} />
      <div className="error-message">{errors.approverEmail}</div>

      <label>Manager Emails (comma separated):</label>
      <input type="text" name="managerEmails" value={formData.managerEmails} onChange={handleChange} className={errors.managerEmails ? 'error' : ''} />
      <div className="error-message">{errors.managerEmails}</div>

      <label>Status:</label>
      <input type="text" name="status" value={formData.status} onChange={handleChange} className={errors.status ? 'error' : ''} />
      <div className="error-message">{errors.status}</div>

      <button onClick={handleSubmit}>Initiate Workflow</button>
    </Styles>
  );
}

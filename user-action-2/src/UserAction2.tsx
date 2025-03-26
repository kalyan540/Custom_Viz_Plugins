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
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: Arial, sans-serif;
  margin: auto;
  overflow: auto;

  h3 {
    text-align: center;
    color: #333;
    width: 100%;
  }

  label {
    font-weight: bold;
    display: block;
    margin-top: 10px;
    width: 100%;
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
    width: 100%;
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
  const { apiEndpoint, height, width } = props;
  const rootElem = createRef<HTMLDivElement>();
  const [formData, setFormData] = useState({
    requestid: '',
    workflowName: '',
    candidate_Email: '',
    manager_email: '',
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

  const validateManagerEmails = (emailArrayString: string) => {
    try {
      const emails = JSON.parse(emailArrayString);
      if (!Array.isArray(emails)) return false;
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emails.every(email => emailRegex.test(email));
    } catch (e) {
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    let newErrors: any = {};
    if (!formData.requestid) newErrors.requestid = 'Request ID is required.';
    if (!formData.workflowName) newErrors.workflowName = 'Workflow Name is required.';
    if (!validateEmails(formData.candidate_Email)) newErrors.candidate_Email = 'Invalid email format.';
    if (!validateManagerEmails(formData.manager_email)) newErrors.manager_email = 'Invalid email format.';
    if (!formData.status) newErrors.status = 'Status is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestid: parseInt(formData.requestid),
        workflowName: formData.workflowName,
        candidate_Email: formData.candidate_Email,
        status: formData.status,
        manager_email: JSON.parse(formData.manager_email),
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
      <h3>Initiate Workflow</h3>
      <label>Request ID:</label>
      <input type="number" name="requestid" value={formData.requestid} onChange={handleChange} className={errors.requestid ? 'error' : ''} />
      <div className="error-message">{errors.requestid}</div>

      <label>Workflow Name:</label>
      <input type="text" name="workflowName" value={formData.workflowName} onChange={handleChange} className={errors.workflowName ? 'error' : ''} />
      <div className="error-message">{errors.workflowName}</div>

      <label>Candidate Email:</label>
      <input type="email" name="candidate_Email" value={formData.candidate_Email} onChange={handleChange} className={errors.candidate_Email ? 'error' : ''} />
      <div className="error-message">{errors.candidate_Email}</div>

      <label>Manager Emails (comma separated):</label>
      <input type="text" name="manager_email" value={formData.manager_email} onChange={handleChange} className={errors.manager_email ? 'error' : ''} placeholder='["email1@example.com","email2@example.com"]'/>
      <div className="error-message">{errors.manager_email}</div>

      <label>Status:</label>
      <input type="text" name="status" value={formData.status} onChange={handleChange} className={errors.status ? 'error' : ''} />
      <div className="error-message">{errors.status}</div>

      <button onClick={handleSubmit}>Initiate Workflow</button>
    </Styles>
  );
}

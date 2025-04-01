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

  .email-input-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    border: 1px solid #ccc;
    padding: 5px;
    border-radius: 4px;
    min-height: 40px;
    cursor: text;
    width: 100%;
    margin-top: 5px;
  }

  .email-box {
    display: flex;
    align-items: center;
    background: #e9ecef;
    padding: 5px;
    border-radius: 4px;
    margin: 2px;
    font-size: 14px;
  }

  .email-box span {
    margin-right: 5px;
    font-weight: bold;
  }

  .email-box button {
    background: none;
    border: none;
    cursor: pointer;
    color: red;
    font-weight: bold;
    margin-left: 5px;
  }

  .email-input {
    border: none;
    outline: none;
    flex: 1;
    padding: 5px;
    min-width: 150px;
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

interface FormErrors {
  requestid?: string;
  workflowName?: string;
  candidate_Email?: string;
  approver_email?: string;
  status?: string;
}

export default function UserAction2(props: UserAction2Props) {
  const { apiEndpoint, height, width } = props;
  const rootElem = createRef<HTMLDivElement>();
  const [formData, setFormData] = useState({
    requestid: '',
    workflowName: '',
    candidate_Email: '',
    status: 'Created',
  });
  const [approverEmails, setApproverEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  useEffect(() => {
    const root = rootElem.current as HTMLElement;
    console.log('Plugin element', root);
  });

  const validateEmails = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addApproverEmail();
    }
  };

  const addApproverEmail = () => {
    const email = currentEmail.trim();
    if (!email) return;

    if (!validateEmails(email)) {
      setErrors({ ...errors, approver_email: 'Invalid email format' });
      return;
    }

    setApproverEmails([...approverEmails, email]);
    setCurrentEmail('');
    setErrors({ ...errors, approver_email: '' });
  };

  const removeApproverEmail = (index: number) => {
    const newEmails = [...approverEmails];
    newEmails.splice(index, 1);
    setApproverEmails(newEmails);
  };

  const handleSubmit = () => {
    let newErrors: any = {};
    if (!formData.requestid) newErrors.requestid = 'Request ID is required.';
    if (!formData.workflowName) newErrors.workflowName = 'Workflow Name is required.';
    if (!validateEmails(formData.candidate_Email)) newErrors.candidate_Email = 'Invalid email format.';
    if (approverEmails.length === 0) newErrors.approver_email = 'At least one approver email is required.';
    if (!formData.status) newErrors.status = 'Status is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('Submitting with approver emails:', approverEmails);

    fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestid: parseInt(formData.requestid),
        workflowName: formData.workflowName,
        candidate_Email: formData.candidate_Email,
        status: formData.status,
        approver_email: approverEmails,
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

      <label>Approver Emails:</label>
      <div className="email-input-container" onClick={() => document.getElementById('approverEmailInput')?.focus()}>
        {approverEmails.map((email, index) => (
          <div key={index} className="email-box">
            <span>{index + 1}.</span>
            <span>{email}</span>
            <button onClick={() => removeApproverEmail(index)}>x</button>
          </div>
        ))}
        <input
          id="approverEmailInput"
          type="email"
          className="email-input"
          placeholder="Enter email and press Enter"
          value={currentEmail}
          onChange={(e) => setCurrentEmail(e.target.value)}
          onKeyDown={handleEmailKeyDown}
        />
      </div>
      <div className="error-message">{errors.approver_email}</div>

      <button onClick={handleSubmit}>Initiate Workflow</button>
    </Styles>
  );
}
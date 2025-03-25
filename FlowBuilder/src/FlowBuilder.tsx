import React, { useEffect, createRef, useState } from 'react';
import { styled } from '@superset-ui/core';
import { FlowBuilderProps, FlowBuilderStylesProps } from './types';
import { Popover } from 'antd';

const Styles = styled.div<FlowBuilderStylesProps>`
  background-color: ${({ theme }) => theme.colors.secondary.light2};
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;

  .form-group {
    margin-bottom: ${({ theme }) => theme.gridUnit * 3}px;
  }
  
  .form-group input {
    width: 100%;
    padding: ${({ theme }) => theme.gridUnit * 3}px;
    font-size: 16px;
    border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
    border-radius: ${({ theme }) => theme.gridUnit}px;
  }

  .form-group label {
    display: block;
    margin-bottom: ${({ theme }) => theme.gridUnit}px;
    font-weight: bold;
    font-size: 18px;
  }

  button {
    padding: ${({ theme }) => theme.gridUnit * 2}px ${({ theme }) =>
  theme.gridUnit * 4}px;
    color: white;
    border: none;
    border-radius: ${({ theme }) => theme.gridUnit}px;
    cursor: pointer;
    margin-right: ${({ theme }) => theme.gridUnit * 2}px;
  }

  button.add-level {
    background-color: #3498db;
  }

  button.remove-level {
    background-color: #e74c3c;
  }

  button.submit {
    background-color: #2ecc71;
    padding: ${({ theme }) => theme.gridUnit * 3}px ${({ theme }) => theme.gridUnit * 6}px;
    font-size: 16px;
  }

  .manager-list {
    margin-top: ${({ theme }) => theme.gridUnit * 3}px;
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
    border-radius: ${({ theme }) => theme.gridUnit}px;
    padding: ${({ theme }) => theme.gridUnit * 2}px;
  }

  .manager-item {
    padding: ${({ theme }) => theme.gridUnit * 2}px;
    border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
    border-radius: ${({ theme }) => theme.gridUnit}px;
    margin-bottom: ${({ theme }) => theme.gridUnit}px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .level-label {
    font-weight: bold;
    margin-right: 8px;
  }
`;

export default function FlowBuilder(props: FlowBuilderProps) {
  const { height, width, apiEndpoint } = props;
  const rootElem = createRef<HTMLDivElement>();

  const [workflowName, setWorkflowName] = useState(
    `Workflow-${Math.floor(Math.random() * 1000)}`,
  );
  const [workflow_id, setworkflow_id] = useState(Math.floor(Math.random() * 1000));
  const [managers, setManagers] = useState<{ name: string; email: string; field1: string; field2: string }[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState('user@example.com');

  const generateRequestId = () => {
    return Math.floor(Math.random() * 10000);
  };

  const [levelCount, setLevelCount] = useState(1);

  const handleSubmit = async () => {
    const requestId = generateRequestId();
    const workflowJson = generateWorkflowJson(workflowName, managers, currentUserEmail, workflow_id, requestId);
    
    console.log('Submitting workflow:', JSON.stringify(workflowJson, null, 2));

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowJson),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result);
        alert('Workflow created successfully!');
      } else {
        const error = await response.json();
        console.error('API Error:', error);
        alert(`Failed to create workflow: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting workflow:', error);
      alert('Failed to create workflow. Please try again.');
    }
  };

  const addManager = () => {
    const maxLevel = managers.reduce((max, manager) => {
      const levelNumber = parseInt(manager.name.replace("Level", ""), 10);
      return levelNumber > max ? levelNumber : max;
    }, 0);

    const nextLevel = maxLevel + 1;
    const newManager = { 
      name: `Level${nextLevel}`, 
      email: `manager${nextLevel}@example.com`,
      field1: '',
      field2: '' 
    };
    setManagers([...managers, newManager]);
  };

  const removeLevel = (indexToRemove: number) => {
    const updatedManagers = managers.filter((_, index) => index !== indexToRemove);
    const renumberedManagers = updatedManagers.map((manager, index) => ({
      ...manager,
      name: `Level${index + 1}`,
    }));
    setManagers(renumberedManagers);
  };

  const handleManagerFieldChange = (index: number, field: 'field1' | 'field2', value: string) => {
    const updatedManagers = [...managers];
    updatedManagers[index][field] = value;
    setManagers(updatedManagers);
  };

  const generateWorkflowJson = (
    workflowName: string,
    managers: { name: string; email: string }[],
    userEmail: string,
    workflow_id: number,
    requestId: number
  ) => {
    const nodes = [];
    const tabId = "e0ba68613f04424c";

    // PostgreSQL Config Node
    nodes.push({
      id: "7b9ec91590d534cc",
      type: "postgreSQLConfig",
      z: tabId,
      name: "PostgreSQL Config",
      host: "52.91.38.126",
      port: 5433,
      database: "nodered_db",
      ssl: false,
      user: "nodered_user",
      password: "nodered_password",
      max: 10,
      idleTimeoutMillis: 1000,
      connectionTimeoutMillis: 10000,
      x: 320,
      y: 60
    });

    nodes.push({
      id: "workflow_approval",
      type: "tab",
      label: workflowName,
      disabled: false,
      info: "",
      env: []
    });

    nodes.push({
      id: "http_in_create",
      type: "http in",
      z: tabId,
      name: "Initiate Workflow",
      url: "/api/initiateWorkflow",
      method: "post",
      upload: false,
      swaggerDoc: "",
      x: 100,
      y: 100,
      wires: [["prepare_email", "manager_0"]]
    });

    nodes.push({
      id: "prepare_email",
      type: "function",
      z: tabId,
      name: "prepare_email",
      func: `
        if (msg.payload.formCreated === true) {
          let requestData = {
            workflowName: msg.payload.workflowName || "Unknown Workflow",
            approver: msg.payload.approverEmail || "Unknown approver"
          };
    
          msg.params = [
            ${workflow_id},
            JSON.stringify(requestData),
            msg.payload.status,
            0,
            ${managers.length},
            msg.payload.requestid,
            "NA",
            msg.payload.manager_email
          ];
    
          msg.request_id = msg.payload.requestid;
          msg.topic = "Workflow " + msg.request_id;
          msg.to = msg.payload.approverEmail;
    
          msg.html = \`
            <div style="font-family: Arial, sans-serif; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
              <h2 style="color: #2c3e50;">Workflow Request Update</h2>
              <p style="font-size: 16px;">Workflow \${msg.request_id} is \${msg.payload.status}. Please click the <a href ="#"> Link </a> to approve or reject </p>
    
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; background-color: #ecf0f1;"><strong>Request ID:</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">\${msg.request_id}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; background-color: #ecf0f1;"><strong>Status:</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd; color: \${msg.payload.status === 'Completed' ? 'green' : 'red'};">
                    <strong>\${msg.payload.status}</strong>
                  </td>
                </tr>
              </table>
    
              <p style="margin-top: 15px; font-size: 14px; color: #7f8c8d;">This is an automated message. Please do not reply.</p>
            </div>
          \`;
    
          msg.payload = msg.html;
    
          return msg;
        }
      `,
      outputs: 2,
      x: 310,
      y: 180,
      wires: [
        ["send_email", "postgres_insert"],
        ["postgres_reject"]
      ]
    });

    nodes.push({
      id: "postgres_insert",
      type: "postgresql",
      z: tabId,
      name: "PostgreSQL(Approve)",
      query: "INSERT INTO approval_request (workflow_id, request_data, status, current_level, total_levels, requestid, remarks, manager_email, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now());",
      postgreSQLConfig: "7b9ec91590d534cc",
      split: false,
      rowsPerMsg: 1,
      outputs: 1,
      x: 110,
      y: 120,
      wires: []
    });

    nodes.push({
      id: "postgres_reject",
      type: "postgresql",
      z: tabId,
      name: "PostgreSQL(Reject)",
      query: "INSERT INTO approval_request (workflow_id, request_data, status, current_level, total_levels, requestid, remarks, manager_email, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now());",
      postgreSQLConfig: "7b9ec91590d534cc",
      split: false,
      rowsPerMsg: 1,
      outputs: 1,
      x: 120,
      y: 240,
      wires: []
    });

    managers.forEach((manager, index) => {
      nodes.push({
        id: `manager_${index}`,
        type: "function",
        z: tabId,
        name: `${manager.name} Approval`,
        func: `
          msg.workflowName = msg.payload.workflowName;
          msg.approverEmail = msg.payload.approverEmail;
          return msg;
        `,
        outputs: 1,
        x: 300,
        y: 180,
        wires: index === 0 
          ? [[`decision_${index}`, "http_response"]]
          : [[`decision_${index}`]]
      });

      nodes.push({
        id: `http_in_manager_${index}`,
        type: "http in",
        z: tabId,
        name: `${manager.name} Decision`,
        url: `/api/level${index + 1}Decision`,
        method: "post",
        upload: false,
        swaggerDoc: "",
        x: 100 + index * 200,
        y: 100,
        wires: [[`decision_${index}`]]
      });

      nodes.push({
        id: `decision_${index}`,
        type: "function",
        z: tabId,
        name: `Check ${manager.name} Decision`,
        func: `
          if (msg.payload.formCompleted === true) {
            let requestData = {
              workflowName: msg.payload.workflowName || "Unknown Workflow",
              approver: msg.payload.approverEmail || "Unknown approver"
            };
      
            msg.payload.status = ${index === managers.length - 1 ? '"Completed"' : '"Pending"'};
      
            msg.params = [
              msg.payload.status,
              ${index + 1},
              msg.payload.requestid
            ];
      
            msg.request_id = msg.payload.requestid;
            msg.topic = "Workflow " + msg.request_id;
            msg.to = msg.payload.approverEmail;
      
            msg.html = \`
              <div style="font-family: Arial, sans-serif; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
                <h2 style="color: #2c3e50;">Workflow Request Update</h2>
                <p style="font-size: 16px;">Workflow \${msg.request_id} is \${msg.payload.status}. Please click the <a href ="#"> Link </a> to approve or reject </p>
      
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; background-color: #ecf0f1;"><strong>Request ID:</strong></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">\${msg.request_id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; background-color: #ecf0f1;"><strong>Status:</strong></td>
                    <td style="padding: 10px; border: 1px solid #ddd; color: \${msg.payload.status === 'Completed' ? 'green' : 'red'};">
                      <strong>\${msg.payload.status}</strong>
                    </td>
                  </tr>
                </table>
      
                <p style="margin-top: 15px; font-size: 14px; color: #7f8c8d;">This is an automated message. Please do not reply.</p>
              </div>
            \`;
      
            msg.payload = msg.html;
      
            return [msg, null];
          } else {
            return [null, msg];
          }
        `,
        outputs: 2,
        x: 220,
        y: 160 + index * 80,
        wires: [
          index === managers.length - 1
            ? [`postgres_insert_approve_${index}`, "send_email", "http_response"]
            : [`postgres_insert_approve_${index}`, "send_email", "http_response", `manager_${index + 1}`],
          index === managers.length - 1
            ? [`postgres_insert_reject_${index}`, "http_response"]
            : [`postgres_insert_reject_${index}`, "http_response"]
        ]
      });

      nodes.push({
        id: "send_email",
        type: "e-mail",
        z: tabId,
        server: "sandbox.smtp.mailtrap.io",
        port: "2525",
        username: "7e1bc8ac65b174",
        password: "efdb981370c2dc",
        subject: "Workflow Completed",
        body: "{{payload.html}}",
        x: 770,
        y: 150,
        wires: []
      });

      nodes.push({
        id: `postgres_insert_approve_${index}`,
        type: "postgresql",
        z: tabId,
        name: `Insert into PostgreSQL(Approve) - ${manager.name}`,
        query: "UPDATE approval_request SET status = $1, current_level = $2, updated_at = NOW() WHERE requestid = $3;",
        postgreSQLConfig: "7b9ec91590d534cc",
        split: false,
        rowsPerMsg: 1,
        outputs: 1,
        x: 1100 + index * 200,
        y: 120,
        wires: []
      });

      nodes.push({
        id: `postgres_insert_reject_${index}`,
        type: "postgresql",
        z: tabId,
        name: `Insert into PostgreSQL(Reject) - ${manager.name}`,
        query: "UPDATE approval_request SET status = $1, current_level = $2, updated_at = NOW() WHERE requestid = $3;",
        postgreSQLConfig: "7b9ec91590d534cc",
        split: false,
        rowsPerMsg: 1,
        outputs: 1,
        x: 1100 + index * 200,
        y: 240,
        wires: []
      });

      nodes.push({
        id: "http_response",
        type: "http response",
        z: tabId,
        name: "HTTP Response",
        statusCode: "200",
        headers: {},
        x: 500,
        y: 100,
        wires: []
      });
    });

    return {
      flows: [{
        id: "workflow_approval",
        type: "tab",
        label: workflowName,
        disabled: false,
        info: "",
        env: [],
        nodes: nodes
      }],
      credentials: {}
    };
  };

  useEffect(() => {
    const root = rootElem.current as HTMLElement;
    console.log('Plugin element', root);
  }, []);

  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      <div className="form-group">
        <label>Workflow Name</label>
        <input
          type="text"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          placeholder="Enter workflow name"
        />
      </div>
      
      <div className="manager-list">
        {managers.map((manager, index) => (
          <div key={index} className="manager-item">
            <span className="level-label">{manager.name}</span>
            
            <input
              type="text"
              value={manager.field1}
              onChange={(e) => handleManagerFieldChange(index, 'field1', e.target.value)}
              placeholder="Manager Email"
              style={{ marginRight: '8px' }}
            />
            
            <input
              type="text"
              value={manager.field2}
              onChange={(e) => handleManagerFieldChange(index, 'field2', e.target.value)}
              placeholder="Additional Field"
              style={{ marginRight: '8px' }}
            />
            
            <button
              className="remove-level"
              onClick={() => removeLevel(index)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      
      <div className="form-group">
        <button className="add-level" onClick={addManager}>
          Add Level
        </button>
      </div>
      
      <button className="submit" onClick={handleSubmit}>
        Submit
      </button>
    </Styles>
  );
}
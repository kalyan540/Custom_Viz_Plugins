import React, { useEffect, createRef, useState } from 'react';
import { styled } from '@superset-ui/core';
import { FlowBuilderProps, FlowBuilderStylesProps } from './types';
import { Popover, Select } from 'antd';

const Styles = styled.div<FlowBuilderStylesProps>`
  background-color: ${({ theme }) => theme.colors.secondary.light2};
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;

  .form-group {
    margin-bottom: ${({ theme }) => theme.gridUnit * 3}px;
  }

  label {
    display: block;
    margin-bottom: ${({ theme }) => theme.gridUnit}px;
    font-weight: bold;
  }

  input {
    width: 100%;
    padding: ${({ theme }) => theme.gridUnit * 2}px;
    border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
    border-radius: ${({ theme }) => theme.gridUnit}px;
  }

  button {
    padding: ${({ theme }) => theme.gridUnit * 2}px ${({ theme }) => theme.gridUnit * 4}px;
    background-color: ${({ theme }) => theme.colors.primary.base};
    color: white;
    border: none;
    border-radius: ${({ theme }) => theme.gridUnit}px;
    cursor: pointer;
    margin-right: ${({ theme }) => theme.gridUnit * 2}px;
  }

  button:hover {
    background-color: ${({ theme }) => theme.colors.primary.dark1};
  }

  .node-list {
    margin-top: ${({ theme }) => theme.gridUnit * 2}px;
  }

  .node-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${({ theme }) => theme.gridUnit}px;
    border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
    border-radius: ${({ theme }) => theme.gridUnit}px;
    margin-bottom: ${({ theme }) => theme.gridUnit}px;
  }
`;

const { Option } = Select;

export default function FlowBuilder(props: FlowBuilderProps) {
  const { height, width, apiEndpoint } = props;
  const rootElem = createRef<HTMLDivElement>();

  const [workflowName, setWorkflowName] = useState(`Workflow-${Math.floor(Math.random() * 1000)}`);
  const [nodes, setNodes] = useState<Array<{ type: string }>>([]);
  const [selectedNodeType, setSelectedNodeType] = useState<string>('');

  const handleAddNode = () => {
    if (selectedNodeType) {
      setNodes([...nodes, { type: selectedNodeType }]);
      setSelectedNodeType(''); // Reset the selected node type
    }
  };

  const handleRemoveNode = (index: number) => {
    const newNodes = [...nodes];
    newNodes.splice(index, 1);
    setNodes(newNodes);
  };

  const handleSubmit = async () => {
    const workflowJson = generateWorkflowJson(workflowName, nodes);
    console.log('Workflow JSON:', workflowJson);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowJson),
      });

      if (response.status === 204) {
        console.log('Workflow created successfully!');
        alert('Workflow created successfully!');
      } else {
        const result = await response.json();
        console.log('API Response:', result);
        alert('Workflow created successfully!');
      }
    } catch (error) {
      console.error('Error submitting workflow:', error);
      alert('Failed to create workflow. Please try again.');
    }
  };

  const generateWorkflowJson = (workflowName: string, nodes: Array<{ type: string }>) => {
    const workflow = [];
    const tabId = "e0ba68613f04424c";

    // PostgreSQL Config Node
    workflow.push({
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
      y: 60,
    });

    workflow.push({
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
      wires: [["prepare_email"]]
    });

    workflow.push({
      id: "prepare_email",
      type: "function",
      z: tabId,
      name: "prepare_email",
      func: `
        msg.payload.status = "Completed";
        msg.request_id = msg.payload?.requestId || "UnknownID";
        msg.topic = \`Workflow ${msg.request_id}\`;
        msg.to = msg.payload.to || "herig68683@cybtric.com";
        msg.html = \`
          <div style="font-family: Arial, sans-serif; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
            <h2 style="color: #2c3e50;">Workflow Request Update</h2>
            <p style="font-size: 16px;">Workflow ${msg.request_id} has been created, to approve or reject please click on the link <a href="http://www.google.com"> Google</a> </p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #ecf0f1;"><strong>Request ID:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${msg.request_id}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #ecf0f1;"><strong>Status:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd; color: ${msg.payload.status === 'Completed' ? 'green' : 'red'};">
                  <strong>${msg.payload.status}</strong>
                </td>
              </tr>
            </table>
            <p style="margin-top: 15px; font-size: 14px; color: #7f8c8d;">This is an automated message. Please do not reply.</p>
          </div>\`;
        msg.payload = msg.html;
        return msg;
      `,
      outputs: 1,
      x: 310,
      y: 120,
      wires: [["send_email"]]
    });

    workflow.push({
      id: "send_email",
      type: "e-mail",
      z: tabId,
      server: "sandbox.smtp.mailtrap.io",
      port: "2525",
      username: "62753aa9883bbc",
      password: "a249d24a02ce4f",
      subject: "Workflow Completed",
      body: "{{payload.html}}",
      x: 770,
      y: 150,
      wires: []
    });

    nodes.forEach((node, index) => {
      const nodeId = `node_${index}`;
      const nodeType = node.type.toLowerCase();

      workflow.push({
        id: nodeId,
        type: "function",
        z: tabId,
        name: node.type,
        func: `
          msg.workflowName = "${workflowName}";
          msg.${nodeType} = "${node.type}";
          msg.payload.formCompleted = true;
          return msg;
        `,
        outputs: 1,
        x: 300,
        y: 180 + (index * 60),
        wires: [["check_approval"]]
      });
    });

    workflow.push({
      id: "check_approval",
      type: "function",
      z: tabId,
      name: "Check if the form completed",
      func: `
        if (msg.payload.formCompleted === true) {
          msg.params = [
            2,
            JSON.stringify({ workflowName: msg.workflowName, nodes: ${JSON.stringify(nodes)} }),
            "Completed",
            1,
            5
          ];
          return [msg, null];
        } else {
          return [null, msg];
        }
      `,
      outputs: 2,
      x: 700,
      y: 180,
      wires: [
        ["postgres_insert_approve", "http_response"],
        ["postgres_insert_reject", "http_response"]
      ]
    });

    workflow.push({
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

    workflow.push({
      id: "postgres_insert_approve",
      type: "postgresql",
      z: tabId,
      name: "Insert into PostgreSQL(Approve)",
      query: "INSERT INTO approval_request (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
      postgreSQLConfig: "7b9ec91590d534cc",
      split: false,
      rowsPerMsg: 1,
      outputs: 1,
      x: 1100,
      y: 120,
      wires: [],
    });

    workflow.push({
      id: "postgres_insert_reject",
      type: "postgresql",
      z: tabId,
      name: "Insert into PostgreSQL(Reject)",
      query: "INSERT INTO approval_request (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
      postgreSQLConfig: "7b9ec91590d534cc",
      split: false,
      rowsPerMsg: 1,
      outputs: 1,
      x: 1100,
      y: 120,
      wires: [],
    });

    return workflow;
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
      <div className="form-group">
        <label>Add Node</label>
        <Select
          style={{ width: '100%' }}
          placeholder="Select a node type"
          value={selectedNodeType}
          onChange={(value) => setSelectedNodeType(value)}
        >
          <Option value="Candidate">Candidate</Option>
          <Option value="Manager">Manager</Option>
          <Option value="HRBP">HRBP</Option>
        </Select>
        <button onClick={handleAddNode}>Add Node</button>
      </div>
      <div className="node-list">
        {nodes.map((node, index) => (
          <div key={index} className="node-item">
            <span>{node.type}</span>
            <button onClick={() => handleRemoveNode(index)}>Remove</button>
          </div>
        ))}
      </div>
      <button onClick={handleSubmit}>Submit</button>
    </Styles>
  );
}
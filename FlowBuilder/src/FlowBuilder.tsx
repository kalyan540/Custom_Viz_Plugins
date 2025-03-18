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
`;

export default function FlowBuilder(props: FlowBuilderProps) {
  const { height, width, apiEndpoint } = props;
  const rootElem = createRef<HTMLDivElement>();

  // State for form inputs
  const [workflowName, setWorkflowName] = useState(
    `Workflow-${Math.floor(Math.random() * 1000)}`, // Auto-generate workflow name
  );
  const [nodes, setNodes] = useState<{ type: string; email: string }[]>([]); // Stores nodes (Manager, HRBP, Candidate)
  const [popoverVisible, setPopoverVisible] = useState(false); // Controls popover visibility

  // Handle form submission
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

  // Add a node to the list
  const addNode = (type: string, email: string) => {
    setNodes([...nodes, { type, email }]);
  };

  // Generate JSON for Node-RED
  const generateWorkflowJson = (
    workflowName: string,
    nodes: { type: string; email: string }[],
  ) => {
    const workflow = [];
    const tabId = "e0ba68613f04424c"; // Static tab ID for Node-RED

    // PostgreSQL Config Node
    workflow.push({
      id: "7b9ec91590d534cc",
      type: "postgreSQLConfig",
      z: tabId,
      name: "PostgreSQL Config",
      host: "52.91.38.126", // Replace with your PostgreSQL host
      port: 5433, // Replace with your PostgreSQL port
      database: "nodered_db", // Replace with your database name
      ssl: false, // Set to true if using SSL
      user: "nodered_user", // Replace with your PostgreSQL username
      password: "nodered_password", // Replace with your PostgreSQL password
      max: 10, // Maximum number of connections in the pool
      idleTimeoutMillis: 1000, // Idle connection timeout
      connectionTimeoutMillis: 10000, // Connection timeout
      x: 320, // X position in the Node-RED editor
      y: 60, // Y position in the Node-RED editor
    });

    // HTTP Input Node
    workflow.push({
      id: "http_in_create",
      type: "http in",
      z: tabId,
      name: "Initiate Workflow",
      url: "/api/initiateWorkflow",
      method: "post",
      x: 100,
      y: 100,
      wires: [["prepare_email", "process_candidate"]], // Two wires: prepare_email and process_candidate
    });

    // Prepare Email Node
    workflow.push({
      id: "prepare_email",
      type: "function",
      z: tabId,
      name: "Prepare Email",
      func: `
        msg.payload.status = "Pending";
        msg.request_id = msg.payload?.requestId || "UnknownID";
        msg.topic = \`Workflow \${msg.request_id}\`;
        msg.to = "wameya7577@excederm.com"; // Use the provided email
        msg.html = \`
          <div style="font-family: Arial, sans-serif; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
            <h2 style="color: #2c3e50;">Workflow Request Update</h2>
            <p style="font-size: 16px;">Workflow \${msg.request_id} has been created. To approve or reject, please click on the link <a href="http://www.google.com">Google</a>.</p>
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
      `,
      outputs: 1,
      x: 310,
      y: 120,
      wires: [["send_email"]],
    });

    // Send Email Node
    workflow.push({
      id: "send_email",
      type: "e-mail",
      z: tabId,
      server: "sandbox.smtp.mailtrap.io",
      port: "2525",
      username: "62753aa9883bbc", // Visible in the email field
      password: "a249d24a02ce4f", // Visible in the email field
      subject: "Workflow Update",
      body: "{{payload.html}}",
      x: 770,
      y: 120,
      wires: [],
    });

    // Process Candidate Node
    workflow.push({
      id: "process_candidate",
      type: "function",
      z: tabId,
      name: "Process Candidate",
      func: `
        msg.workflowName = "${workflowName}";
        msg.candidateEmail = "wameya7577@excederm.com"; // Use the provided email
        msg.payload.candidate = "wameya7577@excederm.com";
        msg.payload.formCompleted = true;
        return msg;
      `,
      outputs: 1,
      x: 300,
      y: 180,
      wires: [["postgres_insert_candidate_approve", "postgres_insert_candidate_reject"]],
    });

    // PostgreSQL Insert Nodes
    workflow.push({
      id: "postgres_insert_candidate_approve",
      type: "postgresql",
      z: tabId,
      name: "Insert into PostgreSQL (Approve)",
      query: "INSERT INTO approval_request (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
      postgreSQLConfig: "7b9ec91590d534cc",
      x: 1100,
      y: 120,
      wires: [],
    });

    workflow.push({
      id: "postgres_insert_candidate_reject",
      type: "postgresql",
      z: tabId,
      name: "Insert into PostgreSQL (Reject)",
      query: "INSERT INTO approval_request (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
      postgreSQLConfig: "7b9ec91590d534cc",
      x: 1100,
      y: 120,
      wires: [],
    });

    // HTTP Response Node
    workflow.push({
      id: "http_response",
      type: "http response",
      z: tabId,
      name: "HTTP Response",
      statusCode: "200",
      x: 500,
      y: 100,
      wires: [],
    });

    // Dynamically generate nodes for each selected node
    nodes.forEach((node, index) => {
      // Prepare Email Node
      workflow.push({
        id: `prepare_email_${index}`,
        type: "function",
        z: tabId,
        name: `Prepare Email for ${node.type}`,
        func: `
          msg.payload.status = "Pending";
          msg.request_id = msg.payload?.requestId || "UnknownID";
          msg.topic = \`Workflow \${msg.request_id}\`;
          msg.to = "wameya7577@excederm.com"; // Use the provided email
          msg.html = \`
            <div style="font-family: Arial, sans-serif; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
              <h2 style="color: #2c3e50;">Workflow Request Update</h2>
              <p style="font-size: 16px;">Workflow \${msg.request_id} has been created. To approve or reject, please click on the link <a href="http://www.google.com">Google</a>.</p>
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
        `,
        outputs: 1,
        x: 310,
        y: 240 + index * 80,
        wires: [[`send_email_${index}`]],
      });

      // Send Email Node
      workflow.push({
        id: `send_email_${index}`,
        type: "e-mail",
        z: tabId,
        server: "sandbox.smtp.mailtrap.io",
        port: "2525",
        username: "62753aa9883bbc", // Visible in the email field
        password: "a249d24a02ce4f", // Visible in the email field
        subject: "Workflow Update",
        body: "{{payload.html}}",
        x: 770,
        y: 240 + index * 80,
        wires: [],
      });

      // Node Processing
      workflow.push({
        id: `node_${index}`,
        type: "function",
        z: tabId,
        name: `Process ${node.type}`,
        func: `
          msg.workflowName = "${workflowName}";
          msg.nodeEmail = "wameya7577@excederm.com"; // Use the provided email
          msg.payload.node = "wameya7577@excederm.com";
          msg.payload.formCompleted = true;
          return msg;
        `,
        outputs: 1,
        x: 300,
        y: 300 + index * 80,
        wires: [[`postgres_insert_approve_${index}`, `postgres_insert_reject_${index}`]],
      });

      // PostgreSQL Insert Nodes
      workflow.push({
        id: `postgres_insert_approve_${index}`,
        type: "postgresql",
        z: tabId,
        name: `Insert into PostgreSQL (Approve) for ${node.type}`,
        query: "INSERT INTO approval_request (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
        postgreSQLConfig: "7b9ec91590d534cc",
        x: 1100,
        y: 240 + index * 80,
        wires: [],
      });

      workflow.push({
        id: `postgres_insert_reject_${index}`,
        type: "postgresql",
        z: tabId,
        name: `Insert into PostgreSQL (Reject) for ${node.type}`,
        query: "INSERT INTO approval_request (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
        postgreSQLConfig: "7b9ec91590d534cc",
        x: 1100,
        y: 240 + index * 80,
        wires: [],
      });

      // Connect to the next node (if any)
      if (index < nodes.length - 1) {
        workflow[workflow.length - 1].wires[0].push(`prepare_email_${index + 1}`);
      }
    });

    return workflow;
  };

  // Popover content for selecting a node
  const nodePopoverContent = (
    <div>
      <div
        style={{ padding: '8px', cursor: 'pointer' }}
        onClick={() => {
          addNode('Manager', 'wameya7577@excederm.com');
          setPopoverVisible(false);
        }}
      >
        Manager (wameya7577@excederm.com)
      </div>
      <div
        style={{ padding: '8px', cursor: 'pointer' }}
        onClick={() => {
          addNode('HRBP', 'wameya7577@excederm.com');
          setPopoverVisible(false);
        }}
      >
        HRBP (wameya7577@excederm.com)
      </div>
      <div
        style={{ padding: '8px', cursor: 'pointer' }}
        onClick={() => {
          addNode('Candidate', 'wameya7577@excederm.com');
          setPopoverVisible(false);
        }}
      >
        Candidate (wameya7577@excederm.com)
      </div>
    </div>
  );

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
      <div className="node-list">
        {nodes.map((node, index) => (
          <div key={index} className="node-item">
            <span>
              {node.type} (wameya7577@excederm.com)
            </span>
            <button
              onClick={() =>
                setNodes(nodes.filter((_, i) => i !== index))
              }
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="form-group">
        <Popover
          content={nodePopoverContent}
          trigger="click"
          visible={popoverVisible}
          onVisibleChange={(visible) => setPopoverVisible(visible)}
        >
          <button>Add Nodes</button>
        </Popover>
      </div>
      <button onClick={handleSubmit}>Submit</button>
    </Styles>
  );
}
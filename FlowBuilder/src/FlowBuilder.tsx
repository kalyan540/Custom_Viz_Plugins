import React, { useEffect, createRef, useState } from 'react';
import { styled } from '@superset-ui/core';
import { FlowBuilderProps, FlowBuilderStylesProps } from './types';
import { Popover } from 'antd'; // Assuming you're using Ant Design for the popover

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
    padding: ${({ theme }) => theme.gridUnit * 2}px ${({ theme }) =>
  theme.gridUnit * 4}px;
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

  .manager-list {
    margin-top: ${({ theme }) => theme.gridUnit * 3}px;
    max-height: 75px; /* Set a max height for the scrollable area */
    overflow-y: auto; /* Enable vertical scrolling */
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
`;

export default function FlowBuilder(props: FlowBuilderProps) {
  const { height, width, apiEndpoint } = props;
  const rootElem = createRef<HTMLDivElement>();

  // State for form inputs
  const [workflowName, setWorkflowName] = useState(
    `Workflow-${Math.floor(Math.random() * 1000)}`, // Auto-generate workflow name
  );
  const [nodes, setNodes] = useState<{ type: string; name: string; email: string }[]>(
    [],
  );
  const [currentUserEmail, setCurrentUserEmail] = useState(
    'user@example.com', // Replace with dynamic value if available
  );

  // Popover visibility state
  const [popoverVisible, setPopoverVisible] = useState(false);

  // Handle form submission
  const handleSubmit = async () => {
    const workflowJson = generateWorkflowJson(workflowName, nodes, currentUserEmail);
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
        const result = await response.json(); // Handle other success responses (if any)
        console.log('API Response:', result);
        alert('Workflow created successfully!');
      }
    } catch (error) {
      console.error('Error submitting workflow:', error);
      alert('Failed to create workflow. Please try again.');
    }
  };

  // Add a node to the list
  const addNode = (node: { type: string; name: string; email: string }) => {
    setNodes([...nodes, node]);
  };

  // Generate JSON for Node-Red
  const generateWorkflowJson = (
    workflowName: string,
    nodes: { type: string; name: string; email: string }[],
    userEmail: string,
  ) => {
    const workflow = [];
    const tabId = "e0ba68613f04424c"; // Static tab ID for Node-Red

    // Start node
    workflow.push({
      id: "inject_start",
      type: "inject",
      z: tabId,
      name: "Start Request",
      props: [{ p: "payload" }],
      payload: JSON.stringify({ requestId: 123, status: "Pending", userEmail }),
      payloadType: "json",
      x: 110,
      y: 120,
      wires: [[`node_0`]],
    });

    // Node approval nodes
    nodes.forEach((node, index) => {
      workflow.push({
        id: `node_${index}`,
        type: "function",
        z: tabId,
        name: `${node.name} (${node.type}) Approval`,
        func: `msg.payload = {}; msg.payload.approval = Math.random() > 0.5 ? \"Approved\" : \"Rejected\";\nmsg.payload.${node.type.toLowerCase()} = \"${node.name}\";\nreturn msg;`,
        outputs: 1,
        x: 300,
        y: 120 + index * 80,
        wires: [[`decision_${index}`]],
      });

      workflow.push({
        id: `decision_${index}`,
        type: "switch",
        z: tabId,
        name: `Check ${node.name} Decision`,
        property: "payload.approval",
        propertyType: "msg",
        rules: [
          { t: "eq", v: "Approved", vt: "str" },
          { t: "eq", v: "Rejected", vt: "str" },
        ],
        outputs: 2,
        x: 220,
        y: 160 + index * 80,
        wires: [
          [index === nodes.length - 1 ? "set_completed_status" : `node_${index + 1}`],
          ["reject_notification"],
        ],
      });
    });

    // Set completed status node
    workflow.push({
      id: "set_completed_status",
      type: "function",
      z: tabId,
      name: "Set status to completed",
      func: `msg.payload.status = \"Completed\";\nmsg.payload.request_id = msg.payload?.requestId || \"UnknownID\";\nmsg.topic = \`Workflow \${msg.payload.request_id}\`;\nmsg.payload.html = \`<div style=\"font-family: Arial, sans-serif; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;\"><h2 style=\"color: #2c3e50;\">Workflow Request Update</h2><p style=\"font-size: 16px;\">Your request has been processed.</p><table style=\"width: 100%; border-collapse: collapse; margin-top: 10px;\"><tr><td style=\"padding: 10px; border: 1px solid #ddd; background-color: #ecf0f1;\"><strong>Request ID:</strong></td><td style=\"padding: 10px; border: 1px solid #ddd;\">\${msg.payload.request_id}</td></tr><tr><td style=\"padding: 10px; border: 1px solid #ddd; background-color: #ecf0f1;\"><strong>Status:</strong></td><td style=\"padding: 10px; border: 1px solid #ddd; color: \${msg.payload.status === 'Completed' ? 'green' : 'red'};\"><strong>\${msg.payload.status}</strong></td></tr></table><p style=\"margin-top: 15px; font-size: 14px; color: #7f8c8d;\">This is an automated message. Please do not reply.</p></div>\`;\nreturn msg;`,
      outputs: 1,
      x: 550,
      y: 180,
      wires: [["approval_email"]],
    });

    // Approval email node
    workflow.push({
      id: "approval_email",
      type: "e-mail",
      z: tabId,
      name: "Send Approval Email",
      server: "sandbox.smtp.mailtrap.io",
      port: "2525",
      to: userEmail,
      subject: "Workflow Completed",
      body: "{{payload.html}}",
      x: 770,
      y: 150,
      wires: [],
    });

    // Reject notification email node
    workflow.push({
      id: "reject_notification",
      type: "e-mail",
      z: tabId,
      name: "Send Rejection Email",
      server: "sandbox.smtp.mailtrap.io",
      port: "2525",
      to: userEmail,
      subject: "Workflow Rejected",
      body: "Your workflow request has been rejected by {{payload.manager}}.",
      x: 770,
      y: 300,
      wires: [],
    });

    return workflow; // Return a plain JavaScript object
  };

  // Popover content for selecting a node
  const nodePopoverContent = (
    <div>
      <div
        style={{ padding: '8px', cursor: 'pointer' }}
        onClick={() => {
          addNode({ type: 'Manager', name: 'John Doe', email: 'john.doe@example.com' });
          setPopoverVisible(false);
        }}
      >
        Manager (John Doe)
      </div>
      <div
        style={{ padding: '8px', cursor: 'pointer' }}
        onClick={() => {
          addNode({ type: 'HRBP', name: 'Jane Smith', email: 'jane.smith@example.com' });
          setPopoverVisible(false);
        }}
      >
        HRBP (Jane Smith)
      </div>
      <div
        style={{ padding: '8px', cursor: 'pointer' }}
        onClick={() => {
          addNode({ type: 'Candidate', name: 'Alice Johnson', email: 'alice.johnson@example.com' });
          setPopoverVisible(false);
        }}
      >
        Candidate (Alice Johnson)
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
      <div className="form-group">
        <label>Current User Email</label>
        <input
          type="text"
          value={currentUserEmail}
          onChange={(e) => setCurrentUserEmail(e.target.value)}
          placeholder="Enter your email"
        />
      </div>
      <div className="manager-list">
        {nodes.map((node, index) => (
          <div key={index} className="manager-item">
            <span>
              {node.name} ({node.type}) - {node.email}
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
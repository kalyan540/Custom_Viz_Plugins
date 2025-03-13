import React, { useEffect, createRef, useState } from 'react';
import { styled } from '@superset-ui/core';
import { FlowBuilderProps, FlowBuilderStylesProps } from './types';
import { Popover } from 'antd'; // Assuming you're using Ant Design for the popover

const Styles = styled.div<FlowBuilderStylesProps>
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
;

export default function FlowBuilder(props: FlowBuilderProps) {
  const { height, width, apiEndpoint } = props;
  const rootElem = createRef<HTMLDivElement>();

  // State for form inputs
  const [workflowName, setWorkflowName] = useState(
    Workflow-${Math.floor(Math.random() * 1000)}, // Auto-generate workflow name
  );
  const [managers, setManagers] = useState<{ name: string; email: string }[]>(
    [],
  );
  const [currentUserEmail, setCurrentUserEmail] = useState(
    'user@example.com', // Replace with dynamic value if available
  );

  // Popover visibility state
  const [popoverVisible, setPopoverVisible] = useState(false);

  // Handle form submission
  const handleSubmit = async () => {
    const workflowJson = generateWorkflowJson(workflowName, managers, currentUserEmail);
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

  // Add a manager to the list
  const addManager = (manager: { name: string; email: string }) => {
    setManagers([...managers, manager]);
  };

  const generateWorkflowJson = (workflowName, userEmail) => {
    const workflow = [];
    const tabId = "e0ba68613f04424c"; // Change if needed
    const requestId = new Date().getTime(); // Unique request ID
  
    // Start Node (Inject)
    workflow.push({
      id: "inject_start",
      type: "inject",
      z: tabId,
      name: "Start Request",
      props: [{ p: "payload" }],
      payload: JSON.stringify({ requestId, status: "Pending", userEmail, workflowName }),
      payloadType: "json",
      x: 110,
      y: 120,
      wires: [["postgres_insert"]],
    });
  
    // PostgreSQL Configuration Node
    workflow.push({
      id: "postgres_config",
      type: "postgreSQLConfig",
      z: tabId,
      name: "Postgres Config",
      host: "52.91.38.126",
      port: 5433,
      database: "nodered_db",
      user: "nodered_user",
      password: "nodered_password",
      ssl: false,
      max: 10,
      idle: 1000,
      connectionTimeout: 10000,
      x: 320,
      y: 60,
    });
  
    // PostgreSQL Insert Node
    workflow.push({
      id: "postgres_insert",
      type: "postgresql",
      z: tabId,
      name: "Insert Data",
      query: `INSERT INTO approval_requests (user_id, request_data, status) 
              VALUES (1, '${JSON.stringify({ workflowName, userEmail })}', 'Pending');`,
      postgreSQLConfig: "postgres_config",
      split: false,
      rowsPerMsg: 1,
      outputs: 1,
      x: 500,
      y: 120,
      wires: [["debug_output"]],
    });
  
    // Debug Node
    workflow.push({
      id: "debug_output",
      type: "debug",
      z: tabId,
      name: "Debug Output",
      active: true,
      console: "true",
      toStatus: "true",
      x: 700,
      y: 120,
      wires: [],
    });
  
    return workflow;
  };
  

  // Popover content for selecting a manager
  const managerPopoverContent = (
    <div>
      <input
        type="text"
        placeholder="Search manager..."
        style={{ marginBottom: '8px' }}
      />
      <div>
        <div
          style={{ padding: '8px', cursor: 'pointer' }}
          onClick={() => {
            addManager({ name: 'John Doe', email: 'john.doe@example.com' });
            setPopoverVisible(false);
          }}
        >
          John Doe (john.doe@example.com)
        </div>
        <div
          style={{ padding: '8px', cursor: 'pointer' }}
          onClick={() => {
            addManager({ name: 'Jane Smith', email: 'jane.smith@example.com' });
            setPopoverVisible(false);
          }}
        >
          Jane Smith (jane.smith@example.com)
        </div>
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
        {managers.map((manager, index) => (
          <div key={index} className="manager-item">
            <span>
              {manager.name} ({manager.email})
            </span>
            <button
              onClick={() =>
                setManagers(managers.filter((_, i) => i !== index))
              }
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="form-group">
        <Popover
          content={managerPopoverContent}
          trigger="click"
          visible={popoverVisible}
          onVisibleChange={(visible) => setPopoverVisible(visible)}
        >
          <button>Add Manager/Approver</button>
        </Popover>
      </div>
      <button onClick={handleSubmit}>Submit</button>
    </Styles>
  );
}
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
  const [userId, setUserId] = useState(Math.floor(Math.random() * 1000)); // Random user_id
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
    const workflowJson = generateWorkflowJson(workflowName, managers, currentUserEmail, userId);
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

  // Generate JSON for Node-Red
  const generateWorkflowJson = (
    workflowName: string,
    managers: { name: string; email: string }[],
    userEmail: string,
    userId: number,
  ) => {
    const workflow = [];
    const tabId = "e0ba68613f04424c"; // Static tab ID for Node-Red


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
    
      workflow.push({
          "id": "http_in_create",
          "type": "http in",
          z: tabId,
          "name": "Initiate Workflow",
          "url": "/api/initiateWorkflow",
          "method": "post",
          "upload": false,
          "swaggerDoc": "",
          "x": 100,
          "y": 100,
          "wires": [[`prepare_email`,'manager_0']]
        });



        workflow.push(
            {
                id: `prepare_email`,
                type: "function",
                z: tabId,
                name: "prepare_email",
                func: "\nmsg.request_id = msg.payload?.requestId || \"UnknownID\";\nmsg.topic = `Workflow ${msg.request_id}`;\nmsg.to = msg.payload.to || \"herig68683@cybtric.com\";\n//msg.payload = Your request with ID ${msg.request_id} has been processed.;\n\nmsg.html = \n    `<div style=\"font-family: Arial, sans-serif; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;\">\n        <h2 style=\"color: #2c3e50;\">Workflow Request Update</h2>\n        <p style=\"font-size: 16px;\">Workflow ${msg.request_id} has been created, to approve or reject please click on the link <a href=\"http://www.google.com\"> Google</a> </p>\n        <table style=\"width: 100%; border-collapse: collapse; margin-top: 10px;\">\n            <tr>\n                <td style=\"padding: 10px; border: 1px solid #ddd; background-color: #ecf0f1;\"><strong>Request ID:</strong></td>\n                <td style=\"padding: 10px; border: 1px solid #ddd;\">${msg.request_id}</td>\n            </tr>\n            <tr>\n                <td style=\"padding: 10px; border: 1px solid #ddd; background-color: #ecf0f1;\"><strong>Status:</strong></td>\n                <td style=\"padding: 10px; border: 1px solid #ddd; color: ${msg.payload.status === 'Completed' ? 'green' : 'red'};\">\n                    <strong>${msg.payload.status}</strong>\n                </td>\n            </tr>\n        </table>\n        <p style=\"margin-top: 15px; font-size: 14px; color: #7f8c8d;\">This is an automated message. Please do not reply.</p>\n    </div>`;\nmsg.payload = msg.html;\nreturn msg;",
                outputs: 1,
                x: 310,
                y: 180,
                "wires": [
                    [`send_email`]
                ]
            }
            );
    

        managers.forEach((manager, index) => {

        workflow.push({
            id: `manager_${index}`,
            type: "function",
            z: tabId,
            name: `${manager.name} Approval`,
            func: `
              // Add workflowName and candidateEmail to the msg object
              msg.workflowName = "${workflowName}";
              msg.candidateEmail = "${currentUserEmail}";
              
              // Set formCompleted here
              //msg.payload.formCompleted = true; // Replace with your logic if needed
          
              return msg;
            `,
            outputs: 1,
            x: 300,
            y: 180,
            wires: index === 0 
                ? [[`decision_${index}`, "http_response"]]  // Connect http_response only for the first manager
                : [[`decision_${index}`]]
          });

          workflow.push({
            id: `http_in_manager_${index}`,
            type: "http in",
            z: tabId,
            name: `${manager.name} Decision`,
            url: `/api/manager${index + 1}Decision`, // Dynamic URL
            method: "post",
            upload: false,
            swaggerDoc: "",
            x: 100 + index * 200, // Adjust positioning dynamically
            y: 100,
            wires: [[`decision_${index}`]], // Connect to the corresponding manager node
          });


          // Check Form Completed Node (Function Node)
          workflow.push({
            id: `decision_${index}`,
            type: "function",
            z: tabId,
            name: `Check ${manager.name} Decision`,
            func: `
  // Check if the form is completed
  if (msg.payload.formCompleted === true) {
    // Ensure proper JSON structure for request_data
    let requestData = {
      workflowName: msg.payload.workflowName || "Unknown Workflow",
      candidate: msg.payload.candidateEmail || "Unknown Candidate"
    };

    // Prepare the parameters for the PostgreSQL query
    msg.params = [
      ${userId}, // user_id
      JSON.stringify(requestData), // Ensure request_data is properly stringified
      msg.payload.status || "Pending", // status
      ${index + 1}, // current_level
      ${managers.length}  // total_levels
    ];

    // Prepare email content
    msg.request_id = msg.payload?.requestId || "UnknownID";
    msg.topic = "Workflow " + msg.request_id; // Use string concatenation instead of template literals
    msg.to = msg.payload.to || "herig68683@cybtric.com";
    msg.html = 
      '<div style="font-family: Arial, sans-serif; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">' +
        '<h2 style="color: #2c3e50;">Workflow Request Update</h2>' +
        '<p style="font-size: 16px;">Workflow ' + msg.request_id + ' has been created, to approve or reject please click on the link <a href="http://www.google.com"> Google</a> </p>' +
        '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">' +
          '<tr>' +
            '<td style="padding: 10px; border: 1px solid #ddd; background-color: #ecf0f1;"><strong>Request ID:</strong></td>' +
            '<td style="padding: 10px; border: 1px solid #ddd;">' + msg.request_id + '</td>' +
          '</tr>' +
          '<tr>' +
            '<td style="padding: 10px; border: 1px solid #ddd; background-color: #ecf0f1;"><strong>Status:</strong></td>' +
            '<td style="padding: 10px; border: 1px solid #ddd; color: ' + (msg.payload.status === 'Completed' ? 'green' : 'red') + ';">' +
              '<strong>' + msg.payload.status + '</strong>' +
            '</td>' +
          '</tr>' +
        '</table>' +
        '<p style="margin-top: 15px; font-size: 14px; color: #7f8c8d;">This is an automated message. Please do not reply.</p>' +
      '</div>';
    msg.payload = msg.html;

    return [msg, null]; // Send msg to the first output (for true case)
  } else {
    return [null, msg]; // Send msg to the second output (for false case)
  }
`,
            outputs: 2,
            x: 220,
            y: 160 + index * 80,
            wires: [
              index === managers.length - 1
                ? [`postgres_insert_approve_${index}`, "send_email", "http_response"] // Last manager (approval)
                : [`postgres_insert_approve_${index}`, "send_email", "http_response", `manager_${index + 1}`], // Not last manager (approval)
              index === managers.length - 1
                ? [`postgres_insert_reject_${index}`, "http_response"] // Last manager (rejection)
                : [`postgres_insert_reject_${index}`, "http_response"] // Not last manager (rejection)
            ]
          });
      // Approval email node
      workflow.push({
        id: `send_email`,
        "type": "e-mail",
        "z": "e0ba68613f04424c",
        //"name": "wameya7577@excederm.com",
        "server": "sandbox.smtp.mailtrap.io",
        "port": "2525",
        "username": "0c0c506fbb7ae6",
        "password": "ca118f69d090af",
        //"to": "wameya7577@excederm.com",
        "subject": "Workflow Completed",
        "body": "{{payload.html}}",
        "x": 770,
        "y": 150,
        "wires": []
        });

        workflow.push({
            id: `postgres_insert_approve_${index}`,
            type: "postgresql",
            z: tabId,
            name: `Insert into PostgreSQL(Approve) - ${manager.name}`,
            query: "INSERT INTO approval_request (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
            postgreSQLConfig: "7b9ec91590d534cc", // Reference the PostgreSQL config node
            split: false,
            rowsPerMsg: 1,
            outputs: 1,
            x: 1100 + index * 200, // Adjust positioning dynamically
            y: 120,
            wires: [], // No further connections needed
          });

          workflow.push({
            id: `postgres_insert_reject_${index}`,
            type: "postgresql",
            z: tabId,
            name: `Insert into PostgreSQL(Reject) - ${manager.name}`,
            query: "INSERT INTO approval_request (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
            postgreSQLConfig: "7b9ec91590d534cc", // Reference the PostgreSQL config node
            split: false,
            rowsPerMsg: 1,
            outputs: 1,
            x: 1100 + index * 200, // Adjust positioning dynamically
            y: 240,
            wires: [], // No further connections needed
          });


      
        workflow.push({
        
            "id": "http_response",
            "type": "http response",
            z: tabId,
            "name": "HTTP Response",
            "statusCode": "200",
            "headers": {},
            "x": 500,
            "y": 100,
            "wires": []
        })

        });

    
    return workflow; // Return a plain JavaScript object
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

        <div
          style={{ padding: '8px', cursor: 'pointer' }}
          onClick={() => {
            addManager({ name: 'Vikram Kumar', email: 'vikram.kumar@example.com' });
            setPopoverVisible(false);
          }}
        >
          Vikram Kumar (vikram.kumar@example.com)
        </div>

        <div
          style={{ padding: '8px', cursor: 'pointer' }}
          onClick={() => {
            addManager({ name: 'Anand Varma', email: 'anand.varma@example.com' });
            setPopoverVisible(false);
          }}
        >
          Anand Varma (anand.varma@example.com)
        </div>

        <div
          style={{ padding: '8px', cursor: 'pointer' }}
          onClick={() => {
            addManager({ name: 'Sanjay', email: 'sanjay@example.com' });
            setPopoverVisible(false);
          }}
        >
          Sanjay (sanjay@example.com)
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
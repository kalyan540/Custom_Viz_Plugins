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
    .form-group input {
    width: 100%;
    padding: ${({ theme }) => theme.gridUnit * 3}px; /* Increased padding */
    font-size: 16px; /* Larger font size */
    border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
    border-radius: ${({ theme }) => theme.gridUnit}px;
  }

  .form-group label {
    display: block;
    margin-bottom: ${({ theme }) => theme.gridUnit}px;
    font-weight: bold;
    font-size: 18px; /* Increased font size for the label */
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
    color: white;
    border: none;
    border-radius: ${({ theme }) => theme.gridUnit}px;
    cursor: pointer;
    margin-right: ${({ theme }) => theme.gridUnit * 2}px;
  }

  button.add-level {
    background-color: #3498db; /* Blue color for Add Level button */
  }

  button.remove-level {
    background-color: #e74c3c; /* Red color for Remove button */
  }

  button.submit {
    background-color: #2ecc71; /* Green color for Submit button */
    adding: ${({ theme }) => theme.gridUnit * 3}px ${({ theme }) => theme.gridUnit * 6}px; /* Increased padding */
    font-size: 16px; /* Larger font size */
  }

  .manager-list {
    margin-top: ${({ theme }) => theme.gridUnit * 3}px;
    max-height: 300px; /* Increased max height for the scrollable area */
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

  .level-label {
    font-weight: bold;
    margin-right: 8px;
  }
`;

export default function FlowBuilder(props: FlowBuilderProps) {
  const { height, width, apiEndpoint } = props;
  const rootElem = createRef<HTMLDivElement>();

  // State for form inputs
  const [workflowName, setWorkflowName] = useState(
    `Workflow-${Math.floor(Math.random() * 1000)}`, // Auto-generate workflow name
  );
  const [workflow_id, setworkflow_id] = useState(Math.floor(Math.random() * 1000)); // Random workflow_id
  const [managers, setManagers] = useState<{ name: string; field1: string; field2: string }[]>(
    [],
  );
  const [currentUserEmail, setCurrentUserEmail] = useState(
    'user@example.com', // Replace with dynamic value if available
  );
  const generateRequestId = () => {
    return `${Math.floor(Math.random() * 10000)}`; // Generate a random number between 0 and 999999
  };
  

  // State to track the current level count
  const [levelCount, setLevelCount] = useState(1);

  // Handle form submission
  const handleSubmit = async () => {
    const requestId = generateRequestId(); // Generate a random requestId
    const workflowJson = generateWorkflowJson(workflowName, managers, currentUserEmail, workflow_id,, requestId);
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
  const addManager = () => {
    const newManager = { name: `Level${levelCount}`, field1: '', field2: '' };
    setManagers([...managers, newManager]);
    setLevelCount(levelCount + 1); // Increment the level count
  };

  // Generate JSON for Node-Red
  const generateWorkflowJson = (
    workflowName: string,
    managers: { name: string; email: string }[],
    userEmail: string,
    workflow_id: number,
    requestId: number
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
                func: `
          
                // Prepare email content
                msg.request_id = "${requestId}"; // Use the dynamic requestId
                msg.topic = "Workflow " + msg.request_id; // Use string concatenation instead of template literals
                msg.to = msg.payload.to || "herig68683@cybtric.com";
          
                msg.html = \`
                  <div style="font-family: Arial, sans-serif; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
                    <h2 style="color: #2c3e50;">Workflow Request Update</h2>
                    <p style="font-size: 16px;">Workflow \${msg.request_id} has been created. To approve or reject, please click the link below:</p>
          
                    <button onclick="callAPI('Approved')" style="background-color: green; color: white; padding: 10px 20px; border: none; cursor: pointer; font-size: 16px; margin-right: 10px;">
                        Approve
                    </button>

                    <button onclick="callAPI('Rejected')" style="background-color: red; color: white; padding: 10px 20px; border: none; cursor: pointer; font-size: 16px;">
                        Reject
                    </button>
          
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
          
                  <script>
                    function callAPI(status) {
                        fetch("http://ec2-52-91-38-126.compute-1.amazonaws.com:1880/api/manager1Decision", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                            "requestId": "12345",
                            "workflowName": "Workflow-999",
                            "candidateEmail": "user1@example.com",
                            "formCompleted": true,
                            "status": "Approved"
                            })
                        })
                        .then(response => response.json())
                        .then(data => alert("Response: " + JSON.stringify(data)))
                        .catch(error => console.error("Error:", error));
                    }
                    </script>
                \`;
          
                msg.payload = msg.html;
          
                return msg;
            `,
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
                  ${workflow_id}, // workflow_id
                  JSON.stringify(requestData), // Ensure request_data is properly stringified
                  msg.payload.status || "Pending", // status
                  ${index + 1}, // current_level
                  ${managers.length}  // total_levels
                ];
          
                // Prepare email content
                msg.request_id = "${requestId}"; // Use the dynamic requestId
                //msg.request_id = msg.payload?.requestId || "UnknownID";
                msg.topic = "Workflow " + msg.request_id; // Use string concatenation instead of template literals
                msg.to = msg.payload.to || "herig68683@cybtric.com";
          
                msg.html = \`
                  <div style="font-family: Arial, sans-serif; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
                    <h2 style="color: #2c3e50;">Workflow Request Update</h2>
                    <p style="font-size: 16px;">Workflow \${msg.request_id} has been created. To approve or reject, please click the link below:</p>
          
                    <button onclick="callAPI('Approved')" style="background-color: green; color: white; padding: 10px 20px; border: none; cursor: pointer; font-size: 16px; margin-right: 10px;">
                        Approve
                    </button>

                    <button onclick="callAPI('Rejected')" style="background-color: red; color: white; padding: 10px 20px; border: none; cursor: pointer; font-size: 16px;">
                        Reject
                    </button>
          
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
          
                  <script>
                    function callAPI(status) {
                        fetch("http://ec2-52-91-38-126.compute-1.amazonaws.com:1880/api/manager${index + 2}Decision", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                            "requestId": "12345",
                            "workflowName": "Workflow-999",
                            "candidateEmail": "user1@example.com",
                            "formCompleted": true,
                            "status": "Approved"
                            })
                        })
                        .then(response => response.json())
                        .then(data => alert("Response: " + JSON.stringify(data)))
                        .catch(error => console.error("Error:", error));
                    }
                    </script>
                \`;
          
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
        "username": "605d5306baddfa",
        "password": "58f8f64964499c",
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
            
            query: "INSERT INTO approval_request (workflow_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now()) ON CONFLICT (workflow_id, current_level) DO NOTHING;",
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
            query: "INSERT INTO approval_request (workflow_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
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
        <label style={{ fontSize: '18px' }}>Workflow Name</label>
        <input
          type="text"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          placeholder="Enter workflow name"
          style={{ fontSize: '16px', padding: '12px' }}
        />
      </div>
      <div className="manager-list">
        {managers.map((manager, index) => (
          <div key={index} className="manager-item">
            {/* Manager Name as Label */}
            <span className="level-label">{manager.name}</span>
  
            {/* Input Field 1 (Uncontrolled) */}
            <input
              type="text"
              placeholder="Field 1"
              style={{ marginRight: '8px' }}
            />
  
            {/* Input Field 2 (Uncontrolled) */}
            <input
              type="text"
              placeholder="Field 2"
              style={{ marginRight: '8px' }}
            />
  
            {/* Remove Button */}
            <button
              className="remove-level"
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
        <button className="add-level" onClick={addManager}>
          Add Level
        </button>
      </div>
      <button className="submit" onClick={handleSubmit} style={{ fontSize: '16px', padding: '12px 24px' }}>
    Submit
    </button>
    </Styles>
  );
}
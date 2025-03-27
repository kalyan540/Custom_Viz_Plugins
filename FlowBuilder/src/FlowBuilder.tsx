import React, { useEffect, createRef, useState } from 'react';
import { styled } from '@superset-ui/core';
import { FlowBuilderProps, FlowBuilderStylesProps } from './types';

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

  // const [managers, setManagers] = useState<{ name: string; field1: string; field2: string }[]>(
  //   [],
  // );
  const [workflow_id, setworkflow_id] = useState(Math.floor(Math.random() * 1000)); // Random workflow_id


  // Handle form submission
  // const handleSubmit = async () => {
  //   const requestId = generateRequestId(); // Generate a random requestId
  //   const workflowJson = generateWorkflowJson(workflowName, managers, currentUserEmail, workflow_id, requestId);
  //   console.log('Workflow JSON:', workflowJson);

  //   try {
  //     // First GET request
  //     const getResponse = await fetch(apiEndpoint);
  //     console.log('getResponse:', getResponse);
  //     const getData = await getResponse.json(); // Ensure response is JSON
  //     let getData1 = typeof getData === 'string' ? getData : JSON.stringify(getData); // Ensure it's a string
  //     console.log('Raw getData1:', getData1);
  //     getData1 = getData1.slice(0, -1); 
  //     let workflowData = typeof workflowJson === 'string' ? workflowJson : JSON.stringify(workflowJson);
  //     workflowData = workflowData.slice(1); 
  //     const finalJson = getData1 + ',' + workflowData;
  //     console.log('Final Combined JSON:', finalJson);

  //     const response = await fetch(apiEndpoint, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(finalJson), // Send as JSON
  //     });

  //     if (response.status === 204) {
  //       console.log('Workflow created successfully!');
  //       alert('Workflow created successfully!');
  //     } else {
  //       const result = await response.json();
  //       console.log('API Response:', result);
  //       alert('Workflow created successfully!');
  //     }
  //   } catch (error) {
  //     console.error('Error submitting workflow:', error);
  //     alert('Failed to create workflow. Please try again.');
  //   }
  // };


  // // Add a manager to the list
  // const addManager = () => {
  //   // Find the maximum level number in the existing managers
  //   const maxLevel = managers.reduce((max, manager) => {
  //     const levelNumber = parseInt(manager.name.replace("Level", ""), 10);
  //     return levelNumber > max ? levelNumber : max;
  //   }, 0);

  //   // Calculate the next level number
  //   const nextLevel = maxLevel + 1;

  //   // Add the new manager with the correct level number
  //   const newManager = { name: `Level${nextLevel}`, field1: '', field2: '' };
  //   setManagers([...managers, newManager]);
  // };

  // const removeLevel = (indexToRemove: number) => {
  //   // Remove the level at the specified index
  //   const updatedManagers = managers.filter((_, index) => index !== indexToRemove);

  //   // Renumber the remaining levels
  //   const renumberedManagers = updatedManagers.map((manager, index) => ({
  //     ...manager,
  //     name: `Level${index + 1}`, // Renumber levels starting from 1
  //   }));

  //   // Update the state with the renumbered managers
  //   setManagers(renumberedManagers);
  // };


  const handleSubmit = async () => {
    //const requestId = generateRequestId(); // Generate a random requestId
    const workflowJson = generateWorkflowJson(
      workflowName,
      workflow_id
    );

    console.log('Generated Workflow JSON:', workflowJson);

    try {
      // Fetch existing workflows
      //let response = await fetch(apiEndpoint);
      //let existingFlows = await response.json();

      // if (!Array.isArray(existingFlows)) {
      //   console.warn('Existing flows are not an array. Converting...');
      //   existingFlows = [existingFlows];
      // }

      // // Merge existing and new workflows
      // let updatedFlows = [...existingFlows, ...workflowJson];

      // console.log('Updated Flows to be sent:', updatedFlows);

      // Send the updated JSON to Node-RED
      const postResponse = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowJson, null, 4),
      });

      if (postResponse.status === 204) {
        console.log('Workflow created successfully!');
        alert('Workflow created successfully!');
      } else {
        const result = await postResponse.json();
        console.log('API Response:', result);
        alert('Workflow created successfully!');
      }
    } catch (error) {
      console.error('Error submitting workflow:', error);
      alert('Failed to create workflow. Please try again.');
    }
  };


  // Generate JSON for Node-Red
  const generateWorkflowJson = (
    workflowName: string,
    workflow_id: number
  ) => {
    const workflow = [];
    const tabId = Math.floor(Math.random() * 10000).toString(); // Static tab ID for Node-Red

    //const idValue = Math.floor(Math.random() * 10000).toString();

    workflow.push({
      "id": tabId,
      "type": "tab",
      "label": workflowName
    });

    workflow.push({
      "id": "http_in_create",
      "type": "http in",
      "z": tabId,
      "name": "Initiate Workflow",
      "url": "/api/initiateWorkflow",
      "method": "post",
      "upload": false,
      "swaggerDoc": "",
      "x": 80,
      "y": 60,
      "wires": [
        [
          "prepare_email"
        ]
      ]
    });

    workflow.push({
      "id": "prepare_email",
      "type": "function",
      "z": tabId,
      "name": "prepare_email",
      "func": `\nnode.warn(msg);\n// Ensure proper JSON structure for request_data\nlet requestData = {\n  workflowName: msg.payload.workflowName || \"Unknown Workflow\",\n  approver: msg.payload.candidate_Email || \"Unknown approver\"\n};\n\n// Calculate dynamic total_levels (manager emails count + 1)\nconst total_levels = Array.isArray(msg.payload.approver_email)\n  ? msg.payload.approver_email.length + 1\n  : 1; // Fallback if approver_email isn't an array\n\n// Prepare the parameters for the PostgreSQL query\nmsg.params = [\n  ${workflow_id}, // workflow_id\n  JSON.stringify(requestData), // Ensure request_data is properly stringified\n  msg.payload.status, // status (either \"Completed\" or \"Pending\")\n  0, // current_level\n  total_levels, // total_levels\n  msg.payload.requestid, // requestid\n  \"NA\", // remarks\n  msg.payload.approver_email,\n  msg.payload.candidate_Email\n];\n\n// Prepare email content\nmsg.request_id = msg.payload.requestid; // Use the dynamic requestId\nmsg.topic = \"Workflow \" + msg.request_id; // Use string concatenation instead of template literals\nmsg.to = msg.payload.candidate_Email; // || \"herig68683@cybtric.com\";\n\nmsg.html = '<div style=\"font-family: Arial, sans-serif; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;\">' +\n  '<h2 style=\"color: #2c3e50;\">Workflow Request Update</h2>' +\n  '<p style=\"font-size: 16px;\">Request ' + msg.request_id + ' is ' + msg.payload.status + '. Please click the <a href=\"http://ec2-52-91-38-126.compute-1.amazonaws.com:9000\">Link</a> to approve or reject</p>' +\n  '<table style=\"width: 100%; border-collapse: collapse; margin-top: 10px;\">' +\n      '<tr><td style=\"padding: 10px; border: 1px solid #ddd; background-color: #ecf0f1;\"><strong>Request ID:</strong></td>' +\n      '<td style=\"padding: 10px; border: 1px solid #ddd;\">' + msg.request_id + '</td></tr>' +\n      '<tr><td style=\"padding: 10px; border: 1px solid #ddd; background-color: #ecf0f1;\"><strong>Status:</strong></td>' +\n      '<td style=\"padding: 10px; border: 1px solid #ddd; color: ' + (msg.payload.status === 'Completed' ? 'green' : 'red') + ';\">' +\n      '<strong>' + msg.payload.status + '</strong></td></tr></table>' +\n      '<p style=\"margin-top: 15px; font-size: 14px; color: #7f8c8d;\">This is an automated message. Please do not reply.</p>' +\n      '</div>';\n\nmsg.payload = msg.html;\n\nreturn msg;`,
      "outputs": 1,
      "timeout": "",
      "noerr": 0,
      "initialize": "",
      "finalize": "",
      "libs": [],
      "x": 280,
      "y": 60,
      "wires": [
        [
          "send_email",
          "postgres_reject"
        ]
      ]
    });

    workflow.push({
      "id": "postgres_reject",
      "type": "postgresql",
      "z": tabId,
      "name": "New Entry to DB",
      "query": "INSERT INTO approval_request (workflow_id, request_data, status, current_level, total_levels,requestid,remarks, approver_email,candidate_Email,created_at) VALUES ($1, $2, $3, $4, $5,$6, $7,$8,$9,now());",
      "postgreSQLConfig": "4521",
      "split": false,
      "rowsPerMsg": 1,
      "outputs": 1,
      "x": 500,
      "y": 100,
      "wires": [
        [
          "http_response"
        ]
      ]
    });

    workflow.push({
      "id": "http_in_manager_0",
      "type": "http in",
      "z": tabId,
      "name": "Approver Decision",
      "url": "/api/approverDecision",
      "method": "post",
      "upload": false,
      "swaggerDoc": "",
      "x": 90,
      "y": 360,
      "wires": [
        [
          "Logic_0"
        ]
      ]
    });

    workflow.push({
      "id": "decision_0",
      "type": "function",
      "z": tabId,
      "name": "Check Approver Decision",
      "func": "node.warn(msg);\n// Extract first payload item if array\nmsg.payload = Array.isArray(msg.payload) ? msg.payload[0] : msg.payload;\n\nconst { total_levels, current_level, status, candidateEmail } = msg.payload;\n\n// Determine new status and level\nif (status === \"Approved\") {\n    msg.payload.status = (total_levels - current_level > 1) ? \"Pending\" : \"Completed\";\n    msg.payload.current_level = current_level + 1;\n} \nelse if (status === \"Rejected\") {\n    msg.payload.status = \"Rejected\";\n    msg.payload.approverEmail = candidateEmail;\n}\n\n// Prepare parameters for PostgreSQL update\nmsg.params = [\n    msg.payload.status,\n    msg.payload.current_level,\n    msg.payload.requestid\n];\n\n\n// Prepare email content\nmsg.request_id = msg.payload.requestid; // Use the dynamic requestId\nmsg.topic = \"Workflow \" + msg.request_id; // Use string concatenation instead of template literals\nmsg.to = msg.payload.approverEmail; // || \"herig68683@cybtric.com\";\n\nmsg.html = `\n  <div style=\"font-family: Arial, sans-serif; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;\">\n    <h2 style=\"color: #2c3e50;\">Workflow Request Update</h2>\n    <p style=\"font-size: 16px;\">Request ${msg.request_id} is ${msg.payload.status}. Please click the <a href =\"http://ec2-52-91-38-126.compute-1.amazonaws.com:9000\"> Link </a> to approve or reject </p>\n\n    <table style=\"width: 100%; border-collapse: collapse; margin-top: 10px;\">\n      <tr>\n        <td style=\"padding: 10px; border: 1px solid #ddd; background-color: #ecf0f1;\"><strong>Request ID:</strong></td>\n        <td style=\"padding: 10px; border: 1px solid #ddd;\">${msg.request_id}</td>\n      </tr>\n      <tr>\n        <td style=\"padding: 10px; border: 1px solid #ddd; background-color: #ecf0f1;\"><strong>Status:</strong></td>\n        <td style=\"padding: 10px; border: 1px solid #ddd; color: ${msg.payload.status === 'Completed' ? 'green' : 'red'};\">\n          <strong>${msg.payload.status}</strong>\n        </td>\n      </tr>\n    </table>\n\n    <p style=\"margin-top: 15px; font-size: 14px; color: #7f8c8d;\">This is an automated message. Please do not reply.</p>\n  </div>\n`;\n\nmsg.payload = msg.html;\nnode.warn(msg);\nreturn msg; // Send msg to the first output (for true case)\n\n            ",
      "outputs": 1,
      "timeout": "",
      "noerr": 0,
      "initialize": "",
      "finalize": "",
      "libs": [],
      "x": 550,
      "y": 360,
      "wires": [
        [
          "postgres_insert_approve_0",
          "send_email"
        ]
      ]
    });

    workflow.push({
      "id": "send_email",
      "type": "e-mail",
      "z": tabId,
      "server": "sandbox.smtp.mailtrap.io",
      "port": "2525",
      "authtype": "BASIC",
      "saslformat": false,
      "token": "oauth2Response.access_token",
      "username": "a69fb4ce8de9ed",
      "password": "8dc8d2e38765cc",
      "secure": false,
      "tls": false,
      "name": "",
      "dname": "",
      "x": 1030,
      "y": 60,
      "wires": []
    });

    workflow.push({
      "id": "postgres_insert_approve_0",
      "type": "postgresql",
      "z": tabId,
      "name": "Update DB",
      "query": "UPDATE approval_request SET status = $1, current_level = $2, created_at = NOW() WHERE requestid = $3;",
      "postgreSQLConfig": "4521",
      "split": false,
      "rowsPerMsg": 1,
      "outputs": 1,
      "x": 810,
      "y": 360,
      "wires": [
        [
          "http_response"
        ]
      ]
    });

    workflow.push({
      "id": "http_response",
      "type": "http response",
      "z": tabId,
      "name": "HTTP Response",
      "statusCode": "200",
      "headers": {},
      "x": 1060,
      "y": 200,
      "wires": []
    });

    workflow.push({
      "id": "Logic_0",
      "type": "function",
      "z": tabId,
      "name": "prepare_posgres",
      "func": "msg.params = [msg.payload.requestid, msg.payload.workflowName, msg.payload.status];\nnode.warn(msg);\nreturn msg;\n",
      "outputs": 1,
      "timeout": 0,
      "noerr": 0,
      "initialize": "",
      "finalize": "",
      "libs": [],
      "x": 290,
      "y": 360,
      "wires": [
        [
          "postgres_query_0"
        ]
      ]
    });

    workflow.push({
      "id": "postgres_query_0",
      "type": "postgresql",
      "z": tabId,
      "name": "postgres",
      "query": "WITH level_check AS (\n  SELECT \n    current_level,\n    total_levels,\n    approver_email,\n    candidate_Email\n  FROM approval_request\n  WHERE requestid = $1\n  LIMIT 1\n),\nemail_data AS (\n  SELECT \n    CASE \n      WHEN (SELECT (total_levels - current_level) > 1 FROM level_check LIMIT 1) THEN\n        TRIM(BOTH '\"' FROM (\n          SPLIT_PART(\n            REPLACE(REPLACE((SELECT approver_email FROM level_check LIMIT 1), '{', ''), '}', ''),\n            ',',\n            (SELECT current_level FROM level_check LIMIT 1) + 1\n          )\n        ))\n      ELSE (SELECT candidate_Email FROM level_check LIMIT 1)\n    END AS extracted_email\n)\nSELECT\n  $1::integer AS \"requestid\",\n  $2::text AS \"workflowName\",\n  (SELECT extracted_email FROM email_data LIMIT 1) AS \"approverEmail\",\n  (SELECT current_level FROM level_check LIMIT 1) AS \"current_level\",\n  (SELECT total_levels FROM level_check LIMIT 1) AS \"total_levels\",\n  (SELECT candidate_email FROM level_check LIMIT 1) AS \"candidateEmail\",\n  $3::text AS \"status\";",
      "postgreSQLConfig": "4521",
      "split": false,
      "rowsPerMsg": 1,
      "outputs": 1,
      "x": 370,
      "y": 420,
      "wires": [
        [
          "decision_0"
        ]
      ]
    });


    workflow.push({
      "id": "4521",
        "type": "postgreSQLConfig",
        "z": tabId,
        "name": "PostgreSQL Config",
        "host": "52.91.38.126",
        "port": 5433,
        "database": "nodered_db",
        "ssl": false,
        "max": 10,
        "user": "nodered_user",
        "password": "nodered_password"
    });






    //******************************************* */


    // PostgreSQL Config Node
    // workflow.push({
    //   id: idValue,
    //   type: "postgreSQLConfig",
    //   z: tabId,
    //   name: "PostgreSQL Config",
    //   host: "52.91.38.126", // Replace with your PostgreSQL host
    //   port: 5433, // Replace with your PostgreSQL port
    //   database: "nodered_db", // Replace with your database name
    //   ssl: false, // Set to true if using SSL
    //   user: "nodered_user", // Replace with your PostgreSQL username
    //   password: "nodered_password", // Replace with your PostgreSQL password
    //   max: 10, // Maximum number of connections in the pool
    //   idleTimeoutMillis: 1000, // Idle connection timeout
    //   connectionTimeoutMillis: 10000, // Connection timeout
    //   x: 320, // X position in the Node-RED editor
    //   y: 60, // Y position in the Node-RED editor
    // });

    // workflow.push({
    //   "id": tabId,
    //   "type": "tab",
    //   "label": workflowName

    // });

    // workflow.push({

    //   "id": "http_in_create",
    //   "type": "http in",
    //   z: tabId,
    //   "name": "Initiate Workflow",
    //   "url": "/api/initiateWorkflow",
    //   "method": "post",
    //   "upload": false,
    //   "swaggerDoc": "",
    //   "x": 100,
    //   "y": 100,
    //   "wires": [[`prepare_email`, 'manager_0']]
    // });


    // workflow.push(
    //   {
    //     id: `prepare_email`,
    //     type: "function",
    //     z: tabId,
    //     name: "prepare_email",
    //     func: `
 
    //              // Check if the form is completed
    //            if (msg.payload.formCreated === true) {
    //              // Ensure proper JSON structure for request_data
    //              let requestData = {
    //                workflowName: msg.payload.workflowName || "Unknown Workflow",
    //                approver: msg.payload.approverEmail || "Unknown approver"
    //              };
           
    //              // Set status based on whether it's the last level
                 
    //              // Prepare the parameters for the PostgreSQL query
    //              msg.params = [
    //                ${workflow_id}, // workflow_id
    //                JSON.stringify(requestData), // Ensure request_data is properly stringified
    //                msg.payload.status, // status (either "Completed" or "Pending")
    //                0, // current_level
    //                ${managers.length}, // total_levels
    //                msg.payload.requestid, // requestid
    //                "NA", // remarks
    //                msg.payload.manager_email
    //              ];
           
    //              // Prepare email content
    //              msg.request_id = msg.payload.requestid; // Use the dynamic requestId
    //              msg.topic = "Workflow " + msg.request_id; // Use string concatenation instead of template literals
    //              msg.to = msg.payload.approverEmail; // || "herig68683@cybtric.com";
           
    //              msg.html = \`
    //                <div style="font-family: Arial, sans-serif; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
    //                  <h2 style="color: #2c3e50;">Workflow Request Update</h2>
    //                  <p style="font-size: 16px;">Workflow \${msg.request_id} is \${msg.payload.status}. Please click the <a href ="#"> Link </a> to approve or reject </p>
           
           
    //                  <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
    //                    <tr>
    //                      <td style="padding: 10px; border: 1px solid #ddd; background-color: #ecf0f1;"><strong>Request ID:</strong></td>
    //                      <td style="padding: 10px; border: 1px solid #ddd;">\${msg.request_id}</td>
    //                    </tr>
    //                    <tr>
    //                      <td style="padding: 10px; border: 1px solid #ddd; background-color: #ecf0f1;"><strong>Status:</strong></td>
    //                      <td style="padding: 10px; border: 1px solid #ddd; color: \${msg.payload.status === 'Completed' ? 'green' : 'red'};">
    //                        <strong>\${msg.payload.status}</strong>
    //                      </td>
    //                    </tr>
    //                  </table>
           
    //                  <p style="margin-top: 15px; font-size: 14px; color: #7f8c8d;">This is an automated message. Please do not reply.</p>
    //                </div>
           
    //              \`;
           
    //              msg.payload = msg.html;
           
    //              return msg;
    //          }
    //          `,
    //     outputs: 2,
    //     x: 310,
    //     y: 180,
    //     "wires": [
    //       ["send_email", "postgres_insert"],  // First output point
    //       ["postgres_reject"]                 // Second output point
    //     ]
    //   }
    // );

    // workflow.push({
    //   id: `postgres_insert`,
    //   type: "postgresql",
    //   z: tabId,
    //   name: `PostgreSQL(Approve)`,
    //   query: "INSERT INTO approval_request (workflow_id, request_data, status, current_level, total_levels, requestid, remarks,manager_email, created_at) VALUES ($1, $2, $3, $4, $5,$6,$7,$8, now());",
    //   postgreSQLConfig: idValue, // Reference the PostgreSQL config node
    //   split: false,
    //   rowsPerMsg: 1,
    //   outputs: 1,
    //   x: 110, // Adjust positioning dynamically
    //   y: 120,
    //   wires: [], // No further connections needed
    // });


    // workflow.push({
    //   id: `postgres_reject`,
    //   type: "postgresql",
    //   z: tabId,
    //   name: `PostgreSQL(Reject)`,
    //   query: "INSERT INTO approval_request (workflow_id, request_data, status, current_level, total_levels,requestid,remarks, manager_email,created_at) VALUES ($1, $2, $3, $4, $5,$6, $7,$8,now());",
    //   //postgreSQLConfig: idValue, // Reference the PostgreSQL config node
    //   split: false,
    //   rowsPerMsg: 1,
    //   outputs: 1,
    //   x: 120, // Adjust positioning dynamically
    //   y: 240,
    //   wires: [], // No further connections needed
    // });


    // managers.forEach((manager, index) => {

    //   workflow.push({
    //     id: `manager_${index}`,
    //     type: "function",
    //     z: tabId,
    //     name: `${manager.name} Approval`,
    //     func: `
    //            // Add workflowName and approverEmail to the msg object
    //            msg.workflowName = msg.payload.workflowName;
    //            msg.approverEmail = msg.payload.approverEmail;
               
    //            // Set formCompleted here
    //            //msg.payload.formCompleted = true; // Replace with your logic if needed
           
    //            return msg;
    //          `,
    //     outputs: 1,
    //     x: 300,
    //     y: 180,
    //     wires: index === 0
    //       ? [[`decision_${index}`, "http_response"]]  // Connect http_response only for the first manager
    //       : [[`decision_${index}`]]
    //   });



    //   workflow.push({
    //     id: `http_in_manager_${index}`,
    //     type: "http in",
    //     z: tabId,
    //     name: `${manager.name} Decision`,
    //     url: `/api/level${index + 1}Decision`, // Dynamic URL
    //     method: "post",
    //     upload: false,
    //     swaggerDoc: "",
    //     x: 100 + index * 200, // Adjust positioning dynamically
    //     y: 100,
    //     wires: [[`Logic_${index}`]], // Connect to the corresponding manager node
    //   });


    //   // Check Form Completed Node (Function Node)
    //   workflow.push({
    //     id: `decision_${index}`,
    //     type: "function",
    //     z: tabId,
    //     name: `Check ${manager.name} Decision`,
    //     func: `
    //            // Check if the form is completed
    //            if (msg.payload.formCompleted === true) {
    //              // Ensure proper JSON structure for request_data
    //              let requestData = {
    //                workflowName: msg.payload.workflowName || "Unknown Workflow",
    //                approver: msg.payload.approverEmail || "Unknown approver"
    //              };
           
    //              // Set status based on whether it's the last level
    //              msg.payload.status = ${index === managers.length - 1 ? '"Completed"' : '"Pending"'};
    //              //test
           
    //              // Prepare the parameters for the PostgreSQL query
    //              msg.params = [
 
    //                msg.payload.status,     // $1 - status
    //                ${index + 1},          // $2 - current_level
    //                msg.payload.requestid  // $3 - requestid (must match the WHERE clause)
 
 
    //                // ${workflow_id}, // workflow_id
    //                // JSON.stringify(requestData), // Ensure request_data is properly stringified
    //                // msg.payload.status, // status (either "Completed" or "Pending")
    //                // ${index + 1}, // current_level
    //                // ${managers.length}, // total_levels
    //                // msg.payload.requestid // requestid
 
    //              ];
           
 
    //              // Prepare email content
    //              msg.request_id = msg.payload.requestid; // Use the dynamic requestId
    //              msg.topic = "Workflow " + msg.request_id; // Use string concatenation instead of template literals
    //              msg.to = msg.payload.approverEmail; // || "herig68683@cybtric.com";
           
    //              msg.html = \`
    //                <div style="font-family: Arial, sans-serif; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
    //                  <h2 style="color: #2c3e50;">Workflow Request Update</h2>
    //                  <p style="font-size: 16px;">Workflow \${msg.request_id} is \${msg.payload.status}. Please click the <a href ="#"> Link </a> to approve or reject </p>
           
    //                  <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
    //                    <tr>
    //                      <td style="padding: 10px; border: 1px solid #ddd; background-color: #ecf0f1;"><strong>Request ID:</strong></td>
    //                      <td style="padding: 10px; border: 1px solid #ddd;">\${msg.request_id}</td>
    //                    </tr>
    //                    <tr>
    //                      <td style="padding: 10px; border: 1px solid #ddd; background-color: #ecf0f1;"><strong>Status:</strong></td>
    //                      <td style="padding: 10px; border: 1px solid #ddd; color: \${msg.payload.status === 'Completed' ? 'green' : 'red'};">
    //                        <strong>\${msg.payload.status}</strong>
    //                      </td>
    //                    </tr>
    //                  </table>
           
    //                  <p style="margin-top: 15px; font-size: 14px; color: #7f8c8d;">This is an automated message. Please do not reply.</p>
    //                </div>
    //              \`;
           
    //              msg.payload = msg.html;
           
    //              return [msg, null]; // Send msg to the first output (for true case)
    //            } else {
    //              return [null, msg]; // Send msg to the second output (for false case)
    //            }
    //          `,
    //     outputs: 2,
    //     x: 220,
    //     y: 160 + index * 80,
    //     wires: [
    //       index === managers.length - 1
    //         ? [`postgres_insert_approve_${index}`, "send_email", "http_response"] // Last manager (approval)
    //         : [`postgres_insert_approve_${index}`, "send_email", "http_response", `manager_${index + 1}`], // Not last manager (approval)
    //       index === managers.length - 1
    //         ? [`postgres_insert_reject_${index}`, "http_response"] // Last manager (rejection)
    //         : [`postgres_insert_reject_${index}`, "http_response"] // Not last manager (rejection)
    //     ]
    //   });
    //   // Approval email node
    //   workflow.push({
    //     id: `send_email`,
    //     "type": "e-mail",
    //     "z": tabId,
    //     //"name": "wameya7577@excederm.com",
    //     "server": "sandbox.smtp.mailtrap.io",
    //     "port": "2525",
    //     "username": "a69fb4ce8de9ed",
    //     "password": "8dc8d2e38765cc",
    //     //"to": "wameya7577@excederm.com",
    //     "subject": "Workflow Completed",
    //     "body": "{{payload.html}}",
    //     "x": 770,
    //     "y": 150,
    //     "wires": []
    //   });

    //   workflow.push({

    //     id: `postgres_insert_approve_${index}`,
    //     type: "postgresql",
    //     z: tabId,
    //     name: `Insert into PostgreSQL(Approve) - ${manager.name}`,
    //     //query: "INSERT INTO approval_request (workflow_id, request_data, status, current_level, total_levels,requestid, created_at) VALUES ($1, $2, $3, $4, $5,$6, now());",

    //     query: "UPDATE approval_request SET status = $1, current_level = $2, created_at = NOW() WHERE requestid = $3;",
    //     postgreSQLConfig: idValue, // Reference the PostgreSQL config node
    //     split: false,
    //     rowsPerMsg: 1,
    //     outputs: 1,
    //     x: 1100 + index * 200, // Adjust positioning dynamically
    //     y: 120,
    //     wires: [], // No further connections needed
    //   });

    //   workflow.push({
    //     id: `postgres_insert_reject_${index}`,
    //     type: "postgresql",
    //     z: tabId,
    //     name: `Insert into PostgreSQL(Reject) - ${manager.name}`,
    //     query: "UPDATE approval_request SET status = $1, current_level = $2, updated_at = NOW() WHERE requestid = $3;",
    //     postgreSQLConfig: idValue, // Reference the PostgreSQL config node
    //     split: false,
    //     rowsPerMsg: 1,
    //     outputs: 1,
    //     x: 1100 + index * 200, // Adjust positioning dynamically
    //     y: 240,
    //     wires: [], // No further connections needed
    //   });



    //   workflow.push({

    //     "id": "http_response",
    //     "type": "http response",
    //     z: tabId,
    //     "name": "HTTP Response",
    //     "statusCode": "200",
    //     "headers": {},
    //     "x": 500,
    //     "y": 100,
    //     "wires": []
    //   })

    //   workflow.push({
    //     "id": `Logic_${index}`,
    //     "type": "function",
    //     z: tabId,
    //     "name": `Logic_${index}`,
    //     "func": "msg.params = [msg.payload.requestid, msg.payload.workflowName, msg.payload.formCompleted, msg.payload.status];\nnode.warn(msg);\nreturn msg;\n",
    //     "outputs": 2,
    //     "timeout": 0,
    //     //"noerr": 0,
    //     "initialize": "",
    //     "finalize": "",
    //     "libs": [],
    //     "x": 140,
    //     "y": 340,
    //     "wires": [
    //       [
    //         `decision_${index}`
    //       ],
    //       [
    //         `postgres_query_${index}`
    //       ]
    //     ]
    //   })

    //   workflow.push({
    //     "id": `postgres_query_${index}`,
    //     "type": "postgresql",
    //     z: tabId,
    //     "name": `postgres_${index}`,
    //     "query": "WITH level_check AS (\n  SELECT \n    current_level,\n    total_levels,\n    manager_email\n  FROM approval_request\n  WHERE requestid = $1\n  LIMIT 1\n),\nemail_data AS (\n  SELECT \n    CASE \n      WHEN (SELECT (total_levels - current_level) > 1 FROM level_check LIMIT 1) THEN\n        TRIM(BOTH '\"' FROM (\n          SPLIT_PART(\n            REPLACE(REPLACE((SELECT manager_email FROM level_check LIMIT 1), '{', ''), '}', ''),\n            ',',\n            (SELECT current_level FROM level_check LIMIT 1) + 1\n          )\n        ))\n      ELSE ''\n    END AS extracted_email\n)\nSELECT\n  $1::integer AS \"requestid\",\n  $2::text AS \"workflowName\",\n  (SELECT extracted_email FROM email_data LIMIT 1) AS \"approverEmail\",\n  $3::boolean AS \"formCompleted\",\n  $4::text AS \"status\";",
    //     "postgreSQLConfig": idValue,
    //     "split": false,
    //     "rowsPerMsg": 1,
    //     "outputs": 1,
    //     "x": 250,
    //     "y": 400,
    //     "wires": [
    //       [
    //         `decision_${index}`
    //       ]
    //     ]
    //   })

    // });


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
      {/* <div className="manager-list">
        {managers.map((manager, index) => (
          <div key={index} className="manager-item">
            
            <span className="level-label">{manager.name}</span>

            
            <input
              type="text"
              placeholder="Field 1"
              style={{ marginRight: '8px' }}
            />

            
            <input
              type="text"
              placeholder="Field 2"
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
      </div> */}
      <button className="submit" onClick={handleSubmit} style={{ fontSize: '16px', padding: '12px 24px' }}>
        Submit
      </button>
    </Styles>
  );
}
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

  const [workflowName, setWorkflowName] = useState(`Workflow-${Math.floor(Math.random() * 1000)}`);
  const [candidateEmail, setCandidateEmail] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [hrbpEmail, setHrbpEmail] = useState('');

  const handleSubmit = async () => {
    const workflowJson = generateWorkflowJson(workflowName, candidateEmail, managerEmail, hrbpEmail);
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

  const generateWorkflowJson = (workflowName, candidateEmail, managerEmail, hrbpEmail) => {
    const workflow = [];
    const tabId = "e0ba68613f04424c";
  
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
        id: "inject_start",
        type: "inject",
        z: tabId,
        name: "Start Request",
        props: [{ p: "payload" }],
        payload: JSON.stringify({
          requestId: 183,
          status: "Pending",
          candidate: candidateEmail,
        }),
        payloadType: "json",
        x: 110,
        y: 120,
        wires: [["candidate_node"]],
      });

    workflow.push({
        id: "candidate_node",
        type: "function",
        z: tabId,
        name: "Candidate",
        func: `
          // Add workflowName and candidateEmail to the msg object
          msg.workflowName = "${workflowName}";
          msg.candidateEmail = "${candidateEmail}";
          msg.payload.candidate = "${candidateEmail}";
      
          // Set formCompleted here
          msg.payload.formCompleted = true; // Replace with your logic if needed
      
          return msg;
        `,
        outputs: 1,
        x: 300,
        y: 180,
        wires: [["check_form_completed"]],
      });
  
    // Check Form Completed Node (Function Node)
    // Check Form Completed Node (Function Node)
    workflow.push({
        id: "check_form_completed",
        type: "function",
        z: tabId,
        name: "Check if the form completed",
        func: `
          // Check if the form is completed
          if (msg.payload.formCompleted === true) {
            // Prepare the parameters for the PostgreSQL query
            msg.params = [
              2, // user_id
              JSON.stringify({ workflowName: msg.workflowName, candidate: msg.candidateEmail }), // request_data
              "Completed", // status
              1, // current_level
              5 // total_levels
            ];
            return [msg, null]; // Send msg to the first output (for true case)
          } else {
            return [null, msg]; // Send msg to the second output (for false case)
          }
        `,
        outputs: 2,
        x: 700,
        y: 180,
        wires: [
          ["postgres_insert_candidate_approve", "manager_node"], // True case
          ["postgres_insert_candidate_reject"] // False case
        ],
      });


  
    // PostgreSQL Insert Node
    workflow.push({
        id: "postgres_insert_candidate_approve",
        type: "postgresql",
        z: tabId,
        name: "Insert into PostgreSQL(Approve)",
        query: "INSERT INTO approval_request (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
        postgreSQLConfig: "7b9ec91590d534cc", // Reference the PostgreSQL config node
        split: false,
        rowsPerMsg: 1,
        outputs: 1,
        x: 1100,
        y: 120,
        wires: [],
    });

    // PostgreSQL Insert Node
    workflow.push({
        id: "postgres_insert_candidate_reject",
        type: "postgresql",
        z: tabId,
        name: "Insert into PostgreSQL(Reject)",
        query: "INSERT INTO approval_request (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
        postgreSQLConfig: "7b9ec91590d534cc", // Reference the PostgreSQL config node
        split: false,
        rowsPerMsg: 1,
        outputs: 1,
        x: 1100,
        y: 120,
        wires: [],
    });

    workflow.push({
        id: "manager_node",
        type: "function",
        z: tabId,
        name: "Manager",
        func: `
          // Add candidate details to the msg object
          msg.candidateEmail = "${candidateEmail}";
          msg.workflowName = "${workflowName}";
          msg.payload.candidate = "${candidateEmail}";
          return msg;
        `,
        outputs: 1,
        x: 900,
        y: 120,
        wires: [["check_manager_decision"]],
      });

      workflow.push({
        id: "check_manager_decision",
        type: "function",
        z: tabId,
        name: "Check manager decision",
        func: `
          // Check if the form is completed
          if (msg.payload.formCompleted === true) {
            // Manager approves the request
            msg.payload.managerDecision = "Approved"; // Add manager's decision to the payload
            msg.params = [
              2, // user_id
              JSON.stringify({ workflowName: msg.workflowName, candidate: msg.candidateEmail }), // request_data
              "Approved", // status
              2, // current_level
              5 // total_levels
            ];
            return [msg, null]; // Send msg to the first output (for approval)
          } else {
            // Manager rejects the request
            msg.payload.managerDecision = "Rejected"; // Add manager's decision to the payload
            msg.params = [
              2, // user_id
              JSON.stringify({ workflowName: msg.workflowName, candidate: msg.candidateEmail }), // request_data
              "Rejected", // status
              2, // current_level
              5 // total_levels
            ];
            return [null, msg]; // Send msg to the second output (for rejection)
          }
        `,
        outputs: 2,
        x: 1100,
        y: 180,
        wires: [
          ["postgres_insert_manager_approve", "hrbp_node"], // True case (Approved)
          ["postgres_insert_manager_reject"] // False case (Rejected)
        ],
      });
    
    // // PostgreSQL Insert Node
    workflow.push({
        id: "postgres_insert_manager_approve",
        type: "postgresql",
        z: tabId,
        name: "Insert into PostgreSQL(Approve)",
        query: "INSERT INTO approval_request (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
        postgreSQLConfig: "7b9ec91590d534cc", // Reference the PostgreSQL config node
        split: false,
        rowsPerMsg: 1,
        outputs: 1,
        x: 1100,
        y: 120,
        wires: [],
    });

    //  // PostgreSQL Insert Node
     workflow.push({
        id: "postgres_insert_manager_reject",
        type: "postgresql",
        z: tabId,
        name: "Insert into PostgreSQL(Reject)",
        query: "INSERT INTO approval_request (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
        postgreSQLConfig: "7b9ec91590d534cc", // Reference the PostgreSQL config node
        split: false,
        rowsPerMsg: 1,
        outputs: 1,
        x: 1100,
        y: 120,
        wires: [],
    });


     workflow.push({
        id: "hrbp_node",
        type: "function",
        z: tabId,
        name: "HRBP",
        func: `
          // Add candidate details to the msg object
          msg.candidateEmail = "${candidateEmail}";
          msg.workflowName = "${workflowName}";
          msg.payload.candidate = "${candidateEmail}";
          return msg;
        `,
        outputs: 1,
        x: 1500,
        y: 120,
        wires: [["check_hrbp_decision"]],
      });

      workflow.push({
        id: "check_hrbp_decision",
        type: "function",
        z: tabId,
        name: "Check HRBP decision",
        func: `
          // Check if the manager has approved the request
          if (msg.payload.managerDecision === "Approved") {
            // HRBP proceeds with approval
            msg.payload.hrbpDecision = "Approved"; // Add HRBP's decision to the payload
            msg.params = [
              2, // user_id
              JSON.stringify({ workflowName: msg.workflowName, candidate: msg.candidateEmail }), // request_data
              "Approved", // status
              3, // current_level
              5 // total_levels
            ];
            return [msg, null]; // Send msg to the first output (for approval)
          } else {
            // HRBP rejects the request
            msg.payload.hrbpDecision = "Rejected"; // Add HRBP's decision to the payload
            msg.params = [
              2, // user_id
              JSON.stringify({ workflowName: msg.workflowName, candidate: msg.candidateEmail }), // request_data
              "Rejected", // status
              3, // current_level
              5 // total_levels
            ];
            return [null, msg]; // Send msg to the second output (for rejection)
          }
        `,
        outputs: 2,
        x: 1700,
        y: 180,
        wires: [
          ["postgres_insert_hrbp_approve", "candidate_signature_node"], // True case (Approved)
          ["postgres_insert_hrbp_reject"] // False case (Rejected)
        ],
      });

    

      // PostgreSQL Insert Node
    workflow.push({
        id: "postgres_insert_hrbp_approve",
        type: "postgresql",
        z: tabId,
        name: "Insert into PostgreSQL(Approve)",
        query: "INSERT INTO approval_request (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
        postgreSQLConfig: "7b9ec91590d534cc", // Reference the PostgreSQL config node
        split: false,
        rowsPerMsg: 1,
        outputs: 1,
        x: 1100,
        y: 120,
        wires: [],
    });

     // PostgreSQL Insert Node
     workflow.push({
        id: "postgres_insert_hrbp_reject",
        type: "postgresql",
        z: tabId,
        name: "Insert into PostgreSQL(Reject)",
        query: "INSERT INTO approval_request (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
        postgreSQLConfig: "7b9ec91590d534cc", // Reference the PostgreSQL config node
        split: false,
        rowsPerMsg: 1,
        outputs: 1,
        x: 1100,
        y: 120,
        wires: [],
    });

    workflow.push({
        id: "candidate_signature_node",
        type: "function",
        z: tabId,
        name: "Candidate Signature",
        func: `
          // Add candidate details to the msg object
          msg.payload = {};
          msg.payload.candidate = "${candidateEmail}";
          msg.payload.approval = "Approved"; // Set approval status (replace with actual logic if needed)
          return msg;
        `,
        outputs: 1,
        x: 2100,
        y: 120,
        wires: [["check_candidate_signature"]],
      });


      workflow.push({
        id: "check_candidate_signature",
        type: "function",
        z: tabId,
        name: "Check Candidate Signature",
        func: `
          // Check if the candidate has approved the request
          if (msg.payload.approval === "Approved") {
            // Candidate approves the request
            msg.payload.candidateSignature = "Approved"; // Add candidate's signature decision to the payload
            msg.params = [
              2, // user_id
              JSON.stringify({ workflowName: msg.workflowName, candidate: msg.candidateEmail }), // request_data
              "Approved", // status
              4, // current_level (assuming this is the next level after HRBP)
              5 // total_levels
            ];
            return [msg, null]; // Send msg to the first output (for approval)
          } else {
            // Candidate rejects the request
            msg.payload.candidateSignature = "Rejected"; // Add candidate's signature decision to the payload
            msg.params = [
              2, // user_id
              JSON.stringify({ workflowName: msg.workflowName, candidate: msg.candidateEmail }), // request_data
              "Rejected", // status
              4, // current_level
              5 // total_levels
            ];
            return [null, msg]; // Send msg to the second output (for rejection)
          }
        `,
        outputs: 2,
        x: 2300,
        y: 120,
        wires: [
          ["postgres_insert_candidate_signature_approve", "manager_signature_node"], // Approved case
          ["postgres_insert_candidate_signature_reject"] // Rejected case
        ],
      });


      // Insert into PostgreSQL (Candidate Signature Approve)
    workflow.push({
        id: "postgres_insert_candidate_signature_approve",
        type: "postgresql",
        z: tabId,
        name: "Insert into PostgreSQL (Candidate Signature Approve)",
        query: "INSERT INTO public.approval_request (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
        params: "[2, {\"workflowName\": \"" + workflowName + "\", \"candidate\": \"" + candidateEmail + "\"}, \"Approved\", 4, 5]",
        postgreSQLConfig: "7b9ec91590d534cc", // Reference the PostgreSQL config node
        split: false,
        rowsPerMsg: 1,
        outputs: 1,
        x: 2500,
        y: 120,
        wires: [],
      });


      // Insert into PostgreSQL (Candidate Signature Reject)
    workflow.push({
        id: "postgres_insert_candidate_signature_reject",
        type: "postgresql",
        z: tabId,
        name: "Insert into PostgreSQL (Candidate Signature Reject)",
        query: "INSERT INTO public.approval_request (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
        params: "[2, {\"workflowName\": \"" + workflowName + "\", \"candidate\": \"" + candidateEmail + "\"}, \"Rejected\", 4, 5]",
        postgreSQLConfig: "7b9ec91590d534cc", // Reference the PostgreSQL config node
        split: false,
        rowsPerMsg: 1,
        outputs: 1,
        x: 2500,
        y: 180,
        wires: [],
      });

      workflow.push({
        id: "manager_signature_node",
        type: "function",
        z: tabId,
        name: "Manager Signature",
        func: `
          // Add manager details to the msg object
          msg.payload = {};
          msg.payload.manager = "${managerEmail}";
          msg.payload.approval = "Approved"; // Set approval status (replace with actual logic if needed)
          return msg;
        `,
        outputs: 1,
        x: 2700,
        y: 120,
        wires: [["check_manager_signature"]],
      });


      workflow.push({
        id: "check_manager_signature",
        type: "function",
        z: tabId,
        name: "Check Manager Signature",
        func: `
          // Check if the manager has approved the request
          if (msg.payload.approval === "Approved") {
            // Manager approves the request
            msg.payload.managerSignature = "Approved"; // Add manager's signature decision to the payload
            msg.params = [
              2, // user_id
              JSON.stringify({ workflowName: msg.workflowName, candidate: msg.candidateEmail }), // request_data
              "Approved", // status
              5, // current_level (assuming this is the final level)
              5 // total_levels
            ];
            return [msg, null]; // Send msg to the first output (for approval)
          } else {
            // Manager rejects the request
            msg.payload.managerSignature = "Rejected"; // Add manager's signature decision to the payload
            msg.params = [
              2, // user_id
              JSON.stringify({ workflowName: msg.workflowName, candidate: msg.candidateEmail }), // request_data
              "Rejected", // status
              5, // current_level
              5 // total_levels
            ];
            return [null, msg]; // Send msg to the second output (for rejection)
          }
        `,
        outputs: 2,
        x: 2900,
        y: 120,
        wires: [
          ["postgres_insert_manager_signature_approve", "set_status_completed"], // Approved case
          ["postgres_insert_manager_signature_reject"] // Rejected case
        ],
      });

      // PostgreSQL Insert Node for Manager Signature Approve
    workflow.push({
        id: "postgres_insert_manager_signature_approve",
        type: "postgresql",
        z: tabId,
        name: "Insert into PostgreSQL (Manager Signature Approve)",
        query: "INSERT INTO approval_request (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
        postgreSQLConfig: "7b9ec91590d534cc", // Reference the PostgreSQL config node
        split: false,
        rowsPerMsg: 1,
        outputs: 1,
        x: 3100,
        y: 120,
        wires: [], // No further action for approval
    });
    
    // PostgreSQL Insert Node for Manager Signature Reject
    workflow.push({
        id: "postgres_insert_manager_signature_reject",
        type: "postgresql",
        z: tabId,
        name: "Insert into PostgreSQL (Manager Signature Reject)",
        query: "INSERT INTO approval_request (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
        postgreSQLConfig: "7b9ec91590d534cc", // Reference the PostgreSQL config node
        split: false,
        rowsPerMsg: 1,
        outputs: 1,
        x: 3100,
        y: 180,
        wires: [], // No further action for rejection
    });

    workflow.push({
        id: "set_status_completed",
        type: "function",
        z: tabId,
        name: "Set Status Completed",
        func: `
          // Set the status to "Completed"
          msg.payload.status = "Completed";
          msg.payload.request_id = msg.payload?.requestId || "UnknownID"; // Ensure request_id is set
          msg.topic = \`Workflow \${msg.payload.request_id}\`; // Add a topic for debugging
          return msg;
        `,
        outputs: 1,
        x: 3300,
        y: 120,
        wires: [["postgres_insert_final"]],
      });

      workflow.push({
        id: "postgres_insert_final",
        type: "postgresql",
        z: tabId,
        name: "Insert into PostgreSQL (Final)",
        query: "INSERT INTO approval_request (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
        postgreSQLConfig: "7b9ec91590d534cc", // Reference the PostgreSQL config node
        split: false,
        rowsPerMsg: 1,
        outputs: 1,
        x: 3500,
        y: 120,
        wires: ["debug_output"], // No further action
      });




    // Debug Output Node
    workflow.push({
      id: "debug_output",
      type: "debug",
      z: tabId,
      name: "Debug Output",
      active: true,
      tosidebar: true,
      complete: "payload",
      x: 1300,
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
        <label>Candidate Email</label>
        <input
          type="text"
          value={candidateEmail}
          onChange={(e) => setCandidateEmail(e.target.value)}
          placeholder="Enter candidate email"
        />
      </div>
      <div className="form-group">
        <label>Manager Email</label>
        <input
          type="text"
          value={managerEmail}
          onChange={(e) => setManagerEmail(e.target.value)}
          placeholder="Enter manager email"
        />
      </div>
      <div className="form-group">
        <label>HRBP Email</label>
        <input
          type="text"
          value={hrbpEmail}
          onChange={(e) => setHrbpEmail(e.target.value)}
          placeholder="Enter HRBP email"
        />
      </div>
      <button onClick={handleSubmit}>Submit</button>
    </Styles>
  );
}
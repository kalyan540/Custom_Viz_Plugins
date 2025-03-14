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
          requestId: 123, 
          status: "Pending", 
          candidate: candidateEmail,
          formCompleted: true // Add formCompleted property
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
        func: `msg.payload.candidate = \"${candidateEmail}\";\nreturn msg;`, // Do not overwrite the payload
        outputs: 1,
        x: 300,
        y: 180,
        wires: [["check_form_completed"]],
      });
    
    workflow.push({
        id: "check_form_completed",
        type: "switch",
        z: tabId,
        name: "Check if the form completed",
        property: "payload.formCompleted",
        propertyType: "msg",
        rules: [
          { t: "eq", v: true, vt: "bool" },
          { t: "eq", v: false, vt: "bool" },
        ],
        outputs: 2,
        x: 700,
        y: 180,
        wires: [
          ["debug_approve", "postgres_insert_candidate_approve"],
        ],
    });

    workflow.push({
        id: "debug_approve",
        type: "debug",
        z: tabId,
        name: "Debug Approve",
        active: true,
        tosidebar: true,
        complete: "payload",
        x: 900,
        y: 120,
        wires: [],
      });



    // Insert into PostgreSQL (Candidate Approve)
    workflow.push({
        id: "postgres_insert_candidate_approve",
        type: "postgresql",
        z: tabId,
        name: "Insert into PostgreSQL (Candidate Approve)",
        query: "INSERT INTO public.approval_requests (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
        params: [
          2, // user_id
          JSON.stringify({ workflowName: workflowName, candidate: candidateEmail }), // request_data
          "Approved", // status
          1, // current_level
          5, // total_levels
        ],
        postgreSQLConfig: "7b9ec91590d534cc", // Reference the PostgreSQL config node
        split: false,
        rowsPerMsg: 1,
        outputs: 1,
        x: 1100,
        y: 120,
        wires: [["debug_output"]],
    });

    

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

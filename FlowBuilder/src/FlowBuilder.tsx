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

  .manager-list {
    margin-top: ${({ theme }) => theme.gridUnit * 3}px;
    max-height: 75px;
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
`;

export default function FlowBuilder(props: FlowBuilderProps) {
  const { height, width, apiEndpoint } = props;
  const rootElem = createRef<HTMLDivElement>();

  const [workflowName, setWorkflowName] = useState(`Workflow-${Math.floor(Math.random() * 1000)}`);
  const [candidate, setCandidate] = useState({ name: '', email: '' });
  const [manager, setManager] = useState({ name: '', email: '' });
  const [hrbp, setHrbp] = useState({ name: '', email: '' });

  const handleSubmit = async () => {
    const workflowJson = generateWorkflowJson(workflowName, candidate, manager, hrbp);
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

  const generateWorkflowJson = (workflowName, candidate, manager, hrbp) => {
    const workflow = [];
    const tabId = "e0ba68613f04424c";

    // Start node
    workflow.push({
      id: "inject_start",
      type: "inject",
      z: tabId,
      name: "Start Request",
      props: [{ p: "payload" }],
      payload: JSON.stringify({ requestId: 123, status: "Pending", candidate: candidate.email }),
      payloadType: "json",
      x: 110,
      y: 120,
      wires: [["check_form_completed"]],
    });

    // Check if the form is completed
    workflow.push({
      id: "check_form_completed",
      type: "function",
      z: tabId,
      name: "Check if the form completed",
      func: `msg.payload = {}; msg.payload.formCompleted = true;\nreturn msg;`,
      outputs: 1,
      x: 300,
      y: 120,
      wires: [["manager_decision"]],
    });

    // Manager decision
    workflow.push({
      id: "manager_decision",
      type: "function",
      z: tabId,
      name: "Check Manager Decision",
      func: `msg.payload = {}; msg.payload.approval = Math.random() > 0.5 ? \"Approved\" : \"Rejected\";\nmsg.payload.manager = \"${manager.name}\";\nreturn msg;`,
      outputs: 1,
      x: 500,
      y: 120,
      wires: [["hrbp_decision"]],
    });

    // HRBP decision
    workflow.push({
      id: "hrbp_decision",
      type: "function",
      z: tabId,
      name: "Check HRBP Decision",
      func: `msg.payload = {}; msg.payload.approval = Math.random() > 0.5 ? \"Approved\" : \"Rejected\";\nmsg.payload.hrbp = \"${hrbp.name}\";\nreturn msg;`,
      outputs: 1,
      x: 700,
      y: 120,
      wires: [["candidate_decision"]],
    });

    // Candidate decision
    workflow.push({
      id: "candidate_decision",
      type: "function",
      z: tabId,
      name: "Check Candidate Decision",
      func: `msg.payload = {}; msg.payload.approval = Math.random() > 0.5 ? \"Approved\" : \"Rejected\";\nmsg.payload.candidate = \"${candidate.name}\";\nreturn msg;`,
      outputs: 1,
      x: 900,
      y: 120,
      wires: [["manager_final_decision"]],
    });

    // Manager final decision
    workflow.push({
      id: "manager_final_decision",
      type: "function",
      z: tabId,
      name: "Check Manager Final Decision",
      func: `msg.payload = {}; msg.payload.approval = Math.random() > 0.5 ? \"Approved\" : \"Rejected\";\nmsg.payload.manager = \"${manager.name}\";\nreturn msg;`,
      outputs: 1,
      x: 1100,
      y: 120,
      wires: [["set_completed_status"]],
    });

    // Set completed status
    workflow.push({
      id: "set_completed_status",
      type: "function",
      z: tabId,
      name: "Set status to completed",
      func: `msg.payload.status = \"Completed\";\nmsg.payload.request_id = msg.payload?.requestId || \"UnknownID\";\nmsg.topic = \`Workflow \${msg.payload.request_id}\`;\nreturn msg;`,
      outputs: 1,
      x: 1300,
      y: 120,
      wires: [["postgres_insert"]],
    });

    // PostgreSQL Config Node
    workflow.push({
      id: "7b9ec91590d534cc",
      type: "postgreSQLConfig",
      z: tabId,
      name: "postgres",
      host: "52.91.38.126", // Replace with your PostgreSQL host
      hostFieldType: "str",
      port: 5433, // Replace with your PostgreSQL port
      portFieldType: "num",
      database: "nodered_db", // Replace with your database name
      databaseFieldType: "str",
      ssl: "false",
      sslFieldType: "bool",
      applicationName: "",
      applicationNameType: "str",
      max: 10,
      maxFieldType: "num",
      idle: 1000,
      idleFieldType: "num",
      connectionTimeout: 10000,
      connectionTimeoutFieldType: "num",
      user: "nodered_user", // Replace with your PostgreSQL username
      userFieldType: "str",
      password: "nodered_password", // Replace with your PostgreSQL password
      passwordFieldType: "str",
      x: 320,
      y: 60,
    });

    // PostgreSQL Insert Node
    workflow.push({
      id: "postgres_insert",
      type: "postgresql",
      z: tabId,
      name: "Insert into approval_requests",
      query: "INSERT INTO public.approval_requests (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
      params: "[2, {\"workflowName\": \"" + workflowName + "\", \"candidate\": " + JSON.stringify(candidate) + ", \"manager\": " + JSON.stringify(manager) + ", \"hrbp\": " + JSON.stringify(hrbp) + "}, \"{{payload.approval}}\", 1, 5]",
      postgreSQLConfig: "7b9ec91590d534cc", // Reference the PostgreSQL config node
      split: false,
      rowsPerMsg: 1,
      outputs: 1,
      x: 1500,
      y: 120,
      wires: [["debug_output"]],
    });

    // Debug node
    workflow.push({
      id: "debug_output",
      type: "debug",
      z: tabId,
      name: "Debug Output",
      active: true,
      tosidebar: true,
      console: false,
      tostatus: false,
      complete: "payload",
      targetType: "msg",
      statusVal: "",
      statusType: "auto",
      x: 1700,
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
          value={candidate.email}
          onChange={(e) => setCandidate({ ...candidate, email: e.target.value })}
          placeholder="Enter candidate email"
        />
      </div>
      <div className="form-group">
        <label>Manager Email</label>
        <input
          type="text"
          value={manager.email}
          onChange={(e) => setManager({ ...manager, email: e.target.value })}
          placeholder="Enter manager email"
        />
      </div>
      <div className="form-group">
        <label>HRBP Email</label>
        <input
          type="text"
          value={hrbp.email}
          onChange={(e) => setHrbp({ ...hrbp, email: e.target.value })}
          placeholder="Enter HRBP email"
        />
      </div>
      <button onClick={handleSubmit}>Submit</button>
    </Styles>
  );
}
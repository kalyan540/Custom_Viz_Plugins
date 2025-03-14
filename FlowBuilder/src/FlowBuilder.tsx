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
      wires: [["email_user", "candidate_node"]],
    });

    // Email to User
    // workflow.push({
    //   id: "email_user",
    //   type: "e-mail",
    //   z: tabId,
    //   name: "dihiwo5319@easipro.com",
    //   server: "sandbox.smtp.mailtrap.io", // Replace with your SMTP server
    //   port: 2525,
    //   secure: false,
    //   from: "noreply@example.com",
    //   to: candidate.email,
    //   subject: "Workflow Started",
    //   text: "Your workflow has started.",
    //   x: 300,
    //   y: 60,
    //   wires: [],
    // });
    workflow.push({
        id: "email_user",
        type: "e-mail",
        z: tabId,
        name: "dihiwo5319@easipro.com",
        server: "sandbox.smtp.mailtrap.io",
        port: "2525",
        username: "62753aa9883bbc",
        password: "a249d24a02ce4f",
        subject: "Workflow Completed",
        body: "{{payload.html}}",
        x: 770,
        y: 150,
        wires: [],
      });

    // Candidate node
    workflow.push({
      id: "candidate_node",
      type: "function",
      z: tabId,
      name: "Candidate",
      func: `msg.payload = {}; msg.payload.candidate = \"${candidate.name}\";\nreturn msg;`,
      outputs: 1,
      x: 300,
      y: 120,
      wires: [["check_form_completed"]],
    });

    // Check if the form is completed
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
      x: 500,
      y: 120,
      wires: [
        ["email_manager_approve", "postgres_insert_candidate_approve"],
        ["postgres_insert_candidate_reject"],
      ],
    });

    // Email to Manager (Approve)
    workflow.push({
      id: "email_manager_approve",
      type: "email",
      z: tabId,
      name: "Email to Manager (Approve)",
      server: "smtp.example.com", // Replace with your SMTP server
      port: 587,
      secure: false,
      from: "noreply@example.com",
      to: manager.email,
      subject: "Candidate Approved",
      text: "The candidate has approved the form.",
      x: 700,
      y: 60,
      wires: [],
    });

    // Insert into PostgreSQL (Candidate Approve)
    workflow.push({
      id: "postgres_insert_candidate_approve",
      type: "postgresql",
      z: tabId,
      name: "Insert into PostgreSQL (Candidate Approve)",
      query: "INSERT INTO public.approval_requests (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
      params: "[2, {\"workflowName\": \"" + workflowName + "\", \"candidate\": " + JSON.stringify(candidate) + "}, \"Approved\", 1, 5]",
      postgreSQLConfig: "7b9ec91590d534cc",
      split: false,
      rowsPerMsg: 1,
      outputs: 1,
      x: 700,
      y: 120,
      wires: [["manager_node"]],
    });

    // Insert into PostgreSQL (Candidate Reject)
    workflow.push({
      id: "postgres_insert_candidate_reject",
      type: "postgresql",
      z: tabId,
      name: "Insert into PostgreSQL (Candidate Reject)",
      query: "INSERT INTO public.approval_requests (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
      params: "[2, {\"workflowName\": \"" + workflowName + "\", \"candidate\": " + JSON.stringify(candidate) + "}, \"Rejected\", 1, 5]",
      postgreSQLConfig: "7b9ec91590d534cc",
      split: false,
      rowsPerMsg: 1,
      outputs: 1,
      x: 700,
      y: 180,
      wires: [],
    });

    // Manager node
    workflow.push({
      id: "manager_node",
      type: "function",
      z: tabId,
      name: "Manager",
      func: `msg.payload = {}; msg.payload.manager = \"${manager.name}\";\nreturn msg;`,
      outputs: 1,
      x: 900,
      y: 120,
      wires: [["check_manager_decision"]],
    });

    // Check Manager Decision
    workflow.push({
      id: "check_manager_decision",
      type: "switch",
      z: tabId,
      name: "Check Manager Decision",
      property: "payload.approval",
      propertyType: "msg",
      rules: [
        { t: "eq", v: "Approved", vt: "str" },
        { t: "eq", v: "Rejected", vt: "str" },
      ],
      outputs: 2,
      x: 1100,
      y: 120,
      wires: [
        ["email_hrbp_approve", "postgres_insert_manager_approve"],
        ["postgres_insert_manager_reject"],
      ],
    });

    // Email to HRBP (Approve)
    workflow.push({
      id: "email_hrbp_approve",
      type: "email",
      z: tabId,
      name: "Email to HRBP (Approve)",
      server: "smtp.example.com", // Replace with your SMTP server
      port: 587,
      secure: false,
      from: "noreply@example.com",
      to: hrbp.email,
      subject: "Manager Approved",
      text: "The manager has approved the form.",
      x: 1300,
      y: 60,
      wires: [],
    });

    // Insert into PostgreSQL (Manager Approve)
    workflow.push({
      id: "postgres_insert_manager_approve",
      type: "postgresql",
      z: tabId,
      name: "Insert into PostgreSQL (Manager Approve)",
      query: "INSERT INTO public.approval_requests (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
      params: "[2, {\"workflowName\": \"" + workflowName + "\", \"manager\": " + JSON.stringify(manager) + "}, \"Approved\", 2, 5]",
      postgreSQLConfig: "7b9ec91590d534cc",
      split: false,
      rowsPerMsg: 1,
      outputs: 1,
      x: 1300,
      y: 120,
      wires: [["hrbp_node"]],
    });

    // Insert into PostgreSQL (Manager Reject)
    workflow.push({
      id: "postgres_insert_manager_reject",
      type: "postgresql",
      z: tabId,
      name: "Insert into PostgreSQL (Manager Reject)",
      query: "INSERT INTO public.approval_requests (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
      params: "[2, {\"workflowName\": \"" + workflowName + "\", \"manager\": " + JSON.stringify(manager) + "}, \"Rejected\", 2, 5]",
      postgreSQLConfig: "7b9ec91590d534cc",
      split: false,
      rowsPerMsg: 1,
      outputs: 1,
      x: 1300,
      y: 180,
      wires: [],
    });

    // HRBP node
    workflow.push({
      id: "hrbp_node",
      type: "function",
      z: tabId,
      name: "HRBP",
      func: `msg.payload = {}; msg.payload.hrbp = \"${hrbp.name}\";\nreturn msg;`,
      outputs: 1,
      x: 1500,
      y: 120,
      wires: [["check_hrbp_decision"]],
    });

    // Check HRBP Decision
    workflow.push({
      id: "check_hrbp_decision",
      type: "switch",
      z: tabId,
      name: "Check HRBP Decision",
      property: "payload.approval",
      propertyType: "msg",
      rules: [
        { t: "eq", v: "Approved", vt: "str" },
        { t: "eq", v: "Rejected", vt: "str" },
      ],
      outputs: 2,
      x: 1700,
      y: 120,
      wires: [
        ["email_manager_hrbp_approve", "postgres_insert_hrbp_approve"],
        ["postgres_insert_hrbp_reject"],
      ],
    });

    // Email to Manager (HRBP Approve)
    workflow.push({
      id: "email_manager_hrbp_approve",
      type: "email",
      z: tabId,
      name: "Email to Manager (HRBP Approve)",
      server: "smtp.example.com", // Replace with your SMTP server
      port: 587,
      secure: false,
      from: "noreply@example.com",
      to: manager.email,
      subject: "HRBP Approved",
      text: "The HRBP has approved the form.",
      x: 1900,
      y: 60,
      wires: [],
    });

    // Insert into PostgreSQL (HRBP Approve)
    workflow.push({
      id: "postgres_insert_hrbp_approve",
      type: "postgresql",
      z: tabId,
      name: "Insert into PostgreSQL (HRBP Approve)",
      query: "INSERT INTO public.approval_requests (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
      params: "[2, {\"workflowName\": \"" + workflowName + "\", \"hrbp\": " + JSON.stringify(hrbp) + "}, \"Approved\", 3, 5]",
      postgreSQLConfig: "7b9ec91590d534cc",
      split: false,
      rowsPerMsg: 1,
      outputs: 1,
      x: 1900,
      y: 120,
      wires: [["candidate_signature_node"]],
    });

    // Insert into PostgreSQL (HRBP Reject)
    workflow.push({
      id: "postgres_insert_hrbp_reject",
      type: "postgresql",
      z: tabId,
      name: "Insert into PostgreSQL (HRBP Reject)",
      query: "INSERT INTO public.approval_requests (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
      params: "[2, {\"workflowName\": \"" + workflowName + "\", \"hrbp\": " + JSON.stringify(hrbp) + "}, \"Rejected\", 3, 5]",
      postgreSQLConfig: "7b9ec91590d534cc",
      split: false,
      rowsPerMsg: 1,
      outputs: 1,
      x: 1900,
      y: 180,
      wires: [],
    });

    // Candidate Signature node
    workflow.push({
      id: "candidate_signature_node",
      type: "function",
      z: tabId,
      name: "Candidate Signature",
      func: `msg.payload = {}; msg.payload.candidate = \"${candidate.name}\";\nreturn msg;`,
      outputs: 1,
      x: 2100,
      y: 120,
      wires: [["check_candidate_signature"]],
    });

    // Check Candidate Signature
    workflow.push({
      id: "check_candidate_signature",
      type: "switch",
      z: tabId,
      name: "Check Candidate Signature",
      property: "payload.approval",
      propertyType: "msg",
      rules: [
        { t: "eq", v: "Approved", vt: "str" },
        { t: "eq", v: "Rejected", vt: "str" },
      ],
      outputs: 2,
      x: 2300,
      y: 120,
      wires: [
        ["email_manager_candidate_approve", "postgres_insert_candidate_signature_approve"],
        ["postgres_insert_candidate_signature_reject"],
      ],
    });

    // Email to Manager (Candidate Approve)
    workflow.push({
      id: "email_manager_candidate_approve",
      type: "email",
      z: tabId,
      name: "Email to Manager (Candidate Approve)",
      server: "smtp.example.com", // Replace with your SMTP server
      port: 587,
      secure: false,
      from: "noreply@example.com",
      to: manager.email,
      subject: "Candidate Signature Approved",
      text: "The candidate has signed the form.",
      x: 2500,
      y: 60,
      wires: [],
    });

    // Insert into PostgreSQL (Candidate Signature Approve)
    workflow.push({
      id: "postgres_insert_candidate_signature_approve",
      type: "postgresql",
      z: tabId,
      name: "Insert into PostgreSQL (Candidate Signature Approve)",
      query: "INSERT INTO public.approval_requests (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
      params: "[2, {\"workflowName\": \"" + workflowName + "\", \"candidate\": " + JSON.stringify(candidate) + "}, \"Approved\", 4, 5]",
      postgreSQLConfig: "7b9ec91590d534cc",
      split: false,
      rowsPerMsg: 1,
      outputs: 1,
      x: 2500,
      y: 120,
      wires: [["manager_signature_node"]],
    });

    // Insert into PostgreSQL (Candidate Signature Reject)
    // Insert into PostgreSQL (Candidate Signature Reject)
    workflow.push({
    id: "postgres_insert_candidate_signature_reject",
    type: "postgresql",
    z: tabId,
    name: "Insert into PostgreSQL (Candidate Signature Reject)",
    query: "INSERT INTO public.approval_requests (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
    params: "[2, {\"workflowName\": \"" + workflowName + "\", \"candidate\": " + JSON.stringify(candidate) + "}, \"Rejected\", 4, 5]",
    postgreSQLConfig: "7b9ec91590d534cc", // Reference the PostgreSQL config node
    split: false,
    rowsPerMsg: 1,
    outputs: 1,
    x: 2500,
    y: 180,
    wires: [], // No further connections after this node
  });

      // Manager Signature node
      workflow.push({
        id: "manager_signature_node",
        type: "function",
        z: tabId,
        name: "Manager Signature",
        func: `msg.payload = {}; msg.payload.manager = \"${manager.name}\";\nreturn msg;`,
        outputs: 1,
        x: 2700,
        y: 120,
        wires: [["check_manager_signature"]],
      });
  
      // Check Manager Signature
      workflow.push({
        id: "check_manager_signature",
        type: "switch",
        z: tabId,
        name: "Check Manager Signature",
        property: "payload.approval",
        propertyType: "msg",
        rules: [
          { t: "eq", v: "Approved", vt: "str" },
          { t: "eq", v: "Rejected", vt: "str" },
        ],
        outputs: 2,
        x: 2900,
        y: 120,
        wires: [
          ["postgres_insert_manager_signature_approve"],
          ["postgres_insert_manager_signature_reject"],
        ],
      });
  
      // Insert into PostgreSQL (Manager Signature Approve)
      workflow.push({
        id: "postgres_insert_manager_signature_approve",
        type: "postgresql",
        z: tabId,
        name: "Insert into PostgreSQL (Manager Signature Approve)",
        query: "INSERT INTO public.approval_requests (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
        params: "[2, {\"workflowName\": \"" + workflowName + "\", \"manager\": " + JSON.stringify(manager) + "}, \"Approved\", 5, 5]",
        postgreSQLConfig: "7b9ec91590d534cc",
        split: false,
        rowsPerMsg: 1,
        outputs: 1,
        x: 3100,
        y: 120,
        wires: [["set_status_completed"]],
      });
  
      // Insert into PostgreSQL (Manager Signature Reject)
      workflow.push({
        id: "postgres_insert_manager_signature_reject",
        type: "postgresql",
        z: tabId,
        name: "Insert into PostgreSQL (Manager Signature Reject)",
        query: "INSERT INTO public.approval_requests (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
        params: "[2, {\"workflowName\": \"" + workflowName + "\", \"manager\": " + JSON.stringify(manager) + "}, \"Rejected\", 5, 5]",
        postgreSQLConfig: "7b9ec91590d534cc",
        split: false,
        rowsPerMsg: 1,
        outputs: 1,
        x: 3100,
        y: 180,
        wires: [],
      });
  
      // Set Status Completed
      workflow.push({
        id: "set_status_completed",
        type: "function",
        z: tabId,
        name: "Set Status Completed",
        func: `msg.payload.status = \"Completed\";\nmsg.payload.request_id = msg.payload?.requestId || \"UnknownID\";\nmsg.topic = \`Workflow \${msg.payload.request_id}\`;\nreturn msg;`,
        outputs: 1,
        x: 3300,
        y: 120,
        wires: [["postgres_insert_final"]],
      });
  
      // Insert into PostgreSQL (Final)
      workflow.push({
        id: "postgres_insert_final",
        type: "postgresql",
        z: tabId,
        name: "Insert into PostgreSQL (Final)",
        query: "INSERT INTO public.approval_requests (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
        params: "[2, {\"workflowName\": \"" + workflowName + "\", \"candidate\": " + JSON.stringify(candidate) + ", \"manager\": " + JSON.stringify(manager) + ", \"hrbp\": " + JSON.stringify(hrbp) + "}, \"Completed\", 5, 5]",
        postgreSQLConfig: "7b9ec91590d534cc",
        split: false,
        rowsPerMsg: 1,
        outputs: 1,
        x: 3500,
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
        x: 3700,
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
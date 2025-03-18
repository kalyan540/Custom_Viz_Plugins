import React, { useEffect, useRef, useState } from "react";
import { styled } from "@superset-ui/core";
import { FlowBuilderProps } from "./types";
import { Select, Button } from "antd";

const { Option } = Select;

const Styles = styled.div`
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

  input, .ant-select {
    width: 100%;
    padding: ${({ theme }) => theme.gridUnit * 2}px;
    border-radius: ${({ theme }) => theme.gridUnit}px;
  }

  button {
    margin-top: 10px;
  }
`;

export default function FlowBuilder(props: FlowBuilderProps) {
  const { height, width, apiEndpoint } = props;
  const rootElem = useRef<HTMLDivElement>(null);

  const [workflowName, setWorkflowName] = useState(`Workflow-${Math.floor(Math.random() * 1000)}`);
  const [candidateEmail, setCandidateEmail] = useState("");
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  const handleSubmit = async () => {
    const workflowJson = generateWorkflowJson(workflowName, candidateEmail, selectedNodes);
    console.log("Generated Workflow JSON:", workflowJson);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workflowJson),
      });

      if (response.status === 204) {
        alert("Workflow created successfully!");
      } else {
        const result = await response.json();
        alert("Workflow created successfully!");
      }
    } catch (error) {
      console.error("Error submitting workflow:", error);
      alert("Failed to create workflow.");
    }
  };

  const generateWorkflowJson = (workflowName: string, candidateEmail: string, selectedNodes: string[]) => {
    const workflow = [];
    const tabId = "e0ba68613f04424c";

    // PostgreSQL Config Node
    workflow.push({
      id: "postgresql_config",
      type: "postgreSQLConfig",
      z: tabId,
      name: "PostgreSQL Config",
      host: "52.91.38.126",
      port: 5433,
      database: "nodered_db",
      ssl: false,
      user: "nodered_user",
      password: "nodered_password",
      max: 10,
      idleTimeoutMillis: 1000,
      connectionTimeoutMillis: 10000,
      x: 320,
      y: 60,
    });

    // HTTP Start Node
    workflow.push({
      id: "http_in_create",
      type: "http in",
      z: tabId,
      name: "Initiate Workflow",
      url: "/api/initiateWorkflow",
      method: "post",
      upload: false,
      swaggerDoc: "",
      x: 100,
      y: 100,
      wires: [["prepare_email"]],
    });

    // Prepare Email Function
    workflow.push({
      id: "prepare_email",
      type: "function",
      z: tabId,
      name: "Prepare Email",
      func: `
        msg.payload.status = "Pending";
        msg.request_id = msg.payload?.requestId || "UnknownID";
        msg.to = msg.payload.to;
        msg.html = \`
          <div>
            <h2>Approval Request</h2>
            <p>Click <a href="http://www.google.com">here</a> to approve.</p>
          </div>\`;
        return msg;
      `,
      outputs: 1,
      x: 310,
      y: 120,
      wires: [["send_email"]],
    });

    // Email Node
    workflow.push({
      id: "send_email",
      type: "e-mail",
      z: tabId,
      server: "sandbox.smtp.mailtrap.io",
      port: "2525",
      username: "62753aa9883bbc",
      password: "a249d24a02ce4f",
      subject: "Workflow Approval Required",
      body: "{{payload.html}}",
      x: 770,
      y: 150,
      wires: [],
    });

    // Candidate Node
    workflow.push({
      id: "candidate_node",
      type: "function",
      z: tabId,
      name: "Candidate Approval",
      func: `
        msg.payload.status = "Completed";
        return msg;
      `,
      outputs: 1,
      x: 300,
      y: 180,
      wires: [["process_approval"]],
    });

    // Dynamic Manager/HRBP Nodes
    selectedNodes.forEach((node, index) => {
      const nodeId = `node_${index}`;
      const insertId = `postgres_insert_${index}`;

      workflow.push({
        id: nodeId,
        type: "function",
        z: tabId,
        name: `${node} Approval`,
        func: `
          msg.payload.status = "Completed";
          return msg;
        `,
        outputs: 1,
        x: 300,
        y: 200 + index * 40,
        wires: [index === selectedNodes.length - 1 ? ["http_response"] : [`node_${index + 1}`]],
      });

      // PostgreSQL Insert for each node
      workflow.push({
        id: insertId,
        type: "postgresql",
        z: tabId,
        name: `Insert ${node} Approval`,
        query: `INSERT INTO approval_request (user_id, request_data, status, created_at) VALUES ($1, $2, $3, now());`,
        postgreSQLConfig: "postgresql_config",
        split: false,
        rowsPerMsg: 1,
        outputs: 1,
        x: 1100,
        y: 120 + index * 40,
        wires: [],
      });
    });

    // HTTP Response Node
    workflow.push({
      id: "http_response",
      type: "http response",
      z: tabId,
      name: "HTTP Response",
      statusCode: "200",
      headers: {},
      x: 500,
      y: 100,
      wires: [],
    });

    return workflow;
  };

  useEffect(() => {
    console.log("Plugin loaded");
  }, []);

  return (
    <Styles ref={rootElem} height={height} width={width}>
      <div className="form-group">
        <label>Workflow Name</label>
        <input type="text" value={workflowName} disabled />
      </div>
      <div className="form-group">
        <label>Candidate Email</label>
        <input type="email" value={candidateEmail} onChange={(e) => setCandidateEmail(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Add Nodes</label>
        <Select mode="multiple" onChange={(value) => setSelectedNodes(value)} placeholder="Select Nodes">
          <Option value="Manager">Manager</Option>
          <Option value="HRBP">HRBP</Option>
        </Select>
      </div>
      <Button type="primary" onClick={handleSubmit}>
        Submit
      </Button>
    </Styles>
  );
}

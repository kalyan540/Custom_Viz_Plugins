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
  
    // Inject Node to Start the Workflow
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
      wires: [["debug_inject", "candidate_node"]],
    });
  
    // Debug Node for Inject
    workflow.push({
      id: "debug_inject",
      type: "debug",
      z: tabId,
      name: "Debug Inject",
      active: true,
      tosidebar: true,
      complete: "payload",
      x: 300,
      y: 120,
      wires: [],
    });
  
    // Candidate Node
    workflow.push({
      id: "candidate_node",
      type: "function",
      z: tabId,
      name: "Candidate",
      func: `msg.payload.candidate = \"${candidateEmail}\";\nreturn msg;`, // Do not overwrite the payload
      outputs: 1,
      x: 300,
      y: 180,
      wires: [["debug_candidate", "check_form_completed"]],
    });
  
    // Debug Node for Candidate
    workflow.push({
      id: "debug_candidate",
      type: "debug",
      z: tabId,
      name: "Debug Candidate",
      active: true,
      tosidebar: true,
      complete: "payload",
      x: 500,
      y: 180,
      wires: [],
    });
  
    // Switch Node to Check Form Completion
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
        ["set_postgres_params", "postgres_insert_candidate_approve"], // Wire to set_postgres_params
        ["debug_reject", "postgres_insert_candidate_reject"],
      ],
    });
  
    // Function Node to Set PostgreSQL Params
    workflow.push({
      id: "set_postgres_params",
      type: "function",
      z: tabId,
      name: "Set PostgreSQL Params",
      func: `
        // Set the params array for the PostgreSQL query
        msg.params = [
          2, // user_id
          JSON.stringify({ workflowName: "${workflowName}", candidate: "${candidateEmail}" }), // request_data
          "Approved", // status
          1, // current_level
          5  // total_levels
        ];
        return msg;
      `,
      outputs: 1,
      x: 900,
      y: 120,
      wires: [["debug_before_postgres", "postgres_insert_candidate_approve"]],
    });
  
    // Debug Node Before PostgreSQL
    workflow.push({
      id: "debug_before_postgres",
      type: "debug",
      z: tabId,
      name: "Debug Before PostgreSQL",
      active: true,
      tosidebar: true,
      complete: "true", // Inspect the entire msg object
      x: 1100,
      y: 120,
      wires: [],
    });
  
    // PostgreSQL Node for Candidate Approve
    workflow.push({
      id: "postgres_insert_candidate_approve",
      type: "postgresql",
      z: tabId,
      name: "Insert into PostgreSQL (Candidate Approve)",
      query: "INSERT INTO public.approval_requests (user_id, request_data, status, current_level, total_levels, created_at) VALUES ($1, $2, $3, $4, $5, now());",
      params: "{{msg.params}}", // Use the params array from the msg object
      postgreSQLConfig: "7b9ec91590d534cc", // Reference the PostgreSQL config node
      split: false, // Set to false to get all rows in a single message
      rowsPerMsg: 1, // Only relevant if split is true
      outputs: 1,
      x: 1300,
      y: 120,
      wires: [["debug_output"]],
    });
  
    // Debug Node for PostgreSQL Output
    workflow.push({
      id: "debug_output",
      type: "debug",
      z: tabId,
      name: "Debug Output",
      active: true,
      tosidebar: true,
      complete: "true", // Inspect the entire msg object
      x: 1500,
      y: 120,
      wires: [],
    });
  
    return workflow;
  };
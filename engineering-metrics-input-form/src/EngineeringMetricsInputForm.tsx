import React, { useEffect, createRef, useState } from "react";
import { styled, SupersetClient } from "@superset-ui/core";
import {
  EngineeringMetricsInputFormProps,
  EngineeringMetricsInputFormStylesProps,
} from "./types";
import { Tree, TreeNode } from "primereact/tree";
import { TreeSelectionEvent, TreeCheckboxSelectionKeys } from "primereact/tree";
import "primeflex/primeflex.css";
import "primereact/resources/primereact.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primeicons/primeicons.css";
import { Card } from "primereact/card";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Chart } from "primereact/chart";
import SpeedometerChart from "./SpeedometerChart";
//import "./em.css";

// Type definitions
interface DataRecord {
  [key: string]: string;
}

const Styles = styled.div<EngineeringMetricsInputFormStylesProps>`
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;

  .card {
    background: var(--surface-card);
    padding: 2rem;
    border-radius: 10px;
    margin-bottom: 1rem;
  }
`;

export default function EngineeringMetricsInputForm(
  props: EngineeringMetricsInputFormProps
) {
  const { data, height, width, datasource } = props;

  const rootElem = createRef<HTMLDivElement>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bussinessUnit, setbussinessUnit] = useState("");
  const [accountName, setAccountName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [DBName, setDBName] = useState<string | null>(null);
  const [tableName, settableName] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string | number>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [triggerFetch, setTriggerFetch] = useState(false);
  const [tableFetch, setTableFetch] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState({});

  const [filteredTableData, setFilteredTableData] = useState<any[]>([]);

  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [filteredCharts, setFilteredCharts] = useState<any[]>([]);
  const [dataC, setDataC] = useState<DataRecord[]>([]); // Holds external data

  useEffect(() => {
    const jsonData: DataRecord[] = data;
    setDataC(jsonData);
  }, []);

  useEffect(() => {
    const tree = buildDynamicTree(data);
    setNodes(tree);
  }, []);

  const buildDynamicTree = (data: any[]) => {
    const keys = Object.keys(data[0]);
    const tree: any[] = [];

    data.forEach((item: any) => {
      let currentLevel = tree;
      keys.forEach((key, index) => {
        const value = item[key];
        let node = currentLevel.find((n) => n.label === value);
        if (!node) {
          node = {
            key: currentLevel.length + "-" + value,
            label: value,
            children: [],
            selectable: index === keys.length - 1, // Mark last level as selectable
          };
          currentLevel.push(node);
        }
        currentLevel = node.children;
      });
    });

    return tree;
  };

  const handleNodeSelect = (e: any) => {
    const selectedNode = e.value as TreeNode;
    setSelectedNode(selectedNode);
    updateFilteredCharts(selectedNode);
  };

  const updateFilteredCharts = (selectedNode: TreeNode | null) => {
    if (selectedNode) {
      const path = selectedNode.key.split("-"); // Get the path of selected node
      let filteredData: DataRecord[] = dataC;

      // Traverse through each level of the selected node to filter the data dynamically
      path.forEach((value: string, index: number) => {
        const key = Object.keys(data[0])[index]; // Dynamically get the key for the current level
        filteredData = filteredData.filter(
          (item: DataRecord) => item[key] === value
        );
      });

      // If there is matching data, create chart data and update
      if (filteredData.length > 0) {
        const chartData = {
          label: `${filteredData[0]["Business Unit"]} - ${filteredData[0]["Project"]}`,
          value: Math.random() * 100, // Example random value for the speedometer (ensure this is numeric)
          min: 0,
          max: 100,
        };
        setFilteredCharts([chartData]); // Set the filtered chart data
      } else {
        setFilteredCharts([]); // Clear if no data found
      }
    } else {
      setFilteredCharts([]); // Clear the chart when no node is selected
    }
  };

  useEffect(() => {
    const root = rootElem.current as HTMLElement;
    console.log("Plugin element", root);
  }, [rootElem]);

  useEffect(() => {
    async function fetchExploreData() {
      try {
        const [datasource_id, datasource_type] = datasource.split("__");
        const response = await SupersetClient.get({
          endpoint: `/api/v1/explore/?datasource_type=${datasource_type}&datasource_id=${datasource_id}`,
        });

        const dbName = response.json?.result?.dataset?.database?.name;
        const TableName = response.json?.result?.dataset?.datasource_name;
        if (dbName) {
          setDBName(dbName);
          settableName(TableName);
          console.log("Database Name:", dbName);
          console.log("Table Name:", TableName);
        } else {
          console.warn("Database name not found in response");
        }
      } catch (error) {
        console.error("Error fetching explore API:", error);
      }
    }
    fetchExploreData();
  }, [datasource, triggerFetch]);

  console.log("filter State :", filteredCharts.length);
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left side - Tree View */}
      <div style={{ flex: 1, borderRight: "1px solid #ccc", padding: "20px" }}>
        <Tree
          value={nodes}
          selectionMode="single"
          onSelectionChange={handleNodeSelect}
        />
      </div>

      {/* Right side - Speedometer Chart */}
      <div style={{ flex: 2, padding: "20px" }}>
        {filteredCharts.length > 0 ? (
          <div>
            {/* Display Speedometer Chart based on filtered data */}
            <SpeedometerChart data={filteredCharts[0]} />
          </div>
        ) : (
          <p>Select a node from the tree to see the speedometer chart.</p>
        )}
      </div>
    </div>
  );
}

/*useEffect(() => {
    if (bussinessUnit && accountName && projectName) {
      // Filter table data based on the selected filters (Business Unit, Account, Project)
      const filteredData = data.filter(
        item =>
          item['Business Unit'] === bussinessUnit &&
          item.Account === accountName &&
          item.Project === projectName
      );
      setFilteredTableData(filteredData);
    }
  }, [bussinessUnit, accountName, projectName, data]);

  const getUniqueBusinessUnits = (data: any[]) => {
    const businessUnits = data.map(item => item["Business Unit"]);

    // Use a Set to get unique business units
    const uniqueBusinessUnits = [...new Set(businessUnits)];

    console.log('Unique Business Units:', uniqueBusinessUnits);
    return uniqueBusinessUnits; // Return the unique business units if needed
  };

  const filterAccountsByBusinessUnit = (businessUnit: any) => {
    const filteredAccounts = data
      .filter(item => item["Business Unit"] === businessUnit)
      .map(item => item.Account);

    // Use a Set to get unique accounts
    return [...new Set(filteredAccounts)];
  };

  const filterProjectsByAccountAndBusinessUnit = (businessUnit, account) => {
    const filteredProjects = data
      .filter(item => item["Business Unit"] === businessUnit && item.Account === account)
      .map(item => item.Project);

    // Use a Set to get unique projects
    const uniqueProjects = [...new Set(filteredProjects)];

    //console.log('Projects associated with account', account, 'in business unit', businessUnit, ':', uniqueProjects);
    return uniqueProjects; // Return the unique projects
  };

  const uniqueBusinessUnits = getUniqueBusinessUnits(data);

  const handleDropdownSelect = () => {
    setIsModalOpen(true);
  };
  const closeDropdownSelect = () => {
    setAccountName('');
    setProjectName('');
    setbussinessUnit('');
    setIsModalOpen(false);
    setIsEditing(false);
    setIsAccountModalOpen(false);
  };

  const handleAccountDropdownSelect = () => {
    console.log("Bussiness unit", bussinessUnit);
    setIsAccountModalOpen(true);
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();

    // Construct the account form data directly
    const accountformData = {
      "Business Unit": bussinessUnit,
      Account: accountName,
    };

    console.log("Form Data Submitted:", accountformData);

    try {
      const response = await SupersetClient.post({
        endpoint: '/api/dataset/update',
        jsonPayload: { formData: [accountformData], database: DBName, table_name: tableName },
      });
      console.log(response.json.message);
    } catch (error) {
      console.error('Error Submitting form data: ', error);
    }
    setAccountName('');
    setProjectName('');
    setbussinessUnit('');
    // Close the modal after submission
    setIsAccountModalOpen(false);
    setTriggerFetch(prev => !prev);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const metrics = [
      "Code Coverage",
      "Predictability",
      "Sprint Velocity",
      "Cycle Time",
      "Defect Distribution",
      "Scope Change",
    ];
    console.log("Form Data:", formData);

    const isAllFilled = metrics.every(
      (metric) =>
        formData[`${metric}_scope`] !== undefined &&
        formData[`${metric}_target`] !== undefined //&&
      //formData[`${metric}_condition`] !== undefined
    );

    if (!isAllFilled) {
      alert("Please fill out all fields for each metric!");
      return;
    }

    // Construct payload for each metric
    const payload = metrics.map((metric) => ({
      "Business Unit": bussinessUnit,
      Account: accountName,
      Project: projectName,
      Key: metric,
      Scope: formData[`${metric}_scope`],
      Target: formData[`${metric}_target`],
      //condition: formData[`${metric}_condition`],
    }));

    console.log("Form Data Submitted:", payload);

    try {
      const response = await SupersetClient.post({
        endpoint: "/api/dataset/update",
        jsonPayload: { formData: payload, database: DBName, table_name: tableName },
      });
      console.log(response.json.message);
    } catch (error) {
      console.error("Error Submitting form data: ", error);
    }
    setAccountName('');
    setProjectName('');
    setbussinessUnit('');
    setFormData({}); // Clear the form data after submission
    setIsEditing(false);
    setIsModalOpen(false); // Close the modal
    setTriggerFetch(prev => !prev);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'account') {
      setAccountName(value);
    }
    else {
      setFormData((prevData) => ({
        ...prevData,
        [field]: value,
      }));
    }
  };

  const handletableData = () => {
    const filteredData = data.filter(
      item =>
        item['Business Unit'] === bussinessUnit &&
        item.Account === accountName &&
        item.Project === projectName
    );
    setFilteredTableData(filteredData);
    console.log("Table Data:", filteredTableData);
    setTableFetch(true);
  }

  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
          {uniqueBusinessUnits.map((unit, index) => (
            <Dropdown title={unit} menuStyle={{ minWidth: 120 }}>
              <Dropdown.Item onSelect={() => {
                setbussinessUnit(unit);
                handleAccountDropdownSelect();
              }}>Add New Account</Dropdown.Item>
              {filterAccountsByBusinessUnit(unit).map((accounts, idx) => (
                <Dropdown.Menu title={accounts} style={{ minWidth: 120 }}>
                  <Dropdown.Item onSelect={() => {
                    setbussinessUnit(unit);
                    setAccountName(accounts);
                    setIsEditing(true);
                    handleDropdownSelect();
                  }}>Add New Project</Dropdown.Item>
                  {filterProjectsByAccountAndBusinessUnit(unit, accounts).map((project, idx) => (
                    <Dropdown.Item onSelect={() => {
                      setbussinessUnit(unit);
                      setAccountName(accounts);
                      setProjectName(project);
                      handletableData();
                    }}>{project}</Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              ))}

            </Dropdown>
          ))}

          {tableFetch && (<div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Business Unit</th>
                  <th>Account</th>
                  <th>Project</th>
                  <th>Key</th>
                  <th>Scope</th>
                  <th>Condition</th>
                </tr>
              </thead>
              <tbody>
                {filteredTableData.map((row, index) => (
                  <tr key={index}>
                    <td>{row['Business Unit']}</td>
                    <td>{row.Account}</td>
                    <td>{row.Project}</td>
                    <td>{row.Key}</td>
                    <td>{row.Scope}</td>
                    <td>{row.Condition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

        </div>
      </div>

      {isAccountModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">Add New Account</div>
            <form className="modal-form" onSubmit={handleAccountSubmit}>
              <input
                type="text"
                placeholder="Enter Account name"
                value={accountName}
                onChange={(e) => handleInputChange('account', e.target.value)}
                required
              />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button type="button" onClick={closeDropdownSelect}>
                  Cancel
                </button>
                <button className="submit-button" type="submit">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">Metrics Input Form</div>
            <form className="modal-form" onSubmit={handleSubmit}>
              {projectName === '' || isEditing ? (
                <div className="form-group" style={{ display: 'flex', justifyContent: 'center' }}>
                  <label htmlFor="projectName" style={{ fontSize: '14px', fontWeight: '600' }}>Project Name</label>
                  <input
                    type="text"
                    id="projectName"
                    placeholder="Enter Project Name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                    style={{ textAlign: 'center' }}
                  />
                </div>
              ) : (
                <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                  Project Name: {projectName}</div>)}
              <div className="form-grid">
                {[
                  "Code Coverage",
                  "Predictability",
                  "Sprint Velocity",
                  "Cycle Time",
                  "Defect Distribution",
                  "Scope Change",
                ].map((category, index) => (
                  <div key={index} className="form-group">
                    <label>{category}</label>
                    <input
                      type="number"
                      placeholder="Scope"
                      onChange={(e) => handleInputChange(`${category}_scope`, e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Target"
                      onChange={(e) => handleInputChange(`${category}_target`, e.target.value)}
                      required
                    />
                    <select
                      onChange={(e) => handleInputChange(`${category}_condition`, e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Condition
                      </option>
                      <option value="greater_than">Greater Than</option>
                      <option value="less_than">Less Than</option>
                      <option value="greater_than_equal">Greater Than or Equal</option>
                      <option value="less_than_equal">Less Than or Equal</option>
                    </select>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button type="button" onClick={closeDropdownSelect}>
                  Cancel
                </button>
                <button className="submit-button" type="submit">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Styles>
  );*/

import React, { useEffect, createRef, useState } from "react";
import { styled, SupersetClient } from "@superset-ui/core";
import {
  EngineeringMetricsInputFormProps,
  EngineeringMetricsInputFormStylesProps,
} from "./types";
import { Tree } from "primereact/tree";
import { TreeSelectionEvent, TreeCheckboxSelectionKeys } from "primereact/tree";
import "primeflex/primeflex.css";
import "primereact/resources/primereact.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primeicons/primeicons.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";

// Type definitions
interface DataRecord {
  [key: string]: string;
}

interface Chart {
  id: number;
  name: string;
  project: string;
  businessUnit: string;
  type: string;
  [key: string]: string | number; // Index signature allowing dynamic key access
}

interface TreeNode {
  key: string;
  label: string;
  children?: TreeNode[];
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

  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [filteredCharts, setFilteredCharts] = useState<Chart[]>([]);
  const [dataC, setDataC] = useState<DataRecord[]>([]); // Holds external data

  useEffect(() => {
    const jsonData: DataRecord[] = data;
    setDataC(jsonData);
  }, []);

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

  // Sample chart data (for demonstration)
  const allCharts: Chart[] = [
    {
      id: 1,
      name: "Sales Chart",
      project: "Project1",
      businessUnit: "West",
      type: "Line",
    },
    {
      id: 2,
      name: "Revenue Chart",
      project: "Project2",
      businessUnit: "Central",
      type: "Bar",
    },
    {
      id: 3,
      name: "Growth Chart",
      project: "Project3",
      businessUnit: "West",
      type: "Pie",
    },
    {
      id: 4,
      name: "Profit Chart",
      project: "Project4",
      businessUnit: "Central",
      type: "Line",
    },
    {
      id: 5,
      name: "Test Chart",
      project: "TestingProject",
      businessUnit: "West",
      type: "Bar",
    },
    // Add more chart data as needed...
  ];

  // Dynamically build the tree structure from the data
  const buildTree = (data: DataRecord[]) => {
    console.log("Inside Build Tree", data);
    const keys = Object.keys(data[0]); // Get all unique keys dynamically
    const rootNodes: TreeNode[] = [];

    // Loop through each key and dynamically create the tree nodes
    keys.forEach((key) => {
      const uniqueValues = Array.from(new Set(data.map((item) => item[key]))); // Get unique values for each key
      console.log("Unique Values :", uniqueValues);
      const children: TreeNode[] = uniqueValues.map((value) => ({
        key: `${key}-${value}`,
        label: value,
      }));

      console.log("This is children Keys :: ", children);
      rootNodes.push({
        key: key,
        label: key, // Use key as root label
        children,
      });
    });

    setNodes(rootNodes); // Set the dynamically created tree nodes
    console.log("This is Node ::: ", nodes);
  };

  // Filter charts based on selected node
  const updateFilteredCharts = (selectedNode: TreeNode | null) => {
    if (selectedNode) {
      const [key, value] = selectedNode.key.split("-");
      const filtered = allCharts.filter(
        (chart) => chart[key.toLowerCase()] === value
      );
      setFilteredCharts(filtered);
    } else {
      setFilteredCharts([]); // Clear charts if no selection
    }
  };

  // Handle selection change in the tree
  const onSelectionChange = (e: { value: TreeNode }) => {
    if (selectedNode?.key !== e.value.key) {
      // Avoid unnecessary state update
      setSelectedNode(e.value); // Set the selected node
      updateFilteredCharts(e.value); // Update the charts based on selected node
    }
  };

  // Initialize the tree on component mount and whenever `data` changes
  useEffect(() => {
    if (dataC.length > 0) {
      buildTree(dataC); // Build the dynamic tree structure based on the data
    }
  }, [dataC]);

  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      <div style={{ height: "100%", width: "100%", overflowY: "auto" }}>
        <Tree
          value={nodes}
          selectionMode="single"
          // selectionKeys={selectedKeys}
          onSelectionChange={onSelectionChange}
          nodeTemplate={(node: any, options: any) => (
            <span>
              {node.label}
              {node.selectable}
            </span>
          )}
        />
      </div>

      <div className="p-col-12 p-md-8">
        <h3>Available Charts</h3>
        {filteredCharts.length > 0 ? (
          <DataTable value={filteredCharts} responsiveLayout="scroll">
            <Column field="name" header="Chart Name" />
            <Column field="project" header="Project" />
            <Column field="businessUnit" header="Business Unit" />
            <Column field="type" header="Chart Type" />
          </DataTable>
        ) : (
          <Card>
            <h5>No charts available for the selected category.</h5>
          </Card>
        )}
      </div>
    </Styles>
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

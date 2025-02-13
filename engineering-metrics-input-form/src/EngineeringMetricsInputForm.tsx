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

export default function EngineeringMetricsInputForm(
  props: EngineeringMetricsInputFormProps
) {
  const rootElem = createRef<HTMLDivElement>();

  const [DBName, setDBName] = useState<string | null>(null);
  const [tableName, settableName] = useState<string | null>(null);
  const [triggerFetch, setTriggerFetch] = useState(false);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [filteredCharts, setFilteredCharts] = useState<Chart[]>([]);
  const [dataC, setDataC] = useState<DataRecord[]>([]); // Holds external data
  const { data, height, width, datasource } = props;
  const jsonData: DataRecord[] = data;
  setDataC(jsonData);

  console.log("DataJSON :: ", dataC);

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

  // Initialize the tree on component mount and whenever `data` changes
  useEffect(() => {
    if (dataC.length > 0) {
      buildTree(dataC); // Build the dynamic tree structure based on the data
    }
  }, []);

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
          selectionMode="checkbox"
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

      {/* <div className="p-col-12 p-md-8">
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
      </div> */}
    </Styles>

    // <div className="p-grid">
    //   <div className="p-col-12 p-md-4">
    //     <h3>Select a Category to View Corresponding Charts</h3>
    //     <Tree
    //       value={nodes}
    //       selectionMode="single" // Single selection (like radio button)
    //       onSelectionChange={onSelectionChange}
    //     />
    //   </div>

    //   <div className="p-col-12 p-md-8">
    //     <h3>Available Charts</h3>
    //     {filteredCharts.length > 0 ? (
    //       <DataTable value={filteredCharts} responsiveLayout="scroll">
    //         <Column field="name" header="Chart Name" />
    //         <Column field="project" header="Project" />
    //         <Column field="businessUnit" header="Business Unit" />
    //         <Column field="type" header="Chart Type" />
    //       </DataTable>
    //     ) : (
    //       <Card>
    //         <h5>No charts available for the selected category.</h5>
    //       </Card>
    //     )}
    //   </div>
    // </div>
  );
}

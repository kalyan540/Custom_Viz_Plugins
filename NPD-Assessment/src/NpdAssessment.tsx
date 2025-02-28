/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useEffect, useState, createRef, useCallback } from "react";
import { styled, SupersetClient } from "@superset-ui/core";
import { NpdAssessmentProps, NpdAssessmentStylesProps } from "./types";
import { classNames } from "primereact/utils";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { RadioButton } from "primereact/radiobutton";
import { InputNumber } from "primereact/inputnumber";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

const Styles = styled.div<NpdAssessmentStylesProps>`
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;

  .card {
    background: var(--surface-card);
    padding: 2rem;
    border-radius: 10px;
    margin-bottom: 1rem;
  }

  .dialog-footer-buttons {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }
`;

const formFieldsConfig = [
  {
    id: "storyPointsCompleted",
    label: "Story points completed in the sprint",
    type: "number",
    required: true,
  },
  {
    id: "plannedStoryPoints",
    label: "Estimated or Planned Story Points",
    type: "number",
    required: true,
  },
  {
    id: "expectedReleaseVelocity",
    label: "Expected release velocity",
    type: "number",
    required: true,
  },
  {
    id: "removedModifiedStoryPoints",
    label: "Removed OR modified story points during the sprint",
    type: "number",
    required: true,
  },
  {
    id: "codeCoverage",
    label: "Code Coverage",
    type: "percentage",
    required: true,
  },
  {
    id: "defectsFoundInTesting",
    label:
      "Number of defects found in testing (SIT, System testing, Regr, unit, etc.)",
    type: "number",
    required: true,
  },
  {
    id: "defectsFoundInUAT",
    label: "Number of defects found in UAT",
    type: "number",
    required: true,
  },
  {
    id: "defectsFoundInProdTesting",
    label: "Number of defects found during Prod testing",
    type: "number",
    required: true,
  },
  {
    id: "defectsFixedBeforeRelease",
    label: "Defects fixed / closed before release (SIT + UAT + PreProd)",
    type: "number",
    required: true,
  },
  {
    id: "reopenDefectsByCustomer",
    label:
      "No of Reopen defects by External stakeholder (customer) in UAT + Prod",
    type: "number",
    required: true,
  },
  {
    id: "criticalDefectsReported",
    label: "Critical / Severity of defects reported (UAT + PreProd + Prod)",
    type: "number",
    required: true,
  },
  {
    id: "automatedTestCasesInSprint",
    label: "Number of automated test cases within a sprint OR (N-1)",
    type: "number",
    required: true,
  },
  {
    id: "totalTestCasesInSprint",
    label:
      "Total number of test cases within a sprint (candidate for automation - functional)",
    type: "number",
    required: true,
  },
  {
    id: "regressionTestCasesAutomated",
    label: "Total # of regression Test cases automated",
    type: "number",
    required: true,
  },
  {
    id: "regressionTestCasesInSuite",
    label:
      "Total # of regression Test cases in Regression suite (candidate for automation)",
    type: "number",
    required: true,
  },
  {
    id: "productionRollbacks",
    label: "Number of production rollbacks",
    type: "number",
    required: true,
  },
  {
    id: "totalProductionReleases",
    label: "Total number of Production releases",
    type: "number",
    required: true,
  },
  { id: "csat", label: "CSAT", type: "percentage", required: true },
  {
    id: "backlogStoryPoints",
    label:
      "(Backlog) Total number of story points which are prioritised and ready state",
    type: "number",
    required: true,
  },
  {
    id: "totalBuildFailures",
    label: "Total number of build failures",
    type: "number",
    required: true,
  },
  {
    id: "totalBuilds",
    label: "Total number of builds",
    type: "number",
    required: true,
  },
  {
    id: "featuresCompleted",
    label: "Number of features completed",
    type: "number",
    required: true,
  },
  {
    id: "featuresCommittedInReleaseTrain",
    label: "Number of features committed in the release train",
    type: "number",
    required: true,
  },
];

export default function NpdAssessment(props: NpdAssessmentProps) {
  const { data, height, width, datasource } = props;
  const rootElem = createRef<HTMLDivElement>();
  const [DBName, setDBName] = useState<string | null>(null);
  const [tableName, settableName] = useState<string | null>(null);
  const [formData, setFormData] = useState(() => {
    const initialFormData = {};
    formFieldsConfig.forEach((field) => {
      initialFormData[field.id] = "";
    });
    return initialFormData;
  });
  const [deleteProductDialog, setDeleteProductDialog] = useState(false);
  const [globalFilter, setGlobalFilter] = useState(null);
  const [productDialog, setProductDialog] = useState(false);
  const [row, setselectedrow] = useState<string | null>(null);

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
        } else {
          console.warn("Database name not found in response");
        }
      } catch (error) {
        console.error("Error fetching explore API:", error);
      }
    }
    fetchExploreData();
  }, [datasource]);

  const columns = Object.keys(data?.[0] || {});

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  }, []);

  const openNew = () => {
    setFormData(() => {
      const initialFormData = {};
      formFieldsConfig.forEach((field) => {
        initialFormData[field.id] = "";
      });
      return initialFormData;
    });
    setProductDialog(true);
  };

  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="Create Assessment"
          icon="pi pi-plus"
          severity="success"
          onClick={openNew}
          style={{ color: "white" }}
        />
      </div>
    );
  };

  const header = (
    <div className="flex flex-wrap justify-content-between align-items-center">
      {leftToolbarTemplate()}
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText
          type="search"
          onInput={(e: any) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
          style={{ width: "200px" }}
        />
      </IconField>
    </div>
  );

  const editProduct = (data: any) => {
    setFormData({ ...data });
    setProductDialog(true);
  };

  const confirmDeleteProduct = (data: any) => {
    setselectedrow(data.assessmentID);
    setDeleteProductDialog(true);
  };

  const hideDialog = () => {
    setProductDialog(false);
  };

  const saveProduct = async () => {
    console.log("Form Data Submitted:", formData);
    try {
      const responser = await SupersetClient.post({
        endpoint: "/api/dataset/update",
        jsonPayload: {
          formData: [formData],
          database: DBName,
          table_name: tableName,
        },
      });
      console.log(responser.json.message);
      setProductDialog(false);
    } catch (error) {
      console.error("Error Submitting form data: ", error);
    }
  };

  const productDialogFooter = (
    <React.Fragment>
      <div className="card flex flex-wrap justify-content-end gap-3">
        <Button
          label="Cancel"
          icon="pi pi-times"
          outlined
          onClick={hideDialog}
        />
        <Button
          label="Save"
          icon="pi pi-check"
          onClick={saveProduct}
          style={{ color: "white" }}
        />
      </div>
    </React.Fragment>
  );

  const actionBodyTemplate = (rowData: any) => {
    return (
      <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-outlined"
          style={{ padding: "4px", width: "30px", height: "30px" }}
          onClick={() => editProduct(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-outlined p-button-danger"
          style={{ padding: "4px", width: "30px", height: "30px" }}
          onClick={() => confirmDeleteProduct(rowData)}
        />
      </div>
    );
  };

  const hideDeleteProductDialog = () => {
    setDeleteProductDialog(false);
  };

  const deleteProduct = () => {
    setselectedrow(null);
    setDeleteProductDialog(false);
  };

  const deleteProductDialogFooter = (
    <React.Fragment>
      <div className="card flex flex-wrap justify-content-end gap-3">
        <Button
          label="No"
          icon="pi pi-times"
          outlined
          onClick={hideDeleteProductDialog}
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          severity="danger"
          onClick={deleteProduct}
          style={{ color: "white" }}
        />
      </div>
    </React.Fragment>
  );

  const renderFormField = (field: any) => {
    switch (field.type) {
      case "text":
        return (
          <div className="field" key={field.id}>
            <label htmlFor={field.id} className="font-bold">
              {field.label}
            </label>
            <InputText
              id={field.id}
              value={formData[field.id]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange(field.id, e.target.value)
              }
              required={field.required}
              placeholder={field.placeholder || ""}
            />
          </div>
        );
      case "number":
        return (
          <div className="field" key={field.id}>
            <label htmlFor={field.id} className="font-bold">
              {field.label}
            </label>
            <InputNumber
              id={field.id}
              value={formData[field.id]}
              onValueChange={(e: any) => handleInputChange(field.id, e.value)}
              required={field.required}
              placeholder={field.placeholder || ""}
            />
          </div>
        );
      case "percentage":
        return (
          <div className="field" key={field.id}>
            <label htmlFor={field.id} className="font-bold">
              {field.label}
            </label>
            <InputNumber
              id={field.id}
              value={formData[field.id]}
              onValueChange={(e: any) => handleInputChange(field.id, e.value)}
              required={field.required}
              placeholder={field.placeholder || ""}
              suffix="%"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
      datasource={datasource}
    >
      <div className="card">
        <DataTable
          value={data}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} assessments"
          globalFilter={globalFilter}
          header={header}
          scrollable
          scrollHeight={height - 175 + "px"}
        >
          {columns.map((col) => (
            <Column
              key={col}
              field={col}
              header={col}
              style={{ minWidth: "12rem" }}
            />
          ))}
          <Column
            body={actionBodyTemplate}
            bodyStyle={{ textAlign: "center", padding: "8px" }}
            exportable={false}
            frozen
            alignFrozen="right"
            style={{ minWidth: "12rem" }}
          />
        </DataTable>
      </div>

      <Dialog
        visible={productDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Create NPD Assessment"
        modal
        className="p-fluid"
        footer={productDialogFooter}
        onHide={hideDialog}
      >
        <div>{formFieldsConfig.map((field) => renderFormField(field))}</div>
      </Dialog>

      <Dialog
        visible={deleteProductDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteProductDialogFooter}
        onHide={hideDeleteProductDialog}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {data && (
            <span>
              Are you sure you want to delete <b>{row}</b>?
            </span>
          )}
        </div>
      </Dialog>
    </Styles>
  );
} /*

// /*import React, { useEffect, useState, createRef, useCallback } from 'react';
// import { styled, SupersetClient } from '@superset-ui/core';
// import { NpdAssessmentProps, NpdAssessmentStylesProps } from './types';
// import { classNames } from 'primereact/utils';
// import { DataTable } from 'primereact/datatable';
// import { Column } from 'primereact/column';
// import { Button } from 'primereact/button';
// import { InputTextarea } from 'primereact/inputtextarea';
// import { IconField } from 'primereact/iconfield';
// import { InputIcon } from 'primereact/inputicon';
// import { RadioButton } from 'primereact/radiobutton';
// import { InputNumber } from 'primereact/inputnumber';
// import { Dialog } from 'primereact/dialog';
// import { InputText } from 'primereact/inputtext';
// import "primereact/resources/themes/lara-light-cyan/theme.css"; // Choose your theme
// import "primereact/resources/primereact.min.css";
// import 'primeicons/primeicons.css';

// import "primeflex/primeflex.css";




// // The following Styles component is a <div> element, which has been styled using Emotion
// // For docs, visit https://emotion.sh/docs/styled

// // Theming variables are provided for your use via a ThemeProvider
// // imported from @superset-ui/core. For variables available, please visit
// // https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts

// const Styles = styled.div<NpdAssessmentStylesProps>`
//   height: ${({ height }) => height}px;
//   width: ${({ width }) => width}px;

//   .card {
//     background: var(--surface-card);
//     padding: 2rem;
//     border-radius: 10px;
//     margin-bottom: 1rem;
//   }

//   .dialog-footer-buttons {
//     display: flex;
//     gap: 1rem; /* Adds spacing between buttons */
//     justify-content: flex-end; /* Aligns buttons to the right */ /*
//   }

// `;

// /**
//  * ******************* WHAT YOU CAN BUILD HERE *******************
//  *  In essence, a chart is given a few key ingredients to work with:
//  *  * Data: provided via `props.data`
//  *  * A DOM element
//  *  * FormData (your controls!) provided as props by transformProps.ts
//  */ /*}
// /*
// export default function NpdAssessment(props: NpdAssessmentProps) {
//   // height and width are the height and width of the DOM element as it exists in the dashboard.
//   // There is also a `data` prop, which is, of course, your DATA 🎉
//   const { data, height, width, datasource } = props;
//   const rootElem = createRef<HTMLDivElement>();
//   //const [filters, setFilters] = useState<Record<string, string>>({});
//   //const [filteredData, setFilteredData] = useState(data);
//   //const [isModalOpen, setIsModalOpen] = useState(false);
//   const [DBName, setDBName] = useState<string | null>(null);
//   const [tableName, settableName] = useState<string | null>(null);
//   console.log(datasource);
//   console.log('Data:', data);

//   useEffect(() => {
//     async function fetchExploreData() {
//       try {
//         const [datasource_id, datasource_type] = datasource.split('__');
//         const response = await SupersetClient.get({
//           endpoint: `/api/v1/explore/?datasource_type=${datasource_type}&datasource_id=${datasource_id}`,

//         });

//         const dbName = response.json?.result?.dataset?.database?.name;
//         const TableName = response.json?.result?.dataset?.datasource_name;
//         if (dbName) {
//           setDBName(dbName);
//           settableName(TableName);
//           console.log('Database Name:', dbName);
//           console.log('Table Name:', TableName);
//         } else {
//           console.warn('Database name not found in response');
//         }
//       } catch (error) {
//         console.error('Error fetching explore API:', error);
//       }
//     }
//     fetchExploreData();
//   }, [datasource]);

//   const columns = Object.keys(data?.[0] || {});
//   const initialFormData = {
//     functionName: '',
//     group: '',
//     business: '',
//     assessmentLead: '',
//     assessmentID: '',
//     maturity: '',
//     assessmentDate: '',
//     status: '',
//     actions: '',
//     assessmentType: '',
//   };

//   const [formData, setFormData] = useState(initialFormData);

//   const handleInputChange = useCallback((field: string, value: string) => {
//     setFormData((prevData) => ({ ...prevData, [field]: value }));
//   }, []);

//   // Often, you just want to access the DOM and do whatever you want.
//   // Here, you can do that with createRef, and the useEffect hook.
//   useEffect(() => {
//     const root = rootElem.current as HTMLElement;
//     console.log('Plugin element', root);
//   });

//   console.log('Plugin props', props);

//   const [deleteProductDialog, setDeleteProductDialog] = useState(false);
//   //const [submitted, setSubmitted] = useState(false);
//   const [globalFilter, setGlobalFilter] = useState(null);
//   const [productDialog, setProductDialog] = useState(false);
//   const [row, setselectedrow] = useState<string | null>(null);

//   const openNew = () => {
//     setFormData(initialFormData);
//     setProductDialog(true);
//   };

//   const leftToolbarTemplate = () => {
//     return (
//       <div className="flex flex-wrap gap-2">
//         <Button
//           label="Create Assessment"
//           icon="pi pi-plus"
//           severity="success"
//           onClick={openNew}
//           style={{ color: 'white' }}
//         />
//       </div>
//     );
//   };

//   const header = (
//     <div className="flex flex-wrap justify-content-between align-items-center">

//       {leftToolbarTemplate()}
//       <IconField iconPosition="left">
//         <InputIcon className="pi pi-search" />
//         <InputText
//           type="search"
//           onInput={(e: any) => setGlobalFilter(e.target.value)}
//           placeholder="Search..."
//           style={{ width: '200px' }} // Adjust width as needed
//         />
//       </IconField>
//     </div>
//   );

//   const editProduct = (data: any) => {
//     console.log(data);
//     setFormData({ ...data });
//     setProductDialog(true);
//   };

//   const confirmDeleteProduct = (data: any) => {
//     console.log(data);
//     setselectedrow(data.assessmentID);
//     setDeleteProductDialog(true);
//   };

//   const hideDialog = () => {
//     setProductDialog(false);
//   };

//   const saveProduct = async () => {

//     console.log("Form Data Submitted:", formData);
//     try {
//       const responser = await SupersetClient.post({
//         endpoint: '/api/dataset/update',
//         jsonPayload: { formData: [formData], database: DBName, table_name: tableName },
//       });
//       console.log(responser.json.message);
//       setFormData(initialFormData);

//       setProductDialog(false);
//     } catch (error) {
//       console.error('Error Submitting form data: ', error);
//     }
//   };

//   const productDialogFooter = (
//     <React.Fragment>
//       <div className="card flex flex-wrap justify-content-end gap-3">
//         <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
//         <Button label="Save" icon="pi pi-check" onClick={saveProduct} style={{ color: 'white' }} />
//       </div>
//     </React.Fragment>
//   );

//   const actionBodyTemplate = (rowData: any) => {
//     return (
//       <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
//         <Button
//           icon="pi pi-pencil"
//           className="p-button-rounded p-button-outlined"
//           style={{ padding: '4px', width: '30px', height: '30px' }}
//           onClick={() => editProduct(rowData)}
//         />
//         <Button
//           icon="pi pi-trash"
//           className="p-button-rounded p-button-outlined p-button-danger"
//           style={{ padding: '4px', width: '30px', height: '30px' }}
//           onClick={() => confirmDeleteProduct(rowData)}
//         />
//       </div>
//     );
//   };

//   /*const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
//     console.log(e.value, name);
//   };

//   const onCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     console.log(e.value);
//   };*/
// /*
//   const onInputNumberChange = (e: any, name: string) => {
//     console.log(e.value, name);
//   };

//   const hideDeleteProductDialog = () => {
//     setDeleteProductDialog(false);
//   };

//   const deleteProduct = () => {
//     setselectedrow(null);
//     setDeleteProductDialog(false);
//   };

//   const deleteProductDialogFooter = (
//     <React.Fragment>
//       <div className="card flex flex-wrap justify-content-end gap-3">
//         <Button
//           label="No"
//           icon="pi pi-times"
//           outlined
//           onClick={hideDeleteProductDialog}
//         />
//         <Button
//           label="Yes"
//           icon="pi pi-check"
//           severity="danger"
//           onClick={deleteProduct}
//           style={{ color: 'white' }}
//         />
//       </div>
//     </React.Fragment>
//   );

//   return (
//     <Styles
//       ref={rootElem}
//       boldText={props.boldText}
//       headerFontSize={props.headerFontSize}
//       height={height}
//       width={width}
//       datasource={datasource}
//     >
//       <div className="card">
//         <DataTable
//           value={data}
//           paginator
//           rows={10}
//           rowsPerPageOptions={[5, 10, 25]}
//           paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
//           currentPageReportTemplate="Showing {first} to {last} of {totalRecords} assessments"
//           globalFilter={globalFilter}
//           header={header}
//           scrollable
//           scrollHeight={height - 175 + "px"}
//         >
//           {columns.map((col) => (
//             <Column
//               key={col}
//               field={col}
//               header={col}
//               style={{ minWidth: '12rem' }}
//             ></Column>

//           ))}
//           <Column
//             body={actionBodyTemplate}
//             bodyStyle={{ textAlign: 'center', padding: '8px' }}
//             exportable={false}
//             frozen // Freezes the column
//             alignFrozen="right" // Aligns the frozen column to the right
//             style={{ minWidth: '12rem' }}
//           ></Column>
//         </DataTable>
//       </div>

//       <Dialog
//         visible={productDialog}
//         style={{ width: '32rem' }}
//         breakpoints={{ '960px': '75vw', '641px': '90vw' }}
//         header="Create NPD Assessment"
//         modal
//         className="p-fluid"
//         footer={productDialogFooter}
//         onHide={hideDialog}
//       >
//         <div>
//           <div className="field">
//             <label htmlFor="functionName" className="font-bold">Function Name</label>
//             <InputText
//               id="functionName"
//               value={formData.functionName}
//               onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('functionName', e.target.value)}
//               required
//             />
//           </div>
//           <div className="field">
//             <label htmlFor="group" className="font-bold">Group</label>
//             <InputText
//               id="group"
//               value={formData.group}
//               onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('group', e.target.value)}
//               required
//             />
//           </div>
//           <div className="field">
//             <label htmlFor="business" className="font-bold">Business</label>
//             <InputText
//               id="business"
//               value={formData.business}
//               onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('business', e.target.value)}
//               required
//             />
//           </div>
//           <div className="field">
//             <label htmlFor="assessmentLead" className="font-bold">Assessment Lead</label>
//             <InputText
//               id="assessmentLead"
//               value={formData.assessmentLead}
//               onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('assessmentLead', e.target.value)}
//               required
//             />
//           </div>
//           <div className="field">
//             <label htmlFor="assessmentID" className="font-bold">Assessment ID</label>
//             <InputText
//               id="assessmentID"
//               value={formData.assessmentID}
//               onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('assessmentID', e.target.value)}
//               required
//             />
//           </div>
//           <div className="field">
//             <label htmlFor="maturity" className="font-bold">Maturity</label>
//             <InputText
//               id="maturity"
//               value={formData.maturity}
//               onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('maturity', e.target.value)}
//               required
//               placeholder="Select Maturity"
//             />
//             {/* You can replace this with a dropdown or select component */
//           </div>
//           <div className="field">
//             <label htmlFor="assessmentDate" className="font-bold">Assessment Date</label>
//             <InputText
//               id="assessmentDate"
//               type="date"
//               value={formData.assessmentDate}
//               onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('assessmentDate', e.target.value)}
//               required
//             />
//           </div>
//           <div className="field">
//             <label className="mb-3 font-bold">Status</label>
//             <div className="formgrid grid">
//               <div className="field-radiobutton col-4">
//                 <RadioButton
//                   inputId="statusPublished"
//                   name="status"
//                   value="Published"
//                   onChange={(e: any) => handleInputChange('status', e.target.value)}
//                   checked={formData.status === 'Published'}
//                 />
//                 <label htmlFor="statusPublished">Published</label>
//               </div>
//               <div className="field-radiobutton col-4">
//                 <RadioButton
//                   inputId="statusInProgress"
//                   name="status"
//                   value="In Progress"
//                   onChange={(e: any) => handleInputChange('status', e.target.value)}
//                   checked={formData.status === 'In Progress'}
//                 />
//                 <label htmlFor="statusInProgress">In Progress</label>
//               </div>
//               <div className="field-radiobutton col-4">
//                 <RadioButton
//                   inputId="statusPending"
//                   name="status"
//                   value="Pending"
//                   onChange={(e: any) => handleInputChange('status', e.target.value)}
//                   checked={formData.status === 'Pending'}
//                 />
//                 <label htmlFor="statusPending">Pending</label>
//               </div>
//             </div>
//           </div>
//           <div className="field">
//             <label htmlFor="actions" className="font-bold">Actions</label>
//             <InputText
//               id="actions"
//               value={formData.actions}
//               onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('actions', e.target.value)}
//               required
//             />
//           </div>
//           <div className="field">
//             <label htmlFor="assessmentType" className="font-bold">Assessment Type</label>
//             <InputText
//               id="assessmentType"
//               value={formData.assessmentType}
//               onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('assessmentType', e.target.value)}
//               required
//             />
//           </div>
//         </div>
//       </Dialog>

//       <Dialog
//         visible={deleteProductDialog}
//         style={{ width: '32rem' }}
//         breakpoints={{ '960px': '75vw', '641px': '90vw' }}
//         header="Confirm"
//         modal
//         footer={deleteProductDialogFooter}
//         onHide={hideDeleteProductDialog}
//       >
//         <div className="confirmation-content">
//           <i
//             className="pi pi-exclamation-triangle mr-3"
//             style={{ fontSize: '2rem' }}
//           />
//           {data && (
//             <span>
//               Are you sure you want to delete <b>{row}</b>?
//             </span>
//           )}
//         </div>
//       </Dialog>
//     </Styles>

//   );

// }*/

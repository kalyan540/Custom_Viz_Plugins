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
import React, { useEffect, useState, createRef, useRef } from 'react';
import { styled, SupersetClient } from '@superset-ui/core';
import { NpdAssessmentProps, NpdAssessmentStylesProps } from './types';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { RadioButton } from 'primereact/radiobutton';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import 'primeicons/primeicons.css';
        



// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled

// Theming variables are provided for your use via a ThemeProvider
// imported from @superset-ui/core. For variables available, please visit
// https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts

const Styles = styled.div<NpdAssessmentStylesProps>`
  background-color: ${({ theme }) => theme.colors.secondary.light2};
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;

  h3 {
    /* You can use your props to control CSS! */
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.gridUnit * 3}px;
    font-size: ${({ theme, headerFontSize }) =>
    theme.typography.sizes[headerFontSize]}px;
    font-weight: ${({ theme, boldText }) =>
    theme.typography.weights[boldText ? 'bold' : 'normal']};
  }

  pre {
    height: ${({ theme, headerFontSize, height }) =>
    height - theme.gridUnit * 12 - theme.typography.sizes[headerFontSize]}px;
  }

  .card {
    background: var(--surface-card);
    padding: 2rem;
    border-radius: 10px;
    margin-bottom: 1rem;
  }


`;

/**
 * ******************* WHAT YOU CAN BUILD HERE *******************
 *  In essence, a chart is given a few key ingredients to work with:
 *  * Data: provided via `props.data`
 *  * A DOM element
 *  * FormData (your controls!) provided as props by transformProps.ts
 */

export default function NpdAssessment(props: NpdAssessmentProps) {
  // height and width are the height and width of the DOM element as it exists in the dashboard.
  // There is also a `data` prop, which is, of course, your DATA 🎉
  const { data, height, width, datasource } = props;
  const rootElem = createRef<HTMLDivElement>();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filteredData, setFilteredData] = useState(data);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [DBName, setDBName] = useState<string | null>(null);
  const [tableName, settableName] = useState<string | null>(null);
  console.log(datasource);

  useEffect(() => {
    async function fetchExploreData() {
      try {
        const [datasource_id, datasource_type] = datasource.split('__');
        const response = await SupersetClient.get({
          endpoint: `/api/v1/explore/?datasource_type=${datasource_type}&datasource_id=${datasource_id}`,

        });

        const dbName = response.json?.result?.dataset?.database?.name;
        const TableName = response.json?.result?.dataset?.datasource_name;
        if (dbName) {
          setDBName(dbName);
          settableName(TableName);
          console.log('Database Name:', dbName);
          console.log('Table Name:', TableName);
        } else {
          console.warn('Database name not found in response');
        }
      } catch (error) {
        console.error('Error fetching explore API:', error);
      }
    }
    fetchExploreData();
  }, [datasource]);

  const columns = Object.keys(data[0] || {});
  const [formData, setFormData] = useState({
    functionName: '',
    group: '',
    business: '',
    assessmentLead: '',
    assessmentID: '',
    maturity: '',
    assessmentDate: '',
    status: '',
    actions: '',
    assessmentType: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  // Update the filtered data based on selected filters
  useEffect(() => {
    let updatedData = data;

    Object.entries(filters).forEach(([column, value]) => {
      if (value) {
        updatedData = updatedData.filter((row) => row[column] === value);
      }
    });

    setFilteredData(updatedData);
  }, [filters, data]);

  // Handle filter changes
  const handleFilterChange = (column: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  // Often, you just want to access the DOM and do whatever you want.
  // Here, you can do that with createRef, and the useEffect hook.
  useEffect(() => {
    const root = rootElem.current as HTMLElement;
    console.log('Plugin element', root);
  });

  console.log('Plugin props', props);

  let emptyProduct = {
    id: null,
    name: '',
    image: null,
    description: '',
    category: null,
    price: 0,
    quantity: 0,
    rating: 0,
    inventoryStatus: 'INSTOCK',
  };

  const [deleteProductDialog, setDeleteProductDialog] = useState(false);
  const [product, setProduct] = useState(emptyProduct);
  const [submitted, setSubmitted] = useState(false);
  const [globalFilter, setGlobalFilter] = useState(null);
  const [productDialog, setProductDialog] = useState(false);

  const openNew = () => {
    setProduct(emptyProduct);
    setSubmitted(false);
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
        />
      </div>
    );
  };

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      {leftToolbarTemplate()}
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText
          type="search"
          onInput={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
        />
      </IconField>
    </div>
  );

  const editProduct = (data) => {
    console.log(data);
    setProductDialog(true);
  };

  const confirmDeleteProduct = (data) => {
    console.log(data);
    setDeleteProductDialog(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setProductDialog(false);
  };

  const productDialogFooter = (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Save" icon="pi pi-check" onClick={console.log("Save Clicked")} />
    </React.Fragment>
  );

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          className="mr-2"
          onClick={() => editProduct(rowData)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={() => confirmDeleteProduct(rowData)}
        />
      </React.Fragment>
    );
  };

  const onInputChange = (e, name) => {
    console.log(e.value, name);
  };

  const onCategoryChange = (e) => {
    console.log(e.value);
  };

  const onInputNumberChange = (e, name) => {
    console.log(e.value, name);
  };

  const hideDeleteProductDialog = () => {
    setDeleteProductDialog(false);
  };

  const deleteProduct = () => {
    setDeleteProductDialog(false);
    setProduct(emptyProduct);    
  };

  const deleteProductDialogFooter = (
    <React.Fragment>
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
      />
    </React.Fragment>
  );

  

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
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
          globalFilter={globalFilter}
          header={header}
        >
          {columns.map((col) => (
            <Column
              field={col}
              header={col}
              style={{ minWidth: '12rem' }}
            ></Column>
            
          ))}
          <Column
            body={actionBodyTemplate}
            exportable={false}
            style={{ minWidth: '12rem' }}
          ></Column>
        </DataTable>
      </div>

      <Dialog
        visible={productDialog}
        style={{ width: '32rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header="Product Details"
        modal
        className="p-fluid"
        footer={productDialogFooter}
        onHide={hideDialog}
      >
        <div className="field">
          <label htmlFor="name" className="font-bold">
            Name
          </label>
          <InputText
            id="name"
            value={product.name}
            onChange={(e) => onInputChange(e, 'name')}
            required
            autoFocus
            className={classNames({ 'p-invalid': submitted && !product.name })}
          />
          {submitted && !product.name && (
            <small className="p-error">Name is required.</small>
          )}
        </div>
        <div className="field">
          <label htmlFor="description" className="font-bold">
            Description
          </label>
          <InputTextarea
            id="description"
            value={product.description}
            onChange={(e) => onInputChange(e, 'description')}
            required
            rows={3}
            cols={20}
          />
        </div>

        <div className="field">
          <label className="mb-3 font-bold">Category</label>
          <div className="formgrid grid">
            <div className="field-radiobutton col-6">
              <RadioButton
                inputId="category1"
                name="category"
                value="Accessories"
                onChange={onCategoryChange}
                checked={product.category === 'Accessories'}
              />
              <label htmlFor="category1">Accessories</label>
            </div>
            <div className="field-radiobutton col-6">
              <RadioButton
                inputId="category2"
                name="category"
                value="Clothing"
                onChange={onCategoryChange}
                checked={product.category === 'Clothing'}
              />
              <label htmlFor="category2">Clothing</label>
            </div>
            <div className="field-radiobutton col-6">
              <RadioButton
                inputId="category3"
                name="category"
                value="Electronics"
                onChange={onCategoryChange}
                checked={product.category === 'Electronics'}
              />
              <label htmlFor="category3">Electronics</label>
            </div>
            <div className="field-radiobutton col-6">
              <RadioButton
                inputId="category4"
                name="category"
                value="Fitness"
                onChange={onCategoryChange}
                checked={product.category === 'Fitness'}
              />
              <label htmlFor="category4">Fitness</label>
            </div>
          </div>
        </div>

        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="price" className="font-bold">
              Price
            </label>
            <InputNumber
              id="price"
              value={product.price}
              onValueChange={(e) => onInputNumberChange(e, 'price')}
              mode="currency"
              currency="USD"
              locale="en-US"
            />
          </div>
          <div className="field col">
            <label htmlFor="quantity" className="font-bold">
              Quantity
            </label>
            <InputNumber
              id="quantity"
              value={product.quantity}
              onValueChange={(e) => onInputNumberChange(e, 'quantity')}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={deleteProductDialog}
        style={{ width: '32rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header="Confirm"
        modal
        footer={deleteProductDialogFooter}
        onHide={hideDeleteProductDialog}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: '2rem' }}
          />
          {product && (
            <span>
              Are you sure you want to delete <b>{product.name}</b>?
            </span>
          )}
        </div>
      </Dialog>
    </Styles>

  );

}

/*return (
  <Styles
    ref={rootElem}
    boldText={props.boldText}
    headerFontSize={props.headerFontSize}
    height={height}
    width={width}
  >
    <div className="header">
      <button
        style={{
          padding: '10px 20px',
          fontSize: '14px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        onClick={() => setIsModalOpen(true)}
      >
        Create Assessment
      </button>
    </div>

     {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <span
              className="modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </span>
            <div className="modal-header">Create NPD Assessment</div>
            <form
              className="modal-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const isAllFilled = Object.values(formData).every((value) => value !== '');
                if (!isAllFilled) {
                  alert("Please fill out all fields!");
                  return;
                }
                console.log("Form Data Submitted:", formData);
                try {
                  const responser = await SupersetClient.post({
                    endpoint: '/api/dataset/update',
                    jsonPayload: { formData: [formData], database: DBName, table_name: tableName },
                  });
                  console.log(responser.json.message);
                } catch (error) {
                  console.error('Error Submitting form data: ', error);
                }

                setFormData({
                  functionName: '',
                  group: '',
                  business: '',
                  assessmentLead: '',
                  assessmentID: '',
                  maturity: '',
                  assessmentDate: '',
                  status: '',
                  actions: '',
                  assessmentType: '',
                });

                setIsModalOpen(false);
              }}
            >
              <input
                type="text"
                placeholder="Function Name"
                value={formData.functionName}
                onChange={(e) => handleInputChange('functionName', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Group"
                value={formData.group}
                onChange={(e) => handleInputChange('group', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Business"
                value={formData.business}
                onChange={(e) => handleInputChange('business', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Assessment Lead"
                value={formData.assessmentLead}
                onChange={(e) => handleInputChange('assessmentLead', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Assessment ID"
                value={formData.assessmentID}
                onChange={(e) => handleInputChange('assessmentID', e.target.value)}
                required
              />
              <select
                style={{
                  height: '40px',
                  padding: '8px',
                  width: '100%',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  marginBottom: '10px',
                  fontSize: '14px',
                }}
                value={formData.maturity}
                onChange={(e) => handleInputChange('maturity', e.target.value)}
                required
              >
                <option value="" disabled>
                  Maturity
                </option>
                <option value="Test">Test</option>
                <option value="Launch">Launch</option>
                <option value="Idea Screening">Idea Screening</option>
                <option value="Prototype Development">Prototype Development</option>
              </select>

              <input
                type="date"
                placeholder="Assessment Date"
                value={formData.assessmentDate}
                onChange={(e) => handleInputChange('assessmentDate', e.target.value)}
                required
              />
              <div>
                <label>Status:</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="status"
                      value="Published"
                      checked={formData.status === 'Published'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      required
                    />
                    Published
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="status"
                      value="In Progress"
                      checked={formData.status === 'In Progress'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      required
                    />
                    In Progress
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="status"
                      value="Pending"
                      checked={formData.status === 'Pending'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      required
                    />
                    Pending
                  </label>
                </div>
              </div>
              <input
                type="text"
                placeholder="Actions"
                value={formData.actions}
                onChange={(e) => handleInputChange('actions', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Assessment Type"
                value={formData.assessmentType}
                onChange={(e) => handleInputChange('assessmentType', e.target.value)}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit">Submit</button>
                </div>
            </form>
          </div>
        </div>
    )}
    <div className="filters">
      {columns.map((col) => (
        <div key={col} style={{ flex: 1 }}>
          <select
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              backgroundColor: '#f9f9f9',
            }}
            value={filters[col] || ''}
            onChange={(e) => handleFilterChange(col, e.target.value)}
          >
            <option value="" disabled>
              {col}
            </option>
            {[...new Set(data.map((row) => row[col]))]
              .filter((val): val is string | number => typeof val === 'string' || typeof val === 'nmber')

              .map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
          </select>
        </div>
      ))}
    </div>
    <div style={{ overflowX: 'auto', maxHeight: '100%', width: '100%' }}>
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col) => (
                <td key={col}>{row[col]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  </Styles>
);*/

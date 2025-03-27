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
import React, { useState, useRef, useEffect } from 'react';
import { styled } from '@superset-ui/core';
import { UserAction1Props, UserAction1StylesProps } from './types';

const Styles = styled.div<UserAction1StylesProps>`
  font-family: Arial, sans-serif;
  margin: 20px;
  background-color: #f4f4f4;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;

  .container {
    text-align: center;
    border: 1px solid #ddd;
    padding: 20px;
    max-width: 800px;
    margin: auto;
    background-color: white;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }

  .btn {
    padding: 8px 12px;
    font-size: 14px;
    color: #fff;
    border: none;
    cursor: pointer;
    margin: 5px;
    border-radius: 5px;
  }

  .approve {
    background-color: green;
  }

  .reject {
    background-color: red;
  }

  .bulk-btn {
    padding: 12px 18px;
    font-size: 16px;
    margin: 10px;
  }

  table {
    width: 100%;
    margin-top: 20px;
    border-collapse: collapse;
    background-color: white;
    border-radius: 8px;
  }

  th, td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: center;
  }

  .status {
    font-weight: bold;
  }

  .approved {
    color: green;
  }

  .rejected {
    color: red;
  }

  .reject-container {
    display: flex;
    align-items: center;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 5px;
    background-color: #fff;
    justify-content: space-between;
  }

  .rejectReason {
    border: none;
    outline: none;
    flex-grow: 1;
    padding: 5px;
  }

  .highlight {
    border: 2px solid red;
    background-color: #ffcccc;
  }
`;

interface Request {
  id: string;
  status: string;
  rejectReason: string;
  selected?: boolean;
}

export default function UserAction1(props: UserAction1Props) {
  const { data, height, width, apiEndpoint } = props;
  const rootElem = useRef<HTMLDivElement>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);

  // Initialize and update requests when data changes
  useEffect(() => {
    if (data && Array.isArray(data)) {
      const mappedRequests = data.map(item => ({
        id: item.requestid.toString(),
        status: item.status,
        rejectReason: '',
        selected: false
      }));
      setRequests(mappedRequests);
    }
  }, [data]);

  useEffect(() => {
    console.log('Plugin element', rootElem.current);
    console.log('Plugin props', props);
  }, []);

  const toggleAll = (checked: boolean) => {
    const updatedRequests = requests.map(request => ({
      ...request,
      selected: checked
    }));
    setRequests(updatedRequests);
    setSelectAll(checked);
  };

  const toggleRowSelection = (index: number) => {
    const newRequests = [...requests];
    newRequests[index].selected = !newRequests[index].selected;
    setRequests(newRequests);
    
    // Update selectAll checkbox if needed
    const allSelected = newRequests.every(request => request.selected);
    setSelectAll(allSelected);
  };

  const updateRejectReason = (index: number, reason: string) => {
    const newRequests = [...requests];
    newRequests[index].rejectReason = reason;
    setRequests(newRequests);
  };

  const processRequest = async (index: number, status: string) => {
    const request = requests[index];
    
    if (status === "Rejected" && !request.rejectReason.trim()) {
      return;
    }

    const requestBody = {
      requestid: request.id,
      workflowName: "Workflow-" + request.id,
      candidateEmail: "nishanth@example.com",
      formCompleted: true,
      status: status
    };

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const newRequests = [...requests];
        newRequests[index].status = status;
        setRequests(newRequests);
        alert(`Request ${request.id} has been successfully ${status.toLowerCase()}!`);
      } else {
        alert(`Failed to update request ${request.id}. Please try again.`);
      }
    } catch (error) {
      alert("An error occurred while processing the request.");
    }
  };

  const bulkApprove = () => {
    const selectedRequests = requests.filter(request => request.selected);
    
    if (selectedRequests.length === 0) {
      alert('Please select at least one request to approve');
      return;
    }

    selectedRequests.forEach((_, index) => {
      const originalIndex = requests.findIndex(req => req.id === selectedRequests[index].id);
      if (originalIndex !== -1) {
        processRequest(originalIndex, 'Approved');
      }
    });
  };

  const bulkReject = () => {
    const selectedRequests = requests.filter(request => request.selected);
    
    if (selectedRequests.length === 0) {
      alert('Please select at least one request to reject');
      return;
    }

    const invalidRequests = selectedRequests.filter(request => !request.rejectReason.trim());
    if (invalidRequests.length > 0) {
      alert('Please enter reject reasons for all selected requests');
      return;
    }

    selectedRequests.forEach((_, index) => {
      const originalIndex = requests.findIndex(req => req.id === selectedRequests[index].id);
      if (originalIndex !== -1) {
        processRequest(originalIndex, 'Rejected');
      }
    });
  };

  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      <div className="container">
        <h2>Workflow's Need Your Attention</h2>

        <table>
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  checked={selectAll}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </th>
              <th>Request ID</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request, index) => (
              <tr key={request.id}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={request.selected || false}
                    onChange={() => toggleRowSelection(index)}
                  />
                </td>
                <td>{request.id}</td>
                <td className={`status ${request.status === 'Approved' ? 'approved' : request.status === 'Rejected' ? 'rejected' : ''}`}>
                  {request.status}
                </td>
                <td>
                  <button 
                    className="btn approve" 
                    onClick={() => processRequest(index, 'Approved')}
                    disabled={request.status !== 'Pending'}
                  >
                    Approve
                  </button>
                  <div className={`reject-container ${request.status === 'Pending' && request.selected && !request.rejectReason.trim() ? 'highlight' : ''}`}>
                    <input 
                      type="text" 
                      className="rejectReason" 
                      placeholder="Enter reason"
                      value={request.rejectReason}
                      onChange={(e) => updateRejectReason(index, e.target.value)}
                      disabled={request.status !== 'Pending'}
                    />
                    <button 
                      className="btn reject" 
                      onClick={() => processRequest(index, 'Rejected')}
                      disabled={request.status !== 'Pending'}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="btn approve bulk-btn" onClick={bulkApprove}>
          Bulk Approve
        </button>
        <button className="btn reject bulk-btn" onClick={bulkReject}>
          Bulk Reject
        </button>
      </div>
    </Styles>
  );
}
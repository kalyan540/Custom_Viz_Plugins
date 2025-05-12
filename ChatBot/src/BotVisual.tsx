import React, { useState, useRef, useEffect } from "react";
import { nanoid } from 'nanoid';
import { SupersetClient, t, COMMON_ERR_MESSAGES, getClientErrorObject } from '@superset-ui/core';

// Define the type for the SQL query object
interface SQLQuery {
    id?: string;
    dbId: number;
    sql: string;
    sqlEditorId: string;
    tab: string;
    schema: string;
    tempTable: string;
    queryLimit: number;
    runAsync: boolean;
    ctas: boolean;
    ctas_method: string;
}
//const BotVisual = ({ schema }: { schema: any }) => {
// const BotVisual = () => {
const BotVisual = ({ tableName, columns, primaryKey, foreignKeys, queries, apiEndpoint}: { 
    tableName: string; 
    columns: any[]; 
    primaryKey: string; 
    foreignKeys: any[]; 
    queries: any[];
    apiEndpoint: string;
}) => {
    const [query, setQuery] = useState(""); // State to hold input value
    const [tableData, setTableData] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false); // State to show/hide suggestions
    const suggestions = queries;
    const [currentIndex, setCurrentIndex] = useState<number | null>(null); // Track the current selected query index
    
    console.log(suggestions);
    // WebSocket initialization
    const socket = useRef<WebSocket | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null); // Reference to the input field

    console.log(columns);

    useEffect(() => {
        // Open WebSocket connection
        socket.current = new WebSocket(apiEndpoint); //'ws://ec2-54-152-143-184.compute-1.amazonaws.com:8765'

        socket.current.onopen = () => {
            console.log("Connected to WebSocket server");
        };

        socket.current.onmessage = (event) => {
            const sqlQuery = event.data; // Assuming the WebSocket server sends back the SQL query
            console.log(`Received SQL Query: ${sqlQuery}`);
            runQuery({
                id: nanoid(11),
                dbId: 1,
                sql: sqlQuery, // Use the SQL query received from WebSocket
                sqlEditorId: "1",
                tab: "WebSocket Query",
                schema: "public",
                tempTable: "",
                queryLimit: 100000,
                runAsync: false,
                ctas: false,
                ctas_method: "TABLE",
            });
        };

        socket.current.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        socket.current.onclose = () => {
            console.log("Disconnected from WebSocket server");
        };

        // Cleanup on component unmount
        return () => {
            if (socket.current) {
                socket.current.close();
            }
        };
    }, []);

    const runQuery = async (sqlquery: SQLQuery) => {
        const postPayload = {
            client_id: sqlquery.id,
            database_id: sqlquery.dbId,
            json: true,
            runAsync: sqlquery.runAsync,
            schema: sqlquery.schema,
            sql: sqlquery.sql,
            sql_editor_id: sqlquery.sqlEditorId,
            tab: sqlquery.tab,
            tmp_table_name: sqlquery.tempTable,
            select_as_cta: sqlquery.ctas,
            ctas_method: sqlquery.ctas_method,
            queryLimit: sqlquery.queryLimit,
            expand_data: true,
        };

        const search = window.location.search || "";

        try {
            console.log("Starting query...");
            const response = await SupersetClient.post({
                endpoint: `/api/v1/sqllab/execute/${search}`,
                body: JSON.stringify(postPayload),
                headers: { "Content-Type": "application/json" },
                parseMethod: "json-bigint",
            });

            const { json } = response;

            if (json?.data) {
                setTableData(json.data); // Save response data to state
                console.log("Data fetched:", json.data);
            }

            if (!sqlquery.runAsync) {
                console.log("Query successful:", json);
            }
        } catch (response) {
            const error = await getClientErrorObject(response);
            let message =
                error.error || error.message || error.statusText || t("Unknown error");
            if (message.includes("CSRF token")) {
                message = t(COMMON_ERR_MESSAGES.SESSION_TIMED_OUT);
            }
            console.error("Query failed:", message, error.link, error.errors);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value); // Update state when input changes
        setShowSuggestions(true); // Show suggestions when input changes
    };

    const handleFocus = () => {
        setShowSuggestions(true); // Show suggestions on focus
    };

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        const relatedTarget = e.relatedTarget as HTMLElement; // Check where focus is moving
        if (!relatedTarget || !relatedTarget.closest(".suggestions-dropdown")) {
            setShowSuggestions(false); // Hide only if the next focused element is not inside the dropdown
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion); // Set the input value to the selected suggestion
        setShowSuggestions(false); // Hide suggestions after selection
        inputRef.current?.focus(); // Refocus the input field

    };
    

    const handleSubmit = () => {
        if (socket.current && socket.current.readyState === WebSocket.OPEN) {
            const dataToSend = {
                tableName: tableName,   // Sending table name
                columns: columns,       // Sending column list
                primaryKey: primaryKey, // Sending primary key
                foreignKeys: foreignKeys, // Sending foreign keys
                query: query, 
            };
            //console.log("dataToSend", dataToSend);

            socket.current.send(JSON.stringify(dataToSend)); // Send the query to the WebSocket server
            console.log("Sent schema and query to WebSocket:", dataToSend);
        } else {
            console.log("WebSocket not open yet..");
        }
        setShowSuggestions(false);
    };

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            {/* First row */}
            <div
                style={{
                    height: "70px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 10px",
                    borderBottom: "1px solid #ccc",
                    position: "relative", // For absolute positioning of dropdown
                }}
            >
                <img src="/static/assets/images/chatbot.png" alt="BotVisual" style={{ height: "50px" }} />
                <div style={{ flex: 1, margin: "0 10px", position: "relative" }}>
                    <input
                        type="text"
                        placeholder="Write your query"
                        value={query}
                        onChange={handleInputChange}
                        onClick={handleFocus}
                        onFocus={handleFocus}
                        //onBlur={handleBlur}
                        ref={inputRef}
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                        }}
                    />
                    {showSuggestions && (
                        <div
                            className="suggestions-dropdown"
                            tabIndex={-1}
                            style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                right: 0,
                                backgroundColor: "white",
                                border: "1px solid #ccc",
                                borderRadius: "5px",
                                zIndex: 1000,
                            }}
                            onBlur={handleBlur}
                        >
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    style={{
                                        padding: "10px",
                                        cursor: "pointer",
                                        backgroundColor: currentIndex === index ? "#f0f0f0" : "white",
                                    }}
                                    onMouseEnter={() => setCurrentIndex(index)}
                                    onMouseLeave={() => setCurrentIndex(null)}
                                >
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    onClick={handleSubmit} // Trigger action on button click
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "5px",
                        padding: "10px 20px",
                        borderRadius: "5px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    <span>Send</span>
                    <img src="/static/assets/images/send.png" alt="Send" style={{ height: "20px", width: "20px" }} />
                </button>
            </div>

            {/* Second row */}
            <div
                style={{
                    padding: "20px",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "10px",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                }}
            >
                {tableData.length > 0 ? (
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            borderRadius: "10px",
                            overflow: "hidden",
                        }}
                    >
                        <thead
                            style={{
                                backgroundColor: "#374151",
                                color: "#ffffff",
                            }}
                        >
                            <tr>
                                {Object.keys(tableData[0]).map((key, index) => (
                                    <th
                                        key={index}
                                        style={{
                                            padding: "12px 15px",
                                            textAlign: "left",
                                            fontSize: "14px",
                                            fontWeight: "bold",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                            borderBottom: "2px solid #e5e7eb",
                                        }}
                                    >
                                        {key}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    style={{
                                        backgroundColor: rowIndex % 2 === 0 ? "#f9fafb" : "#ffffff",
                                        transition: "background-color 0.3s ease",
                                    }}
                                >
                                    {Object.values(row).map((value, cellIndex) => (
                                        <td
                                            key={cellIndex}
                                            style={{
                                                padding: "12px 15px",
                                                fontSize: "14px",
                                                color: "#374151",
                                                borderBottom: "1px solid #e5e7eb",
                                                textAlign: "left",
                                            }}
                                        >
                                            {value}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ textAlign: "center", color: "#6b7280", fontSize: "16px" }}>
                        No data available.
                    </p>
                )}
            </div>
        </div>
    );
};

export default BotVisual;
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";

const TrySQLTutorial = () => {
  const { id } = useParams();
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
  const [tutorial, setTutorial] = useState(null);
  const [availableTables, setAvailableTables] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchTutorialAndLoadDataset = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/tutorial/set/${id}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setTutorial(res.data);
        setCode(res.data.exampleCode);
        
        // Load dataset and get available tables
        const loadRes = await axios.get(`http://localhost:8080/tutorial/sql-executor/load-from-set/${id}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        
        // If the response contains table information, set it
        if (loadRes.data && loadRes.data.tables) {
          setAvailableTables(loadRes.data.tables);
        }
      } catch (err) {
        console.error("Gagal memuatkan tutorial atau dataset:", err);
      }
    };

    if (id) fetchTutorialAndLoadDataset();
  }, [id, user?.token]);

  const handleRunCode = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8080/tutorial/sql-executor/execute",
        { sql: code },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setOutput(res.data);
  
      if (res.data.availableTables) {
        setAvailableTables(res.data.availableTables);
      }
  
    } catch (err) {
      setOutput({ status: "error", message: err.response?.data || err.message });
    }
  };

  const renderTable = (data, tableName) => {
    if (!Array.isArray(data) || data.length === 0) {
      return <p style={styles.noData}>Tiada data dipaparkan.</p>;
    }

    const headers = Object.keys(data[0]);
    return (
      <div>
        {tableName && <h4 style={styles.tableName}>{tableName}</h4>}
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              {headers.map((h) => (
                <th key={h} style={styles.tableHeader}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} style={idx % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                {headers.map((h) => (
                  <td key={h} style={styles.tableCell}>
                    {row[h]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderAvailableTables = () => {
    return (
      <div>
      {availableTables.map((table, idx) => (
        <div key={idx} style={styles.tableContainer}>
          <p>{table.tableName}</p>
          {table.data.length > 0 ? (
            renderTable(table.data, table.tableName)
          ) : (
            <p style={{ color: "#999" }}>Tiada data dalam jadual ini.</p>
          )}
        </div>
      ))}
    </div>
    );
  };

  const renderOutput = () => {
    if (!output) return <p style={styles.outputPlaceholder}>Jalankan kod SQL untuk melihat hasil.</p>;

    if (output.status === "error") {
      return (
        <pre style={styles.errorOutput}>
          Ralat: {output.message}
        </pre>
      );
    }

    const { type, message, tableName, table, rowsAffected } = output;

    return (
      <div>
        <p><strong>Arahan SQL:</strong> {type || "N/A"}</p>
        <p><strong>Nama Jadual:</strong> {tableName || "N/A"}</p>

        {message && <p><strong>Respons:</strong> {message}</p>}
        {rowsAffected !== undefined && <p><strong>Baris Terjejas:</strong> {rowsAffected}</p>}

        {table && (
          <div style={styles.outputTableContainer}>
            {renderTable(table)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          {tutorial?.tutorialTitle || "UDaC SQL Code Editor"}
        </h1>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
         {/* Left Panel with Input & Output split vertically */}
        <div style={styles.leftPanel}>
          {/* Left-Top Panel - Input */}
          <div style={styles.leftTop}>
            <div style={styles.panelHeader}>Input</div>
            <div style={styles.inputContent}>
            <button
                onClick={handleRunCode}
                style={styles.runButton}
              >
                Run SQL
              </button>
              <CodeMirror
                value={code}
                height="300px"
                extensions={[sql()]}
                onChange={(val) => setCode(val)}
                theme="light"
                style={styles.codeMirror}
              />
            </div>
          </div>
        

          {/* Left bottom - Output */}
          <div style={styles.leftBottom}>
            <div style={styles.panelHeader}>
              Output
            </div>
            <div style={styles.outputContent}>
              {renderOutput()}
            </div>
          </div>
        </div>

        {/* Right Panel - Available Tables */}
        <div style={styles.rightPanel}>
          <div style={styles.panelHeader}>
            Available Table
          </div>
          <div style={styles.availableTablesContent}>
            {renderAvailableTables()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#f9fafb",
    boxShadow: "0 8px 18px rgba(0, 0, 0, 0.1)",
    borderRadius: "6px",
  },
  header: {
    backgroundColor: "#1e40af",
    color: "white",
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderRadius: "6px",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "normal"
  },
  mainContent: {
    flex: 1,
    display: "flex",
    gap: "20px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    overflow: "hidden",
    height: "calc(100vh - 80px)"
  },
  leftPanel: {
    flex: 3,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  leftTop: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "10px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  leftBottom: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "10px",
    backgroundColor: "#f1f3f5",
    borderRadius: "6px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    overflow: "auto",
  },
  rightPanel: {
    flex: 2,
    padding: "10px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    overflowY: "auto",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  panelHeader: {
    padding: "12px 16px",
    backgroundColor: "#e9ecef",
    borderBottom: "1px solid #dee2e6",
    fontWeight: "600",
    fontSize: "14px"
  },
  inputContent: {
    flex: 1,
    padding: "16px",
    display: "flex",
    flexDirection: "column"
  },
  outputContent: {
    flex: 1,
    padding: "16px",
    overflow: "auto"
  },
  availableTablesContent: {
    flex: 1,
    padding: "16px",
    overflow: "auto"
  },
  codeMirror: {
    border: "1px solid #dee2e6",
    borderRadius: "4px",
    fontSize: "14px",
  },
  runButton: {
    marginTop: "12px",
    padding: "8px 16px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    alignSelf: "flex-start",
    marginBottom: "12px",
  },
  noData: {
    color: "#666",
    fontStyle: "italic"
  },
  tableName: {
    marginBottom: "8px",
    color: "#333"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
    border: "1px solid #ddd"
  },
  tableHeaderRow: {
    backgroundColor: "#f8f9fa"
  },
  tableHeader: {
    border: "1px solid #ddd",
    padding: "8px 12px",
    textAlign: "left",
    fontWeight: "600",
    color: "#495057"
  },
  tableRowEven: {
    backgroundColor: "#fff"
  },
  tableRowOdd: {
    backgroundColor: "#f8f9fa"
  },
  tableCell: {
    border: "1px solid #ddd",
    padding: "8px 12px",
    color: "#495057"
  },
  tableContainer: {
    marginBottom: "20px"
  },
  outputPlaceholder: {
    color: "#666",
    fontStyle: "italic"
  },
  errorOutput: {
    color: "#dc3545",
    background: "#f8d7da",
    padding: "12px",
    borderRadius: "6px",
    fontSize: "14px",
    border: "1px solid #f5c6cb"
  },
  outputTableContainer: {
    marginTop: "16px"
  }
};

export default TrySQLTutorial;
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Notebook, Eye } from "lucide-react";

const TutorialSetList = () => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchTutorialSets = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8080/tutorial/set/all", {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setTutorials(response.data);
    } catch (err) {
      setError("Gagal mendapatkan data set tutorial.");
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    fetchTutorialSets();
  }, [fetchTutorialSets]);

  return (
    <div style={styles.container}>
      <h1><Notebook style={styles.icon} size={24} />Tutorial SQL</h1>

      {user?.role === "ADMIN" && (
        <button onClick={() => navigate("/sql-tutorial/add")} style={styles.addButton}>
          Tambah Tutorial
        </button>
      )}

      {loading ? (
        <p>Memuatkan...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <div style={{ marginTop: "20px" }}>
          {tutorials.map((tutorial) => (
            <div key={tutorial.idTutorialSet} style={styles.card}>
              <div>
                <h3 style={styles.title}>{tutorial.tutorialTitle}</h3>
              </div>
              <div style={styles.iconGroup}>
                <button
                  style={styles.iconButton}
                  title="Kemaskini"
                  onClick={() => navigate(`/sql-tutorial/${tutorial.idTutorialSet}`)}
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    maxWidth: "95%",
    margin: "auto",
    padding: "32px 48px",
    fontFamily: "Arial, sans-serif",
    background: "#f9fafb",
    boxShadow: "0 8px 18px rgba(0, 0, 0, 0.1)",
    borderRadius: "5px",
  },
  addButton: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#28a745",
    color: "white",
    padding: "10px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: 16,
  },
  card: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    border: "1px solid #ddd",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "12px",
  },
  title: {
    fontSize: "18px",
    margin: 0,
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    marginTop: "4px",
  },
  icon: {
    color: "#2563eb",
  },
  iconGroup: {
    display: "flex",
    gap: "10px",
  },
  iconButton: {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#007bff",
  },
};

export default TutorialSetList;

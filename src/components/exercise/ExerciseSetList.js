import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Clock, ChevronRight, Eye } from "lucide-react";

function ExerciseList() {
  const navigate = useNavigate();
  const [exerciseSets, setExerciseSets] = useState([]);
  const [filteredSets, setFilteredSets] = useState([]);
  const [typeFilter, setTypeFilter] = useState("ALL");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;
  const userId = user?.idUser;

  const EXERCISE_TYPES = ["QUIZ", "THEMATIC", "CUMULATIVE"];

  const fetchByOwner = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/exercise/sets/view/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setExerciseSets(response.data);
      setFilteredSets(response.data);
    } catch (error) {
      console.error("Error fetching exercise sets:", error);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchByOwner(userId);
    }
  }, [userId, user?.role, fetchByOwner]);

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    setTypeFilter(selectedType);
    if (selectedType === "ALL") {
      setFilteredSets(exerciseSets);
    } else {
      setFilteredSets(exerciseSets.filter(set => set.exerciseType === selectedType));
    }
  };

  const handleAdd = () => {
    navigate("/exercise-sets/add");
  };

  const handleView = (id) => {
    navigate(`/exercise-sets/${id}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="page">
      <h1>Senarai Set Latihan</h1>

      {user?.role === "ADMIN" && (
        <div className="button-container">
          <button className="add-btn" onClick={handleAdd}>Tambah Set Latihan</button>
        </div>
      )}

      <div className="filter">
        <label className="filter-label">Tapis Jenis:</label>
        <select className="filter-select" value={typeFilter} onChange={handleTypeChange}>
          <option value="ALL">SEMUA</option>
          {EXERCISE_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="grid">
        {filteredSets.map((set) => (
          <div key={set.idExerciseSet} className="card">
            <div className="card-header">
              <h3>{set.exerciseTitle}</h3>
            </div>
            <p><strong>Jenis:</strong> {set.exerciseType}</p>
            <p><strong>Topik:</strong> {set.exerciseSection}</p>
            <div className="meta">
              <span><Clock size={14} /> {formatDate(set.createdAt)}</span>
            </div>
            <button onClick={() => handleView(set.idExerciseSet)}>
              <Eye size={16} /> Lihat Butiran <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .page {
          min-height: 100vh;
          padding: 2rem;
          background: #f9fafb;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .button-container {
          margin-bottom: 24px;
        }

        .add-btn {
          background-color: #28a745;
          color: white;
          border: none;
          padding: 10px 16px;
          font-size: 16px;
          border-radius: 8px;
          cursor: pointer;
        }

        .add-btn:hover {
          background-color: #218838;
        }
          
        .filter {
          margin-bottom: 1rem;
        }

        .filter-label {
          margin-right: 0.5rem;
          font-weight: 600;
        }

        .filter-select {
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 0.375rem;
        }

        select {
          padding: 0.5rem;
          border-radius: 6px;
          border: 1px solid #ccc;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        .card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .icon {
          color: #2563eb;
          flex-shrink: 0;
        }

        .meta {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        button {
          margin-top: 0.75rem;
          padding: 0.5rem 1rem;
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        button:hover {
          background-color: #1d4ed8;
        }
      `}</style>
    </div>
  );
}

export default ExerciseList;

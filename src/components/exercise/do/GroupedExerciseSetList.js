import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE from "../../../config";

const GroupedExerciseSetList = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const initialTypeFilter = queryParams.get("type") || "ALL";

  const [groupedSets, setGroupedSets] = useState({});
  const [filteredGroups, setFilteredGroups] = useState({});
  const [typeFilter, setTypeFilter] = useState(initialTypeFilter);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  const EXERCISE_TYPES = ["QUIZ", "THEMATIC", "CUMULATIVE"];

  const fetchGroupedSets = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/exercise/sets/view/grouped-by-section`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setGroupedSets(response.data);
      setFilteredGroups(response.data);
    } catch (error) {
      console.error("Error fetching grouped exercise sets:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchGroupedSets();
  }, [fetchGroupedSets]);

  useEffect(() => {
    if (typeFilter === "ALL") {
      setFilteredGroups(groupedSets);
    } else {
      const filtered = {};
      for (const [section, sets] of Object.entries(groupedSets)) {
        const filteredSets = sets.filter((set) => set.exerciseType === typeFilter);
        if (filteredSets.length > 0) {
          filtered[section] = filteredSets;
        }
      }
      setFilteredGroups(filtered);
    }

    // Update query string
    const params = new URLSearchParams();
    if (typeFilter !== "ALL") {
      params.set("type", typeFilter);
    }
    navigate({ search: params.toString() }, { replace: true });

  }, [typeFilter, groupedSets, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newType = params.get("type") || "ALL";
    setTypeFilter(newType);
  }, [location.search]);
  

  return (
    <>
      <div className="exercise-container">
        <h1 className="title">Latihan Pembelajaran</h1>

        {/* Filter Dropdown */}
        {user?.role !== 'STUDENT' && (
          <div className="filter">
            <label className="filter-label">Tapis Jenis:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">SEMUA</option>
              {EXERCISE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Grouped Lists */}
        {Object.entries(filteredGroups).map(([section, sets]) => (
          <div key={section} className="section-group">
            <h2 className="section-title">{section}</h2>
            <ul className="set-list">
              {sets.map((set) => (
                <li key={set.idExerciseSet} className="set-item">
                  <span className="set-title">{set.exerciseTitle}</span>
                  <button
                    className="start-button"
                    onClick={() => navigate(`/exercises/view/${set.idExerciseSet}`)}
                  >
                    Lihat Latihan
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Inline CSS */}
      <style>{`
        .exercise-container {
          padding: 32px 48px;
          background-color: #f9fafb;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          min-height: 100vh;
        }

        .title {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
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

        .section-group {
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2563eb;
          margin-bottom: 0.5rem;
        }

        .set-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .set-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
          margin-bottom: 0.5rem;
        }

        .set-title {
          font-weight: 600;
          font-size: 1rem;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .start-button {
          padding: 0.5rem 1rem;
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: background-color 0.2s ease-in-out;
        }

        .start-button:hover {
          background-color: #1d4ed8;
        }
      `}</style>

    </>
  );
};

export default GroupedExerciseSetList;

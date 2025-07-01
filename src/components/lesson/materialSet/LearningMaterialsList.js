import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, User, Eye, ChevronRight } from 'lucide-react';

const LearningMaterialsList = () => {
  const [materialSets, setMaterialSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const fetchLessonSets = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8080/material/set/view/all", {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setMaterialSets(response.data);
    } catch (err) {
      setError("Failed to fetch material sets from server.");
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    if (user?.token) fetchLessonSets();
    else {
      setError("User is not logged in.");
      setLoading(false);
    }
  }, [fetchLessonSets, user?.token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewMaterial = (id) => {
    navigate(`/material/set/view/${id}`);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  const goToAddForm = () => {
    navigate('/material/set/add');
  };

  return (
    <div className="page">
        <h1> <BookOpen className="icon" size={24} /> Kursus Pembelajaran</h1>

        {role === 'ADMIN' && (
        <div className="button-container">
            <button className="add-btn" onClick={goToAddForm}>
                Tambah Kursus
            </button>
        </div>
        )}
      <div className="grid">
        {materialSets.map((material) => (
          <div key={material.idMaterialSet} className="card">
            <div className="card-header">
              <h3>{material.topicTitle}</h3>
            </div>
            <p>{material.topicDesc}</p>
            <div className="meta">
              <span><User size={14} /> {material.ownedBy}</span>
              <span><Clock size={14} /> {formatDate(material.updatedAt)}</span>
            </div>
            <button onClick={() => handleViewMaterial(material.idMaterialSet)}>
              <Eye size={16} /> Lihat Butiran <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .page {
          padding: 2rem;
          background: #f9fafb;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.1);
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
        .loading, .error {
          text-align: center;
          padding: 2rem;
          font-size: 1.125rem;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default LearningMaterialsList;

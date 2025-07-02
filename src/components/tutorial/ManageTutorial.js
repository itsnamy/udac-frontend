import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import parse from "html-react-parser";
import { ArrowLeft, ArrowRight } from "lucide-react";
import API_BASE from "../../config";


const ManageTutorial = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutorial, setTutorial] = useState(null);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        const res = await axios.get(`${API_BASE}/tutorial/set/${id}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setTutorial(res.data);
      } catch (err) {
        setError("Gagal memuatkan tutorial");
      }
    };
    if (id) fetchTutorial();
  }, [id, user?.token]);

  const handleBack = () => {
    navigate("/sql-tutorial/list");
  };
  
  const handleNext = () => {
    navigate("/sql-tutorial/list");
  };
  
  const handleDelete = async () => {
    if (window.confirm("Adakah anda pasti untuk padam set ini?")) {
      await axios.delete(`${API_BASE}/tutorial/set/delete/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      navigate("/sql-tutorial/list");
    }
  };

  const handleEdit = () => {
    navigate(`/sql-tutorial/edit/${id}`);
  };

  return (
    <div className="container">
      {error ? (
        <p className="error">{error}</p>
      ) : tutorial ? (
        <>
          {user?.role === "ADMIN" && (
            <div className="leftAligned">
              <button className="editButton" onClick={handleEdit}>Kemaskini</button>
              <button className="deleteButton" onClick={handleDelete}>Padam Tutorial</button>
            </div>
          )}
          <h2 className="title">{tutorial.tutorialTitle}</h2>
          <div className="content">{parse(tutorial.tutorialInstructions)}</div>
          
          <h3 className="sectionTitle">Contoh SQL:</h3>
          <div className="leftAligned">
            <button className="tryButton" onClick={() => navigate(`/sql-tutorial/try/${id}`)}>Cuba SQL</button>
           
          </div>
          <pre className="codeBlock">{tutorial.exampleCode}</pre>
          <div className="inlineSplit">
              <button className="backButton" onClick={handleBack}> 
                <ArrowLeft size={20} style={{ marginRight: 6 }} />
              </button>
              <button className="nextButton" onClick={handleNext}>
                <ArrowRight size={20} style={{ marginLeft: 6 }} />
              </button>
            </div>
        </>
      ) : (
        <p className="loading">Memuatkan...</p>
      )}

      <style>{`
        .container {
          padding: 20px;
          max-width: 95%;
          min-height: 100vh;
          margin: auto;
          font-family: Arial, sans-serif;
          background: #f9fafb;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.1);
        }
        .title {
          font-size: 26px;
          font-weight: bold;
          margin-bottom: 20px;
          background-color: #E5E7EB;
          padding: 1rem;
          border-radius: 0.5rem;
        }
        .inlineSplit {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }
        .leftAligned {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 0.5rem;
          margin-top: 0.5rem;
          margin-bottom: 0.25rem;
        }
        .sectionTitle {
          font-size: 20px;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 8px;
        }
        .codeBlock {
          background-color: #f4f4f4;
          padding: 12px;
          border-radius: 8px;
          overflow-x: auto;
          margin-bottom: 30px;
          font-size: 16px;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
        }
        .editButton {
          background-color: #3B82F6;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          border: none;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .editButton:hover {
          background-color: #2563EB;
        }
        .deleteButton {
          background-color: #EF4444;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          border: none;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .deleteButton:hover {
          background-color: #DC2626;
        }
        .backButton {
          background-color:rgb(65, 75, 93);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          border: none;
          cursor: pointer;
          transition: background-color 0.3s ease;
          margin-top: 1rem;
        }
        .backButton:hover {
          background-color: #1F2937;
        }
        .nextButton {
          background-color:rgb(0, 191, 38);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          border: none;
          cursor: pointer;
          transition: background-color 0.3s ease;
          margin-top: 1rem;
        }
        .nextButton:hover {
          background-color: rgb(0, 150, 30);
        }
        .tryButton {
          background-color: #3B82F6;;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        }
        .tryButton:hover {
          background-color: #2563EB;
        }
          
        .loading {
          text-align: center;
          font-size: 1.2rem;
        }
        .error {
          text-align: center;
          color: red;
          font-size: 1.2rem;
        }

        .content {
          margin-top: 2rem;
        }
        .content h1 {
          font-size: 32px;
          margin-top: 1.8em;
          color: #222;
        }
        .content h2 {
          font-size: 26px;
          margin-top: 1.5em;
          color: #222;
        }
        .content h3 {
          font-size: 22px;
          margin-top: 1.2em;
          color: #222;
        }
        .content p {
          font-size: 18px;
          margin: 0 0 1em;
          color: #444;
        }
        .content a {
          color: #1a73e8;
          text-decoration: underline;
        }
        .content ul,
        .content ol {
          padding-left: 2em;
          margin-bottom: 1em;
        }
        .content li {
          font-size: 18px;
          margin-bottom: 0.5em;
        }
      `}</style>
    </div>
  );
};

export default ManageTutorial;

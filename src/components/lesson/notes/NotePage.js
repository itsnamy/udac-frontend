import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import parse from "html-react-parser";

const NotePage = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sequence = location.state?.sequence || [];
  const materialIndex = location.state?.materialIndex || 0;

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchNote = async () => {
      console.log('Fetching note with ID:', noteId);
      try {
        const response = await axios.get(
          `http://localhost:8080/material/note/view/${noteId}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        setNote(response.data);
      } catch (err) {
        console.error('Failed to fetch note:', err);
        setError('Unable to load note.');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId, user.token]);

  const goToNext = () => {
    const nextIndex = materialIndex + 1;
    if (nextIndex < sequence.length) {
      navigate(`/learning/flow/${nextIndex}`, {
        state: { sequence },
      });
    } else {
      alert("Tahniah! Anda telah melengkapkan bahagian ini.");
      navigate("/learning-materials");
    }
  };

  if (loading) return <div className="note-container">Loading...</div>;
  if (error) return <div className="note-container error">{error}</div>;

  return (
    <div className="note-container">
      <button onClick={() => navigate(-1)} className="backButton">← Sebelumnya</button>
      <h1 className="note-title">{note.noteTitle}</h1>
      <div className="note-content">{parse(note.noteContent)}</div>
      <button onClick={goToNext} className="nextButton">
        Seterusnya →
      </button>
      <style>{`
        .note-container {
          max-width: 100%;
          margin: auto;
          padding: 20px 100px;
          font-family: Arial, sans-serif;
          line-height: 1.6;
          background-color: #fdfdfd;
          border: 1px solid #ddd;
          border-radius: 8px;
        }

        .backButton {
          margin-bottom: 10px;
          background-color: #eee;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
        }

        .nextButton {
          margin-top: 20px;
          background-color: #4caf50;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          cursor: pointer;
        }

        .nextButton:hover {
          background-color: #388e3c;
        }

        .note-title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #333;
        }

        .note-content h1 {
          font-size: 32px;
          margin-top: 1.8em;
          color: #222;
        }

        .note-content h2 {
          font-size: 26px;
          margin-top: 1.5em;
          color: #222;
        }

        .note-content h3 {
          font-size: 22px;
          margin-top: 1.2em;
          color: #222;
        }

        .note-content p {
          font-size: 18px;
          margin: 0 0 1em;
          color: #444;
        }

        .note-content a {
          color: #1a73e8;
          text-decoration: underline;
        }

        .note-content ul,
        .note-content ol {
          padding-left: 2em;
          margin-bottom: 1em;
        }

        .note-content li {
          font-size: 18px;
          margin-bottom: 0.5em;
        }

        .error {
          color: red;
        }
      `}</style>

    </div>
  );
};

export default NotePage;

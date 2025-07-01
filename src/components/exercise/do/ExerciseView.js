import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const ExerciseView = () => {
  const { idExerciseSet } = useParams();
  const [exerciseSet, setExerciseSet] = useState(null);
  const [latestSubmission, setLatestSubmission] = useState(null);
  const [isQuiz, setIsQuiz] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const sequence = location.state?.sequence || [];
  const materialIndex = location.state?.materialIndex || 0;

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  useEffect(() => {
    const fetchExerciseSet = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/exercise/questions/view/exercise-set/${idExerciseSet}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const set = res.data.exerciseSet;
        setExerciseSet(set);
        setIsQuiz(set.exerciseType === "QUIZ");
      } catch (err) {
        console.error("Error fetching exercise set:", err);
      }
    };

    const fetchSubmissions = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/exercise/submissions/by-student-set`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              studentId: user.idUser,
              exerciseSetId: idExerciseSet,
            },
          }
        );
    
        const submissions = Array.isArray(res.data) ? res.data : [];
        console.log("Submissions:", submissions);
        if (submissions.length > 0) {
          const latest = submissions.reduce((a, b) =>
            new Date(a.submittedAt) > new Date(b.submittedAt) ? a : b
          );
          setLatestSubmission(latest);
        } else {
          setLatestSubmission(null);
        }
      } catch (err) {
        console.error("Error fetching submission:", err);
      }
    }; 

    fetchExerciseSet();
    fetchSubmissions();
  }, [idExerciseSet, token, user.idUser]);

  const goToPrevious = () => {
    const prevIndex = materialIndex - 1;
    if (prevIndex >= 0) {
      navigate(`/learning/flow/${prevIndex}`, {
        state: { sequence },
      });
    }
  };

  const goToNext = () => {
    const nextIndex = materialIndex + 1;
    if (nextIndex < sequence.length) {
      navigate(`/learning/flow/${nextIndex}`, {
        state: { sequence },
      });
    } else {
      alert("Tahniah! Anda telah melengkapkan topik ini.");
      navigate("/learning-materials");
    }
  };

  if (!exerciseSet) return <p>Loading...</p>;

  return (
    <div className="exercise-view">
      <h2>{exerciseSet.exerciseTitle}</h2>
      <p>{exerciseSet.exerciseDesc}</p>

      {latestSubmission ? (
        <div className="result-box">
          <h3>Keputusan Anda</h3>
          <p>
            <strong>Markah:</strong> {latestSubmission.totalScore} / {latestSubmission.maxScore}
          </p>
          <p>
            <strong>Tarikh Hantar:</strong> {new Date(latestSubmission.submittedAt).toLocaleString()}
          </p>
          <button
            className="review-btn"
            onClick={() => navigate(`/exercises/do/${idExerciseSet}?review=true`)}
          >
            Semak Jawapan
          </button>
        </div>
      ) : (
        <button
          className="start-btn"
          onClick={() => navigate(`/exercises/do/${idExerciseSet}`)}
        >
          Mulakan Latihan
        </button>
      )}

      {isQuiz && sequence.length > 0 && (
        <div className="flow-nav">
          <button onClick={goToPrevious} disabled={materialIndex === 0}>
            ← Sebelumnya
          </button>
          <button onClick={goToNext}>
            Seterusnya →
          </button>
        </div>
      )}
      <style>{`
        .exercise-view {
          background-color: #fff;
          padding: 32px 28px;
          border-radius: 12px;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.1);
          max-width: 70%;
          margin: 40px auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          transition: all 0.3s ease;
        }
        .exercise-view p {
          font-size: 1rem;
          margin: 0.5rem 0;
          line-height: 1.6;
        }
        .result-box {
          background: #f0f0f0;
          padding: 1rem;
          margin-top: 1rem;
          border-radius: 0.5rem;
        }
        .review-btn, .start-btn {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          border: none;
          border-radius: 0.5rem;
          background-color: #2563eb;
          color: white;
          cursor: pointer;
        }
        .review-btn:hover, .start-btn:hover {
          background-color: #1d4ed8;
        }
        .flow-nav {
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
        }
        .flow-nav button {
          padding: 0.6rem 1.2rem;
          font-size: 1rem;
          border-radius: 8px;
          background-color: #eee;
          border: none;
          cursor: pointer;
        }
        .flow-nav button:hover {
          background-color: #ddd;
        }
        .flow-nav button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default ExerciseView;

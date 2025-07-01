import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ManageExercise() {
  const { idSet } = useParams();
  const navigate = useNavigate();
  const [exerciseSet, setExerciseSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoverBack, setHoverBack] = useState(false);

  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);
  useEffect(() => {
    const fetchExerciseSet = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/exercise/questions/view/exercise-set/${idSet}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
  
        setExerciseSet({
          ...response.data.exerciseSet,
          questionSections: response.data.questionSections,
        });
      } catch (error) {
        console.error("Failed to load exercise set:", error);
        setExerciseSet(null);
      } finally {
        setLoading(false);
      }
    };
  
    if (user && idSet) {
      fetchExerciseSet();
    }
  }, [idSet, user]);
  


  const handleBack = () => {
    if(exerciseSet?.exerciseType === "QUIZ") {
      navigate(-2); 
    } else{
      navigate("/exercise-sets");
    }
  };

  const handleEditSet = () => {
    navigate(`/exercise-sets/edit/${idSet}`);
  };

  const handleDeleteSet = async () => {
    if (!window.confirm("Are you sure you want to delete this exercise set?")) return;
  
    try {
      await axios.delete(`http://localhost:8080/exercise/sets/delete/${idSet}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
  
      alert("Exercise set deleted successfully.");
      navigate("/exercise-sets"); // Redirect to list after deletion
    } catch (error) {
      console.error("Failed to delete exercise set:", error);
      alert("Failed to delete exercise set.");
    }
  };
  

  const handleEditSection = (section) => {
    navigate(`/exercise-section/edit/${idSet}/${section.idQuestionSec}`, {
      state: { section },
    });
  };

  const handleAddSection = () => {
    navigate(`/exercise-section/add/${idSet}`);
  };

  const handleDeleteSection = async (idQuestionSec) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return;
    try {
      await axios.delete(`http://localhost:8080/exercise/questions/delete/question-section/${idQuestionSec}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setExerciseSet((prev) => ({
        ...prev,
        questionSections: prev.questionSections.filter(
          (s) => s.questionSection.idQuestionSec !== idQuestionSec
        ),
      }));
    } catch (error) {
      console.error("Failed to delete section:", error);
      alert("Failed to delete section.");
    }
  };

  const handleDeleteQuestion = async (idQuestion, idQuestionSec, questionType) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await axios.delete(
        `http://localhost:8080/exercise/questions/delete/question/${idQuestion}?questionType=${questionType}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
  
      setExerciseSet((prev) => ({
        ...prev,
        questionSections: prev.questionSections.map((section) => {
          if (section.questionSection.idQuestionSec === idQuestionSec) {
            return {
              ...section,
              questions: section.questions.filter((q) => q.idQuestion !== idQuestion),
            };
          }
          return section;
        }),
      }));
    } catch (error) {
      console.error("Failed to delete question:", error);
      alert("Failed to delete question.");
    }
  };
  


  if (loading) return <div className="loading">Loading...</div>;
  if (!exerciseSet) return <div className="error">Exercise set not found.</div>;

  return (
    <div className="container">
      <div className="header">
        <h2 className="title">{exerciseSet.exerciseTitle}</h2>
        <div className="inlineSplit">
          <p className="subtitle">Topik: {exerciseSet.exerciseSection}</p>
          <p className="subtitle">Jenis Latihan: {exerciseSet.exerciseType}</p>
        </div>
        <div className="leftAligned">
            <button className="editButton" onClick={handleEditSet}>
              Kemaskini Set
            </button>
            <button className="deleteButton" onClick={handleDeleteSet}>
              Padam Set
            </button>
        </div>
        <p className="subtitle">Keterangan: </p>
        <p className="desc">{exerciseSet.exerciseDesc}</p>

        <button className="addButton" onClick={handleAddSection}>
          Tambah Bahagian Soalan
        </button>
      </div>

      {exerciseSet.questionSections && exerciseSet.questionSections.length > 0 ? (
        exerciseSet.questionSections.map(({ questionSection, questions }, index) => (
          <div key={questionSection.idQuestionSec} className="sectionCard">
            <h3 className="sectionTitle">
              Bahagian {index + 1}: {questionSection.sectionTitle}
            </h3>
            <p className="sectionType">Jenis: {questionSection.questionType}</p>

            <div className="buttonGroup">
              <button
                className="editButton"
                onClick={() => handleEditSection({ ...questionSection, questions })}
              >
                Kemaskini
              </button>
              <button
                className="deleteButton"
                onClick={() => handleDeleteSection(questionSection.idQuestionSec)}
              >
                Padam
              </button>
            </div>

            {questions && questions.length > 0 ? (
              <ul className="questionList">
                {questions.map((q, i) => (
                  <li key={q.idQuestion || i} className="questionItem">
                    <p className="questionText">Soalan {i + 1}</p>
                    {q.questionDiagram && (
                      <img
                        src={q.questionDiagram}
                        alt={`Diagram for question ${i + 1}`}
                        className="questionDiagram"
                      />
                    )}
                    <p className="questionDesc">{q.questionText || "Untitled Question"}</p>
                  
                    {/* MCQ rendering */}
                    {q.mcqOption && q.mcqOption.length > 0 && (
                      <ul className="optionsList">
                        {q.mcqOption.map((opt, idx) => (
                          <li className="optionItem" key={idx}>
                            {String.fromCharCode(97 + idx)}. {opt}
                          </li>
                        ))}
                      </ul>
                    )}
                    {q.mcqAnsIndex !== undefined && (
                      <p className="answerText">
                        Jawapan: {String.fromCharCode(97 + q.mcqAnsIndex)}. {q.mcqOption?.[q.mcqAnsIndex]}
                      </p>
                    )}
                  
                    {/* FIB rendering */}
                    {q.questionType === "FIB" && (
                      <>
                        <p className="answerText">
                          Jawapan: {q.fibAnswer?.join(", ") || "None"}
                        </p>
                        <p className="answerText">
                          Case Sensitive: {q.caseSensitive ? "Yes" : "No"}
                        </p>
                      </>
                    )}
                  
                    {/* DND rendering */}
                    {q.questionType === "DND" && q.correctDiagramXml && (
                     <> 
                        <p className="answerText">Jawapan untuk soalan ini tidak boleh dikemaskini.</p>
                        <img
                          src={q.correctDiagramXml}
                          alt="Diagram"
                          style={{ height: "400px", width: "100%", objectFit: "contain", backgroundColor: "grey", border: "1px solid #ddd", borderRadius: "8px" }}
                        />
                      </>
                    )}


                    <p className="pointValueText">Markah: {q.point}</p>
                  
                    <div className="buttonGroup">
                      <button
                        className="deleteButton"
                        onClick={() => handleDeleteQuestion(q.idQuestion, questionSection.idQuestionSec, q.questionType)}
                      >
                        Padam Soalan
                      </button>
                    </div>
                  </li>
                
                    ))}

              </ul>
            ) : (
              <p className="noQuestionsText">Tiada soalan di bahagian ini</p>
            )}
          </div>
        ))
      ) : (
        <p>Tiada bahagian soalan di dalam set latihan ini</p>
      )}

      <button
        onClick={handleBack}
        className={`backButton ${hoverBack ? "backButtonHover" : ""}`}
        onMouseEnter={() => setHoverBack(true)}
        onMouseLeave={() => setHoverBack(false)}
      >
        Kembali
      </button>

      <style>{`
        .container {
          padding: 1.5rem;
          max-width: 72rem;
          min-height: 100vh;
          margin: auto;
          background: #f9fafb;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.1);
        }
        .header {
          margin-bottom: 1.5rem;
        }
        .title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          background-color: #E5E7EB;
          padding: 1rem;
          border-radius: 0.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .subtitle {
          font-size: 0.875rem;
          color: #4B5563;
          margin-bottom: 0.25rem;
        }
        .desc {
          font-size: 1rem;
          margin-top: 0.5rem;
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
          justify-content: flex-start; /* ensures everything stays to the left */
          gap: 0.5rem; /* optional: adds spacing between items */
          margin-top: 0.5rem;
          margin-bottom: 0.25rem;
        }
        .sectionCard {
          margin-bottom: 1.5rem;
          border: 1px solid #D1D5DB;
          border-radius: 0.375rem;
          padding: 1rem;
          background-color: #FFFFFF;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .sectionTitle {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .sectionDesc {
          font-size: 0.875rem;
          color: #4B5563;
          margin-bottom: 0.5rem;
        }
        .sectionType {
          font-size: 0.875rem;
          color: #4B5563;
          margin-bottom: 0.5rem;
        }
        .questionList {
          margin-top: 0.5rem;
          padding-left: 0;
          list-style-type: none;
        }
        .questionItem {
          border: 1px solid #E5E7EB;
          padding: 0.5rem;
          border-radius: 0.375rem;
          margin-bottom: 1rem;
        }
        .questionText {
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        .questionDiagram {
          max-width: 100%;
          margin-bottom: 0.5rem;
          border-radius: 0.375rem;
        }
        .questionDesc {
          margin-bottom: 0.5rem;
        }
        .optionsList {
          margin-left: 0.25rem;
          margin-top: 0.25rem;
          font-size: 0.875rem;
          list-style-type: none;
          padding-left: 0;
        }
        .optionItem {
          margin-bottom: 0.25rem;
          background-color: #E5E7EB;
          padding: 1rem;
          border-radius: 0.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .answerText {
          font-style: italic;
          color: #10B981;
          margin-top: 0.5rem;
        }
        .noQuestionsText {
          font-style: italic;
          color: #6B7280;
        }
        .addButton {
          background-color: #10B981;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          margin-bottom: 1rem;
          border: none;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .addButton:hover {
          background-color: #059669;
        }
        .buttonGroup {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
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
          background-color: #374151;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          border: none;
          cursor: pointer;
          transition: background-color 0.3s ease;
          margin-top: 1rem;
        }
        .backButtonHover {
          background-color: #1F2937;
        }
        .loading {
          font-size: 1.25rem;
          text-align: center;
          margin-top: 2rem;
        }
        .error {
          font-size: 1.25rem;
          text-align: center;
          margin-top: 2rem;
          color: red;
        }
      `}</style>
    </div>
  );
}

export default ManageExercise;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DndDrawioEditor from "./dndEditor/DndDrawioEditor"; 

function QuestionSectionForm() {
  const { idSet, idSection } = useParams();
  const navigate = useNavigate();

  const [sectionTitle, setSectionTitle] = useState("");
  const [questionType, setQuestionType] = useState("MCQ");
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  useEffect(() => {
    if (idSection && token) {
      axios
        .get(`http://localhost:8080/exercise/questions/view/question-section/${idSection}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const { questionSection, questions } = response.data;

          setSectionTitle(questionSection.sectionTitle || "");
          setQuestionType(questionSection.questionType || "MCQ");

          const normalized = questions.map((q) => {
            if (q.questionType === "MCQ") {
              return {
                idQuestion: q.idQuestion || undefined,  
                questionText: q.questionText || "",
                point: q.point || 1,
                type: "MCQ",
                // Backend sends mcqOption as array of strings, map to array of {optionText}
                mcqOptions: Array.isArray(q.mcqOption)
                  ? q.mcqOption.map((opt) => ({ optionText: opt }))
                  : [{ optionText: "" }],
                mcqAnsIndex: typeof q.mcqAnsIndex === "number" ? q.mcqAnsIndex : -1,
              };
            } else if (q.questionType === "FIB") {
              return {
                idQuestion: q.idQuestion || undefined,
                questionText: q.questionText || "",
                point: q.point || 1,
                type: "FIB",
                fibAnswers: Array.isArray(q.fibAnswer) ? q.fibAnswer : [""],
              };
            } else if (q.questionType === "DND") {
              return {
                idQuestion: q.idQuestion || undefined,
                type: "DND",
                questionText: q.questionText || "",
                point: q.point || 1,
                dndType: q.diagramType || "ERD",
                correctDiagramXml: q.correctDiagramXml || "",
              };
            } else {
              return {};
            }
          });

          setQuestions(normalized);
        })
        .catch((error) => {
          console.error("Failed to fetch question section:", error);
        });
    }
  }, [idSection, token]);

  const handleQuestionTypeChange = (newType) => {
    setQuestionType(newType);
    setQuestions([]);
  };

  const addQuestion = () => {
    const base = {
      questionText: "",
      point: 1,
    };

    if (questionType === "MCQ") {
      setQuestions((prev) => [
        ...prev,
        { ...base, type: "MCQ", mcqOptions: [{ optionText: "" }], mcqAnsIndex: -1 },
      ]);
    } else if (questionType === "FIB") {
      setQuestions((prev) => [
        ...prev, { ...base, type: "FIB", fibAnswers: [""] }]);
    } else if (questionType === "DND") {
      setQuestions((prev) => [
        ...prev,{ ...base, type: "DND", dndType: "ERD", correctDiagramXml: "" },]);
    }
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  // Update answer index for MCQ questions
  const handleAnswerChange = (questionIndex, selectedOptionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].mcqAnsIndex = selectedOptionIndex;
    setQuestions(updatedQuestions);
  };

  // Update option text for MCQ options
  const updateMcqOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].mcqOptions[optIndex].optionText = value;
    setQuestions(updated);
  };

  const addMcqOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].mcqOptions.push({ optionText: "" });
    setQuestions(updated);
  };

  const removeMcqOption = (qIndex, optIndex) => {
    const updated = [...questions];
    if (updated[qIndex].mcqOptions.length > 1) {
      updated[qIndex].mcqOptions.splice(optIndex, 1);
      // If the removed option was the answer, reset mcqAnsIndex
      if (updated[qIndex].mcqAnsIndex === optIndex) {
        updated[qIndex].mcqAnsIndex = -1;
      } else if (updated[qIndex].mcqAnsIndex > optIndex) {
        updated[qIndex].mcqAnsIndex -= 1; // shift index if after removed option
      }
      setQuestions(updated);
    }
  };

  const updateFibAnswer = (qIndex, ansIndex, value) => {
    const updated = [...questions];
    updated[qIndex].fibAnswers[ansIndex] = value;
    setQuestions(updated);
  };

  const addFibAnswer = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].fibAnswers.push("");
    setQuestions(updated);
  };

  const removeFibAnswer = (qIndex, ansIndex) => {
    const updated = [...questions];
    if (updated[qIndex].fibAnswers.length > 1) {
      updated[qIndex].fibAnswers.splice(ansIndex, 1);
      setQuestions(updated);
    }
  };

  const updateDndAnswer = (index, xmlString) => {
    const updated = [...questions];
    updated[index].correctDiagramXml = xmlString || "";
    console.log("✅ Updating DND", index, "with XML:", updated[index].correctDiagramXml);
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Current questions before submit:", questions);
    
    if (!sectionTitle.trim()) {
      setError("Section title is required");
      return;
    }
    if (questions.length === 0) {
      setError("Please add at least one question");
      return;
    }

    for (const [i, q] of questions.entries()) {
      if (!q.questionText.trim()) {
        setError(`Question ${i + 1}: Question Text is required`);
        return;
      }
      if (questionType === "MCQ") {
        if (!q.mcqOptions || q.mcqOptions.length === 0) {
          setError(`Question ${i + 1}: MCQ must have at least one option`);
          return;
        }
        if (q.mcqAnsIndex === -1 || q.mcqAnsIndex >= q.mcqOptions.length) {
          setError(`Question ${i + 1}: Please select a correct answer`);
          return;
        }
        if (q.mcqOptions.some((opt) => !opt.optionText.trim())) {
          setError(`Question ${i + 1}: All MCQ options must be filled`);
          return;
        }
      }
      if (questionType === "FIB") {
        if (!q.fibAnswers || q.fibAnswers.length === 0) {
          setError(`Question ${i + 1}: FIB must have at least one answer`);
          return;
        }
        if (q.fibAnswers.some((ans) => !ans.trim())) {
          setError(`Question ${i + 1}: All FIB answers must be filled`);
          return;
        }
      }
      if (questionType === "DND") {
        if (!q.correctDiagramXml || q.correctDiagramXml.length === 0) {
          setError(`Question ${i + 1}: Save the DND diagram before submitting`);
          return;
        }
      }      
    }

    setError("");
    setLoading(true);

    // Prepare payload to match backend expected format
    const payload = {
        questionSection: {
          idQuestionSec: idSection || undefined,  // match Java field name
          exerciseSetId: idSet,
          sectionTitle,
          questionType
        },
        questions: questions.map((q) => {
          if (q.type === "MCQ") {
            return {
              idQuestion: q.idQuestion || undefined,  
              questionType: "MCQ",
              questionText: q.questionText,
              point: q.point,
              mcqOption: q.mcqOptions.map((opt) => opt.optionText),
              mcqAnsIndex: q.mcqAnsIndex,
            };
          } else if (q.type === "FIB") {
            return {
              idQuestion: q.idQuestion || undefined,  
              questionType: "FIB",
              questionText: q.questionText,
              point: q.point,
              fibAnswer: q.fibAnswers,
            };
          } else if (q.type === "DND") {
            return {
              idQuestion: q.idQuestion || undefined,
              questionType: "DND",
              questionText: q.questionText,
              point: q.point,
              diagramType: q.dndType || "ERD",
              correctDiagramXml: q.correctDiagramXml || "",
            };
          }

          return q;
        }),
      };
      

    try {
      const url = idSection
        ? "http://localhost:8080/exercise/questions/update/question-section"
        : "http://localhost:8080/exercise/questions/add/question-section";

      const method = idSection ? "put" : "post";

      console.log("Sending", method.toUpperCase(), "to URL:", url);
      console.log("Payload:", payload);
      console.log("Authorization header: Bearer", token);
      await axios({
        method,
        url,
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate(`/exercise-sets/${idSet}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save section");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.container}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>{idSection ? "Kemaskini Bahagian Soalan" : "Tambah Bahagian Soalan"}</h2>

      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <label style={styles.label}>Bahagian:</label>
        <input
          style={styles.input}
          type="text"
          value={sectionTitle}
          onChange={(e) => setSectionTitle(e.target.value)}
          required
        />

        <label style={styles.label}>Jenis Soalan:</label>
        <select
          style={styles.input}
          value={questionType}
          onChange={(e) => handleQuestionTypeChange(e.target.value)}
          disabled={!!idSection}
        >
          <option value="MCQ">Soalan Pelbagai Pilihan (MCQ)</option>
          <option value="FIB">Isi Tempat Kosong (FIB)</option>
          <option value="DND">Lukisan ERD / DFD (DND)</option>
        </select>

        <div>
          <h3>Soalan</h3>
          {questions.map((q, i) => (
            <div key={i} style={styles.questionCard}>
              <label style={styles.label}>Soalan{i + 1}:</label>
              <input
                style={styles.input}
                type="text"
                value={q.questionText}
                onChange={(e) => updateQuestion(i, "questionText", e.target.value)}
                required
              />

              <label style={styles.label}>Markah:</label>
              <input
                style={styles.input}
                type="number"
                min={1}
                value={q.point}
                onChange={(e) => updateQuestion(i, "point", Number(e.target.value))}
                required
              />

              {q.type === "MCQ" && (
                <>
                  <label style={styles.label}>Pilihan Jawapan:</label>
                  {q.mcqOptions.map((opt, idx) => (
                    <div key={idx} style={styles.optionRow}>
                      <input
                        type="radio"
                        name={`answer-${i}`}
                        checked={q.mcqAnsIndex === idx}
                        onChange={() => handleAnswerChange(i, idx)}
                        required
                      />
                      <input
                        style={{ ...styles.input, marginLeft: 8, flexGrow: 1 }}
                        type="text"
                        value={opt.optionText}
                        onChange={(e) => updateMcqOption(i, idx, e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeMcqOption(i, idx)}
                        disabled={q.mcqOptions.length === 1}
                        style={styles.removeBtn}
                        title="Remove option"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addMcqOption(i)} style={styles.addBtn}>
                    Tambah Pilihan
                  </button>
                </>
              )}

              {q.type === "FIB" && (
                <>
                  <label style={styles.label}>Jawapan:</label>
                  {q.fibAnswers.map((ans, idx) => (
                    <div key={idx} style={styles.optionRow}>
                      <input
                        style={{ ...styles.input, flexGrow: 1 }}
                        type="text"
                        value={ans}
                        onChange={(e) => updateFibAnswer(i, idx, e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeFibAnswer(i, idx)}
                        disabled={q.fibAnswers.length === 1}
                        style={styles.removeBtn}
                        title="Remove answer"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addFibAnswer(i)} style={styles.addBtn}>
                    Tambah Jawapan
                  </button>
                </>
              )}

              {q.type === "DND" && (
                <div>
                  <label style={styles.label}>Jenis Lukisan:</label>
                  <select
                    style={styles.input}
                    value={q.dndType}
                    onChange={(e) => updateQuestion(i, "dndType", e.target.value)}
                  >
                    <option value="ERD">Entity Relationship Diagram (ERD)</option>
                    <option value="DFD">Data Flow Diagram (DFD)</option>
                  </select>

                  <DndDrawioEditor
                    initialDiagram={{ xml: q.correctDiagramXml || "" }}
                    mode="edit"
                    onChange={(xmlPayload) => {
                      console.log("🔥 onChange called with:", xmlPayload);
                      updateDndAnswer(i, xmlPayload);
                    }}
                  />
                </div>
              )}
              
              <button type="button" onClick={() => removeQuestion(i)} style={styles.removeQuestionBtn}>
                Buang Soalan
              </button>
            </div>
          ))}

          <button type="button" onClick={addQuestion} style={styles.addQuestionBtn}>
            Tambah Soalan
          </button>
        </div>
        <div style={{ display: "block", marginTop: 20 }}>
            <button type="submit" style={styles.submitBtn}>
                Hantar
            </button>
            <button type="button" onClick={() => navigate(`/exercise-sets/${idSet}`)} style={styles.cancelBtn}>
                Batal
            </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "95%",
    margin: "auto",
    padding: "2rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#fdfdfd",
    borderRadius: "12px",
    boxShadow: "0 0 10px rgba(0,0,0,0.05)",
  },
  heading: {
    textAlign: "center",
    marginBottom: "2rem",
    fontSize: "1.75rem",
    fontWeight: "600",
    color: "#333",
  },
  label: {
    display: "block",
    marginTop: "1rem",
    marginBottom: "0.5rem",
    fontWeight: "600",
    fontSize: "1rem",
    color: "#444",
  },
  input: {
    width: "100%",
    padding: "0.6rem",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "0.6rem",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxSizing: "border-box",
    resize: "vertical",
  },
  questionCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1.5rem",
    backgroundColor: "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
    overflow: "visible",
  },
  optionRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "0.75rem",
    gap: "0.5rem",
  },
  removeBtn: {
    backgroundColor: "#e74c3c",
    border: "none",
    borderRadius: "6px",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    width: "32px",
    height: "32px",
    textAlign: "center",
    lineHeight: "30px",
    fontSize: "1rem",
  },
  addBtn: {
    marginTop: "0.5rem",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    fontSize: "0.95rem",
    cursor: "pointer",
  },
  removeQuestionBtn: {
    marginTop: "0.5rem",
    backgroundColor: "#d9534f",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    fontSize: "0.95rem",
    cursor: "pointer",
  },
  addQuestionBtn: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "0.75rem 1.25rem",
    borderRadius: "6px",
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: "1rem",
    display: "block",
  },
  submitBtn: {
    marginTop: "1rem",
    width: "100%",
    backgroundColor: "#5cb85c",
    color: "white",
    fontSize: "1.1rem",
    fontWeight: "600",
    border: "none",
    padding: "0.75rem",
    borderRadius: "8px",
    cursor: "pointer",
  },
  cancelBtn: {
    marginTop: "0.75rem",
    backgroundColor: "#e0e0e0",
    width: "100%",
    color: "#444",
    fontSize: "1.1rem",
    fontWeight: "600",
    border: "none",
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
  },
  error: {
    backgroundColor: "#fdecea",
    color: "#d9534f",
    padding: "0.75rem",
    borderRadius: "6px",
    marginBottom: "1rem",
    fontSize: "0.95rem",
  },
};


export default QuestionSectionForm;

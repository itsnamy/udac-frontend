import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import DndDrawioEditor from "../dndEditor/DndDrawioEditor";


const DoExercise = () => {
  const { idExerciseSet } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isReviewMode = searchParams.get("review") === "true";

  const [exerciseData, setExerciseData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  useEffect(() => {
    const fetchExerciseData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/exercise/questions/view/exercise-set/${idExerciseSet}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setExerciseData(res.data || null);
      } catch (err) {
        console.error("Error fetching exercise data:", err);
      }
    };

    const fetchSubmission = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/exercise/submissions/by-student-set`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { studentId: user.idUser, exerciseSetId: idExerciseSet },
          }
        );
        if (res.data?.length > 0) {
          const latest = res.data.reduce((a, b) =>
            new Date(a.submittedAt) > new Date(b.submittedAt) ? a : b
          );

          const ansRes = await axios.get(
            `http://localhost:8080/exercise/submissions/answers`,
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { submissionId: latest.idSubmission },
            }
          );

          const answerList = ansRes.data || [];
          const answerMap = {};
          const feedbackMap = {};
          answerList.forEach((ans) => {
            if (ans.questionType === "FIB" && typeof ans.answer === "string") {
              answerMap[ans.idQuestion] = ans.answer.split("\\");
            } else {
              answerMap[ans.idQuestion] = ans.answer;
            }
            feedbackMap[ans.idQuestion] = {
              message: ans.feedback,
              correct: ans.correct,
            };
          });

          setAnswers(answerMap);
          setFeedback(feedbackMap);
        }
      } catch (err) {
        console.error("Error loading submission:", err);
      }
    };

    fetchExerciseData();
    if (isReviewMode) fetchSubmission();
  }, [idExerciseSet, token, user?.idUser, isReviewMode]);

  const handleChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleFIBChange = (questionId, index, value) => {
    setAnswers((prev) => {
      const arr = Array.isArray(prev[questionId]) ? [...prev[questionId]] : [];
      arr[index] = value;
      return { ...prev, [questionId]: arr };
    });
  };

  const updateDndAnswer = (questionId, xml) => {
    setAnswers((prev) => ({ ...prev, [questionId]: xml }));
  };


  const handleSubmit = async () => {
    try {
      const answerList = [];

      exerciseData?.questionSections?.forEach((section) => {
        const type = section.questionSection?.questionType;
        section.questions?.forEach((q) => {
          if (answers[q.idQuestion] !== undefined) {
            let answerToSend = answers[q.idQuestion];
            if (type === "FIB" && Array.isArray(answerToSend)) {
              answerToSend = answerToSend.join("\\");
            }
            answerList.push({
              idQuestion: q.idQuestion,
              questionType: type,
              answer: answerToSend,
            });
          }
        });
      });

      await axios.post(
        `http://localhost:8080/exercise/submissions/submit`,
        answerList,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { studentId: user.idUser, exerciseSetId: idExerciseSet },
        }
      );

      navigate(`/exercises/view/${idExerciseSet}`);
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  const renderMCQ = (q) => (
    <div className="mcq-options">
      {q.mcqOption?.map((opt, idx) => (
        <label key={idx} className="mcq-option">
          <input
            type="radio"
            name={`q-${q.idQuestion}`}
            value={idx}
            checked={answers[q.idQuestion] === idx.toString()}
            disabled={isReviewMode}
            onChange={(e) => handleChange(q.idQuestion, e.target.value)}
          />
          <span className="checkmark"></span>
          <span className="option-text">{opt}</span>
        </label>
      ))}
    </div>
  );

  const renderFIB = (q) => {
    const parts = q.questionText.split(/_{2,}/g);
    const blanksCount = parts.length - 1;
    const currentAnswers = answers[q.idQuestion] || [];

    if (isReviewMode) {
      return (
        <div className="fib-question">
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              <span>{part}</span>
              {i < blanksCount && (
                <span
                  className={`fib-answer ${currentAnswers[i] ? 'filled' : 'empty'}`}
                  title={currentAnswers[i] ? "Your answer" : "No answer provided"}
                >
                  {currentAnswers[i] || "___"}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      );
    }

    return (
      <div className="fib-question">
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            <span>{part}</span>
            {i < blanksCount && (
              <input
                type="text"
                className="fib-input"
                value={currentAnswers[i] || ""}
                onChange={(e) => handleFIBChange(q.idQuestion, i, e.target.value)}
                disabled={isReviewMode}
                placeholder={`Jawapan ${i + 1}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderDND = (q) => {
    if (isReviewMode) {
      return (
        <div className="dnd-feedback">
          <p><strong>Jawapan Anda:</strong></p>
          <img
            src={answers[q.idQuestion]}
            alt="Diagram"
            style={{ height: "400px", width: "100%", objectFit: "contain", backgroundColor: "grey", border: "1px solid #ddd", borderRadius: "8px" }}
          />

          <p><strong>Jawapan Betul:</strong></p>
          <img
            src={feedback[q.idQuestion]?.message}
            alt="Diagram"
            style={{ height: "400px", width: "100%", objectFit: "contain", backgroundColor: "grey", border: "1px solid #ddd", borderRadius: "8px" }}
          />
        </div>
      );
    }

    return (
<>
      <div className="dnd-editor-wrapper">
      <DndDrawioEditor
        initialDiagram={{ xml: answers[q.idQuestion]  || "" }}
        mode="edit"
        onChange={(xmlPayload) => {
          console.log("🔥 onChange called with:", xmlPayload);
          updateDndAnswer(q.idQuestion, xmlPayload);
        }}
      />
      </div>
      </>
      
    );
  };

  const renderFeedback = (qid) =>
    feedback[qid] && (
      <div className={`feedback ${feedback[qid].correct ? "correct" : "incorrect"}`}>
        <div className="feedback-icon">
          {feedback[qid].correct ? "✓" : "✗"}
        </div>
        <div className="feedback-message">{feedback[qid].message}</div>
      </div>
    );

  const getCurrentSection = () => {
    return exerciseData?.questionSections?.[currentSectionIndex];
  };

  const getProgress = () => {
    if (!exerciseData?.questionSections) return 0;
    return ((currentSectionIndex + 1) / exerciseData.questionSections.length) * 100;
  };

  const getAnsweredQuestionsInCurrentSection = () => {
    const currentSection = getCurrentSection();
    if (!currentSection) return 0;
    
    return currentSection.questions?.filter(q => 
      answers[q.idQuestion] !== undefined && 
      answers[q.idQuestion] !== "" && 
      (!Array.isArray(answers[q.idQuestion]) || answers[q.idQuestion].some(a => a))
    ).length || 0;
  };

  const canProceedToNext = () => {
    if (isReviewMode) return true;
    const currentSection = getCurrentSection();
    if (!currentSection) return false;
    
    const answeredCount = getAnsweredQuestionsInCurrentSection();
    const totalQuestions = currentSection.questions?.length || 0;
    
    return answeredCount === totalQuestions;
  };

  if (!exerciseData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Memuatkan ...</p>
      </div>
    );
  }

  const currentSection = getCurrentSection();
  const totalSections = exerciseData.questionSections?.length || 0;
  const isLastSection = currentSectionIndex === totalSections - 1;

  return (
    <div className="exercise-container">
      {/* Header */}
      <div className="exercise-header">
        <h1 className="exercise-title">
          {exerciseData.exerciseSet?.exerciseTitle || "Exercise"}
        </h1>
        {isReviewMode && <div className="review-badge">Review Mode</div>}
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${getProgress()}%` }}
          ></div>
        </div>
        <div className="progress-text">
          Bahagian {currentSectionIndex + 1} of {totalSections}
        </div>
      </div>

      {/* Section Navigation */}
      <div className="section-nav">
        {exerciseData.questionSections?.map((section, index) => (
          <button
            key={section.questionSection.idQuestionSec}
            className={`section-nav-item ${
              index === currentSectionIndex ? 'active' : ''
            } ${index < currentSectionIndex ? 'completed' : ''}`}
            onClick={() => setCurrentSectionIndex(index)}
          >
            <span className="section-number">{index + 1}</span>
          </button>
        ))}
      </div>

      {/* Current Section */}
      {currentSection && (
        <div className="section-content">
          <div className="section-header">
            <h2 className="section-title">
              {currentSection.questionSection.sectionTitle}
            </h2>
            <div className="section-info">
              <span className="question-type">
                {currentSection.questionSection.questionType}
              </span>
              {!isReviewMode && (
                <span className="progress-indicator">
                  {getAnsweredQuestionsInCurrentSection()} / {currentSection.questions?.length || 0} Dijawab
                </span>
              )}
            </div>
          </div>

          <div className="questions-container">
            {currentSection.questions?.map((q, index) => (
              <div key={q.idQuestion} className="question-card">
                <div className="question-header">
                  <span className="question-number">Soalan {index + 1}</span>
                  {isReviewMode && feedback[q.idQuestion] && (
                    <span className={`question-status ${feedback[q.idQuestion].correct ? 'Betul' : 'Salah'}`}>
                      {feedback[q.idQuestion].correct ? 'Betul' : 'Salah'}
                    </span>
                  )}
                </div>
                
                <div className="question-content">
                  {currentSection.questionSection.questionType === "FIB" ? (
                    renderFIB(q)
                  ) : currentSection.questionSection.questionType === "MCQ" ? (
                    <>
                      <p className="question-text">{q.questionText}</p>
                      {renderMCQ(q)}
                    </>
                  ) : currentSection.questionSection.questionType === "DND" ? (
                    <>
                      <p className="question-text">{q.questionText}</p>
                      <p>Simpan jawapan anda sebelum ke bahagian seterusnya</p>
                      {renderDND(q)}
                    </>
                  ) : null}
                </div>

                {isReviewMode && currentSection.questionSection.questionType !== "DND" && renderFeedback(q.idQuestion)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="navigation-controls">
        <button
          className="nav-btn secondary"
          onClick={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))}
          disabled={currentSectionIndex === 0}
        >
          ← Bahagian sebelumnya
        </button>

        <div className="nav-center">
          {!isReviewMode && !canProceedToNext() && (
            <p className="completion-hint">
              Sila lengkapkan semua jawapan untuk meneruskan
            </p>
          )}
        </div>

        {!isLastSection ? (
          <button
            className="nav-btn primary"
            onClick={() => setCurrentSectionIndex(currentSectionIndex + 1)}
            disabled={!canProceedToNext()}
          >
            Bahagian Seterusnya →
          </button>
        ) : !isReviewMode ? (
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={!canProceedToNext()}
          >
            Hantar Latihan
          </button>
        ) : null}
      </div>

      <style jsx>{`
        .exercise-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          padding: 2rem;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          color: white;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .exercise-header {
          text-align: center;
          margin-bottom: 1.6rem;
          color: white;
        }

        .exercise-title {
          font-size: 2rem;
          font-weight: bold;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .review-badge {
          display: inline-block;
          background: #fbbf24;
          color: #92400e;
          padding: 0.4rem 0.8rem;
          border-radius: 1.6rem;
          font-weight: 600;
          margin-top: 0.8rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          font-size: 0.9rem;
        }

        .progress-container {
          max-width: 640px;
          margin: 0 auto 1.6rem;
        }

        .progress-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 0.4rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #34d399);
          transition: width 0.3s ease;
        }

        .progress-text {
          text-align: center;
          color: white;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .section-nav {
          display: flex;
          gap: 0.8rem;
          margin-bottom: 1.6rem;
          max-width: 640px;
          margin-left: auto;
          margin-right: auto;
          flex-wrap: wrap;
          justify-content: center;
        }

        .section-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.8rem;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid transparent;
          border-radius: 10px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 96px;
        }

        .section-nav-item:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .section-nav-item.active {
          background: rgba(255, 255, 255, 0.2);
          border-color: #10b981;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .section-nav-item.completed {
          background: rgba(16, 185, 129, 0.2);
          border-color: #10b981;
        }

        .section-number {
          font-size: 1.2rem;
          font-weight: bold;
          margin-bottom: 0.4rem;
        }

        .section-title {
          font-size: 0.5rem;
          text-align: center;
        }

        .section-content {
          max-width: 640px;
          margin: 0 auto;
          background: white;
          border-radius: 13px;
          padding: 1.6rem;
          box-shadow: 0 6px 26px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          margin-bottom: 1.6rem;
          border-bottom: 2px solid #f3f4f6;
          padding-bottom: 0.8rem;
        }

        .section-header h2 {
          margin: 0 0 0.8rem 0;
          color: #1f2937;
          font-size: 1.4rem;
        }

        .section-info {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .question-type {
          background: #3b82f6;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .progress-indicator {
          color: #6b7280;
          font-weight: 500;
        }

        .questions-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .question-card {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          background: #fafafa;
          transition: all 0.3s ease;
        }

        .question-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .question-number {
          font-weight: 600;
          color: #3b82f6;
        }

        .question-status {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .question-status.correct {
          background: #d1fae5;
          color: #065f46;
        }

        .question-status.incorrect {
          background: #fee2e2;
          color: #991b1b;
        }

        .question-text {
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 1rem;
          color: #374151;
        }

        .mcq-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .mcq-option {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .mcq-option:hover {
          border-color: #3b82f6;
          background: #f8fafc;
        }

        .mcq-option input[type="radio"] {
          position: absolute;
          opacity: 0;
          cursor: pointer;
        }

        .checkmark {
          height: 20px;
          width: 20px;
          background-color: #e5e7eb;
          border-radius: 50%;
          margin-right: 0.75rem;
          position: relative;
          transition: all 0.3s ease;
        }

        .mcq-option input:checked ~ .checkmark {
          background-color: #3b82f6;
        }

        .mcq-option input:checked ~ .checkmark:after {
          content: "";
          position: absolute;
          display: block;
          top: 50%;
          left: 50%;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: white;
          transform: translate(-50%, -50%);
        }

        .option-text {
          flex: 1;
          color: #374151;
        }

        .fib-question {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #374151;
        }

        .fib-input {
          display: inline-block;
          padding: 0.5rem;
          border: 2px solid #d1d5db;
          border-radius: 6px;
          margin: 0 0.25rem;
          min-width: 100px;
          text-align: center;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .fib-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .fib-answer {
          display: inline-block;
          padding: 0.5rem;
          margin: 0 0.25rem;
          border-radius: 6px;
          font-weight: 600;
          min-width: 60px;
          text-align: center;
        }

        .fib-answer.filled {
          background: #d1fae5;
          color: #065f46;
          border: 2px solid #10b981;
        }

        .fib-answer.empty {
          background: #fee2e2;
          color: #991b1b;
          border: 2px solid #ef4444;
        }

        .feedback {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 8px;
          font-weight: 500;
        }

        .feedback.correct {
          background: #d1fae5;
          color: #065f46;
          border-left: 4px solid #10b981;
        }

        .feedback.incorrect {
          background: #fee2e2;
          color: #991b1b;
          border-left: 4px solid #ef4444;
        }

        .feedback-icon {
          font-size: 1.25rem;
          font-weight: bold;
        }

        .navigation-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 640px;
          margin: 1.6rem auto 0;
        }

        .nav-center {
          flex: 1;
          text-align: center;
        }

        .completion-hint {
          color: rgba(255, 255, 255, 0.8);
          font-style: italic;
          margin: 0;
        }

        .nav-btn, .submit-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .nav-btn.primary, .submit-btn {
          background: #10b981;
          color: white;
        }

        .nav-btn.primary:hover, .submit-btn:hover {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .nav-btn.secondary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .nav-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .nav-btn:disabled, .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .nav-btn:disabled:hover, .submit-btn:disabled:hover {
          transform: none;
          box-shadow: none;
        }

        @media (max-width: 768px) {
          .exercise-container {
            padding: 1rem;
          }

          .exercise-title {
            font-size: 2rem;
          }

          .section-nav {
            gap: 0.5rem;
          }

          .section-nav-item {
            min-width: 100px;
            padding: 0.75rem;
          }

          .section-content {
            padding: 1.5rem;
          }

          .navigation-controls {
            flex-direction: column;
            gap: 1rem;
          }

          .nav-center {
            order: -1;
          }
        }
      `}</style>
    </div>
  );
};

export default DoExercise;
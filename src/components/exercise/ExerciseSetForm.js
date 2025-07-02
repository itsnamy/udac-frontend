import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../style/formStyle.css";
import API_BASE from "../../config"; 

function ExerciseSetForm() {
  const navigate = useNavigate();
  const { idSet, topicTitle } = useParams();
  const decodedTitle = topicTitle ? decodeURIComponent(topicTitle) : "";

  const [exerciseSection, setExerciseSection] = useState(decodedTitle);
  const [exerciseType, setExerciseType] = useState("QUIZ");
  const [exerciseTitle, setExerciseTitle] = useState("");
  const [exerciseDesc, setExerciseDesc] = useState("");
  const [ownedBy, setOwnedBy] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const fetchCompleted = useRef(false);

  useEffect(() => {
    if (!user || fetchCompleted.current) return;

    const fetchExerciseSet = async () => {
      try {
        if (idSet) {
          const response = await axios.get(`${API_BASE}/exercise/sets/view/${idSet}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          const setData = response.data;
          setExerciseSection(setData.exerciseSection);
          setExerciseType(setData.exerciseType);
          setExerciseTitle(setData.exerciseTitle);
          setExerciseDesc(setData.exerciseDesc);
          setOwnedBy(setData.ownedBy);
        } else {
          setOwnedBy(user.idUser);
        }
      } catch (error) {
        console.error("Failed to fetch exercise set:", error);
      }
    };

    fetchExerciseSet();
    fetchCompleted.current = true;
  }, [idSet, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!exerciseTitle.trim()) {
      alert("Title is required!");
      return;
    }

    const exerciseSet = {
      idExerciseSet: idSet,
      exerciseSection,
      exerciseType,
      exerciseTitle,
      exerciseDesc,
      ownedBy,
    };

    try {
      if (idSet) {
        await axios.put(
          `${API_BASE}/exercise/sets/update/${idSet}`,
          exerciseSet,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        navigate(`/exercise-sets/${idSet}`);
      } else {
        const response = await axios.post(
          `${API_BASE}/exercise/sets/add`,
          exerciseSet,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const newId = response.data.idExerciseSet;
        navigate(`/exercise-sets/${newId}`);
      }
    } catch (error) {
      console.error("Failed to submit exercise set:", error);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="form-container">
      <h2>{idSet ? "Kemaskini Set Latihan" : "Tambah Set Latihan"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="exerciseSection">Topik:</label>
          <input
            id="exerciseSection"
            type="text"
            className="form-input"
            value={exerciseSection}
            onChange={(e) => setExerciseSection(e.target.value)}
            placeholder="e.g. Chapter 1"
          />
        </div>
        <div className="form-field">
          <label htmlFor="exerciseType">Jenis Latihan:</label>
          <select
            id="exerciseType"
            className="form-input"
            value={exerciseType}
            onChange={(e) => setExerciseType(e.target.value)}
          >
            <option value="QUIZ">QUIZ</option>
            <option value="THEMATIC">THEMATIC</option>
            <option value="CUMULATIVE">CUMULATIVE</option>
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="exerciseTitle">Tajuk:</label>
          <input
            id="exerciseTitle"
            type="text"
            className="form-input"
            value={exerciseTitle}
            onChange={(e) => setExerciseTitle(e.target.value)}
            placeholder="Enter exercise title"
          />
        </div>
        <div className="form-field">
          <label htmlFor="exerciseDesc">Keterangan:</label>
          <textarea
            id="exerciseDesc"
            className="form-input"
            rows="3"
            value={exerciseDesc}
            onChange={(e) => setExerciseDesc(e.target.value)}
            placeholder="Enter a short description"
          />
        </div>
        <div className="form-button-group">
          <button type="submit" className="form-button">
            Hantar
          </button>
          <button type="button" onClick={handleCancel} className="form-button cancel">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

export default ExerciseSetForm;

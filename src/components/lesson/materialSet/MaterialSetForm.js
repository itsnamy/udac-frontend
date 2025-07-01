import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../../style/formStyle.css";

const MaterialSetForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // ID for edit mode
  const user = JSON.parse(localStorage.getItem("user"));
  const fetchCompleted = useRef(false);

  const [topicTitle, setTopicTitle] = useState("");
  const [topicDesc, setTopicDesc] = useState("");
  const [ownedBy, setOwnedBy] = useState("");

  useEffect(() => {
    if (!user || fetchCompleted.current) return;

    const fetchMaterialSet = async () => {
      try {
        if (id) {
          const res = await axios.get(`http://localhost:8080/material/set/view/${id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          const { topicTitle, topicDesc, ownedBy } = res.data;
          setTopicTitle(topicTitle);
          setTopicDesc(topicDesc);
          setOwnedBy(ownedBy);
        } else {
          setOwnedBy(user.idUser);
        }
      } catch (err) {
        console.error("Failed to fetch material set", err);
        alert("Gagal mendapatkan data kursus pembelajaran.");
      }
    };

    fetchMaterialSet();
    fetchCompleted.current = true;
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!topicTitle.trim()) {
      alert("Sila masukkan tajuk.");
      return;
    }

    const payload = {
      idMaterialSet: id,
      topicTitle,
      topicDesc,
      ownedBy
    };

    try {
      if (id) {
        await axios.put(
          `http://localhost:8080/material/set/update/${id}`,
          payload,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        navigate(`/material/set/view/${id}`);
      } else {
        const response = await axios.post(
          "http://localhost:8080/material/set/add",
          payload,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const newId = response.data.idMaterialSet;
        navigate(`/material/set/view/${newId}`);
      }
    } catch (err) {
      console.error("Failed to save material set", err);
      alert("Gagal menyimpan data kursus.");
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="form-container">
      <h2>{id ? "KemasKini" : "Tambah"} Kursus Pembelajaran</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="topicTitle">Tajuk: </label>
          <input
            id="topicTitle"
            type="text"
            className="form-input"
            value={topicTitle}
            onChange={(e) => setTopicTitle(e.target.value)}
            placeholder="Contoh: Topik 2.1 - Pangkalan Data"
          />
        </div>
        <div className="form-field">
          <label htmlFor="topicDesc">Keterangan: </label>
          <textarea
            id="topicDesc"
            className="form-input"
            rows="3"
            value={topicDesc}
            onChange={(e) => setTopicDesc(e.target.value)}
            placeholder="Contoh: Penerangan ringkas tentang kandungan topik ini"
          />
        </div>
        <div className="form-button-group">
          <button type="submit" className="form-button">Hantar</button>
          <button type="button" onClick={handleCancel} className="form-button cancel">Batal</button>
        </div>
      </form>
    </div>
  );
};

export default MaterialSetForm;

import React, { useState, useEffect } from "react";
import axios from "axios";
//import "../../../style/formStyle.css";

function VideoForm({ video = null, onClose, idSubtopicSection }) {
  const [videoTitle, setVideoTitle] = useState(video ? video.videoTitle || "" : "");
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (video) {
      setVideoTitle(video.videoTitle || "");
      setVideoFile(null);
      setErrorMsg("");
    }
  }, [video]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!videoTitle.trim()) {
      setErrorMsg("Video title is required.");
      return;
    }

    if (!video && !videoFile) {
      setErrorMsg("Please upload a video file.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("videoTitle", videoTitle);
      formData.append("idSubtopicSection", idSubtopicSection || "");
      if (videoFile) {
        formData.append("file", videoFile);
      }

      if (!video) {
        await axios.post("http://localhost:8080/material/video/add", formData, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Video added successfully");
      } else {
        await axios.put(`http://localhost:8080/material/video/update/${video.idVideo}`, formData, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Video updated successfully");
      }
      onClose();
    } catch (error) {
      console.error("Failed to submit video:", error);
      setErrorMsg("Failed to submit video. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>{video ? "Kemaskin Video" : "Tambah Video"}</h2>
      {errorMsg && <p style={{ color: "red", marginBottom: 10 }}>{errorMsg}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="videoTitle">Tajuk Video</label>
          <input
            id="videoTitle"
            type="text"
            className="form-input"
            placeholder="Enter video title"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            disabled={uploading}
          />
        </div>

        <div className="form-field">
          <label htmlFor="videoFile">
            {video ? "Replace Video File (optional)" : "Upload Video File *"}
          </label>
          <input
            id="videoFile"
            type="file"
            accept="video/*"
            className="form-input"
            onChange={(e) => setVideoFile(e.target.files[0])}
            disabled={uploading}
          />
          {videoFile && <p>Pilihan Fail: {videoFile.name}</p>}
        </div>

        {video && video.videoPath && (
          <div className="form-field">
            <label>Fail Video Semasa:</label>
            <a href={`/video/${video.idVideo}`} target="_blank" rel="noopener noreferrer">
              Lihat Video Semasa
            </a>
          </div>
        )}

        <div className="form-button-group">
          <button
            type="submit"
            className="form-button"
            disabled={uploading}
          >
            Hantar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="form-button cancel"
            disabled={uploading}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

export default VideoForm;

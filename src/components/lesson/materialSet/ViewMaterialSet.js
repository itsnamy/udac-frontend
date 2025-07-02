import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Pencil, Trash2, Plus, Eye } from 'lucide-react';
import VideoForm from "../videos/VideoForm";
import { buildSequentialContent } from "./BuildLearningFlow";
import API_BASE from "../../../config";

const ViewMaterialSet = () => {
  const { id } = useParams(); // material set ID
  const [materialSet, setMaterialSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoverBack, setHoverBack] = useState(false);

  const [sectionModalMode, setSectionModalMode] = useState(null); // 'add' or 'edit'
  const [currentSectionTitle, setCurrentSectionTitle] = useState("");
  const [sectionBeingEdited, setSectionBeingEdited] = useState(null);


  const [videoFormOpen, setVideoFormOpen] = useState(false);
  const [videoBeingEdited, setVideoBeingEdited] = useState(null);
  const [videoSectionId, setVideoSectionId] = useState(null);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchMaterialSet = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/material/set/subtopics/${id}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
  
      const flattenedSubtopics = response.data.subtopicSections.map((item) => ({
        ...item.subtopicSection,
        videos: item.videoMaterial ? [item.videoMaterial] : [],
        notes: item.noteMaterial ? [item.noteMaterial] : [],
        exerciseSet: item.exerciseBySet || null,
      }));
  
      setMaterialSet({
        ...response.data.materialSet,
        subtopicSections: flattenedSubtopics,
      });
    } catch (error) {
      console.error("Failed to fetch material set", error);
      alert("Could not load material set.");
    } finally {
      setLoading(false);
    }
  }, [id, user?.token]);
  
  useEffect(() => {
    fetchMaterialSet();
  }, [fetchMaterialSet]);

  const handleLearning = () => {
    const sequence = buildSequentialContent(materialSet);
    if (sequence.length === 0) {
      alert("Tiada kandungan untuk dipelajari.");
      return;
    }
  
    navigate(`/learning/flow/0`, {
      state: {
        sequence,
        materialSetId: materialSet.idMaterialSet, 
      },
    });
  };
  
  const handleBack = () => {
    navigate("/learning-materials");
  };

  const handleEditSet = () => {
    navigate(`/material/set/edit/${id}`);
  };

  const handleDeleteSet = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this material set?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE}/material/set/delete/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      alert("Material set deleted successfully.");
      navigate("/learning-materials");
    } catch (error) {
      console.error("Failed to delete material set", error);
      alert("Delete failed.");
    }
  };

  const handleAddSection = () => {
    setSectionModalMode("add");
    setCurrentSectionTitle("");
    setSectionBeingEdited(null);
  };

  const handleEditSection = (section) => {
    setSectionModalMode("edit");
    setCurrentSectionTitle(section.subtopicTitle);
    setSectionBeingEdited(section);
  };

  const handleSubmitSection = async () => {
    if (!currentSectionTitle.trim()) {
      alert("Please enter a section title.");
      return;
    }

    try {
      if (sectionModalMode === "add") {
        const response = await axios.post(
          `${API_BASE}/material/subtopic/add`,
          {
            idMaterialSet: id,
            subtopicTitle: currentSectionTitle,
          },
          {
            headers: { Authorization: `Bearer ${user?.token}` },
          }
        );

        const newSection = response.data;

        setMaterialSet((prev) => ({
          ...prev,
          subtopicSections: [
            ...prev.subtopicSections,
            { ...newSection, videos: [], notes: [], exerciseSet: null },
          ],
        }));
      } else if (sectionModalMode === "edit" && sectionBeingEdited) {
        const response = await axios.put(
          `${API_BASE}/material/subtopic/update/${sectionBeingEdited.idSubtopicSection}`,
          {
            ...sectionBeingEdited,
            subtopicTitle: currentSectionTitle,
          },
          {
            headers: { Authorization: `Bearer ${user?.token}` },
          }
        );

        const updated = response.data;

        setMaterialSet((prev) => ({
          ...prev,
          subtopicSections: prev.subtopicSections.map((s) =>
            s.idSubtopicSection === updated.idSubtopicSection ? updated : s
          ),
        }));
      }

      setSectionModalMode(null);
      setCurrentSectionTitle("");
      setSectionBeingEdited(null);
    } catch (error) {
      console.error("Failed to save subtopic section", error);
      alert("Failed to save section.");
    }
  };

  const handleDeleteSection = async (sectionId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this section?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE}/material/subtopic/delete/${sectionId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      setMaterialSet((prev) => ({
        ...prev,
        subtopicSections: prev.subtopicSections.filter(
          (section) => section.idSubtopicSection !== sectionId
        ),
      }));
    } catch (error) {
      console.error("Failed to delete subtopic section", error);
      alert("Failed to delete section.");
    }
  };

  // Video related functions
  const openViewVideoPage = (videoId) => {
    navigate(`/video/${videoId}`);
  };

  const openAddVideoForm = (sectionId) => {
    console.log("Opening Video Form:", sectionId);
    setVideoBeingEdited(null);
    setVideoSectionId(sectionId);
    setVideoFormOpen(true);
  };

  const openEditVideoForm = (video) => {
    console.log("Opening Video edit Form:", video);
    setVideoBeingEdited(video);
    setVideoSectionId(video.idSubtopicSection);
    setVideoFormOpen(true);
  };

  const closeVideoForm = () => {
    setVideoFormOpen(false);
    setVideoBeingEdited(null);
    setVideoSectionId(null);
    fetchMaterialSet();
  };

  const handleDeleteVideo = async (videoId) => {
    const confirmed = window.confirm("Are you sure you want to delete this video?");
    if (!confirmed) return;
  
    try {
      await axios.delete(`${API_BASE}/material/video/delete/${videoId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      setMaterialSet((prev) => ({
        ...prev,
        subtopicSections: prev.subtopicSections.map((section) => ({
          ...section,
          videos: section.videos?.filter((v) => v.idVideo !== videoId),
        })),
      }));
    } catch (error) {
      console.error("Failed to delete video", error);
      alert("Failed to delete video.");
    }
  };

  // Note related functions
  const handleAddNote = (sectionId) => {
    navigate(`/notes/add/${sectionId}`);
  };

  const handleViewNote = (noteId) => {
    navigate(`/notes/view/${noteId}`);
  };
  
  const handleEditNote = (noteId) => {
    console.log("Editing note with ID:", noteId);
    navigate(`/notes/edit/${noteId}`);
  };
  
  const handleDeleteNote = async (noteId) => {
    const confirmed = window.confirm("Are you sure you want to delete this note?");
    if (!confirmed) return;
  
    try {
      await axios.delete(`${API_BASE}/material/note/delete/${noteId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
  
      setMaterialSet((prev) => ({
        ...prev,
        subtopicSections: prev.subtopicSections.map((section) => ({
          ...section,
          notes: section.notes?.filter((n) => n.idMaterialNote !== noteId),
        })),
      }));
    } catch (error) {
      console.error("Failed to delete note", error);
      alert("Failed to delete note.");
    }
  };
  

  // Quiz related functions
  const handleViewQuiz = (quizId) => {
    navigate(`/exercises/view/${quizId}`, { state: { fromMaterialSetId: id, exerciseType: 'QUIZ' } });
  };

  const handleAddQuiz = (topicTitle) => {
    const encodedTitle = encodeURIComponent(topicTitle);
    navigate(`/exercise-sets/add/${encodedTitle}`);
  };

  const handleManageQuiz = (quizId) => {
    navigate(`/exercise-sets/${quizId}`, { state: { fromMaterialSetId: id, exerciseType: 'QUIZ' } });
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
  
    try {
      await axios.delete(`${API_BASE}/exercise/sets/delete/${quizId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
  
      alert("Quiz deleted successfully.");

      setMaterialSet((prev) => ({
        ...prev,
        subtopicSections: prev.subtopicSections.map((section) => {
          if (section.exerciseSet?.exerciseSet?.idExerciseSet === quizId) {
            return { ...section, exerciseSet: null };
          }
          return section;
        }),
      }));
  
    } catch (error) {
      console.error("Failed to delete quiz:", error);
      alert("Failed to delete quiz.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!materialSet) return <p>Material not found.</p>;

  return (
    <div className="container">
      <div className="header">
        <h2 className="title">{materialSet.topicTitle}</h2>
        {user?.role === "ADMIN" && (
          <div className="leftAligned">
            <button className="editButton" onClick={handleEditSet}>
              Kemaskini Set
            </button>
            <button className="deleteButton" onClick={handleDeleteSet}>
              Padam Set
            </button>
          </div>
        )}

        {user?.role === "STUDENT" && (
          <div className="leftAligned">
            <button className="editButton" onClick={handleLearning}>
              Mula Pembelajaran
            </button>
          </div>
        )}
        <p className="subtitle">Keterangan:</p>
        <p className="desc">{materialSet.topicDesc}</p>

        {user?.role === "ADMIN" && (
          <button className="addButton" onClick={handleAddSection}>
            Tambah Subtopik
          </button>
        )}
      </div>

      {materialSet.subtopicSections && materialSet.subtopicSections.length > 0 ? (
        materialSet.subtopicSections.map((sub) => (
          <div key={sub.idSubtopicSection} className="sectionCard">
            <h3 className="sectionTitle">
              {sub.subtopicTitle}
            </h3>

            {user?.role === "ADMIN" && (
              <div className="buttonGroup">
                <button
                  className="editButton"
                  onClick={() => handleEditSection(sub)}
                >
                  Kemaskini Subtopik
                </button>
                <button
                  className="deleteButton"
                  onClick={() => handleDeleteSection(sub.idSubtopicSection)}
                >
                  Padam
                </button>
              </div>
            )}

            {/* Videos */}
            <div className="material-block">
              {sub.videos && sub.videos.length > 0 ? (
                sub.videos.map((vid) => (
                  <div key={vid.idVideo} className="material-card">
                    <p className="material-title">Video: {vid.videoTitle || vid.title}</p>
                    <div className="material-actions">
                    <button
                        className="icon-button"
                        onClick={() => openViewVideoPage(vid.idVideo)}
                        title="View Video"
                      >
                        <Eye size={18} />
                      </button>
                      {user?.role === "ADMIN" && (
                        <><button
                          className="icon-button"
                          onClick={() => openEditVideoForm(vid)}
                          title="Edit Video"
                        >
                          <Pencil size={18} />
                        </button><button
                          className="icon-button delete"
                          onClick={() => handleDeleteVideo(vid.idVideo)}
                          title="Delete Video"
                        >
                            <Trash2 size={18} />
                          </button></>
                        )}
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="material-card">
                    <p className="material-title">Tiada Video Tersedia</p>
                    {user?.role === "ADMIN" && (
                      <><button
                        className="icon-button"
                        onClick={() => openAddVideoForm(sub.idSubtopicSection)}
                        title="Add Video"
                      >
                        <Plus size={20} />
                      </button></>
                    )}
                  </div>
                </>
              )}

            </div>

            {/* Notes */}
            <div className="material-block">
              {sub.notes && sub.notes.length > 0 ? (
                sub.notes.map((note) => (
                  <div key={note.idMaterialNote} className="material-card">
                    <p className="material-title">Nota: {note.noteTitle}</p>
                    <div className="material-actions">
                      <button
                        className="icon-button"
                        onClick={() => handleViewNote(note.idMaterialNote)}
                        title="View Note"
                      >
                        <Eye size={18} />
                      </button>
                      {user?.role === "ADMIN" && (
                        <><button
                          className="icon-button"
                          onClick={() => handleEditNote(note.idMaterialNote)}
                          title="Edit Note"
                        >
                          <Pencil size={18} />
                        </button><button
                          className="icon-button delete"
                          onClick={() => handleDeleteNote(note.idMaterialNote, sub.idSubtopicSection)}
                          title="Delete Note"
                        >
                            <Trash2 size={18} />
                          </button></>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="material-card">
                  <p className="material-title">Tiada Nota Tersedia</p>
                  {user?.role === "ADMIN" && (
                    <><button
                      className="icon-button"
                      onClick={() => handleAddNote(sub.idSubtopicSection)}
                      title="Add Note"
                    >
                      <Plus size={20} />
                    </button></>
                  )}
                </div>
              )}
            </div>

            {/* Quiz/Exercise */}
            <div className="material-block">
              {sub.exerciseSet && sub.exerciseSet.exerciseSet ? (
                <div key={sub.exerciseSet.exerciseSet.idExerciseSet} className="material-card">
                  <p className="material-title">Kuiz: {sub.exerciseSet.exerciseSet.exerciseTitle}</p>
                  <div className="material-actions">
                    <button
                      className="icon-button"
                      onClick={() => handleViewQuiz(sub.exerciseSet.exerciseSet.idExerciseSet)}
                      title="View Quiz"
                    >
                      <Eye size={18} />
                    </button>
                    {user?.role === "ADMIN" && (
                      <><button
                          className="icon-button"
                          onClick={() => handleManageQuiz(sub.exerciseSet.exerciseSet.idExerciseSet)}
                          title="Edit Quiz"
                        >
                          <Pencil size={18} />
                        </button><button
                          className="icon-button delete"
                          onClick={() => handleDeleteQuiz(sub.exerciseSet.exerciseSet.idExerciseSet)}
                          title="Delete Quiz"
                        >
                            <Trash2 size={18} />
                          </button></>
                    )}
                  </div>
                </div>
              ) : (
                <div className="material-card">
                  <p className="material-title">Tiada Kuiz Tersedia</p>
                  {user?.role === "ADMIN" && (
                    <><button
                      className="icon-button"
                      onClick={() => handleAddQuiz(sub.subtopicTitle)}
                      title="Add Quiz"
                    >
                      <Plus size={20} />
                    </button></>
                  )}
                </div>
              )}
            </div>


          </div>
        ))
      ) : (
        <p>Tiada Subtopik Tersedia </p>
      )}

      <button
        onClick={handleBack}
        className={`backButton ${hoverBack ? "backButtonHover" : ""}`}
        onMouseEnter={() => setHoverBack(true)}
        onMouseLeave={() => setHoverBack(false)}
      >
        Kembali
      </button>

      {sectionModalMode && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>
              {sectionModalMode === "add"
                ? "Tambah Subtopik"
                : "Kemaskini Subtopik"}
            </h3>
            <input
              type="text"
              value={currentSectionTitle}
              onChange={(e) => setCurrentSectionTitle(e.target.value)}
              placeholder="Masukkan tajuk subtopik"
            />
            <div className="modal-actions">
              <button onClick={handleSubmitSection}>
                Hantar
              </button>
              <button
                onClick={() => {
                  setSectionModalMode(null);
                  setCurrentSectionTitle("");
                  setSectionBeingEdited(null);
                }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VideoForm Modal */}
      {videoFormOpen && (
        <div className="modal-backdrop ">
          <div className="modalContainer videoFormModal">
            <VideoForm
              idSubtopicSection={videoSectionId}
              video={videoBeingEdited}
              onClose={closeVideoForm}
            />
          </div>
        </div>
      )}

      {/* Inline styling or move to CSS file */}
      <style>{`
        .container {
          padding: 32px 48px;
          max-width: 95%;
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

        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: #fff;
          border-radius: 10px;
          padding: 24px 28px;
          width: 420px;
          max-width: 90%;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          animation: fadeIn 0.3s ease-in-out;
        }

        .modal h3 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #222;
        }

        .modal input {
          width: 94%;
          padding: 12px 14px;
          font-size: 15px;
          border: 1.5px solid #ccc;
          border-radius: 8px;
          margin-bottom: 20px;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          background-color: #fdfdfd;
        }

        .modal input:focus {
          border-color: #3f87f5;
          outline: none;
          box-shadow: 0 0 6px rgba(63, 135, 245, 0.35);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .modal-actions button {
          padding: 10px 22px;
          font-size: 15px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.3s ease;
        }

        .modal-actions button:first-child {
          background-color: #3498db;
          color: white;
        }

        .modal-actions button:first-child:hover {
          background-color: #2f89c5;
        }

        .modal-actions button:last-child {
          background-color: #7d878f;
          color: white;
        }

        .modal-actions button:last-child:hover {
          background-color: #5a6268;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .material-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fff;
          box-shadow: 0 1px 6px rgb(0 0 0 / 0.1);
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 12px;
          transition: box-shadow 0.2s ease;
        }
        .material-card:hover {
          box-shadow: 0 4px 15px rgb(0 0 0 / 0.15);
        }

        .material-title {
          font-weight: 600;
          font-size: 16px;
          color: #222;
          margin: 0;
          flex-grow: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .material-actions {
          display: flex;
          gap: 8px;
        }

        .icon-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: background 0.2s;
          color: #555;
        }
        .icon-button:hover {
          background-color: #f0f0f0;
          color: #111;
        }

        .icon-button.delete:hover {
          color: #c00;
          background-color: #fee;
        }
      `}</style>
    </div>
  );
};

export default ViewMaterialSet;

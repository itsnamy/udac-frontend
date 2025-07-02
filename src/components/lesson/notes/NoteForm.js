import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import ToolBar from "../../common/ToolBar.js";
import "../../../style/formStyle.css";
import "../../../style/editorStyle.css";
import API_BASE from "../../../config"; 

function NoteForm() {
  const { sectionId, noteId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const isEdit = location.pathname.includes("/edit/");
  const [title, setTitle] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Image,
      Underline,
      TextStyle,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Write your note here...",
      }),
    ],
    content: "",
  });

  useEffect(() => {
    if (!editor) return;

    if (isEdit && noteId) {
      axios
        .get(`${API_BASE}/material/note/view/${noteId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        .then((res) => {
          const note = res.data;
          setTitle(note.noteTitle || "");
          if (note.noteContent) {
            editor.commands.setContent(note.noteContent);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch note:", err);
        });
    }
  }, [editor, isEdit, noteId, user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const content = editor?.getHTML() || "";

    if (!title.trim() || !content.trim()) {
      setErrorMsg("Note title and content are required.");
      return;
    }

    const payload = {
      noteTitle: title,
      noteContent: content,
      idSubtopicSection: sectionId,
    };

    try {
      if (isEdit) {
        await axios.put(`${API_BASE}/material/note/update/${noteId}`, payload, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Note updated");
      } else {
        await axios.post(`${API_BASE}/material/note/add`, payload, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Note added");
      }
      navigate(-1);
    } catch (err) {
      console.error("Failed to submit note:", err);
      setErrorMsg("Failed to submit note. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h2>{isEdit ? "Kemaskini Nota" : "Tambah Nota"}</h2>
      {errorMsg && <p style={{ color: "red", marginBottom: 10 }}>{errorMsg}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="title">Tajuk Nota:</label>
          <input
            id="title"
            type="text"
            className="form-input"
            placeholder="Enter note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Kandungan Nota:</label>
          <ToolBar editor={editor} />
          <EditorContent editor={editor} className="editor-content" />
        </div>

        <div className="form-button-group">
          <button type="submit" className="form-button">Hantar</button>
          <button type="button" onClick={() => navigate(-1)} className="form-button cancel">Batal</button>
        </div>
      </form>
    </div>
  );
}

export default NoteForm;

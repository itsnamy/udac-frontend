import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { Trash2 } from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

import ToolBar from "../common/ToolBar";
import "../../style/formStyle.css";
import API_BASE from "../../config"; 

const sqlTypes = [
  "INT", "VARCHAR(50)", "TEXT", "FLOAT", "DOUBLE", "DATE", "DATETIME", "TIME"
];

const TutorialForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [exampleCode, setExampleCode] = useState("");
  const [tableName, setTableName] = useState("Students");
  const [columns, setColumns] = useState([{ name: "id", type: "INT" }, { name: "name", type: "VARCHAR(50)" }]);
  const [rows, setRows] = useState([{ id: "", name: "" }]);
  const [loading, setLoading] = useState(isEdit);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Image,
      Underline,
      TextStyle,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Tulis arahan tutorial di sini..." })
    ],
    content: "",
  });

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchTutorial = async () => {
      if (!isEdit) return;
      try {
        const res = await axios.get(`${API_BASE}/tutorial/set/${id}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const tutorial = res.data;
        setTitle(tutorial.tutorialTitle);
        setExampleCode(tutorial.exampleCode);
        if (editor) editor.commands.setContent(tutorial.tutorialInstructions);

        const dataset = JSON.parse(tutorial.datasetJson);
        const createSQL = dataset.createTableSQL;
        const insertSQL = dataset.insertStatements;

        const parsedCols = createSQL
          .substring(createSQL.indexOf("(") + 1, createSQL.lastIndexOf(")"))
          .split(",")
          .map(col => {
            const [name, ...rest] = col.trim().split(" ");
            return { name, type: rest.join(" ") };
          });
        setTableName(createSQL.split(" ")[2]);
        setColumns(parsedCols);

        const parsedRows = insertSQL.map(stmt => {
          const valuesPart = stmt.substring(stmt.indexOf("(") + 1, stmt.lastIndexOf(")"));
          const values = valuesPart.split(/,(?=(?:[^']*'[^']*')*[^']*$)/).map(v => v.trim().replace(/^'|'$/g, ""));
          const row = {};
          parsedCols.forEach((col, i) => row[col.name] = values[i]);
          return row;
        });
        setRows(parsedRows);

      } catch (err) {
        alert("Gagal memuatkan data tutorial.");
      } finally {
        setLoading(false);
      }
    };
    fetchTutorial();
  }, [id, editor, isEdit, user?.token]);

  const generateDatasetJson = () => {
    const colDefs = columns.map(col => `${col.name} ${col.type}`).join(", ");
    const createTableSQL = `CREATE TABLE ${tableName} (${colDefs});`;

    const insertStatements = rows
      .filter(row => columns.every(col => row[col.name] !== ""))
      .map(row => {
        const values = columns.map(col => {
          const val = row[col.name];
          return isNaN(val) ? `'${val}'` : val;
        });
        return `INSERT INTO ${tableName} VALUES (${values.join(", ")});`;
      });

    return JSON.stringify({ createTableSQL, insertStatements }, null, 2);
  };

  const handleSubmit = async () => {
    const datasetJson = generateDatasetJson();

    const payload = {
      tutorialTitle: title,
      tutorialInstructions: editor?.getHTML() || "",
      exampleCode,
      datasetJson,
    };

    try {
      if (isEdit) {
        await axios.put(`${API_BASE}/tutorial/set/update/${id}`, payload, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
      } else {
        await axios.post(`${API_BASE}/tutorial/set/add`, payload, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
      }
      navigate(-1);
    } catch (err) {
      alert("Gagal menyimpan tutorial.");
    }
  };

  const updateRow = (index, key, value) => {
    const updated = [...rows];
    updated[index][key] = value;
    setRows(updated);
  };

  if (loading) return <p>Memuatkan borang...</p>;

  return (
    <div className="form-container">
      <h2>{isEdit ? "Kemaskini" : "Tambah"} SQL Tutorial</h2>

      <div className="form-field">
        <label>Tajuk Tutorial</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="form-field">
        <label>Arahan Tutorial</label>
        <ToolBar editor={editor} />
        <EditorContent editor={editor} className="editor-content" />
      </div>

      <div className="form-field">
        <label>Contoh SQL</label>
        <textarea
          value={exampleCode}
          onChange={(e) => setExampleCode(e.target.value)}
          className="form-input"
          rows={3}
        />
      </div>

      <div className="form-field">
        <label>Nama Jadual</label>
        <input
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="form-field">
        <label>Struktur Jadual</label>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Ruangan</th>
                <th>Jenis Data</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {columns.map((col, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      type="text"
                      value={col.name}
                      onChange={(e) => {
                        const updated = [...columns];
                        updated[idx].name = e.target.value;
                        setColumns(updated);
                      }}
                      placeholder="cth: id / name"
                    />
                  </td>
                  <td>
                    <select
                      value={col.type}
                      onChange={(e) => {
                        const updated = [...columns];
                        updated[idx].type = e.target.value;
                        setColumns(updated);
                      }}
                    >
                      {sqlTypes.map(type => (
                        <option key={type}>{type}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        setColumns(columns.filter((_, i) => i !== idx))
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className="add-button"
          onClick={() =>
            setColumns([...columns, { name: "", type: "INT" }])
          }
        >
          Tambah Kolum
        </button>
      </div>

      <div className="form-field">
        <label>Data Baris</label>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx}>{col.name || `Kolum ${idx + 1}`}</th>
                ))}
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {columns.map((col) => (
                    <td key={col.name}>
                      <input
                        type="text"
                        value={row[col.name] || ""}
                        onChange={(e) =>
                          updateRow(rIdx, col.name, e.target.value)
                        }
                        placeholder={col.name}
                      />
                    </td>
                  ))}
                  <td>
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        setRows(rows.filter((_, i) => i !== rIdx))
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className="add-button"
          onClick={() => setRows([...rows, {}])}
        >
          Tambah Baris
        </button>
      </div>

      <div className="form-button-group">
        <button onClick={handleSubmit} className="form-button">
          {isEdit ? "Simpan Perubahan" : "Tambah Tutorial"}
        </button>
        <button onClick={() => navigate(-1)} className="form-button cancel">
          Batal
        </button>
      </div>
    </div>
  );
};

export default TutorialForm;

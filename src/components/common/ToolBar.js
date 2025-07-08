import React from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Underline as UnderlineIcon,
  Minus,
} from "lucide-react";

const ToolBar = ({ editor }) => {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt("Enter image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    const url = window.prompt("Enter URL");
    if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertDivider = () => {
    editor.chain().focus().setHorizontalRule().run();
  };

  return (
    <div className="toolbar">
      {/* Text Style */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`toolbar-btn ${editor.isActive("bold") ? "active" : ""}`}
        type="button"
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`toolbar-btn ${editor.isActive("italic") ? "active" : ""}`}
        type="button"
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`toolbar-btn ${editor.isActive("underline") ? "active" : ""}`}
        type="button"
        title="Underline"
      >
        <UnderlineIcon size={16} />
      </button>


      <div className="toolbar-divider" />

      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`toolbar-btn ${editor.isActive("heading", { level: 1 }) ? "active" : ""}`}
        type="button"
        title="Heading 1"
      >
        <Type size={16} />
        <span className="btn-label">H1</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`toolbar-btn ${editor.isActive("heading", { level: 2 }) ? "active" : ""}`}
        type="button"
        title="Heading 2"
      >
        <Type size={14} />
        <span className="btn-label">H2</span>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`toolbar-btn ${editor.isActive("heading", { level: 3 }) ? "active" : ""}`}
        type="button"
        title="Heading 3"
      >
        <Type size={14} />
        <span className="btn-label">H3</span>
      </button>

      <div className="toolbar-divider" />

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`toolbar-btn ${editor.isActive("bulletList") ? "active" : ""}`}
        type="button"
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`toolbar-btn ${editor.isActive("orderedList") ? "active" : ""}`}
        type="button"
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </button>

      <div className="toolbar-divider" />

      {/* Links & Media */}
      <button
        onClick={addLink}
        className={`toolbar-btn ${editor.isActive("link") ? "active" : ""}`}
        type="button"
        title="Add Link"
      >
        <Link2 size={16} />
      </button>
      {/*
      <button
        onClick={addImage}
        className="toolbar-btn"
        type="button"
        title="Insert Image"
      >
        <ImageIcon size={16} />
      </button>
      */}
      <button
        onClick={insertDivider}
        className="toolbar-btn"
        type="button"
        title="Insert Divider"
      >
        <Minus size={16} />
      </button>

      <div className="toolbar-divider" />

      {/* Alignment */}
      <button
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={`toolbar-btn ${editor.isActive({ textAlign: "left" }) ? "active" : ""}`}
        type="button"
        title="Align Left"
      >
        <AlignLeft size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={`toolbar-btn ${editor.isActive({ textAlign: "center" }) ? "active" : ""}`}
        type="button"
        title="Center"
      >
        <AlignCenter size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={`toolbar-btn ${editor.isActive({ textAlign: "right" }) ? "active" : ""}`}
        type="button"
        title="Align Right"
      >
        <AlignRight size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        className={`toolbar-btn ${editor.isActive({ textAlign: "justify" }) ? "active" : ""}`}
        type="button"
        title="Justify"
      >
        <AlignJustify size={16} />
      </button>

      <div className="toolbar-divider" />

      {/* Clear Formatting */}
      <button
        onClick={() =>
          editor.chain().focus().clearNodes().unsetAllMarks().run()
        }
        className="toolbar-btn"
        type="button"
        title="Clear Formatting"
      >
        <AlignLeft size={16} />
      </button>
    </div>

  );
};

export default ToolBar;

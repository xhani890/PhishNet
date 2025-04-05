import React from 'react';
import { useCurrentEditor } from '@tiptap/react';

const CustomToolbar = ({ editor, theme, onImageUpload, onInsertToken, onTranslate }) => {
  return (
    <div className={`toolbar ${theme}-toolbar`}>
      {/* File Dropdown */}
      <div className="toolbar-section">
        <select className="toolbar-dropdown">
          <option>File</option>
          <option>New</option>
          <option>Save</option>
        </select>
      </div>

      {/* Edit Dropdown */}
      <div className="toolbar-section">
        <select className="toolbar-dropdown">
          <option>Edit</option>
          <option>Undo</option>
          <option>Redo</option>
        </select>
      </div>

      {/* View Dropdown */}
      <div className="toolbar-section">
        <select className="toolbar-dropdown">
          <option>View</option>
          <option>Zoom In</option>
          <option>Zoom Out</option>
        </select>
      </div>

      {/* Insert Dropdown */}
      <div className="toolbar-section">
        <select className="toolbar-dropdown">
          <option>Insert</option>
          <option>Table</option>
          <option>Link</option>
        </select>
      </div>

      {/* Format Dropdown */}
      <div className="toolbar-section">
        <select 
          className="toolbar-dropdown"
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
        >
          <option value="">Format</option>
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
        </select>
      </div>

      {/* Paragraph Styles */}
      <div className="toolbar-section">
        <select
          className="toolbar-dropdown"
          onChange={e => {
            const level = parseInt(e.target.value);
            level ? 
              editor.chain().focus().toggleHeading({ level }).run() :
              editor.chain().focus().setParagraph().run();
          }}
        >
          <option value="">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
        </select>
      </div>

      {/* Font Size */}
      <div className="toolbar-section">
        <select
          className="toolbar-dropdown"
          onChange={e => editor.chain().focus().setFontSize(e.target.value).run()}
        >
          <option value="">Size</option>
          <option value="12pt">12pt</option>
          <option value="14pt">14pt</option>
        </select>
      </div>

      {/* Basic Formatting */}
      <div className="toolbar-section">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'active' : ''}
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'active' : ''}
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'active' : ''}
        >
          U
        </button>
      </div>

      {/* Alignment */}
      <div className="toolbar-section">
        <select
          className="toolbar-dropdown"
          onChange={e => editor.chain().focus().setTextAlign(e.target.value).run()}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      {/* Special Features */}
      <div className="toolbar-section">
        <button className="token-button" onClick={onInsertToken}>
          CyberRiskAware Token
        </button>
        <button className="image-button" onClick={onImageUpload}>
          Insert Image
        </button>
        <button className="translate-button" onClick={onTranslate}>
          Translate
        </button>
      </div>
    </div>
  );
};

export default CustomToolbar;
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, Select, notification } from 'antd';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import FontFamily from '@tiptap/extension-font-family';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';

const TemplateModal = ({ open, onClose, theme, refreshTemplates }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      FontFamily.configure({ types: ['textStyle'] }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'tiptap-table',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'table-row',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'table-header',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'table-cell',
        },
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: theme === 'dark' ? 'dark-editor' : 'light-editor',
      },
    },
  });

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    
    input.onchange = async () => {
      const file = input.files[0];
      if (file && editor) {
        setFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          editor.chain().focus().setImage({ src: e.target.result }).run();
        };
        reader.readAsDataURL(file);
      }
    };
  };

  // Add token insertion
  const insertToken = () => {
    editor.chain().focus().insertContent('[CYBERRISKAWARE_TOKEN]').run();
  };
  const handleTranslate = () => {
    notification.info({
      message: 'Translation Service',
      description: 'Translation feature coming soon!',
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('type', values.type);
      formData.append('content', editor?.getHTML() || '');
      formData.append('subject', values.subject);
      formData.append('description', values.description);
      formData.append('complexity', values.complexity);
      if (file) formData.append('image', file);

      const response = await fetch('http://localhost:5000/api/templates', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to save template');
      
      notification.success({
        message: 'Template Saved',
        description: 'Template has been saved successfully!'
      });
      
      refreshTemplates?.();
      onClose();
    } catch (error) {
      notification.error({
        message: 'Save Failed',
        description: error.message || 'Error saving template'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open && editor) {
      editor.commands.clearContent();
    }
  }, [open, editor]);

  return (
    <Modal
      title="New Email Template"
      open={open}
      onCancel={onClose}
      className={`${theme === 'dark' ? 'dark-modal' : ''} custom-modal`}
      width={800}
      centered
      footer={[
        <Button key="back" onClick={onClose}>
          Back to List
        </Button>,
        <Button key="test">
          Send Test Mail
        </Button>,
        <Button 
          key="save" 
          type="primary" 
          loading={loading}
          onClick={handleSave}
        >
          Save Template
        </Button>
      ]}
    >
      <Form form={form} layout="vertical">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select a type' }]}
          >
            <Select
              options={[
                { value: 'phishing', label: 'Phishing - Home & Personal' },
                { value: 'training', label: 'Training' }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="complexity"
            label="Complexity"
            rules={[{ required: true, message: 'Please select complexity' }]}
          >
            <Select
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' }
              ]}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="name"
          label="Template Name"
          rules={[{ required: true, message: 'Please enter template name' }]}
        >
          <Input placeholder="Enter template name" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          name="subject"
          label="Subject"
          rules={[{ required: true, message: 'Please enter email subject' }]}
        >
          <Input placeholder="Email subject line" />
        </Form.Item>

        <Form.Item label="Body">
          <div className="editor-content">
            {editor && <EditorContent editor={editor} />}
          </div>
        </Form.Item>
        <Form.Item>
          <div className={`editor-container ${theme === 'dark' ? 'dark-editor' : ''}`}>
            <CustomToolbar 
              editor={editor} 
              onImageUpload={handleImageUpload}
              onInsertToken={insertToken}
              theme={theme}
            />
            {editor && <EditorContent editor={editor} />}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TemplateModal;
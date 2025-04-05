import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, Select, notification } from 'antd';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css'; 

const TemplateModal = ({ open, onClose, theme, refreshTemplates }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('type', values.type);
      formData.append('content', content);
      formData.append('subject', values.subject);
      formData.append('description', values.description);
      formData.append('complexity', values.complexity);

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
    if (!open) {
      form.resetFields();
      setContent('');
    }
  }, [open]);

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
          <SunEditor 
            setOptions={{
              height: 200,
              buttonList: [
                ['undo', 'redo', 'font', 'fontSize', 'formatBlock'],
                ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                ['removeFormat'],
                ['outdent', 'indent'],
                ['align', 'horizontalRule', 'list', 'table'],
                ['link', 'image', 'video'],
                ['fullScreen', 'showBlocks', 'codeView'],
                ['preview', 'print'],
                ['save']
              ],
              attributes: {
                class: theme === 'dark' ? 'dark-theme-editor' : 'light-theme-editor'
              }
            }}
            onChange={setContent}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TemplateModal;
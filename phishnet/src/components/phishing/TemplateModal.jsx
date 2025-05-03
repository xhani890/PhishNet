import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, Select, notification, Upload, message } from 'antd';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';

const TemplateModal = ({ open, onClose, theme, refreshTemplates }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [isExportable, setIsExportable] = useState(false);

  const editorOptions = {
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
    },
    resizingBar: false,
    styles: {
      'background-color': theme === 'dark' ? '#1A1A1A' : '#ffffff',
      'color': theme === 'dark' ? '#ffffff' : '#333333'
    }
  };

  // Check if form has enough data to be exportable
  useEffect(() => {
    const values = form.getFieldsValue();
    setIsExportable(!!(values.name && content));
  }, [content, form]);

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

  const handleExport = () => {
    try {
      const values = form.getFieldsValue();
      
      // Extract image URLs from content
      const imageUrls = [];
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      doc.querySelectorAll('img').forEach(img => {
        imageUrls.push(img.src);
      });

      const templateData = {
        metadata: {
          name: values.name,
          type: values.type,
          subject: values.subject,
          description: values.description,
          complexity: values.complexity,
          createdAt: new Date().toISOString(),
          version: '1.0'
        },
        content: content,
        assets: imageUrls
      };
      
      const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `template_${values.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      notification.success({
        message: 'Export Successful',
        description: 'Template exported with all assets and metadata'
      });
    } catch (error) {
      notification.error({
        message: 'Export Failed',
        description: error.message || 'Failed to export template'
      });
    }
  };

  const handleImport = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate imported file structure
        if (!data.metadata || !data.content) {
          throw new Error('Invalid template file format');
        }

        // Set form values from metadata
        form.setFieldsValue({
          name: data.metadata.name,
          type: data.metadata.type,
          subject: data.metadata.subject,
          description: data.metadata.description,
          complexity: data.metadata.complexity
        });

        // Set content (including any embedded assets)
        setContent(data.content);

        notification.success({
          message: 'Import Successful',
          description: `Template "${data.metadata.name}" imported with ${data.assets?.length || 0} assets`
        });
      } catch (error) {
        notification.error({
          message: 'Import Failed',
          description: error.message || 'Failed to import template'
        });
      }
    };
    reader.onerror = () => {
      notification.error({
        message: 'Import Failed',
        description: 'Error reading template file'
      });
    };
    reader.readAsText(file);
    return false; // Prevent default upload behavior
  };

  // Before import validation
  const beforeImport = (file) => {
    const isJson = file.type === 'application/json' || file.name.endsWith('.json');
    if (!isJson) {
      message.error('You can only upload JSON files!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('File must be smaller than 2MB!');
    }
    return isJson && isLt2M;
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
        <Button 
          key="back" 
          onClick={onClose}
          className="orange-btn secondary-btn"
        >
          Back to List
        </Button>,
        <Upload 
          key="import"
          beforeUpload={beforeImport}
          customRequest={({ file }) => handleImport(file)}
          showUploadList={false}
          accept=".json"
          disabled={loading}
        >
          <Button 
            icon={<UploadOutlined />} 
            disabled={loading} 
            className="orange-btn secondary-btn"
          >
            Import
          </Button>
        </Upload>,
        <Button 
          key="export" 
          icon={<DownloadOutlined />}
          onClick={handleExport}
          disabled={!isExportable || loading}
          className="orange-btn secondary-btn"
        >
          Export
        </Button>,
        <Button 
          key="test" 
          disabled={loading} 
          className="orange-btn secondary-btn"
        >
          Send Test Mail
        </Button>,
        <Button 
          key="save" 
          type="primary" 
          loading={loading} 
          onClick={handleSave} 
          className="orange-btn primary-btn"
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
            setOptions={editorOptions}
            onChange={setContent}
            setContents={content}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TemplateModal;
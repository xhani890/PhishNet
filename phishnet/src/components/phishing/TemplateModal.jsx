import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, Select, notification, Upload, Tooltip, Space, Divider } from 'antd';
import { UploadOutlined, DownloadOutlined, MailOutlined, SaveOutlined } from '@ant-design/icons';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import axios from 'axios';
import PropTypes from 'prop-types';
import { getUserIdFromToken } from '../../utils/auth';

const TemplateModal = ({ open, onClose, theme, refreshTemplates, templateData, isEditMode }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [isExportable, setIsExportable] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setContent('');
      setTestEmail('');
    }
  }, [open, form]);

  // Load template data when editing
  useEffect(() => {
    if (isEditMode && templateData && open) {
      form.setFieldsValue({
        name: templateData.name,
        subject: templateData.subject,
        type: templateData.type,
        complexity: templateData.complexity,
        description: templateData.description || '',
      });
      setContent(templateData.html);
    }
  }, [isEditMode, templateData, open, form]);

  // Track if template can be exported based on form values
  useEffect(() => {
    const values = form.getFieldsValue();
    setIsExportable(!!(values.name && content));
  }, [content, form]);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validate form fields
      const values = await form.validateFields();
      
      // Get JWT token from localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Extract user ID from token or use the one from template data if editing
      const userId = isEditMode ? templateData.userId : (getUserIdFromToken() || '1');
      
      // Create template data object
      const templatePayload = {
        userId,
        name: values.name,
        subject: values.subject,
        html: content,
        text: templateData?.text || '',
        type: values.type || 'phishing',
        complexity: values.complexity || 'medium',
        description: values.description || ''
      };
      
      let response;
      
      if (isEditMode) {
        // Update existing template
        response = await axios.put(`http://localhost:5000/api/templates/${templateData.id}`, templatePayload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        notification.success({
          message: 'Template Updated',
          description: 'Your email template has been updated successfully!'
        });
      } else {
        // Create new template
        response = await axios.post('http://localhost:5000/api/templates', templatePayload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        notification.success({
          message: 'Template Created',
          description: 'Your email template has been saved successfully!'
        });
      }
      
      // Close modal and refresh templates list
      onClose();
      if (refreshTemplates) {
        refreshTemplates();
      }
      
    } catch (error) {
      // Handle errors
      console.error('Error saving template:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to save template';
      
      notification.error({
        message: 'Save Failed',
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Improved export function with better HTML formatting
  const handleExport = () => {
    try {
      const values = form.getFieldsValue();
      
      // Format the current date for the filename
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      
      // Create a properly formatted HTML document
      const htmlTemplate = `<!DOCTYPE html>
<html>
<head>
  <!-- TEMPLATE METADATA -->
  <!-- NAME: ${values.name || 'Untitled Template'} -->
  <!-- TYPE: ${values.type || 'phishing'} -->
  <!-- SUBJECT: ${values.subject || 'No Subject'} -->
  <!-- DESCRIPTION: ${values.description || ''} -->
  <!-- COMPLEXITY: ${values.complexity || 'medium'} -->
  <!-- CREATED: ${now.toISOString()} -->
  <!-- VERSION: 1.0 -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${values.subject || 'Email Template'}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 100%;
      margin: 0;
      padding: 0;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    a {
      color: #FF6B00;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="email-container">
    ${content}
  </div>
</body>
</html>`;
      
      // Create a blob and trigger download
      const blob = new Blob([htmlTemplate], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${values.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${dateStr}_${timeStr}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      notification.success({
        message: 'Export Successful',
        description: 'Template exported as HTML file'
      });
    } catch (error) {
      notification.error({
        message: 'Export Failed',
        description: error.message || 'Failed to export template'
      });
    }
  };

  const handleImport = (file) => {
    setImportLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const htmlContent = e.target.result;
        
        const metadata = {};
        const metaRegex = /<!--\s*([^:]+):\s*([^->]+)\s*-->/g;
        let match;
        while ((match = metaRegex.exec(htmlContent))) {
          metadata[match[1].trim().toLowerCase()] = match[2].trim();
        }
        
        const bodyStart = htmlContent.indexOf('<body>');
        const bodyEnd = htmlContent.indexOf('</body>');
        let bodyContent = '';
        
        if (bodyStart !== -1 && bodyEnd !== -1) {
          bodyContent = htmlContent.substring(bodyStart + 6, bodyEnd);
        } else {
          bodyContent = htmlContent;
        }
        
        form.setFieldsValue({
          name: metadata.name || `Imported Template ${new Date().toLocaleString()}`,
          type: metadata.type || 'phishing',
          subject: metadata.subject || 'Important Bulletin Alert',
          description: metadata.description || 'Automatically imported template',
          complexity: metadata.complexity || 'medium'
        });
        
        setContent(bodyContent);

        notification.success({
          message: 'Import Successful',
          description: 'HTML template has been imported successfully',
          duration: 3
        });
      } catch (error) {
        notification.error({
          message: 'Import Failed',
          description: error.message || 'Failed to process imported file',
          duration: 5
        });
      } finally {
        setImportLoading(false);
      }
    };
    reader.onerror = () => {
      notification.error({
        message: 'Import Failed',
        description: 'Error reading template file',
        duration: 5
      });
      setImportLoading(false);
    };
    reader.readAsText(file);
    return false;
  };

  const handleTestEmail = async () => {
    try {
      setTestLoading(true);
      
      // Validate that test email is provided
      if (!testEmail || !testEmail.trim()) {
        throw new Error('Please enter a valid email address');
      }
      
      // Validate form fields to ensure we have all required data
      const values = await form.validateFields(['subject']);
      
      // Get JWT token from localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Create test email payload
      const testEmailPayload = {
        recipientEmail: testEmail,
        subject: values.subject,
        htmlContent: content,
      };
      
      // Send test email request
      await axios.post('http://localhost:5000/api/templates/test-email', testEmailPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      notification.success({
        message: 'Test Email Sent',
        description: `A test email has been sent to ${testEmail}`
      });
      
    } catch (error) {
      console.error('Error sending test email:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send test email';
      
      notification.error({
        message: 'Test Email Failed',
        description: errorMessage
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <Modal
      title={isEditMode ? "Edit Email Template" : "New Email Template"}
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
          Cancel
        </Button>,
        <Button 
          key="save" 
          type="primary" 
          loading={loading} 
          onClick={handleSave} 
          className="orange-btn primary-btn"
          icon={<SaveOutlined />}
        >
          {isEditMode ? "Update Template" : "Save Template"}
        </Button>
      ]}
    >
      <Form 
        form={form} 
        layout="vertical" 
        className={theme === 'dark' ? 'dark-form' : ''}
      >
        <Form.Item
          name="name"
          label="Template Name"
          rules={[{ required: true, message: 'Please enter template name' }]}
        >
          <Input placeholder="Enter template name" />
        </Form.Item>

        <Form.Item
          name="subject"
          label="Subject"
          rules={[{ required: true, message: 'Please enter email subject' }]}
        >
          <Input placeholder="Email subject line" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select a type' }]}
            initialValue="phishing"
          >
            <Select
              options={[
                { value: 'phishing', label: 'Phishing' },
                { value: 'training', label: 'Training' }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="complexity"
            label="Complexity"
            rules={[{ required: true, message: 'Please select complexity' }]}
            initialValue="medium"
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
          name="description"
          label="Description"
        >
          <Input.TextArea rows={3} placeholder="Template description" />
        </Form.Item>

        <div className="mb-4 flex justify-between items-center">
          <Form.Item 
            label="Email Content" 
            required
            className="mb-0 flex-grow"
          >
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Create your email template using the editor below
            </div>
          </Form.Item>
          
          <Space>
            <Upload
              accept=".html"
              beforeUpload={handleImport}
              showUploadList={false}
              disabled={importLoading}
            >
              <Button
                icon={<UploadOutlined />}
                loading={importLoading}
                className="orange-btn secondary-btn"
              >
                Import
              </Button>
            </Upload>
            
            <Tooltip title="Export template as HTML file">
              <Button
                onClick={handleExport}
                disabled={!isExportable}
                icon={<DownloadOutlined />}
                className="orange-btn secondary-btn"
              >
                Export
              </Button>
            </Tooltip>
          </Space>
        </div>

        <div className={`${theme === 'dark' ? 'dark-theme-editor' : 'light-theme-editor'} mb-4`}>
          <SunEditor
            setContents={content}
            onChange={setContent}
            setOptions={{
              height: 400,
              buttonList: [
                ['undo', 'redo', 'font', 'fontSize', 'formatBlock'],
                ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                ['removeFormat'],
                ['outdent', 'indent'],
                ['align', 'horizontalRule', 'list', 'table'],
                ['link', 'image', 'video'],
                ['fullScreen', 'showBlocks', 'codeView'],
                ['preview', 'print']
              ]
            }}
          />
        </div>

        <Divider className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} />
        
        <div className="flex items-center mt-4">
          <Input 
            placeholder="Enter email for testing" 
            value={testEmail} 
            onChange={(e) => setTestEmail(e.target.value)}
            addonBefore={<MailOutlined />}
            className={theme === 'dark' ? 'dark-input' : ''}
          />
          <Button
            onClick={handleTestEmail}
            loading={testLoading}
            className="orange-btn primary-btn ml-2"
          >
            Send Test Email
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

TemplateModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
  refreshTemplates: PropTypes.func,
  templateData: PropTypes.object,
  isEditMode: PropTypes.bool
};

TemplateModal.defaultProps = {
  isEditMode: false,
  templateData: null
};

export default TemplateModal;
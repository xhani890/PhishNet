import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, Select, notification, Upload, message, Tag } from 'antd';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import { UploadOutlined, DownloadOutlined, MailOutlined, PlusOutlined } from '@ant-design/icons';

const TemplateModal = ({ open, onClose, theme, refreshTemplates }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [content, setContent] = useState('');
  const [isExportable, setIsExportable] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [customTypes, setCustomTypes] = useState(['phishing', 'training']);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

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

  useEffect(() => {
    const values = form.getFieldsValue();
    setIsExportable(!!(values.name && content));
  }, [content, form]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const userId = localStorage.getItem('userId'); // Get from your auth system
  
      const response = await fetch('http://localhost:5000/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId,
          name: values.name,
          subject: values.subject,
          html: content,
          text: '', // Add text conversion if needed
          type: values.type,
          complexity: values.complexity,
          description: values.description
        })
      });
  
      const result = await response.json();
  
      if (!response.ok) throw new Error(result.message || 'Failed to save template');
  
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
      
      const htmlTemplate = `<!DOCTYPE html>
<html>
<head>
  <!-- TEMPLATE METADATA -->
  <!-- NAME: ${values.name || 'Untitled Template'} -->
  <!-- TYPE: ${values.type || 'phishing'} -->
  <!-- SUBJECT: ${values.subject || 'No Subject'} -->
  <!-- DESCRIPTION: ${values.description || ''} -->
  <!-- COMPLEXITY: ${values.complexity || 'medium'} -->
  <!-- CREATED: ${new Date().toISOString()} -->
  <!-- VERSION: 1.0 -->
  <title>${values.name || 'Email Template'}</title>
</head>
<body>
${content}
</body>
</html>`;
      
      const blob = new Blob([htmlTemplate], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `template_${values.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().getTime()}.html`;
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
      }
    };
    reader.onerror = () => {
      notification.error({
        message: 'Import Failed',
        description: 'Error reading template file',
        duration: 5
      });
    };
    reader.readAsText(file);
    return false;
  };

  const handleTestEmail = async () => {
    try {
      const values = form.getFieldsValue();
      if (!values.subject || !content) {
        message.error('Please fill in subject and content before sending test email');
        return;
      }
  
      setTestLoading(true);
      
      // Collect test data through a form instead of simple prompt
      const testData = {
        email: prompt('Enter test email address:', testEmail || ''),
        firstName: prompt('Enter test first name:', 'John'),
        lastName: prompt('Enter test last name:', 'Doe')
      };
  
      if (!testData.email) {
        setTestLoading(false);
        return;
      }
  
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(testData.email)) {
        message.error('Please enter a valid email address');
        setTestLoading(false);
        return;
      }
      
      setTestEmail(testData.email);
  
      const response = await fetch('http://localhost:5000/api/templates/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...testData,
          subject: values.subject,
          content,
          templateName: values.name || 'Test Template',
          metadata: {
            type: values.type,
            complexity: values.complexity
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send test email');
      }

      notification.success({
        message: 'Test Email Sent',
        description: `Test email has been sent to ${email}. Check your inbox.`,
        duration: 5
      });
    } catch (error) {
      console.error('Test email error:', error);
      notification.error({
        message: 'Test Email Failed',
        description: error.message || 'Error sending test email',
        duration: 5
      });
    } finally {
      setTestLoading(false);
    }
  };

  const handleInputConfirm = () => {
    if (inputValue && !customTypes.includes(inputValue)) {
      setCustomTypes([...customTypes, inputValue]);
      form.setFieldsValue({ type: inputValue });
    }
    setInputVisible(false);
    setInputValue('');
  };

  const beforeImport = (file) => {
    const isHtml = file.type === 'text/html' || file.name.endsWith('.html');
    if (!isHtml) {
      message.error('You can only upload HTML files!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('File must be smaller than 2MB!');
    }
    return isHtml && isLt2M;
  };

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setContent('');
      setInputVisible(false);
      setInputValue('');
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
          accept=".html,.htm"
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
          icon={<MailOutlined />}
          onClick={handleTestEmail}
          disabled={loading}
          loading={testLoading}
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
            rules={[{ required: true, message: 'Please select or create a type' }]}
          >
            <Select
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div style={{ padding: '8px', display: 'flex', flexWrap: 'nowrap', alignItems: 'center' }}>
                    <Input
                      style={{ flex: 'auto' }}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onPressEnter={handleInputConfirm}
                      placeholder="Add new type"
                    />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={handleInputConfirm}
                    >
                      Add
                    </Button>
                  </div>
                </>
              )}
              options={customTypes.map(type => ({ value: type, label: type }))}
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
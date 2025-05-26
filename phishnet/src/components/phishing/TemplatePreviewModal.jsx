import React from 'react';
import { Modal, Button, Descriptions, Badge, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import { DownloadOutlined } from '@ant-design/icons';

const TemplatePreviewModal = ({ open, onClose, theme, template }) => {
  if (!template) return null;

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get complexity badge color
  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'low': return 'green';
      case 'medium': return 'orange';
      case 'high': return 'red';
      default: return 'blue';
    }
  };

  // Export the viewed template
  const handleExport = () => {
    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      
      // Create a properly formatted HTML document
      const htmlTemplate = `<!DOCTYPE html>
<html>
<head>
  <!-- TEMPLATE METADATA -->
  <!-- NAME: ${template.name || 'Untitled Template'} -->
  <!-- TYPE: ${template.type || 'phishing'} -->
  <!-- SUBJECT: ${template.subject || 'No Subject'} -->
  <!-- DESCRIPTION: ${template.description || ''} -->
  <!-- COMPLEXITY: ${template.complexity || 'medium'} -->
  <!-- CREATED: ${template.modifiedDate || now.toISOString()} -->
  <!-- VERSION: 1.0 -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.subject || 'Email Template'}</title>
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
    ${template.html}
  </div>
</body>
</html>`;
      
      // Create a blob and trigger download
      const blob = new Blob([htmlTemplate], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${dateStr}_${timeStr}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting template:', error);
    }
  };

  return (
    <Modal
      title="Template Preview"
      open={open}
      onCancel={onClose}
      className={`${theme === 'dark' ? 'dark-modal' : ''} custom-modal`}
      width={800}
      centered
      footer={[
        <Tooltip key="export" title="Export template as HTML file">
          <Button 
            icon={<DownloadOutlined />}
            onClick={handleExport}
            className="orange-btn secondary-btn"
          >
            Export Template
          </Button>
        </Tooltip>,
        <Button 
          key="close" 
          onClick={onClose}
          className="orange-btn primary-btn"
        >
          Close
        </Button>
      ]}
    >
      <div className={`mb-5 p-4 rounded-lg ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        <Descriptions 
          title="Template Information" 
          bordered 
          column={2}
          className={theme === 'dark' ? 'dark-descriptions' : ''}
        >
          <Descriptions.Item label="Name">{template.name}</Descriptions.Item>
          <Descriptions.Item label="Subject">{template.subject}</Descriptions.Item>
          <Descriptions.Item label="Type">{template.type}</Descriptions.Item>
          <Descriptions.Item label="Complexity">
            <Badge color={getComplexityColor(template.complexity)} text={template.complexity} />
          </Descriptions.Item>
          <Descriptions.Item label="Last Modified" span={2}>
            {formatDate(template.modifiedDate)}
          </Descriptions.Item>
          {template.description && (
            <Descriptions.Item label="Description" span={2}>
              {template.description}
            </Descriptions.Item>
          )}
        </Descriptions>
      </div>

      <div className="mt-5">
        <h3 className={`mb-3 font-medium ${
          theme === 'dark' ? 'text-white' : 'text-black'
        }`}>Email Preview</h3>
        <div className={`border rounded-lg overflow-hidden ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
        }`}>
          <div className={`p-2 border-b ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'
          }`}>
            <span className="font-medium">Subject:</span> {template.subject}
          </div>
          <div 
            className="p-4 max-h-96 overflow-auto"
            dangerouslySetInnerHTML={{ __html: template.html }}
          />
        </div>
      </div>
    </Modal>
  );
};

TemplatePreviewModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
  template: PropTypes.object
};

export default TemplatePreviewModal;
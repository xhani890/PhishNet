import React, { useState, useEffect } from 'react';
import { Shield, Plus, Rocket, Eye, Pencil, Trash2 } from 'lucide-react';
import PropTypes from 'prop-types';
import TemplateModal from '../components/phishing/TemplateModal';
import TemplatePreviewModal from '../components/phishing/TemplatePreviewModal';
import { Modal, notification } from 'antd';
import axios from 'axios';
import { toast } from 'react-toastify';

const EmailTemplates = ({ theme }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  // Fetch templates when component mounts
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Function to fetch templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axios.get('http://localhost:5000/api/templates', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setTemplates(response.data.data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewTemplate = () => {
    setCurrentTemplate(null);
    setIsEditMode(false);
    setModalOpen(true);
  };

  // View template function
  const handleViewTemplate = async (templateId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await axios.get(`http://localhost:5000/api/templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setCurrentTemplate(response.data.data);
      setPreviewModalOpen(true);
    } catch (error) {
      console.error('Error fetching template details:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to load template details'
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit template function
  const handleEditTemplate = async (templateId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await axios.get(`http://localhost:5000/api/templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setCurrentTemplate(response.data.data);
      setIsEditMode(true);
      setModalOpen(true);
    } catch (error) {
      console.error('Error fetching template for editing:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to load template for editing'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete template confirmation
  const showDeleteConfirm = (template) => {
    setTemplateToDelete(template);
    setDeleteConfirmVisible(true);
  };

  // Delete template function
  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      await axios.delete(`http://localhost:5000/api/templates/${templateToDelete.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      notification.success({
        message: 'Success',
        description: 'Template deleted successfully'
      });
      
      // Refresh the templates list
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to delete template'
      });
    } finally {
      setLoading(false);
      setDeleteConfirmVisible(false);
      setTemplateToDelete(null);
    }
  };

  return (
    <div className={`p-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
      {/* Message Section */}
      <div className={`flex items-start gap-4 p-4 mb-6 rounded-lg ${
        theme === 'dark' ? 'bg-[#1A1A1A] border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <Shield className="text-orange-500 w-6 h-6 mt-1" />
        <div>
          <h2 className="text-xl font-semibold mb-2">Phishing Templates</h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Your current Phishing emails are listed below. Use the action icons to view or edit a template.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button 
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            theme === 'dark' 
              ? 'bg-[#1A1A1A] hover:bg-gray-800 text-white' 
              : 'bg-white hover:bg-gray-100 text-black border'
          }`}
          onClick={handleCreateNewTemplate}
        >
          <Plus size={18} />
          Create New Template
        </button>
        <button className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
          theme === 'dark' 
            ? 'bg-[#1A1A1A] hover:bg-gray-800 text-white' 
            : 'bg-white hover:bg-gray-100 text-black border'
        }`}>
          <Rocket size={18} />
          Create New Campaign
        </button>
      </div>

      {/* Templates Table */}
      <div className={`rounded-lg overflow-hidden border ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <table className="w-full">
          <thead className={`${
            theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-gray-50'
          }`}>
            <tr>
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Type</th>
              <th className="text-left py-3 px-4">Complexity</th>
              <th className="text-left py-3 px-4">Subject</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">Loading templates...</td>
              </tr>
            ) : templates.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">No templates found. Create your first template!</td>
              </tr>
            ) : (
              templates.map((template) => (
                <tr key={template.id} className={`${
                  theme === 'dark' 
                    ? 'hover:bg-gray-800 border-t border-gray-700' 
                    : 'hover:bg-gray-50 border-t border-gray-200'
                }`}>
                  <td className="py-3 px-4">{template.name}</td>
                  <td className="py-3 px-4">{template.type}</td>
                  <td className="py-3 px-4">{template.complexity}</td>
                  <td className="py-3 px-4">{template.subject}</td>
                  <td className="py-3 px-4 flex gap-2">
                    <button 
                      className="text-blue-500 hover:text-blue-600"
                      onClick={() => handleViewTemplate(template.id)}
                      title="View Template"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="text-gray-500 hover:text-gray-600"
                      onClick={() => handleEditTemplate(template.id)}
                      title="Edit Template"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-600"
                      onClick={() => showDeleteConfirm(template)}
                      title="Delete Template"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Template Modal */}
      <TemplateModal 
        open={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        theme={theme} 
        refreshTemplates={fetchTemplates}
        templateData={currentTemplate}
        isEditMode={isEditMode}
      />

      {/* View Template Modal */}
      {currentTemplate && (
        <TemplatePreviewModal
          open={isPreviewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          theme={theme}
          template={currentTemplate}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={deleteConfirmVisible}
        onOk={handleDeleteTemplate}
        onCancel={() => setDeleteConfirmVisible(false)}
        okText="Yes, Delete"
        cancelText="Cancel"
        okButtonProps={{ 
          danger: true,
          loading: loading
        }}
      >
        <p>Are you sure you want to delete the template "{templateToDelete?.name}"?</p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

EmailTemplates.propTypes = {
  theme: PropTypes.string.isRequired,
};

export default EmailTemplates;
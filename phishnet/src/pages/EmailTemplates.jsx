import React, { useState } from 'react';
import { Shield, Plus, Rocket, Eye, Pencil, Trash2 } from 'lucide-react';
import PropTypes from 'prop-types';
import TemplateModal from '../components/phishing/TemplateModal';

const EmailTemplates = ({ theme }) => {
  const [isModalOpen, setModalOpen] = useState(false);

  const templates = [
    // Sample Data - Draft - To be replaced with Real Data
    { 
      name: "Amazon: Locked Account", 
      type: "Phishing - Home & Personal", 
      complexity: "Medium",
      subject: "Account Locked ID: DTOPO-QUETPICH",
      actions: ["preview", "edit", "delete"]
    },
    // Need to Add other Template Objects...
  ];

  const handleCreateNewTemplate = () => {
    setModalOpen(true);
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
            {templates.map((template, index) => (
              <tr key={index} className={`${
                theme === 'dark' 
                  ? 'hover:bg-gray-800 border-t border-gray-700' 
                  : 'hover:bg-gray-50 border-t border-gray-200'
              }`}>
                <td className="py-3 px-4">{template.name}</td>
                <td className="py-3 px-4">{template.type}</td>
                <td className="py-3 px-4">{template.complexity}</td>
                <td className="py-3 px-4">{template.subject}</td>
                <td className="py-3 px-4 flex gap-2">
                  <button className="text-blue-500 hover:text-blue-600">
                    <Eye size={16} />
                  </button>
                  <button className="text-gray-500 hover:text-gray-600">
                    <Pencil size={16} />
                  </button>
                  <button className="text-red-500 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TemplateModal open={isModalOpen} onClose={() => setModalOpen(false)} theme={theme} />
    </div>
  );
};

EmailTemplates.propTypes = {
  theme: PropTypes.string.isRequired,
};

export default EmailTemplates;
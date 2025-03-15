import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
  // Mock data for the line chart
  const chartData = [
    { date: '17-Jun-24', mailOpened: 0, urlClicked: 0, formPosted: 0, attachmentOpened: 0, pageNavigation: 0 },
    { date: '19-Jun-24', mailOpened: 0, urlClicked: 2, formPosted: 4, attachmentOpened: 0, pageNavigation: 0 },
    { date: '24-Jun-24', mailOpened: 1, urlClicked: 6, formPosted: 0, attachmentOpened: 0, pageNavigation: 0 },
    { date: '30-Jun-24', mailOpened: 0, urlClicked: 0, formPosted: 1, attachmentOpened: 0, pageNavigation: 0 },
    { date: '02-Jul-24', mailOpened: 8, urlClicked: 4, formPosted: 0, attachmentOpened: 0, pageNavigation: 0 },
    { date: '09-Jul-24', mailOpened: 2, urlClicked: 0, formPosted: 0, attachmentOpened: 0, pageNavigation: 0 },
    { date: '16-Jul-24', mailOpened: 50, urlClicked: 0, formPosted: 0, attachmentOpened: 0, pageNavigation: 0 },
    { date: '19-Jul-24', mailOpened: 0, urlClicked: 0, formPosted: 0, attachmentOpened: 0, pageNavigation: 0 },
  ];

  // Card icons using SVG
  const UsersIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="white">
      <circle cx="8" cy="8" r="3" />
      <path d="M14 8a3 3 0 1 0-6 0 3 3 0 0 0 6 0z" />
      <path d="M2 19v-1a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v1" />
    </svg>
  );

  const LayersIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="white">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );

  const NetworkIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="white">
      <rect x="9" y="2" width="6" height="6" rx="1" />
      <rect x="4" y="16" width="6" height="6" rx="1" />
      <rect x="14" y="16" width="6" height="6" rx="1" />
      <path d="M12 8v4" />
      <path d="M12 12H7" />
      <path d="M12 12h5" />
    </svg>
  );

  const GraduationIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="white">
      <path d="M12 2l-8 4 8 4 8-4-8-4z" />
      <path d="M12 10v10" />
      <path d="M9 12v6a3 3 0 0 0 6 0v-6" />
    </svg>
  );

  // Sidebar icons
  const DashboardIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  );

  const MspDashboardIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <line x1="2" y1="9" x2="22" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  );

  const PhishingManagerIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5" />
      <path d="M16 6h4v4" />
    </svg>
  );

  const TrainingManagerIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l-8 4 8 4 8-4-8-4z" />
      <path d="M6 10v4l6 3 6-3v-4" />
    </svg>
  );

  const QuizManagerIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );

  const UserManagerIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    </svg>
  );

  const ContentPreviewIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );

  const ReportsPortalIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );

  const SettingsIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );

  const OrganisationManagerIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );

  const SupportPortalIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );

  const PartnerManagementIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  // Admin Dashboard Icon
  const AdminIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-900 text-white px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-6 h-6 mr-2 bg-gray-600 rounded-full"></div>
          <span className="text-sm font-medium">PhishNet</span>
        </div>
        <div className="flex items-center">
          <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded mr-2">1</div>
          <span className="text-xs mr-2">Help</span>
          <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded mr-2">A</div>
          <span className="text-xs">EMAIL@PhishNet.com</span>
        </div>
      </header>

      {/* Sidebar and Main Content Container */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-36 bg-gray-100 border-r">
          <div className="p-3 border-b bg-white">
            <div className="flex items-center">
              <div className="w-6 h-6 mr-2 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">T</span>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-700">Titan</div>
                <div className="text-base font-bold text-blue-800" style={{ fontFamily: 'Arial, sans-serif' }}>PhishNet</div>
              </div>
            </div>
          </div>
          <div className="border-b py-2 px-3 text-xs text-gray-700 hover:bg-gray-200 flex items-center">
            <div className="mr-2"><DashboardIcon /></div>
            <span>Dashboard</span>
          </div>
          <div className="border-b py-2 px-3 text-xs text-gray-700 hover:bg-gray-200 flex items-center">
            <div className="mr-2"><MspDashboardIcon /></div>
            <span>MSP Dashboard</span>
          </div>
          <div className="border-b py-2 px-3 text-xs text-gray-700 hover:bg-gray-200 flex items-center">
            <div className="mr-2"><PhishingManagerIcon /></div>
            <span>Phishing Manager</span>
          </div>
          <div className="border-b py-2 px-3 text-xs text-gray-700 hover:bg-gray-200 flex items-center">
            <div className="mr-2"><TrainingManagerIcon /></div>
            <span>Training Manager</span>
          </div>
          <div className="border-b py-2 px-3 text-xs text-gray-700 hover:bg-gray-200 flex items-center">
            <div className="mr-2"><QuizManagerIcon /></div>
            <span>Quiz Manager</span>
          </div>
          <div className="border-b py-2 px-3 text-xs text-gray-700 hover:bg-gray-200 flex items-center">
            <div className="mr-2"><UserManagerIcon /></div>
            <span>User Manager</span>
          </div>
          <div className="border-b py-2 px-3 text-xs text-gray-700 hover:bg-gray-200 flex items-center">
            <div className="mr-2"><ContentPreviewIcon /></div>
            <span>Content Preview</span>
          </div>
          <div className="border-b py-2 px-3 text-xs text-gray-700 hover:bg-gray-200 flex items-center">
            <div className="mr-2"><ReportsPortalIcon /></div>
            <span>Reports Portal</span>
          </div>
          <div className="border-b py-2 px-3 text-xs text-gray-700 hover:bg-gray-200 flex items-center">
            <div className="mr-2"><SettingsIcon /></div>
            <span>Settings</span>
          </div>
          <div className="border-b py-2 px-3 text-xs text-gray-700 hover:bg-gray-200 flex items-center">
            <div className="mr-2"><OrganisationManagerIcon /></div>
            <span>Organisation Manager</span>
          </div>
          <div className="border-b py-2 px-3 text-xs text-gray-700 hover:bg-gray-200 flex items-center">
            <div className="mr-2"><SupportPortalIcon /></div>
            <span>Support Portal</span>
          </div>
          <div className="border-b py-2 px-3 text-xs text-gray-700 hover:bg-gray-200 flex items-center">
            <div className="mr-2"><PartnerManagementIcon /></div>
            <span>Partner Management</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          {/* Header */}
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-gray-300 rounded-sm mr-2 flex items-center justify-center">
                <AdminIcon />
              </div>
              <span className="text-gray-700 font-bold">| Administration Dashboard</span>
              <span className="text-gray-500 text-sm ml-2">- Welcome to your Administration Dashboard! Below is a snapshot of your organisation&apos;s resources</span>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-blue-600 mr-2">Support Documentation</span>
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">S</div>
              <span className="text-xs ml-1">PhishNet</span>
            </div>
          </div>

          {/* Metric Cards with Appropriate Icons */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-teal-500 text-white p-4 rounded flex flex-col items-center justify-center">
              <div className="mb-2"><UsersIcon /></div>
              <div className="text-4xl font-bold">117</div>
              <div className="text-sm">Users</div>
            </div>
            <div className="bg-gray-600 text-white p-4 rounded flex flex-col items-center justify-center">
              <div className="mb-2"><LayersIcon /></div>
              <div className="text-4xl font-bold">134</div>
              <div className="text-sm">User Groups</div>
            </div>
            <div className="bg-gray-400 text-white p-4 rounded flex flex-col items-center justify-center">
              <div className="mb-2"><NetworkIcon /></div>
              <div className="text-4xl font-bold">1772</div>
              <div className="text-sm">Phishing Campaigns</div>
            </div>
            <div className="bg-blue-500 text-white p-4 rounded flex flex-col items-center justify-center">
              <div className="mb-2"><GraduationIcon /></div>
              <div className="text-4xl font-bold">2483</div>
              <div className="text-sm">Training & Quiz Campaigns</div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="border rounded p-4 bg-white">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 mr-2"></div>
                <span className="text-sm">Phishing Campaign Statistics for last</span>
                <select className="mx-2 bg-white border rounded text-sm px-2 py-1">
                  <option>30</option>
                </select>
                <span className="text-sm">days</span>
              </div>
            </div>

            <div className="h-64">
              <LineChart
                width={900}
                height={220}
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="mailOpened" stroke="#2563EB" name="Mail opened" />
                <Line type="monotone" dataKey="urlClicked" stroke="#F59E0B" name="Url clicked" />
                <Line type="monotone" dataKey="formPosted" stroke="#F97316" name="Form posted" />
                <Line type="monotone" dataKey="attachmentOpened" stroke="#10B981" name="Attachment opened" />
                <Line type="monotone" dataKey="pageNavigation" stroke="#8B5CF6" name="Page navigation" />
              </LineChart>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cookie Banner */}
      <div className="bg-gray-900 text-white p-3 flex justify-between items-center">
        <div>
          <span className="text-sm">PhishNet uses cookies. By continuing you agree to PhishNet use of cookies</span>
          <span className="text-sm text-gray-400 ml-2 underline">Learn more</span>
        </div>
        <div className="flex">
          <button className="bg-blue-700 text-white text-sm px-4 py-1 rounded mr-2">Reject</button>
          <button className="bg-blue-500 text-white text-sm px-4 py-1 rounded">Approve</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

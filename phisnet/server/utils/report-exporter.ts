// Create: phisnet/server/utils/report-exporter.ts
import { createObjectCsvWriter } from 'csv-writer';
import { format } from 'date-fns';
import path from 'path';
import fs from 'fs';

export interface ReportData {
  campaigns?: any[];
  users?: any[];
  results?: any[];
  type: 'campaigns' | 'users' | 'results' | 'comprehensive';
  organizationName?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export async function exportReportToCsv(data: ReportData): Promise<string> {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  const filename = `${data.type}_report_${timestamp}.csv`;
  
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const filepath = path.join(uploadsDir, filename);
  
  switch (data.type) {
    case 'campaigns':
      await exportCampaignsReport(data.campaigns || [], filepath);
      break;
    case 'users':
      await exportUsersReport(data.users || [], filepath);
      break;
    case 'results':
      await exportResultsReport(data.results || [], filepath);
      break;
    case 'comprehensive':
      await exportComprehensiveReport(data, filepath);
      break;
  }
  
  return filename;
}

async function exportCampaignsReport(campaigns: any[], filepath: string) {
  const csvWriter = createObjectCsvWriter({
    path: filepath,
    header: [
      { id: 'name', title: 'Campaign Name' },
      { id: 'status', title: 'Status' },
      { id: 'createdAt', title: 'Created Date' },
    ]
  });
  
  const records = campaigns.map(campaign => ({
    name: campaign.name || 'Unknown',
    status: campaign.status || 'Unknown',
    createdAt: campaign.createdAt ? format(new Date(campaign.createdAt), 'yyyy-MM-dd HH:mm:ss') : 'N/A',
  }));
  
  await csvWriter.writeRecords(records);
}

async function exportUsersReport(users: any[], filepath: string) {
  const csvWriter = createObjectCsvWriter({
    path: filepath,
    header: [
      { id: 'name', title: 'Name' },
      { id: 'email', title: 'Email' },
      { id: 'createdAt', title: 'Created Date' },
    ]
  });
  
  const records = users.map(user => ({
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    email: user.email || 'N/A',
    createdAt: user.createdAt ? format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm:ss') : 'N/A',
  }));
  
  await csvWriter.writeRecords(records);
}

async function exportResultsReport(results: any[], filepath: string) {
  const csvWriter = createObjectCsvWriter({
    path: filepath,
    header: [
      { id: 'status', title: 'Status' },
      { id: 'createdAt', title: 'Date' },
    ]
  });
  
  const records = results.map(result => ({
    status: result.status || 'Unknown',
    createdAt: result.createdAt ? format(new Date(result.createdAt), 'yyyy-MM-dd HH:mm:ss') : 'N/A',
  }));
  
  await csvWriter.writeRecords(records);
}

async function exportComprehensiveReport(data: ReportData, filepath: string) {
  const csvWriter = createObjectCsvWriter({
    path: filepath,
    header: [
      { id: 'reportType', title: 'Report Type' },
      { id: 'organizationName', title: 'Organization' },
      { id: 'reportDate', title: 'Report Date' },
      { id: 'totalCampaigns', title: 'Total Campaigns' },
      { id: 'totalUsers', title: 'Total Users' },
    ]
  });
  
  const record = {
    reportType: 'Comprehensive Phishing Report',
    organizationName: data.organizationName || 'Unknown',
    reportDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    totalCampaigns: data.campaigns?.length || 0,
    totalUsers: data.users?.length || 0,
  };
  
  await csvWriter.writeRecords([record]);
}
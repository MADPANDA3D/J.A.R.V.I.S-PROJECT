/**
 * Express server setup for API routes
 */

import express from 'express';
import { bugExportService } from './bugExport';
import { bugDashboardAPI } from './bugDashboard';

export const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Bug export routes
app.post('/api/exports', bugExportService.createExport.bind(bugExportService));
app.get('/api/exports/:id', bugExportService.getExportStatus.bind(bugExportService));
app.get('/api/exports/:id/download', bugExportService.downloadExport.bind(bugExportService));
app.post('/api/exports/scheduled', bugExportService.createScheduledExport.bind(bugExportService));
app.get('/api/exports/templates', bugExportService.getExportTemplates.bind(bugExportService));

// Bug dashboard routes
app.get('/api/bugs', bugDashboardAPI.getBugs.bind(bugDashboardAPI));
app.get('/api/bugs/:id', bugDashboardAPI.getBugById.bind(bugDashboardAPI));
app.put('/api/bugs/:id/status', bugDashboardAPI.updateBugStatus.bind(bugDashboardAPI));
app.post('/api/bugs/:id/assign', bugDashboardAPI.assignBug.bind(bugDashboardAPI));
app.post('/api/bugs/search', bugDashboardAPI.searchBugs.bind(bugDashboardAPI));
app.get('/api/bugs/analytics', bugDashboardAPI.getBugAnalytics.bind(bugDashboardAPI));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

export default app;
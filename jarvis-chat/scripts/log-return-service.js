#!/usr/bin/env node

/**
 * JARVIS Chat - Log Return Service
 * 
 * This service monitors VPS logs and sends them back to GitHub repository
 * so the development team can access logs without VPS access.
 * 
 * Features:
 * 1. Real-time log monitoring
 * 2. GitHub repository integration
 * 3. Log filtering and aggregation
 * 4. Automatic log rotation
 */

const fs = require('fs').promises;
const path = require('path');
const { Octokit } = require('@octokit/rest');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class LogReturnService {
    constructor() {
        this.config = {
            githubToken: process.env.GITHUB_TOKEN,
            repository: process.env.GITHUB_REPOSITORY || 'madpanda3d/jarvis-chat',
            logDir: process.env.LOGS_DIR || '/home/user/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/logs',
            uploadInterval: parseInt(process.env.LOG_UPLOAD_INTERVAL) || 300000, // 5 minutes
            maxLogSize: parseInt(process.env.MAX_LOG_SIZE) || 1024 * 1024, // 1MB
            retentionDays: parseInt(process.env.LOG_RETENTION_DAYS) || 7
        };

        this.octokit = new Octokit({
            auth: this.config.githubToken
        });

        this.logBuffer = [];
        this.isUploading = false;
    }

    async initialize() {
        console.log('🚀 Initializing Log Return Service...');
        
        // Create logs directory if it doesn't exist
        await fs.mkdir(this.config.logDir, { recursive: true });
        
        // Verify GitHub connection
        try {
            const [owner, repo] = this.config.repository.split('/');
            await this.octokit.rest.repos.get({ owner, repo });
            console.log('✅ GitHub connection verified');
        } catch (error) {
            console.error('❌ GitHub connection failed:', error.message);
            throw error;
        }

        // Start log monitoring
        this.startLogMonitoring();
        
        // Start periodic upload
        this.startPeriodicUpload();
        
        console.log('✅ Log Return Service initialized successfully');
    }

    startLogMonitoring() {
        console.log('📡 Starting log monitoring...');
        
        // Monitor Docker container logs
        this.monitorDockerLogs();
        
        // Monitor application logs
        this.monitorApplicationLogs();
        
        // Monitor system logs
        this.monitorSystemLogs();
    }

    async monitorDockerLogs() {
        try {
            const { stdout } = await execAsync('docker ps --format "{{.Names}}" | grep jarvis');
            const containerName = stdout.trim();
            
            if (containerName) {
                console.log(`📊 Monitoring Docker logs for container: ${containerName}`);
                
                const dockerLogProcess = exec(`docker logs -f ${containerName}`);
                
                dockerLogProcess.stdout.on('data', (data) => {
                    this.addLogEntry('docker', 'info', data.toString().trim());
                });

                dockerLogProcess.stderr.on('data', (data) => {
                    this.addLogEntry('docker', 'error', data.toString().trim());
                });
            }
        } catch (error) {
            console.error('❌ Failed to monitor Docker logs:', error.message);
        }
    }

    async monitorApplicationLogs() {
        try {
            // Monitor webhook server logs
            const webhookLogFile = path.join(this.config.logDir, 'webhook.log');
            
            // Watch for changes to webhook log file
            let lastSize = 0;
            
            setInterval(async () => {
                try {
                    const stats = await fs.stat(webhookLogFile);
                    if (stats.size > lastSize) {
                        const stream = await fs.readFile(webhookLogFile, 'utf8');
                        const newContent = stream.slice(lastSize);
                        
                        newContent.split('\n').forEach(line => {
                            if (line.trim()) {
                                this.addLogEntry('webhook', 'info', line);
                            }
                        });
                        
                        lastSize = stats.size;
                    }
                } catch (error) {
                    // File doesn't exist yet, ignore
                }
            }, 5000);
            
            console.log('📊 Monitoring application logs');
        } catch (error) {
            console.error('❌ Failed to monitor application logs:', error.message);
        }
    }

    async monitorSystemLogs() {
        try {
            // Monitor system journal for JARVIS-related entries
            const journalProcess = exec('journalctl -u jarvis-webhook -f --output=json');
            
            journalProcess.stdout.on('data', (data) => {
                try {
                    const logEntry = JSON.parse(data.toString().trim());
                    this.addLogEntry('system', 'info', logEntry.MESSAGE || logEntry);
                } catch (error) {
                    // Ignore parsing errors
                }
            });
            
            console.log('📊 Monitoring system logs');
        } catch (error) {
            console.error('❌ Failed to monitor system logs:', error.message);
        }
    }

    addLogEntry(source, level, message) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            source,
            level,
            message: typeof message === 'string' ? message : JSON.stringify(message),
            hostname: process.env.HOSTNAME || 'vps'
        };

        this.logBuffer.push(logEntry);
        
        // Limit buffer size
        if (this.logBuffer.length > 1000) {
            this.logBuffer = this.logBuffer.slice(-500); // Keep last 500 entries
        }

        // Console output for local debugging
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] ${source.toUpperCase()}/${level.toUpperCase()}: ${logEntry.message}`);
    }

    startPeriodicUpload() {
        console.log(`⏰ Starting periodic log upload (every ${this.config.uploadInterval / 1000} seconds)`);
        
        setInterval(async () => {
            if (!this.isUploading && this.logBuffer.length > 0) {
                await this.uploadLogs();
            }
        }, this.config.uploadInterval);
    }

    async uploadLogs() {
        if (this.isUploading || this.logBuffer.length === 0) {
            return;
        }

        this.isUploading = true;
        
        try {
            console.log(`📤 Uploading ${this.logBuffer.length} log entries to GitHub...`);
            
            // Create log content
            const logContent = this.formatLogsForUpload();
            
            // Upload to GitHub
            await this.uploadToGitHub(logContent);
            
            // Clear uploaded logs from buffer
            this.logBuffer = [];
            
            console.log('✅ Logs uploaded successfully');
            
        } catch (error) {
            console.error('❌ Failed to upload logs:', error.message);
            
            // If upload fails, keep logs in buffer but limit size
            if (this.logBuffer.length > 2000) {
                this.logBuffer = this.logBuffer.slice(-1000);
                console.log('⚠️ Log buffer trimmed due to upload failure');
            }
        } finally {
            this.isUploading = false;
        }
    }

    formatLogsForUpload() {
        const timestamp = new Date().toISOString();
        const hostname = process.env.HOSTNAME || 'vps';
        
        let content = `# JARVIS Chat VPS Logs\n\n`;
        content += `**Generated:** ${timestamp}\n`;
        content += `**Hostname:** ${hostname}\n`;
        content += `**Log Entries:** ${this.logBuffer.length}\n\n`;
        content += `---\n\n`;

        // Group logs by source
        const logsBySource = this.logBuffer.reduce((acc, log) => {
            if (!acc[log.source]) acc[log.source] = [];
            acc[log.source].push(log);
            return acc;
        }, {});

        Object.entries(logsBySource).forEach(([source, logs]) => {
            content += `## ${source.toUpperCase()} Logs\n\n`;
            content += `\`\`\`\n`;
            
            logs.forEach(log => {
                const time = new Date(log.timestamp).toLocaleString();
                content += `[${time}] ${log.level.toUpperCase()}: ${log.message}\n`;
            });
            
            content += `\`\`\`\n\n`;
        });

        // Add summary statistics
        content += `## Summary\n\n`;
        content += `| Source | Count | Latest |\n`;
        content += `|--------|-------|--------|\n`;
        
        Object.entries(logsBySource).forEach(([source, logs]) => {
            const latest = new Date(logs[logs.length - 1].timestamp).toLocaleString();
            content += `| ${source} | ${logs.length} | ${latest} |\n`;
        });

        return content;
    }

    async uploadToGitHub(content) {
        const [owner, repo] = this.config.repository.split('/');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `vps-logs-${timestamp}.md`;
        const path = `logs/vps/${filename}`;

        try {
            // Create or update file
            await this.octokit.rest.repos.createOrUpdateFileContents({
                owner,
                repo,
                path,
                message: `📊 VPS logs update - ${new Date().toLocaleString()}`,
                content: Buffer.from(content).toString('base64'),
                branch: 'main'
            });

            console.log(`✅ Logs uploaded to GitHub: ${path}`);
            
            // Clean up old log files
            await this.cleanupOldLogs(owner, repo);
            
        } catch (error) {
            if (error.status === 422) {
                // File already exists, try updating
                console.log('📝 File exists, attempting update...');
                
                const { data: existingFile } = await this.octokit.rest.repos.getContent({
                    owner,
                    repo,
                    path
                });

                await this.octokit.rest.repos.createOrUpdateFileContents({
                    owner,
                    repo,
                    path,
                    message: `📊 VPS logs update - ${new Date().toLocaleString()}`,
                    content: Buffer.from(content).toString('base64'),
                    branch: 'main',
                    sha: existingFile.sha
                });
                
                console.log(`✅ Logs updated on GitHub: ${path}`);
            } else {
                throw error;
            }
        }
    }

    async cleanupOldLogs(owner, repo) {
        try {
            const { data: files } = await this.octokit.rest.repos.getContent({
                owner,
                repo,
                path: 'logs/vps'
            });

            if (Array.isArray(files)) {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

                for (const file of files) {
                    // Extract date from filename
                    const match = file.name.match(/vps-logs-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
                    if (match) {
                        const fileDate = new Date(match[1].replace(/-/g, ':').replace('T', ' '));
                        
                        if (fileDate < cutoffDate) {
                            await this.octokit.rest.repos.deleteFile({
                                owner,
                                repo,
                                path: file.path,
                                message: `🗑️ Cleanup old logs: ${file.name}`,
                                sha: file.sha,
                                branch: 'main'
                            });
                            
                            console.log(`🗑️ Deleted old log file: ${file.name}`);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('⚠️ Failed to cleanup old logs:', error.message);
            // Don't throw - cleanup failure shouldn't stop log service
        }
    }

    async stop() {
        console.log('🛑 Stopping Log Return Service...');
        
        // Upload any remaining logs
        if (this.logBuffer.length > 0) {
            console.log('📤 Uploading final logs...');
            await this.uploadLogs();
        }
        
        console.log('✅ Log Return Service stopped');
    }
}

// Main execution
if (require.main === module) {
    const service = new LogReturnService();
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
        await service.stop();
        process.exit(0);
    });

    process.on('SIGINT', async () => {
        await service.stop();
        process.exit(0);
    });

    // Start service
    service.initialize().catch(error => {
        console.error('💥 Failed to start Log Return Service:', error);
        process.exit(1);
    });
}

module.exports = LogReturnService;
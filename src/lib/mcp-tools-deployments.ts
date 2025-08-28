import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CoolifyClient } from './coolify-client.js';

// Helper function to properly serialize errors
function formatError(error: any, operation: string): string {
  const errorObj = {
    success: false,
    operation,
    error: {
      message: error?.message || error?.toString() || 'Unknown error',
      code: error?.code || error?.response?.status || 'UNKNOWN',
      details: error?.response?.data || null,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    },
    timestamp: new Date().toISOString()
  };
  
  return JSON.stringify(errorObj, null, 2);
}

// Helper to limit response size for large datasets
function limitResponseSize(data: any[], maxItems: number = 25): any {
  if (!Array.isArray(data)) return data;
  
  const truncated = data.length > maxItems;
  const items = truncated ? data.slice(0, maxItems) : data;
  
  // Return only essential fields for large responses
  const summary = items.map(item => ({
    uuid: item.uuid || item.id,
    name: item.name || item.title || 'N/A',
    status: item.status,
    created_at: item.created_at,
    updated_at: item.updated_at
  }));
  
  return {
    items: summary,
    total: data.length,
    returned: summary.length,
    truncated,
    message: truncated 
      ? `Showing first ${maxItems} of ${data.length} items. Use pagination to see more.`
      : undefined
  };
}

export function registerDeploymentTools(server: McpServer, client: CoolifyClient) {
  // List all deployments
  server.tool('list_deployments', 'List all deployments across all applications', {
    skip: z.number().optional().describe('Number of records to skip for pagination'),
    take: z.number().optional().describe('Number of records to take (default: 10)'),
  }, async (args) => {
    try {
      const deployments = await client.listAllDeployments(args.skip, args.take);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: deployments,
            count: deployments.length,
            message: `Successfully retrieved ${deployments.length} deployments`
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: formatError(error, 'list_deployments')
        }]
      };
    }
  });

  // Get deployments for specific application
  server.tool('get_application_deployments', 'Get deployment history for a specific application', {
    uuid: z.string().describe('UUID of the application'),
    skip: z.number().optional().describe('Number of records to skip'),
    take: z.number().optional().describe('Number of records to take (default: 10)'),
  }, async (args) => {
    try {
      const deployments = await client.getDeployments(args.uuid, args.skip, args.take);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: deployments,
            count: deployments.length,
            applicationUuid: args.uuid,
            message: `Successfully retrieved ${deployments.length} deployments for application`
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            message: 'Failed to get application deployments'
          }, null, 2)
        }]
      };
    }
  });

  // Get specific deployment details
  server.tool('get_deployment', 'Get details about a specific deployment', {
    uuid: z.string().describe('UUID of the deployment'),
  }, async (args) => {
    try {
      const deployment = await client.getDeployment(args.uuid);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: deployment,
            message: `Successfully retrieved deployment details`
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            message: 'Failed to get deployment details'
          }, null, 2)
        }]
      };
    }
  });

  // Deploy by tag or UUID
  server.tool('deploy_by_tag', 'Trigger deployment by tag or UUID', {
    tagOrUuid: z.string().describe('Tag or UUID to deploy'),
  }, async (args) => {
    try {
      const result = await client.deployByTagOrUuid(args.tagOrUuid);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: result,
            message: result.message || 'Deployment triggered successfully'
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            message: 'Failed to trigger deployment'
          }, null, 2)
        }]
      };
    }
  });

  // Cancel deployment
  server.tool('cancel_deployment', 'Cancel a running deployment', {
    uuid: z.string().describe('UUID of the deployment to cancel'),
  }, async (args) => {
    try {
      const result = await client.cancelDeployment(args.uuid);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: result,
            message: result.message || 'Deployment cancelled successfully'
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            message: 'Failed to cancel deployment'
          }, null, 2)
        }]
      };
    }
  });

  // Start application with options
  server.tool('start_application', 'Start or deploy an application with optional force rebuild', {
    uuid: z.string().describe('UUID of the application'),
    force: z.boolean().optional().describe('Force rebuild (default: false)'),
    instant_deploy: z.boolean().optional().describe('Skip queuing for instant deployment (default: false)'),
  }, async (args) => {
    try {
      const result = await client.startApplication(args.uuid, {
        force: args.force,
        instant_deploy: args.instant_deploy
      });
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: result,
            message: `Application start/deployment queued successfully`
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            message: 'Failed to start application'
          }, null, 2)
        }]
      };
    }
  });

  // Stop application
  server.tool('stop_application', 'Stop a running application', {
    uuid: z.string().describe('UUID of the application'),
  }, async (args) => {
    try {
      const result = await client.stopApplication(args.uuid);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: result,
            message: result.message || 'Application stop request queued'
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            message: 'Failed to stop application'
          }, null, 2)
        }]
      };
    }
  });

  // Restart application
  server.tool('restart_application', 'Restart an application', {
    uuid: z.string().describe('UUID of the application'),
  }, async (args) => {
    try {
      const result = await client.restartApplication(args.uuid);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: result,
            message: result.message || 'Application restart request queued'
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            message: 'Failed to restart application'
          }, null, 2)
        }]
      };
    }
  });

  // Get application logs
  server.tool('get_application_logs', 'Get logs for an application', {
    uuid: z.string().describe('UUID of the application'),
    lines: z.number().optional().describe('Number of log lines to retrieve'),
    since: z.string().optional().describe('Get logs since this timestamp'),
    until: z.string().optional().describe('Get logs until this timestamp'),
  }, async (args) => {
    try {
      const logs = await client.getApplicationLogs(args.uuid, {
        lines: args.lines,
        since: args.since,
        until: args.until
      });
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: logs,
            count: logs.length,
            message: `Successfully retrieved ${logs.length} log entries`
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            message: 'Failed to get application logs'
          }, null, 2)
        }]
      };
    }
  });
}

export function registerDatabaseControlTools(server: McpServer, client: CoolifyClient) {
  // Start database
  server.tool('start_database', 'Start a database', {
    uuid: z.string().describe('UUID of the database'),
  }, async (args) => {
    try {
      const result = await client.startDatabase(args.uuid);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: result,
            message: result.message || 'Database start request queued'
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            message: 'Failed to start database'
          }, null, 2)
        }]
      };
    }
  });

  // Stop database
  server.tool('stop_database', 'Stop a database', {
    uuid: z.string().describe('UUID of the database'),
  }, async (args) => {
    try {
      const result = await client.stopDatabase(args.uuid);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: result,
            message: result.message || 'Database stop request queued'
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            message: 'Failed to stop database'
          }, null, 2)
        }]
      };
    }
  });

  // Restart database
  server.tool('restart_database', 'Restart a database', {
    uuid: z.string().describe('UUID of the database'),
  }, async (args) => {
    try {
      const result = await client.restartDatabase(args.uuid);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: result,
            message: result.message || 'Database restart request queued'
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            message: 'Failed to restart database'
          }, null, 2)
        }]
      };
    }
  });
}

export function registerServiceControlTools(server: McpServer, client: CoolifyClient) {
  // Start service
  server.tool('start_service', 'Start a service', {
    uuid: z.string().describe('UUID of the service'),
  }, async (args) => {
    try {
      const result = await client.startService(args.uuid);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: result,
            message: result.message || 'Service start request queued'
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            message: 'Failed to start service'
          }, null, 2)
        }]
      };
    }
  });

  // Stop service
  server.tool('stop_service', 'Stop a service', {
    uuid: z.string().describe('UUID of the service'),
  }, async (args) => {
    try {
      const result = await client.stopService(args.uuid);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: result,
            message: result.message || 'Service stop request queued'
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            message: 'Failed to stop service'
          }, null, 2)
        }]
      };
    }
  });

  // Restart service
  server.tool('restart_service', 'Restart a service', {
    uuid: z.string().describe('UUID of the service'),
  }, async (args) => {
    try {
      const result = await client.restartService(args.uuid);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: result,
            message: result.message || 'Service restart request queued'
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            message: 'Failed to restart service'
          }, null, 2)
        }]
      };
    }
  });
}
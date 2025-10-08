import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { CoolifyClient } from './coolify-client.js';
import { formatToolError, formatToolSuccess } from './tool-helpers.js';
import debug from 'debug';
import { z } from 'zod';
import type {
  ServerInfo,
  ServerResources,
  ServerDomain,
  ValidationResponse,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  Environment,
  Deployment,
  Database,
  DatabaseUpdateRequest,
  Service,
  CreateServiceRequest,
  DeleteServiceOptions,
} from '../types/coolify.js';

const log = debug('coolify:mcp');

// Define valid service types
const serviceTypes = [
  'activepieces',
  'appsmith',
  'appwrite',
  'authentik',
  'babybuddy',
  'budge',
  'changedetection',
  'chatwoot',
  'classicpress-with-mariadb',
  'classicpress-with-mysql',
  'classicpress-without-database',
  'cloudflared',
  'code-server',
  'dashboard',
  'directus',
  'directus-with-postgresql',
  'docker-registry',
  'docuseal',
  'docuseal-with-postgres',
  'dokuwiki',
  'duplicati',
  'emby',
  'embystat',
  'fider',
  'filebrowser',
  'firefly',
  'formbricks',
  'ghost',
  'gitea',
  'gitea-with-mariadb',
  'gitea-with-mysql',
  'gitea-with-postgresql',
  'glance',
  'glances',
  'glitchtip',
  'grafana',
  'grafana-with-postgresql',
  'grocy',
  'heimdall',
  'homepage',
  'jellyfin',
  'kuzzle',
  'listmonk',
  'logto',
  'mediawiki',
  'meilisearch',
  'metabase',
  'metube',
  'minio',
  'moodle',
  'n8n',
  'n8n-with-postgresql',
  'next-image-transformation',
  'nextcloud',
  'nocodb',
  'odoo',
  'openblocks',
  'pairdrop',
  'penpot',
  'phpmyadmin',
  'pocketbase',
  'posthog',
  'reactive-resume',
  'rocketchat',
  'shlink',
  'slash',
  'snapdrop',
  'statusnook',
  'stirling-pdf',
  'supabase',
  'syncthing',
  'tolgee',
  'trigger',
  'trigger-with-external-database',
  'twenty',
  'umami',
  'unleash-with-postgresql',
  'unleash-without-database',
  'uptime-kuma',
  'vaultwarden',
  'vikunja',
  'weblate',
  'whoogle',
  'wordpress-with-mariadb',
  'wordpress-with-mysql',
  'wordpress-without-database'
] as const;

export class CoolifyMcpServer extends McpServer {
  private client: CoolifyClient;

  constructor(config: { baseUrl: string; accessToken: string }) {
    super({
      name: 'coolify',
      version: '0.1.18'
    });
    
    log('Initializing server with config: %o', config);
    this.client = new CoolifyClient(config);
  }

  async initialize(): Promise<void> {
    // Register capabilities first
    await this.server.registerCapabilities({
      tools: {}
    });

    // Then register all tools
    this.tool('list_servers', 'List all Coolify servers', {}, async () => {
      try {
        const servers = await this.client.listServers();
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(servers, `Retrieved ${servers.length} servers`, { count: servers.length }), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'list_servers'), null, 2) }]
        };
      }
    });

    this.tool('get_server', 'Get details about a specific Coolify server', {
      uuid: z.string().describe('UUID of the server to get details for')
    }, async (args) => {
      try {
        const server = await this.client.getServer(args.uuid);
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(server, `Retrieved server: ${server.name}`), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'get_server', { uuid: args.uuid }), null, 2) }]
        };
      }
    });

    this.tool('get_server_resources', 'Get the current resources running on a specific Coolify server', {
      uuid: z.string()
    }, async (args, _extra) => {
      try {
        const resources = await this.client.getServerResources(args.uuid);
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(resources, 'Retrieved server resources'), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'get_server_resources', { uuid: args.uuid }), null, 2) }]
        };
      }
    });

    this.tool('get_server_domains', 'Get domains for a specific Coolify server', {
      uuid: z.string()
    }, async (args, _extra) => {
      try {
        const domains = await this.client.getServerDomains(args.uuid);
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(domains, `Retrieved ${domains.length} domains`, { count: domains.length }), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'get_server_domains', { uuid: args.uuid }), null, 2) }]
        };
      }
    });

    this.tool('validate_server', 'Validate a specific Coolify server', {
      uuid: z.string()
    }, async (args, _extra) => {
      try {
        const validation = await this.client.validateServer(args.uuid);
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(validation, 'Server validation completed'), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'validate_server', { uuid: args.uuid }), null, 2) }]
        };
      }
    });

    this.tool('list_projects', 'List all Coolify projects', {}, async (_args, _extra) => {
      try {
        const projects = await this.client.listProjects();
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(projects, `Retrieved ${projects.length} projects`, { count: projects.length }), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'list_projects'), null, 2) }]
        };
      }
    });

    this.tool('get_project', 'Get details about a specific Coolify project', {
      uuid: z.string()
    }, async (args, _extra) => {
      try {
        const project = await this.client.getProject(args.uuid);
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(project, `Retrieved project: ${project.name}`), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'get_project', { uuid: args.uuid }), null, 2) }]
        };
      }
    });

    this.tool('create_project', 'Create a new Coolify project', {
      name: z.string(),
      description: z.string().optional()
    }, async (args, _extra) => {
      try {
        const result = await this.client.createProject({
          name: args.name,
          description: args.description
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(result, `Project '${args.name}' created successfully`), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'create_project', { name: args.name }), null, 2) }]
        };
      }
    });

    this.tool('update_project', 'Update an existing Coolify project', {
      uuid: z.string(),
      name: z.string(),
      description: z.string().optional()
    }, async (args, _extra) => {
      try {
        const { uuid, ...updateData } = args;
        const result = await this.client.updateProject(uuid, updateData);
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(result, 'Project updated successfully'), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'update_project', { uuid: args.uuid }), null, 2) }]
        };
      }
    });

    this.tool('delete_project', 'Delete a Coolify project', {
      uuid: z.string()
    }, async (args, _extra) => {
      try {
        const result = await this.client.deleteProject(args.uuid);
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(result, 'Project deleted successfully'), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'delete_project', { uuid: args.uuid }), null, 2) }]
        };
      }
    });

    this.tool('get_project_environment', 'Get environment details for a Coolify project', {
      project_uuid: z.string(),
      environment_name_or_uuid: z.string()
    }, async (args, _extra) => {
      try {
        const environment = await this.client.getProjectEnvironment(args.project_uuid, args.environment_name_or_uuid);
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(environment, `Retrieved environment: ${environment.name}`), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'get_project_environment', { project_uuid: args.project_uuid, environment: args.environment_name_or_uuid }), null, 2) }]
        };
      }
    });

    this.tool('list_databases', 'List all Coolify databases (summarized)', {
      limit: z.number().optional().describe('Maximum number to return (default: 25, max: 100)')
    }, async (args, _extra) => {
      try {
        const databases = await this.client.listDatabases();
        const limit = Math.min(args?.limit || 25, 100);
        
        const limitedDbs = databases.slice(0, limit);
        const summary = limitedDbs.map((db: any) => ({
          uuid: db.uuid,
          name: db.name,
          type: db.type,
          status: db.status,
          created_at: db.created_at
        }));
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: true,
              data: summary,
              count: summary.length,
              total: databases.length,
              limited: databases.length > limit
            }, null, 2) 
          }]
        };
      } catch (error: any) {
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: false,
              error: error?.message || 'Failed to list databases'
            }, null, 2) 
          }]
        };
      }
    });

    this.tool('get_database', 'Get details about a specific Coolify database', {
      uuid: z.string()
    }, async (args, _extra) => {
      try {
        const database = await this.client.getDatabase(args.uuid);
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(database, `Retrieved database: ${database.name}`), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'get_database', { uuid: args.uuid }), null, 2) }]
        };
      }
    });

    this.tool('update_database', 'Update a Coolify database', {
      uuid: z.string(),
      data: z.record(z.unknown())
    }, async (args, _extra) => {
      try {
        const result = await this.client.updateDatabase(args.uuid, args.data);
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(result, 'Database updated successfully'), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'update_database', { uuid: args.uuid }), null, 2) }]
        };
      }
    });

    const deleteOptionsSchema = {
      deleteConfigurations: z.boolean().optional(),
      deleteVolumes: z.boolean().optional(),
      dockerCleanup: z.boolean().optional(),
      deleteConnectedNetworks: z.boolean().optional()
    };

    this.tool('delete_database', 'Delete a Coolify database', {
      uuid: z.string(),
      options: z.object(deleteOptionsSchema).optional()
    }, async (args, _extra) => {
      try {
        const result = await this.client.deleteDatabase(args.uuid, args.options);
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(result, 'Database deleted successfully'), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'delete_database', { uuid: args.uuid, options: args.options }), null, 2) }]
        };
      }
    });

    this.tool('deploy_application', 'Deploy a Coolify application', {
      uuid: z.string()
    }, async (args, _extra) => {
      try {
        const result = await this.client.deployApplication(args.uuid);
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(result, 'Application deployment initiated'), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'deploy_application', { uuid: args.uuid }), null, 2) }]
        };
      }
    });

    this.tool('list_services', 'List all Coolify services (summarized)', {
      limit: z.number().optional().describe('Maximum number to return (default: 25, max: 100)')
    }, async (args, _extra) => {
      try {
        const services = await this.client.listServices();
        const limit = Math.min(args?.limit || 25, 100);
        
        const limitedServices = services.slice(0, limit);
        const summary = limitedServices.map((svc: any) => ({
          uuid: svc.uuid,
          name: svc.name,
          type: svc.type,
          status: svc.status,
          created_at: svc.created_at
        }));
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: true,
              data: summary,
              count: summary.length,
              total: services.length,
              limited: services.length > limit
            }, null, 2) 
          }]
        };
      } catch (error: any) {
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: false,
              error: error?.message || 'Failed to list services'
            }, null, 2) 
          }]
        };
      }
    });

    this.tool('get_service', 'Get details about a specific Coolify service', {
      uuid: z.string()
    }, async (args, _extra) => {
      try {
        const service = await this.client.getService(args.uuid);
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(service, `Retrieved service: ${service.name}`), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'get_service', { uuid: args.uuid }), null, 2) }]
        };
      }
    });

    this.tool('create_service', 'Create a new Coolify service', {
      type: z.enum(serviceTypes),
      project_uuid: z.string(),
      server_uuid: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      environment_name: z.string().optional(),
      environment_uuid: z.string().optional(),
      destination_uuid: z.string().optional(),
      instant_deploy: z.boolean().optional()
    }, async (args, _extra) => {
      try {
        const result = await this.client.createService(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(result, `Service '${args.type}' created successfully`), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'create_service', { type: args.type, project_uuid: args.project_uuid }), null, 2) }]
        };
      }
    });

    this.tool('delete_service', 'Delete a Coolify service', {
      uuid: z.string(),
      options: z.object(deleteOptionsSchema).optional()
    }, async (args, _extra) => {
      try {
        const result = await this.client.deleteService(args.uuid, args.options);
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(result, 'Service deleted successfully'), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'delete_service', { uuid: args.uuid, options: args.options }), null, 2) }]
        };
      }
    });

    // Application Management Tools
    this.tool('list_applications', 'List all Coolify applications (summarized)', {
      limit: z.number().optional().describe('Maximum number of applications to return (default: 25, max: 100)'),
      full: z.boolean().optional().describe('Return full details instead of summary (default: false)')
    }, async (args, _extra) => {
      try {
        const applications = await this.client.listApplications();
        const limit = Math.min(args?.limit || 25, 100);
        const returnFull = args?.full || false;
        
        // Limit the number of applications
        const limitedApps = applications.slice(0, limit);
        
        // Create summary or return full based on parameter
        const result = returnFull ? limitedApps : limitedApps.map((app: any) => ({
          uuid: app.uuid,
          name: app.name,
          status: app.status,
          fqdn: app.fqdn,
          git_repository: app.git_repository,
          git_branch: app.git_branch,
          created_at: app.created_at,
          // Only essential fields for summary
        }));
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: true,
              data: result,
              pagination: {
                total: applications.length,
                returned: result.length,
                limited: applications.length > limit,
                message: applications.length > limit 
                  ? `Showing first ${limit} of ${applications.length} applications. Use limit parameter to see more.`
                  : `Showing all ${applications.length} applications`
              },
              hint: returnFull 
                ? 'Returning full details. Use full:false for summary only.'
                : 'Returning summary. Use full:true for complete details.'
            }, null, 2) 
          }]
        };
      } catch (error: any) {
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: false,
              error: {
                message: error?.message || 'Failed to list applications',
                code: error?.code || error?.response?.status || 'UNKNOWN'
              }
            }, null, 2) 
          }]
        };
      }
    });

    this.tool('get_application', 'Get details about a specific Coolify application', {
      uuid: z.string()
    }, async (args, _extra) => {
      try {
        const application = await this.client.getApplication(args.uuid);
        
        // Limit response size by removing very large fields if present
        const response: any = {
          ...application
        };
        
        // Clean up potentially large fields
        if (response.docker_compose_raw) response.docker_compose_raw = '[Truncated - too large]';
        if (response.docker_compose) response.docker_compose = '[Truncated - too large]';
        if (response.custom_labels && response.custom_labels.length > 100) {
          response.custom_labels = response.custom_labels.substring(0, 100) + '...[Truncated]';
        }
        if (response.environment_variables) {
          response.environment_variables = '[Environment variables hidden]';
        }
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: true,
              data: response
            }, null, 2) 
          }]
        };
      } catch (error: any) {
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: false,
              error: {
                message: error?.message || 'Failed to get application',
                code: error?.code || error?.response?.status || 'UNKNOWN',
                details: error?.response?.data || null
              },
              uuid: args.uuid
            }, null, 2) 
          }]
        };
      }
    });

    this.tool('create_application', 'Create a new Coolify application', {
      name: z.string(),
      description: z.string().optional(),
      project_uuid: z.string(),
      server_uuid: z.string(),
      environment_name: z.string().optional(),
      environment_uuid: z.string().optional(),
      destination_uuid: z.string().optional(),
      git_repository: z.string().optional(),
      git_branch: z.string().optional(),
      build_pack: z.enum(['nixpacks', 'dockerfile', 'docker-compose', 'static']).optional(),
      dockerfile_location: z.string().optional(),
      docker_compose_location: z.string().optional(),
      base_directory: z.string().optional(),
      fqdn: z.string().optional()
    }, async (args, _extra) => {
      try {
        const result = await this.client.createApplication(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(result, `Application '${args.name}' created successfully`), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'create_application', { name: args.name, project_uuid: args.project_uuid, server_uuid: args.server_uuid }), null, 2) }]
        };
      }
    });

    this.tool('delete_application', 'Delete a Coolify application', {
      uuid: z.string(),
      options: z.object(deleteOptionsSchema).optional()
    }, async (args, _extra) => {
      try {
        const result = await this.client.deleteApplication(args.uuid, args.options);
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(result, 'Application deleted successfully'), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'delete_application', { uuid: args.uuid, options: args.options }), null, 2) }]
        };
      }
    });

    // Environment Variable Management
    this.tool('get_application_environment_variables', 'Get environment variables for an application', {
      uuid: z.string()
    }, async (args, _extra) => {
      try {
        const variables = await this.client.getApplicationEnvironmentVariables(args.uuid);
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: true,
              data: variables,
              count: variables.length,
              message: `Retrieved ${variables.length} environment variables`
            }, null, 2) 
          }]
        };
      } catch (error: any) {
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: false,
              error: {
                message: error?.message || 'Failed to get environment variables',
                code: error?.code || error?.response?.status || 'UNKNOWN',
                details: error?.response?.data || null
              },
              uuid: args.uuid
            }, null, 2) 
          }]
        };
      }
    });

    this.tool('update_application_environment_variables', 'Update environment variables for an application', {
      uuid: z.string(),
      variables: z.array(z.object({
        key: z.string(),
        value: z.string(),
        is_preview: z.boolean().optional(),
        is_build_time: z.boolean().optional(),
        is_literal: z.boolean().optional()
      }))
    }, async (args, _extra) => {
      try {
        const result = await this.client.updateApplicationEnvironmentVariables(args.uuid, args.variables);
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(result, `Updated ${args.variables.length} environment variable(s)`), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'update_application_environment_variables', { uuid: args.uuid, count: args.variables.length }), null, 2) }]
        };
      }
    });

    // Docker Compose Service Management
    this.tool('create_docker_compose_service', 'Create a new Docker Compose service', {
      name: z.string(),
      description: z.string().optional(),
      project_uuid: z.string(),
      server_uuid: z.string(),
      docker_compose_raw: z.string(),
      git_repository: z.string().optional(),
      git_branch: z.string().optional(),
      instant_deploy: z.boolean().optional()
    }, async (args, _extra) => {
      try {
        const result = await this.client.createDockerComposeService(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(result, `Docker Compose service '${args.name}' created successfully`), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'create_docker_compose_service', { name: args.name, project_uuid: args.project_uuid }), null, 2) }]
        };
      }
    });

    // Deployment Management
    this.tool('get_deployments', 'Get deployments for an application (with pagination)', {
      application_uuid: z.string().describe('UUID of the application'),
      skip: z.number().optional().describe('Number of records to skip (default: 0)'),
      limit: z.number().optional().describe('Maximum number of deployments to return (default: 10, max: 50)')
    }, async (args, _extra) => {
      try {
        const skip = args.skip || 0;
        const limit = Math.min(args.limit || 10, 50); // Default 10, max 50
        
        const deployments = await this.client.getDeployments(args.application_uuid, skip, limit);
        
        // Ensure response is an array
        const deploymentArray = Array.isArray(deployments) ? deployments : [];
        
        // Create a summary for each deployment to reduce size
        const summary = deploymentArray.map((d: any) => ({
          id: d.id,
          uuid: d.uuid || d.deployment_uuid,
          status: d.status,
          created_at: d.created_at,
          updated_at: d.updated_at,
          commit: d.commit?.substring(0, 8) || d.git_commit_sha?.substring(0, 8),
          commit_message: d.commit_message?.substring(0, 100) || d.message?.substring(0, 100),
          application_name: d.application_name,
          deployment_url: d.deployment_url,
          // Explicitly exclude large fields like logs, build_logs, environment_variables
          // For full details including logs, use get_deployment with specific UUID
        }));
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: true,
              data: summary,
              pagination: {
                skip,
                limit,
                count: summary.length,
                hasMore: summary.length === limit,
                message: `Showing ${summary.length} deployments (skip: ${skip}, limit: ${limit})`
              },
              hint: 'Use skip and limit parameters for pagination. For full deployment details, use get_deployment with specific UUID.'
            }, null, 2) 
          }]
        };
      } catch (error: any) {
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: false,
              error: {
                message: error?.message || 'Failed to get deployments',
                code: error?.code || error?.response?.status || 'UNKNOWN',
                details: error?.response?.data || null
              },
              application_uuid: args.application_uuid,
              hint: 'Try using skip:0 and limit:10 parameters'
            }, null, 2) 
          }]
        };
      }
    });

    // Note: get_deployment and cancel_deployment are registered in mcp-tools-deployments.ts

    // Application Resources and Logs
    this.tool('get_application_resources', 'Get resource usage for an application', {
      uuid: z.string()
    }, async (args, _extra) => {
      try {
        const resources = await this.client.getApplicationResources(args.uuid);
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(resources, 'Retrieved application resources'), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'get_application_resources', { uuid: args.uuid }), null, 2) }]
        };
      }
    });

    // Note: get_application_logs is registered in mcp-tools-deployments.ts

    // Full-Stack Deployment Tools
    this.tool('create_fullstack_project', 'Create a new project with common services (PostgreSQL, Redis, MinIO)', {
      name: z.string(),
      description: z.string().optional(),
      domain: z.string().optional(),
      server_uuid: z.string()
    }, async (args, _extra) => {
      try {
        const result = await this.client.createFullStackProject(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(result, `Full-stack project '${args.name}' created successfully`), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'create_fullstack_project', { name: args.name, server_uuid: args.server_uuid }), null, 2) }]
        };
      }
    });

    this.tool('deploy_infrastructure_stack', 'Deploy common infrastructure services (PostgreSQL, Redis, MinIO)', {
      project_uuid: z.string(),
      server_uuid: z.string(),
      include_postgres: z.boolean().default(true),
      include_redis: z.boolean().default(true),
      include_minio: z.boolean().default(true),
      domain: z.string().optional(),
      environment_variables: z.record(z.string()).optional()
    }, async (args, _extra) => {
      const config = {
        includePostgres: args.include_postgres,
        includeRedis: args.include_redis,
        includeMinIO: args.include_minio,
        domain: args.domain,
        environment_variables: args.environment_variables
      };
      try {
        const result = await this.client.deployInfrastructureStack(args.project_uuid, args.server_uuid, config);
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolSuccess(result, 'Infrastructure stack deployed successfully'), null, 2) }]
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: JSON.stringify(formatToolError(error, 'deploy_infrastructure_stack', { project_uuid: args.project_uuid, server_uuid: args.server_uuid, config }), null, 2) }]
        };
      }
    });

    // Resources Management
    this.tool('list_resources', 'List all resources across all servers', {}, async (_args, _extra) => {
      try {
        const resources = await this.client.listResources();
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: true,
              data: resources,
              count: resources.length,
              message: `Found ${resources.length} total resources`
            }, null, 2) 
          }]
        };
      } catch (error: any) {
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: false,
              error: {
                message: error?.message || 'Failed to list resources',
                code: error?.code || error?.response?.status || 'UNKNOWN'
              }
            }, null, 2) 
          }]
        };
      }
    });

    // Teams Management
    this.tool('list_teams', 'List all teams', {}, async (_args, _extra) => {
      try {
        const teams = await this.client.listTeams();
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: true,
              data: teams,
              count: teams.length
            }, null, 2) 
          }]
        };
      } catch (error: any) {
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: false,
              error: {
                message: error?.message || 'Failed to list teams',
                code: error?.code || error?.response?.status || 'UNKNOWN'
              }
            }, null, 2) 
          }]
        };
      }
    });

    this.tool('get_team', 'Get team details by ID', {
      id: z.string()
    }, async (args, _extra) => {
      try {
        const team = await this.client.getTeam(args.id);
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: true,
              data: team
            }, null, 2) 
          }]
        };
      } catch (error: any) {
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: false,
              error: {
                message: error?.message || 'Failed to get team',
                code: error?.code || error?.response?.status || 'UNKNOWN'
              },
              id: args.id
            }, null, 2) 
          }]
        };
      }
    });

    this.tool('get_current_team', 'Get current authenticated team', {}, async (_args, _extra) => {
      try {
        const team = await this.client.getCurrentTeam();
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: true,
              data: team
            }, null, 2) 
          }]
        };
      } catch (error: any) {
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: false,
              error: {
                message: error?.message || 'Failed to get current team',
                code: error?.code || error?.response?.status || 'UNKNOWN'
              }
            }, null, 2) 
          }]
        };
      }
    });

    this.tool('get_team_members', 'Get members of a team', {
      id: z.string()
    }, async (args, _extra) => {
      try {
        const members = await this.client.getTeamMembers(args.id);
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: true,
              data: members,
              count: members.length,
              team_id: args.id
            }, null, 2) 
          }]
        };
      } catch (error: any) {
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: false,
              error: {
                message: error?.message || 'Failed to get team members',
                code: error?.code || error?.response?.status || 'UNKNOWN'
              },
              id: args.id
            }, null, 2) 
          }]
        };
      }
    });

    // Specialized Database Creation Tools
    this.tool('create_postgresql_database', 'Create a PostgreSQL database', {
      server_uuid: z.string(),
      project_uuid: z.string(),
      name: z.string(),
      postgres_user: z.string().default('postgres'),
      postgres_password: z.string(),
      postgres_db: z.string(),
      environment_name: z.string().optional(),
      instant_deploy: z.boolean().default(true)
    }, async (args, _extra) => {
      try {
        const result = await this.client.createPostgreSQLDatabase(args);
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: true,
              data: result,
              message: 'PostgreSQL database created successfully'
            }, null, 2) 
          }]
        };
      } catch (error: any) {
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: false,
              error: {
                message: error?.message || 'Failed to create PostgreSQL database',
                code: error?.code || error?.response?.status || 'UNKNOWN'
              }
            }, null, 2) 
          }]
        };
      }
    });

    this.tool('create_mysql_database', 'Create a MySQL database', {
      server_uuid: z.string(),
      project_uuid: z.string(),
      name: z.string(),
      mysql_user: z.string(),
      mysql_password: z.string(),
      mysql_database: z.string(),
      mysql_root_password: z.string(),
      environment_name: z.string().optional(),
      instant_deploy: z.boolean().default(true)
    }, async (args, _extra) => {
      try {
        const result = await this.client.createMySQLDatabase(args);
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: true,
              data: result,
              message: 'MySQL database created successfully'
            }, null, 2) 
          }]
        };
      } catch (error: any) {
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: false,
              error: {
                message: error?.message || 'Failed to create MySQL database',
                code: error?.code || error?.response?.status || 'UNKNOWN'
              }
            }, null, 2) 
          }]
        };
      }
    });

    this.tool('create_mongodb_database', 'Create a MongoDB database', {
      server_uuid: z.string(),
      project_uuid: z.string(),
      name: z.string(),
      mongo_initdb_root_username: z.string().default('root'),
      environment_name: z.string().optional(),
      instant_deploy: z.boolean().default(true)
    }, async (args, _extra) => {
      try {
        const result = await this.client.createMongoDBDatabase(args);
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: true,
              data: result,
              message: 'MongoDB database created successfully'
            }, null, 2) 
          }]
        };
      } catch (error: any) {
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: false,
              error: {
                message: error?.message || 'Failed to create MongoDB database',
                code: error?.code || error?.response?.status || 'UNKNOWN'
              }
            }, null, 2) 
          }]
        };
      }
    });

    this.tool('create_redis_database', 'Create a Redis database', {
      server_uuid: z.string(),
      project_uuid: z.string(),
      name: z.string(),
      environment_name: z.string().optional(),
      instant_deploy: z.boolean().default(true)
    }, async (args, _extra) => {
      try {
        const result = await this.client.createRedisDatabase(args);
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: true,
              data: result,
              message: 'Redis database created successfully'
            }, null, 2) 
          }]
        };
      } catch (error: any) {
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({
              success: false,
              error: {
                message: error?.message || 'Failed to create Redis database',
                code: error?.code || error?.response?.status || 'UNKNOWN'
              }
            }, null, 2) 
          }]
        };
      }
    });
  }

  async connect(transport: Transport): Promise<void> {
    log('Starting server...');
    log('Validating connection...');
    await this.client.validateConnection();
    await this.initialize();
    await super.connect(transport);
    log('Server started successfully');
  }

  async list_servers(): Promise<ServerInfo[]> {
    return this.client.listServers();
  }

  async get_server(uuid: string): Promise<ServerInfo> {
    return this.client.getServer(uuid);
  }

  async get_server_resources(uuid: string): Promise<ServerResources> {
    return this.client.getServerResources(uuid);
  }

  async get_server_domains(uuid: string): Promise<ServerDomain[]> {
    return this.client.getServerDomains(uuid);
  }

  async validate_server(uuid: string): Promise<ValidationResponse> {
    return this.client.validateServer(uuid);
  }

  async list_projects(): Promise<Project[]> {
    return this.client.listProjects();
  }

  async get_project(uuid: string): Promise<Project> {
    return this.client.getProject(uuid);
  }

  async create_project(project: CreateProjectRequest): Promise<{ uuid: string }> {
    return this.client.createProject(project);
  }

  async update_project(uuid: string, project: UpdateProjectRequest): Promise<Project> {
    return this.client.updateProject(uuid, project);
  }

  async delete_project(uuid: string): Promise<{ message: string }> {
    return this.client.deleteProject(uuid);
  }

  async get_project_environment(
    projectUuid: string,
    environmentNameOrUuid: string,
  ): Promise<Environment> {
    return this.client.getProjectEnvironment(projectUuid, environmentNameOrUuid);
  }

  async deploy_application(params: { uuid: string }): Promise<Deployment> {
    return this.client.deployApplication(params.uuid);
  }

  async list_databases(): Promise<Database[]> {
    return this.client.listDatabases();
  }

  async get_database(uuid: string): Promise<Database> {
    return this.client.getDatabase(uuid);
  }

  async update_database(uuid: string, data: DatabaseUpdateRequest): Promise<Database> {
    return this.client.updateDatabase(uuid, data);
  }

  async delete_database(
    uuid: string,
    options?: {
      deleteConfigurations?: boolean;
      deleteVolumes?: boolean;
      dockerCleanup?: boolean;
      deleteConnectedNetworks?: boolean;
    },
  ): Promise<{ message: string }> {
    return this.client.deleteDatabase(uuid, options);
  }

  async list_services(): Promise<Service[]> {
    return this.client.listServices();
  }

  async get_service(uuid: string): Promise<Service> {
    return this.client.getService(uuid);
  }

  async create_service(data: CreateServiceRequest): Promise<{ uuid: string; domains: string[] }> {
    return this.client.createService(data);
  }

  async delete_service(uuid: string, options?: DeleteServiceOptions): Promise<{ message: string }> {
    return this.client.deleteService(uuid, options);
  }
}

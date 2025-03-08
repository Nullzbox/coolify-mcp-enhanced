import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { CoolifyClient } from './coolify-client.js';
import {
  CoolifyConfig,
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
  ServiceType,
} from '../types/coolify.js';
import { z } from 'zod';
import {
  DatabaseResources,
  DeploymentResources,
  ApplicationResources,
  ServiceResources,
} from '../resources/index.js';

export class CoolifyMcpServer {
  private server: Server;
  private client: CoolifyClient;
  private databaseResources: DatabaseResources;
  private deploymentResources: DeploymentResources;
  private applicationResources: ApplicationResources;
  private serviceResources: ServiceResources;

  constructor(config: CoolifyConfig) {
    console.debug('[CoolifyMCP] Initializing server with config:', JSON.stringify(config, null, 2));
    this.client = new CoolifyClient(config);
    this.server = new Server(
      {
        name: 'coolify',
        version: '0.1.17',
      },
      {
        capabilities: {
          tools: {
            list_servers: { enabled: true },
            get_server: { enabled: true },
            get_server_resources: { enabled: true },
            get_server_domains: { enabled: true },
            validate_server: { enabled: true },
            list_projects: { enabled: true },
            get_project: { enabled: true },
            create_project: { enabled: true },
            update_project: { enabled: true },
            delete_project: { enabled: true },
            get_project_environment: { enabled: true },
            list_databases: { enabled: true },
            get_database: { enabled: true },
            update_database: { enabled: true },
            delete_database: { enabled: true },
            deploy_application: { enabled: true },
            list_services: { enabled: true },
            get_service: { enabled: true },
            create_service: { enabled: true },
            delete_service: { enabled: true }
          },
        },
      },
    );

    this.databaseResources = new DatabaseResources(this.client);
    this.deploymentResources = new DeploymentResources(this.client);
    this.applicationResources = new ApplicationResources(this.client);
    this.serviceResources = new ServiceResources(this.client);
    this.setupHandlers();
  }

  private setupHandlers(): void {
    console.debug('[CoolifyMCP] Setting up request handlers');
    
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.debug('[CoolifyMCP] Handling ListTools request');
      return {
        tools: [
          {
            name: 'list_servers',
            description: 'List all Coolify servers',
            inputSchema: {},
          },
          {
            name: 'get_server',
            description: 'Get details about a specific Coolify server',
            inputSchema: {
              type: 'object',
              properties: {
                uuid: { type: 'string', description: 'UUID of the server to get details for' },
              },
              required: ['uuid'],
            },
          },
          {
            name: 'get_server_resources',
            description: 'Get the current resources running on a specific Coolify server',
            inputSchema: {
              type: 'object',
              properties: {
                uuid: { type: 'string', description: 'UUID of the server to get resources for' },
              },
              required: ['uuid'],
            },
          },
          {
            name: 'get_server_domains',
            description: 'Get the domains associated with a specific Coolify server',
            inputSchema: {
              type: 'object',
              properties: {
                uuid: { type: 'string', description: 'UUID of the server to get domains for' },
              },
              required: ['uuid'],
            },
          },
          {
            name: 'validate_server',
            description: 'Validate the connection to a specific Coolify server',
            inputSchema: {
              type: 'object',
              properties: {
                uuid: { type: 'string', description: 'UUID of the server to validate' },
              },
              required: ['uuid'],
            },
          },
          {
            name: 'list_projects',
            description: 'List all Coolify projects',
            inputSchema: {},
          },
          {
            name: 'get_project',
            description: 'Get details about a specific Coolify project',
            inputSchema: {
              type: 'object',
              properties: {
                uuid: { type: 'string', description: 'UUID of the project to get details for' },
              },
              required: ['uuid'],
            },
          },
          {
            name: 'create_project',
            description: 'Create a new Coolify project',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Name of the project' },
                description: { type: 'string', description: 'Optional description of the project' },
              },
              required: ['name'],
            },
          },
          {
            name: 'update_project',
            description: 'Update an existing Coolify project',
            inputSchema: {
              type: 'object',
              properties: {
                uuid: { type: 'string', description: 'UUID of the project to update' },
                name: { type: 'string', description: 'New name for the project' },
                description: { type: 'string', description: 'New description for the project' },
              },
              required: ['uuid'],
            },
          },
          {
            name: 'delete_project',
            description: 'Delete a Coolify project',
            inputSchema: {
              type: 'object',
              properties: {
                uuid: { type: 'string', description: 'UUID of the project to delete' },
              },
              required: ['uuid'],
            },
          },
          {
            name: 'get_project_environment',
            description: 'Get details about a specific environment in a project',
            inputSchema: {
              type: 'object',
              properties: {
                project_uuid: { type: 'string', description: 'UUID of the project' },
                environment_name_or_uuid: {
                  type: 'string',
                  description: 'Name or UUID of the environment',
                },
              },
              required: ['project_uuid', 'environment_name_or_uuid'],
            },
          },
          {
            name: 'list_databases',
            description: 'List all databases',
            inputSchema: {},
          },
          {
            name: 'get_database',
            description: 'Get details about a specific Coolify database',
            inputSchema: {
              type: 'object',
              properties: {
                uuid: { type: 'string', description: 'UUID of the database to get details for' },
              },
              required: ['uuid'],
            },
          },
          {
            name: 'update_database',
            description: 'Update a Coolify database',
            inputSchema: {
              type: 'object',
              properties: {
                uuid: { type: 'string', description: 'UUID of the database to update' },
                data: { type: 'object', description: 'Update data for the database' },
              },
              required: ['uuid', 'data'],
            },
          },
          {
            name: 'delete_database',
            description: 'Delete a Coolify database',
            inputSchema: {
              type: 'object',
              properties: {
                uuid: { type: 'string', description: 'UUID of the database to delete' },
                options: {
                  type: 'object',
                  properties: {
                    deleteConfigurations: { type: 'boolean' },
                    deleteVolumes: { type: 'boolean' },
                    dockerCleanup: { type: 'boolean' },
                    deleteConnectedNetworks: { type: 'boolean' },
                  },
                },
              },
              required: ['uuid'],
            },
          },
          {
            name: 'deploy_application',
            description: 'Deploy a Coolify application',
            inputSchema: {
              type: 'object',
              properties: {
                uuid: { type: 'string', description: 'UUID of the application to deploy' },
              },
              required: ['uuid'],
            },
          },
          {
            name: 'list_services',
            description: 'List all services',
            inputSchema: {},
          },
          {
            name: 'get_service',
            description: 'Get details about a specific Coolify service',
            inputSchema: {
              type: 'object',
              properties: {
                uuid: { type: 'string', description: 'UUID of the service to get details for' },
              },
              required: ['uuid'],
            },
          },
          {
            name: 'create_service',
            description: 'Create a new Coolify service',
            inputSchema: {
              type: 'object',
              properties: {
                type: { type: 'string', description: 'Type of service to create' },
                project_uuid: { type: 'string', description: 'UUID of the project' },
                server_uuid: { type: 'string', description: 'UUID of the server' },
                data: { type: 'object', description: 'Additional service configuration' },
              },
              required: ['type', 'project_uuid', 'server_uuid'],
            },
          },
          {
            name: 'delete_service',
            description: 'Delete a Coolify service',
            inputSchema: {
              type: 'object',
              properties: {
                uuid: { type: 'string', description: 'UUID of the service to delete' },
                options: {
                  type: 'object',
                  properties: {
                    deleteConfigurations: { type: 'boolean' },
                    deleteVolumes: { type: 'boolean' },
                    dockerCleanup: { type: 'boolean' },
                    deleteConnectedNetworks: { type: 'boolean' },
                  },
                },
              },
              required: ['uuid'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: { params: { name: string; arguments?: Record<string, unknown> } }) => {
      try {
        if (!request.params.arguments) {
          throw new Error('Arguments are required');
        }

        switch (request.params.name) {
          case 'list_servers': {
            const servers = await this.client.listServers();
            return {
              content: [{ type: 'text', text: JSON.stringify(servers, null, 2) }],
            };
          }
          case 'get_server': {
            const args = z.object({ uuid: z.string() }).parse(request.params.arguments);
            const server = await this.client.getServer(args.uuid);
            return {
              content: [{ type: 'text', text: JSON.stringify(server, null, 2) }],
            };
          }
          case 'get_server_resources': {
            const args = z.object({ uuid: z.string() }).parse(request.params.arguments);
            const resources = await this.client.getServerResources(args.uuid);
            return {
              content: [{ type: 'text', text: JSON.stringify(resources, null, 2) }],
            };
          }
          case 'get_server_domains': {
            const args = z.object({ uuid: z.string() }).parse(request.params.arguments);
            const domains = await this.client.getServerDomains(args.uuid);
            return {
              content: [{ type: 'text', text: JSON.stringify(domains, null, 2) }],
            };
          }
          case 'validate_server': {
            const args = z.object({ uuid: z.string() }).parse(request.params.arguments);
            const result = await this.client.validateServer(args.uuid);
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          }
          case 'list_projects': {
            const projects = await this.client.listProjects();
            return {
              content: [{ type: 'text', text: JSON.stringify(projects, null, 2) }],
            };
          }
          case 'get_project': {
            const args = z.object({ uuid: z.string() }).parse(request.params.arguments);
            const project = await this.client.getProject(args.uuid);
            return {
              content: [{ type: 'text', text: JSON.stringify(project, null, 2) }],
            };
          }
          case 'create_project': {
            const args = z
              .object({
                name: z.string(),
                description: z.string().optional(),
              })
              .parse(request.params.arguments);
            const result = await this.client.createProject(args);
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          }
          case 'update_project': {
            const args = z
              .object({
                uuid: z.string(),
                name: z.string().optional(),
                description: z.string().optional(),
              })
              .parse(request.params.arguments);
            const { uuid, ...updateData } = args;
            const result = await this.client.updateProject(uuid, updateData);
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          }
          case 'delete_project': {
            const args = z.object({ uuid: z.string() }).parse(request.params.arguments);
            const result = await this.client.deleteProject(args.uuid);
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          }
          case 'get_project_environment': {
            const args = z
              .object({
                project_uuid: z.string(),
                environment_name_or_uuid: z.string(),
              })
              .parse(request.params.arguments);
            const environment = await this.client.getProjectEnvironment(
              args.project_uuid,
              args.environment_name_or_uuid,
            );
            return {
              content: [{ type: 'text', text: JSON.stringify(environment, null, 2) }],
            };
          }
          case 'list_databases': {
            const databases = await this.client.listDatabases();
            return {
              content: [{ type: 'text', text: JSON.stringify(databases, null, 2) }],
            };
          }
          case 'get_database': {
            const args = z.object({ uuid: z.string() }).parse(request.params.arguments);
            const database = await this.client.getDatabase(args.uuid);
            return {
              content: [{ type: 'text', text: JSON.stringify(database, null, 2) }],
            };
          }
          case 'update_database': {
            const args = z
              .object({
                uuid: z.string(),
                data: z.object({}).passthrough(),
              })
              .parse(request.params.arguments);
            const database = await this.client.updateDatabase(args.uuid, args.data);
            return {
              content: [{ type: 'text', text: JSON.stringify(database, null, 2) }],
            };
          }
          case 'delete_database': {
            const args = z
              .object({
                uuid: z.string(),
                options: z
                  .object({
                    deleteConfigurations: z.boolean().optional(),
                    deleteVolumes: z.boolean().optional(),
                    dockerCleanup: z.boolean().optional(),
                    deleteConnectedNetworks: z.boolean().optional(),
                  })
                  .optional(),
              })
              .parse(request.params.arguments);
            const result = await this.client.deleteDatabase(args.uuid, args.options);
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          }
          case 'deploy_application': {
            const args = z.object({ uuid: z.string() }).parse(request.params.arguments);
            const deployment = await this.client.deployApplication(args.uuid);
            return {
              content: [{ type: 'text', text: JSON.stringify(deployment, null, 2) }],
            };
          }
          case 'list_services': {
            const services = await this.client.listServices();
            return {
              content: [{ type: 'text', text: JSON.stringify(services, null, 2) }],
            };
          }
          case 'get_service': {
            const args = z.object({ uuid: z.string() }).parse(request.params.arguments);
            const service = await this.client.getService(args.uuid);
            return {
              content: [{ type: 'text', text: JSON.stringify(service, null, 2) }],
            };
          }
          case 'create_service': {
            const args = z
              .object({
                type: z.enum([
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
                  'wordpress-without-database',
                ]) as z.ZodType<ServiceType>,
                project_uuid: z.string(),
                server_uuid: z.string(),
                name: z.string().optional(),
                description: z.string().optional(),
                environment_name: z.string().optional(),
                environment_uuid: z.string().optional(),
                destination_uuid: z.string().optional(),
                instant_deploy: z.boolean().optional(),
                data: z.object({}).passthrough().optional(),
              })
              .parse(request.params.arguments);
            const result = await this.client.createService(args);
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          }
          case 'delete_service': {
            const args = z
              .object({
                uuid: z.string(),
                options: z
                  .object({
                    deleteConfigurations: z.boolean().optional(),
                    deleteVolumes: z.boolean().optional(),
                    dockerCleanup: z.boolean().optional(),
                    deleteConnectedNetworks: z.boolean().optional(),
                  })
                  .optional(),
              })
              .parse(request.params.arguments);
            const result = await this.client.deleteService(args.uuid, args.options);
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          }
          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(`Invalid input: ${JSON.stringify(error.errors)}`);
        }
        throw error;
      }
    });
  }

  async start(transport: Transport): Promise<void> {
    console.debug('[CoolifyMCP] Starting server...');
    try {
      console.debug('[CoolifyMCP] Validating connection...');
      await this.client.validateConnection();
      console.debug('[CoolifyMCP] Connection validated, connecting transport...');
      await this.server.connect(transport);
      console.debug('[CoolifyMCP] Server started successfully');
    } catch (error) {
      console.error('[CoolifyMCP] Error starting server:', error);
      throw error;
    }
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

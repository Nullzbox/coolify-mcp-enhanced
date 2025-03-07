import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
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
} from '../types/coolify.js';
import { z } from 'zod';
import {
  DatabaseResources,
  DeploymentResources,
  ApplicationResources,
  ServiceResources,
} from '../resources/index.js';

export class CoolifyMcpServer {
  private server: McpServer;
  private client: CoolifyClient;
  private databaseResources: DatabaseResources;
  private deploymentResources: DeploymentResources;
  private applicationResources: ApplicationResources;
  private serviceResources: ServiceResources;

  constructor(config: CoolifyConfig) {
    this.server = new McpServer({
      name: 'coolify',
      version: '0.1.0',
    });

    this.client = new CoolifyClient(config);
    this.databaseResources = new DatabaseResources(this.client);
    this.deploymentResources = new DeploymentResources(this.client);
    this.applicationResources = new ApplicationResources(this.client);
    this.serviceResources = new ServiceResources(this.client);
    this.setupTools();
  }

  private setupTools(): void {
    this.server.tool('list_servers', 'List all Coolify servers', {}, async () => {
      try {
        const servers = await this.client.listServers();
        return {
          content: [{ type: 'text', text: JSON.stringify(servers) }],
          isError: false,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [{ type: 'text', text: errorMessage }],
          isError: true,
        };
      }
    });

    this.server.tool(
      'get_server',
      'Get details about a specific Coolify server',
      { uuid: z.string().describe('UUID of the server to get details for') },
      async (params: { uuid: string }) => {
        try {
          const server = await this.client.getServer(params.uuid);
          return {
            content: [{ type: 'text', text: JSON.stringify(server) }],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true,
          };
        }
      },
    );

    this.server.tool(
      'get_server_resources',
      'Get the current resources running on a specific Coolify server',
      { uuid: z.string().describe('UUID of the server to get resources for') },
      async (params: { uuid: string }) => {
        try {
          const resources = await this.client.getServerResources(params.uuid);
          return {
            content: [{ type: 'text', text: JSON.stringify(resources) }],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true,
          };
        }
      },
    );

    this.server.tool(
      'get_server_domains',
      'Get the domains associated with a specific Coolify server',
      { uuid: z.string().describe('UUID of the server to get domains for') },
      async (params: { uuid: string }) => {
        try {
          const domains = await this.client.getServerDomains(params.uuid);
          return {
            content: [{ type: 'text', text: JSON.stringify(domains) }],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true,
          };
        }
      },
    );

    this.server.tool(
      'validate_server',
      'Validate the connection to a specific Coolify server',
      { uuid: z.string().describe('UUID of the server to validate') },
      async (params: { uuid: string }) => {
        try {
          const result = await this.client.validateServer(params.uuid);
          return {
            content: [{ type: 'text', text: JSON.stringify(result) }],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true,
          };
        }
      },
    );

    this.server.tool('list_projects', 'List all Coolify projects', {}, async () => {
      try {
        const projects = await this.client.listProjects();
        return {
          content: [{ type: 'text', text: JSON.stringify(projects) }],
          isError: false,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [{ type: 'text', text: errorMessage }],
          isError: true,
        };
      }
    });

    this.server.tool(
      'get_project',
      'Get details about a specific Coolify project',
      { uuid: z.string().describe('UUID of the project to get details for') },
      async (params: { uuid: string }) => {
        try {
          const project = await this.client.getProject(params.uuid);
          return {
            content: [{ type: 'text', text: JSON.stringify(project) }],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true,
          };
        }
      },
    );

    this.server.tool(
      'create_project',
      'Create a new Coolify project',
      {
        name: z.string().describe('Name of the project'),
        description: z.string().optional().describe('Optional description of the project'),
      },
      async (params: { name: string; description?: string }) => {
        try {
          const result = await this.client.createProject(params);
          return {
            content: [{ type: 'text', text: JSON.stringify(result) }],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true,
          };
        }
      },
    );

    this.server.tool(
      'update_project',
      'Update an existing Coolify project',
      {
        uuid: z.string().describe('UUID of the project to update'),
        name: z.string().optional().describe('New name for the project'),
        description: z.string().optional().describe('New description for the project'),
      },
      async (params: { uuid: string; name?: string; description?: string }) => {
        try {
          const { uuid, ...updateData } = params;
          const result = await this.client.updateProject(uuid, updateData);
          return {
            content: [{ type: 'text', text: JSON.stringify(result) }],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true,
          };
        }
      },
    );

    this.server.tool(
      'delete_project',
      'Delete a Coolify project',
      { uuid: z.string().describe('UUID of the project to delete') },
      async (params: { uuid: string }) => {
        try {
          const result = await this.client.deleteProject(params.uuid);
          return {
            content: [{ type: 'text', text: JSON.stringify(result) }],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true,
          };
        }
      },
    );

    this.server.tool(
      'get_project_environment',
      'Get details about a specific environment in a project',
      {
        project_uuid: z.string().describe('UUID of the project'),
        environment_name_or_uuid: z.string().describe('Name or UUID of the environment'),
      },
      async (params: { project_uuid: string; environment_name_or_uuid: string }) => {
        try {
          const environment = await this.client.getProjectEnvironment(
            params.project_uuid,
            params.environment_name_or_uuid,
          );
          return {
            content: [{ type: 'text', text: JSON.stringify(environment) }],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true,
          };
        }
      },
    );

    this.server.tool('list_databases', 'List all databases', {}, async () => {
      try {
        const databases = await this.client.listDatabases();
        return {
          content: [{ type: 'text', text: JSON.stringify(databases) }],
          isError: false,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [{ type: 'text', text: errorMessage }],
          isError: true,
        };
      }
    });

    this.server.tool(
      'get_database',
      'Get details about a specific database',
      { uuid: z.string().describe('UUID of the database to get details for') },
      async (params: { uuid: string }) => {
        try {
          const database = await this.client.getDatabase(params.uuid);
          return {
            content: [{ type: 'text', text: JSON.stringify(database) }],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true,
          };
        }
      },
    );

    this.server.tool(
      'update_database',
      'Update an existing database',
      {
        uuid: z.string().describe('UUID of the database to update'),
        name: z.string().optional().describe('New name for the database'),
        description: z.string().optional().describe('New description for the database'),
        image: z.string().optional().describe('New Docker image for the database'),
        is_public: z.boolean().optional().describe('Whether the database should be public'),
        public_port: z.number().optional().describe('Public port for the database'),
        limits_memory: z.string().optional().describe('Memory limit (e.g., "512M", "1G")'),
        limits_memory_swap: z.string().optional().describe('Memory swap limit'),
        limits_memory_swappiness: z.number().optional().describe('Memory swappiness (0-100)'),
        limits_memory_reservation: z.string().optional().describe('Memory reservation'),
        limits_cpus: z.string().optional().describe('CPU limit (e.g., "0.5", "1")'),
        limits_cpuset: z.string().optional().describe('CPU set (e.g., "0", "0,1")'),
        limits_cpu_shares: z.number().optional().describe('CPU shares (relative weight)'),
        // Database-specific configuration
        postgres_user: z.string().optional().describe('PostgreSQL user'),
        postgres_password: z.string().optional().describe('PostgreSQL password'),
        postgres_db: z.string().optional().describe('PostgreSQL database name'),
        postgres_initdb_args: z.string().optional().describe('PostgreSQL initdb arguments'),
        postgres_host_auth_method: z.string().optional().describe('PostgreSQL host auth method'),
        postgres_conf: z.string().optional().describe('PostgreSQL configuration'),
        clickhouse_admin_user: z.string().optional().describe('Clickhouse admin user'),
        clickhouse_admin_password: z.string().optional().describe('Clickhouse admin password'),
        dragonfly_password: z.string().optional().describe('Dragonfly password'),
        redis_password: z.string().optional().describe('Redis password'),
        redis_conf: z.string().optional().describe('Redis configuration'),
        keydb_password: z.string().optional().describe('KeyDB password'),
        keydb_conf: z.string().optional().describe('KeyDB configuration'),
        mariadb_conf: z.string().optional().describe('MariaDB configuration'),
        mariadb_root_password: z.string().optional().describe('MariaDB root password'),
        mariadb_user: z.string().optional().describe('MariaDB user'),
        mariadb_password: z.string().optional().describe('MariaDB password'),
        mariadb_database: z.string().optional().describe('MariaDB database name'),
        mongo_conf: z.string().optional().describe('MongoDB configuration'),
        mongo_initdb_root_username: z.string().optional().describe('MongoDB root username'),
        mongo_initdb_root_password: z.string().optional().describe('MongoDB root password'),
        mongo_initdb_database: z.string().optional().describe('MongoDB initial database'),
        mysql_root_password: z.string().optional().describe('MySQL root password'),
        mysql_password: z.string().optional().describe('MySQL password'),
        mysql_user: z.string().optional().describe('MySQL user'),
        mysql_database: z.string().optional().describe('MySQL database name'),
      },
      async (params: { uuid: string }) => {
        try {
          const { uuid, ...updateData } = params;
          const result = await this.client.updateDatabase(uuid, updateData);
          return {
            content: [{ type: 'text', text: JSON.stringify(result) }],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true,
          };
        }
      },
    );

    this.server.tool(
      'delete_database',
      'Delete a database',
      {
        uuid: z.string().describe('UUID of the database to delete'),
        deleteConfigurations: z.boolean().optional().describe('Whether to delete configurations'),
        deleteVolumes: z.boolean().optional().describe('Whether to delete volumes'),
        dockerCleanup: z.boolean().optional().describe('Whether to run docker cleanup'),
        deleteConnectedNetworks: z
          .boolean()
          .optional()
          .describe('Whether to delete connected networks'),
      },
      async (params: { uuid: string }) => {
        try {
          const { uuid, ...options } = params;
          const result = await this.client.deleteDatabase(uuid, options);
          return {
            content: [{ type: 'text', text: JSON.stringify(result) }],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true,
          };
        }
      },
    );

    this.server.tool(
      'deploy_application',
      'Deploy an application using its UUID',
      {
        uuid: z.string().describe('UUID of the application to deploy'),
      },
      async (params: { uuid: string }) => {
        try {
          const deployment = await this.client.deployApplication(params.uuid);
          return {
            content: [{ type: 'text', text: JSON.stringify(deployment) }],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true,
          };
        }
      },
    );

    this.server.tool('list_services', 'List all services', {}, async () => {
      try {
        const services = await this.client.listServices();
        return {
          content: [{ type: 'text', text: JSON.stringify(services) }],
          isError: false,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [{ type: 'text', text: errorMessage }],
          isError: true,
        };
      }
    });

    this.server.tool(
      'get_service',
      'Get details about a specific service',
      { uuid: z.string().describe('UUID of the service to get details for') },
      async (params: { uuid: string }) => {
        try {
          const service = await this.client.getService(params.uuid);
          return {
            content: [{ type: 'text', text: JSON.stringify(service) }],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true,
          };
        }
      },
    );

    this.server.tool(
      'create_service',
      'Create a new service',
      {
        type: z
          .enum([
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
          ])
          .describe('Type of service to create'),
        name: z.string().optional().describe('Name for the service'),
        description: z.string().optional().describe('Description of the service'),
        project_uuid: z.string().describe('UUID of the project to create the service in'),
        environment_name: z.string().optional().describe('Name of the environment'),
        environment_uuid: z.string().optional().describe('UUID of the environment'),
        server_uuid: z.string().describe('UUID of the server to deploy the service on'),
        destination_uuid: z.string().optional().describe('UUID of the destination'),
        instant_deploy: z
          .boolean()
          .optional()
          .describe('Whether to deploy the service immediately'),
      },
      async (params: {
        type: string;
        name?: string;
        description?: string;
        project_uuid: string;
        environment_name?: string;
        environment_uuid?: string;
        server_uuid: string;
        destination_uuid?: string;
        instant_deploy?: boolean;
      }) => {
        try {
          const result = await this.client.createService(params as CreateServiceRequest);
          return {
            content: [{ type: 'text', text: JSON.stringify(result) }],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true,
          };
        }
      },
    );

    this.server.tool(
      'delete_service',
      'Delete a service',
      {
        uuid: z.string().describe('UUID of the service to delete'),
        deleteConfigurations: z.boolean().optional().describe('Whether to delete configurations'),
        deleteVolumes: z.boolean().optional().describe('Whether to delete volumes'),
        dockerCleanup: z.boolean().optional().describe('Whether to run docker cleanup'),
        deleteConnectedNetworks: z
          .boolean()
          .optional()
          .describe('Whether to delete connected networks'),
      },
      async (params: { uuid: string }) => {
        try {
          const { uuid, ...options } = params;
          const result = await this.client.deleteService(uuid, options);
          return {
            content: [{ type: 'text', text: JSON.stringify(result) }],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true,
          };
        }
      },
    );

    // End of tool definitions
  }

  async start(transport: Transport): Promise<void> {
    await this.client.validateConnection();
    await this.server.connect(transport);
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

import {
  CoolifyConfig,
  ErrorResponse,
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
  Application,
  CreateApplicationRequest,
  CreatePrivateGithubAppApplicationRequest,
  CreatePrivateDeployKeyApplicationRequest,
  EnvironmentVariable,
  EnvironmentVariableUpdate,
  CreateDockerComposeServiceRequest,
  UpdateDockerComposeServiceRequest,
  ApplicationResources,
  LogOptions,
  LogEntry,
  CreateFullStackProjectRequest,
  FullStackProjectResponse,
  InfrastructureDeploymentConfig,
  InfrastructureDeploymentResponse,
  GithubApp,
} from '../types/coolify.js';
import { ErrorHandler, EnhancedError } from './error-handler.js';
import { RetryManager } from './retry-manager.js';
import debug from 'debug';

const log = debug('coolify:client');

export class CoolifyClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(config: CoolifyConfig) {
    if (!config.baseUrl) {
      throw new Error('Coolify base URL is required');
    }
    if (!config.accessToken) {
      throw new Error('Coolify access token is required');
    }
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.accessToken = config.accessToken;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    return RetryManager.executeWithRetry(
      async () => {
        try {
          const url = `${this.baseUrl}/api/v1${path}`;
          log(`Making request to: ${url}`);
          
          const response = await fetch(url, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.accessToken}`,
            },
            ...options,
          });

          let data: any;
          try {
            data = await response.json();
          } catch (jsonError) {
            // Handle non-JSON responses
            const text = await response.text();
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
            }
            return text as T;
          }

          if (!response.ok) {
            const error = data as ErrorResponse;
            const errorMessage = error.message || `HTTP ${response.status}: ${response.statusText}`;
            log(`API error: ${response.status} - ${errorMessage}`);
            log(`API error details:`, JSON.stringify(data, null, 2));

            // Create enhanced error with full API response details
            const enhancedError: any = new Error(errorMessage);
            enhancedError.response = {
              status: response.status,
              statusText: response.statusText,
              data: data
            };
            enhancedError.code = (data as any).code || error.error || response.status.toString();
            enhancedError.details = data;

            throw enhancedError;
          }

          log(`Request successful: ${path}`);
          return data as T;
        } catch (error) {
          log(`Request failed: ${path} - ${error}`);
          throw error;
        }
      },
      RetryManager.createRetryOptions('api')
    );
  }

  async listServers(): Promise<ServerInfo[]> {
    return this.request<ServerInfo[]>('/servers');
  }

  async getServer(uuid: string): Promise<ServerInfo> {
    return this.request<ServerInfo>(`/servers/${uuid}`);
  }

  async getServerResources(uuid: string): Promise<ServerResources> {
    return this.request<ServerResources>(`/servers/${uuid}/resources`);
  }

  async getServerDomains(uuid: string): Promise<ServerDomain[]> {
    return this.request<ServerDomain[]>(`/servers/${uuid}/domains`);
  }

  async validateServer(uuid: string): Promise<ValidationResponse> {
    return this.request<ValidationResponse>(`/servers/${uuid}/validate`);
  }

  async validateConnection(): Promise<void> {
    try {
      await this.listServers();
    } catch (error) {
      throw new Error(
        `Failed to connect to Coolify server: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async listProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects');
  }

  async getProject(uuid: string): Promise<Project> {
    return this.request<Project>(`/projects/${uuid}`);
  }

  async createProject(project: CreateProjectRequest): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async updateProject(uuid: string, project: UpdateProjectRequest): Promise<Project> {
    return this.request<Project>(`/projects/${uuid}`, {
      method: 'PATCH',
      body: JSON.stringify(project),
    });
  }

  async deleteProject(uuid: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/projects/${uuid}`, {
      method: 'DELETE',
    });
  }

  async getProjectEnvironment(
    projectUuid: string,
    environmentNameOrUuid: string,
  ): Promise<Environment> {
    return this.request<Environment>(`/projects/${projectUuid}/${environmentNameOrUuid}`);
  }

  // Application Control
  async deployApplication(uuid: string, options?: { force?: boolean; instant_deploy?: boolean }): Promise<Deployment> {
    const queryParams = new URLSearchParams();
    if (options?.force) queryParams.set('force', 'true');
    if (options?.instant_deploy) queryParams.set('instant_deploy', 'true');
    const queryString = queryParams.toString();
    const url = queryString ? `/applications/${uuid}/start?${queryString}` : `/applications/${uuid}/start`;
    
    const response = await this.request<Deployment>(url, {
      method: 'POST',
      body: '{}',
    });
    return response;
  }

  async stopApplication(uuid: string): Promise<any> {
    const response = await this.request<any>(`/applications/${uuid}/stop`, {
      method: 'POST',
      body: '{}',
    });
    return response;
  }

  async restartApplication(uuid: string): Promise<any> {
    const response = await this.request<any>(`/applications/${uuid}/restart`, {
      method: 'POST',
      body: '{}',
    });
    return response;
  }

  async startApplication(uuid: string, options?: { force?: boolean; instant_deploy?: boolean }): Promise<Deployment> {
    // Alias pour deployApplication
    return this.deployApplication(uuid, options);
  }

  async listDatabases(): Promise<Database[]> {
    return this.request<Database[]>('/databases');
  }

  async getDatabase(uuid: string): Promise<Database> {
    return this.request<Database>(`/databases/${uuid}`);
  }

  async updateDatabase(uuid: string, data: DatabaseUpdateRequest): Promise<Database> {
    return this.request<Database>(`/databases/${uuid}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDatabase(
    uuid: string,
    options?: {
      deleteConfigurations?: boolean;
      deleteVolumes?: boolean;
      dockerCleanup?: boolean;
      deleteConnectedNetworks?: boolean;
    },
  ): Promise<{ message: string }> {
    const queryParams = new URLSearchParams();
    if (options) {
      if (options.deleteConfigurations !== undefined) {
        queryParams.set('delete_configurations', options.deleteConfigurations.toString());
      }
      if (options.deleteVolumes !== undefined) {
        queryParams.set('delete_volumes', options.deleteVolumes.toString());
      }
      if (options.dockerCleanup !== undefined) {
        queryParams.set('docker_cleanup', options.dockerCleanup.toString());
      }
      if (options.deleteConnectedNetworks !== undefined) {
        queryParams.set('delete_connected_networks', options.deleteConnectedNetworks.toString());
      }
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/databases/${uuid}?${queryString}` : `/databases/${uuid}`;

    return this.request<{ message: string }>(url, {
      method: 'DELETE',
    });
  }

  // Database Control Methods
  async startDatabase(uuid: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/databases/${uuid}/start`, {
      method: 'GET',
    });
  }

  async stopDatabase(uuid: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/databases/${uuid}/stop`, {
      method: 'GET',
    });
  }

  async restartDatabase(uuid: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/databases/${uuid}/restart`, {
      method: 'GET',
    });
  }

  // Create specific database types
  async createPostgreSQLDatabase(data: any): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/databases/postgresql', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createMySQLDatabase(data: any): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/databases/mysql', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createMariaDBDatabase(data: any): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/databases/mariadb', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createMongoDBDatabase(data: any): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/databases/mongodb', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createRedisDatabase(data: any): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/databases/redis', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createDragonflyDatabase(data: any): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/databases/dragonfly', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createKeyDBDatabase(data: any): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/databases/keydb', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createClickHouseDatabase(data: any): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/databases/clickhouse', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Resources endpoint
  async listResources(): Promise<any[]> {
    return this.request<any[]>('/resources');
  }

  // Teams management
  async listTeams(): Promise<any[]> {
    return this.request<any[]>('/teams');
  }

  async getTeam(id: string): Promise<any> {
    return this.request<any>(`/teams/${id}`);
  }

  async getTeamMembers(id: string): Promise<any[]> {
    return this.request<any[]>(`/teams/${id}/members`);
  }

  async getCurrentTeam(): Promise<any> {
    return this.request<any>('/teams/current');
  }

  async getCurrentTeamMembers(): Promise<any[]> {
    return this.request<any[]>('/teams/current/members');
  }

  async listServices(): Promise<Service[]> {
    return this.request<Service[]>('/services');
  }

  async getService(uuid: string): Promise<Service> {
    return this.request<Service>(`/services/${uuid}`);
  }

  async createService(data: CreateServiceRequest): Promise<{ uuid: string; domains: string[] }> {
    return this.request<{ uuid: string; domains: string[] }>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteService(uuid: string, options?: DeleteServiceOptions): Promise<{ message: string }> {
    const queryParams = new URLSearchParams();
    if (options) {
      if (options.deleteConfigurations !== undefined) {
        queryParams.set('delete_configurations', options.deleteConfigurations.toString());
      }
      if (options.deleteVolumes !== undefined) {
        queryParams.set('delete_volumes', options.deleteVolumes.toString());
      }
      if (options.dockerCleanup !== undefined) {
        queryParams.set('docker_cleanup', options.dockerCleanup.toString());
      }
      if (options.deleteConnectedNetworks !== undefined) {
        queryParams.set('delete_connected_networks', options.deleteConnectedNetworks.toString());
      }
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/services/${uuid}?${queryString}` : `/services/${uuid}`;

    return this.request<{ message: string }>(url, {
      method: 'DELETE',
    });
  }

  // Service Control Methods
  async startService(uuid: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/services/${uuid}/start`, {
      method: 'GET',
    });
  }

  async stopService(uuid: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/services/${uuid}/stop`, {
      method: 'GET',
    });
  }

  async restartService(uuid: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/services/${uuid}/restart`, {
      method: 'GET',
    });
  }

  // Application Management Methods
  async listApplications(): Promise<Application[]> {
    return this.request<Application[]>('/applications');
  }

  async getApplication(uuid: string): Promise<Application> {
    return this.request<Application>(`/applications/${uuid}`);
  }

  async createApplication(data: CreateApplicationRequest): Promise<{ uuid: string }> {
    log('Creating public application with data:', JSON.stringify(data, null, 2));
    return this.request<{ uuid: string }>('/applications/public', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listGithubApps(): Promise<GithubApp[]> {
    // Try the GitHub Apps endpoint
    // Note: The exact endpoint may vary based on Coolify version
    // Common patterns: /security/github-apps or /github-apps
    return this.request<GithubApp[]>('/security/github-apps');
  }

  async getGithubAppById(idOrUuid: string | number): Promise<GithubApp | null> {
    const apps = await this.listGithubApps();

    // Try to find by UUID first
    let app = apps.find(a => a.uuid === idOrUuid);

    // If not found and idOrUuid is a number, try to find by ID
    if (!app && typeof idOrUuid === 'number') {
      app = apps.find(a => a.id === idOrUuid);
    }

    // If not found and idOrUuid is a string number, try to find by ID
    if (!app && typeof idOrUuid === 'string' && !isNaN(parseInt(idOrUuid))) {
      app = apps.find(a => a.id === parseInt(idOrUuid));
    }

    return app || null;
  }

  async createPrivateGithubAppApplication(data: CreatePrivateGithubAppApplicationRequest): Promise<{ uuid: string }> {
    log('Creating private GitHub app application with data:', JSON.stringify(data, null, 2));

    // Resolve github_app_uuid to source_id
    const githubApp = await this.getGithubAppById(data.github_app_uuid);
    if (!githubApp) {
      throw new Error(`GitHub App not found with UUID: ${data.github_app_uuid}`);
    }

    log(`Resolved GitHub App UUID ${data.github_app_uuid} to ID ${githubApp.id}`);

    // Transform the request to use source_id and source_type
    const requestData: any = {
      ...data,
      source_id: githubApp.id,
      source_type: 'App\\Models\\GithubApp',
    };

    // Remove github_app_uuid as it's not needed in the API request
    delete requestData.github_app_uuid;

    log('Transformed request data:', JSON.stringify(requestData, null, 2));

    return this.request<{ uuid: string }>('/applications/public', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async createPrivateDeployKeyApplication(data: CreatePrivateDeployKeyApplicationRequest): Promise<{ uuid: string }> {
    log('Creating private deploy key application with data:', JSON.stringify(data, null, 2));
    return this.request<{ uuid: string }>('/applications/private-deploy-key', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateApplication(uuid: string, data: Partial<Application>): Promise<Application> {
    return this.request<Application>(`/applications/${uuid}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteApplication(uuid: string, options?: DeleteServiceOptions): Promise<{ message: string }> {
    const queryParams = new URLSearchParams();
    if (options) {
      if (options.deleteConfigurations !== undefined) {
        queryParams.set('delete_configurations', options.deleteConfigurations.toString());
      }
      if (options.deleteVolumes !== undefined) {
        queryParams.set('delete_volumes', options.deleteVolumes.toString());
      }
      if (options.dockerCleanup !== undefined) {
        queryParams.set('docker_cleanup', options.dockerCleanup.toString());
      }
      if (options.deleteConnectedNetworks !== undefined) {
        queryParams.set('delete_connected_networks', options.deleteConnectedNetworks.toString());
      }
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/applications/${uuid}?${queryString}` : `/applications/${uuid}`;

    return this.request<{ message: string }>(url, {
      method: 'DELETE',
    });
  }

  // Environment Variable Management
  async getApplicationEnvironmentVariables(uuid: string): Promise<EnvironmentVariable[]> {
    return this.request<EnvironmentVariable[]>(`/applications/${uuid}/envs`);
  }

  async updateApplicationEnvironmentVariables(
    uuid: string, 
    variables: EnvironmentVariableUpdate[] | EnvironmentVariableUpdate
  ): Promise<{ message: string; results?: any[] }> {
    // Si c'est un array, on traite chaque variable
    if (Array.isArray(variables)) {
      const results = [];
      for (const variable of variables) {
        try {
          // D'abord essayer PATCH (pour update)
          const patchPayload: any = {
            key: variable.key,
            value: variable.value,
          };
          if (variable.is_preview !== undefined) patchPayload.is_preview = variable.is_preview;
          if (variable.is_build_time !== undefined) patchPayload.is_build_time = variable.is_build_time;
          if (variable.is_literal !== undefined) patchPayload.is_literal = variable.is_literal;

          try {
            // Essayer de mettre à jour
            const result = await this.request(`/applications/${uuid}/envs`, {
              method: 'PATCH',
              body: JSON.stringify(patchPayload),
            });
            results.push({ action: 'updated', ...(result as object) });
          } catch (patchError: any) {
            // Si PATCH échoue, essayer POST (pour créer)
            if (patchError.message && patchError.message.includes('not found')) {
              const postPayload: any = {
                key: variable.key,
                value: variable.value,
              };
              if (variable.is_preview !== undefined) postPayload.is_preview = variable.is_preview;
              if (variable.is_build_time !== undefined) postPayload.is_build_time = variable.is_build_time;
              if (variable.is_literal !== undefined) postPayload.is_literal = variable.is_literal;

              const result = await this.request(`/applications/${uuid}/envs`, {
                method: 'POST',
                body: JSON.stringify(postPayload),
              });
              results.push({ action: 'created', ...(result as object) });
            } else {
              throw patchError;
            }
          }
        } catch (error: any) {
          results.push({ error: error.message, key: variable.key });
        }
      }
      return { message: 'Batch operation completed', results };
    } else {
      // Si c'est un objet simple, essayer PATCH d'abord, puis POST si ça échoue
      const payload: any = {
        key: variables.key,
        value: variables.value,
      };
      if (variables.is_preview !== undefined) payload.is_preview = variables.is_preview;
      if (variables.is_build_time !== undefined) payload.is_build_time = variables.is_build_time;
      if (variables.is_literal !== undefined) payload.is_literal = variables.is_literal;

      try {
        // Essayer PATCH d'abord
        return await this.request<{ message: string }>(`/applications/${uuid}/envs`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } catch (patchError: any) {
        // Si PATCH échoue, essayer POST
        if (patchError.message && patchError.message.includes('not found')) {
          return await this.request<{ message: string }>(`/applications/${uuid}/envs`, {
            method: 'POST',
            body: JSON.stringify(payload),
          });
        }
        throw patchError;
      }
    }
  }

  // Docker Compose Service Management
  async createDockerComposeService(data: CreateDockerComposeServiceRequest): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>('/services/docker-compose', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDockerComposeService(
    uuid: string, 
    data: UpdateDockerComposeServiceRequest
  ): Promise<Service> {
    return this.request<Service>(`/services/${uuid}/docker-compose`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Deployment Management
  async listAllDeployments(skip?: number, take?: number): Promise<Deployment[]> {
    const queryParams = new URLSearchParams();
    if (skip !== undefined) queryParams.set('skip', skip.toString());
    if (take !== undefined) queryParams.set('take', take.toString());
    const queryString = queryParams.toString();
    const url = queryString ? `/deployments?${queryString}` : '/deployments';
    return this.request<Deployment[]>(url);
  }

  async getDeployments(applicationUuid: string, skip?: number, take?: number): Promise<Deployment[]> {
    const queryParams = new URLSearchParams();
    if (skip !== undefined) queryParams.set('skip', skip.toString());
    if (take !== undefined) queryParams.set('take', take.toString());
    const queryString = queryParams.toString();
    const url = queryString ? `/deployments/applications/${applicationUuid}?${queryString}` : `/deployments/applications/${applicationUuid}`;
    const response = await this.request<{ count: number; deployments: Deployment[] }>(url);
    return response.deployments || [];
  }

  async getDeployment(uuid: string): Promise<Deployment> {
    return this.request<Deployment>(`/deployments/${uuid}`);
  }

  async deployByTagOrUuid(tagOrUuid: string): Promise<{ message: string; deployment_uuid?: string }> {
    return this.request<{ message: string; deployment_uuid?: string }>(`/deploy/${tagOrUuid}`, {
      method: 'GET',
    });
  }

  async cancelDeployment(uuid: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/deployments/${uuid}/cancel`, {
      method: 'POST',
    });
  }

  // Resource Management
  async getApplicationResources(uuid: string): Promise<ApplicationResources> {
    return this.request<ApplicationResources>(`/applications/${uuid}/resources`);
  }

  async getApplicationLogs(uuid: string, options?: LogOptions): Promise<LogEntry[]> {
    const queryParams = new URLSearchParams();
    if (options?.since) queryParams.set('since', options.since);
    if (options?.until) queryParams.set('until', options.until);
    if (options?.lines) queryParams.set('lines', options.lines.toString());
    
    const queryString = queryParams.toString();
    const url = queryString ? `/applications/${uuid}/logs?${queryString}` : `/applications/${uuid}/logs`;
    
    return this.request<LogEntry[]>(url);
  }

  // Full-Stack Project Methods
  async createFullStackProject(data: CreateFullStackProjectRequest): Promise<FullStackProjectResponse> {
    // Create project first
    const project = await this.createProject({
      name: data.name,
      description: data.description || 'Full-Stack Application Deployment'
    });

    return {
      project_uuid: project.uuid,
      name: data.name,
      description: data.description,
      services: [],
      status: 'created'
    };
  }

  async deployInfrastructureStack(
    projectUuid: string, 
    serverUuid: string, 
    config: InfrastructureDeploymentConfig
  ): Promise<InfrastructureDeploymentResponse> {
    const services: string[] = [];

    try {
      // Deploy PostgreSQL
      if (config.includePostgres) {
        const postgres = await this.createService({
          type: 'postgresql',
          project_uuid: projectUuid,
          server_uuid: serverUuid,
          name: 'app-postgres',
          description: 'PostgreSQL Database'
        });
        services.push(postgres.uuid);
      }

      // Deploy Redis
      if (config.includeRedis) {
        const redis = await this.createService({
          type: 'redis',
          project_uuid: projectUuid,
          server_uuid: serverUuid,
          name: 'app-redis',
          description: 'Redis Cache'
        });
        services.push(redis.uuid);
      }

      // Deploy MinIO
      if (config.includeMinIO) {
        const minio = await this.createService({
          type: 'minio',
          project_uuid: projectUuid,
          server_uuid: serverUuid,
          name: 'app-minio',
          description: 'Object Storage'
        });
        services.push(minio.uuid);
      }

      return {
        project_uuid: projectUuid,
        services,
        status: 'deployed',
        message: 'Infrastructure stack deployed successfully'
      };
    } catch (error) {
      return {
        project_uuid: projectUuid,
        services,
        status: 'failed',
        message: `Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

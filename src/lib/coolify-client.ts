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
} from '../types/coolify.js';

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
    try {
      const url = `${this.baseUrl}/api/v1${path}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        const error = data as ErrorResponse;
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data as T;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          `Failed to connect to Coolify server at ${this.baseUrl}. Please check if the server is running and the URL is correct.`,
        );
      }
      throw error;
    }
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

  async deployApplication(uuid: string): Promise<Deployment> {
    const response = await this.request<Deployment>(`/applications/${uuid}/deploy`, {
      method: 'POST',
    });
    return response;
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

  // Add more methods as needed for other endpoints
}

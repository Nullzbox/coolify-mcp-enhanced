import { CoolifyConfig, ErrorResponse, ServerInfo, ServerStatus } from '../types/coolify.js';

export class CoolifyClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(config: CoolifyConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.accessToken = config.accessToken;
  }

  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}/api/v1${path}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error((data as ErrorResponse).message);
    }

    return data as T;
  }

  async getServerInfo(): Promise<ServerInfo> {
    const response = await this.request('/server');
    return response as ServerInfo;
  }

  async getServerStatus(): Promise<ServerStatus> {
    const response = await this.request('/server/status');
    return response as ServerStatus;
  }

  // Add more methods as needed for other endpoints
}

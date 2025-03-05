export interface CoolifyConfig {
  baseUrl: string;
  accessToken: string;
}

export interface ServerInfo {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  version: string;
  resources: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

export interface ServerStatus {
  health: {
    status: 'healthy' | 'unhealthy';
    lastCheck: string;
  };
  resources: {
    cpu: {
      usage: number;
      cores: number;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    disk: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

export interface ErrorResponse {
  error: string;
  status: number;
  message: string;
}

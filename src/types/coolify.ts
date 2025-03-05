export interface CoolifyConfig {
  baseUrl: string;
  accessToken: string;
}

export interface ServerInfo {
  uuid: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  version: string;
  resources: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

export interface ResourceStatus {
  id: number;
  uuid: string;
  name: string;
  type: string;
  created_at: string;
  updated_at: string;
  status: string;
}

export type ServerResources = ResourceStatus[];

export interface ErrorResponse {
  error: string;
  status: number;
  message: string;
}

export interface ServerDomain {
  ip: string;
  domains: string[];
}

export interface ValidationResponse {
  message: string;
}

export interface Environment {
  id: number;
  uuid: string;
  name: string;
  project_uuid: string;
  variables?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  environments?: Environment[];
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

export interface Application {
  id: number;
  uuid: string;
  name: string;
  environment_uuid: string;
  project_uuid: string;
  git_repository: string;
  git_branch: string;
  build_pack: 'nixpacks' | 'static' | 'dockerfile' | 'dockercompose';
  ports_exposes: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateApplicationRequest {
  project_uuid: string;
  environment_uuid: string;
  git_repository: string;
  git_branch: string;
  build_pack: 'nixpacks' | 'static' | 'dockerfile' | 'dockercompose';
  ports_exposes: string;
  name?: string;
}

export interface Deployment {
  id: number;
  uuid: string;
  application_uuid: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
}

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

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
}

export interface Deployment {
  id: number;
  uuid: string;
  application_uuid: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseBase {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  type:
    | 'postgresql'
    | 'mysql'
    | 'mariadb'
    | 'mongodb'
    | 'redis'
    | 'keydb'
    | 'clickhouse'
    | 'dragonfly';
  status: 'running' | 'stopped' | 'error';
  created_at: string;
  updated_at: string;
  is_public: boolean;
  public_port?: number;
  image: string;
  limits?: {
    memory?: string;
    memory_swap?: string;
    memory_swappiness?: number;
    memory_reservation?: string;
    cpus?: string;
    cpuset?: string;
    cpu_shares?: number;
  };
}

export interface PostgresDatabase extends DatabaseBase {
  type: 'postgresql';
  postgres_user: string;
  postgres_password: string;
  postgres_db: string;
  postgres_initdb_args?: string;
  postgres_host_auth_method?: string;
  postgres_conf?: string;
}

export interface MySQLDatabase extends DatabaseBase {
  type: 'mysql';
  mysql_root_password: string;
  mysql_user?: string;
  mysql_password?: string;
  mysql_database?: string;
}

export interface MariaDBDatabase extends DatabaseBase {
  type: 'mariadb';
  mariadb_root_password: string;
  mariadb_user?: string;
  mariadb_password?: string;
  mariadb_database?: string;
  mariadb_conf?: string;
}

export interface MongoDBDatabase extends DatabaseBase {
  type: 'mongodb';
  mongo_initdb_root_username: string;
  mongo_initdb_root_password: string;
  mongo_initdb_database?: string;
  mongo_conf?: string;
}

export interface RedisDatabase extends DatabaseBase {
  type: 'redis';
  redis_password?: string;
  redis_conf?: string;
}

export interface KeyDBDatabase extends DatabaseBase {
  type: 'keydb';
  keydb_password?: string;
  keydb_conf?: string;
}

export interface ClickhouseDatabase extends DatabaseBase {
  type: 'clickhouse';
  clickhouse_admin_user: string;
  clickhouse_admin_password: string;
}

export interface DragonflyDatabase extends DatabaseBase {
  type: 'dragonfly';
  dragonfly_password: string;
}

export type Database =
  | PostgresDatabase
  | MySQLDatabase
  | MariaDBDatabase
  | MongoDBDatabase
  | RedisDatabase
  | KeyDBDatabase
  | ClickhouseDatabase
  | DragonflyDatabase;

export interface DatabaseUpdateRequest {
  name?: string;
  description?: string;
  image?: string;
  is_public?: boolean;
  public_port?: number;
  limits_memory?: string;
  limits_memory_swap?: string;
  limits_memory_swappiness?: number;
  limits_memory_reservation?: string;
  limits_cpus?: string;
  limits_cpuset?: string;
  limits_cpu_shares?: number;
  postgres_user?: string;
  postgres_password?: string;
  postgres_db?: string;
  postgres_initdb_args?: string;
  postgres_host_auth_method?: string;
  postgres_conf?: string;
  clickhouse_admin_user?: string;
  clickhouse_admin_password?: string;
  dragonfly_password?: string;
  redis_password?: string;
  redis_conf?: string;
  keydb_password?: string;
  keydb_conf?: string;
  mariadb_conf?: string;
  mariadb_root_password?: string;
  mariadb_user?: string;
  mariadb_password?: string;
  mariadb_database?: string;
  mongo_conf?: string;
  mongo_initdb_root_username?: string;
  mongo_initdb_root_password?: string;
  mongo_initdb_database?: string;
  mysql_root_password?: string;
  mysql_password?: string;
  mysql_user?: string;
  mysql_database?: string;
}

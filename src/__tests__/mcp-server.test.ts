import { CoolifyMcpServer } from '../lib/mcp-server.js';
import { jest } from '@jest/globals';
import {
  ServerResources,
  ValidationResponse,
  Project,
  Environment,
  Deployment,
} from '../types/coolify.js';

describe('CoolifyMcpServer', () => {
  const mockConfig = {
    baseUrl: 'https://coolify.test',
    accessToken: 'test-token',
  };

  let server: CoolifyMcpServer;

  beforeEach(() => {
    server = new CoolifyMcpServer(mockConfig);
    // Mock validateConnection to prevent actual HTTP calls
    jest.spyOn(server['client'], 'validateConnection').mockResolvedValue();
  });

  describe('get_server_resources', () => {
    it('should call client getServerResources', async () => {
      // Mock the method before calling it
      const mockResources: ServerResources = [
        {
          id: 1,
          uuid: 'test-resource-uuid',
          name: 'test-resource',
          type: 'application',
          created_at: '2024-03-20T00:00:00Z',
          updated_at: '2024-03-20T00:00:00Z',
          status: 'running',
        },
      ];

      const spy = jest
        .spyOn(server['client'], 'getServerResources')
        .mockResolvedValue(mockResources);

      await server.get_server_resources('test-uuid');
      expect(spy).toHaveBeenCalledWith('test-uuid');
    });
  });

  describe('validate_server', () => {
    it('should call client validateServer', async () => {
      // Mock the method before calling it
      const mockValidation: ValidationResponse = {
        message: 'Server is valid',
      };

      const spy = jest.spyOn(server['client'], 'validateServer').mockResolvedValue(mockValidation);

      await server.validate_server('test-uuid');
      expect(spy).toHaveBeenCalledWith('test-uuid');
    });
  });

  describe('list_projects', () => {
    it('should call client listProjects', async () => {
      const mockProjects: Project[] = [
        {
          id: 1,
          uuid: 'test-project-uuid',
          name: 'test-project',
          description: 'Test project description',
          environments: [],
        },
      ];

      const spy = jest.spyOn(server['client'], 'listProjects').mockResolvedValue(mockProjects);

      await server.list_projects();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('get_project', () => {
    it('should call client getProject', async () => {
      const mockProject: Project = {
        id: 1,
        uuid: 'test-project-uuid',
        name: 'test-project',
        description: 'Test project description',
        environments: [],
      };

      const spy = jest.spyOn(server['client'], 'getProject').mockResolvedValue(mockProject);

      await server.get_project('test-project-uuid');
      expect(spy).toHaveBeenCalledWith('test-project-uuid');
    });
  });

  describe('create_project', () => {
    it('should call client createProject', async () => {
      const mockResponse = { uuid: 'new-project-uuid' };
      const createRequest = {
        name: 'New Project',
        description: 'New project description',
      };

      const spy = jest.spyOn(server['client'], 'createProject').mockResolvedValue(mockResponse);

      await server.create_project(createRequest);
      expect(spy).toHaveBeenCalledWith(createRequest);
    });
  });

  describe('update_project', () => {
    it('should call client updateProject', async () => {
      const mockProject: Project = {
        id: 1,
        uuid: 'test-project-uuid',
        name: 'Updated Project',
        description: 'Updated description',
        environments: [],
      };

      const updateRequest = {
        name: 'Updated Project',
        description: 'Updated description',
      };

      const spy = jest.spyOn(server['client'], 'updateProject').mockResolvedValue(mockProject);

      await server.update_project('test-project-uuid', updateRequest);
      expect(spy).toHaveBeenCalledWith('test-project-uuid', updateRequest);
    });
  });

  describe('delete_project', () => {
    it('should call client deleteProject', async () => {
      const mockResponse = { message: 'Project deleted successfully' };

      const spy = jest.spyOn(server['client'], 'deleteProject').mockResolvedValue(mockResponse);

      await server.delete_project('test-project-uuid');
      expect(spy).toHaveBeenCalledWith('test-project-uuid');
    });
  });

  describe('get_project_environment', () => {
    it('should call client getProjectEnvironment', async () => {
      const mockEnvironment: Environment = {
        id: 1,
        uuid: 'test-env-uuid',
        name: 'test-env',
        project_uuid: 'test-project-uuid',
        variables: { KEY: 'value' },
        created_at: '2024-03-06T12:00:00Z',
        updated_at: '2024-03-06T12:00:00Z',
      };

      const spy = jest
        .spyOn(server['client'], 'getProjectEnvironment')
        .mockResolvedValue(mockEnvironment);

      await server.get_project_environment('test-project-uuid', 'test-env-uuid');
      expect(spy).toHaveBeenCalledWith('test-project-uuid', 'test-env-uuid');
    });
  });

  describe('deploy_application', () => {
    it('should deploy an application', async () => {
      const mockDeployment: Deployment = {
        id: 1,
        uuid: 'test-deployment-uuid',
        application_uuid: 'test-app-uuid',
        status: 'running',
        created_at: '2024-03-20T12:00:00Z',
        updated_at: '2024-03-20T12:00:00Z',
      };

      jest.spyOn(server['client'], 'deployApplication').mockResolvedValue(mockDeployment);

      const result = await server.deploy_application({ uuid: 'test-app-uuid' });
      expect(result).toEqual(mockDeployment);
      expect(server['client'].deployApplication).toHaveBeenCalledWith('test-app-uuid');
    });

    it('should handle errors when deploying an application', async () => {
      const error = new Error('Failed to deploy application');

      jest.spyOn(server['client'], 'deployApplication').mockRejectedValue(error);

      await expect(server.deploy_application({ uuid: 'test-app-uuid' })).rejects.toThrow(
        'Failed to deploy application',
      );
    });
  });

  describe('Database Management', () => {
    const mockDatabase = {
      id: 1,
      uuid: 'test-db-uuid',
      name: 'test-db',
      description: 'Test database',
      type: 'postgresql' as const,
      status: 'running' as const,
      created_at: '2024-03-06T12:00:00Z',
      updated_at: '2024-03-06T12:00:00Z',
      is_public: false,
      image: 'postgres:latest',
      postgres_user: 'postgres',
      postgres_password: 'test123',
      postgres_db: 'testdb',
    };

    it('should list databases', async () => {
      const spy = jest.spyOn(server['client'], 'listDatabases').mockResolvedValue([mockDatabase]);

      const result = await server.list_databases();

      expect(result).toEqual([mockDatabase]);
      expect(spy).toHaveBeenCalled();
    });

    it('should get database details', async () => {
      const spy = jest.spyOn(server['client'], 'getDatabase').mockResolvedValue(mockDatabase);

      const result = await server.get_database('test-db-uuid');

      expect(result).toEqual(mockDatabase);
      expect(spy).toHaveBeenCalledWith('test-db-uuid');
    });

    it('should update database', async () => {
      const updateData = {
        name: 'updated-db',
        description: 'Updated description',
      };
      const spy = jest
        .spyOn(server['client'], 'updateDatabase')
        .mockResolvedValue({ ...mockDatabase, ...updateData, type: 'postgresql' as const });

      const result = await server.update_database('test-db-uuid', updateData);

      expect(result).toEqual({
        ...mockDatabase,
        ...updateData,
        type: 'postgresql',
      });
      expect(spy).toHaveBeenCalledWith('test-db-uuid', updateData);
    });

    it('should delete database', async () => {
      const mockResponse = { message: 'Database deleted' };
      const spy = jest.spyOn(server['client'], 'deleteDatabase').mockResolvedValue(mockResponse);

      const result = await server.delete_database('test-db-uuid', {
        deleteConfigurations: true,
        deleteVolumes: true,
      });

      expect(result).toEqual(mockResponse);
      expect(spy).toHaveBeenCalledWith('test-db-uuid', {
        deleteConfigurations: true,
        deleteVolumes: true,
      });
    });

    it('should handle database errors', async () => {
      const errorMessage = 'Database not found';
      jest.spyOn(server['client'], 'getDatabase').mockRejectedValue(new Error(errorMessage));

      await expect(server.get_database('invalid-uuid')).rejects.toThrow(errorMessage);
    });
  });
});

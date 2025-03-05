import { CoolifyMcpServer } from '../lib/mcp-server.js';
import { jest } from '@jest/globals';
import type {
  ServerResources,
  ValidationResponse,
  Project,
  Environment,
  CreateEnvironmentRequest,
  UpdateEnvironmentVariablesRequest,
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
        name: 'test-environment',
        project_uuid: 'test-project-uuid',
        created_at: '2024-03-19T12:00:00Z',
        updated_at: '2024-03-19T12:00:00Z',
      };

      const spy = jest
        .spyOn(server['client'], 'getProjectEnvironment')
        .mockResolvedValue(mockEnvironment);

      await server.get_project_environment('test-project-uuid', 'test-env-uuid');
      expect(spy).toHaveBeenCalledWith('test-project-uuid', 'test-env-uuid');
    });
  });

  describe('Environment Management', () => {
    const mockEnvironment: Environment = {
      id: 1,
      uuid: 'test-env-uuid',
      name: 'test-environment',
      project_uuid: 'test-project-uuid',
      variables: { KEY: 'value' },
      created_at: '2024-03-19T12:00:00Z',
      updated_at: '2024-03-19T12:00:00Z',
    };

    describe('list_environments', () => {
      it('should call client listEnvironments without project UUID', async () => {
        const spy = jest
          .spyOn(server['client'], 'listEnvironments')
          .mockResolvedValue([mockEnvironment]);

        await server.list_environments({});
        expect(spy).toHaveBeenCalledWith(undefined);
      });

      it('should call client listEnvironments with project UUID', async () => {
        const spy = jest
          .spyOn(server['client'], 'listEnvironments')
          .mockResolvedValue([mockEnvironment]);

        await server.list_environments({ project_uuid: 'test-project-uuid' });
        expect(spy).toHaveBeenCalledWith('test-project-uuid');
      });
    });

    describe('get_environment', () => {
      it('should call client getEnvironment', async () => {
        const spy = jest
          .spyOn(server['client'], 'getEnvironment')
          .mockResolvedValue(mockEnvironment);

        await server.get_environment({ uuid: 'test-env-uuid' });
        expect(spy).toHaveBeenCalledWith('test-env-uuid');
      });
    });

    describe('create_environment', () => {
      it('should call client createEnvironment', async () => {
        const createRequest: CreateEnvironmentRequest = {
          name: 'test-environment',
          project_uuid: 'test-project-uuid',
          variables: { KEY: 'value' },
        };

        const mockResponse = { uuid: 'test-env-uuid' };

        const spy = jest
          .spyOn(server['client'], 'createEnvironment')
          .mockResolvedValue(mockResponse);

        await server.create_environment(createRequest);
        expect(spy).toHaveBeenCalledWith(createRequest);
      });
    });

    describe('update_environment_variables', () => {
      it('should call client updateEnvironmentVariables', async () => {
        const updateRequest: UpdateEnvironmentVariablesRequest = {
          variables: { NEW_KEY: 'new-value' },
        };

        const spy = jest
          .spyOn(server['client'], 'updateEnvironmentVariables')
          .mockResolvedValue({ ...mockEnvironment, variables: updateRequest.variables });

        await server.update_environment_variables({
          uuid: 'test-env-uuid',
          variables: updateRequest.variables,
        });
        expect(spy).toHaveBeenCalledWith('test-env-uuid', updateRequest);
      });
    });

    describe('delete_environment', () => {
      it('should call client deleteEnvironment', async () => {
        const mockResponse = { message: 'Environment deleted successfully' };

        const spy = jest
          .spyOn(server['client'], 'deleteEnvironment')
          .mockResolvedValue(mockResponse);

        await server.delete_environment({ uuid: 'test-env-uuid' });
        expect(spy).toHaveBeenCalledWith('test-env-uuid');
      });
    });
  });
});

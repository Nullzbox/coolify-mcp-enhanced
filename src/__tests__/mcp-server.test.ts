import { CoolifyMcpServer } from '../lib/mcp-server.js';
import { jest } from '@jest/globals';
import {
  ServerResources,
  ValidationResponse,
  Project,
  Environment,
  Application,
  CreateApplicationRequest,
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

  describe('Environment Management', () => {
    const mockEnvironment: Environment = {
      id: 1,
      uuid: 'test-env-uuid',
      name: 'test-environment',
      project_uuid: 'test-project-uuid',
      created_at: '2024-03-19T12:00:00Z',
      updated_at: '2024-03-19T12:00:00Z',
    };

    describe('get_project_environment', () => {
      it('should call client getProjectEnvironment', async () => {
        const spy = jest
          .spyOn(server['client'], 'getProjectEnvironment')
          .mockResolvedValue(mockEnvironment);

        await server.get_project_environment('test-project-uuid', 'test-env-uuid');
        expect(spy).toHaveBeenCalledWith('test-project-uuid', 'test-env-uuid');
      });
    });
  });

  describe('Application Management', () => {
    const mockApplication: Application = {
      id: 1,
      uuid: 'test-app-uuid',
      name: 'test-app',
      environment_uuid: 'test-env-uuid',
      project_uuid: 'test-project-uuid',
      git_repository: 'https://github.com/test/repo',
      git_branch: 'main',
      build_pack: 'nixpacks',
      ports_exposes: '3000',
      status: 'running',
      created_at: '2024-03-05T12:00:00Z',
      updated_at: '2024-03-05T12:00:00Z',
    };

    const mockDeployment: Deployment = {
      id: 1,
      uuid: 'test-deployment-uuid',
      application_uuid: 'test-app-uuid',
      status: 'in_progress',
      created_at: '2024-03-05T12:00:00Z',
      updated_at: '2024-03-05T12:00:00Z',
    };

    describe('list_applications', () => {
      it('should call client listApplications', async () => {
        const spy = jest
          .spyOn(server['client'], 'listApplications')
          .mockResolvedValue([mockApplication]);

        const result = await server.list_applications();

        expect(result).toEqual([mockApplication]);
        expect(spy).toHaveBeenCalledWith(undefined);
      });

      it('should call client listApplications with environment UUID', async () => {
        const spy = jest
          .spyOn(server['client'], 'listApplications')
          .mockResolvedValue([mockApplication]);

        const result = await server.list_applications('test-env-uuid');

        expect(result).toEqual([mockApplication]);
        expect(spy).toHaveBeenCalledWith('test-env-uuid');
      });
    });

    describe('get_application', () => {
      it('should call client getApplication', async () => {
        const spy = jest
          .spyOn(server['client'], 'getApplication')
          .mockResolvedValue(mockApplication);

        const result = await server.get_application('test-app-uuid');

        expect(result).toEqual(mockApplication);
        expect(spy).toHaveBeenCalledWith('test-app-uuid');
      });
    });

    describe('create_application', () => {
      it('should call client createApplication', async () => {
        const spy = jest
          .spyOn(server['client'], 'createApplication')
          .mockResolvedValue(mockApplication);

        const createRequest: CreateApplicationRequest = {
          project_uuid: 'test-project-uuid',
          environment_uuid: 'test-env-uuid',
          git_repository: 'https://github.com/test/repo',
          git_branch: 'main',
          build_pack: 'nixpacks',
          ports_exposes: '3000',
          name: 'test-app',
        };

        const result = await server.create_application(createRequest);

        expect(result).toEqual(mockApplication);
        expect(spy).toHaveBeenCalledWith(createRequest);
      });
    });

    describe('delete_application', () => {
      it('should call client deleteApplication', async () => {
        const spy = jest.spyOn(server['client'], 'deleteApplication').mockResolvedValue(undefined);

        const result = await server.delete_application('test-app-uuid');

        expect(result).toEqual({ message: 'Application deleted successfully' });
        expect(spy).toHaveBeenCalledWith('test-app-uuid');
      });
    });

    describe('deploy_application', () => {
      it('should call client deployApplication', async () => {
        const spy = jest
          .spyOn(server['client'], 'deployApplication')
          .mockResolvedValue(mockDeployment);
        const result = await server.deploy_application({ uuid: 'test-app-uuid' });
        expect(spy).toHaveBeenCalledWith('test-app-uuid');
        expect(result).toEqual(mockDeployment);
      });
    });
  });
});

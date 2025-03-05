import { CoolifyClient } from '../lib/coolify-client.js';
import type {
  ServerInfo,
  ServerResources,
  Environment,
  CreateEnvironmentRequest,
  UpdateEnvironmentVariablesRequest,
} from '../types/coolify.js';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('CoolifyClient', () => {
  let client: CoolifyClient;

  beforeEach(() => {
    client = new CoolifyClient({
      baseUrl: 'http://test.coolify.io',
      accessToken: 'test-token',
    });
    mockFetch.mockClear();
    // Reset any global mock implementations
    mockFetch.mockReset();
  });

  describe('listServers', () => {
    const mockServers: ServerInfo[] = [
      {
        uuid: 'test-id-1',
        name: 'test-server-1',
        status: 'running',
        version: '1.0.0',
        resources: {
          cpu: 50,
          memory: 60,
          disk: 70,
        },
      },
      {
        uuid: 'test-id-2',
        name: 'test-server-2',
        status: 'stopped',
        version: '1.0.0',
        resources: {
          cpu: 0,
          memory: 0,
          disk: 70,
        },
      },
    ];

    it('should fetch server list successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockServers,
      });

      const result = await client.listServers();

      expect(result).toEqual(mockServers);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test.coolify.io/api/v1/servers',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('should handle error responses', async () => {
      const errorResponse = {
        error: 'Unauthorized',
        status: 401,
        message: 'Invalid token',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => errorResponse,
      });

      await expect(client.listServers()).rejects.toThrow('Invalid token');
    });
  });

  describe('getServer', () => {
    const mockServerInfo: ServerInfo = {
      uuid: 'test-id',
      name: 'test-server',
      status: 'running',
      version: '1.0.0',
      resources: {
        cpu: 50,
        memory: 60,
        disk: 70,
      },
    };

    it('should fetch server info successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockServerInfo,
      });

      const result = await client.getServer('test-id');

      expect(result).toEqual(mockServerInfo);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test.coolify.io/api/v1/servers/test-id',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('should handle error responses', async () => {
      const errorResponse = {
        error: 'Not Found',
        status: 404,
        message: 'Server not found',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => errorResponse,
      });

      await expect(client.getServer('invalid-id')).rejects.toThrow('Server not found');
    });
  });

  describe('getServerResources', () => {
    const mockServerResources: ServerResources = [
      {
        id: 1,
        uuid: 'test-id',
        name: 'test-app',
        type: 'application',
        created_at: '2024-03-19T12:00:00Z',
        updated_at: '2024-03-19T12:00:00Z',
        status: 'running:healthy',
      },
    ];

    it('should fetch server resources successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockServerResources,
      });

      const result = await client.getServerResources('test-id');

      expect(result).toEqual(mockServerResources);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test.coolify.io/api/v1/servers/test-id/resources',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('should handle error responses', async () => {
      const errorResponse = {
        error: 'Server Error',
        status: 500,
        message: 'Internal server error',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => errorResponse,
      });

      await expect(client.getServerResources('test-id')).rejects.toThrow('Internal server error');
    });
  });

  test('getServer returns server info', async () => {
    const mockResponse = {
      uuid: 'test-uuid',
      name: 'test-server',
      status: 'running',
      version: '1.0.0',
      resources: {
        cpu: 50,
        memory: 60,
        disk: 70,
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const server = await client.getServer('test-uuid');
    expect(server).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://test.coolify.io/api/v1/servers/test-uuid',
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
      }),
    );
  });

  test('getServerResources returns server resources', async () => {
    const mockResponse = [
      {
        id: 1,
        uuid: 'test-uuid',
        name: 'test-app',
        type: 'application',
        created_at: '2025-03-05T13:41:12.000Z',
        updated_at: '2025-03-05T13:41:12.000Z',
        status: 'running:healthy',
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const resources = await client.getServerResources('test-uuid');
    expect(resources).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://test.coolify.io/api/v1/servers/test-uuid/resources',
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
      }),
    );
  });

  describe('Environment Management', () => {
    const mockEnvironment: Environment = {
      id: 1,
      uuid: 'env-test-id',
      name: 'test-env',
      project_uuid: 'project-test-id',
      variables: { KEY: 'value' },
      created_at: '2024-03-19T12:00:00Z',
      updated_at: '2024-03-19T12:00:00Z',
    };

    beforeEach(() => {
      mockFetch.mockClear();
    });

    describe('listEnvironments', () => {
      it('should fetch all environments successfully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([mockEnvironment]),
        });

        const result = await client.listEnvironments();

        expect(result).toEqual([mockEnvironment]);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://test.coolify.io/api/v1/environments',
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
              'Content-Type': 'application/json',
            }),
          }),
        );
      });

      it('should fetch environments by project UUID', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([mockEnvironment]),
        });

        const result = await client.listEnvironments('project-test-id');

        expect(result).toEqual([mockEnvironment]);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://test.coolify.io/api/v1/environments?project_uuid=project-test-id',
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
              'Content-Type': 'application/json',
            }),
          }),
        );
      });
    });

    describe('getEnvironment', () => {
      it('should fetch environment by UUID successfully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockEnvironment),
        });

        const result = await client.getEnvironment('env-test-id');

        expect(result).toEqual(mockEnvironment);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://test.coolify.io/api/v1/environments/env-test-id',
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
              'Content-Type': 'application/json',
            }),
          }),
        );
      });
    });

    describe('createEnvironment', () => {
      it('should create environment successfully', async () => {
        const createRequest: CreateEnvironmentRequest = {
          name: 'test-env',
          project_uuid: 'project-test-id',
          variables: { KEY: 'value' },
        };

        const mockResponse = { uuid: 'env-test-id' };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await client.createEnvironment(createRequest);

        expect(result).toEqual(mockResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://test.coolify.io/api/v1/environments',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(createRequest),
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
              'Content-Type': 'application/json',
            }),
          }),
        );
      });
    });

    describe('updateEnvironmentVariables', () => {
      it('should update environment variables successfully', async () => {
        const updateRequest: UpdateEnvironmentVariablesRequest = {
          variables: { NEW_KEY: 'new-value' },
        };

        const mockUpdatedEnvironment = {
          ...mockEnvironment,
          variables: updateRequest.variables,
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUpdatedEnvironment),
        });

        const result = await client.updateEnvironmentVariables('env-test-id', updateRequest);

        expect(result).toEqual(mockUpdatedEnvironment);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://test.coolify.io/api/v1/environments/env-test-id/variables',
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(updateRequest),
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
              'Content-Type': 'application/json',
            }),
          }),
        );
      });
    });

    describe('deleteEnvironment', () => {
      it('should delete environment successfully', async () => {
        const mockResponse = { message: 'Environment deleted successfully' };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await client.deleteEnvironment('env-test-id');

        expect(result).toEqual(mockResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://test.coolify.io/api/v1/environments/env-test-id',
          expect.objectContaining({
            method: 'DELETE',
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
              'Content-Type': 'application/json',
            }),
          }),
        );
      });
    });
  });
});

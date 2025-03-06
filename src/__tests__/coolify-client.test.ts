import { CoolifyClient } from '../lib/coolify-client.js';
import type { ServerInfo, ServerResources, Environment, Deployment } from '../types/coolify.js';

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
      uuid: 'jw0gwo4sowkoowswssk0gkc4',
      name: 'production',
      project_uuid: 'ikokwc8sk00wk8sg8gkwoscw',
      created_at: '2025-02-11T11:37:33.000000Z',
      updated_at: '2025-02-11T11:37:33.000000Z',
    };

    beforeEach(() => {
      mockFetch.mockClear();
    });

    describe('getProjectEnvironment', () => {
      it('should fetch environment by project UUID and name/UUID successfully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockEnvironment),
        });

        const result = await client.getProjectEnvironment('ikokwc8sk00wk8sg8gkwoscw', 'production');

        expect(result).toEqual(mockEnvironment);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://test.coolify.io/api/v1/projects/ikokwc8sk00wk8sg8gkwoscw/production',
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
              'Content-Type': 'application/json',
            }),
          }),
        );
      });

      it('should handle not found error', async () => {
        const errorResponse = {
          error: 'Not Found',
          status: 404,
          message: 'Environment not found',
        };

        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve(errorResponse),
        });

        await expect(
          client.getProjectEnvironment('invalid-project', 'invalid-env'),
        ).rejects.toThrow('Environment not found');
      });
    });
  });

  describe('deployApplication', () => {
    it('should deploy an application', async () => {
      const mockDeployment: Deployment = {
        id: 1,
        uuid: 'test-deployment-uuid',
        application_uuid: 'test-app-uuid',
        status: 'running',
        created_at: '2024-03-20T12:00:00Z',
        updated_at: '2024-03-20T12:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDeployment),
      });

      const result = await client.deployApplication('test-app-uuid');
      expect(result).toEqual(mockDeployment);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test.coolify.io/api/v1/applications/test-app-uuid/deploy',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('should handle errors when deploying an application', async () => {
      const errorResponse = {
        error: 'Error',
        status: 500,
        message: 'Failed to deploy application',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve(errorResponse),
      });

      await expect(client.deployApplication('test-app-uuid')).rejects.toThrow(
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

    beforeEach(() => {
      mockFetch.mockClear();
    });

    it('should list databases', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockDatabase]),
      });

      const result = await client.listDatabases();

      expect(result).toEqual([mockDatabase]);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test.coolify.io/api/v1/databases',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          },
        }),
      );
    });

    it('should get database details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDatabase),
      });

      const result = await client.getDatabase('test-db-uuid');

      expect(result).toEqual(mockDatabase);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test.coolify.io/api/v1/databases/test-db-uuid',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          },
        }),
      );
    });

    it('should update database', async () => {
      const updateData = {
        name: 'updated-db',
        description: 'Updated description',
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockDatabase, ...updateData }),
      });

      const result = await client.updateDatabase('test-db-uuid', updateData);

      expect(result).toEqual({ ...mockDatabase, ...updateData });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test.coolify.io/api/v1/databases/test-db-uuid',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updateData),
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          },
        }),
      );
    });

    it('should delete database', async () => {
      const mockResponse = { message: 'Database deleted' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.deleteDatabase('test-db-uuid', {
        deleteConfigurations: true,
        deleteVolumes: true,
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test.coolify.io/api/v1/databases/test-db-uuid?delete_configurations=true&delete_volumes=true',
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          },
        }),
      );
    });

    it('should handle database errors', async () => {
      const errorMessage = 'Database not found';
      mockFetch.mockRejectedValue(new Error(errorMessage));

      await expect(client.getDatabase('invalid-uuid')).rejects.toThrow(errorMessage);
    });
  });
});

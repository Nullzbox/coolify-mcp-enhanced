import { CoolifyClient } from '../lib/coolify-client.js';
import type { ServerInfo, ServerResources } from '../types/coolify.js';

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
      description: 'Test server',
      ip: '127.0.0.1',
      port: 22,
      is_reachable: true,
      is_usable: true,
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const server = await client.getServer('test-uuid');
    expect(server).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
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

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const resources = await client.getServerResources('test-uuid');
    expect(resources).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://test.coolify.io/api/v1/servers/test-uuid/resources',
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
      }),
    );
  });
});

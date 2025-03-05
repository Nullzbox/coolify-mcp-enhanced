import { CoolifyClient } from '../lib/coolify-client.js';
import type { ServerInfo, ServerStatus } from '../types/coolify.js';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('CoolifyClient', () => {
  let client: CoolifyClient;
  const mockConfig = {
    baseUrl: 'http://test.coolify.io',
    accessToken: 'test-token',
  };

  beforeEach(() => {
    client = new CoolifyClient(mockConfig);
    mockFetch.mockClear();
  });

  describe('getServerInfo', () => {
    const mockServerInfo: ServerInfo = {
      id: 'test-id',
      name: 'test-server',
      status: 'running',
      version: '1.0.0',
      resources: {
        cpu: 2,
        memory: 4096,
        disk: 50,
      },
    };

    it('should fetch server info successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockServerInfo,
      });

      const result = await client.getServerInfo();

      expect(result).toEqual(mockServerInfo);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test.coolify.io/api/v1/server',
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

      await expect(client.getServerInfo()).rejects.toThrow('Invalid token');
    });
  });

  describe('getServerStatus', () => {
    const mockServerStatus: ServerStatus = {
      health: {
        status: 'healthy',
        lastCheck: '2024-03-19T12:00:00Z',
      },
      resources: {
        cpu: {
          usage: 45.5,
          cores: 4,
        },
        memory: {
          used: 8192,
          total: 16384,
          percentage: 50,
        },
        disk: {
          used: 100,
          total: 500,
          percentage: 20,
        },
      },
    };

    it('should fetch server status successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockServerStatus,
      });

      const result = await client.getServerStatus();

      expect(result).toEqual(mockServerStatus);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test.coolify.io/api/v1/server/status',
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

      await expect(client.getServerStatus()).rejects.toThrow('Internal server error');
    });
  });
});

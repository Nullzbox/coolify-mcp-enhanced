import { jest } from '@jest/globals';
import { CoolifyClient } from '../lib/coolify-client.js';
import { ServiceType, CreateServiceRequest } from '../types/coolify.js';

const mockFetch = jest.fn() as any;

describe('CoolifyClient', () => {
  let client: CoolifyClient;

  const mockServers = [
    {
      id: 1,
      uuid: 'test-uuid',
      name: 'test-server',
      status: 'running'
    }
  ];

  const mockServerInfo = {
    id: 1,
    uuid: 'test-uuid',
    name: 'test-server',
    status: 'running'
  };

  const mockServerResources = {
    resources: [
      {
        name: 'memory',
        value: '2GB'
      },
      {
        name: 'disk',
        value: '20GB'
      }
    ]
  };

  const mockService = {
    id: 1,
    uuid: 'test-uuid',
    name: 'test-service',
    type: 'code-server' as ServiceType,
    status: 'running',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  };

  const errorResponse = {
    message: 'Resource not found'
  };

  beforeEach(() => {
    mockFetch.mockClear();
    (global as any).fetch = mockFetch;
    client = new CoolifyClient({
      baseUrl: 'http://localhost:3000',
      accessToken: 'test-api-key'
    });
  });

  describe('listServers', () => {
    it('should return a list of servers', async () => {
      mockFetch.mockImplementationOnce(async () => ({
        ok: true,
        json: async () => mockServers
      } as Response));

      const servers = await client.listServers();
      expect(servers).toEqual(mockServers);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/v1/servers', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key'
        }
      });
    });

    it('should handle errors', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: false,
        json: async () => errorResponse
      } as Response));

      await expect(client.listServers()).rejects.toThrow('Resource not found');
    });
  });

  describe('getServer', () => {
    it('should get server info', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: async () => mockServerInfo
      } as Response));

      const result = await client.getServer('test-uuid');

      expect(result).toEqual(mockServerInfo);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/servers/test-uuid',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-api-key'
          }
        }
      );
    });

    it('should handle errors', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: false,
        json: async () => errorResponse
      } as Response));

      await expect(client.getServer('test-uuid')).rejects.toThrow('Resource not found');
    });
  });

  describe('getServerResources', () => {
    it('should get server resources', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: async () => mockServerResources
      } as Response));

      const result = await client.getServerResources('test-uuid');

      expect(result).toEqual(mockServerResources);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/servers/test-uuid/resources',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-api-key'
          }
        }
      );
    });

    it('should handle errors', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: false,
        json: async () => errorResponse
      } as Response));

      await expect(client.getServerResources('test-uuid')).rejects.toThrow('Resource not found');
    });
  });

  describe('listServices', () => {
    it('should list services', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve([mockService])
      } as Response));

      const result = await client.listServices();

      expect(result).toEqual([mockService]);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/services',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-api-key'
          }
        }
      );
    });
  });

  describe('getService', () => {
    it('should get service info', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockService)
      } as Response));

      const result = await client.getService('test-uuid');

      expect(result).toEqual(mockService);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/services/test-uuid',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-api-key'
          }
        }
      );
    });
  });

  describe('createService', () => {
    it('should create a service', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          uuid: 'test-uuid',
          domains: ['test.com']
        })
      } as Response));

      const createData: CreateServiceRequest = {
        name: 'test-service',
        type: 'code-server',
        project_uuid: 'project-uuid',
        environment_uuid: 'env-uuid',
        server_uuid: 'server-uuid'
      };

      const result = await client.createService(createData);

      expect(result).toEqual({
        uuid: 'test-uuid',
        domains: ['test.com']
      });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/services',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-api-key'
          },
          body: JSON.stringify(createData)
        }
      );
    });
  });

  describe('deleteService', () => {
    it('should delete a service', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Service deleted' })
      } as Response));

      const result = await client.deleteService('test-uuid');

      expect(result).toEqual({ message: 'Service deleted' });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/services/test-uuid',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-api-key'
          }
        }
      );
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      const errorMessage = 'Network error';
      mockFetch.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));

      await expect(client.listServers()).rejects.toThrow(errorMessage);
    });
  });
});

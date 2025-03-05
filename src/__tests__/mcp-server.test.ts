import { CoolifyMcpServer } from '../lib/mcp-server.js';
import { jest } from '@jest/globals';
import type { ServerResources, ValidationResponse } from '../types/coolify.js';

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
});

import { ServiceResources } from '../../resources/service-resources.js';
import { CoolifyClient } from '../../lib/coolify-client.js';
import { Service } from '../../types/coolify.js';

jest.mock('../../lib/coolify-client.js');

describe('ServiceResources', () => {
  let resources: ServiceResources;
  let mockClient: jest.Mocked<CoolifyClient>;

  const mockService: Service = {
    id: 1,
    uuid: 'test-service-uuid',
    name: 'test-service',
    description: 'Test service',
    type: 'code-server',
    status: 'running',
    created_at: '2024-03-06T12:00:00Z',
    updated_at: '2024-03-06T12:00:00Z',
    project_uuid: 'test-project-uuid',
    environment_name: 'production',
    environment_uuid: 'test-env-uuid',
    server_uuid: 'test-server-uuid',
    domains: ['test-service.example.com'],
  };

  beforeEach(() => {
    mockClient = new CoolifyClient({
      baseUrl: 'http://test.coolify.io',
      accessToken: 'test-token',
    }) as jest.Mocked<CoolifyClient>;
    resources = new ServiceResources(mockClient);
  });

  describe('listServices', () => {
    it('should return a list of services', async () => {
      mockClient.listServices = jest.fn().mockResolvedValue([mockService]);

      const result = await resources.listServices();

      expect(result).toEqual([mockService]);
      expect(mockClient.listServices).toHaveBeenCalled();
    });
  });

  describe('getService', () => {
    it('should return a specific service', async () => {
      mockClient.getService = jest.fn().mockResolvedValue(mockService);

      const result = await resources.getService('test-service-uuid');

      expect(result).toEqual(mockService);
      expect(mockClient.getService).toHaveBeenCalledWith('test-service-uuid');
    });
  });

  describe('createService', () => {
    it('should create a service', async () => {
      const createData = {
        type: 'code-server' as const,
        name: 'test-service',
        description: 'Test service',
        project_uuid: 'test-project-uuid',
        environment_name: 'production',
        server_uuid: 'test-server-uuid',
        instant_deploy: true,
      };

      const mockResponse = {
        uuid: 'test-service-uuid',
        domains: ['test-service.example.com'],
      };

      mockClient.createService = jest.fn().mockResolvedValue(mockResponse);

      const result = await resources.createService(createData);

      expect(result).toEqual(mockResponse);
      expect(mockClient.createService).toHaveBeenCalledWith(createData);
    });
  });

  describe('deleteService', () => {
    it('should delete a service', async () => {
      const mockResponse = { message: 'Service deleted' };
      mockClient.deleteService = jest.fn().mockResolvedValue(mockResponse);

      const options = {
        deleteConfigurations: true,
        deleteVolumes: true,
      };

      const result = await resources.deleteService('test-service-uuid', options);

      expect(result).toEqual(mockResponse);
      expect(mockClient.deleteService).toHaveBeenCalledWith('test-service-uuid', options);
    });
  });
});

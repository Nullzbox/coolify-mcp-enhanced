import { ServiceResources } from '../../resources/service-resources.js';
import { CoolifyClient } from '../../lib/coolify-client.js';
import { Service, ServiceType } from '../../types/coolify.js';
import { jest } from '@jest/globals';

jest.mock('../../lib/coolify-client.js');

describe('ServiceResources', () => {
  let mockClient: jest.Mocked<CoolifyClient>;
  let resources: ServiceResources;
  const mockService: Service = {
    id: 1,
    uuid: 'test-uuid',
    name: 'test-service',
    description: 'test description',
    type: 'code-server',
    status: 'running',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    project_uuid: 'project-uuid',
    environment_name: 'test-env',
    environment_uuid: 'env-uuid',
    server_uuid: 'server-uuid',
    domains: ['test.com'],
  };

  beforeEach(() => {
    mockClient = {
      listServices: jest.fn(),
      getService: jest.fn(),
      createService: jest.fn(),
      deleteService: jest.fn(),
    } as unknown as jest.Mocked<CoolifyClient>;
    resources = new ServiceResources(mockClient);
  });

  describe('listServices', () => {
    it('should return a list of services', async () => {
      mockClient.listServices.mockResolvedValue([mockService]);

      const result = await resources.listServices();

      expect(result).toEqual([mockService]);
      expect(mockClient.listServices).toHaveBeenCalled();
    });
  });

  describe('getService', () => {
    it('should return a service by uuid', async () => {
      mockClient.getService.mockResolvedValue(mockService);

      const result = await resources.getService('test-uuid');

      expect(result).toEqual(mockService);
      expect(mockClient.getService).toHaveBeenCalledWith('test-uuid');
    });
  });

  describe('createService', () => {
    it('should create a new service', async () => {
      const createData = {
        name: 'new-service',
        type: 'code-server' as ServiceType,
        project_uuid: 'project-uuid',
        environment_name: 'test-env',
        environment_uuid: 'env-uuid',
        server_uuid: 'server-uuid',
      };

      const mockResponse = {
        uuid: 'new-uuid',
        domains: ['new-service.test.com'],
      };

      mockClient.createService.mockResolvedValue(mockResponse);

      const result = await resources.createService(createData);

      expect(result).toEqual(mockResponse);
      expect(mockClient.createService).toHaveBeenCalledWith(createData);
    });
  });

  describe('deleteService', () => {
    it('should delete a service', async () => {
      const mockResponse = { message: 'Service deleted' };
      mockClient.deleteService.mockResolvedValue(mockResponse);

      const result = await resources.deleteService('test-uuid');

      expect(result).toEqual(mockResponse);
      expect(mockClient.deleteService).toHaveBeenCalledWith('test-uuid', undefined);
    });
  });
});

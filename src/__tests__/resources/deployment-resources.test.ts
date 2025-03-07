import { DeploymentResources } from '../../resources/deployment-resources.js';
import { CoolifyClient } from '../../lib/coolify-client.js';
import { Deployment } from '../../types/coolify.js';

jest.mock('../../lib/coolify-client.js');

describe('DeploymentResources', () => {
  let resources: DeploymentResources;
  let mockClient: jest.Mocked<CoolifyClient>;

  const mockDeployment: Deployment = {
    id: 1,
    uuid: 'test-deployment-uuid',
    application_uuid: 'test-app-uuid',
    status: 'running',
    created_at: '2024-03-20T12:00:00Z',
    updated_at: '2024-03-20T12:00:00Z',
  };

  beforeEach(() => {
    mockClient = new CoolifyClient({
      baseUrl: 'http://test.coolify.io',
      accessToken: 'test-token',
    }) as jest.Mocked<CoolifyClient>;
    resources = new DeploymentResources(mockClient);
  });

  describe('listDeployments', () => {
    it('should throw not implemented error', async () => {
      await expect(resources.listDeployments()).rejects.toThrow('Not implemented');
    });
  });

  describe('getDeployment', () => {
    it('should throw not implemented error', async () => {
      await expect(resources.getDeployment('test-id')).rejects.toThrow('Not implemented');
    });
  });

  describe('deploy', () => {
    it('should deploy an application', async () => {
      mockClient.deployApplication = jest.fn().mockResolvedValue(mockDeployment);

      const result = await resources.deploy({ uuid: 'test-app-uuid', forceRebuild: true });

      expect(result).toEqual(mockDeployment);
      expect(mockClient.deployApplication).toHaveBeenCalledWith('test-app-uuid');
    });

    it('should handle deployment errors', async () => {
      const error = new Error('Failed to deploy application');
      mockClient.deployApplication = jest.fn().mockRejectedValue(error);

      await expect(resources.deploy({ uuid: 'test-app-uuid' })).rejects.toThrow(
        'Failed to deploy application',
      );
    });
  });
});

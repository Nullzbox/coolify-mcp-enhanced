import { ApplicationResources } from '../../resources/application-resources.js';
import { CoolifyClient } from '../../lib/coolify-client.js';

jest.mock('../../lib/coolify-client.js');

describe('ApplicationResources', () => {
  let resources: ApplicationResources;
  let mockClient: jest.Mocked<CoolifyClient>;

  beforeEach(() => {
    mockClient = new CoolifyClient({
      baseUrl: 'http://test.coolify.io',
      accessToken: 'test-token',
    }) as jest.Mocked<CoolifyClient>;
    resources = new ApplicationResources(mockClient);
  });

  describe('listApplications', () => {
    it('should throw not implemented error', async () => {
      await expect(resources.listApplications()).rejects.toThrow('Not implemented');
    });
  });

  describe('getApplication', () => {
    it('should throw not implemented error', async () => {
      await expect(resources.getApplication('test-id')).rejects.toThrow('Not implemented');
    });
  });

  describe('createApplication', () => {
    it('should throw not implemented error', async () => {
      await expect(resources.createApplication({ name: 'test-app' })).rejects.toThrow(
        'Not implemented',
      );
    });
  });

  describe('deleteApplication', () => {
    it('should throw not implemented error', async () => {
      await expect(resources.deleteApplication('test-id')).rejects.toThrow('Not implemented');
    });
  });
});

import { DatabaseResources } from '../../resources/database-resources.js';
import { CoolifyClient } from '../../lib/coolify-client.js';
import { Database } from '../../types/coolify.js';

jest.mock('../../lib/coolify-client.js');

describe('DatabaseResources', () => {
  let resources: DatabaseResources;
  let mockClient: jest.Mocked<CoolifyClient>;

  const mockDatabase: Database = {
    id: 1,
    uuid: 'test-db-uuid',
    name: 'test-db',
    description: 'Test database',
    type: 'postgresql',
    status: 'running',
    created_at: '2024-03-06T12:00:00Z',
    updated_at: '2024-03-06T12:00:00Z',
    is_public: false,
    image: 'postgres:latest',
    postgres_user: 'postgres',
    postgres_password: 'test123',
    postgres_db: 'testdb',
  };

  beforeEach(() => {
    mockClient = new CoolifyClient({
      baseUrl: 'http://test.coolify.io',
      accessToken: 'test-token',
    }) as jest.Mocked<CoolifyClient>;
    resources = new DatabaseResources(mockClient);
  });

  describe('listDatabases', () => {
    it('should return a list of databases', async () => {
      mockClient.listDatabases = jest.fn().mockResolvedValue([mockDatabase]);

      const result = await resources.listDatabases();

      expect(result).toEqual([mockDatabase]);
      expect(mockClient.listDatabases).toHaveBeenCalled();
    });
  });

  describe('getDatabase', () => {
    it('should return a specific database', async () => {
      mockClient.getDatabase = jest.fn().mockResolvedValue(mockDatabase);

      const result = await resources.getDatabase('test-db-uuid');

      expect(result).toEqual(mockDatabase);
      expect(mockClient.getDatabase).toHaveBeenCalledWith('test-db-uuid');
    });
  });

  describe('updateDatabase', () => {
    it('should update a database', async () => {
      const updateData = {
        name: 'updated-db',
        description: 'Updated description',
      };
      mockClient.updateDatabase = jest.fn().mockResolvedValue({ ...mockDatabase, ...updateData });

      const result = await resources.updateDatabase('test-db-uuid', updateData);

      expect(result).toEqual({ ...mockDatabase, ...updateData });
      expect(mockClient.updateDatabase).toHaveBeenCalledWith('test-db-uuid', updateData);
    });
  });

  describe('deleteDatabase', () => {
    it('should delete a database', async () => {
      const mockResponse = { message: 'Database deleted' };
      mockClient.deleteDatabase = jest.fn().mockResolvedValue(mockResponse);

      const options = {
        deleteConfigurations: true,
        deleteVolumes: true,
      };

      const result = await resources.deleteDatabase('test-db-uuid', options);

      expect(result).toEqual(mockResponse);
      expect(mockClient.deleteDatabase).toHaveBeenCalledWith('test-db-uuid', options);
    });
  });
});

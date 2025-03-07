import { DatabaseResources } from '../../resources/database-resources.js';
import { CoolifyClient } from '../../lib/coolify-client.js';
import { PostgresDatabase } from '../../types/coolify.js';
import { jest } from '@jest/globals';

jest.mock('../../lib/coolify-client.js');

describe('DatabaseResources', () => {
  let mockClient: jest.Mocked<CoolifyClient>;
  let resources: DatabaseResources;
  const mockDatabase: PostgresDatabase = {
    id: 1,
    uuid: 'test-uuid',
    name: 'test-db',
    description: 'test description',
    type: 'postgresql',
    status: 'running',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    is_public: false,
    image: 'postgres:latest',
    postgres_user: 'test',
    postgres_password: 'test',
    postgres_db: 'test',
  };

  beforeEach(() => {
    mockClient = {
      listDatabases: jest.fn(),
      getDatabase: jest.fn(),
      updateDatabase: jest.fn(),
      deleteDatabase: jest.fn(),
    } as unknown as jest.Mocked<CoolifyClient>;
    resources = new DatabaseResources(mockClient);
  });

  describe('listDatabases', () => {
    it('should return a list of databases', async () => {
      mockClient.listDatabases.mockResolvedValue([mockDatabase]);

      const result = await resources.listDatabases();

      expect(result).toEqual([mockDatabase]);
      expect(mockClient.listDatabases).toHaveBeenCalled();
    });
  });

  describe('getDatabase', () => {
    it('should return a database by uuid', async () => {
      mockClient.getDatabase.mockResolvedValue(mockDatabase);

      const result = await resources.getDatabase('test-uuid');

      expect(result).toEqual(mockDatabase);
      expect(mockClient.getDatabase).toHaveBeenCalledWith('test-uuid');
    });
  });

  describe('updateDatabase', () => {
    it('should update a database', async () => {
      const updateData = {
        name: 'updated-db',
        description: 'updated description',
      };

      mockClient.updateDatabase.mockResolvedValue({ ...mockDatabase, ...updateData });

      const result = await resources.updateDatabase('test-uuid', updateData);

      expect(result).toEqual({ ...mockDatabase, ...updateData });
      expect(mockClient.updateDatabase).toHaveBeenCalledWith('test-uuid', updateData);
    });
  });

  describe('deleteDatabase', () => {
    it('should delete a database', async () => {
      const mockResponse = { message: 'Database deleted successfully' };
      mockClient.deleteDatabase.mockResolvedValue(mockResponse);

      const result = await resources.deleteDatabase('test-uuid', {});

      expect(result).toEqual(mockResponse);
      expect(mockClient.deleteDatabase).toHaveBeenCalledWith('test-uuid', {});
    });
  });
});

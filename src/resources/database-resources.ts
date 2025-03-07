import { Resource } from '../lib/resource.js';
import { CoolifyClient } from '../lib/coolify-client.js';
import { Database, DatabaseUpdateRequest } from '../types/coolify.js';

export class DatabaseResources {
  private client: CoolifyClient;

  constructor(client: CoolifyClient) {
    this.client = client;
  }

  @Resource('coolify/databases/list')
  async listDatabases(): Promise<Database[]> {
    return this.client.listDatabases();
  }

  @Resource('coolify/databases/{id}')
  async getDatabase(id: string): Promise<Database> {
    return this.client.getDatabase(id);
  }

  @Resource('coolify/databases/{id}/update')
  async updateDatabase(id: string, data: DatabaseUpdateRequest): Promise<Database> {
    return this.client.updateDatabase(id, data);
  }

  @Resource('coolify/databases/{id}/delete')
  async deleteDatabase(
    id: string,
    options?: {
      deleteConfigurations?: boolean;
      deleteVolumes?: boolean;
      dockerCleanup?: boolean;
      deleteConnectedNetworks?: boolean;
    },
  ): Promise<{ message: string }> {
    return this.client.deleteDatabase(id, options);
  }
}

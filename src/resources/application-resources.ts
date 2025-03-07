import { Resource } from '../lib/resource.js';
import { CoolifyClient } from '../lib/coolify-client.js';
import { Application, CreateApplicationRequest } from '../types/coolify.js';

export class ApplicationResources {
  private client: CoolifyClient;

  constructor(client: CoolifyClient) {
    this.client = client;
  }

  @Resource('coolify/applications/list')
  async listApplications(): Promise<Application[]> {
    // TODO: Implement listApplications in CoolifyClient
    throw new Error('Not implemented');
  }

  @Resource('coolify/applications/{id}')
  async getApplication(_id: string): Promise<Application> {
    // TODO: Implement getApplication in CoolifyClient
    throw new Error('Not implemented');
  }

  @Resource('coolify/applications/create')
  async createApplication(_data: CreateApplicationRequest): Promise<{ uuid: string }> {
    // TODO: Implement createApplication in CoolifyClient
    throw new Error('Not implemented');
  }

  @Resource('coolify/applications/{id}/delete')
  async deleteApplication(_id: string): Promise<{ message: string }> {
    // TODO: Implement deleteApplication in CoolifyClient
    throw new Error('Not implemented');
  }
}

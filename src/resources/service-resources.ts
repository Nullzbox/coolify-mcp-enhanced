import { Resource } from '../lib/resource.js';
import { CoolifyClient } from '../lib/coolify-client.js';
import { Service, CreateServiceRequest, DeleteServiceOptions } from '../types/coolify.js';

export class ServiceResources {
  private client: CoolifyClient;

  constructor(client: CoolifyClient) {
    this.client = client;
  }

  @Resource('coolify/services/list')
  async listServices(): Promise<Service[]> {
    return this.client.listServices();
  }

  @Resource('coolify/services/{id}')
  async getService(id: string): Promise<Service> {
    return this.client.getService(id);
  }

  @Resource('coolify/services/create')
  async createService(data: CreateServiceRequest): Promise<{ uuid: string; domains: string[] }> {
    return this.client.createService(data);
  }

  @Resource('coolify/services/{id}/delete')
  async deleteService(id: string, options?: DeleteServiceOptions): Promise<{ message: string }> {
    return this.client.deleteService(id, options);
  }
}

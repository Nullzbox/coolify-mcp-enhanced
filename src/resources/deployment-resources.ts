import { Resource } from '../lib/resource.js';
import { CoolifyClient } from '../lib/coolify-client.js';
import { Deployment } from '../types/coolify.js';

export class DeploymentResources {
  private client: CoolifyClient;

  constructor(client: CoolifyClient) {
    this.client = client;
  }

  @Resource('coolify/deployments/list')
  async listDeployments(): Promise<Deployment[]> {
    // TODO: Implement listDeployments in CoolifyClient
    throw new Error('Not implemented');
  }

  @Resource('coolify/deployments/{id}')
  async getDeployment(_id: string): Promise<Deployment> {
    // TODO: Implement getDeployment in CoolifyClient
    throw new Error('Not implemented');
  }

  @Resource('coolify/deploy')
  async deploy(params: { uuid: string; forceRebuild?: boolean }): Promise<Deployment> {
    return this.client.deployApplication(params.uuid);
  }
}

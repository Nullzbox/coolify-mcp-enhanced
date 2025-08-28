#!/usr/bin/env node

import { CoolifyClient } from './dist/lib/coolify-client.js';

const config = {
  baseUrl: process.env.COOLIFY_BASE_URL || "http://nullbase.xyz:8000",
  accessToken: process.env.COOLIFY_ACCESS_TOKEN || "1|nTGHwS80TMq4g5BX77D4XGnzcL2JvtImKiVa8kpE5ccdd50f"
};

console.log('🔧 Testing Coolify Connection...');
console.log('📍 Server:', config.baseUrl);

const client = new CoolifyClient(config);

async function testConnection() {
  try {
    // Test 1: List servers
    console.log('\n📋 Test 1: Listing servers...');
    const servers = await client.listServers();
    console.log('✅ Servers found:', servers.length);
    if (servers.length > 0) {
      console.log('   Server 1:', servers[0].name, '(' + servers[0].uuid + ')');
    }

    // Test 2: List projects
    console.log('\n📋 Test 2: Listing projects...');
    const projects = await client.listProjects();
    console.log('✅ Projects found:', projects.length);
    
    // Test 3: Create test project
    console.log('\n📋 Test 3: Creating test project...');
    let testProject;
    try {
      testProject = await client.createProject({
        name: 'MCP-Test-Project-' + Date.now(),
        description: 'Test project for MCP development - Safe to delete'
      });
      console.log('✅ Test project created:', testProject.uuid);
    } catch (e) {
      console.log('⚠️  Could not create project:', e.message);
      // Use existing project
      if (projects.length > 0) {
        testProject = { uuid: projects[0].uuid };
        console.log('   Using existing project:', projects[0].name);
      }
    }

    // Test 4: List applications
    console.log('\n📋 Test 4: Listing applications...');
    const apps = await client.listApplications();
    console.log('✅ Applications found:', apps.length);
    if (apps.length > 0) {
      console.log('   App 1:', apps[0].name, '(' + apps[0].uuid + ')');
    }

    // Test 5: List deployments 
    console.log('\n📋 Test 5: Testing deployment endpoints...');
    if (apps.length > 0) {
      try {
        // Test the missing endpoint
        const response = await client.request(`/deployments`);
        console.log('✅ GET /deployments works!');
      } catch (e) {
        console.log('❌ GET /deployments failed:', e.message);
      }

      try {
        // Test app deployments endpoint
        const deployments = await client.request(`/deployments/applications/${apps[0].uuid}`);
        console.log('✅ GET /deployments/applications/{uuid} works!');
        console.log('   Deployments for app:', deployments.length || 0);
      } catch (e) {
        console.log('❌ GET /deployments/applications/{uuid} failed:', e.message);
      }
    }

    // Test 6: Test application control endpoints
    console.log('\n📋 Test 6: Testing application control...');
    if (apps.length > 0) {
      const testApp = apps[0];
      
      // Test stop
      try {
        console.log('   Testing stop...');
        const stopResult = await client.stopApplication(testApp.uuid);
        console.log('✅ Stop application works!', stopResult.message || 'Success');
      } catch (e) {
        console.log('❌ Stop failed:', e.message);
      }

      // Test start
      try {
        console.log('   Testing start...');
        const startResult = await client.startApplication(testApp.uuid);
        console.log('✅ Start application works!', startResult.message || 'Success');
      } catch (e) {
        console.log('❌ Start failed:', e.message);
      }

      // Test restart
      try {
        console.log('   Testing restart...');
        const restartResult = await client.restartApplication(testApp.uuid);
        console.log('✅ Restart application works!', restartResult.message || 'Success');
      } catch (e) {
        console.log('❌ Restart failed:', e.message);
      }
    }

    // Test 7: Test database control endpoints
    console.log('\n📋 Test 7: Testing database endpoints...');
    const databases = await client.listDatabases();
    console.log('✅ Databases found:', databases.length);
    
    if (databases.length > 0) {
      const testDb = databases[0];
      console.log('   Testing with database:', testDb.name);
      
      try {
        const response = await client.request(`/databases/${testDb.uuid}/restart`, {
          method: 'GET'
        });
        console.log('✅ Database restart endpoint works!');
      } catch (e) {
        console.log('❌ Database restart failed:', e.message);
      }
    }

    // Test 8: Test service endpoints
    console.log('\n📋 Test 8: Testing service endpoints...');
    const services = await client.listServices();
    console.log('✅ Services found:', services.length);
    
    if (services.length > 0) {
      const testService = services[0];
      console.log('   Testing with service:', testService.name);
      
      try {
        const response = await client.request(`/services/${testService.uuid}/restart`, {
          method: 'GET'
        });
        console.log('✅ Service restart endpoint works!');
      } catch (e) {
        console.log('❌ Service restart failed:', e.message);
      }
    }

    console.log('\n✅ Connection test completed!');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    process.exit(1);
  }
}

testConnection();
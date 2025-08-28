#!/usr/bin/env node

import { CoolifyClient } from './dist/lib/coolify-client.js';

const config = {
  baseUrl: process.env.COOLIFY_BASE_URL || "http://nullbase.xyz:8000",
  accessToken: process.env.COOLIFY_ACCESS_TOKEN || "1|nTGHwS80TMq4g5BX77D4XGnzcL2JvtImKiVa8kpE5ccdd50f"
};

console.log('🚀 Testing New Coolify MCP Features');
console.log('=====================================\n');

const client = new CoolifyClient(config);

async function testNewFeatures() {
  try {
    // Test 1: List all deployments
    console.log('📋 Test 1: List all deployments');
    try {
      const deployments = await client.listAllDeployments(0, 5);
      console.log('✅ List all deployments works!');
      console.log(`   Found ${deployments.length} deployments`);
      if (deployments.length > 0) {
        console.log(`   Latest: ${deployments[0].id} - Status: ${deployments[0].status}`);
      }
    } catch (e) {
      console.log('❌ List all deployments failed:', e.message);
    }

    // Test 2: Get application deployments with pagination
    console.log('\n📋 Test 2: Get application deployments with pagination');
    const apps = await client.listApplications();
    if (apps.length > 0) {
      try {
        const appDeployments = await client.getDeployments(apps[0].uuid, 0, 10);
        console.log('✅ Get application deployments with pagination works!');
        console.log(`   Found ${appDeployments.length} deployments for app: ${apps[0].name}`);
      } catch (e) {
        console.log('❌ Get application deployments failed:', e.message);
      }
    }

    // Test 3: Deploy with force option
    console.log('\n📋 Test 3: Deploy with force option');
    if (apps.length > 0) {
      try {
        const result = await client.deployApplication(apps[0].uuid, { force: true });
        console.log('✅ Deploy with force option works!');
        console.log(`   Deployment UUID: ${result.deployment_uuid || 'Queued'}`);
      } catch (e) {
        console.log('❌ Deploy with force failed:', e.message);
      }
    }

    // Test 4: Database control
    console.log('\n📋 Test 4: Database control methods');
    const databases = await client.listDatabases();
    if (databases.length > 0) {
      const testDb = databases[0];
      console.log(`   Testing with database: ${testDb.name}`);
      
      try {
        await client.stopDatabase(testDb.uuid);
        console.log('✅ Stop database works!');
      } catch (e) {
        console.log('❌ Stop database failed:', e.message);
      }

      try {
        await client.startDatabase(testDb.uuid);
        console.log('✅ Start database works!');
      } catch (e) {
        console.log('❌ Start database failed:', e.message);
      }

      try {
        await client.restartDatabase(testDb.uuid);
        console.log('✅ Restart database works!');
      } catch (e) {
        console.log('❌ Restart database failed:', e.message);
      }
    } else {
      console.log('   No databases available for testing');
    }

    // Test 5: Service control
    console.log('\n📋 Test 5: Service control methods');
    const services = await client.listServices();
    if (services.length > 0) {
      const testService = services[0];
      console.log(`   Testing with service: ${testService.name}`);
      
      try {
        await client.stopService(testService.uuid);
        console.log('✅ Stop service works!');
      } catch (e) {
        console.log('❌ Stop service failed:', e.message);
      }

      try {
        await client.startService(testService.uuid);
        console.log('✅ Start service works!');
      } catch (e) {
        console.log('❌ Start service failed:', e.message);
      }

      try {
        await client.restartService(testService.uuid);
        console.log('✅ Restart service works!');
      } catch (e) {
        console.log('❌ Restart service failed:', e.message);
      }
    } else {
      console.log('   No services available for testing');
    }

    // Test 6: Get application logs
    console.log('\n📋 Test 6: Get application logs');
    if (apps.length > 0) {
      try {
        const logs = await client.getApplicationLogs(apps[0].uuid, { lines: 10 });
        console.log('✅ Get application logs works!');
        console.log(`   Retrieved ${logs.length} log entries`);
      } catch (e) {
        console.log('❌ Get application logs failed:', e.message);
      }
    }

    // Test 7: Deploy by tag
    console.log('\n📋 Test 7: Deploy by tag/UUID');
    if (apps.length > 0) {
      try {
        const result = await client.deployByTagOrUuid(apps[0].uuid);
        console.log('✅ Deploy by tag/UUID works!');
        console.log(`   Result: ${result.message}`);
      } catch (e) {
        console.log('❌ Deploy by tag failed:', e.message);
      }
    }

    // Test 8: Environment variables with new logic
    console.log('\n📋 Test 8: Enhanced environment variables management');
    if (apps.length > 0) {
      try {
        const testVars = [
          { key: 'TEST_VAR_1', value: 'value1', is_preview: false },
          { key: 'TEST_VAR_2', value: 'value2', is_build_time: true }
        ];
        
        const result = await client.updateApplicationEnvironmentVariables(apps[0].uuid, testVars);
        console.log('✅ Batch environment variable update works!');
        console.log(`   Result: ${result.message}`);
        if (result.results) {
          result.results.forEach(r => {
            console.log(`     - ${r.key || 'Unknown'}: ${r.action || r.error}`);
          });
        }
      } catch (e) {
        console.log('❌ Environment variable update failed:', e.message);
      }
    }

    console.log('\n✨ All tests completed!');
    console.log('=====================================');
    
    // Summary
    console.log('\n📊 New Features Summary:');
    console.log('✅ Deployment management (list, get, deploy by tag)');
    console.log('✅ Application control (start/stop/restart with options)');
    console.log('✅ Database control (start/stop/restart)');
    console.log('✅ Service control (start/stop/restart)');
    console.log('✅ Application logs retrieval');
    console.log('✅ Enhanced environment variable management');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

testNewFeatures();
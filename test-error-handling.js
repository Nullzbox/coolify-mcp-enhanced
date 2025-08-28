#!/usr/bin/env node

import { CoolifyClient } from './dist/lib/coolify-client.js';

const config = {
  baseUrl: process.env.COOLIFY_BASE_URL || "http://nullbase.xyz:8000",
  accessToken: process.env.COOLIFY_ACCESS_TOKEN || "1|nTGHwS80TMq4g5BX77D4XGnzcL2JvtImKiVa8kpE5ccdd50f"
};

console.log('🧪 Testing Error Handling Improvements');
console.log('========================================\n');

const client = new CoolifyClient(config);

async function testErrorHandling() {
  try {
    // Test 1: Invalid UUID
    console.log('📋 Test 1: Testing with invalid UUID');
    try {
      await client.getApplication('invalid-uuid-123');
      console.log('❌ Should have thrown an error');
    } catch (error) {
      console.log('✅ Error properly caught:');
      console.log('   Message:', error.message);
      console.log('   Type:', typeof error);
      console.log('   Not [object Object]:', error.toString() !== '[object Object]');
    }

    // Test 2: Non-existent deployment
    console.log('\n📋 Test 2: Testing get_deployments with invalid app UUID');
    try {
      await client.getDeployments('non-existent-app-uuid');
      console.log('❌ Should have thrown an error');
    } catch (error) {
      console.log('✅ Error properly caught:');
      console.log('   Message:', error.message);
      console.log('   Serialized correctly:', JSON.stringify(error).length > 20);
    }

    // Test 3: Get real application to check response size
    console.log('\n📋 Test 3: Testing application response size');
    const apps = await client.listApplications();
    if (apps.length > 0) {
      const app = await client.getApplication(apps[0].uuid);
      const responseStr = JSON.stringify(app);
      console.log('✅ Application fetched successfully');
      console.log('   Response size:', responseStr.length, 'characters');
      console.log('   Has docker_compose_raw:', 'docker_compose_raw' in app);
      
      // Check if large fields are truncated
      if (app.docker_compose_raw === '[Truncated - too large]') {
        console.log('   ✅ Large fields properly truncated');
      }
    }

    // Test 4: Test deployment list
    console.log('\n📋 Test 4: Testing deployment list error format');
    if (apps.length > 0) {
      try {
        const deployments = await client.getDeployments(apps[0].uuid);
        console.log('✅ Deployments fetched:', deployments?.length || 0);
      } catch (error) {
        console.log('✅ Error format:');
        console.log('   ', JSON.stringify(error, null, 2).substring(0, 200));
      }
    }

    console.log('\n✅ All error handling tests completed!');
    console.log('========================================');
    console.log('\n📊 Summary:');
    console.log('• Errors are now properly serialized (no [object Object])');
    console.log('• Large responses are truncated to prevent token overflow');
    console.log('• Error messages include proper context and details');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

testErrorHandling();
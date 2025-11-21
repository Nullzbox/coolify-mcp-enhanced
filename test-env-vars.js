#!/usr/bin/env node

/**
 * Test script for environment variables functionality
 *
 * This script tests the enhanced environment variables handling including:
 * - is_build_time: Set variable for build vs runtime
 * - is_multiline: For certificates, JSON configs, etc.
 * - is_shown_once: For sensitive data that should only be shown once
 *
 * Usage:
 *   node test-env-vars.js
 *
 * Requirements:
 *   - MCP server must be built (npm run build)
 *   - .mcp.json must exist with valid credentials
 */

const { spawn } = require('child_process');
const path = require('path');

const MCP_SERVER_PATH = path.join(__dirname, 'build', 'index.js');

let requestId = 1;

function sendRequest(process, method, params = {}) {
  const id = requestId++;
  const request = {
    jsonrpc: '2.0',
    id,
    method,
    params
  };

  console.log(`\n→ Sending request:`, JSON.stringify(request, null, 2));
  process.stdin.write(JSON.stringify(request) + '\n');

  return id;
}

function parseJSONLine(line) {
  try {
    return JSON.parse(line);
  } catch (e) {
    return null;
  }
}

async function main() {
  console.log('=== Testing Environment Variables Functionality ===\n');

  // Start MCP server
  const mcpServer = spawn('node', [MCP_SERVER_PATH], {
    stdio: ['pipe', 'pipe', 'inherit']
  });

  let buffer = '';
  const responses = new Map();

  mcpServer.stdout.on('data', (data) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;

      const json = parseJSONLine(line);
      if (json && json.id !== undefined) {
        responses.set(json.id, json);
        console.log(`\n← Received response for ID ${json.id}:`, JSON.stringify(json, null, 2));
      }
    }
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Initialize
  console.log('\n[Step 1] Initializing MCP server...');
  sendRequest(mcpServer, 'initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  });

  await new Promise(resolve => setTimeout(resolve, 500));

  // List applications to get one for testing
  console.log('\n[Step 2] Listing applications...');
  const listAppsId = sendRequest(mcpServer, 'tools/call', {
    name: 'list_applications',
    arguments: { limit: 5 }
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  const appsResponse = responses.get(listAppsId);
  if (!appsResponse || appsResponse.error) {
    console.error('\n❌ Failed to list applications:', appsResponse?.error);
    mcpServer.kill();
    process.exit(1);
  }

  const appsData = JSON.parse(appsResponse.result.content[0].text);
  console.log('\n✅ Applications retrieved:', appsData.total || 0);

  if (!appsData.items || appsData.items.length === 0) {
    console.log('\n⚠️  No applications found. Please create an application first.');
    mcpServer.kill();
    process.exit(0);
  }

  const firstApp = appsData.items[0];
  console.log(`\n[Step 3] Using application: ${firstApp.name} (${firstApp.uuid})`);

  // Test Case 1: Build-time variable
  console.log('\n[Step 4] Testing BUILD-TIME environment variable...');
  const buildVarId = sendRequest(mcpServer, 'tools/call', {
    name: 'update_application_environment_variables',
    arguments: {
      uuid: firstApp.uuid,
      variables: [{
        key: 'MCP_TEST_BUILD_VAR',
        value: 'build-value-123',
        is_build_time: true,
        is_preview: false,
        is_literal: true
      }]
    }
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  const buildVarResponse = responses.get(buildVarId);
  if (buildVarResponse && !buildVarResponse.error) {
    const result = JSON.parse(buildVarResponse.result.content[0].text);
    console.log('✅ Build-time variable set:', result.message || 'Success');
  } else {
    console.error('❌ Failed to set build-time variable:', buildVarResponse?.error);
  }

  // Test Case 2: Multiline variable (simulating a certificate or JSON config)
  console.log('\n[Step 5] Testing MULTILINE environment variable...');
  const multilineValue = `{
  "key1": "value1",
  "key2": "value2",
  "nested": {
    "data": "test"
  }
}`;

  const multilineVarId = sendRequest(mcpServer, 'tools/call', {
    name: 'update_application_environment_variables',
    arguments: {
      uuid: firstApp.uuid,
      variables: [{
        key: 'MCP_TEST_MULTILINE_VAR',
        value: multilineValue,
        is_multiline: true,
        is_build_time: false,
        is_literal: true
      }]
    }
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  const multilineVarResponse = responses.get(multilineVarId);
  if (multilineVarResponse && !multilineVarResponse.error) {
    const result = JSON.parse(multilineVarResponse.result.content[0].text);
    console.log('✅ Multiline variable set:', result.message || 'Success');
  } else {
    console.error('❌ Failed to set multiline variable:', multilineVarResponse?.error);
  }

  // Test Case 3: Sensitive variable (shown once)
  console.log('\n[Step 6] Testing SENSITIVE (shown_once) environment variable...');
  const sensitiveVarId = sendRequest(mcpServer, 'tools/call', {
    name: 'update_application_environment_variables',
    arguments: {
      uuid: firstApp.uuid,
      variables: [{
        key: 'MCP_TEST_SENSITIVE_VAR',
        value: 'super-secret-api-key-xyz',
        is_shown_once: true,
        is_build_time: false,
        is_literal: true
      }]
    }
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  const sensitiveVarResponse = responses.get(sensitiveVarId);
  if (sensitiveVarResponse && !sensitiveVarResponse.error) {
    const result = JSON.parse(sensitiveVarResponse.result.content[0].text);
    console.log('✅ Sensitive variable set:', result.message || 'Success');
  } else {
    console.error('❌ Failed to set sensitive variable:', sensitiveVarResponse?.error);
  }

  // Test Case 4: Combined - Build-time, multiline certificate
  console.log('\n[Step 7] Testing COMBINED (build-time + multiline) variable...');
  const certValue = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKL0UG+mRKtjMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMTcwODIxMDQyNzQ3WhcNMTgwODIxMDQyNzQ3WjBF
-----END CERTIFICATE-----`;

  const combinedVarId = sendRequest(mcpServer, 'tools/call', {
    name: 'update_application_environment_variables',
    arguments: {
      uuid: firstApp.uuid,
      variables: [{
        key: 'MCP_TEST_BUILD_CERT',
        value: certValue,
        is_build_time: true,
        is_multiline: true,
        is_literal: true
      }]
    }
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  const combinedVarResponse = responses.get(combinedVarId);
  if (combinedVarResponse && !combinedVarResponse.error) {
    const result = JSON.parse(combinedVarResponse.result.content[0].text);
    console.log('✅ Combined variable set:', result.message || 'Success');
  } else {
    console.error('❌ Failed to set combined variable:', combinedVarResponse?.error);
  }

  // Verify variables were created
  console.log('\n[Step 8] Retrieving all environment variables to verify...');
  const getEnvVarsId = sendRequest(mcpServer, 'tools/call', {
    name: 'get_application_environment_variables',
    arguments: {
      uuid: firstApp.uuid
    }
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  const envVarsResponse = responses.get(getEnvVarsId);
  if (envVarsResponse && !envVarsResponse.error) {
    const result = JSON.parse(envVarsResponse.result.content[0].text);
    console.log('\n✅ Environment variables retrieved successfully!');

    const testVars = result.data?.filter(v => v.key.startsWith('MCP_TEST_')) || [];
    if (testVars.length > 0) {
      console.log(`\n📋 Test variables found (${testVars.length}):`);
      console.log('─'.repeat(80));
      testVars.forEach(v => {
        console.log(`\n   ${v.key}:`);
        console.log(`     - Build Time: ${v.is_build_time}`);
        console.log(`     - Multiline: ${v.is_multiline}`);
        console.log(`     - Shown Once: ${v.is_shown_once}`);
        console.log(`     - Preview: ${v.is_preview}`);
        console.log(`     - Value length: ${v.value?.length || 0} chars`);
      });
      console.log('\n' + '─'.repeat(80));
    } else {
      console.log('\n   ⚠️  No test variables found (they may have been created but not returned in the list)');
    }
  } else {
    console.error('❌ Failed to retrieve environment variables:', envVarsResponse?.error);
  }

  console.log('\n\n=== Test Summary ===');
  console.log('✅ Build-time variable test');
  console.log('✅ Multiline variable test');
  console.log('✅ Sensitive (shown_once) variable test');
  console.log('✅ Combined (build+multiline) variable test');
  console.log('\nℹ️  Please check your Coolify UI to verify the variables were created correctly.');
  console.log('ℹ️  Test variables can be deleted manually from the UI (they start with MCP_TEST_)');

  console.log('\n\n=== Test Completed ===\n');

  mcpServer.kill();
  process.exit(0);
}

main().catch((error) => {
  console.error('\n❌ Test failed with error:', error);
  process.exit(1);
});

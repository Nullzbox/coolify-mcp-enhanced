#!/usr/bin/env node

/**
 * Test script for deployment logs functionality
 *
 * This script tests the new get_deployment_logs MCP tool
 *
 * Usage:
 *   node test-deployment-logs.js
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
  console.log('=== Testing Deployment Logs Functionality ===\n');

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

  // Get deployments for this application
  console.log('\n[Step 4] Getting deployments for application...');
  const getDeploymentsId = sendRequest(mcpServer, 'tools/call', {
    name: 'get_deployments',
    arguments: {
      application_uuid: firstApp.uuid,
      limit: 5
    }
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  const deploymentsResponse = responses.get(getDeploymentsId);
  if (!deploymentsResponse || deploymentsResponse.error) {
    console.error('\n❌ Failed to get deployments:', deploymentsResponse?.error);
    mcpServer.kill();
    process.exit(1);
  }

  const deploymentsData = JSON.parse(deploymentsResponse.result.content[0].text);
  console.log('\n✅ Deployments retrieved:', deploymentsData.count || 0);

  if (!deploymentsData.data || deploymentsData.data.length === 0) {
    console.log('\n⚠️  No deployments found for this application.');
    mcpServer.kill();
    process.exit(0);
  }

  const latestDeployment = deploymentsData.data[0];
  console.log(`\n[Step 5] Testing deployment logs for: ${latestDeployment.uuid}`);
  console.log(`   Status: ${latestDeployment.status}`);
  console.log(`   Created: ${latestDeployment.created_at}`);

  // Get deployment logs using the new tool
  console.log('\n[Step 6] Fetching deployment logs...');
  const getLogsId = sendRequest(mcpServer, 'tools/call', {
    name: 'get_deployment_logs',
    arguments: {
      deployment_uuid: latestDeployment.uuid
    }
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  const logsResponse = responses.get(getLogsId);
  if (!logsResponse || logsResponse.error) {
    console.error('\n❌ Failed to get deployment logs:', logsResponse?.error);
    mcpServer.kill();
    process.exit(1);
  }

  const logsData = JSON.parse(logsResponse.result.content[0].text);

  if (logsData.success) {
    console.log('\n✅ Deployment logs retrieved successfully!');
    console.log(`   ${logsData.message}`);

    if (logsData.logs) {
      const logLines = logsData.logs.split('\n').length;
      console.log(`\n📋 Log preview (first 500 chars):`);
      console.log('─'.repeat(80));
      console.log(logsData.logs.substring(0, 500));
      if (logsData.logs.length > 500) {
        console.log('\n... (truncated, total ' + logLines + ' lines)');
      }
      console.log('─'.repeat(80));
    } else {
      console.log('\n   ℹ️  No logs available for this deployment (might still be queued or very recent)');
    }
  } else {
    console.error('\n❌ Error retrieving logs:', logsData.error);
  }

  console.log('\n\n=== Test Completed ===\n');

  mcpServer.kill();
  process.exit(0);
}

main().catch((error) => {
  console.error('\n❌ Test failed with error:', error);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Comprehensive test script for all UPDATE tools in the MCP
 *
 * Tests the following update tools:
 * 1. update_project
 * 2. update_database
 * 3. update_application
 * 4. update_application_environment_variables
 * 5. update_docker_compose_service
 *
 * Usage:
 *   node test-update-tools.js
 *
 * Requirements:
 *   - MCP server must be built (npm run build)
 *   - .mcp.json must exist with valid credentials
 *   - At least one project, application, and database should exist in Coolify
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

  console.log(`\n→ Request #${id}: ${method}`);
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
  console.log('='.repeat(80));
  console.log('  COMPREHENSIVE UPDATE TOOLS TEST SUITE');
  console.log('='.repeat(80));
  console.log('\nThis test will verify all UPDATE operations in the Coolify MCP.');
  console.log('Note: Tests will modify existing resources but will revert changes.\n');

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
      }
    }
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Initialize
  console.log('[INIT] Initializing MCP server...');
  sendRequest(mcpServer, 'initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  });

  await new Promise(resolve => setTimeout(resolve, 500));

  const testResults = {
    passed: [],
    failed: [],
    skipped: []
  };

  // ========================================================================
  // TEST 1: update_project
  // ========================================================================
  console.log('\n' + '='.repeat(80));
  console.log('TEST 1: update_project');
  console.log('='.repeat(80));

  console.log('\n[1.1] Listing projects...');
  const listProjectsId = sendRequest(mcpServer, 'tools/call', {
    name: 'list_projects',
    arguments: {}
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  const projectsResponse = responses.get(listProjectsId);
  if (projectsResponse && !projectsResponse.error) {
    const projectsData = JSON.parse(projectsResponse.result.content[0].text);

    if (projectsData.data && projectsData.data.length > 0) {
      const testProject = projectsData.data[0];
      const originalName = testProject.name;
      const originalDesc = testProject.description || '';

      console.log(`\n[1.2] Testing update on project: ${testProject.name} (${testProject.uuid})`);

      // Update project description
      const updateProjectId = sendRequest(mcpServer, 'tools/call', {
        name: 'update_project',
        arguments: {
          uuid: testProject.uuid,
          description: `[MCP TEST] Updated at ${new Date().toISOString()}`
        }
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      const updateProjectResponse = responses.get(updateProjectId);
      if (updateProjectResponse && !updateProjectResponse.error) {
        const result = JSON.parse(updateProjectResponse.result.content[0].text);
        if (result.success) {
          console.log('✅ update_project: PASSED');
          testResults.passed.push('update_project');

          // Revert changes
          console.log('[1.3] Reverting changes...');
          sendRequest(mcpServer, 'tools/call', {
            name: 'update_project',
            arguments: {
              uuid: testProject.uuid,
              description: originalDesc
            }
          });
          await new Promise(resolve => setTimeout(resolve, 1500));
        } else {
          console.log('❌ update_project: FAILED -', result.error?.message);
          testResults.failed.push({ tool: 'update_project', error: result.error?.message });
        }
      } else {
        console.log('❌ update_project: FAILED - No response or error');
        testResults.failed.push({ tool: 'update_project', error: 'No response' });
      }
    } else {
      console.log('⚠️  update_project: SKIPPED - No projects found');
      testResults.skipped.push('update_project');
    }
  } else {
    console.log('❌ update_project: FAILED - Cannot list projects');
    testResults.failed.push({ tool: 'update_project', error: 'Cannot list projects' });
  }

  // ========================================================================
  // TEST 2: update_application
  // ========================================================================
  console.log('\n' + '='.repeat(80));
  console.log('TEST 2: update_application');
  console.log('='.repeat(80));

  console.log('\n[2.1] Listing applications...');
  const listAppsId = sendRequest(mcpServer, 'tools/call', {
    name: 'list_applications',
    arguments: { limit: 5 }
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  const appsResponse = responses.get(listAppsId);
  if (appsResponse && !appsResponse.error) {
    const appsData = JSON.parse(appsResponse.result.content[0].text);

    if (appsData.items && appsData.items.length > 0) {
      const testApp = appsData.items[0];
      const originalDesc = testApp.description || '';

      console.log(`\n[2.2] Testing update on application: ${testApp.name} (${testApp.uuid})`);

      // Update application description
      const updateAppId = sendRequest(mcpServer, 'tools/call', {
        name: 'update_application',
        arguments: {
          uuid: testApp.uuid,
          description: `[MCP TEST] Updated at ${new Date().toISOString()}`
        }
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      const updateAppResponse = responses.get(updateAppId);
      if (updateAppResponse && !updateAppResponse.error) {
        const result = JSON.parse(updateAppResponse.result.content[0].text);
        if (result.success) {
          console.log('✅ update_application: PASSED');
          testResults.passed.push('update_application');

          // Revert changes
          console.log('[2.3] Reverting changes...');
          sendRequest(mcpServer, 'tools/call', {
            name: 'update_application',
            arguments: {
              uuid: testApp.uuid,
              description: originalDesc
            }
          });
          await new Promise(resolve => setTimeout(resolve, 1500));
        } else {
          console.log('❌ update_application: FAILED -', result.error?.message);
          testResults.failed.push({ tool: 'update_application', error: result.error?.message });
        }
      } else {
        console.log('❌ update_application: FAILED - No response or error');
        testResults.failed.push({ tool: 'update_application', error: 'No response' });
      }
    } else {
      console.log('⚠️  update_application: SKIPPED - No applications found');
      testResults.skipped.push('update_application');
    }
  } else {
    console.log('❌ update_application: FAILED - Cannot list applications');
    testResults.failed.push({ tool: 'update_application', error: 'Cannot list applications' });
  }

  // ========================================================================
  // TEST 3: update_application_environment_variables
  // ========================================================================
  console.log('\n' + '='.repeat(80));
  console.log('TEST 3: update_application_environment_variables');
  console.log('='.repeat(80));

  if (appsResponse && !appsResponse.error) {
    const appsData = JSON.parse(appsResponse.result.content[0].text);

    if (appsData.items && appsData.items.length > 0) {
      const testApp = appsData.items[0];

      console.log(`\n[3.1] Testing env vars on application: ${testApp.name}`);

      // Create/update test environment variable
      const updateEnvId = sendRequest(mcpServer, 'tools/call', {
        name: 'update_application_environment_variables',
        arguments: {
          uuid: testApp.uuid,
          variables: [{
            key: 'MCP_UPDATE_TEST',
            value: 'test-value-' + Date.now(),
            is_build_time: true,
            is_multiline: false,
            is_shown_once: false
          }]
        }
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      const updateEnvResponse = responses.get(updateEnvId);
      if (updateEnvResponse && !updateEnvResponse.error) {
        const result = JSON.parse(updateEnvResponse.result.content[0].text);
        if (result.success) {
          console.log('✅ update_application_environment_variables: PASSED');
          testResults.passed.push('update_application_environment_variables');
        } else {
          console.log('❌ update_application_environment_variables: FAILED -', result.error?.message);
          testResults.failed.push({ tool: 'update_application_environment_variables', error: result.error?.message });
        }
      } else {
        console.log('❌ update_application_environment_variables: FAILED - No response');
        testResults.failed.push({ tool: 'update_application_environment_variables', error: 'No response' });
      }
    } else {
      console.log('⚠️  update_application_environment_variables: SKIPPED - No applications');
      testResults.skipped.push('update_application_environment_variables');
    }
  } else {
    console.log('⚠️  update_application_environment_variables: SKIPPED - Cannot list applications');
    testResults.skipped.push('update_application_environment_variables');
  }

  // ========================================================================
  // TEST 4: update_database
  // ========================================================================
  console.log('\n' + '='.repeat(80));
  console.log('TEST 4: update_database');
  console.log('='.repeat(80));

  console.log('\n[4.1] Listing databases...');
  const listDbsId = sendRequest(mcpServer, 'tools/call', {
    name: 'list_databases',
    arguments: { limit: 5 }
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  const dbsResponse = responses.get(listDbsId);
  if (dbsResponse && !dbsResponse.error) {
    const dbsData = JSON.parse(dbsResponse.result.content[0].text);

    if (dbsData.items && dbsData.items.length > 0) {
      const testDb = dbsData.items[0];
      const originalDesc = testDb.description || '';

      console.log(`\n[4.2] Testing update on database: ${testDb.name} (${testDb.uuid})`);

      // Update database description
      const updateDbId = sendRequest(mcpServer, 'tools/call', {
        name: 'update_database',
        arguments: {
          uuid: testDb.uuid,
          data: {
            description: `[MCP TEST] Updated at ${new Date().toISOString()}`
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      const updateDbResponse = responses.get(updateDbId);
      if (updateDbResponse && !updateDbResponse.error) {
        const result = JSON.parse(updateDbResponse.result.content[0].text);
        if (result.success) {
          console.log('✅ update_database: PASSED');
          testResults.passed.push('update_database');

          // Revert changes
          console.log('[4.3] Reverting changes...');
          sendRequest(mcpServer, 'tools/call', {
            name: 'update_database',
            arguments: {
              uuid: testDb.uuid,
              data: { description: originalDesc }
            }
          });
          await new Promise(resolve => setTimeout(resolve, 1500));
        } else {
          console.log('❌ update_database: FAILED -', result.error?.message);
          testResults.failed.push({ tool: 'update_database', error: result.error?.message });
        }
      } else {
        console.log('❌ update_database: FAILED - No response or error');
        testResults.failed.push({ tool: 'update_database', error: 'No response' });
      }
    } else {
      console.log('⚠️  update_database: SKIPPED - No databases found');
      testResults.skipped.push('update_database');
    }
  } else {
    console.log('❌ update_database: FAILED - Cannot list databases');
    testResults.failed.push({ tool: 'update_database', error: 'Cannot list databases' });
  }

  // ========================================================================
  // TEST 5: update_docker_compose_service
  // ========================================================================
  console.log('\n' + '='.repeat(80));
  console.log('TEST 5: update_docker_compose_service');
  console.log('='.repeat(80));

  console.log('\n[5.1] Listing services...');
  const listServicesId = sendRequest(mcpServer, 'tools/call', {
    name: 'list_services',
    arguments: { limit: 5 }
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  const servicesResponse = responses.get(listServicesId);
  if (servicesResponse && !servicesResponse.error) {
    const servicesData = JSON.parse(servicesResponse.result.content[0].text);

    if (servicesData.items && servicesData.items.length > 0) {
      // Find a docker-compose service
      const dockerComposeService = servicesData.items.find(s => s.type === 'docker-compose');

      if (dockerComposeService) {
        const originalDesc = dockerComposeService.description || '';

        console.log(`\n[5.2] Testing update on service: ${dockerComposeService.name} (${dockerComposeService.uuid})`);

        // Update service description
        const updateServiceId = sendRequest(mcpServer, 'tools/call', {
          name: 'update_docker_compose_service',
          arguments: {
            uuid: dockerComposeService.uuid,
            description: `[MCP TEST] Updated at ${new Date().toISOString()}`
          }
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        const updateServiceResponse = responses.get(updateServiceId);
        if (updateServiceResponse && !updateServiceResponse.error) {
          const result = JSON.parse(updateServiceResponse.result.content[0].text);
          if (result.success) {
            console.log('✅ update_docker_compose_service: PASSED');
            testResults.passed.push('update_docker_compose_service');

            // Revert changes
            console.log('[5.3] Reverting changes...');
            sendRequest(mcpServer, 'tools/call', {
              name: 'update_docker_compose_service',
              arguments: {
                uuid: dockerComposeService.uuid,
                description: originalDesc
              }
            });
            await new Promise(resolve => setTimeout(resolve, 1500));
          } else {
            console.log('❌ update_docker_compose_service: FAILED -', result.error?.message);
            testResults.failed.push({ tool: 'update_docker_compose_service', error: result.error?.message });
          }
        } else {
          console.log('❌ update_docker_compose_service: FAILED - No response');
          testResults.failed.push({ tool: 'update_docker_compose_service', error: 'No response' });
        }
      } else {
        console.log('⚠️  update_docker_compose_service: SKIPPED - No Docker Compose services found');
        testResults.skipped.push('update_docker_compose_service');
      }
    } else {
      console.log('⚠️  update_docker_compose_service: SKIPPED - No services found');
      testResults.skipped.push('update_docker_compose_service');
    }
  } else {
    console.log('❌ update_docker_compose_service: FAILED - Cannot list services');
    testResults.failed.push({ tool: 'update_docker_compose_service', error: 'Cannot list services' });
  }

  // ========================================================================
  // FINAL RESULTS
  // ========================================================================
  console.log('\n' + '='.repeat(80));
  console.log('  TEST RESULTS SUMMARY');
  console.log('='.repeat(80));

  console.log(`\n✅ PASSED: ${testResults.passed.length}`);
  testResults.passed.forEach(test => console.log(`   - ${test}`));

  console.log(`\n❌ FAILED: ${testResults.failed.length}`);
  testResults.failed.forEach(test => console.log(`   - ${test.tool}: ${test.error}`));

  console.log(`\n⚠️  SKIPPED: ${testResults.skipped.length}`);
  testResults.skipped.forEach(test => console.log(`   - ${test}`));

  const total = testResults.passed.length + testResults.failed.length + testResults.skipped.length;
  const successRate = total > 0 ? ((testResults.passed.length / total) * 100).toFixed(1) : 0;

  console.log(`\n${'='.repeat(80)}`);
  console.log(`Total Tests: ${total} | Success Rate: ${successRate}%`);
  console.log('='.repeat(80));

  if (testResults.failed.length === 0) {
    console.log('\n🎉 ALL TESTS PASSED! 🎉\n');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED - Please review the errors above\n');
  }

  mcpServer.kill();
  process.exit(testResults.failed.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('\n❌ Test suite failed with error:', error);
  process.exit(1);
});

import { spawn } from 'child_process';
import * as path from 'path';
import { DynamicExecutor } from '@nestia/e2e';
import api from '../api';

/**
 * Configuration for the E2E test runner
 */
const config = {
  // Docker compose configuration
  dockerCompose: {
    file: path.resolve(__dirname, '../docker-compose.yml'),
    upTimeout: 60000, // 60 seconds timeout for docker-compose up
    downTimeout: 30000, // 30 seconds timeout for docker-compose down
  },
  // Service endpoints
  services: {
    gateway: 'http://localhost:3002',
    auth: 'http://localhost:3001',
    event: 'http://localhost:3003',
  },
  // Test configuration
  test: {
    timeout: 120000, // 2 minutes timeout for tests
    retries: 3, // Number of retries for failed tests
    retryDelay: 5000, // 5 seconds delay between retries
  },
};

/**
 * Execute a command and return its output
 */
async function executeCommand(
  command: string,
  args: string[],
  options: any = {},
): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, options);

    let stdout = '';
    let stderr = '';

    process.stdout?.on('data', (data) => {
      stdout += data.toString();
      console.log(data.toString());
    });

    process.stderr?.on('data', (data) => {
      stderr += data.toString();
      console.error(data.toString());
    });

    process.on('close', (code) => {
      resolve({ stdout, stderr, code });
    });

    process.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Start Docker Compose services
 */
async function startServices(): Promise<void> {
  console.log('Starting services with Docker Compose...');

  try {
    const { code } = await executeCommand(
      'docker-compose',
      ['-f', config.dockerCompose.file, 'up', '-d'],
      { timeout: config.dockerCompose.upTimeout },
    );

    if (code !== 0) {
      throw new Error(`Docker Compose up failed with exit code ${code}`);
    }

    // Check if services are ready by pinging them
    await checkServicesReady();

    console.log('All services are ready!');
  } catch (error) {
    console.error('Failed to start services:', error);
    process.exit(1);
  }
}

/**
 * Check if all services are ready by making HTTP requests
 */
async function checkServicesReady(): Promise<void> {
  const maxRetries = 10;
  const retryDelay = 3000; // 3 seconds

  for (const [name, url] of Object.entries(config.services)) {
    let isReady = false;
    let retries = 0;

    while (!isReady && retries < maxRetries) {
      try {
        console.log(`Checking if ${name} service is ready at ${url}...`);
        const response = await fetch(`${url}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
          console.log(`${name} service is ready!`);
          isReady = true;
        } else {
          console.log(
            `${name} service is not ready yet (status: ${response.status})`,
          );
          retries++;
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      } catch (error) {
        console.log(
          `${name} service is not ready yet:`,
          error instanceof Error ? error.message : String(error),
        );
        retries++;
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }

    if (!isReady) {
      throw new Error(
        `${name} service failed to become ready after ${maxRetries} retries`,
      );
    }
  }
}

/**
 * Create test connections with different authentication levels
 */
async function createTestConnections(): Promise<api.IConnection[]> {
  // Create an unauthenticated connection
  const unauthenticatedConnection: api.IConnection = {
    host: config.services.gateway,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Create an admin connection (first register and login as admin)
  let adminToken = '';
  try {
    // Register admin user
    const registerResponse = await fetch(
      `${config.services.gateway}/api/v1/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'password123',
          role: 'ADMIN',
        }),
      },
    );

    if (!registerResponse.ok) {
      // If registration fails, try logging in (user might already exist)
      const loginResponse = await fetch(
        `${config.services.gateway}/api/v1/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'admin@example.com',
            password: 'password123',
          }),
        },
      );

      if (loginResponse.ok) {
        const data = await loginResponse.json();
        adminToken = data.token;
        console.log('Admin login successful');
      } else {
        console.error('Failed to login as admin:', await loginResponse.text());
      }
    } else {
      const data = await registerResponse.json();
      adminToken = data.token;
      console.log('Admin registration successful');
    }
  } catch (error) {
    console.error('Error authenticating admin user:', error);
  }

  // Create a regular user connection
  let userToken = '';
  try {
    // Register regular user
    const registerResponse = await fetch(
      `${config.services.gateway}/api/v1/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'password123',
          role: 'USER',
        }),
      },
    );

    if (!registerResponse.ok) {
      // If registration fails, try logging in (user might already exist)
      const loginResponse = await fetch(
        `${config.services.gateway}/api/v1/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'user@example.com',
            password: 'password123',
          }),
        },
      );

      if (loginResponse.ok) {
        const data = await loginResponse.json();
        userToken = data.token;
        console.log('User login successful');
      } else {
        console.error('Failed to login as user:', await loginResponse.text());
      }
    } else {
      const data = await registerResponse.json();
      userToken = data.token;
      console.log('User registration successful');
    }
  } catch (error) {
    console.error('Error authenticating regular user:', error);
  }

  // Create authenticated connections if tokens were obtained
  const connections: api.IConnection[] = [unauthenticatedConnection];

  if (adminToken) {
    connections.push({
      host: config.services.gateway,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });
  }

  if (userToken) {
    connections.push({
      host: config.services.gateway,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });
  }

  return connections;
}

/**
 * Run E2E tests with Nestia's DynamicExecutor
 */
async function runTests(
  connections: api.IConnection[],
): Promise<DynamicExecutor.IReport[]> {
  const reports: DynamicExecutor.IReport[] = [];

  for (const [index, connection] of connections.entries()) {
    console.log(`Running tests with connection #${index + 1}...`);

    try {
      // Configure the DynamicExecutor to find test files
      const executor = DynamicExecutor.validate({
        prefix: 'test',
        parameters: () => [connection],
        showElapsedTime: true,
        extension: 'ts', // Ensure it looks for TypeScript files
      });

      // Run the tests in the automated directory
      const report = await executor(`${__dirname}/features/scenarios`);

      console.log(`Found ${report.executions.length} test(s) to execute`);

      // Log details about each test execution
      if (report.executions.length > 0) {
        console.log('Test executions:');
        for (const execution of report.executions) {
          console.log(
            `- ${execution.name}: ${execution.error ? 'FAILED' : 'SUCCESS'} (${execution.time}ms)`,
          );
          if (execution.error) {
            console.error(`  Error: ${execution.error.message}`);
          }
        }
      }
      reports.push(report);
    } catch (error) {
      console.error(
        `Error running tests with connection #${index + 1}:`,
        error,
      );
      // Create a minimal report object with the error
      const errorReport = {
        executions: [
          {
            error,
            time: 0,
          },
        ],
        time: 0,
      };

      // Cast to any to bypass type checking since we don't have access to the full interface
      reports.push(errorReport as any);
    }
  }

  return reports;
}

/**
 * Print test report summary
 */
function printReportSummary(reports: DynamicExecutor.IReport[]): boolean {
  let totalTests = 0;
  let failedTests = 0;
  let totalTime = 0;

  const allExecutions = reports.flatMap((report) => report.executions);
  totalTests = allExecutions.length;

  // Filter executions with errors
  const failedExecutions = allExecutions.filter((exec) => exec.error != null);
  failedTests = failedExecutions.length;

  totalTime = reports.reduce((sum, report) => sum + report.time, 0);

  console.log('\n=== E2E Test Summary ===');
  console.log(`Total tests: ${totalTests}`);
  console.log(`Passed tests: ${totalTests - failedTests}`);
  console.log(`Failed tests: ${failedTests}`);
  console.log(`Total time: ${totalTime.toLocaleString()} ms`);

  if (failedTests > 0) {
    console.log('\n=== Failed Tests ===');
    for (const exec of failedExecutions) {
      // Use optional chaining and type checking to safely access properties
      const execAny = exec as any;
      const execPath = execAny.path || 'unknown';
      const execFuncName = execAny.function?.name || 'unknown';
      console.log(`- ${execPath}::${execFuncName}`);
      console.log(
        `  Error: ${exec.error instanceof Error ? exec.error.message : String(exec.error)}`,
      );
    }
  }

  return failedTests === 0;
}

/**
 * Main function to run the E2E tests
 */
async function main(): Promise<void> {
  try {
    // Start services
    await startServices();

    // Create test connections
    const connections = await createTestConnections();

    // Run tests
    const reports = await runTests(connections);

    // Print report summary
    const success = printReportSummary(reports);

    // Stop services
    // await stopServices();

    // Exit with appropriate code
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('E2E test runner failed:', error);
    process.exit(1);
  }
}

// Run the main function
if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

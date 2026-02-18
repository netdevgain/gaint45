import { spawn } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit'
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code ?? 1}`));
    });
  });
}

function runServer() {
  const server = spawn('node', ['dist/src/main.js'], {
    stdio: 'inherit'
  });

  const forwardSignal = (signal) => {
    if (!server.killed) {
      server.kill(signal);
    }
  };

  process.on('SIGINT', () => forwardSignal('SIGINT'));
  process.on('SIGTERM', () => forwardSignal('SIGTERM'));

  server.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });

  server.on('error', (error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to start backend process', error);
    process.exit(1);
  });
}

async function bootstrap() {
  // eslint-disable-next-line no-console
  console.log('Running Prisma migrations...');
  await run(npmCommand, ['run', 'prisma:migrate:deploy']);

  const shouldSeed = (process.env.SEED_ON_DEPLOY ?? 'false').toLowerCase() === 'true';
  if (shouldSeed) {
    // eslint-disable-next-line no-console
    console.log('SEED_ON_DEPLOY=true detected. Running seed...');
    await run(npmCommand, ['run', 'prisma:seed']);
  }

  // eslint-disable-next-line no-console
  console.log('Starting NestJS API...');
  runServer();
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Production bootstrap failed', error);
  process.exit(1);
});

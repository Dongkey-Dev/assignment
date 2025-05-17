import cp from 'child_process';
import express from 'express';

const execute = (command: string): void => {
  console.log(`\n$ ${command}\n`);
  cp.execSync(command, { stdio: 'inherit' });
};

const main = async (): Promise<void> => {
  if (!process.argv.some((str) => str === '--skipBuild'))
    execute('npm run build:swagger');

  const docs = await import('../swagger.json' as any);
  const app = express();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const swaggerUi = require('swagger-ui-express');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(docs));
  app.listen(37812);

  console.log('\n');
  console.log('-----------------------------------------------------------');
  console.log('\n Swagger UI Address: http://127.0.0.1:37812/api-docs \n');
  console.log('-----------------------------------------------------------');
};
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});

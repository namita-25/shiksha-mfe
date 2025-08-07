module.exports = {
  apps: [
    {
      name: 'admin-app-repo',
      script: 'node_modules/.bin/next',
      args: 'start -p 3002',
      cwd: 'apps/admin-app-repo',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'workspace',
      script: 'node_modules/.bin/next',
      args: 'start -p 4104',
      cwd: 'mfes/workspace',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'players',
      script: 'node_modules/.bin/next',
      args: 'start -p 4106',
      cwd: 'mfes/players',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};

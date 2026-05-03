module.exports = {
  apps: [
    {
      name: 'ahmed-md-backend',
      script: './backend/server.js',
      env: {
        PORT: 3001,
        NODE_ENV: 'production',
      },
    },
    {
      name: 'ahmed-md-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
      },
    },
  ],
};

/**
 * PM2 Ecosystem Config — crm-api (NestJS)
 * Deploy: pm2 start ecosystem.config.js
 * Reload:  pm2 reload crm-api
 * Logs:    pm2 logs crm-api
 */
module.exports = {
  apps: [
    {
      name: 'crm-api',
      script: 'dist/main.js',
      cwd: '/var/www/crm-api',

      // Instances & clustering
      instances: 1,
      exec_mode: 'fork',

      // Auto-restart on crash
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,

      // Memory management
      max_memory_restart: '512M',

      // Environment — production
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002,
      },

      // Logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file: '/var/log/pm2/crm-api-out.log',
      error_file: '/var/log/pm2/crm-api-err.log',
      merge_logs: true,
    },
  ],
};

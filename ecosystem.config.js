module.exports = {
	/**
	 * Application configuration section
	 * http://pm2.keymetrics.io/docs/usage/application-declaration/
	 */
	apps : [

		{
			name      : 'DASHBOARD',
			script    : 'src/dashboard/src/index.js',
			env: {
				NODE_ENV: 'development'
			},
			env_production : {
				NODE_ENV: 'production'
			}
		},

		{
			name      : 'TMS_TO_CSV',
			script    : 'src/tms_csv/src/service/tmstocsv-pin-service.js',
			env: {
				NODE_ENV: 'development'
			},
			env_production : {
				NODE_ENV: 'production'
			}
		},

		{
			name      : 'CSV_LIST',
			script    : 'src/csv_viewer/src/csv-pin-service.js',
			env: {
				NODE_ENV: 'development'
			},
			env_production : {
				NODE_ENV: 'production'
			}
		},

		{
			name      : 'CSV_ES',
			script    : 'src/csv_es/src/service/es-pin-service.js',
			env: {
				NODE_ENV: 'development'
			},
			env_production : {
				NODE_ENV: 'production'
			}
		},

		{
			name      : 'IMAGE_PROCESSING',
			script    : 'src/image-processing/src/service/images-pin-service.js',
			env: {
				NODE_ENV: 'development'
			},
			env_production : {
				NODE_ENV: 'production'
			}
		},
	],

	/**
	 * Deployment section
	 * http://pm2.keymetrics.io/docs/usage/deployment/
	 */
	deploy : {
		production : {
			user : 'node',
			host : '192.168.33.10',
			ref  : 'origin/master',
			repo : 'git@github.com:repo.git',
			path : '/var/www/production',
			'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
		},
		development : {
			user : 'node',
			host : '192.168.33.10',
			ref  : 'origin/master',
			repo : 'git@github.com:repo.git',
			path : '/var/www/development',
			'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env development',
			env  : {
				NODE_ENV: 'development'
			}
		}
	}
};

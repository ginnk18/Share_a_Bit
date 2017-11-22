// Update with your config settings.
  
const sharedConfig = {
  client: 'postgresql',
  migrations: {
    tableName: 'knex_migrations',
    directory: './db/migrations'
  }
}

module.exports = {

  development: {
    ...sharedConfig,
    connection: {
      database: 'share-a-bit_dev'
    }
  },

  staging: {
    ...sharedConfig,
    connection: {
      database: 'share-a-bit_dev'
    }
  },

  production: {
    ...sharedConfig,
    connection: {
      database: 'share-a-bit_dev'
    }
  }

};



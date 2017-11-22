
exports.up = function(knex, Promise) {
  return knex.schema.createTable('transactions', table => {
  	table.increments('id')
  	table.string('stripe_transaction').notNullable()
  	table.integer('donorId').references('donors.id').notNullable()
  	table.integer('organizationId').references('organizations.id').notNullable()
  	table.timestamp('purchase_time').notNullable().defaultTo(knex.raw('now()'))
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('transactions')
};
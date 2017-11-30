
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('transactions', table => {
  	table.dropColumn('stripe_transaction')
  	table.dropColumn('purchase_time')
  	table.timestamps(false, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('transactions', table => {
  	table.string('stripe_transaction')
  	table.timestamp('purchase_time').notNullable().defaultTo(knex.raw('now()'))
  })
};

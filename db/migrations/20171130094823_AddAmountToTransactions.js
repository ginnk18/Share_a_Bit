
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('transactions', table => {
  	table.integer('amount').notNullable()
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('transactions', table => {
  	table.dropColumn('amount')
  })
};

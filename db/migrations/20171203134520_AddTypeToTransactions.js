
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('transactions', table => {
  	table.string('type').notNullable().defaultTo('credits')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('transactions', table => {
  	table.dropColumn('type')
  })
};



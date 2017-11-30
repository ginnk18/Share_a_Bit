
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('campaigns', table => {
  	table.integer('credits').defaultTo(0)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('campaigns', table => {
  	table.dropColumn('credits')
  })
};


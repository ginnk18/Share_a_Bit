
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('organizations', table => {
  	table.integer('bitcredits').defaultTo(0)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('organizations', table => {
  	table.dropColumn('bitcredits')
  })
};

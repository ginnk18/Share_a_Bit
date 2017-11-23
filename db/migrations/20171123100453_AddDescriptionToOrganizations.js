
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('organizations', table => {
  	table.text('description')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('organizations', table => {
  	table.dropColumn('description')
  })
};
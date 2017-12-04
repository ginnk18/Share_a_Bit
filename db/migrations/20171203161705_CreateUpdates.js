
exports.up = function(knex, Promise) {
  return knex.schema.createTable('updates', table => {
  	table.increments('id')
  	table.string('title')
  	table.text('overview')
  	table.integer('organizationId').references('organizations.id').onDelete('SET NULL')
  	table.timestamps(false, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('updates')
};
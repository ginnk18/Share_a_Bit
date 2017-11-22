
exports.up = function(knex, Promise) {
  return knex.schema.createTable('campaigns', table => {
  	table.increments('id')
  	table.string('name')
  	table.text('description')
  	table.date('endDate')
  	table.integer('organizationId').references('organizations.id').onDelete('CASCADE')
  	table.timestamps(false, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('campaigns')
};

exports.up = function(knex, Promise) {
  return knex.schema.createTable('budgetUpdates', table => {
  	table.increments('id')
  	table.string('title')
  	table.text('overview')
  	table.integer('organizationId').references('organizations.id').onDelete('CASCADE')
  	table.timestamps(false, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('budgetUpdates')
};



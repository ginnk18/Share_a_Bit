
exports.up = function(knex, Promise) {
  return knex.schema.createTable('budgetUpdates', table => {
  	table.increments('id')
  	table.string('title')
  	table.text('overview')
  	table.integer('userId').references('users.id').onDelete('CASCADE') // only organizations
  	table.timestamps(false, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('budgetUpdates')
};



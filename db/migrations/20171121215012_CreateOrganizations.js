
exports.up = function(knex, Promise) {
  return knex.schema.createTable('organizations', table => {
  	table.increments('id')
  	table.string('name')
  	table.integer('userId').references('users.id').onDelete('CASCADE')
  	table.timestamps(false, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('organizations')
};
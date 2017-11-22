
exports.up = function(knex, Promise) {
  return knex.schema.createTable('donors', table => {
  	table.increments('id')
  	table.string('firstName')
  	table.string('lastName')
  	table.integer('userId').references('users.id').onDelete('CASCADE')
  	table.timestamps(false, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('donors')
};

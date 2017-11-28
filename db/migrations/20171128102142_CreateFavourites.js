
exports.up = function(knex, Promise) {
  return knex.schema.createTable('favourites', table => {
  	table.increments('id')
  	table.integer('organizationId').references('organizations.id').onDelete('CASCADE')
  	table.integer('donorId').references('donors.id').onDelete('CASCADE')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('favourites')
};



exports.up = function(knex, Promise) {
  return knex.schema.createTable('causes', table => {
  	table.increments('id')
  	table.integer('topicId').references('topics.id').onDelete('CASCADE')
  	table.integer('organizationId').references('organizations.id').onDelete('CASCADE')
  	table.timestamps(false, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('causes')
};
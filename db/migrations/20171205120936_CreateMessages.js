
exports.up = function(knex, Promise) {
  return knex.schema.createTable('messages', table => {
  	table.increments('id')
  	table.string('subject')
  	table.text('body')
  	table.integer('donorId').references('donors.id').onDelete('SET NULL')
  	table.integer('organizationId').references('organizations.id').onDelete('SET NULL')
  	table.timestamps(false, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('messages')
};
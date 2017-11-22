
exports.up = function(knex, Promise) {
  return knex.schema.createTable('interests', table => {
  	table.increments('id')
  	table.integer('topicId').references('topics.id').onDelete('CASCADE')
  	table.integer('donorId').references('donors.id').onDelete('CASCADE')
  	table.timestamps(false, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('interests')
};




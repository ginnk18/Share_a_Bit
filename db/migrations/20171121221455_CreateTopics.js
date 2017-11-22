
exports.up = function(knex, Promise) {
  return knex.schema.createTable('topics', table => {
  	table.increments('id')
  	table.string('name')
  	table.timestamps(false, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('topics')
};

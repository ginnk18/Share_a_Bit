const bcrypt = require('bcrypt')
const faker = require('faker')

exports.seed = async function(knex, Promise) {
  await knex('users').del()
  await knex('organizations').del()
  await knex('donors').del()
  await knex('campaigns').del()

  const passwordDigest = await bcrypt.hash('supersecret', 10)

  const mainUserId = await knex('users').returning('id').insert(
            [{
              email: 'gk@example.com',
              passwordDigest: passwordDigest,
              type: 'donor'
            }]
          )

  await knex('donors').insert(
      [{
        firstName: 'Ginny',
        lastName: 'Kloos',
        userId: mainUserId[0]
      }]
    )

  const donoruserIds = await knex('users').returning('id').insert(
    [...Array(9)].map(n => 
      ({
          email: faker.internet.email(),
          passwordDigest: passwordDigest,
          type: 'donor'
      })

    )
  )

  let organizationuserIds = await knex('users').returning('id').insert(
    [...Array(10)].map(n => 
      ({
          email: faker.internet.email(),
          passwordDigest: passwordDigest,
          type: 'organization'
      })

    )
  )

  await knex('donors').insert(
    [...Array(9)].map(n => 
      ({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        userId: donoruserIds.pop()
      })
    )
  )

  await knex('organizations').insert(
    [...Array(10)].map(n => 
      ({
        name: faker.company.companyName(),
        description: faker.lorem.paragraphs(),
        userId: organizationuserIds.pop()
      })
    )
  )

  organizationuserIds = await knex.select('id').from('organizations')

  await knex('campaigns').insert(
    [...Array(20)].map(n => 
      ({
        name: faker.lorem.sentence(),
        description: faker.lorem.paragraphs(),
        endDate: faker.date.between('2018-01-01', '2019-01-01'),
        organizationId: organizationuserIds[Math.floor(Math.random()* organizationuserIds.length)].id
      })
    )
  )

}; // end of seeds
const statusCodes = require('../../../lib/httpStatusCodes')
const httpErrorMessages = require('../../../lib/httpErrorMessages')
const { database } = require('../../../lib/database')
const moment = require('moment')

module.exports = (api) => {
  /**
   * POST /v1/people
   * Create a new person
   */
  api.post('/', async (req, res, next) => {
    const person = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      birthday: req.body.birthday,
      company: req.body.company,
      title: req.body.title
    }
    const personID  = await database('people').insert(person, ['id'])
    person.id = personID[0].id
    res
      .status(statusCodes.OK)
      .json(person)
  })

  /**
   * GET /v1/people/:personID
   * Retrieve a person by their ID
   */
  api.get('/:personID', async (req, res) => {
    const result = await database('people').select('id', 'first_name', 'last_name', 'company', 'title', 'birthday').where({id: req.params.personID})
    const person = result[0]
    try {
      person.birthday = moment(person.birthday).format('YYYY-MM-DD')
      res
        .status(statusCodes.OK)
        .json(person)
    } catch(err) {
      res
        .status(statusCodes.NotFound)
        .json(err)
    }
  })

  /**
   * GET /v1/people
   * Retrieve a list of people
   */
  api.get('/', async (req, res) => {
    const result = await database('people').select()
    res
      .status(statusCodes.OK)
      .json(result)
  })

  /**
   * Do not modify beyond this point until you have reached
   * TDD / BDD Mocha.js / Chai.js
   * ======================================================
   * ======================================================
   */

  /**
   * POST /v1/people/:personID/addresses
   * Create a new address belonging to a person
   **/
  api.post('/:personID/addresses', async (req, res) => {
    const address = {
      line1: req.body.line1,
      line2: req.body.line2,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      person_id: req.params.personID
    }
    try {
      const addressID  = await database('addresses').insert(address, ['id'])
      address.id = addressID[0].id
      res
        .status(statusCodes.OK)
        .json(address)
    } catch(err) {
      res 
        .status(statusCodes.BadRequest)
        .json(err)
    }
  })

  /**
   * GET /v1/people/:personID/addresses/:addressID
   * Retrieve an address by it's addressID and personID
   **/
  api.get('/:personID/addresses/:addressID', async (req, res) => {
      const result = await database('addresses').select('id', 'person_id', 'line1', 'line2', 'city', 'state', 'zip').where({id: req.params.addressID, person_id: req.params.personID, deleted_at: null})
      const address = result[0]
      if (!!address) {
      res
        .status(statusCodes.OK)
        .json(address)
      } else {
      res 
        .status(statusCodes.NotFound)
        .end()
      }
  })

  /**
   * GET /v1/people/:personID/addresses
   * List all addresses belonging to a personID
   **/
  api.get('/:personID/addresses', async (req, res) => {
    const results = await database('addresses').select().where({person_id: req.params.personID, deleted_at: null})
    res
      .status(statusCodes.OK)
      .json(results)
  })

  /**
   * BONUS!!!!
   * DELETE /v1/people/:personID/addresses/:addressID
   * Mark an address as deleted by it's personID and addressID
   * Set it's deleted_at timestamp
   * Update the previous GET endpoints to omit rows where deleted_at is not null
   **/
  api.delete('/:personID/addresses/:addressID', async (req, res) => {
    let address = await database('addresses').where({id: req.params.addressID, person_id: req.params.personID}).update({deleted_at: moment().toISOString()}, ['id', 'line1', 'line2', 'city', 'state', 'zip', 'deleted_at'])
    address = address[0]
    res
      .status(statusCodes.OK)
      .json(address)
  })
}

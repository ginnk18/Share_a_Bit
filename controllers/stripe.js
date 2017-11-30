const kx = require('../db/connection');
const stripe = require('stripe')(process.env.stripeSecretKey);

const StripeController = {
	async create (req, res, next) {
		const {currentDonor} = req;

		const charge = await stripe.charges.create({
									amount: 500,
									currency: 'usd',
									description: '$5 for 5 donation credits',
									source: req.body.id
								})

		const donor = await kx('donors')
								.increment('credits', 5)
								.where({id: currentDonor.id})
								.returning('*')

		const favouriteIds = await kx
									.select('organizationId')
									.from('favourites')
									.where({donorId: currentDonor.id})

		let favouriteOrgs = []
		for(let i=0; i<favouriteIds.length; i++) {
			let favourite = await kx
									.first()
									.from('organizations')
									.where({id: favouriteIds[i].organizationId})
			favouriteOrgs.push(favourite);
		}
		const data = {donor: donor, favouriteOrgs}
		res.json(data)
	}
}

module.exports = StripeController;
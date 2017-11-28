const kx = require('../db/connection')

const FavouritesController = {
	async create (req, res, next) {
		const {organizationId} = req.params
		const {currentDonor} = req;

		try {

			await kx 
					.insert({organizationId, donorId: currentDonor.id})
					.into('favourites')

			res.status(200).json({message: 'Created favourite!'})

		} catch(error) {
			next(error)
		}
	},

	destroy (req, res, next) {
		
	}

}

module.exports = FavouritesController;
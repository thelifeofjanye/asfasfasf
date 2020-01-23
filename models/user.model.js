const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema(
	{
		name: { type: String, required: true },
		picture: { type: String, required: true, unique: true },
		username: { type: String, required: true, unique: true },
		email: { type: String, required: true, unique: true },
		refresh_token: { type: String, required: true, unique: true }
	},
	{ timestamps: true }
)

const User = mongoose.model('User', userSchema)

module.exports = User

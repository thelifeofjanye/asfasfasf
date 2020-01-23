const router = require('express').Router()
const User = require('../models/user.model')
const { OAuth2Client } = require('google-auth-library')
const credential = require('../credentials')

const env = process.env.NODE_ENV || 'dev'
const { client_id, client_secret, redirect_uris, javascript_origins } = credential.web
const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[env === 'dev' ? 0 : 1])

router.route('/auth').get((req, res) => {
	const authorizeUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		prompt: 'consent',
		scope: ['profile', 'email', 'https://www.googleapis.com/auth/photoslibrary.readonly']
	})
	res.redirect(authorizeUrl)
})

router.route('/me').get((req, res) => {
	res.send('Jay')
})

router.route('/me').get((req, res) => {
	if (req.cookies.refresh_token === undefined) {
		res.json(404)
	} else {
		const refresh_token = req.cookies.refresh_token
		User.findOne({ refresh_token })
			.then(users => res.json(users === null ? 404 : users))
			.catch(err => res.status(400).json(err))
	}
})

const getTokens = async code => {
	try {
		const res = await oAuth2Client.getToken(code)
		return res.tokens
	} catch (err) {
		console.log(`error fetching token: ${err}`)
	}
}
const getUserInfo = async () => {
	try {
		const res = await oAuth2Client.request({ url: 'https://www.googleapis.com/oauth2/v1/userinfo' })
		return res.data
	} catch (err) {
		console.log(`error fetching userinfo: ${err}`)
	}
}

router.route('/create').get(async (req, res) => {
	try {
		const code = req.query.code
		const tokens = await getTokens(code)
		oAuth2Client.setCredentials(tokens)
		const user_info = await getUserInfo()
		const name = user_info.name
		const picture = user_info.picture
		const username = user_info.email.slice(0, user_info.email.indexOf('@'))
		const email = user_info.email
		let user = await User.findOne({ email })
		if (user === null) {
			try {
				const refresh_token = tokens.refresh_token
				res.cookie('refresh_token', refresh_token, { httpOnly: true })
				await new User({ name, picture, username, email, refresh_token }).save()
			} catch (err) {
				console.log(`error save user ${err}`)
			}
		} else {
			if (tokens.refresh_token !== undefined) {
				try {
					const refresh_token = tokens.refresh_token
					res.cookie('refresh_token', refresh_token, { httpOnly: true })
					await User.updateOne({ email }, { $set: { refresh_token } })
				} catch (err) {
					console.log(`error update user ${err}`)
				}
			}
		}
		res.send('success')
	} catch (err) {
		res.send(`create account failed: ${err}`)
	}
	// res.redirect(javascript_origins[env === 'dev' ? 0 : 1])
})

const getPhotos = async albumId => {
	try {
		const res = await oAuth2Client.request({
			url: 'https://photoslibrary.googleapis.com/v1/mediaItems:search?',
			method: 'POST',
			data: { pageSize: 100, albumId }
		})
		return res.data.mediaItems
	} catch (err) {
		console.log(`error fetching photos: ${err}`)
	}
}

const getAlbums = async () => {
	try {
		const res = await oAuth2Client.request({ url: 'https://photoslibrary.googleapis.com/v1/albums' })
		return res.data.albums
	} catch (err) {
		console.log(`error fetching albums ${err}`)
	}
}

router.route('/photos').post(async (req, res) => {
	const { username, albumId } = req.body
	let refresh_token = req.cookies.refresh_token
	if (username !== null) {
		const user = await User.findOne({ username })
		if (user === null) return res.send(`can't find such user`)
		else refresh_token = user.refresh_token
	}
	if (refresh_token === undefined) return res.send('not logged in')
	oAuth2Client.setCredentials({ refresh_token })
	const photos = await getPhotos(albumId)
	const allow_propoties = ['baseUrl', 'mediaMetadata', 'filename', 'description']
	photos.map(photo => {
		allowedPropoties(photo, allow_propoties)
	})
	res.send(photos)
})

router.route('/albums').post(async (req, res) => {
	const { username } = req.body
	let refresh_token = req.cookies.refresh_token
	if (username !== null) {
		const user = await User.findOne({ username })
		if (user === null) return res.send(`can't find such user`)
		else refresh_token = user.refresh_token
	}
	if (refresh_token === undefined) return res.send('not logged in')
	oAuth2Client.setCredentials({ refresh_token })
	const albums = await getAlbums()
	const allow_propoties = ['id', 'title']
	albums.map(album => {
		return allowedPropoties(album, allow_propoties)
	})
	let gallery = []
	albums.forEach(album => {
		const { id, title } = album
		const split_index = title.indexOf('/')
		if (split_index === -1) {
			gallery.push(album)
		} else {
			const album_title = title.slice(0, split_index)
			const sub_album_title = title.slice(split_index + 1, title.length)
			const exist_album = gallery.findIndex(album => album.title === album_title)
			if (exist_album === -1) {
				gallery = [...gallery, { title: album_title, subs: [{ id, title: sub_album_title }] }]
			} else {
				gallery[exist_album].subs.push({ id, title: sub_album_title })
			}
		}
	})
	return res.send(gallery)
})

const allowedPropoties = (object, allow_propoties) => {
	Object.keys(object)
		.filter(key => !allow_propoties.includes(key))
		.forEach(key => delete object[key])
}

const getUser = async username => {
	try {
		return await User.findOne({ username: 'thelifeofjanye' })
	} catch (err) {
		console.log(`error getting data from database: ${err}`)
	}
}

router.route('/find').post(async (req, res) => {
	const { username } = req.body
	const user = await getUser({ username })
	res.send(user)
})

router.route('/logout').get((req, res) => {
	res.clearCookie('refresh_token')
	res.redirect('/user/me')
})

module.exports = router

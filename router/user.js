const router = require('express').Router()
const User = require('../models/user.model')
const { OAuth2Client } = require('google-auth-library')
const credential = require('../credentials')

router.route('/name').get(async (req, res) => {
	const user = await User.findOne()
	res.send({ name: user.name })
})

router.post('/realname', async (req, res) => {
	res.send({ name: req.body.name })
})

// ! DELETE THIS IN PRODUCTION :)
router.route('/cookies').get((req, res) => {
	res.json(req.cookies)
})

// ! DELETE THIS IN PRODUCTION :)
router.route('/cookies/reset').get((req, res) => {
	res.clearCookie('refresh_token')
	res.json(req.cookies)
})

// ! DELETE THIS IN PRODUCTION :)
router.route('/data').get(async (req, res) => {
	// let user = await User.findOne({ email: 'email@email.com' })
	// return res.json({ user: user.email })
	var env = process.env.NODE_ENV || 'dev'

	return res.send(env)
})

router.route('/all').get((req, res) => {
	res.setHeader('Access-Control-Allow-Origin', req.headers.origin || req.headers.host)
	User.find()
		.then(users => res.json(users))
		.catch(err => res.status(400).json('*-*'))
})

router.route('/one').get(async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', req.headers.origin || req.headers.host)
	const username = req.body.username
	const user = await User.findOne({ username })
	res.json(user)
})

router.route('/me').get((req, res) => {
	res.setHeader('Access-Control-Allow-Origin', req.headers.origin || req.headers.host)
	res.setHeader('Access-Control-Allow-Credentials', true)
	if (req.cookies.refresh_token === undefined) {
		res.send('404')
	} else {
		const refresh_token = req.cookies.refresh_token
		User.findOne({ refresh_token })
			.then(users => res.json(users === null ? 404 : users))
			.catch(err => res.status(400).json(err))
	}
})

const { client_id, client_secret, redirect_uris } = credential.web
const env = process.env.NODE_ENV || 'dev'

const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[env === 'dev' ? 0 : 1])

router.route('/auth').get((req, res) => {
	const authorizeUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		prompt: 'consent',
		scope: ['profile', 'email', 'https://www.googleapis.com/auth/photoslibrary.readonly']
	})
	res.redirect(authorizeUrl)
})

const getRefreshToken = async code => {
	try {
		const res = await oAuth2Client.getToken(code)
		console.log(res.tokens)
		return res.tokens.refresh_token
	} catch (err) {
		console.log(`error fetching token: ${err}`)
	}
}
const getUserInfo = async () => {
	try {
		const res = await oAuth2Client.request({ url: 'https://www.googleapis.com/oauth2/v1/userinfo' })
		console.log(res.data)
		return res.data
	} catch (err) {
		console.log(`error fetching userinfo: ${err}`)
	}
}

router.route('/create').get(async (req, res) => {
	const code = req.query.code
	const refresh_token = await getRefreshToken(code)
	oAuth2Client.setCredentials({ refresh_token })
	const user_info = await getUserInfo()
	res.cookie('refresh_token', refresh_token, { httpOnly: true })
	res.send(user_info)
	// res.send(userinfo_res)
	// } catch (error) {
	// 	res.send({ send: 'ERROR userinfo', error })
	// }
	// console.log(`token response ${token_r}`)
	// const refresh_token = token_r.tokens.refresh_token
	// oAuth2Client.setCredentials({ refresh_token })
	// res.cookie('refresh_token', refresh_token, { httpOnly: true })
	// const userinfo_res = await oAuth2Client.request({ url: 'https://www.googleapis.com/oauth2/v1/userinfo' })
	// console.log(`user_res ${userinfo_res}`)
	// const userinfo = userinfo_res.data
	// const name = userinfo.name
	// const picture = userinfo.picture
	// const username = userinfo.email.slice(0, userinfo.email.indexOf('@'))
	// const email = userinfo.email
	// let user = await User.findOne({ email })
	// if (user !== null) await User.updateOne({ email }, { $set: { refresh_token } })
	// else {
	// try {
	// 	const root_drive_res = await oAuth2Client.request({
	// 		url: 'https://www.googleapis.com/drive/v3/files',
	// 		params: {
	// 			pageSize: 1,
	// 			q: `fullText contains '#photography-root' and trashed = false`,
	// 			fields: 'nextPageToken, files(id, name, mimeType)'
	// 		}
	// 	})
	// 	const drive = await getDriveFiles(root_drive_res.data.files)
	// 	await new User({ name, picture, username, email, refresh_token, drive: drive[0].files }).save()
	// } catch (err) {
	// 	res.send(err)
	// }
	// }
	// res.redirect('https://thelifeofjanye-testmernstack.herokuapp.com')
})

const getPhotos = async albumId => {
	try {
		const res = await oAuth2Client.request({
			url: 'https://photoslibrary.googleapis.com/v1/mediaItems:search?',
			method: 'POST',
			data: { pageSize: 100, albumId }
		})
		console.log(res.data.mediaItems)
		return res.data.mediaItems
	} catch (err) {
		console.log(`error fetching photos: ${err}`)
	}
}
const getCoverPhoto = async coverPhotoMediaItemId => {
	try {
		const res = await oAuth2Client.request({
			url: `https://photoslibrary.googleapis.com/v1/mediaItems/${coverPhotoMediaItemId}`
		})
		console.log(res.data)
		return res.data
	} catch (err) {
		console.log(`error fetching photo: ${err}`)
	}
}

const getAlbums = async () => {
	try {
		const res = await oAuth2Client.request({ url: 'https://photoslibrary.googleapis.com/v1/albums' })
		const albums = res.data.albums
		const promises = []
		albums.forEach(album => {
			promises.push(
				new Promise(async (resolve, reject) => {
					try {
						const photos = await getPhotos(album.id)
						const cover = await getCoverPhoto(album.coverPhotoMediaItemId)
						resolve({ ...album, cover, photos })
					} catch (err) {
						reject(err)
					}
				})
			)
		})
		const gallery = await Promise.all(promises)
		return gallery
	} catch (err) {
		console.log(`error fetching albums ${err}`)
	}
}

router.route('/gallery').get(async (req, res) => {
	console.log(req.cookies.refresh_token)
	const refresh_token = req.cookies.refresh_token
	oAuth2Client.setCredentials({ refresh_token })
	const albums = await getAlbums()
	res.send(albums)
})

router.route('/find').get(async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', req.headers.origin || req.headers.host)
	res.setHeader('Access-Control-Allow-Credentials', true)
	const username = req.query.username
	const user = await User.findOne({ username })
	res.send(user === null ? '404' : user)
})

router.route('/logout').get((req, res) => {
	res.setHeader('Access-Control-Allow-Origin', req.headers.origin || req.headers.host)
	res.setHeader('Access-Control-Allow-Credentials', true)
	res.clearCookie('refresh_token')
	res.redirect('/user/me')
})

//! total = 4 or something then ratio width height

router.route('/test2').get(async (req, res) => {})

router.route('/test').get(async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', req.headers.origin || req.headers.host)
	res.setHeader('Access-Control-Allow-Credentials', true)
	const refresh_token = req.cookies.refresh_token
	oAuth2Client.setCredentials({ refresh_token })
	try {
		const root_drive_res = await oAuth2Client.request({
			url: 'https://www.googleapis.com/drive/v3/files',
			params: {
				pageSize: 1,
				q: `fullText contains '#photography-root' and trashed = false`,
				fields: 'nextPageToken, files(id, name, mimeType)'
			}
		})
		const drive = await getDriveFiles(root_drive_res.data.files)
		res.send(drive[0].files)
	} catch (err) {
		res.send(err)
	}
})

const getDriveFiles = async files => {
	const promises = []
	files.forEach(file => {
		const promise = new Promise(async resolve => {
			if (file.mimeType === 'application/vnd.google-apps.folder') {
				const res = await oAuth2Client.request({
					url: 'https://www.googleapis.com/drive/v3/files',
					params: {
						pageSize: 1000,
						q: `'${file.id}' in parents and (mimeType = 'application/vnd.google-apps.folder' or mimeType contains 'image/') and trashed = false`,
						fields:
							'nextPageToken, files(id, name, mimeType, starred, description, imageMediaMetadata(width, height))'
					}
				})
				let files = await getDriveFiles(res.data.files)
				const starred = files.find(file => file.starred)
				const cover = starred === undefined ? null : starred
				files = files.filter(file => file.description !== 'cantc')
				files = filterFiles(files)
				const { id, imageMediaMetadata } = starred === undefined ? {} : starred
				resolve({ ...file, id, imageMediaMetadata, files })
			} else {
				resolve(file)
			}
		})
		promises.push(promise)
	})
	return await Promise.all(promises)
}

const filterFiles = files => {
	const propoties = ['id', 'name', 'mimeType', 'description', 'cover', 'imageMediaMetadata', 'files']
	return files.map(file => {
		Object.keys(file)
			.filter(key => !propoties.includes(key))
			.forEach(key => delete file[key])
		return file
	})
}

module.exports = router

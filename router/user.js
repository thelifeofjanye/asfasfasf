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
	let user = await User.findOne({ email: 'email@email.com' })
	return res.json({ user: user.email })
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
const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris)

router.route('/auth').get((req, res) => {
	const authorizeUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		prompt: 'select_account',
		scope: [
			'profile',
			'email',
			'https://www.googleapis.com/auth/drive.metadata.readonly',
			'https://www.googleapis.com/auth/drive'
		]
	})
	res.redirect(authorizeUrl)
})

router.route('/create').get(async (req, res) => {
	const code = req.query.code
	const token_r = await oAuth2Client.getToken(code)
	const refresh_token = token_r.tokens.refresh_token
	oAuth2Client.setCredentials({ refresh_token })
	res.cookie('refresh_token', refresh_token, { httpOnly: true })
	const userinfo_res = await oAuth2Client.request({ url: 'https://www.googleapis.com/oauth2/v1/userinfo' })
	const userinfo = userinfo_res.data
	const name = userinfo.name
	const picture = userinfo.picture
	const username = userinfo.email.slice(0, userinfo.email.indexOf('@'))
	const email = userinfo.email
	let user = await User.findOne({ email })
	if (user !== null) await User.updateOne({ email }, { $set: { refresh_token } })
	else {
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
			await new User({ name, picture, username, email, refresh_token, drive: drive[0].files }).save()
		} catch (err) {
			res.send(err)
		}
	}
	res.redirect('https://thelifeofjanye-testmernstack.herokuapp.com')
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

router.route('/test2').get(async (req, res) => {
	const { client_id, client_secret, redirect_uris } = credential.web
	const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
	oAuth2Client.setCredentials({ refresh_token })
	var drive = google.drive({
		version: 'v2',
		auth: oauth2Client
	})
	drive.files.get({ fileId: fileId, alt: 'media' }, { responseType: 'arraybuffer', encoding: null }, function(
		err,
		response
	) {
		if (err) {
			console.log(err)
		} else {
			var imageType = response.headers['content-type']
			var base64 = new Buffer(response.data, 'utf8').toString('base64')
			var dataURI = 'data:' + imageType + ';base64,' + base64

			res.send(dataURI)
		}
	})

	// const refresh_token = req.cookies.refresh_token
	// oAuth2Client.setCredentials({ refresh_token })
	// const resss = await oAuth2Client.request({
	// 	url: `https://www.googleapis.com/drive/v3/files/1BcIPa1hYxLFrUd7e02cO2Ct4rfZrDtpI`,
	// 	params: {
	// 		responseType: 'arraybuffer',
	// 		encoding: null
	// 	}
	// })

	// console.log(resss)

	// const resssss = await oAuth2Client.request({
	// 	url: `https://drive.google.com/uc?id=1BcIPa1hYxLFrUd7e02cO2Ct4rfZrDtpI&export=download`
	// })

	// res.send(resssss)
})

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

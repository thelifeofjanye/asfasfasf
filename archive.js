export const user_gallery_model = [
	{
		title: { type: Schema.Types.Mixed, required: true },
		albums: [
			{
				title: { type: String, required: true },
				src: { type: String, required: true },
				height: { type: Number, required: true },
				width: { type: Number, required: true },
				photos: [
					{
						filename: { type: String },
						description: { type: String },
						src: { type: String },
						time: { type: Date, required: true },
						height: { type: Number, required: true },
						width: { type: Number, required: true }
					}
				]
			}
		]
	}
]

export const photo_api = async (User, name, picture, username, email, refresh_token, oAuth2Client) => {
	let user = await User.findOne({ email })
	if (user !== null) await User.updateOne({ email }, { $set: { refresh_token } })
	else {
		const r = await oAuth2Client.request({ url: 'https://photoslibrary.googleapis.com/v1/albums' })
		const albums = r.data.albums
		const promises = []
		albums.forEach(album => {
			promises.push(
				new Promise(async resolve => {
					const resp = await oAuth2Client.request({
						url: 'https://photoslibrary.googleapis.com/v1/mediaItems:search?',
						method: 'POST',
						data: { pageSize: 100, albumId: album.id }
					})
					const resp2 = await oAuth2Client.request({
						url: `https://photoslibrary.googleapis.com/v1/mediaItems/${album.coverPhotoMediaItemId}`
					})
					const base_photo = resp2.data
					const photos = resp.data.mediaItems
					photos.map(({ filename, description, baseUrl, mediaMetadata }, idx) => {
						const src = baseUrl
						const time = mediaMetadata.creationTime
						const height = mediaMetadata.height
						const width = mediaMetadata.width
						photos[idx] = { filename, description, src, time, height, width }
					})
					const { title, coverPhotoBaseUrl } = album
					const src = coverPhotoBaseUrl
					const width = base_photo.mediaMetadata.width
					const height = base_photo.mediaMetadata.width
					resolve({ title, width, height, src, photos })
				})
			)
		})
		const gallery = await Promise.all(promises)
		let groups = [{ title: 404, albums: [] }]
		gallery.forEach(album => {
			const { title } = album
			const sliceIndex = title.indexOf('/')
			if (sliceIndex === -1) {
				const group404Index = groups.findIndex(group => group.title === 404)
				groups[group404Index].albums = [...groups[group404Index].albums, album]
			} else {
				const group_title = title.slice(0, sliceIndex)
				const album_title = title.slice(sliceIndex + 1, title.length)
				const groupIndex = groups.findIndex(group => group.title === group_title)
				if (groupIndex === -1) {
					groups = [...groups, { title: group_title, albums: [{ ...album, title: album_title }] }]
				} else {
					groups[groupIndex].albums = [...groups[groupIndex].albums, { ...album, title: album_title }]
				}
			}
		})
		await new User({ name, picture, username, email, refresh_token, gallery: groups }).save()
	}
}

// res.send(user_info)
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

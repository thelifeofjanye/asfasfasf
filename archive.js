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

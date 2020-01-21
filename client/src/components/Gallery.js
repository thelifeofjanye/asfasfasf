import React, { useEffect, useState, createContext, useRef } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import Album from './Album'
import Photo from './Photo'
import Modal from './Modal'
import ModalContent from './ModalContent'

export const GalleryContext = createContext()

const Gallery = () => {
	let { username } = useParams()
	const [albums, setAlbums] = useState(null)
	const [owner, setOwner] = useState(null)
	const [photos, setPhotos] = useState(null)
	const [display, setDisplay] = useState(null)
	const [section, setSection] = useState(3)
	const galleryRef = useRef(null)

	const request = async () => {
		const album_promise = new Promise(async () => {
			const res = await axios.get(`/user/albums`, { params: { username } })
			console.log(res.data)
			setAlbums(res.data)
		})
		const owner_promise = new Promise(async () => {
			const res = await axios.get(`/user/find`, { params: { username } })
			console.log(res.data)
			setOwner(res.data)
		})
		Promise.all([album_promise, owner_promise]).then(() => {
			console.log('done')
		})
		// const { name, drive } = res.data
		// setOwner({ name })
	}

	// const handleWindowResize = () => {
	// 	let section = 3
	// 	if (window.innerWidth < 480) section = 1
	// 	else if (window.innerWidth < 1024) section = 2
	// 	setSection(section)
	// 	document.documentElement.style.setProperty('--section-width', `${galleryRef.current.clientWidth / section}px`)
	// }

	useEffect(() => {
		request()
		// document.documentElement.style.setProperty('--sub-album-display', 'none')
		// 	handleWindowResize()
		// 	window.addEventListener('resize', handleWindowResize)
		// 	return () => {
		// 		window.removeEventListener('resize', handleWindowResize)
		// 	}
		// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// useEffect(() => {
	// 	if (photos !== null) renderPhoto(photos)
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [photos])

	// ///! make photo render 6 (or 3) at a time until all rendered

	const setPhotoSyncly = async photos => {
		console.log('setPhotoSyncly')
	}

	// const renderPhoto = photos => {
	// 	let sections = [...new Array(section).keys()].map(() => {
	// 		return { height: 0, photos: [] }
	// 	})
	// 	photos.forEach(photo => {
	// 		let sectionHeights = sections.map(section => {
	// 			return section.height
	// 		})
	// 		const lowestHeightIndex = sectionHeights.indexOf(Math.min(...sectionHeights))
	// 		sections[lowestHeightIndex].height += photo.imageMediaMetadata.height / photo.imageMediaMetadata.width
	// 		sections[lowestHeightIndex].photos.push(photo)
	// 	})

	// 	return sections.map((section, idx) => (
	// 		<div className='section' key={idx}>
	// 			{section.photos.map((photo, idx) => (
	// 				<div className='photo' key={idx}>
	// 					<Photo photo={photo} />
	// 				</div>
	// 			))}
	// 		</div>
	// 	))
	// }

	return (
		<GalleryContext.Provider value={{ setPhotos, display, setDisplay, section, galleryRef, setPhotoSyncly }}>
			<div className='container'>
				<div className='container-wrapper'>
					{owner !== null && (
						<div className='title'>
							<h1>{owner.name}</h1>
						</div>
					)}
					<div className='album-wrapper'>
						{albums === null ? (
							<div>LOADING...</div>
						) : (
							albums.map((album, idx) => (
								<div key={idx}>
									<Album album={album} />
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</GalleryContext.Provider>
	)
}
export default Gallery

import React, { useContext, useState } from 'react'
import { GalleryContext } from './Gallery'

const Photo = ({ photo }) => {
	const { id, name, imageMediaMetadata, files } = photo
	const { setPhotos, setDisplay, setPhotoSyncly } = useContext(GalleryContext)
	const [loaded, setLoaded] = useState(false)

	const handlePhotoClick = async () => {
		if (files !== undefined) {
			setPhotos(null)
			setTimeout(() => {
				setPhotoSyncly(files)
				setPhotos(files)
			}, 500)
		} else {
			setDisplay(photo)
			document.documentElement.style.setProperty('--container-height', '100vh')
			document.documentElement.style.setProperty('--modal-display', 'flex')
		}
	}

	const sectionWidth = document.documentElement.style.getPropertyValue('--section-width')

	const height =
		imageMediaMetadata.height /
		(imageMediaMetadata.width / parseInt(sectionWidth.slice(0, sectionWidth.length - 2)))

	return (
		<div onClick={handlePhotoClick}>
			<img
				src={`https://drive.google.com/uc?id=${id}`}
				alt={name}
				onLoad={() => setLoaded(true)}
				width={imageMediaMetadata.width}
				height={loaded ? 'auto' : height}
			/>
			<div className='photo-overlay' />
			{files !== undefined && <div className='album-title'>{name}</div>}
		</div>
	)
}
export default Photo

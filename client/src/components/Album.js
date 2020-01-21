import React, { useContext, useState } from 'react'
import { GalleryContext } from './Gallery'

//try styled component

const Album = ({ album }) => {
	const { setPhotos, setPhotoSyncly } = useContext(GalleryContext)
	const [active, setActive] = useState(false)
	// const [margin, setMargin] = useState(4)
	const { title } = album
	const handleAlbumClick = async () => {
		setActive(!active)
		// setHeight(height === 0 ? 'auto' : 0)
		// setMargin(margin === 0 ? 4 : 0)
		// document.documentElement.style.setProperty('--sub-album-display', 'block')
		// setPhotos(null)
		// setTimeout(() => {
		// 	setPhotoSyncly(album.files)
		// 	setPhotos(album.files)
		// }, 500)
	}

	return (
		<>
			<div className={`album `} onClick={handleAlbumClick}>
				{title}
				<div className={`sub-album ${active ? 'active' : ''}`}>
					<div>1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</div>
					<div>2xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</div>
					<div>3xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</div>
				</div>
			</div>
		</>
	)
}
export default Album

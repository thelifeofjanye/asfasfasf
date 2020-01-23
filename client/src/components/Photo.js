import React from 'react'
import styled from 'styled-components'

const Photo = ({ photo, setDisplay }) => {
	const { filename, baseUrl, mediaMetadata } = photo
	const { width, height } = mediaMetadata

	const handlePhotoClick = async () => {
		setDisplay(photo)
		const scrollY = document.documentElement.style.getPropertyValue('--scroll-y')
		const body = document.body
		body.style.position = 'fixed'
		body.style.top = `-${scrollY}`
		document.documentElement.style.setProperty('--modal-display', 'flex')
	}

	const gallerySize = (width, height) => {
		const size = parseInt(width) + parseInt(height)
		if (size > 6000) {
			return { width: Math.round(width / 3), height: Math.round(height / 3) }
		} else if (size > 3600) return { width: Math.round(width / 2), height: Math.round(height / 2) }
		else {
			return { width, height }
		}
	}

	const PhotoCover = styled.div`
		opacity: 0;
		position: absolute;
		background-color: #01010140;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		transition: opacity 100ms linear;
		&:hover {
			opacity: 1;
		}
	`

	const Image = styled.img`
		opacity: 1;
		background-color: rebeccapurple;
		min-width: 100%;
		max-width: 100%;
		display: flex;
		transition: all 300ms linear;
	`

	return (
		<div onClick={() => handlePhotoClick()}>
			<Image
				src={`${baseUrl}=w${gallerySize(width, height).width}-h${gallerySize(width, height).height}`}
				alt={filename}
				width={gallerySize(width, height).width}
				height={'auto'}
			/>
			<PhotoCover />
		</div>
	)
}
export default Photo

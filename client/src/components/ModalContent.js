import React from 'react'

const ModalContent = ({ photo }) => {
	const { id, name, imageMediaMetadata } = photo
	const { width, height } = imageMediaMetadata

	const imageSize = (width, height) => {
		if (height > width) {
			if (height / (width / (window.innerWidth - 100)) < window.innerHeight - 100)
				return { width, height: 'auto' }
			else return { width: 'auto', height }
		} else {
			if (width / (height / (window.innerHeight - 100)) < window.innerWidth - 100)
				return { width: 'auto', height }
			else return { width, height: 'auto' }
		}
	}

	return (
		<img
			src={`https://drive.google.com/uc?id=${id}`}
			alt={name}
			width={imageSize(width, height).width}
			height={imageSize(width, height).height}
		/>
	)
}
export default ModalContent

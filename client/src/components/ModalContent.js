import React, { useState, useEffect } from 'react'

const ModalContent = ({ photo }) => {
	if (photo === null) return null

	const { baseUrl, filename, mediaMetadata } = photo
	const { width, height } = mediaMetadata

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
			src={`${baseUrl}=w${width}-h${mediaMetadata.height}`}
			alt={filename}
			width={imageSize(width, height).width}
			height={imageSize(width, height).height}
		/>
	)
}
export default ModalContent

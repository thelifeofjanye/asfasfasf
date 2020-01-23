import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

const Image = ({ photo, setPopup }) => {
	const { baseUrl, mediaMetadata } = photo
	const { height, width } = mediaMetadata

	const popImage = () => {
		setPopup(photo)
		const scrollY = document.documentElement.style.getPropertyValue('--scroll-y')
		const body = document.body
		body.style.position = 'fixed'
		body.style.top = `-${scrollY}`
		document.documentElement.style.setProperty('--modal-display', 'flex')
	}

	const handleWindowScroll = () => {
		const rect = imageRef.current.getBoundingClientRect()
		if (rect.y < window.innerHeight) {
			imageRef.current.style.opacity = 1
		} else {
			imageRef.current.style.opacity = 0
		}
	}

	useEffect(() => {
		handleWindowScroll()
		window.addEventListener('scroll', handleWindowScroll)
		return () => {
			window.removeEventListener('scroll', handleWindowScroll)
		}
	}, [])

	const imageRef = useRef()

	const ImageWrap = styled.div`
position: relative;
margin-bottom: 20px;
`

	const Overlay = styled.div`
		cursor: pointer;
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
		transition: opacity 600ms ease-in-out;
		display: flex;
	`

const size = (width, height) => {
	const size = parseInt(width) + parseInt(height)
	if (size > 6000) {
		return { width: Math.round(width / 3), height: Math.round(height / 3) }
	} else if (size > 3600) return { width: Math.round(width / 2), height: Math.round(height / 2) }
	else {
		return { width, height }
	}
}

	return (
		<ImageWrap onClick={() => popImage()}>
			<Image ref={imageRef} width={`100%`}  src={`${baseUrl}=w${size(width, height).width}-h${size(width, height).height}`} />
			<Overlay />
		</ImageWrap>
	)
}

export default Image

import React, { useEffect } from 'react'
import styled from 'styled-components'

const Popup = ({ photo }) => {
	useEffect(() => {
		document.documentElement.style.setProperty('--modal-display', 'none')
	}, [])

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

	const Modal = styled.div`
		display: var(--modal-display);
		opacity: ${() => {
			console.log(document.documentElement.style.getPropertyValue('--modal-display'))
			return document.documentElement.style.getPropertyValue('--modal-display') === 'none' ? 0 : 1
		}};
		position: fixed;
		z-index: 1;
		top: 0;
		left: 0;
		background-color: rgba(0, 0, 0, 0.4);
		width: 100%;
		height: 100%;
		justify-content: center;
		align-items: center;
		transition: opacity 1s ease-in-out;
	`

	const ImageWrap = styled.div`
		padding: 20px;
		background: #fafafa;
		display: grid;
		> img {
			max-width: calc(100vw - 100px);
			max-height: calc(100vh - 100px);
			background-color: red;
		}
	`

	return (
		<Modal
			onClick={() => {
				const body = document.body
				const scrollY = body.style.top
				body.style.position = ''
				body.style.top = ''
				window.scrollTo(0, parseInt(scrollY || '0') * -1)
				document.documentElement.style.setProperty('--modal-display', 'none')
			}}>
			<ImageWrap onClick={e => e.stopPropagation()}>
				<img
					loading
					src={`${baseUrl}=w${width}-h${height}`}
					alt={filename}
					width={imageSize(width, height).width}
					height={imageSize(width, height).height}
				/>
			</ImageWrap>
		</Modal>
	)
}
export default Popup

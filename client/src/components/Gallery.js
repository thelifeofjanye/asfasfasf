import React, { useEffect, useState, createContext, useRef } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import Album from './Album'
import Photo from './Photo'
import Modal from './Modal'
import ModalContent from './ModalContent'
import styled from 'styled-components'

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
		if (owner === null) {
			const albumPromise = new Promise(async () => {
				const res = await axios.get(`/user/albums`, { params: { username } })
				setAlbums(res.data)
			})

			const ownerPromise = new Promise(async () => {
				const res = await axios.get(`/user/find`, { params: { username } })
				setOwner(res.data)
			})
			Promise.all([albumPromise, ownerPromise])
		}
	}

	const setPhotoSyncly = async photos => {
		console.log('setPhotoSyncly')
	}

	const handleWindowResize = () => {
		let section = 4
		if (window.innerWidth < 480) section = 1
		else if (window.innerWidth < 1024) section = 2
		else if (window.innerWidth < 1600) section = 3
		setSection(section)
		document.documentElement.style.setProperty('--section-width', `${galleryRef.current.clientWidth / section}px`)
	}

	useEffect(() => {
		console.log('I RENDERED')
		request()
		handleWindowResize()
		window.addEventListener('resize', handleWindowResize)
		window.addEventListener('scroll', () => {
			document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`)
		})
		return () => {
			window.removeEventListener('resize', handleWindowResize)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (photos !== null) renderPhoto(photos)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [photos])

	const Section = styled.div`
		margin-left: 20px;
		max-width: var(--section-width);
		&:first-child {
			margin-left: 0 !important;
		}
	`
	const PhotoSection = styled.div`
		margin-bottom: 20px;
		position: relative;
		cursor: pointer;
	`

	const renderPhoto = photos => {
		let sections = [...new Array(section).keys()].map(() => {
			return { height: 0, photos: [] }
		})
		photos.forEach(photo => {
			let sectionHeights = sections.map(section => {
				return section.height
			})
			const lowestHeightIndex = sectionHeights.indexOf(Math.min(...sectionHeights))
			sections[lowestHeightIndex].height += photo.mediaMetadata.height / photo.mediaMetadata.width
			sections[lowestHeightIndex].photos.push(photo)
		})
		return sections.map((section, idx) => (
			<Section key={idx}>
				{section.photos.map((photo, idx) => (
					<PhotoSection key={idx}>
						{/* <GalleryContext.Provider value={{ setDisplay }}> */}
						<Photo photo={photo} setDisplay={setDisplay} />
						{/* </GalleryContext.Provider> */}
					</PhotoSection>
				))}
			</Section>
		))
	}

	const AlbumWrapper = styled.div`
		display: flex;
		justify-content: center;
		margin-bottom: 20px;
	`

	const GallerySection = styled.div`
		background-color: pink;
		overflow: hidden;
		display: 'inline-flex';
		> div {
			display: inline-flex;
		}
	`

	const Container = styled.div`
		overflow: auto;
		max-height: var(--container-height);
		display: flex;
		justify-content: center;
		> div {
			width: 100%;
			width: calc(100vw - 100px);
		}
	`

	const Title = styled.div`
		background: linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%);
		-webkit-text-fill-color: transparent;
		-webkit-background-clip: text;
		cursor: default;
		text-align: center;
		margin: 50px 0;
	`

	return (
		<>
			<Modal>
				<ModalContent photo={display} />
			</Modal>
			<GalleryContext.Provider value={{ albums, setAlbums, setPhotos }}>
				<Container>
					<div>
						{owner !== null && (
							<Title>
								<h1>{owner.name}</h1>
							</Title>
						)}
						<AlbumWrapper>
							{albums === null ? (
								<div>LOADING...</div>
							) : (
								albums.map((album, idx) => <Album key={idx} album={album} />)
							)}
						</AlbumWrapper>
						<GallerySection ref={galleryRef}>
							<div>{photos !== null && renderPhoto(photos)}</div>
						</GallerySection>
					</div>
				</Container>
			</GalleryContext.Provider>
		</>
	)
}
export default Gallery

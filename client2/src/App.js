import React, { useEffect, useState } from 'react'
import './App.css'
import Axios from 'axios'
import styled from 'styled-components'
import { hot } from 'react-hot-loader/root'
import Image from './component/image'
import Popup from './component/popup'
import Album from './component/album'

function App() {
	const [photos, setPhotos] = useState([])
	const [photoWidth, setPhotoWidth] = useState(0)
	const [section, setSection] = useState(0)
	const [popup, setPopup] = useState(null)
	const [owner, setOwner] = useState(null)
	const [albums, setAlbums] = useState([])

	useEffect(() => {
		Axios.post('/user/photos', {
			username: 'thelifeofjanye',
			albumId: 'AEV5mfjI05p6CqlC7-Cw4amg8UrW9Los_L6Pin7EAfbzLhfyb-hRK5bvOHF9h4IJlk9_aNTsrWuW'
		}).then(res => {
			setPhotos(res.data)
		})
		Axios.post('/user/albums', {
			username: 'thelifeofjanye'
		}).then(res => {
			setAlbums(res.data)
		})

		Axios.post('/user/find', {
			username: 'thelifeofjanye'
		}).then(res => {
			setOwner(res.data)
		})
		handleWindowResize()
		window.addEventListener('resize', handleWindowResize)
		window.addEventListener('scroll', handleWindowScroll)
		return () => {
			window.removeEventListener('resize', handleWindowResize)
			window.removeEventListener('scroll', handleWindowScroll)
		}
	}, [])

	const handleWindowScroll = () => {
		document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`)
	}

	const handleWindowResize = () => {
		let section = 1
		if (window.innerWidth >= 1600) section = 4
		else if (window.innerWidth >= 1024) section = 3
		else if (window.innerWidth >= 480) section = 2
		setPhotoWidth(window.innerWidth / section)
		setSection(section)
	}

	const ImageWrap = styled.div`
		max-width: calc(100% - 10vw);
		display: flex;
	`

	const Section = styled.div`
		margin-left: 20px;
		width: ${({ width, first }) => `${width - (first ? 0 : 20)}px`};
		&:first-child {
			margin-left: 0 !important;
		}
	`

	const filledSection = (section, photos) => {
		let sections = [...new Array(section).keys()].map(() => {
			return { height: 0, photos: [] }
		})
		photos.forEach(photo => {
			const { mediaMetadata } = photo
			const { height, width } = mediaMetadata
			let totalHeight = sections.map(section => {
				return section.height
			})
			const shortest = totalHeight.indexOf(Math.min(...totalHeight))
			sections[shortest].height += height / width
			sections[shortest].photos.push(photo)
		})
		return sections
	}

	const renderPhoto = photos => {
		const sections = filledSection(section, photos)
		return sections.map((section, i) => (
			<Section key={i} first={i === 1} width={photoWidth}>
				{section.photos.map((photo, i) => (
					<Image key={i} photo={photo} setPopup={setPopup} photoWidth={photoWidth} />
				))}
			</Section>
		))
	}

	const Title = styled.div`
		background: linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%);
		-webkit-text-fill-color: transparent;
		-webkit-background-clip: text;
		cursor: default;
		text-align: center;
		margin: 50px 0;
	`

	const ImageContainer = styled.div`
		display: flex;
		justify-content: center;
	`

	const AlbumWrapper = styled.div`
		display: flex;
		justify-content: center;
		margin-bottom: 20px;
	`

	return (
		<>
			<div>
				<Popup photo={popup} />
			</div>
			<Title>
				<h1>{owner !== null && owner.name}</h1>
			</Title>
			<AlbumWrapper>
				{albums.map((album, idx) => (
					<Album key={idx} album={album} albums={albums} setAlbums={setAlbums} setPhotos={setPhotos} />
				))}
			</AlbumWrapper>
			<ImageContainer>
				<ImageWrap>{renderPhoto(photos)}</ImageWrap>
			</ImageContainer>
		</>
	)
}

// export default hot(App)
export default App

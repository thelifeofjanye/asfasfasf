import React from 'react'
import styled from 'styled-components'
import Axios from 'axios'
// import { useParams } from 'react-router-dom'

const Album = ({ album, albums, setAlbums, setPhotos }) => {
	// let { username } = useParams()
	const { id, title, subs } = album

	const SubAlbumWrapper = styled.div`
		box-shadow: #00000045 2px 2px 6px;
		transform: translateX(-25%);
		visibility: hidden;
		width: 120px;
		background-color: #fff;
		text-align: center;
		position: fixed;
		z-index: 1;
	`

	const SubAlbum = styled.div`
		padding: 6px;
	`

	const Album = styled.div`
		position: relative;
		&:not(:first-child) {
			margin-left: 18px;
		}
		&:hover ${SubAlbumWrapper} {
			visibility: visible;
		}
	`
	const Title = styled.div`
		cursor: pointer;
		&:hover {
			color: #808080;
		}
	`

	const appendPhotos = (albums, albumId, photos) => {
		return albums.map(album => {
			if (album.id === albumId) {
				return { ...album, photos }
			}
			if (Array.isArray(album.subs)) {
				const subs = album.subs.map(album => {
					if (album.id === albumId) {
						return { ...album, photos }
					} else {
						return album
					}
				})
				return { ...album, subs }
			} else {
				return album
			}
		})
	}

	const albumClick = async (album, albumId) => {
		setPhotos([])
		if (albumId !== undefined) {
			if (album.photos === undefined) {
				const res = await Axios.post('/user/photos', { username: 'thelifeofjanye', albumId })
				const photos = res.data
				const appendedAlbums = appendPhotos(albums, albumId, photos)
				setAlbums(appendedAlbums)
				setPhotos(photos)
			} else {
				setPhotos(album.photos)
			}
		}
	}

	return (
		<Album>
			<Title onClick={() => albumClick(album, id)}>{title}</Title>
			<SubAlbumWrapper>
				{subs !== undefined &&
					subs.map((album, idx) => (
						<SubAlbum key={idx}>
							<Title onClick={() => albumClick(album, album.id)}>{album.title}</Title>
						</SubAlbum>
					))}
			</SubAlbumWrapper>
		</Album>
	)
}
export default Album

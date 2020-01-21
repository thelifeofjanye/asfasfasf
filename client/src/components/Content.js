import React, { useContext } from 'react'
import Axios from 'axios'
import { ContentContext } from './Gallery'

const Content = ({ content }) => {
	const { username, contents, setContents } = useContext(ContentContext)
	const { id, name } = content

	const addChildToContent = (arr, children) => {
		arr.forEach(function checkId(content) {
			if (content.id === id) content.children = children
			Array.isArray(content.children) && content.children.forEach(checkId)
		})
		return arr
	}

	const handleContentClick = parent_id => {
		const newContents = [...contents]
		if (!Array.isArray(content.children) && content.imageMediaMetadata === undefined)
			Axios.get('/user/stuff', {
				params: { username, parent_id }
			}).then(res => {
				res.data.map((data, idx) => (res.data[idx] = { ...data, active: false }))
				setContents(addChildToContent(newContents, res.data))
			})
	}

	return <div onClick={() => handleContentClick(id)}>{name}</div>
}
export default Content

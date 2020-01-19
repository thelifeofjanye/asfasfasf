import React, { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
	const [name, setName] = useState('...')

	const fetchName = async () => {
		const res = await axios.get('/user/name')
		const name = res.data.name
		setName(name)
	}

	useEffect(() => {
		fetchName()
	}, [])

	const realname = async () => {
		setName('...')
		const res = await axios.post('/user/realname', { name: 'Jiraded' })
		const name = res.data.name
		setName(name)
	}

	return (
		<div>
			<span onClick={() => realname()}> Hello {name} </span>
		</div>
	)
}

export default App

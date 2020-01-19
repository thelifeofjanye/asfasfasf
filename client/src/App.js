import React, { useState, useEffect } from 'react'
import logo from './logo.svg'
import './App.css'
import axios from 'axios'

// axios.defaults.withCredentials = true
// axios.defaults.baseURL = 'http://localhost:5000'

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
		<div className='App'>
			<header className='App-header'>
				<img src={logo} className='App-logo' alt='logo' />
				<p>
					Edit <code>src/App.js</code> and save to reload.
				</p>
				<span onClick={() => realname()}> Hello {name} </span>
			</header>
		</div>
	)
}

export default App

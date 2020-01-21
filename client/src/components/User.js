import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Login from './Login'
import Profile from './Profile'
import About from './About'

const User = () => {
	const [currentUser, setCurrentUser] = useState(null)

	useEffect(() => {
		console.log('????')
		axios.get('/user/me').then(res => {
			setCurrentUser(res.data)
		})
	}, [])

	return currentUser === null ? null : currentUser === 404 ? (
		<div>
			<About />
			<Login />
		</div>
	) : (
		<div>
			<Profile currentUser={currentUser} setCurrentUser={setCurrentUser} />
		</div>
	)
}
export default User

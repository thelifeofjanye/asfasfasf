import React, { useEffect } from 'react'
import axios from 'axios'

const Profile = ({ currentUser, setCurrentUser }) => {
	const { name, picture, username, email } = currentUser

	const logout = () => {
		axios.get('/user/logout').then(res => setCurrentUser(res.data))
	}

	useEffect(() => {
		axios.get('/user/albums', { params: { username } }).then(res => console.log(res.data))
	}, [])

	return (
		<div className='about'>
			<div>
				<h1>
					Hello {name}
					<img src={picture} height={60} alt='' />
				</h1>
				<h3>username: {username}</h3>
				<h3>email: {email}</h3>
				<h6>just edit your photo loooooooooool 4Head</h6>
				<button onClick={logout}>Sign Out</button>
			</div>
		</div>
	)
}
export default Profile

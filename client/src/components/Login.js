import React from 'react'

const Login = () => {
	return (
		<div className='login'>
			<div>
				<div>Login Google to start using</div>
				<button
					onClick={() => {
						window.location.href = 'http://localhost:8080/user/auth'
					}}
					className='google-auth'>
					Login with Google
				</button>
			</div>
		</div>
	)
}
export default Login

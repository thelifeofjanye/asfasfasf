import React, { useEffect } from 'react'

const Modal = ({ children }) => {
	useEffect(() => {
		document.documentElement.style.setProperty('--modal-display', 'none')
	}, [])

	return (
		<div
			className='modal'
			onClick={() => {
				const body = document.body
				const scrollY = body.style.top
				body.style.position = ''
				body.style.top = ''
				window.scrollTo(0, parseInt(scrollY || '0') * -1)
				document.documentElement.style.setProperty('--modal-display', 'none')
			}}>
			<div className='modal-content' onClick={e => e.stopPropagation()}>
				{children}
			</div>
		</div>
	)
}
export default Modal

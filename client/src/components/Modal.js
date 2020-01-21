import React, { useEffect } from 'react'

const Modal = ({ children }) => {
	useEffect(() => {
		document.documentElement.style.setProperty('--modal-display', 'none')
	}, [])

	return (
		<div
			className='modal'
			onClick={() => {
				document.documentElement.style.setProperty('--modal-display', 'none')
			}}>
			<div className='modal-content' onClick={e => e.stopPropagation()}>
				{children}
			</div>
		</div>
	)
}
export default Modal

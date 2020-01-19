const credential = {
	web: {
		client_id: '27550294558-nh4pblfbuvkmsv50r72l0crhqh9p4k7o.apps.googleusercontent.com',
		// client_id: '422533022738-89go2khs2ero8fv2rg1eh9kmd1ltf6bm.apps.googleusercontent.com',
		project_id: 'project-photography-40536',
		auth_uri: 'https://accounts.google.com/o/oauth2/auth',
		token_uri: 'https://oauth2.googleapis.com/token',
		auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
		client_secret: 'iiKML9f7mc9mG6BcgYmnECD_',
		// client_secret: 'EKn4VM8-_9ieX7FNrIlNXEKa',
		redirect_uris: [
			'http://localhost:8080/user/create',
			'https://thelifeofjanye-testmernstack.herokuapp.com/user/create'
		],
		javascript_origins: ['http://localhost:8080', 'https://thelifeofjanye-testmernstack.herokuapp.com']
	}
}
module.exports = credential

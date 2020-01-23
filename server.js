const express = require('express')
const mongoose = require('mongoose')
const cookies = require('cookie-parser')

mongoose.set('useNewUrlParser', true)
mongoose.set('useCreateIndex', true)
mongoose.set('useUnifiedTopology', true)

require('dotenv').config()

const app = express()
const port = process.env.PORT || 8080

app.use(express.json())
app.use(cookies())

const uri = process.env.ATLAS_URI
mongoose.connect(uri)
const connection = mongoose.connection
connection.once('open', () => {
	console.log('MongoDB database connection establised successfully')
})

const UserRouter = require('./router/user')

app.use('/user', UserRouter)

if (process.env.NODE_ENV === 'production') {
	console.log('NODE_ENV=PRODUCTION')
	app.use(express.static('client/build'))
} else {
	console.log('NODE_ENV=DEVELOPMENT')
}

app.listen(port, () => {
	console.log(`Server is running on port: ${port}`)
})

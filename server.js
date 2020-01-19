const express = require('express')
const mongoose = require('mongoose')
const cookies = require('cookie-parser')

require('dotenv').config()

const app = express()
const port = process.env.port || 5000

app.use(express.json())
app.use(cookies())

const uri = process.env.ATLAS_URI
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
const connection = mongoose.connection
connection.once('open', () => {
	console.log('MongoDB database connection establised successfully')
})

const UserRouter = require('./router/user')

app.use('/user', UserRouter)

if (process.env.NODE_ENV === 'production') {
	app.use(express.static('client/build'))
} else {
	console.log('where am I')
}

app.listen(port, () => {
	console.log(`Server is running on port: ${port}`)
})

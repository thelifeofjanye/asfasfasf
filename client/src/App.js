import React from 'react'
import './App.css'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import User from './components/User'
import Gallery from './components/Gallery'

function App() {
	return (
		<Router>
			<Switch>
				<Route exact path='/'>
					<User />
				</Route>
				<Route path='/:username'>
					<Gallery />
				</Route>
			</Switch>
		</Router>
	)
}

export default App

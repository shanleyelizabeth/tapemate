import logo from './logo.svg';
import './App.css';
import { Route, Routes, useNavigate } from "react-router-dom";
import {useState, useEffect, useContext} from "react"
import {UserContext} from "./UserProvider"
import Account from "../src/components/Account"
import Authentication from "../src/components/Authentication"
import HomePage from "../src/components/HomePage"
import Sessions from "../src/components/Sessions"
import Header from "../src/components/Header"
import Footer from "../src/components/Footer"
import RequestForm from "../src/components/RequestForm"


function App() {
  const {user, setUser} = useContext(UserContext)
  const navigate = useNavigate()

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = () => {
    fetch("/authorized")
      .then( r => {
        if (r.ok) {
          r.json().then( user => setUser(user))
        }
      })
  }



  return (
      <div style={{ backgroundColor: '#e5e3dc', minHeight: '100vh'}} className ="App">
        {user ? <Header navigate={navigate}/> : null}
          <Routes>
            <Route path='/' element={<Authentication navigate={navigate}/>}/>
            <Route path='home' element={<HomePage />}/>
            <Route path='account' element={<Account navigate={navigate}/>}/>
            <Route path='sessions' element={<Sessions navigate={navigate}/>}/>
            <Route path='request-form' element={<RequestForm/>}/>
          </Routes>
        <Footer />
      </div>
  );
}

export default App;

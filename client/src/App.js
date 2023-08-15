import logo from './logo.svg';
import './App.css';
import { Route, Routes, useNavigate } from "react-router-dom";
import {UserProvider} from "./UserProvider"
import Account from "../src/components/Account"
import Authentication from "../src/components/Authentication"
import HomePage from "../src/components/HomePage"
import Sessions from "../src/components/Sessions"
import Header from "../src/components/Header"
import Footer from "../src/components/Footer"
import RequestForm from "../src/components/RequestForm"


function App() {
  return (
    <UserProvider>
      <div className ="App">
        <Header />
          <Routes>
            <Route path='/' element={<Authentication />}/>
            <Route path='home' element={<HomePage />}/>
            <Route path='account' element={<Account />}/>
            <Route path='sessions' element={<Sessions />}/>
            <Route path='request-form' element={<RequestForm/>}/>
          </Routes>
        <Footer />
      </div>
    </UserProvider>
  );
}

export default App;

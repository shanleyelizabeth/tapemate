import React from "react"
import {NavLink} from "react-router-dom"
import {useState, useEffect, useContext} from "react"
import {UserContext} from "../UserProvider"
import Container from 'react-bootstrap/Container';
import { Button, Navbar, Nav, Dropdown} from 'react-bootstrap';



function Header({navigate}){
    const {user, setUser} = useContext(UserContext)

    const CustomToggle = React.forwardRef(({ onClick }, ref) => (
        <div
            src={user.profile_image}
            ref={ref}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}
            style={{
                width: '40px', 
                height: '40px',
                borderRadius: '50%',
                overflow: 'hidden',
                position: 'relative'
            }}  
        >
            <img
                src={user.profile_image}
                alt="User Profile Icon"
                style={{
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                    position: 'absoulute',
                    top: '0'
                }}
            />
        </div>
    ));


    const handleLogout = () => {
        fetch('/logout', {
            method: "DELETE"
        })
        .then(r => {
            if(r.ok) {
                setUser(null)
                navigate('/')
            }
        })
    }



    return (
        <Navbar bg="light" expand="lg" className="header">
            <Navbar.Brand>TM Logo</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="left-side-nav">
                <Nav className="mr-auto nav-bar">
                    <Nav.Item className="nav-bar-list">
                        <NavLink className="nav-bar-link" to="home">Home</NavLink>
                    </Nav.Item>
                    <Nav.Item className="nav-bar-list">
                        <NavLink className="nav-bar-link" to="sessions">Sessions</NavLink>
                    </Nav.Item>
                </Nav>
            </Navbar.Collapse>
            <div className = "right-nav">
                <Button variant="primary">
                    <NavLink className = "new-request-link" to="request-form">+ New Reading Request</NavLink>
                </Button>
                <Dropdown>
                    <Dropdown.Toggle as={CustomToggle}/>
                    <Dropdown.Menu>
                        <Dropdown.Item href="/account">Account</Dropdown.Item>
                        <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
            
        
    </Navbar>
    )
}

export default Header
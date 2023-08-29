import UserCard from "./UserCard"
import {useState, useEffect, } from "react"
import { Col, Row } from 'react-bootstrap'



function HomePage(){
    const [users, setUsers] = useState([])

useEffect(() => {
    fetch('/homepage_users')
    .then(r => r.json())
    .then(data => setUsers(data))
},[])




const userCards = users.map(user =>{
            return (
                <Col className="d-flex">
                <UserCard 
                            key={user.id}
                            username={user.username}
                            profile_image={user.profile_image}
                            availability={user.availability}
                            gender={user.gender}
                            location={user.location}
                    />
                </Col>
            )
})

    return (
        <div>
            <Row className="m-4">
            {userCards}
            </Row>
        </div>
    )
}

export default HomePage
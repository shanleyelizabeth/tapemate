import RequestCard from "./RequestCard"
import {useState, useEffect, } from "react"
import { Col, Row } from 'react-bootstrap'



function HomePage(){
    const [requests, setRequests] = useState([])

useEffect(() => {
    fetch('/requests')
    .then(r => r.json())
    .then(data => setRequests(data))
},[])

const removeRequest = (request_id) => {
    const newRequests = requests.filter(request => request.id !== request_id)
    setRequests(newRequests)
}


const openRequestCards = requests
            .filter(request => request.status === 'open')
            .map(request => {
                return (
                    <Col className="d-flex">
                    <RequestCard 
                                key={request.id}
                                request_id={request.id}
                                actor={request.actor_username}
                                actor_id={request.actor_id}
                                actor_image={request.actor_profile_image}
                                date={request.date}
                                start_time={request.start_time}
                                end_time={request.end_time}
                                session_type = {request.session_type}
                                notes={request.notes}
                                actor_location={request.actor_location}
                                removeRequest={removeRequest}
                        />
                    </Col>
                )
})

    return (
        <div>
            <Row className="m-4">
            {openRequestCards}
            </Row>
        </div>
    )
}

export default HomePage
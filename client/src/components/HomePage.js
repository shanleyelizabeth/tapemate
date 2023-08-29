import UserCard from "./UserCard"
import {useState, useEffect, } from "react"
import { Col, Row, Modal, Form, Button } from 'react-bootstrap'
import DatePicker from "react-datepicker"
import 'react-datepicker/dist/react-datepicker.css'



function HomePage(){
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false)
    const [sessionType, setSessionType] = useState("")   

    useEffect(() => {
        fetch('/homepage_users')
        .then(r => r.json())
        .then(data => setUsers(data))
    },[])

    const handleOpenModal = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    }



const userCards = users.map(user =>{
            return (
                <Col className="d-flex">
                <UserCard 
                            key={user.id}
                            username={user.username}
                            profile_image={user.profile_image}
                            availabilities={user.availabilities}
                            gender={user.gender}
                            location={user.location}
                            virtual={user.available_virtual}
                            in_person={user.available_in_person}
                            coaching={user.available_coaching}
                            setSelectedUser={setSelectedUser}
                            openModal={handleOpenModal}
                    />
                </Col>
            )
})

    return (
        <div>
            <Row className="m-4">
            {userCards}
            </Row>

            {selectedUser && (
                <Modal show={showModal} onHide = {() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Book {selectedUser.username}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Date</Form.Label>
                                <Form.Control type="date"/>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Start Time</Form.Label>
                                <Form.Control type="time"/>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>End Time</Form.Label>
                                <Form.Control type="time"/>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label as="legend">
                                    Session Type:
                                </Form.Label>
                                <Col  className="radio-buttons d-flex align-items-center">
                                    <Form.Check
                                        type="radio"
                                        label="Virtual"
                                        name="sessionType"
                                        id="virtual"
                                        value="virtual"
                                        checked={sessionType === "virtual"}
                                        onChange={e => setSessionType(e.target.value)}
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="In Person"
                                        name="sessionType"
                                        id="in-person"
                                        value="in-person"
                                        checked={sessionType === "in-person"}
                                        onChange={e => setSessionType(e.target.value)}
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="Coaching"
                                        name="sessionType"
                                        id="coaching"
                                        value="coaching"
                                        checked={sessionType === "coaching"}
                                        onChange={e => setSessionType(e.target.value)}
                                    />
                                </Col>
                            </Form.Group>
                        </Form>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                        <Button variant="primary">Book</Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    )
}

export default HomePage
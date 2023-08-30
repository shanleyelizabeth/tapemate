import UserCard from "./UserCard"
import {useState, useEffect, } from "react"
import { Col, Row, Modal, Form, Button, Dropdown } from 'react-bootstrap'
import "../Home.css"



function HomePage(){
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [sessionType, setSessionType] = useState("") 
    const [notes, setNotes] = useState("") 
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)
    const [genderFilter, setGenderFilter] = useState("")
    const [availabilityFilter, setAvailabilityFilter] = useState("")
    const [sessionTypeFilter, setSessionTypeFilter] = useState({virtual: false, inPerson: false, coaching: false})

    useEffect(() => {
        fetch('/homepage_users')
        .then(r => r.json())
        .then(data => setUsers(data))
    },[])

    const handleOpenModal = (user) => {
        setSelectedUser(user)
        setShowModal(true)
    }

    const filteredUsers = users.filter(user => {
        return (genderFilter === "" || genderFilter === "All" || user.gender.toLowerCase() === genderFilter.toLowerCase()) &&
                (availabilityFilter === "" || user.availabilities.some(avail => avail.day_of_week.toLowerCase() === availabilityFilter.toLowerCase())) &&
                (!sessionTypeFilter.virtual || user.available_virtual) &&
                (!sessionTypeFilter.inPerson || user.available_in_person) &&
                (!sessionTypeFilter.coaching || user.available_coaching);
    })

    



const userCards = filteredUsers.map(user =>{
            return (
                <Col className="d-flex">
                <UserCard 
                            key={user.id}
                            id={user.id}
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



const handleBooking = (e) => {
    e.preventDefault()
    const formattedDate = selectedDate.toISOString().split('T')[0];

    const formData = {
        date: formattedDate,
        reader_id: selectedUser.id,
        start_time: startTime,
        end_time: endTime,
        notes: notes,
        session_type: sessionType
    }

    fetch('/requests',{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(formData)
    })
    .then(r => r.json())
    .then( () => {
        setShowModal(false)
        setShowConfirmationModal(true)
        setSelectedDate(new Date());
        setStartTime("");
        setEndTime("");
        setNotes("");
        setSessionType("")
    })
}

    return (
        <div>
            
            <div className="filter-container">
            
                <Form.Group className="filters" controlId="genderSelect">
                    <Form.Label >Gender</Form.Label>
                    <Form.Select value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
                    <option value="">All</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    </Form.Select>
                </Form.Group>

                

                <Form.Group className="filters" controlId="availabilitySearch">
                    <Form.Label>Availability</Form.Label>
                    <Form.Select 
                        value={availabilityFilter} 
                        onChange={e => setAvailabilityFilter(e.target.value)}
                    >
                        <option value="" disabled>Select a day...</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group className="filters-checks">
                    <Form.Label>Session Type</Form.Label>
                    <Dropdown>
                        <Dropdown.Toggle variant="light" className="custom-dropdown-toggle" id="dropdown-basic">
                        Choose Session Type...
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="custom-dropdown-menu">
                        <Dropdown.Item as="button" className="custom-dropdown-item">
                            <input type="checkbox" id="virtual" value="Virtual" />
                            <label htmlFor="virtual"> Virtual</label>
                        </Dropdown.Item>
                        <Dropdown.Item as="button" className="custom-dropdown-item">
                            <input type="checkbox" id="in-person" value="In-Person" />
                            <label htmlFor="in-person"> In-Person</label>
                        </Dropdown.Item>
                        <Dropdown.Item as="button" className="custom-dropdown-item">
                            <input type="checkbox" id="coaching" value="Coaching" />
                            <label htmlFor="coaching"> Coaching</label>
                        </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Form.Group>

            </div>
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
                                <Form.Control type="date" value={selectedDate.toISOString().split('T')[0]} onChange={e => setSelectedDate(new Date(e.target.value))}/>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Start Time</Form.Label>
                                <Form.Control type="time" value={startTime} onChange={e => setStartTime(e.target.value)}/>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>End Time</Form.Label>
                                <Form.Control type="time" value={endTime} onChange={e => setEndTime(e.target.value)}/>
                            </Form.Group>
                            <Form.Group className="mb-3" as={Row}>
                                <Form.Label >
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
                            <Form.Group as={Row}>
                                <Form.Label>Notes:</Form.Label>
                                <Col sm="10">
                                    <Form.Control 
                                        as="textarea" 
                                        rows={3} 
                                        value={notes} 
                                        onChange={e => setNotes(e.target.value)} 
                                    />
                                </Col>
                        </Form.Group>
                        </Form>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                        <Button variant="primary" onClick={handleBooking}>Book</Button>
                    </Modal.Footer>
                </Modal>
            )}
            <Modal show={showConfirmationModal} onHide={() => setShowConfirmationModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    You've sent a Booking Request to {selectedUser?.username}!
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmationModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default HomePage
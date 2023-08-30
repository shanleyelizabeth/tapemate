import {Button, Image, Col, Row, Form, Card, Container, ToggleButton, ToggleButtonGroup} from 'react-bootstrap'
import {useState, useEffect, useContext, useRef} from "react"
import {UserContext} from "../UserProvider"
import moment from 'moment'
import  "../Account.css"

function Account({navigate}){
    const {user, setUser} = useContext(UserContext)
    const [editMode, setEditMode] = useState(false)
    const [username, setUsername] = useState(user?.username)
    const [location, setLocation] = useState(user?.location)
    const [isReader, setIsReader] = useState(user?.is_available_as_reader)
    const [startTime, setStartTime] = useState(new Date())
    const [endTime, setEndTime] = useState(new Date())
    const [availability, setAvailability] = useState([])
    const [showAvailabilityForm, setShowAvailabilityForm] = useState(false)
    const [newAvailability, setNewAvailability] = useState({ day: "", start: "", end: ""})
    const [gender, setGender] = useState(user?.gender || 'None Specified')
    const [sessionType, setSessionType] = useState(user?.sessionType || { inPerson: false, virtual: false, coaching: false })
    const [password, setPassword] = useState(''); 
    const [profileImage, setProfileImage] = useState(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        setUsername(user?.username)
        setLocation(user?.location)
        setGender(user?.gender)
        
        if (user && user.id) { 
            fetchUserDetails(user.id)
        }

    }, [user])

    const fetchUserDetails = (userId) => {
        fetch(`/users/${userId}`)
            .then(response => response.json())
            .then(data => {
                
                setGender(data.gender)
                setIsReader(data.is_available_as_reader)
                setAvailability(data.availabilities)
                setSessionType({
                    inPerson: data.available_in_person,
                    virtual: data.available_virtual,
                    coaching: data.available_coaching
                })
            })
            .catch(error => console.error('There was a problem with the request:', error));
    };


    const handleUpdate = () => {
        const formData = new FormData()

        formData.append('username', username)
        formData.append('location', location)
        formData.append('is_available_as_reader', isReader)
        formData.append('gender', gender)
        formData.append('available_in_person', sessionType.inPerson);
        formData.append('available_virtual', sessionType.virtual);
        formData.append('available_coaching', sessionType.coaching);
        if (password) formData.append('password', password)
        if (profileImage) formData.append('profile_image', profileImage)
        
    

        fetch(`/users/${user.id}`, {
            method: "PATCH",
            body: formData
        })
        .then(r => {
            if (r.ok){
                return r.json()
            } else {
                throw new Error("Error updating profile")
            }
        })
        .then(data => {
            if (data.username){
                setUsername(data.username)
            }
            if (data.location){
                setLocation(data.location)
            }
            if (data.profile_image){
                setProfileImage(data.profile_image)
            }
            if (data.is_available_as_reader !== undefined) {  
                setIsReader(data.is_available_as_reader);
            }
            if (data.gender){
                setGender(data.gender)
            }
            if (data.available_in_person){
                setSessionType(data.available_in_person)
            }
            setUser(data)
            setEditMode(false)
        })
        .catch(error => {
            console.error("error updating profile")
        })
    }

    const handleDelete = () => {
        fetch(`/users/${user.id}`, {
            method: "DELETE" })
            .then( r => {
                if(r.ok) {
                    setUser(null)
                    navigate('/')
                }
            })
    }

    const handleDeleteAvailability = (availabilityToDelete, e) => {
        e.preventDefault()

        fetch(`/availabilities/${availabilityToDelete.id}`, {
            method: 'DELETE' })
            .then( r => {
                if(r.ok) {
                    setAvailability(prevAvailability => prevAvailability.filter(a => a.id !== availabilityToDelete.id));
                } else {
                    console.log("Failed to delete availability")
                }
            })
            .catch(error => console.error('Issuing with deleting:', error))
        }
        

    const formatAvailability = (availability) => {
        
    const groupedByDay = {};
    
    if (availability && Array.isArray(availability)){
        availability.forEach(avail => {
            const day = avail.day_of_week
            const startTime = moment(avail.start_time, "HH:mm").format('h:mm A')
            const endTime = moment(avail.end_time, "HH:mm").format('h:mm A')

            if (!groupedByDay[day]) {
            groupedByDay[day] = []
            }
            
            groupedByDay[day].push(`${startTime}-${endTime}`)
        })}

        return Object.keys(groupedByDay).map(day => (
            <div className="availability-item" key={day}>
                {day}s: {groupedByDay[day].join(", ")}
            </div>
        ))
    }


    const handleNewAvail = (e) => {
        e.preventDefault()
        const payload = {
        user_id: user.id,
        day_of_week: newAvailability.day,
        start_time: newAvailability.start,
        end_time: newAvailability.end
    }

    fetch('/availabilities', {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
    })
    .then(r => {
        if (r.ok) {
            return r.json()
        } else {
            throw new Error('Failed to create availability')
        }
    })
    .then(data => {
        console.log('Success:', data)
        setAvailability([...availability, data])
        setShowAvailabilityForm(!showAvailabilityForm)
    })
    .catch(error => {
        console.error('Error:', error)
    })
    
    }

    return (
        <Container>
            <Row className="justify-content-center">
                <Col lg={10} md={12} xs={12}>
                    <Card className="custom-card">
                        <Card.Body>
                            <Row>
                                <Col xs={3}>
                                    <Image src={user?.profile_image} fluid rounded style={{height: '250px'}}/>
                                    {editMode && <div>
                                                    <Button 
                                                        variant="outline-secondary" 
                                                        size="sm" 
                                                        className="my-2"
                                                        onClick={() => {fileInputRef.current.click()}}
                                                        >
                                                            Update Profile Picture</Button>
                                                
                                                    
                                                    </div>
                                            }
                                    <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={e => setProfileImage(e.target.files[0])} 
                                    />
                                    
                                </Col>


                                <Col xs={8} className="d-flex align-items-center justify-content-center">
                                    {editMode ? (
                                        <Form>
                                            <Form.Group className="inputs">
                                                <Form.Label >Update Username:</Form.Label>
                                                <Form.Control type="text" value={username} onChange={e => setUsername(e.target.value)}/>
                                            </Form.Group>
                                                
                                            <Form.Group className="inputs">
                                                <Form.Label>Update Location:</Form.Label>
                                                <Form.Control type="text" value={location} onChange={e => setLocation(e.target.value)}/>

                                            </Form.Group>
                                            <Form.Group className="inputs">
                                                <Form.Label>Update Password:</Form.Label>
                                                <Form.Control type="text" value={password} onChange={e => setPassword(e.target.value)}/>
                                            </Form.Group>
                                            <Form.Group className="inputs">
                                                <Form.Label>Gender</Form.Label>
                                                <Form.Control as= "select" value={gender} onChange={e => setGender(e.target.value)}>
                                                    <option value="">Select a gender</option>
                                                    <option value="Prefer not to choose">Prefer not to choose</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </Form.Control>
                                            </Form.Group>
                                            <Form.Group className="d-flex align-items-center justify-content-center">
                                            <Form.Label className="mr-3">Are you available to read?</Form.Label>
                                            <ToggleButtonGroup type="checkbox">
                                                <ToggleButton
                                                className="yes-or-no"
                                                variant={isReader ? 'outline-primary active' : 'outline-primary'}
                                                value={isReader}
                                                onClick={() => setIsReader(!isReader)}
                                                >
                                                {isReader ? 'Yes' : 'No'}
                                                </ToggleButton>
                                            </ToggleButtonGroup>
                                            </Form.Group>

                                            {isReader && (
                                                <div className="session-type-div ">
                                                    <div className="session-type-and-availability">
                                                        <Form.Group>
                                                            <h6>Available for Sessions-Types:</h6>
                                                            <Form.Check 
                                                                type="checkbox"
                                                                label="In-Person"
                                                                checked={sessionType.inPerson}
                                                                onChange={() => setSessionType({ ...sessionType, inPerson: !sessionType.inPerson })}
                                                            />
                                                            <Form.Check 
                                                                type="checkbox"
                                                                label="Virtual"
                                                                checked={sessionType.virtual}
                                                                onChange={() => setSessionType({ ...sessionType, virtual: !sessionType.virtual })}
                                                            />
                                                            <Form.Check 
                                                                type="checkbox"
                                                                label="Coaching"
                                                                checked={sessionType.coaching}
                                                                onChange={() => setSessionType({ ...sessionType, coaching: !sessionType.coaching })}
                                                            />
                                                        </Form.Group>
                                                        <Form.Group>
                                                            <h6 className="availability-header"> Current Availability:</h6>
                                                            <ul>
                                                                {availability && availability.length > 0 ? (
                                                                    availability.map((a, index) => (
                                                                        <li key={index}>
                                                                            {formatAvailability([a])} 
                                                                            <button className='garbage-can' type="button" onClick={(e) => handleDeleteAvailability(a,e)}>🗑</button>
                                                                        </li>
                                                                    ))
                                                                ) : (
                                                                    <li><p>No availability set.</p></li>
                                                            )}
                                                            </ul>
                                                            {showAvailabilityForm ? null : <Button onClick={() => setShowAvailabilityForm(!showAvailabilityForm)}>+ Add New</Button>}
                                                        </Form.Group>
                                                    </div>
                                                    {showAvailabilityForm && 
                                                    <div className="availability-form">
                                                        <Form>
                                                            <Form.Group>
                                                                <Form.Label>Day of Week</Form.Label>
                                                                <Form.Control className="avail-form-controls" as="select" value={newAvailability.day} onChange={e => setNewAvailability({ ...newAvailability, day: e.target.value })}>
                                                                <option value="">Select Day</option>
                                                                <option value="Monday">Monday</option>
                                                                <option value="Tuesday">Tuesday</option>
                                                                <option value="Wednesday">Wednesday</option>
                                                                <option value="Thursday">Thursday</option>
                                                                <option value="Friday">Friday</option>
                                                                <option value="Saturday">Saturday</option>
                                                                <option value="Sunday">Sunday</option>
                                                                </Form.Control>
                                                            </Form.Group>
                                                            <Form.Group>
                                                                <Form.Label>Start Time</Form.Label>
                                                                <Form.Control as="select" value={newAvailability.start} onChange={e => setNewAvailability({ ...newAvailability, start: e.target.value })}>
                                                                <option value="">Select Start Time</option>
                                                                <option value="07:00">07:00 AM</option>
                                                                <option value="07:30">07:30 AM</option>
                                                                <option value="08:00">08:00 AM</option>
                                                                <option value="08:30">08:30 AM</option>
                                                                <option value="09:00">09:00 AM</option>
                                                                <option value="09:30">09:30 AM</option>
                                                                <option value="10:00">10:00 AM</option>
                                                                <option value="10:30">10:30 AM</option>
                                                                <option value="11:00">11:00 AM</option>
                                                                <option value="11:30">11:30 AM</option>
                                                                <option value="12:00">12:00 PM</option>
                                                                <option value="12:30">12:30 PM</option>
                                                                <option value="13:00">01:00 PM</option>
                                                                <option value="13:30">01:30 PM</option>
                                                                <option value="14:00">02:00 PM</option>
                                                                <option value="14:30">02:30 PM</option>
                                                                <option value="15:00">03:00 PM</option>
                                                                <option value="15:30">03:30 PM</option>
                                                                <option value="16:00">04:00 PM</option>
                                                                <option value="16:30">04:30 PM</option>
                                                                <option value="17:00">05:00 PM</option>
                                                                <option value="17:30">05:30 PM</option>
                                                                <option value="18:00">06:00 PM</option>
                                                                <option value="18:30">06:30 PM</option>
                                                                <option value="19:00">07:00 PM</option>
                                                                <option value="19:30">07:30 PM</option>
                                                                <option value="20:00">08:00 PM</option>
                                                                <option value="20:30">08:30 PM</option>
                                                                <option value="21:00">09:00 PM</option>
                                                                <option value="21:30">09:30 PM</option>
                                                                <option value="22:00">10:00 PM</option>
                                                                
                                                                </Form.Control>
                                                            </Form.Group>

                                                            <Form.Group>
                                                                <Form.Label>End Time</Form.Label>
                                                                <Form.Control as="select" value={newAvailability.end} onChange={e => setNewAvailability({ ...newAvailability, end: e.target.value })}>
                                                                    <option value="">Select End Time</option>
                                                                    <option value="07:00">07:00 AM</option>
                                                                    <option value="07:30">07:30 AM</option>
                                                                    <option value="08:00">08:00 AM</option>
                                                                    <option value="08:30">08:30 AM</option>
                                                                    <option value="09:00">09:00 AM</option>
                                                                    <option value="09:30">09:30 AM</option>
                                                                    <option value="10:00">10:00 AM</option>
                                                                    <option value="10:30">10:30 AM</option>
                                                                    <option value="11:00">11:00 AM</option>
                                                                    <option value="11:30">11:30 AM</option>
                                                                    <option value="12:00">12:00 PM</option>
                                                                    <option value="12:30">12:30 PM</option>
                                                                    <option value="13:00">01:00 PM</option>
                                                                    <option value="13:30">01:30 PM</option>
                                                                    <option value="14:00">02:00 PM</option>
                                                                    <option value="14:30">02:30 PM</option>
                                                                    <option value="15:00">03:00 PM</option>
                                                                    <option value="15:30">03:30 PM</option>
                                                                    <option value="16:00">04:00 PM</option>
                                                                    <option value="16:30">04:30 PM</option>
                                                                    <option value="17:00">05:00 PM</option>
                                                                    <option value="17:30">05:30 PM</option>
                                                                    <option value="18:00">06:00 PM</option>
                                                                    <option value="18:30">06:30 PM</option>
                                                                    <option value="19:00">07:00 PM</option>
                                                                    <option value="19:30">07:30 PM</option>
                                                                    <option value="20:00">08:00 PM</option>
                                                                    <option value="20:30">08:30 PM</option>
                                                                    <option value="21:00">09:00 PM</option>
                                                                    <option value="21:30">09:30 PM</option>
                                                                    <option value="22:00">10:00 PM</option>
                                                                    <option value="22:30">10:30 PM</option>
                                                                    <option value="23:00">11:00 PM</option>
                                                                </Form.Control>
                                                            </Form.Group>
                                                            <Button className="submit-avail" onClick={e => handleNewAvail(e)}>Submit Availability </Button>
                                                        </Form>
                                                    
                                                    </div>
                                                    }
                                                </div>
                                            )}
                                            
                                        </Form>
                                    ) : (
                                        
                                        <div className="account-info">
                                            <div className="info-item d-flex align-items-start">
                                                <span className="account-label">Username: </span> 
                                                <span>{username}</span>
                                            </div>
                                            <div className="info-item d-flex align-items-start">
                                                <span className="account-label">Location: </span>
                                                <span>{location}</span>
                                            </div>
                                            <div className="info-item d-flex align-items-start">
                                                <span className="account-label">Gender: </span>
                                                <span>{gender}</span>
                                            </div>
                                            <div className="info-item d-flex align-items-start">
                                                <span className="account-label">Available to Read: </span>
                                                <span>{isReader ? 'Yes' : 'No'}</span>
                                            </div>
                                            {isReader ? ( 
                                                <div>
                                                    <div className="info-item d-flex align-items-start">
                                                        <span className="account-label">Session Types: </span>
                                                        <span>
                                                            {sessionType.inPerson && "In-Person"}
                                                            {sessionType.inPerson && (sessionType.virtual || sessionType.coaching) && ", "}
                                                            {sessionType.virtual && "Virtual"}
                                                            {sessionType.virtual && sessionType.coaching && ", "}
                                                            {sessionType.coaching && "Coaching"}
                                                        </span>
                                                    </div>
                                                    <div className="info-item d-flex align-items-start">
                                                        <span className="account-label">Current Availability: </span>
                                                        <span>
                                                            {availability && availability.length > 0 ? (
                                                                formatAvailability(availability)
                                                            ) : (
                                                                "N/A"
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : null}
                                            
                                        </div>
                                        
                                    )}
                                </Col>

                                <Col xs={1} className="d-flex justify-content-end align-items-start">
                                <Button 
                                className="edit-button"
                                    variant="outline-primary" 
                                    onClick={() => {
                                        setEditMode(!editMode) 

                                    }}
                                >
                                    {editMode ? "Cancel" : "Edit"}
                                </Button>
                                {editMode ? (<Button onClick={() => handleUpdate()}>Save</Button>) : null}
                                {editMode && <Button onClick={handleDelete} variant="outline-secondary" size="sm" className="mt-4 delete-account-button">Delete Account</Button>}
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default Account
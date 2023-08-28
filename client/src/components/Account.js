import {Button, Image, Col, Row, Form, Card, Container, ToggleButton, ToggleButtonGroup} from 'react-bootstrap'
import {useState, useEffect, useContext, useRef} from "react"
import {UserContext} from "../UserProvider"
import moment from 'moment';
import  "../Account.css"

function Account({navigate}){
    const {user, setUser} = useContext(UserContext)
    const [editMode, setEditMode] = useState(false)
    const [username, setUsername] = useState(user?.username)
    const [location, setLocation] = useState(user?.location)
    const [isReader, setIsReader] = useState(false)
    const [availability, setAvailability] = useState([] || 'None Specified')
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
        setIsReader(user?.isReader)
        setAvailability(user?.availability)
        setSessionType(user?.session.Type)
    }, [user])

    const handleUpdate = () => {
        const formData = new FormData()

        formData.append('username', username)
        formData.append('location', location)
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



    const formatAvailability = (availability) => {
    const groupedByDay = {};
    
    availability.forEach(avail => {
        const day = moment(avail.start_time).format('dddd')
        const startTime = moment(avail.start_time).format('h:mm A')
        const endTime = moment(avail.end_time).format('h:mm A')

        if (!groupedByDay[day]) {
        groupedByDay[day] = []
        }
        
        groupedByDay[day].push(`${startTime}-${endTime}`)
    });

    const availabilityString = Object.keys(groupedByDay)
        .map(day => {
        const times = groupedByDay[day].join(", ")
        return `${day} ${times}`
        })
        .join(", ")

    return availabilityString
    }

    return (
        <Container>
            <Row className="justify-content-center">
                <Col lg={10} md={12} xs={12}>
                    <Card className="custom-card">
                        <Card.Body>
                            <Row>
                                <Col xs={4}>
                                    <Image src={user?.profile_image} fluid rounded style={{height: '350px'}}/>
                                    {editMode && <Button 
                                                    variant="outline-secondary" 
                                                    size="sm" 
                                                    className="my-2"
                                                    onClick={() => {fileInputRef.current.click()}}
                                                    >
                                                        Update Profile Picture</Button>}
                                    <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={e => setProfileImage(e.target.files[0])} 
                                    />
                                </Col>

                                <Col xs={4} className="d-flex align-items-center justify-content-center">
                                    {editMode ? (
                                        <Form>
                                            <Form.Group >
                                                <Form.Label >Update Username:</Form.Label>
                                                <Form.Control type="text" value={username} onChange={e => setUsername(e.target.value)}/>
                                            </Form.Group>
                                                
                                            <Form.Group>
                                                <Form.Label>Update Location:</Form.Label>
                                                <Form.Control type="text" value={location} onChange={e => setLocation(e.target.value)}/>

                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label>Update Password:</Form.Label>
                                                <Form.Control type="text" value={password} onChange={e => setPassword(e.target.value)}/>
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label>Gender</Form.Label>
                                                <Form.Control as= "select" value={gender} onChange={e => setGender(e.target.value)}>
                                                    <option value="">Prefer not to choose</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </Form.Control>
                                            </Form.Group>
                                            <ToggleButtonGroup type="checkbox">
                                                <ToggleButton
                                                    variant='outline-primary'
                                                    value={isReader ? 'Yes' : 'No'}
                                                    onClick={() => setIsReader(!isReader)}
                                                    >
                                                        Available to Read
                                                    </ToggleButton>
                                            </ToggleButtonGroup>

                                            {isReader && (
                                                <div>
                                                    <h5> Current Availability</h5>
                                                    <ul>
                                                        {availability.map((a, index) => (
                                                            <li key={index}>
                                                                {formatAvailability(a)} <button onClick={() => handleDeleteAvailability(a)}>🗑</button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <Button onClick={() => setShowAvailabilityForm(!showAvailabilityForm)}>+ Add New</Button>
                                                    {showAvailabilityForm && (
                                                        <Form>
                                                            <Form.Group>
                                                                <Form.Label>Day of Week</Form.Label>
                                                                <Form.Control as="select" value={newAvailability.day} onChange={e => setNewAvailability({ ...newAvailability, day: e.target.value })}>
                                                                    <option value="Monday">Monday</option>
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </Form>
                                                    )}
                                                </div>
                                            )}
                                            <Button onClick={handleDelete} variant="outline-secondary" size="sm" className="mt-4 delete-account-button">Delete Account</Button>
                                        </Form>
                                    ) : (
                                        
                                        <div className="account-info">
                                            <div className="info-item d-flex align-items-start">
                                                <span className="account-label">Username: </span> 
                                                <span>{username}</span>
                                            </div>
                                            <div className="info-item d-flex">
                                                <span className="account-label">Location: </span>
                                                <span>{location}</span>
                                            </div>
                                            <div>
                                                <span className="account-label">Gender: </span>
                                                <span>{gender}</span>
                                            </div>
                                            <div>
                                                <span className="account-label">Available to Read: </span>
                                                <span>{user?.availableToRead ? 'Yes' : 'No'}</span>
                                            </div>
                                            <div>
                                                <span>Current Availability: </span>
                                                <span>{formatAvailability(availability)}</span>
                                            </div>
                                        </div>
                                        
                                    )}
                                </Col>

                                <Col xs={4} className="d-flex justify-content-end align-items-start">
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
import {Button, Image, Col, Row, Form, Card, Container} from 'react-bootstrap'
import {useState, useEffect, useContext, useRef} from "react"
import {UserContext} from "../UserProvider"
import  "../Account.css"

function Account({navigate}){
    const {user, setUser} = useContext(UserContext)
    const [editMode, setEditMode] = useState(false)
    const [updatePassword, setUpdatePassword] = useState(false)

    const [username, setUsername] = useState(user?.username)
    const [location, setLocation] = useState(user?.location)
    const [password, setPassword] = useState(''); 
    const [profileImage, setProfileImage] = useState(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        setUsername(user?.username || "");
        setLocation(user?.location || "");
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
                                            <Button onClick={handleDelete} variant="outline-secondary" size="sm" className="mt-4 delete-account-button">Delete Account</Button>
                                        </Form>
                                    ) : (
                                        
                                        <div className="account-info">
                                            <div className="info-item d-flex align-items-start">
                                                <span className="account-label">Username: </span> 
                                                <span>{user?.username}</span>
                                            </div>
                                            <div className="info-item d-flex">
                                                <span className="account-label">Location: </span>
                                                <span>{user?.location}</span>
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
                                        setUpdatePassword(false)
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
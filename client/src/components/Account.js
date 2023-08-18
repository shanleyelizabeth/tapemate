import {Button, Image, Col, Row, Form} from 'react-bootstrap'
import {useState, useEffect, useContext, useRef} from "react"
import {UserContext} from "../UserProvider"

function Account(){
    const {user} = useContext(UserContext)
    const [editMode, setEditMode] = useState(false)
    const [updatePassword, setUpdatePassword] = useState(false)
    const [updateUsername, setUpdateUsername] = useState(false)
    const [updateLocation, setUpdateLocation] = useState(false)
    const [username, setUsername] = useState(user?.username)
    const [location, setLocation] = useState(user?.location)
    const [password, setPassword] = useState(''); 
    const [profileImage, setProfileImage] = useState(null)
    const fileInputRef = useRef(null);

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
            setEditMode(false)
        })
        .catch(error => {
            console.error("error updating profile")
        })
    }

    const handleDelete = () => {
        console.log('hi')
    }

    return (
        <div>
            <Row>
                <Col xs={4}>
                    <Image src={user?.profile_image} fluid rounded thumbnail/>
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

                <Col xs={4}>
                    {editMode ? (
                        <Form>
                            <Form.Group>
                                {updateUsername ? (
                                    <>
                                        <Form.Label>New Username:</Form.Label>
                                        <Form.Control type="text" value={username} onChange={e => setUsername(e.target.value)}/>
                                        <Button onClick ={() => setUpdateUsername(!updateUsername)}variant="outline-secondary" size="sm" className="mt-2">Update Username</Button>
                                    </>) : 
                                        <Button onClick ={() => setUpdateUsername(true)}variant="outline-secondary" size="sm" className="mt-2">Update Username</Button>
                                }
                            </Form.Group>
                                
                            <Form.Group>
                            {updateLocation ? (
                                    <>
                                        <Form.Label>New location:</Form.Label>
                                        <Form.Control type="text" value={location} onChange={e => setLocation(e.target.value)}/>
                                        <Button onClick ={() => setUpdateLocation(!updateLocation)}variant="outline-secondary" size="sm" className="mt-2">Update Location</Button>
                                    </>) : 
                                        <Button onClick ={() => setUpdateLocation(true)}variant="outline-secondary" size="sm" className="mt-2">Update Location</Button>
                                }
                                
                            </Form.Group>
                            <Form.Group>
                                {updatePassword ? (
                                    <>
                                        <Form.Label>New Password</Form.Label>
                                        <Form.Control type="text" value={password} onChange={e => setPassword(e.target.value)}/>
                                        <Button onClick ={() => setUpdatePassword(!updatePassword)} variant="outline-secondary" size="sm" className="mt-2">Update Password</Button>
                                    </>) : 
                                    <Button onClick ={() => setUpdatePassword(true)}variant="outline-secondary" size="sm" className="mt-2">Update Password</Button>
                                }
                            </Form.Group>
                            <Button onClick={() => handleDelete()} variant="outline-secondary" size="sm" className="mt-2">Delete Account</Button>
                            
                        </Form>
                    ) : (
                        <div>
                            <h5>Username: {user?.username}</h5>
                            <p>Location: {user?.location}</p>
                        </div>
                    )}
                </Col>

                <Col xs={4} className="d-flex justify-content-end align-items-start">
                <Button 
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
        </div>
    )
}

export default Account
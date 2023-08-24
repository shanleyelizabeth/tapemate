import {useState, useEffect, useContext} from "react"
import { UserContext } from "../UserProvider"
import {Button, Form, Alert, Container} from "react-bootstrap"
import logoheader from "../logoheader.PNG"
import "../auth.css"



function Authentication({navigate}){

    const [isLogin, setLogin] = useState(0)
    const [formData, setFormData] = useState({username: "", password: "", profile_image:null})
    const [error, setError] = useState(null)

    const {user, setUser} = useContext(UserContext)

    function handleSubmit(e){
        e.preventDefault()
        const route = isLogin === 1 ? "login" : "signup"

        let requestBody
        let contentType

        if(isLogin === 1){
            requestBody = JSON.stringify(formData)
            contentType = "application/json"
        } else {
            const formdata = new FormData()
            formdata.append('username', formData.username)
            formdata.append('password', formData.password)
            if (formData.image){
                formdata.append('image', formData.image)
            }
            requestBody = formdata
            contentType = undefined
        }
        fetch(`/${route}`, {
            method: "POST",
            headers: contentType ? {"Content-Type": contentType} : {},
            body: requestBody
        })
        .then(r => {
            if (!r.ok) {
                return r.json().then(data => {
                    throw new Error(data.error || 'Request failed')
                })
            }
            return r.json()
        })
        .then( user => {
            setFormData({username: "", password: ""})
            setUser(user)
            navigate('home')
        })
        .catch ( error => {
            console.log(error)
            setError(error.message || "An error occurred. Please try again.")
            setFormData({username:"", password: ""})

            setTimeout(() => {
                setError(null);
            }, 5000);
        })
            
    }

    return (
        <Container className="authentication d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div>
                {error && <Alert variant="danger">{error}</Alert>}
            </div>
            <img src={logoheader} alt="Logo"/>
            <p className="continue">To continue, please Login or Signup.</p>
            {isLogin === 0 ?
            <div className="login-or-signup">
                <Button  className="login-button" onClick={(e) => {setLogin(1)}}>Login</Button>
                <Button  className="signup-button" onClick={(e) => {setLogin(2)}}>Signup</Button>
            </div>
            :
            <div className="login-form-div">
                <Form className="login-signup-form" onSubmit = {handleSubmit}>
                    <Form.Group controlId="username">
                        <Form.Label className="form-titles" >Username:</Form.Label>
                            <Form.Control
                                onChange = {(e) => {setFormData({...formData, username: e.target.value})}}
                                type="text"
                                name="username"
                                placeholder="username"
                                className="input-text"
                                value={formData.username}
                            />
                    </Form.Group>
                    <Form.Group controlId="password">
                    <Form.Label className="form-titles">Password:</Form.Label>
                        <Form.Control
                            onChange = {(e) => {setFormData({...formData, password: e.target.value})}}
                            type ="password"
                            name="password"
                            placeholder="password"
                            className="input-text"
                            value={formData.password}
                        />
                    </Form.Group>

                        {isLogin === 2 &&
                            <div className="signup-image-upload">
                                <Form.Group controlId="image-upload">
                                    <Form.Label className = "form-titles" >Profile Picture:</Form.Label>
                                        <Form.Control
                                            className="choose-pic"
                                            type = "file"
                                            name="image"
                                            onChange={(e) => {setFormData({...formData, image: e.target.files[0]})}}>
                                        </Form.Control>
                                    </Form.Group>
                            </div> }   
                    <Button className="submit-btn" type="submit">{isLogin === 1 ? "Login" : "Signup"}</Button>            
                </Form>
            </div>
            }

        </Container>
    )
}

export default Authentication
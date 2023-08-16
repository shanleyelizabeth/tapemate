import {useState, useEffect, useContext} from "react"
import { UserContext } from "../UserProvider"


function Authentication({navigate}){

    const [isLogin, setLogin] = useState(0)
    const [formData, setFormData] = useState({username: "", password: "", profile_image:null})
    const [error, setError] = useState(null)

    const {user, setUser} = useContext(UserContext)

    function handleSubmit(e){
        e.preventDefault()
        const route = isLogin === 1 ? "login" : "signup"

        let requestBody;
        let contentType;

        if(isLogin === 1){
            requestBody = JSON.stringify(formData);
            contentType = "application/json"
        } else {
            const formdata = new FormData();
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
        <div className="authentication">
            <div>
                {error ? <div className="error-message">{error}</div> : null}

            </div>
            <h1>Tape Mate</h1>
            <p className="continue">To continue, please Login or Signup.</p>
            {isLogin === 0 ?
            <div className="login-or-signup">
                <button onClick={(e) => {setLogin(1)}}>Login</button>
                <button onClick={(e) => {setLogin(2)}}>Signup</button>
            </div>
            :
            <div className="login-form-div">
                <form className="login-signupt-form" onSubmit = {handleSubmit}>
                    <label className="form-titles" htmlFor="username">Username:</label>
                        <input
                            onChange = {(e) => {setFormData({...formData, username: e.target.value})}}
                            type="text"
                            name="username"
                            placeholder="username"
                            className="input-text"
                            value={formData.username}
                        ></input>
                    <label className="form-titles" htmlFor="password">Password:</label>
                        <input
                            onChange = {(e) => {setFormData({...formData, password: e.target.value})}}
                            type ="password"
                            name="password"
                            placeholder="password"
                            className="input-text"
                            value={formData.password}
                        ></input>
                        {isLogin === 2 ? <div className="signup-image-upload">
                            <label className = "form-titles" htmlFor='profile_image'>Profile Picture:</label>
                                <input
                                    className="choose-pic"
                                    type = "file"
                                    name="image"
                                    onChange={(e) => {setFormData({...formData, image: e.target.files[0]})}}>
                                </input>
                        </div> : null}   
                    <button className="submit-btn" type="submit">{isLogin === 1 ? "Login" : "Signup"}</button>            
                </form>
            </div>
            }

        </div>
    )
}

export default Authentication
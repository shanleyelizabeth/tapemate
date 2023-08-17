import RequestCard from "./RequestCard"
import {useState, useEffect, useContext} from "react"
import {UserContext} from "../UserProvider"


function HomePage(){
    const [requests, setRequests] = useState([])

useEffect(() => {
    fetch('/requests')
    .then(r => r.json())
    .then(data => setRequests(data))
},[])


const openRequestCards = requests
            .filter(request => request.status === 'open')
            .map(request => {
                return <RequestCard 
                            key={request.id}
                            actor={request.actor_username}
                            actor_image={request.actor_profile_image}
                            date_time={request.date_time}
                            session_type = {request.session_type}
                            notes={request.notes}
                    />
})

    return (
        <div>
            {openRequestCards}
        </div>
    )
}

export default HomePage
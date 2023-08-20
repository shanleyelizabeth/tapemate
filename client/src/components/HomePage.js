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

const removeRequest = (request_id) => {
    const newRequests = requests.filter(request => request.id !== request_id)
    setRequests(newRequests)
}


const openRequestCards = requests
            .filter(request => request.status === 'open')
            .map(request => {
                return <RequestCard 
                            key={request.id}
                            request_id={request.id}
                            actor={request.actor_username}
                            actor_image={request.actor_profile_image}
                            date={request.date}
                            start_time={request.start_time}
                            end_time={request.end_time}
                            session_type = {request.session_type}
                            notes={request.notes}
                            actor_location={request.actor_location}
                            removeRequest={removeRequest}
                    />
})

    return (
        <div>
            {openRequestCards}
        </div>
    )
}

export default HomePage
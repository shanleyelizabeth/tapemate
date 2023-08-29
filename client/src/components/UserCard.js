import { Card, Button } from 'react-bootstrap';
import {useContext, useState} from 'react'
import {UserContext} from '../UserProvider'
import "../Card.css"

function UserCard({ username, profile_image, availability, gender, location }) {
    console.log(availability)

    return (
        <div className="card-container mb-4">
            <Card style={{ width: '18rem' }}>
                <Card.Body>
                    <div className="card-content">
                        <Card.Title>{username} ({location})</Card.Title>
                        <Card.Img src={profile_image} className="img-fluid" style={{maxWidth: '30%', margin: '0 auto'}}/>
                        <Card.Subtitle className="mb-2 text-muted">{gender}</Card.Subtitle>
                        <Card.Text>
                            Availability: 
                            {/* <ul>
                                {availability.map((avail, index) => (
                                    <li key={index}>
                                        {avail.day_of_week}: {avail.start_time} = {avail.end_time}
                                    </li>
                                ))}
                            </ul> */}
                        </Card.Text>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}

export default UserCard;




























// function UserCard({ removeRequest, actor_id, request_id, actor, actor_image, date, start_time, end_time, notes, session_type, actor_location}){
//     const {user} = useContext(UserContext)
//     const [error, setError] = useState(null)
//     const formattedDate = formatDate(date);
//     const formattedTime = formatTime(start_time, end_time)



//     const handleAccept = () => {
//         const sessionData = {
//             request_id: request_id,
//             actor_id: actor_id,
//             reader_id: user.id,
//             date: date,
//             start_time: start_time,
//             end_time: end_time,
//             session_type: session_type
//         }

//         fetch('/sessions', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(sessionData)
//         })
//         .then(r => {
//             if (!r.ok){
//                 return r.json().then(data => {
//                     throw new Error(data.error || ' Request failed')
//                 })
//         }
//         return r.json()
//         })
//         .then(data => {
//             removeRequest(request_id)
//         })
//         .catch(error => {
//                 setError("There was an error processing your request")
//         })
//     }

//     function formatDate (dateString) {
//         const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//         const date = new Date(dateString);
        
//         let day = date.getDate();
//         let month = months[date.getMonth()];
//         let year = date.getFullYear();
        
//         let suffix = "th";
//         if (day === 1 || day === 21 || day === 31) {
//             suffix = "st";
//         } else if (day === 2 || day === 22) {
//             suffix = "nd";
//         } else if (day === 3 || day === 23) {
//             suffix = "rd";
//         }

//         return `${month} ${day}${suffix}, ${year}`;
//     }

//     function formatTime (startTime, endTime) {
//         let [startHour, startMinutes] = startTime.split(":").map(Number)
//         let [endHour, endMinutes] = endTime.split(":").map(Number)

//         startMinutes = String(startMinutes).padStart(2, '0')
//         endMinutes = String(endMinutes).padStart(2,'0')
        
//         let durationHours = endHour - startHour;
//         let durationMinutes = endMinutes - startMinutes

//         let durationStr = ""
//         if (durationHours > 0) {
//             durationStr += `${durationHours} hour`
//             if (durationHours > 1) {
//                 durationStr += "s"
//             }
//         }
//         if (durationMinutes > 0) {
//             if (durationStr) {
//                 durationStr += "and"
//             }
//             durationStr += `${durationMinutes} minute`
//             if (durationMinutes > 1) {
//                 durationStr += "s"
//             }
//         }
        
//         let isPM = startHour >= 12
//         let displayHour = startHour % 12
//         displayHour = displayHour === 0 ? 12 : displayHour

//         let timeFormat = isPM ? "pm" : "am";

//         return `${displayHour}:${startMinutes} ${timeFormat} for ${durationStr}`;
//         }

//     return (
//         <>
//         {error && <div className="error">{error}</div>}
//             <div className="card-container mb-4">
//                 <Card style={{ width: '18rem' }}>
//                     <Card.Body>
//                         <div className="card-content">
//                             <Card.Title>Reader Request from {actor} ({actor_location})</Card.Title>
//                             <Card.Img src={actor_image} className="img-fluid" style={{maxWidth: '30%', margin: '0 auto'}}/>
//                             <Card.Subtitle className="mb-2 text-muted">{session_type}</Card.Subtitle>
//                             <Card.Text>
//                                 On: {formattedDate}
//                                 At: {formattedTime}
//                             </Card.Text>
//                             <Card.Subtitle className="mb-2 text-muted">{notes}</Card.Subtitle>
//                         </div>
//                         <Button onClick={handleAccept} variant="primary">Accept Request</Button>
//                     </Card.Body>
//                 </Card>
//             </div>
//         </>
//     )
// }

// export default UserCard
import { Card, Button } from 'react-bootstrap';
import {useContext, useState} from 'react'
import {UserContext} from '../UserProvider'
import moment from 'moment'
import "../Card.css"

function UserCard({ username, id, profile_image, availabilities, gender, location, virtual, in_person, coaching, setSelectedUser, openModal}) {



    const formatAvailability = (availability) => {
        const weekdays =["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        const groupedByDay = {}
        
        availabilities.forEach(avail => {
            const day = avail.day_of_week
            const startTime = moment(avail.start_time, "HH:mm").format('h:mm A')
            const endTime = moment(avail.end_time, "HH:mm").format('h:mm A')

            if (!groupedByDay[day]) {
            groupedByDay[day] = []
            }
            
            groupedByDay[day].push(`${startTime}-${endTime}`)
        })

        let prevDay = null
        let prevTime = null
        let rangeStartDay = null
        const availabilityArr = []

        weekdays.forEach((day) => {
        const times = groupedByDay[day];
        if (times) {
            const timeStr = times.join(", ");
            if (timeStr === prevTime) {
                if (rangeStartDay === null) {
                    rangeStartDay = prevDay;
                }
            } else {
                if (rangeStartDay) {
                    availabilityArr.push(`${rangeStartDay}-${prevDay}: ${prevTime}`);
                    rangeStartDay = null;
                } else if (prevDay) {
                    availabilityArr.push(`${prevDay}: ${prevTime}`);
                }
            }
            prevDay = day;
            prevTime = timeStr;
        }
    });
    
    if (rangeStartDay) {
        availabilityArr.push(`${rangeStartDay}-${prevDay}: ${prevTime}`);
    } else if (prevDay) {
        availabilityArr.push(`${prevDay}: ${prevTime}`);
    }
    
    return availabilityArr.join(", ");
}

    const handleClick= () => {
        const user = { 
            id,
            username, 
            profile_image, 
            availabilities,
            gender, 
            location, 
            virtual, 
            in_person, 
            coaching 
        }
        setSelectedUser(user)
        openModal(user)
    }

    return (
        <div className="card-container mb-4">
            <Card style={{ width: '18rem' }}>
                <Card.Body>
                    <div className="card-content">
                        <Card.Title>{username} ({location})</Card.Title>
                        <Card.Img src={profile_image} className="img-fluid" style={{maxWidth: '30%', margin: '0 auto'}}/>
                        <Card.Subtitle className="mb-2 text-muted">{gender}</Card.Subtitle>
                        <Card.Text>Available for:  
                            {in_person && 'In Person'}
                            {in_person && (virtual || coaching) && ", "}
                            {virtual && 'Virtual'} 
                            {virtual && coaching && ", "}
                            {coaching && 'Coaching'}
                        </Card.Text>
                        <Card.Subtitle className="mb-2 text-muted">
                            Availability: {formatAvailability(availabilities)}
                        </Card.Subtitle>
                        <Button onClick={handleClick}>Book {username}</Button>
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
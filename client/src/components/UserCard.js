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
                        <Card.Subtitle className="gender mb-2 text-muted">{gender}</Card.Subtitle>
                        <Card.Text >Available For: <br />
                            {in_person && 'In-Person'}
                            {in_person && (virtual || coaching) && ", "}
                            {virtual && 'Virtual'} 
                            {virtual && coaching && ", "}
                            {coaching && 'Coaching'}
                        </Card.Text>
                        <Card.Subtitle className="mb-2 text-muted">
                            Availability: <br />{formatAvailability(availabilities)}
                        </Card.Subtitle>
                        <Button onClick={handleClick}>Book {username}</Button>
                    </div>
                </Card.Body>
            </Card>

        </div>
    );
}

export default UserCard;


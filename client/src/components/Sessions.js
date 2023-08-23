import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import React, { useState, useEffect } from 'react'
import { Card, Button } from 'react-bootstrap'
import { useContext } from 'react'
import { UserContext } from '../UserProvider'
import "../Calendar.css"
import moment from 'moment'


function Sessions({navigate}){
    const [sessions, setSessions] = useState([])
    const [selectedInfo, setSelectedInfo] = useState(null)
    const [showInfo, setShowInfo] = useState(false)

    const {user} = useContext(UserContext)

    let calendarRef = React.createRef();

    const toggleView = (newView) => {
        let calendarApi = calendarRef.current.getApi();
        calendarApi.changeView(newView);
    }

    useEffect(() => {
        fetch('/sessions')
        .then(r => r.json())
        .then((sessions) => {

            const filteredSessions = sessions.filter((session) => session.actor_id === user?.id || session.reader_id === user?.id)

            const calendarData = filteredSessions.map((session) => ({
                title: session.actor_id === user?.id ? 
                    `Acting Session With ${session.reader.username}` : 
                    `Reading Session For ${session.actor.username}`,
                start: new Date(session.date + 'T' + session.start_time),
                end: new Date(session.date + 'T' + session.end_time),
                extendedProps: {
                    notes: session.notes,
                    photo: session.actor.profile_image,
                    name: session.actor.username,
                    session_type: session.session_type,
                },
                color: session.actor_id === user?.id ? '#BFD5A5' : '#A5C2F7'
            }))
            setSessions(calendarData)
        })
        
    }, [user?.id])

    const handleEventClick = (info) => {
        const {title, startStr, endStr, extendedProps} = info.event
        setSelectedInfo({
            title,
            startStr: moment(info.event.startStr).format('MMMM Do YYYY, h:mm a'),
            endStr: moment(info.event.endStr).format('h:mm a'),
            extendedProps
        })
        setShowInfo(true)
    }



    return (
        <div className="sessions-container">
            <div className="calendar-container">
                <div>
                    <Button onClick={() => toggleView('timeGridDay')}>Day View</Button>
                    <Button onClick={() => toggleView('timeGridWeek')}>Week View</Button>
                </div>
                <FullCalendar 
                className = "calendar"
                initialView="timeGridDay"
                plugins={[dayGridPlugin, timeGridPlugin]}
                ref={calendarRef}
                slotMinTime="08:00:00"
                slotMaxTime="21:30:00"
                events={sessions}
                style={{width: '100%'}}
                allDaySlot={false}
                eventClick={handleEventClick}/>
                
            </div>
            <div className="info-container">
            
                <Card style={{width: '20rem'}}>
                    {showInfo ? 
                        (<>
                            <Card.Img variant="top" style={{height: '100px', width: '75px'}} src={selectedInfo?.extendedProps.photo} />
                            <Card.Body>
                                <Card.Title> {selectedInfo?.title}</Card.Title>

                                <Card.Text>
                                    When:<br />
                                    {selectedInfo?.startStr} - {selectedInfo?.endStr}
                                </Card.Text>
                                <Card.Text>
                                    Type: <br />
                                    {selectedInfo?.extendedProps.session_type}
                                </Card.Text>
                                <Card.Text>
                                    Additional Notes: <br />
                                    {selectedInfo?.extendedProps.notes}
                                </Card.Text>
                            </Card.Body>
                        </>) : 
                        (<Card.Title>Click on an event for more information!</Card.Title>) }
                </Card>
            
            
            </div>
        </div>
    )


}

export default Sessions
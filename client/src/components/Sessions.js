import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import React, { useState, useEffect } from 'react'
import { Card, Button, Form } from 'react-bootstrap'
import { useContext } from 'react'
import { UserContext } from '../UserProvider'
import "../Calendar.css"
import moment from 'moment'


function Sessions({navigate}){
    const [sessions, setSessions] = useState([])
    const [selectedInfo, setSelectedInfo] = useState(null)
    const [showInfo, setShowInfo] = useState(false)
    const [clicked, setClicked] = useState(false)
    const [notes, setNotes] = useState('')

    const {user} = useContext(UserContext)

    let calendarRef = React.createRef();

    const toggleView = (newView) => {
        let calendarApi = calendarRef.current.getApi();
        calendarApi.changeView(newView);
    }

    const getEventTitle = (item, isActor) => {
        if (item.type === 'session_actor') {
            return `Acting Session With ${item.reader.username}`;
        }
        if (item.type === 'session_reader') {
            return `Reading Session For ${item.actor.username}`;
        }
        if (item.type === 'request_actor') {
            return `Pending Acting Request to ${item.reader_username}`;
        }
        if (item.type === 'request_reader') {
            return `${item.actor_username} is requesting you as a Reader`;
        }
    }

    const getColor = (item, isActor) => {
        if (item.type === 'session_actor') {
            return '#BFD5A5'
        }
        if (item.type === 'session_reader') {
            return '#A5C2F7'
        }
        if (item.type === 'request_actor') {
            return 'grey'
        }
        if (item.type === 'request_reader') {
            return 'red'
        }
    }

    const getProfileImage = (item, isActor) => {
        if (item.type.startsWith('session')) {
            return isActor ? item.reader?.profile_image : item.actor?.profile_image;
        } else if (item.type.startsWith('request')) {
            return isActor ? item.reader_profile_image : item.actor_profile_image;
        }
        return 'default_image_url';
    }

    const getActorName = (item, isActor) => {
        if (item.type.startsWith('session')) {
            return isActor ? item.reader?.username : item.actor?.username
        } else if (item.type.startsWith('request')) {
            return isActor ? item.reader_username : item.actor_username
        }
        return 'Unknown';
    }

    const getReaderName = (item, isActor) => {
        if (item.type.startsWith('session')) {
            return isActor ? item.actor?.username : item.reader?.username
        } else if (item.type.startsWith('request')) {
            return isActor ? item.actor_username : item.reader_username
        }
        return 'Unknown'
    }

    useEffect(() => {
        fetch('/sessions_requests')
        .then(r => r.json())
        .then((data) => {

            const items = data.data
            const calendarData = items.map((item) => {
                const isActor = item.actor_id === user?.id

                return {
                    id: item.id,
                    title: getEventTitle(item, isActor),
                    start: new Date(item.date + 'T' + item.start_time),
                    end: new Date(item.date + 'T' + item.end_time),
                    extendedProps: {
                        notes: item.notes,
                        photo: getProfileImage(item, isActor),
                        name: getActorName(item, isActor),
                        session_type: item.session_type,
                        reader_name: getReaderName(item, isActor),
                        type: item.type,
                        status: item.status,
                        actor_id: item.actor_id,
                        reader_id: item.reader_id,
                    },
                    color: getColor(item, isActor)
                }
            })
            setSessions(calendarData)
        })
        .catch(error => console.log('Fetch Error: ', error))
        
        }, [user?.id])

    const handleEventClick = (info) => {
        const {id, title, startStr, endStr, extendedProps} = info.event

        setSelectedInfo({
            id,
            title,
            type: extendedProps.type,
            startStr: moment(info.event.startStr).format('MMMM Do YYYY, h:mm a'),
            endStr: moment(info.event.endStr).format('h:mm a'),
            extendedProps
        })

        setShowInfo(true)
    }

    const handleAcceptRequest = () => {
        const startDate = moment(selectedInfo?.startStr, "MMMM Do YYYY, h:mm a");
        const endDate = moment(selectedInfo?.startStr.split(",")[0] + ", " + selectedInfo?.endStr, "MMMM Do YYYY, h:mm a");

        const sessionData = {
            actor_id: selectedInfo?.extendedProps.actor_id,
            reader_id: selectedInfo?.extendedProps.reader_id,
            date: startDate.format('YYYY-MM-DD'),  
            start_time: startDate.format('HH:mm:ss'),  
            end_time: endDate.format('HH:mm:ss'), 
            session_type: selectedInfo?.extendedProps.session_type,
            notes: selectedInfo?.extendedProps.notes,
            
        }
        console.log("Selected Info:", selectedInfo);
        console.log("Session Data:", sessionData);

        fetch('/sessions', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify(sessionData),
        })
        .then(r => r.json())
        .then(newSession => {
            console.log("New Session Response:", newSession)
            if (newSession) {
                const requestId = selectedInfo.id
                fetch(`/requests/${requestId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({status: 'accepted'}),
                })
                .then(r => r.json())
                .then(updatedRequest => {
                    if(updatedRequest) {
                        const updatedSessions = sessions.filter(session => session.id !== requestId)
                        const newSession = {
                            id: updatedRequest.newSessionId,
                        }
                            updatedSessions.push(newSession)
                            setSessions(updatedSessions)
                    }
                })
            }
        })
    }

    const handleNotes = () => {
        const sessionId = selectedInfo.id;
        
        fetch(`/sessions/${sessionId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify({notes}),
        })
        .then(r => r.json())
        .then(data => {
            const updatedSessions = sessions.map(session => {
                if (session.id === sessionId){
                    return {
                        ...session,
                        extendedProps: {
                            ...session.extendedProps,
                            notes: notes,
                        }
                    }
                }
                return session
            })
            setNotes('')
            setClicked(!clicked)
            setSessions(updatedSessions)
            setSelectedInfo(prevState => ({
                ...prevState,
                extendedProps: {
                    ...prevState.extendedProps,
                    notes: notes,
                }
            }))
        })
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
                                {console.log("Debug Type:", selectedInfo?.extendedProps.type)}
                                {console.log("Debug Status:", selectedInfo?.extendedProps.status)}

                                {selectedInfo?.type === 'request_reader' && selectedInfo?.extendedProps.status === 'open' ? (
                                    <Button onClick={handleAcceptRequest}>Accept Reading</Button>
                                ) : (selectedInfo?.type === 'session_reader' || selectedInfo?.type === 'session_actor') ? (
                                    clicked ? (
                                        <Form>
                                            <Form.Control
                                                as="textarea"
                                                value={notes}
                                                onChange={e => setNotes(e.target.value)}
                                            />
                                            <Button onClick={handleNotes}>Add Note</Button>
                                        </Form>
                                    ) : (
                                        <Button onClick={() => {setClicked(!clicked)}}>Add Session Notes</Button>
                                    )
                                ) : null}
                                
                            </Card.Body>
                        </>) : 
                        (<Card.Title>Click on an event for more information!</Card.Title>) }
                </Card>
            
            
            </div>
        </div>
    )


}

export default Sessions




// session.actor_id === user?.id ? '#BFD5A5' : '#A5C2F7'
//             const filteredSessions = sessions.filter((session) => session.actor_id === user?.id || session.reader_id === user?.id)
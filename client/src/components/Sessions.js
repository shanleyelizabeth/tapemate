import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import React, { useState, useEffect } from 'react'
import { useContext } from 'react'
import { UserContext } from '../UserProvider'
import "../Calendar.css"


function Sessions({navigate}){
    const [sessions, setSessions] = useState([])
    const [selectedInfo, setSelectedInfo] = useState(null)

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
                    `Acting session with ${session.reader.username}` : 
                    `Reading session for ${session.actor.username}`,
                start: new Date(session.date + 'T' + session.start_time),
                end: new Date(session.date + 'T' + session.end_time),
                extendedProps: {
                    notes: session.notes,
                    photo: session.actor.profile_image,
                },
                color: session.actor_id === user?.id ? 'green' : 'blue'
            }))
            setSessions(calendarData)
        })
        
    }, [user?.id])

    const handleEventClick = (info) => {
        setSelectedInfo(info.event)
    }



    return (
        <div className="sessions-container">
            <div className="calendar-container">
                <button onClick={() => toggleView('timeGridDay')}>Day View</button>
                <button onClick={() => toggleView('timeGridWeek')}>Week View</button>

                <FullCalendar 
                className = "calendar"
                initialView="timeGridDay"
                plugins={[dayGridPlugin, timeGridPlugin]}
                ref={calendarRef}
                events={sessions}
                style={{width: '100%'}}
                eventClick={handleEventClick}/>
            </div>
            <div className="info-container">
                {selectedInfo ? (
                    <div>
                        <h2 className="info-header">{selectedInfo.title}</h2>
                        <p>{selectedInfo.startStr}</p>
                        <p>{selectedInfo.endStr}</p>
                        <p>{selectedInfo.extendedProps.notes}</p>
                        <img style ={{width: '75px', height: '100px'}}src={selectedInfo.extendedProps.photo}/>
                        </div>
                ) : 
                (<p>Click on an event to see the details</p>
                )}
            </div>
        </div>
    )


}

export default Sessions
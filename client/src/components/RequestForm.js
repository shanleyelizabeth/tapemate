import {Form, Button, Col, Row, Modal} from 'react-bootstrap';
import {useState, useEffect, useContext} from "react"

import DatePicker from "react-datepicker"
import 'react-datepicker/dist/react-datepicker.css'



function RequestForm(){
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [notes, setNotes] = useState("");
    const [sessionType, setSessionType] = useState("");
    const [show, setShow] = useState(false)
    const [error, setError] = useState(null);


    const handleSubmit = (e) => {
        e.preventDefault()



        const formData = {
            date: selectedDate.toLocaleDateString("en-US", {month: 'long', day: '2-digit', year: 'numeric'}),
            start_time: startTime.toLocaleTimeString("en-US", {hour: '2-digit', minute: '2-digit', hour12: false }),
            end_time: endTime.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false }),
            notes: notes,
            session_type: sessionType
        }

        fetch('/requests',{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(formData)
        })
        .then(r => {
            if (r.ok) {
                setShow(true)
            } else {
                return r.json().then(err => {
                    throw new Error(err.error)
                })
            }
            return r.json()
        })
        .catch(error => {
            setError(error.message)
        })
    }

    const combineDateWithTime = (date, time) => {
        const combinedDateTime = new Date(date);
        combinedDateTime.setHours(time.getHours());
        combinedDateTime.setMinutes(time.getMinutes());
        combinedDateTime.setSeconds(0); 
        return combinedDateTime;
    };



    const formatDateTimeInformation = () => {


        const combinedStartTime = combineDateWithTime(selectedDate, startTime)
        const combinedEndTime = combineDateWithTime(selectedDate, endTime)

        const formattedDate = combinedStartTime.toLocaleDateString("en-US", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
        const formattedStartTime = combinedStartTime.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true })

        const durationMinutes = (combinedEndTime - combinedStartTime) / (1000 * 60)
        let durationString
        

        if(durationMinutes >= 60) {
            const hours =Math.floor(durationMinutes / 60)
            const minutes = durationMinutes % 60
            durationString = `${hours} hour${hours > 1 ? 's' : ''} ${minutes ? `and ${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`
        } else {
            durationString =`${durationMinutes} minutes`
        }
        return `${formattedDate} at ${formattedStartTime} for ${durationString}`
    }

    return (
        <div>
            <Form onSubmit={handleSubmit}>
                <Form.Group as ={Row}>
                    <Form.Label column sm='2'>Select Date:</Form.Label>
                    <Col sm="10">
                        <DatePicker
                            selected={selectedDate}
                            onChange={date => setSelectedDate(date)}
                            dateFormat="MMMM d, yyyy"
                        />
                    </Col>
                </Form.Group>

                <Form.Group as={Row}>
                    <Form.Label column sm="2">Start Time:</Form.Label>
                    <Col sm="10">
                        <DatePicker
                            selected={startTime}
                            onChange={time => setStartTime(time)}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption="Start Time"
                            dateFormat="h:mm aa"
                        />
                    </Col>
                </Form.Group>

                <Form.Group as={Row}>
                    <Form.Label column sm="2">End Time:</Form.Label>
                    <Col sm="10">
                        <DatePicker
                            selected={endTime}
                            onChange={time => setEndTime(time)}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption="End Time"
                            dateFormat="h:mm aa"
                        />
                    </Col>
                </Form.Group>

                <fieldset>
                    <Form.Group as={Row}>
                        <Form.Label as="legend" column sm={2}>
                            Session Type
                        </Form.Label>
                        <Col sm={10}>
                            <Form.Check
                                type="radio"
                                label="Virtual"
                                name="sessionType"
                                id="virtual"
                                value="virtual"
                                checked={sessionType === "virtual"}
                                onChange={e => setSessionType(e.target.value)}
                            />
                            <Form.Check
                                type="radio"
                                label="In Person"
                                name="sessionType"
                                id="in-person"
                                value="in-person"
                                checked={sessionType === "in-person"}
                                onChange={e => setSessionType(e.target.value)}
                            />
                            <Form.Check
                                type="radio"
                                label="Coaching"
                                name="sessionType"
                                id="coaching"
                                value="coaching"
                                checked={sessionType === "coaching"}
                                onChange={e => setSessionType(e.target.value)}
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row}>
                        <Form.Label column sm="2">Notes:</Form.Label>
                        <Col sm="10">
                            <Form.Control 
                                as="textarea" 
                                rows={3} 
                                value={notes} 
                                onChange={e => setNotes(e.target.value)} 
                            />
                        </Col>
                </Form.Group>
                </fieldset>
                <Button type="submit">Post Request</Button>
            </Form>
            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Request Submitted</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    You have made a request for a reader on {formatDateTimeInformation(selectedDate, startTime, endTime)}. 
                    
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default RequestForm
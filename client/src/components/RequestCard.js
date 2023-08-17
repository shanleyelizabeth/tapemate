import { Card, Button } from 'react-bootstrap';

function RequestCard({actor, actor_image, date_time, notes, session_type}){


    return (
        <Card style={{ width: '18rem' }}>
            <Card.Body>
                <Card.Title>Reader Request from {actor}</Card.Title>
                <Card.Img src={actor_image} />
                <Card.Subtitle className="mb-2 text-muted">{session_type}</Card.Subtitle>
                <Card.Text>
                    Date & Time: {date_time}
                </Card.Text>
                <Card.Subtitle className="mb-2 text-muted">{notes}</Card.Subtitle>
                <Button variant="primary">Accept Request</Button>
            </Card.Body>
        </Card>
    )
}

export default RequestCard
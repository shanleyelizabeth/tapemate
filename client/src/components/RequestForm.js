import Form from 'react-bootstrap';
import {useState, useEffect, useContext} from "react"
import {UserContext} from "../UserProvider"
import DatePicker from "react-datepicker"
import 'react-datepicker/dist/react-datepicker.css'



function RequestForm(){
    const [selected, setSelected] = useState()
    const {user} = useContext(UserContext)


    return (
        <div>
            <DatePicker 
                closeOnScroll={true}
                selected={selected}
                onChange={date => setSelected(date)}
                formatDate="MMMM d, yyyy h:mm aa"

            />
        </div>
    )
}

export default RequestForm
import "../Home.scss"
import "./index.scss"

export const AppointmentDetails = (morningSchedule, afterNoonSchedule, booked, completed, open, ...props) => {
    morningSchedule = "09.00 AM TO 01:00 PM"
    afterNoonSchedule = "02.00 PM TO 05.00 PM"
    open = 1
    completed = 10
    booked = 1

    const dimGrayColor = {color:"#696969"};
    const onGoingLabel = <div className="appointment-card pl-3 pr-3 ml-2" style={dimGrayColor}>Ongoing</div>

    const statusBanner = (booked, completed, open) => {
        return <div className="d-flex appointment-card justify-content-around">
            <div className="text-center title">
                    <div>{booked}</div>
                    <div className="mb-3">Booked</div>
            </div>
            <div className="text-center title">
                    <div>{completed}</div>
                    <div className="mb3">Completed</div>
            </div>
            <div className="text-center title" style={dimGrayColor}>
                    <div>{open}</div>
                    <div className="mb-3">Open</div>
            </div>
        </div>
    }
    const scheduleLabel = (title, value, onGoing) => {
        return <div>
            <div className="title d-flex mb-2">
                {title}: {value}
                {onGoing && onGoingLabel}
            </div>
            {statusBanner(booked, completed, open)}
        </div>
    }
    const morningScheduleElement = scheduleLabel("MORNING", morningSchedule, false)
    const afterNoonScheduleElement = scheduleLabel("AFTERNOON", afterNoonSchedule, true)

    return <>
        {morningScheduleElement}
        {afterNoonScheduleElement}
    </>
}


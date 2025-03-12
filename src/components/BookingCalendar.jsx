import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const BookingCalendar = ({ unavailableDates, onDateSelect }) => {
  const [dates, setDates] = useState([new Date(), new Date()]);

  // Convert unavailable dates (string format) into Date objects
  const formattedUnavailableDates = unavailableDates.map(dateStr => new Date(dateStr));

  const tileDisabled = ({ date }) => 
    formattedUnavailableDates.some(unavailableDate => 
      date.toDateString() === unavailableDate.toDateString()
    );

  const tileContent = ({ date }) => 
    tileDisabled({ date }) ? <span style={{ color: "red" }}></span> : null;

  const onChange = (newDates) => {
    if (Array.isArray(newDates) && newDates.length === 2) {
      setDates(newDates);
      onDateSelect(newDates[0], newDates[1]); // Call the callback with the selected dates
    }
  };

  return (
    <div>
      <h2>Select a Date Range</h2>
      <Calendar
        onChange={onChange}
        value={dates}
        tileDisabled={tileDisabled}
        tileContent={tileContent}
        selectRange={true}
      />
      <p>Selected Dates: {dates[0].toDateString()} to {dates[1].toDateString()}</p>
    </div>
  );
};

export default BookingCalendar;
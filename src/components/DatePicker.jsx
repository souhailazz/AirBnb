import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker'; // You can use a library like react-datepicker
import 'react-datepicker/dist/react-datepicker.css';

const DateRangePicker = ({ onDateChange, unavailableDates }) => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const handleChange = (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
        onDateChange(start, end);
    };

    return (
        <div>
            <DatePicker
                selected={startDate}
                onChange={handleChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                inline
                filterDate={(date) => !unavailableDates.some(unavailable => 
                    date >= new Date(unavailable.start) && date <= new Date(unavailable.end))}
            />
        </div>
    );
};

export default DateRangePicker;
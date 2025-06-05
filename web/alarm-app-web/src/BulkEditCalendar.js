import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';

const localizer = momentLocalizer(moment);

function BulkEditCalendar({ events, onSelectDates, selectedDates }) {
    const handleSelectSlot = (slotInfo) => {
        const startDate = moment(slotInfo.start).startOf('day');
        const endDate = moment(slotInfo.end).startOf('day').subtract(1, 'days'); // 終了日を1日前に調整

        let currentDate = startDate.clone();
        const newSelectedDates = [];

        while (currentDate.isSameOrBefore(endDate)) {
            const dateString = currentDate.format('YYYY-MM-DD');
            if (!selectedDates.includes(dateString)) {
                newSelectedDates.push(dateString);
            }
            currentDate.add(1, 'days');
        }

        onSelectDates([...selectedDates, ...newSelectedDates]);
    };

    const handleSelectEvent = (event) => {
        // イベントをクリックした時の処理（必要に応じて実装）
    };

    const dayPropGetter = (date) => {
        const dateString = moment(date).format('YYYY-MM-DD');
        if (selectedDates.includes(dateString)) {
            return {
                style: {
                    backgroundColor: '#e6f7ff',
                    border: '1px solid #1890ff'
                }
            };
        }
        return {};
    };

    return (
        <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            dayPropGetter={dayPropGetter}
            views={['month']}
            defaultView="month"
        />
    );
}

export default BulkEditCalendar;
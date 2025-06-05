import React from 'react';
import { Calendar, momentLocalizer, Event } from 'react-big-calendar';
import moment from 'moment';

const localizer = momentLocalizer(moment);

interface BulkEditCalendarProps {
    events: Event[];
    onSelectDates: (dates: string[]) => void;
    selectedDates: string[];
}

function BulkEditCalendar({ events, onSelectDates, selectedDates }: BulkEditCalendarProps) {
    const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
        const startDate = moment(slotInfo.start).startOf('day');
        const endDate = moment(slotInfo.end).startOf('day').subtract(1, 'days');

        let currentDate = startDate.clone();
        const newSelectedDates: string[] = [];

        while (currentDate.isSameOrBefore(endDate)) {
            const dateString = currentDate.format('YYYY-MM-DD');
            if (!selectedDates.includes(dateString)) {
                newSelectedDates.push(dateString);
            }
            currentDate.add(1, 'days');
        }

        onSelectDates([...selectedDates, ...newSelectedDates]);
    };

    const handleSelectEvent = (event: Event) => {
        // イベントをクリックした時の処理（必要に応じて実装）
    };

    const dayPropGetter = (date: Date) => {
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
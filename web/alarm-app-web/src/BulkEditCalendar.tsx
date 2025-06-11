import React, { useState } from 'react';
import { Calendar, momentLocalizer, Event, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Menu, MenuItem } from '@mui/material';

const localizer = momentLocalizer(moment);

interface CustomEvent extends Event {
    patternId?: string;
    isAlarm?: boolean;
    id?: string;
}

interface BulkEditCalendarProps {
    events: CustomEvent[];
    onSelectDates: (dates: string[]) => void;
    selectedDates: string[];
    patterns: { id: string; color: string; }[];
    onDeleteEvent?: (event: CustomEvent, deleteType: 'single' | 'future' | 'all') => void;
}

function BulkEditCalendar({ events, onSelectDates, selectedDates, patterns, onDeleteEvent }: BulkEditCalendarProps) {
    const [contextMenu, setContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
        event: CustomEvent | null;
    } | null>(null);

    const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
        const startDate = moment(slotInfo.start).startOf('day');
        const endDate = moment(slotInfo.end).startOf('day').subtract(1, 'days');

        let currentDate = startDate.clone();
        const newSelectedDates = [...selectedDates];

        while (currentDate.isSameOrBefore(endDate)) {
            const dateString = currentDate.format('YYYY-MM-DD');
            const index = newSelectedDates.indexOf(dateString);
            
            if (index === -1) {
                // 日付が選択されていない場合は追加
                newSelectedDates.push(dateString);
            } else {
                // 日付が既に選択されている場合は削除
                newSelectedDates.splice(index, 1);
            }
            
            currentDate.add(1, 'days');
        }

        onSelectDates(newSelectedDates);
    };

    const handleSelectEvent = (event: CustomEvent, e: any) => {
        if (event.patternId && e.target) {
            const rect = e.target.getBoundingClientRect();
            setContextMenu({
                mouseX: rect.left,
                mouseY: rect.top,
                event: event,
            });
        }
    };

    const handleContextMenuClose = () => {
        setContextMenu(null);
    };

    const handleDeleteOption = (deleteType: 'single' | 'future' | 'all') => {
        if (contextMenu?.event && onDeleteEvent) {
            onDeleteEvent(contextMenu.event, deleteType);
        }
        handleContextMenuClose();
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

    const eventStyleGetter = (event: CustomEvent) => {
        if (event.isAlarm) {
            return {
                style: {
                    backgroundColor: '#ffa500',
                }
            };
        }
        const pattern = patterns.find(p => p.id === event.patternId);
        return {
            style: {
                backgroundColor: pattern ? pattern.color : '#3174ad',
            }
        };
    };

    return (
        <>
            {/* @ts-ignore */}
            <Calendar
                localizer={localizer as any}
                events={events as any}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={(event, e) => handleSelectEvent(event as CustomEvent, e)}
                dayPropGetter={dayPropGetter}
                eventPropGetter={eventStyleGetter}
                views={['month']}
                defaultView="month"
            />
            <Menu
                open={contextMenu !== null}
                onClose={handleContextMenuClose}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
            >
                <MenuItem onClick={() => handleDeleteOption('single')} sx={{ fontSize: '0.875rem' }}>
                    この日のパターンのみ削除
                </MenuItem>
                <MenuItem onClick={() => handleDeleteOption('future')} sx={{ fontSize: '0.875rem' }}>
                    この日以降のパターンを削除
                </MenuItem>
                <MenuItem onClick={() => handleDeleteOption('all')} sx={{ fontSize: '0.875rem' }}>
                    このパターンをすべて削除
                </MenuItem>
            </Menu>
        </>
    );
}

export default BulkEditCalendar;
import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Container, Grid, Paper, ToggleButtonGroup, ToggleButton } from '@mui/material';
import AlarmOnIcon from '@mui/icons-material/AlarmOn';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import EditIcon from '@mui/icons-material/Edit';
import { Calendar as BigCalendar, momentLocalizer, Event as CalendarEvent } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import PatternSettingsScreen from './PatternSettingsScreen';
import AlarmForm from './AlarmForm';
import BulkEditCalendar from './BulkEditCalendar';
import BulkEditForm from './BulkEditForm';

const localizer = momentLocalizer(moment);

// カスタムカレンダーコンポーネントの定義
const Calendar: React.FC<React.ComponentProps<typeof BigCalendar<CustomEvent, object>>> = (props) => (
    <BigCalendar {...props} />
);

interface CustomEvent extends CalendarEvent {
    patternId?: string;
    isAlarm?: boolean;
}

type AppMode = 'calendar' | 'bulkEdit' | 'patternSettings';

interface Alarm {
    date: string;
    time: string;
}

interface Pattern {
    id: string;
    name: string;
    color: string;
    alarms: Array<{ time: string, days: string[] }>;
    dates?: string[];
}

const App: React.FC = () => {
    const [alarms, setAlarms] = useState<Alarm[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [patterns, setPatterns] = useState<Pattern[]>([]);
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [mode, setMode] = useState<AppMode>('calendar');

    const addAlarm = (newAlarm: Alarm) => {
        setAlarms(prevAlarms => [...prevAlarms, newAlarm]);
    };

    const setPattern = (date: string, patternId: string) => {
        if (!date || !patternId) return;

        setPatterns(prevPatterns => {
            return prevPatterns.map(p => {
                if (p.id === patternId) {
                    return {
                        ...p,
                        dates: [...(p.dates || []), date]
                    };
                }
                return p;
            });
        });
    };

    const handleSelectSlot = (slotInfo: { start: Date }) => {
        const selectedDate = moment(slotInfo.start).startOf('day').toDate();
        setSelectedDate(selectedDate);
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

    const events: CustomEvent[] = [
        ...patterns.flatMap(pattern =>
            (pattern.dates || []).flatMap(date =>
                pattern.alarms.map(alarm => {
                    const [year, month, day] = date.split('-');
                    const [hours, minutes] = alarm.time.split(':');
                    const eventDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
                    return {
                        start: eventDate,
                        end: eventDate,
                        title: `${pattern.name} - ${alarm.time}`,
                        patternId: pattern.id
                    };
                })
            )
        ),
        ...alarms.map(alarm => {
            const [year, month, day] = alarm.date.split('-');
            const [hours, minutes] = alarm.time.split(':');
            const eventDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
            return {
                start: eventDate,
                end: eventDate,
                title: `Alarm - ${alarm.time}`,
                isAlarm: true
            };
        })
    ];

    const handleBulkApplyPattern = (patternId: string) => {
        selectedDates.forEach(date => {
            setPattern(date, patternId);
        });
        setSelectedDates([]);
    };

    const handleModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: AppMode | null) => {
        if (newMode !== null) {
            setMode(newMode);
        }
    };

    return (
        <div className="App">
            <AppBar position="static">
                <Toolbar>
                    <AlarmOnIcon sx={{ marginRight: '10px' }} />
                    <Typography variant="h6" style={{ flexGrow: 1 }}>
                        Pattern Alarm App
                    </Typography>
                    <ToggleButtonGroup
                        value={mode}
                        exclusive
                        onChange={handleModeChange}
                        aria-label="app mode"
                    >
                        <ToggleButton value="calendar" aria-label="calendar mode">
                            <CalendarViewMonthIcon />
                        </ToggleButton>
                        <ToggleButton value="bulkEdit" aria-label="bulk edit mode">
                            <EditIcon />
                        </ToggleButton>
                        <ToggleButton value="patternSettings" aria-label="pattern settings">
                            <AlarmOnIcon />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Toolbar>
            </AppBar>
            <Container maxWidth="lg" sx={{ marginTop: '20px' }}>
                {mode === 'patternSettings' ? (
                    <PatternSettingsScreen patterns={patterns} setPatterns={setPatterns} />
                ) : mode === 'bulkEdit' ? (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper sx={{ padding: '20px', height: '500px' }}>
                                <BulkEditCalendar
                                    events={events}
                                    onSelectDates={setSelectedDates}
                                    selectedDates={selectedDates}
                                />
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper sx={{ padding: '20px' }}>
                                <BulkEditForm
                                    selectedDates={selectedDates}
                                    patterns={patterns}
                                    onApplyPattern={handleBulkApplyPattern}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                ) : (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper sx={{ padding: '20px', height: '500px' }}>
                                <Calendar
                                    localizer={localizer}
                                    events={events}
                                    startAccessor="start"
                                    endAccessor="end"
                                    style={{ height: '100%' }}
                                    selectable
                                    onSelectSlot={handleSelectSlot}
                                    eventPropGetter={eventStyleGetter}
                                    views={[Views.MONTH, Views.WEEK, Views.DAY]}
                                    defaultView={Views.MONTH}
                                />
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper sx={{ padding: '20px' }}>
                                <Typography variant="h6">
                                    {selectedDate
                                        ? `Set Pattern or Alarm for ${moment(selectedDate).format('MMMM D, YYYY')}`
                                        : 'Select a date on the calendar'}
                                </Typography>
                                <AlarmForm
                                    selectedDate={selectedDate}
                                    addAlarm={addAlarm}
                                    setPattern={setPattern}
                                    patterns={patterns}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </Container>
        </div>
    );
};

export default App;
import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Container, Grid, Paper, Button, Switch, FormControlLabel } from '@mui/material';
import AlarmOnIcon from '@mui/icons-material/AlarmOn';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import PatternSettingsScreen from './PatternSettingsScreen';
import AlarmForm from './AlarmForm';
import BulkEditCalendar from './BulkEditCalendar';
import BulkEditForm from './BulkEditForm';

const localizer = momentLocalizer(moment);

function App() {
  const [alarms, setAlarms] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().startOf('day').toDate());
  const [patterns, setPatterns] = useState([]);
  const [showPatternSettings, setShowPatternSettings] = useState(false);
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);

  const addAlarm = (newAlarm) => {
    setAlarms(prevAlarms => [...prevAlarms, newAlarm]);
  };

  const setPattern = (date, patternId) => {
    if (!date || !patternId) return;

    setPatterns(prevPatterns => {
      const newPatterns = prevPatterns.map(p => {
        if (p.id === patternId) {
          return {
            ...p,
            dates: [...(p.dates || []), date]
          };
        }
        return p;
      });
      return newPatterns;
    });
  };

  const handleSelectSlot = (slotInfo) => {
    const newSelectedDate = moment(slotInfo.start).startOf('day').toDate();
    setSelectedDate(newSelectedDate);
    console.log("Selected date:", newSelectedDate.toISOString());
  };

  const eventStyleGetter = (event, start, end, isSelected) => {
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

  const dayPropGetter = (date) => {
    if (moment(date).isSame(selectedDate, 'day')) {
      return {
        style: {
          backgroundColor: '#e6f7ff',
          border: '1px solid #1890ff'
        }
      };
    }
    return {};
  };

  const handleBulkEditToggle = () => {
    setIsBulkEditMode(!isBulkEditMode);
    setSelectedDates([]); // 一括編集モードを切り替えるときに選択をリセット
  };

  const handleDateSelection = (dates) => {
    setSelectedDates(dates);
  };

  const applyPatternToDates = (patternId) => {
    // 選択された日付すべてにパターンを適用
    const updatedPatterns = patterns.map(pattern => {
      if (pattern.id === patternId) {
        return {
          ...pattern,
          dates: [...new Set([...pattern.dates, ...selectedDates])]
        };
      }
      return pattern;
    });
    setPatterns(updatedPatterns);
    setSelectedDates([]); // 適用後に選択をリセット
  };

  const events = [
    ...patterns.flatMap(pattern =>
      (pattern.dates || []).flatMap(date =>
        pattern.alarms.map(alarm => {
          const [year, month, day] = date.split('-');
          const [hours, minutes] = alarm.time.split(':');
          const eventDate = new Date(year, month - 1, parseInt(day), hours, minutes);
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
      const eventDate = new Date(year, month - 1, parseInt(day), hours, minutes);
      return {
        start: eventDate,
        end: eventDate,
        title: `Alarm - ${alarm.time}`,
        isAlarm: true
      };
    })
  ];

  useEffect(() => {
    console.log('Patterns updated:', patterns);
    console.log('Alarms updated:', alarms);
    console.log('Events generated:', events);
  }, [patterns, alarms]);

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <AlarmOnIcon sx={{ marginRight: '10px' }} />
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Pattern Alarm App
          </Typography>
          <FormControlLabel
            control={<Switch checked={isBulkEditMode} onChange={handleBulkEditToggle} />}
            label="Bulk Edit Mode"
          />
          <Button color="inherit" onClick={() => setShowPatternSettings(!showPatternSettings)}>
            {showPatternSettings ? 'Show Calendar' : 'Manage Patterns'}
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ marginTop: '20px' }}>
        {showPatternSettings ? (
          <PatternSettingsScreen patterns={patterns} setPatterns={setPatterns} />
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ padding: '20px', height: '500px' }}>
                {isBulkEditMode ? (
                  <BulkEditCalendar
                    events={events}
                    onSelectDates={handleDateSelection}
                    selectedDates={selectedDates}
                  />
                ) : (
                  <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    selectable
                    selected={selectedDate}
                    onSelectSlot={handleSelectSlot}
                    eventPropGetter={eventStyleGetter}
                    dayPropGetter={dayPropGetter}
                    onNavigate={(date) => setSelectedDate(moment(date).startOf('day').toDate())}
                  />
                )}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ padding: '20px' }}>
                <Typography variant="h6">
                  Set Pattern or Alarm
                </Typography>
                {isBulkEditMode ? (
                  <BulkEditForm
                    selectedDates={selectedDates}
                    patterns={patterns}
                    onApplyPattern={applyPatternToDates}
                  />
                ) : (
                  <AlarmForm
                    selectedDate={selectedDate}
                    addAlarm={addAlarm}
                    setPattern={setPattern}
                    patterns={patterns}
                  />
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Grid, Typography } from '@mui/material';
import moment from 'moment';

function AlarmForm({ selectedDate, addAlarm, setPattern, patterns }) {
    const [time, setTime] = useState('');
    const [selectedPattern, setSelectedPattern] = useState('');

    const formatDate = (date) => {
        return date ? moment(date).format('ddd, MMM D, YYYY') : '';
    };

    const handlePatternSubmit = (e) => {
        e.preventDefault();
        if (selectedPattern && selectedDate) {
            const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
            setPattern(formattedDate, selectedPattern);
            setSelectedPattern('');
            console.log('Pattern set:', selectedPattern, 'for date:', formattedDate);
        }
    };

    const handleAlarmSubmit = (e) => {
        e.preventDefault();
        if (time && selectedDate) {
            const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
            addAlarm({ date: formattedDate, time: time });
            setTime('');
            console.log('Alarm set:', time, 'for date:', formattedDate);
        }
    };

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                    {formatDate(selectedDate)}
                </Typography>
                <form onSubmit={handlePatternSubmit}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="pattern-select-label">Select Pattern</InputLabel>
                        <Select
                            labelId="pattern-select-label"
                            id="pattern-select"
                            value={selectedPattern}
                            onChange={(e) => setSelectedPattern(e.target.value)}
                        >
                            {patterns.map((pattern) => (
                                <MenuItem key={pattern.id} value={pattern.id}>
                                    {pattern.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        SET PATTERN
                    </Button>
                </form>
            </Grid>
            <Grid item xs={12}>
                <form onSubmit={handleAlarmSubmit}>
                    <TextField
                        label="Time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        inputProps={{
                            step: 300, // 5 min
                        }}
                        fullWidth
                        margin="normal"
                    />
                    <Button type="submit" variant="contained" color="secondary" fullWidth>
                        SET ALARM
                    </Button>
                </form>
            </Grid>
        </Grid>
    );
}

export default AlarmForm;
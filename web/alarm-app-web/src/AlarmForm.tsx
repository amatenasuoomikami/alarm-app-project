import React, { useState } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Grid, Typography, SelectChangeEvent } from '@mui/material';
import moment from 'moment';

interface Pattern {
    id: string;
    name: string;
    color: string;
    alarms: Array<{
        time: string;
        days: string[];
    }>;
}

interface AlarmFormProps {
    selectedDate: Date | null;
    addAlarm: (alarm: { date: string; time: string }) => void;
    setPattern: (date: string, patternId: string) => void;
    patterns: Pattern[];
}

function AlarmForm({ selectedDate, addAlarm, setPattern, patterns }: AlarmFormProps) {
    const [time, setTime] = useState('');
    const [selectedPattern, setSelectedPattern] = useState('');

    const formatDate = (date: Date | null): string => {
        return date ? moment(date).format('ddd, MMM D, YYYY') : '';
    };

    const handlePatternSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedPattern && selectedDate) {
            const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
            setPattern(formattedDate, selectedPattern);
            setSelectedPattern('');
            console.log('Pattern set:', selectedPattern, 'for date:', formattedDate);
        }
    };

    const handleAlarmSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (time && selectedDate) {
            const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
            addAlarm({ date: formattedDate, time: time });
            setTime('');
            console.log('Alarm set:', time, 'for date:', formattedDate);
        }
    };

    console.log("AlarmForm received date:", selectedDate ? selectedDate.toISOString() : 'No date');

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h6">Set Pattern for {formatDate(selectedDate)}</Typography>
                <form onSubmit={handlePatternSubmit}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="pattern-select-label">Select Pattern</InputLabel>
                        <Select
                            labelId="pattern-select-label"
                            id="pattern-select"
                            value={selectedPattern}
                            onChange={(e: SelectChangeEvent) => setSelectedPattern(e.target.value)}
                        >
                            {patterns.map((pattern) => (
                                <MenuItem key={pattern.id} value={pattern.id}>
                                    {pattern.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Set Pattern
                    </Button>
                </form>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h6">Set Alarm for {formatDate(selectedDate)}</Typography>
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
                        Set Alarm
                    </Button>
                </form>
            </Grid>
        </Grid>
    );
}

export default AlarmForm;
import React, { useState } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Grid, Typography, SelectChangeEvent } from '@mui/material';
import moment from 'moment';
import { Pattern } from './api/patterns';

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
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ fontSize: '0.9rem', fontWeight: 'bold', mb: 1 }}>
                    パターン設定
                </Typography>
                <form onSubmit={handlePatternSubmit}>
                    <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                        <InputLabel id="pattern-select-label" sx={{ fontSize: '0.875rem' }}>
                            パターンを選択
                        </InputLabel>
                        <Select
                            labelId="pattern-select-label"
                            id="pattern-select"
                            value={selectedPattern}
                            onChange={(e: SelectChangeEvent) => setSelectedPattern(e.target.value)}
                            sx={{ fontSize: '0.875rem' }}
                        >
                            {patterns.map((pattern) => (
                                <MenuItem key={pattern.id} value={pattern.id} sx={{ fontSize: '0.875rem' }}>
                                    {pattern.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        fullWidth 
                        size="small"
                        sx={{ fontSize: '0.8rem' }}
                    >
                        パターン設定
                    </Button>
                </form>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ fontSize: '0.9rem', fontWeight: 'bold', mb: 1 }}>
                    アラーム設定
                </Typography>
                <form onSubmit={handleAlarmSubmit}>
                    <TextField
                        label="時刻"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                            sx: { fontSize: '0.875rem' }
                        }}
                        inputProps={{
                            step: 300, // 5 min
                        }}
                        fullWidth
                        size="small"
                        sx={{ 
                            mb: 1,
                            '& .MuiInputBase-input': { fontSize: '0.875rem' }
                        }}
                    />
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="secondary" 
                        fullWidth 
                        size="small"
                        sx={{ fontSize: '0.8rem' }}
                    >
                        アラーム設定
                    </Button>
                </form>
            </Grid>
        </Grid>
    );
}

export default AlarmForm;
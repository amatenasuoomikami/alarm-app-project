import React, { useState, useEffect } from 'react';
import { TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Checkbox, FormGroup, FormControlLabel, FormHelperText } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { fetchPatterns, createPattern } from './api/patterns';

interface Pattern {
    id: string;
    name: string;
    color: string;
    alarms: Array<{
        time: string;
        days: string[];
    }>;
}

interface PatternSettingsScreenProps {
    patterns: Pattern[];
    setPatterns: React.Dispatch<React.SetStateAction<Pattern[]>>;
}

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function PatternSettingsScreen({ patterns, setPatterns }: PatternSettingsScreenProps) {
    const [open, setOpen] = useState(false);
    const [currentPattern, setCurrentPattern] = useState<Pattern>({ id: '', name: '', color: '#000000', alarms: [] });
    const [nameError, setNameError] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        fetchPatterns()
            .then(data => {
                setPatterns(data.patterns || []);
                setError(null);
            })
            .catch(e => setError('パターン一覧の取得に失敗しました'))
            .finally(() => setLoading(false));
    }, [setPatterns]);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setCurrentPattern({ id: '', name: '', color: '#000000', alarms: [] });
        setNameError('');
    };

    const validatePatternName = (name: string): boolean => {
        if (!name || name.trim() === '') {
            setNameError('Pattern name is required');
            return false;
        }
        setNameError('');
        return true;
    };

    const handleSave = async () => {
        if (!validatePatternName(currentPattern.name)) {
            return;
        }
        setLoading(true);
        try {
            if (!currentPattern.id) {
                const res = await createPattern({
                    name: currentPattern.name,
                    color: currentPattern.color,
                    times: currentPattern.alarms.map(a => ({ time: a.time, sound: '' }))
                });
                setPatterns(prev => [...prev, { ...currentPattern, id: res.pattern_id }]);
            } else {
                setPatterns(patterns.map(p => p.id === currentPattern.id ? currentPattern : p));
            }
            setError(null);
            handleClose();
        } catch (e) {
            setError('パターンの保存に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        setPatterns(patterns.filter(p => p.id !== id));
    };

    const handleEdit = (pattern: Pattern) => {
        setCurrentPattern(pattern);
        setNameError('');
        handleOpen();
    };

    const handleAddAlarm = () => {
        setCurrentPattern({
            ...currentPattern,
            alarms: [...currentPattern.alarms, { time: '00:00', days: [] }]
        });
    };

    const handleAlarmChange = (index: number, field: 'time' | 'days', value: string | string[]) => {
        const newAlarms = [...currentPattern.alarms];
        newAlarms[index] = { ...newAlarms[index], [field]: value };
        setCurrentPattern({ ...currentPattern, alarms: newAlarms });
    };

    const handleDeleteAlarm = (index: number) => {
        const newAlarms = currentPattern.alarms.filter((_, i) => i !== index);
        setCurrentPattern({ ...currentPattern, alarms: newAlarms });
    };

    return (
        <div>
            {loading && <Typography color="textSecondary">Loading...</Typography>}
            {error && <Typography color="error">{error}</Typography>}
            <Button variant="contained" color="primary" onClick={handleOpen} startIcon={<AddIcon />}>
                Add Pattern
            </Button>
            <List>
                {patterns.map((pattern) => (
                    <ListItem key={pattern.id}>
                        <ListItemText
                            primary={pattern.name}
                            secondary={
                                <span style={{ color: pattern.color }}>
                                    Color: {pattern.color}, Alarms: {pattern.alarms.length}
                                </span>
                            }
                        />
                        <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(pattern)}>
                                <EditIcon />
                            </IconButton>
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(pattern.id)}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>{currentPattern.id ? 'Edit Pattern' : 'Add Pattern'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Pattern Name"
                        type="text"
                        fullWidth
                        value={currentPattern.name}
                        onChange={(e) => {
                            setCurrentPattern({ ...currentPattern, name: e.target.value });
                            validatePatternName(e.target.value);
                        }}
                        error={!!nameError}
                        helperText={nameError}
                    />
                    <TextField
                        margin="dense"
                        label="Color"
                        type="color"
                        fullWidth
                        value={currentPattern.color}
                        onChange={(e) => setCurrentPattern({ ...currentPattern, color: e.target.value })}
                    />
                    <Typography variant="h6" style={{ marginTop: '20px' }}>Alarms</Typography>
                    {currentPattern.alarms.map((alarm, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <TextField
                                margin="dense"
                                label="Time"
                                type="time"
                                value={alarm.time}
                                onChange={(e) => handleAlarmChange(index, 'time', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                            <FormGroup row>
                                {daysOfWeek.map((day) => (
                                    <FormControlLabel
                                        key={day}
                                        control={
                                            <Checkbox
                                                checked={alarm.days.includes(day)}
                                                onChange={(e) => {
                                                    const newDays = e.target.checked
                                                        ? [...alarm.days, day]
                                                        : alarm.days.filter(d => d !== day);
                                                    handleAlarmChange(index, 'days', newDays);
                                                }}
                                            />
                                        }
                                        label={day}
                                    />
                                ))}
                            </FormGroup>
                            <IconButton onClick={() => handleDeleteAlarm(index)}>
                                <DeleteIcon />
                            </IconButton>
                        </div>
                    ))}
                    <Button onClick={handleAddAlarm}>Add Alarm</Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSave} color="primary" disabled={!!nameError}>Save</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default PatternSettingsScreen;
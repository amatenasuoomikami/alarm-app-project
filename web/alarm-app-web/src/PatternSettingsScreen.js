import React, { useState } from 'react';
import { TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Checkbox, FormGroup, FormControlLabel, FormHelperText } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

function PatternSettingsScreen({ patterns, setPatterns }) {
    const [open, setOpen] = useState(false);
    const [currentPattern, setCurrentPattern] = useState({ id: null, name: '', color: '#000000', alarms: [] });
    const [nameError, setNameError] = useState('');

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setCurrentPattern({ id: null, name: '', color: '#000000', alarms: [] });
        setNameError('');
    };

    const validatePatternName = (name) => {
        if (!name || name.trim() === '') {
            setNameError('Pattern name is required');
            return false;
        }
        setNameError('');
        return true;
    };

    const handleSave = () => {
        if (!validatePatternName(currentPattern.name)) {
            return;
        }

        if (currentPattern.id) {
            setPatterns(patterns.map(p => p.id === currentPattern.id ? currentPattern : p));
        } else {
            setPatterns([...patterns, { ...currentPattern, id: Date.now(), dates: [] }]);
        }
        handleClose();
    };

    const handleDelete = (id) => {
        setPatterns(patterns.filter(p => p.id !== id));
    };

    const handleEdit = (pattern) => {
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

    const handleAlarmChange = (index, field, value) => {
        const newAlarms = [...currentPattern.alarms];
        newAlarms[index] = { ...newAlarms[index], [field]: value };
        setCurrentPattern({ ...currentPattern, alarms: newAlarms });
    };

    const handleDeleteAlarm = (index) => {
        const newAlarms = currentPattern.alarms.filter((_, i) => i !== index);
        setCurrentPattern({ ...currentPattern, alarms: newAlarms });
    };

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div>
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
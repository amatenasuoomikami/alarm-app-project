import React, { useState, useEffect } from 'react';
import { TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Checkbox, FormGroup, FormControlLabel, FormHelperText } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { fetchPatterns, createPattern, Pattern as ApiPattern, PatternTime, updatePattern } from './api/patterns';

interface Pattern extends ApiPattern {
    dates?: string[];
}

interface PatternSettingsScreenProps {
    patterns: Pattern[];
    setPatterns: React.Dispatch<React.SetStateAction<Pattern[]>>;
    reloadPatterns: () => void;
}

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function PatternSettingsScreen({ patterns, setPatterns, reloadPatterns }: PatternSettingsScreenProps) {
    const [open, setOpen] = useState(false);
    const [currentPattern, setCurrentPattern] = useState<Pattern>({
        id: '',
        user_id: '',
        name: '',
        color: '#000000',
        times: [],
        created_at: '',
        updated_at: '',
        dates: []
    });
    const [nameError, setNameError] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        fetchPatterns()
            .then(data => {
                setPatterns((data.patterns || []).map(p => ({ ...p, dates: [] })));
                setError(null);
            })
            .catch(e => setError('パターン一覧の取得に失敗しました'))
            .finally(() => setLoading(false));
    }, [setPatterns]);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setCurrentPattern({
            id: '',
            user_id: '',
            name: '',
            color: '#000000',
            times: [],
            created_at: '',
            updated_at: '',
            dates: []
        });
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

    const validatePattern = (pattern: Pattern): boolean => {
        if (!validatePatternName(pattern.name)) {
            return false;
        }
        if (pattern.times.length === 0) {
            setError('At least one alarm time is required');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validatePattern(currentPattern)) {
            return;
        }
        setLoading(true);
        try {
            console.log('Creating pattern with data:', {
                name: currentPattern.name,
                description: currentPattern.description,
                color: currentPattern.color,
                times: currentPattern.times
            });
            
            if (!currentPattern.id) {
                const res = await createPattern({
                    name: currentPattern.name,
                    description: currentPattern.description,
                    color: currentPattern.color,
                    times: currentPattern.times
                });
                setPatterns(prev => [...prev, { ...res, dates: [] }]);
            } else {
                await updatePattern(currentPattern.id, {
                    name: currentPattern.name,
                    description: currentPattern.description,
                    color: currentPattern.color,
                    times: currentPattern.times
                });
                setPatterns(patterns.map(p => p.id === currentPattern.id ? currentPattern : p));
            }
            reloadPatterns();
            setError(null);
            handleClose();
        } catch (e) {
            console.error('Failed to save pattern:', e);
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
            times: [...currentPattern.times, {
                time: '00:00',
                sound: '',
                volume: 100,
                gradual_increase: false,
                snooze_duration: 5
            }]
        });
    };

    const handleAlarmChange = (index: number, field: keyof PatternTime, value: string | number | boolean) => {
        const newTimes = [...currentPattern.times];
        newTimes[index] = { ...newTimes[index], [field]: value };
        setCurrentPattern({ ...currentPattern, times: newTimes });
    };

    const handleDeleteAlarm = (index: number) => {
        const newTimes = currentPattern.times.filter((_, i) => i !== index);
        setCurrentPattern({ ...currentPattern, times: newTimes });
    };

    return (
        <div>
            {loading && <Typography color="textSecondary">Loading...</Typography>}
            {error && <Typography color="error">{error}</Typography>}
            <Button variant="contained" color="primary" onClick={() => {
                setCurrentPattern({
                    id: '',
                    user_id: '',
                    name: '',
                    color: '#000000',
                    times: [{
                        time: '00:00',
                        sound: 'default',
                        volume: 1.0,
                        gradual_increase: false,
                        snooze_duration: 5
                    }],
                    created_at: '',
                    updated_at: '',
                    dates: []
                });
                handleOpen();
            }} startIcon={<AddIcon />}>
                Add Pattern
            </Button>
            <List>
                {patterns.map((pattern) => (
                    <ListItem key={pattern.id}>
                        <ListItemText
                            primary={pattern.name}
                            secondary={
                                <span style={{ color: pattern.color }}>
                                    Color: {pattern.color}, Alarms: {pattern.times.length}
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
                    {currentPattern.times.map((time, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <TextField
                                margin="dense"
                                label="Time"
                                type="time"
                                value={time.time}
                                onChange={(e) => handleAlarmChange(index, 'time', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                margin="dense"
                                label="Sound"
                                type="text"
                                value={time.sound}
                                onChange={(e) => handleAlarmChange(index, 'sound', e.target.value)}
                                style={{ marginLeft: '10px' }}
                            />
                            <TextField
                                margin="dense"
                                label="Volume"
                                type="number"
                                value={time.volume}
                                onChange={(e) => handleAlarmChange(index, 'volume', parseInt(e.target.value))}
                                style={{ marginLeft: '10px' }}
                                inputProps={{ min: 0, max: 100 }}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={time.gradual_increase}
                                        onChange={(e) => handleAlarmChange(index, 'gradual_increase', e.target.checked)}
                                    />
                                }
                                label="Gradual Increase"
                                style={{ marginLeft: '10px' }}
                            />
                            <TextField
                                margin="dense"
                                label="Snooze Duration (min)"
                                type="number"
                                value={time.snooze_duration}
                                onChange={(e) => handleAlarmChange(index, 'snooze_duration', parseInt(e.target.value))}
                                style={{ marginLeft: '10px' }}
                                inputProps={{ min: 1 }}
                            />
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
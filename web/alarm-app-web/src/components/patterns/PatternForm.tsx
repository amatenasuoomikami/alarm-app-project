import React, { useState } from 'react';
import {
    TextField,
    Button,
    Grid,
    Typography,
    Paper,
    IconButton,
    FormControlLabel,
    Checkbox,
    Card,
    CardContent,
    Box
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { Pattern, PatternTime, createPattern, updatePattern } from '../../api/patterns';

interface PatternFormProps {
    pattern?: Pattern;
    onComplete: () => void;
    isEditing: boolean;
}

const defaultAlarmTime: PatternTime = {
    time: '00:00',
    sound: 'default',
    volume: 100,
    gradual_increase: false,
    snooze_duration: 5
};

const PatternForm: React.FC<PatternFormProps> = ({ pattern, onComplete, isEditing }) => {
    const [name, setName] = useState(pattern?.name || '');
    const [description, setDescription] = useState(pattern?.description || '');
    const [color, setColor] = useState(pattern?.color || '#3174ad');
    const [times, setTimes] = useState<PatternTime[]>(pattern?.times || [defaultAlarmTime]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && pattern) {
                await updatePattern(pattern.id, {
                    name,
                    description,
                    color,
                    times
                });
            } else {
                await createPattern({
                    name,
                    description,
                    color,
                    times
                });
            }
            onComplete();
            // フォームをリセット
            if (!isEditing) {
                setName('');
                setDescription('');
                setColor('#3174ad');
                setTimes([defaultAlarmTime]);
            }
        } catch (error) {
            console.error('Failed to save pattern:', error);
        }
    };

    const handleAddAlarm = () => {
        setTimes([...times, { ...defaultAlarmTime }]);
    };

    const handleRemoveAlarm = (index: number) => {
        setTimes(times.filter((_, i) => i !== index));
    };

    const handleAlarmChange = (index: number, field: keyof PatternTime, value: any) => {
        const newTimes = [...times];
        newTimes[index] = { ...newTimes[index], [field]: value };
        setTimes(newTimes);
    };

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            {isEditing ? 'パターンを編集' : '新規パターンを作成'}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="パターン名"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="説明"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="カラー"
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">アラーム設定</Typography>
                            <Button
                                startIcon={<AddIcon />}
                                onClick={handleAddAlarm}
                                variant="contained"
                                color="primary"
                            >
                                アラームを追加
                            </Button>
                        </Box>

                        <Grid container spacing={2}>
                            {times.map((time, index) => (
                                <Grid item xs={12} key={index}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={12}>
                                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="subtitle1">
                                                            アラーム #{index + 1}
                                                        </Typography>
                                                        <IconButton
                                                            onClick={() => handleRemoveAlarm(index)}
                                                            disabled={times.length === 1}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Box>
                                                </Grid>

                                                <Grid item xs={12} sm={6} md={3}>
                                                    <TextField
                                                        fullWidth
                                                        label="時刻"
                                                        type="time"
                                                        value={time.time}
                                                        onChange={(e) => handleAlarmChange(index, 'time', e.target.value)}
                                                        InputLabelProps={{ shrink: true }}
                                                    />
                                                </Grid>

                                                <Grid item xs={12} sm={6} md={3}>
                                                    <TextField
                                                        fullWidth
                                                        label="サウンド"
                                                        value={time.sound}
                                                        onChange={(e) => handleAlarmChange(index, 'sound', e.target.value)}
                                                    />
                                                </Grid>

                                                <Grid item xs={12} sm={6} md={2}>
                                                    <TextField
                                                        fullWidth
                                                        label="音量"
                                                        type="number"
                                                        value={time.volume}
                                                        onChange={(e) => handleAlarmChange(index, 'volume', parseInt(e.target.value))}
                                                        inputProps={{ min: 0, max: 100 }}
                                                    />
                                                </Grid>

                                                <Grid item xs={12} sm={6} md={2}>
                                                    <TextField
                                                        fullWidth
                                                        label="スヌーズ(分)"
                                                        type="number"
                                                        value={time.snooze_duration}
                                                        onChange={(e) => handleAlarmChange(index, 'snooze_duration', parseInt(e.target.value))}
                                                        inputProps={{ min: 1 }}
                                                    />
                                                </Grid>

                                                <Grid item xs={12} md={2}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={time.gradual_increase}
                                                                onChange={(e) => handleAlarmChange(index, 'gradual_increase', e.target.checked)}
                                                            />
                                                        }
                                                        label="フェードイン"
                                                    />
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>

                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="flex-end" gap={2}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                            >
                                {isEditing ? '更新' : '作成'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default PatternForm; 
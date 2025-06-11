import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Button, Typography, SelectChangeEvent } from '@mui/material';
import { Pattern } from './api/patterns';

interface BulkEditFormProps {
    selectedDates: string[];
    patterns: Pattern[];
    onApplyPattern: (patternId: string) => void;
}

function BulkEditForm({ selectedDates, patterns, onApplyPattern }: BulkEditFormProps) {
    const [selectedPattern, setSelectedPattern] = useState('');

    const handlePatternChange = (event: SelectChangeEvent) => {
        setSelectedPattern(event.target.value);
    };

    const handleApplyPattern = () => {
        if (selectedPattern) {
            onApplyPattern(selectedPattern);
            setSelectedPattern('');
        }
    };

    return (
        <div>
            <Typography variant="subtitle1" sx={{ fontSize: '1rem', fontWeight: 'bold', mb: 2 }}>
                選択された日付にパターンを適用 ({selectedDates.length}日選択中)
            </Typography>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel id="bulk-pattern-select-label" sx={{ fontSize: '0.875rem' }}>
                    パターンを選択
                </InputLabel>
                <Select
                    labelId="bulk-pattern-select-label"
                    id="bulk-pattern-select"
                    value={selectedPattern}
                    onChange={handlePatternChange}
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
                variant="contained"
                color="primary"
                onClick={handleApplyPattern}
                disabled={!selectedPattern || selectedDates.length === 0}
                fullWidth
                size="small"
                sx={{ fontSize: '0.8rem' }}
            >
                選択した日付にパターンを適用
            </Button>
        </div>
    )
}

export default BulkEditForm;
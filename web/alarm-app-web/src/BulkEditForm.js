import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Button, Typography } from '@mui/material';

function BulkEditForm({ selectedDates, patterns, onApplyPattern }) {
    const [selectedPattern, setSelectedPattern] = useState('');

    const handlePatternChange = (event) => {
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
            <Typography variant="h6" gutterBottom>
                Apply Pattern to Selected Dates ({selectedDates.length} selected)
            </Typography>
            <FormControl fullWidth margin="normal">
                <InputLabel id="bulk-pattern-select-label">Select Pattern</InputLabel>
                <Select
                    labelId="bulk-pattern-select-label"
                    id="bulk-pattern-select"
                    value={selectedPattern}
                    onChange={handlePatternChange}
                >
                    {patterns.map((pattern) => (
                        <MenuItem key={pattern.id} value={pattern.id}>
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
            >
                Apply Pattern to Selected Dates
            </Button>
        </div>
    );
}

export default BulkEditForm;
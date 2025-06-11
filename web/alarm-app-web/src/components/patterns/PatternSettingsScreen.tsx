import React, { useState } from 'react';
import { Grid, Button, Box, Typography } from '@mui/material';
import { Pattern, createPattern } from '../../api/patterns';
import PatternList from './PatternList';
import PatternForm from './PatternForm';

interface PatternSettingsScreenProps {
    patterns: Pattern[];
    setPatterns: (patterns: Pattern[]) => void;
    reloadPatterns: () => void;
    onDeletePattern: (patternId: string) => Promise<void>;
}

const PatternSettingsScreen: React.FC<PatternSettingsScreenProps> = ({ 
    patterns, 
    setPatterns, 
    reloadPatterns,
    onDeletePattern 
}) => {
    const [editingPattern, setEditingPattern] = useState<Pattern | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const handleEditPattern = (pattern: Pattern) => {
        setEditingPattern(pattern);
        setShowCreateForm(false);
    };

    const handleCreateNew = () => {
        setEditingPattern(null);
        setShowCreateForm(true);
    };

    const handleEditComplete = () => {
        setEditingPattern(null);
        setShowCreateForm(false);
        reloadPatterns();
    };

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5">パターン管理</Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleCreateNew}
                    >
                        新規パターン作成
                    </Button>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <PatternList 
                    patterns={patterns}
                    onEdit={handleEditPattern} 
                    onDelete={onDeletePattern} 
                />
            </Grid>
            {(editingPattern || showCreateForm) && (
                <Grid item xs={12}>
                    <Box mt={3}>
                        <PatternForm
                            pattern={editingPattern || undefined}
                            onComplete={handleEditComplete}
                            isEditing={!!editingPattern}
                        />
                    </Box>
                </Grid>
            )}
        </Grid>
    );
};

export default PatternSettingsScreen; 
// src/PatternManager.js
import React, { useState } from 'react';
import { TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

function PatternManager({ patterns, setPatterns }) {
  const [open, setOpen] = useState(false);
  const [currentPattern, setCurrentPattern] = useState({ id: null, name: '', color: '#000000' });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setCurrentPattern({ id: null, name: '', color: '#000000' });
  };

  const handleSave = () => {
    if (currentPattern.id) {
      setPatterns(patterns.map(p => p.id === currentPattern.id ? currentPattern : p));
    } else {
      setPatterns([...patterns, { ...currentPattern, id: Date.now() }]);
    }
    handleClose();
  };

  const handleDelete = (id) => {
    setPatterns(patterns.filter(p => p.id !== id));
  };

  const handleEdit = (pattern) => {
    setCurrentPattern(pattern);
    handleOpen();
  };

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
                <span style={{ color: pattern.color }}>Color: {pattern.color}</span>
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
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{currentPattern.id ? 'Edit Pattern' : 'Add Pattern'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Pattern Name"
            type="text"
            fullWidth
            value={currentPattern.name}
            onChange={(e) => setCurrentPattern({ ...currentPattern, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Color"
            type="color"
            fullWidth
            value={currentPattern.color}
            onChange={(e) => setCurrentPattern({ ...currentPattern, color: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default PatternManager;
import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { Pattern } from '../../api/patterns';

interface PatternListProps {
  patterns: Pattern[];
  onEdit: (pattern: Pattern) => void;
  onDelete: (id: string) => Promise<void>;
}

const PatternList: React.FC<PatternListProps> = ({ patterns, onEdit, onDelete }) => {
  // 色を薄くする関数
  const lightenColor = (color: string, opacity: number = 0.15) => {
    // HEXカラーをRGBAに変換
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // グラデーション背景を作成する関数
  const createGradientBackground = (color: string) => {
    const lightColor = lightenColor(color, 0.1);
    const veryLightColor = lightenColor(color, 0.03);
    return `linear-gradient(135deg, ${lightColor} 0%, ${veryLightColor} 50%, #ffffff 100%)`;
  };

  return (
    <Grid container spacing={2}>
      {patterns.map((pattern) => (
        <Grid item xs={12} sm={6} md={4} key={pattern.id}>
          <Card 
            sx={{ 
              background: createGradientBackground(pattern.color),
              border: `2px solid ${lightenColor(pattern.color, 0.3)}`,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${lightenColor(pattern.color, 0.4)}`,
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    backgroundColor: pattern.color,
                    borderRadius: '50%',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }} 
                />
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                  {pattern.name}
                </Typography>
              </Box>
              {pattern.description && (
                <Typography color="text.secondary" gutterBottom sx={{ fontSize: '0.875rem' }}>
                  {pattern.description}
                </Typography>
              )}
              <Box sx={{ mt: 1 }}>
                {pattern.times.map((time, index) => (
                  <Typography key={index} variant="body2" sx={{ fontSize: '0.8rem', mb: 0.5 }}>
                    🕐 {time.time} - {time.sound}
                  </Typography>
                ))}
              </Box>
            </CardContent>
            <CardActions sx={{ pt: 0 }}>
              <IconButton 
                onClick={() => onEdit(pattern)}
                size="small"
                sx={{ 
                  color: pattern.color,
                  '&:hover': { backgroundColor: lightenColor(pattern.color, 0.1) }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton 
                onClick={() => onDelete(pattern.id)}
                size="small"
                sx={{ 
                  color: '#f44336',
                  '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default PatternList; 
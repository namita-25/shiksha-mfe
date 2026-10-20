import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  Paper,
  Grid,
} from '@mui/material';

interface CreateVideoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (videoData: any) => void;
}

export const CreateVideoModal: React.FC<CreateVideoModalProps> = ({ open, onClose, onSave }) => {
  const [title, setTitle] = useState('Life Cycle Needs | Episode 3 | Budgeting – Anita Ki Diary Ka Raaz');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('1:43');
  const [language, setLanguage] = useState('Hindi');
  const [sourceType, setSourceType] = useState<'link' | 'upload'>('link');
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=EUPk_ThuWXI');

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title,
      description,
      duration,
      language,
      sourceType,
      videoUrl,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #ECEAE5',
          pb: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F1E1C', fontSize: '18px' }}>
            Create video
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#E0E7FF',
              color: '#1E3A8A',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '4px',
              px: 1,
              py: 0.2,
            }}
          >
            BRD §6.1
          </Box>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#DCFCE7',
              color: '#14532D',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '4px',
              px: 1,
              py: 0.2,
            }}
          >
            Content type
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: '20px !important' }}>
        <Grid container spacing={3}>
          {/* Left Form: Video details & source */}
          <Grid item xs={12} md={7}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Video details card */}
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #D6D3CC', borderRadius: '8px' }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1F1E1C', mb: 1.5 }}>
                  Video details
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#1F1E1C', mb: 0.5 }}>
                      Title *
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#1F1E1C', mb: 0.5 }}>
                      Description (optional)
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      size="small"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter description..."
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#1F1E1C', mb: 0.5 }}>
                        Duration
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="e.g. 1:43"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                      />
                      <Typography variant="caption" sx={{ color: '#8A867F', fontSize: '10px' }}>
                        Shown to learners, as in the course document
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#1F1E1C', mb: 0.5 }}>
                        Language *
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          sx={{ borderRadius: '6px' }}
                        >
                          <MenuItem value="Hindi">Hindi</MenuItem>
                          <MenuItem value="English">English</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>

              {/* Video source card */}
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #D6D3CC', borderRadius: '8px' }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1F1E1C', mb: 1.5 }}>
                  Video source *
                </Typography>

                <RadioGroup
                  row
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as any)}
                  sx={{ mb: 1.5 }}
                >
                  <FormControlLabel
                    value="link"
                    control={<Radio size="small" sx={{ color: '#E6873C', '&.Mui-checked': { color: '#E6873C' } }} />}
                    label={
                      <Box>
                        <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>Video link</Typography>
                        <Typography variant="caption" sx={{ color: '#8A867F', fontSize: '11px' }}>
                          YouTube (as in course document)
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="upload"
                    control={<Radio size="small" sx={{ color: '#E6873C', '&.Mui-checked': { color: '#E6873C' } }} />}
                    label={
                      <Box>
                        <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>Upload file</Typography>
                        <Typography variant="caption" sx={{ color: '#8A867F', fontSize: '11px' }}>
                          MP4, WebM formats
                        </Typography>
                      </Box>
                    }
                  />
                </RadioGroup>

                {sourceType === 'link' ? (
                  <Box>
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#1F1E1C', mb: 0.5 }}>
                      Video URL *
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      p: 3,
                      border: '2px dashed #D6D3CC',
                      borderRadius: '6px',
                      textAlign: 'center',
                      backgroundColor: '#F9F9F8',
                    }}
                  >
                    <Typography sx={{ fontSize: '13px', color: '#6B6862' }}>
                      Drag and drop MP4 video or browse files
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          </Grid>

          {/* Right Sidebar: Preview & Used In */}
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #D6D3CC', borderRadius: '8px' }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1F1E1C', mb: 1.5 }}>
                  Preview
                </Typography>
                <Box
                  sx={{
                    height: 140,
                    backgroundColor: '#EBE9E4',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8A867F',
                    fontSize: '13px',
                  }}
                >
                  Video preview
                </Box>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, border: '1px solid #D6D3CC', borderRadius: '8px' }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1F1E1C', mb: 1 }}>
                  Used in
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B6862', fontSize: '13px' }}>
                  Not used in any course yet. Add it to a section from the section editor (+ Video).
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #ECEAE5' }}>
        <Button onClick={onClose} sx={{ color: '#6B6862' }}>
          Cancel
        </Button>
        <Button
          variant="outlined"
          onClick={handleSave}
          sx={{
            borderColor: '#D6D3CC',
            color: '#1F1E1C',
            fontWeight: 600,
            '&:hover': { borderColor: '#1F1E1C' },
          }}
        >
          Save as draft
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{
            backgroundColor: '#E6873C',
            color: '#FFFFFF',
            fontWeight: 600,
            '&:hover': { backgroundColor: '#C66C23' },
          }}
        >
          Save video
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateVideoModal;

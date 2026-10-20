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
  FormControlLabel,
  Checkbox,
  Paper,
  Grid,
} from '@mui/material';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';

interface CreatePdfModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (pdfData: any) => void;
}

export const CreatePdfModal: React.FC<CreatePdfModalProps> = ({ open, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [readingTime, setReadingTime] = useState('');
  const [language, setLanguage] = useState('Hindi');
  const [fileName, setFileName] = useState<string | null>(null);
  const [allowDownload, setAllowDownload] = useState(true);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title,
      description,
      readingTime,
      language,
      fileName,
      allowDownload,
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
            Create PDF
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
            BRD §6.1 · document
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
          {/* Left: PDF Details & File */}
          <Grid item xs={12} md={7}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Details card */}
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #D6D3CC', borderRadius: '8px' }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1F1E1C', mb: 1.5 }}>
                  PDF details
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#1F1E1C', mb: 0.5 }}>
                      Title *
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="[PDF title]"
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
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#1F1E1C', mb: 0.5 }}>
                        Reading time (min)
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={readingTime}
                        onChange={(e) => setReadingTime(e.target.value)}
                        placeholder="Optional, like video durations"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                      />
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

              {/* File upload card */}
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #D6D3CC', borderRadius: '8px' }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1F1E1C', mb: 1.5 }}>
                  File *
                </Typography>

                <Box
                  onClick={() => setFileName('Sample_Household_Budget_Worksheet.pdf')}
                  sx={{
                    p: 3,
                    border: '2px dashed #BDB9B1',
                    borderRadius: '10px',
                    backgroundColor: '#FAF9F6',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    '&:hover': { borderColor: '#E6873C', backgroundColor: '#FDF3E9' },
                  }}
                >
                  <CloudUploadOutlinedIcon sx={{ fontSize: 32, color: '#8A867F' }} />
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1C' }}>
                    Drop a PDF here or browse
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#8A867F' }}>
                    PDF only
                  </Typography>
                </Box>

                {fileName && (
                  <Box
                    sx={{
                      mt: 1.5,
                      p: 1.2,
                      border: '1px solid #D6D3CC',
                      borderRadius: '6px',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PictureAsPdfOutlinedIcon sx={{ color: '#BA1A1A' }} />
                      <Box>
                        <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>{fileName}</Typography>
                        <Typography variant="caption" sx={{ color: '#8A867F' }}>
                          1.4 MB · 4 pages
                        </Typography>
                      </Box>
                    </Box>
                    <Button size="small" onClick={() => setFileName(null)} sx={{ color: '#BA1A1A' }}>
                      Remove
                    </Button>
                  </Box>
                )}
              </Paper>
            </Box>
          </Grid>

          {/* Right: Preview, Learner Access, Used In */}
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
                  First page preview
                </Box>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, border: '1px solid #D6D3CC', borderRadius: '8px' }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1F1E1C', mb: 1 }}>
                  Learner access
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={allowDownload}
                      onChange={(e) => setAllowDownload(e.target.checked)}
                      size="small"
                      sx={{ color: '#E6873C', '&.Mui-checked': { color: '#E6873C' } }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '13px', color: '#1F1E1C' }}>
                      Allow learners to download
                    </Typography>
                  }
                />
              </Paper>

              <Paper elevation={0} sx={{ p: 2, border: '1px solid #D6D3CC', borderRadius: '8px' }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1F1E1C', mb: 1 }}>
                  Used In
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B6862', fontSize: '13px' }}>
                  Not used in any course yet. Add it to a section from the section editor (+ PDF).
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
          Save PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePdfModal;

import React, { ChangeEvent, useState } from 'react';
import HelpIcon from '@mui/icons-material/Help';
import {
  Button,
  Fab,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  Grid,
} from '@mui/material';
import { CommonDialog, CommonTextField } from '@shared-lib';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material/styles';

interface HelpDeskIssueData {
  subject: string;
  description: string;
  status: string;
  priority: string;
}

const HelpDesk = () => {
  const theme = useTheme();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [issueData, setIssueData] = useState<HelpDeskIssueData>({
    subject: '',
    description: '',
    status: '',
    priority: '',
  });

  const handleHelpClick = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleChange =
    (field: keyof HelpDeskIssueData) =>
    (
      event:
        | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | SelectChangeEvent<string>
    ) => {
      const value = event.target.value;
      setIssueData({
        ...issueData,
        [field]: value,
      });
    };

  const handleOtpSubmit = async () => {
    const { subject, description, status, priority } = issueData;
    const queryString = new URLSearchParams({
      subject,
      description,
      status,
      priority,
    }).toString();
    const frappeDeskUrl = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/helpdesk/tickets/new?${queryString}`;
    router.push(frappeDeskUrl);
  };

  return (
    <Fab
      color="primary"
      aria-label="help"
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        bgcolor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        '&:hover': {
          bgcolor: theme.palette.primary.dark,
        },
      }}
      onClick={handleHelpClick}
    >
      <HelpIcon />
      <CommonDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        header="Help desk"
        actions={
          <Button
            onClick={handleOtpSubmit}
            sx={{
              color: '#FFFFFF',
              width: '20%',
              height: '40px',
              bgcolor: '#6750A4',
              borderRadius: '50px',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Submit
          </Button>
        }
      >
        <Grid container spacing={2}>
          <Typography>We’ve sent an your issue to help desk</Typography>
          <Grid
            item
            xs={12}
            sm={6}
            md={12}
            lg={12}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              borderRadius: '20px 20px 0 0',
              padding: '15px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <CommonTextField
              label="Subject"
              value={issueData.subject}
              type="text"
              variant="outlined"
              onChange={handleChange('subject')}
            />
            <CommonTextField
              label="Description"
              type="text"
              variant="outlined"
              multiline
              rows={4}
              value={issueData.description}
              onChange={handleChange('description')}
            />
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Status</InputLabel>
              <Select
                fullWidth
                value={issueData.status}
                onChange={handleChange('status')}
              >
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Priority</InputLabel>
              <Select
                fullWidth
                value={issueData.priority}
                onChange={handleChange('priority')}
                sx={{ mt: 2 }}
              >
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CommonDialog>
    </Fab>
  );
};

export default React.memo(HelpDesk);

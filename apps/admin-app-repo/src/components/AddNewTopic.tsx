// @ts-nocheck
'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

type Resource = {
  type: string;
  id: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
};

type SubTopic = {
  name: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  resources: Resource[];
};

const resourceTypes = ['Video', 'PDF', 'Quiz'];

const AddNewTopic: React.FC = () => {
  const [subTopics, setSubTopics] = useState<SubTopic[]>([
    {
      name: '',
      startDate: null,
      endDate: null,
      resources: [{ type: '', id: '', startDate: null, endDate: null }],
    },
  ]);

  const handleSubTopicChange = (
    index: number,
    field: keyof SubTopic,
    value: string | Dayjs | null
  ) => {
    const updated = [...subTopics];
    updated[index][field] = value as any;
    setSubTopics(updated);
  };

  const handleResourceChange = (
    subIndex: number,
    resIndex: number,
    field: keyof Resource,
    value: string | Dayjs | null
  ) => {
    const updated = [...subTopics];
    updated[subIndex].resources[resIndex][field] = value as any;
    setSubTopics(updated);
  };

  const addSubTopic = () => {
    setSubTopics([
      ...subTopics,
      { name: '', startDate: null, endDate: null, resources: [] },
    ]);
  };

  const removeSubTopic = (index: number) => {
    const updated = subTopics.filter((_, i) => i !== index);
    setSubTopics(updated);
  };

  const addResource = (subIndex: number) => {
    const updated = [...subTopics];
    updated[subIndex].resources.push({
      type: '',
      id: '',
      startDate: null,
      endDate: null,
    });
    setSubTopics(updated);
  };

  const removeResource = (subIndex: number, resIndex: number) => {
    const updated = [...subTopics];
    updated[subIndex].resources = updated[subIndex].resources.filter(
      (_, i) => i !== resIndex
    );
    setSubTopics(updated);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box p={2} maxWidth={600} margin="auto">
        <TextField fullWidth label="Topic Name" margin="normal" required />
        <Box display="flex" gap={2}>
          <DatePicker label="Start Date" />
          <DatePicker label="End Date" />
        </Box>

        {subTopics.map((sub, subIndex) => (
          <Box key={subIndex} mt={4} p={2} border={1} borderRadius={2}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle2">
                Sub Topic {subIndex + 1}
              </Typography>
              <IconButton onClick={() => removeSubTopic(subIndex)}>
                <DeleteIcon />
              </IconButton>
            </Box>
            <TextField
              fullWidth
              label="Sub Topic Name"
              value={sub.name}
              onChange={(e) =>
                handleSubTopicChange(subIndex, 'name', e.target.value)
              }
              margin="normal"
            />
            <Box display="flex" gap={2}>
              <DatePicker
                label="Start Date"
                value={sub.startDate}
                onChange={(value) =>
                  handleSubTopicChange(subIndex, 'startDate', value)
                }
              />
              <DatePicker
                label="End Date"
                value={sub.endDate}
                onChange={(value) =>
                  handleSubTopicChange(subIndex, 'endDate', value)
                }
              />
            </Box>

            {sub.resources.map((res, resIndex) => (
              <Box key={resIndex} mt={2} p={2} border={1} borderRadius={2}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2">
                    Resource {resIndex + 1}
                  </Typography>
                  <IconButton
                    onClick={() => removeResource(subIndex, resIndex)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Box display="flex" gap={2}>
                  <TextField
                    select
                    label="Resource Type"
                    value={res.type}
                    onChange={(e) =>
                      handleResourceChange(
                        subIndex,
                        resIndex,
                        'type',
                        e.target.value
                      )
                    }
                    fullWidth
                  >
                    {resourceTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Resource ID"
                    value={res.id}
                    onChange={(e) =>
                      handleResourceChange(
                        subIndex,
                        resIndex,
                        'id',
                        e.target.value
                      )
                    }
                    fullWidth
                  />
                </Box>
                <Box display="flex" gap={2} mt={1}>
                  <DatePicker
                    label="Start Date"
                    value={res.startDate}
                    onChange={(value) =>
                      handleResourceChange(
                        subIndex,
                        resIndex,
                        'startDate',
                        value
                      )
                    }
                  />
                  <DatePicker
                    label="End Date"
                    value={res.endDate}
                    onChange={(value) =>
                      handleResourceChange(subIndex, resIndex, 'endDate', value)
                    }
                  />
                </Box>
              </Box>
            ))}

            <Button
              onClick={() => addResource(subIndex)}
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
            >
              Add Resource
            </Button>
          </Box>
        ))}

        <Button
          onClick={addSubTopic}
          startIcon={<AddIcon />}
          variant="outlined"
          sx={{ mt: 3 }}
        >
          Add Sub Topic
        </Button>

        {/* <Button
          variant="contained"
          fullWidth
          sx={{ mt: 4, backgroundColor: '#FEC20E', color: '#000' }}
        >
          Add
        </Button> */}
      </Box>
    </LocalizationProvider>
  );
};

export default AddNewTopic;

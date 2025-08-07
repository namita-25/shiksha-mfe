// @ts-nocheck
import React, { useEffect, useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { CircularProgress } from '@mui/material';
import { useTranslation } from 'libs/shared-lib-v2/src/lib/context/LanguageContext';

const CustomFileUpload = ({
  value = [],
  onChange,
  options = {},
  required,
  schema,
  uiSchema = {},
  rawErrors = [],
}: any) => {
  const { t } = useTranslation();
  const {
    isMultiSelect = false,
    maxSelections = 5,
    allowedFormats = [],
    isEditable = true,
  } = options;

  const isDisabled = uiSchema?.['ui:disabled'] === true;

  const [fileList, setFileList] = useState(value || []);
  const [hasInitialized, setHasInitialized] = useState(false);

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!hasInitialized) {
      if (Array.isArray(value)) {
        setFileList(value);
        if (!value || value.length === 0) {
          // Trigger RJSF to validate if empty
          onChange(undefined);
        }
      }
      setHasInitialized(true);
    }
  }, [value, hasInitialized, onChange]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: string[] = [];

    if (fileList.length + files.length > maxSelections) {
      alert(`You can upload a maximum of ${maxSelections} files.`);
      return;
    }

    for (const file of files) {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      if (allowedFormats.length && !allowedFormats.includes(extension)) {
        alert(`Invalid format: ${file.name}`);
        continue;
      }

      // Upload logic placeholder
      const uploadedUrl = await uploadToServer(file);
      newFiles.push(encodeURI(uploadedUrl));
    }

    const updatedList = [...fileList, ...newFiles];
    setFileList(updatedList);
    onChange(updatedList.length ? updatedList : undefined);
    e.target.value = '';
  };

  const uploadToServer = async (file: File) => {
    console.log(file);
    try {
      setUploading(true);

      const extension = file.name.split('.').pop()?.toLowerCase();
      const fileName = file.name.split('.')[0];

      // Step 1: Get Presigned URL
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/presigned-url?filename=${fileName}&foldername=cohort&fileType=.${extension}`
      );
      const presignedData = await res.json();

      const { url, fields } = presignedData.result;

      // Step 2: Prepare form data
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', file);

      // Step 3: Upload to S3
      const uploadRes = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');

      // Step 4: Construct the uploaded file URL
      const uploadedUrl = `${url}${fields.key}`;
      return uploadedUrl;
    } catch (err) {
      console.error('Upload failed:', err);
      alert('File upload failed. Please try again.');
      return '';
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    const updatedList = [...fileList];
    updatedList.splice(index, 1);
    setFileList(updatedList);
    onChange(updatedList.length ? updatedList : undefined);
  };

  const isImage = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase();
    return ['png', 'jpg', 'jpeg'].includes(ext);
  };

  return (
    <FormControl fullWidth error={rawErrors.length > 0} required={required}>
      <FormLabel>{t(schema?.title)}</FormLabel>
      <input
        value={value && value.length > 0 ? 'added' : ''}
        required={required}
        onChange={() => {}}
        tabIndex={-1}
        style={{
          height: 1,
          padding: 0,
          border: 0,
          opacity: 0,
        }}
        aria-hidden="true"
      />
      {/* Hidden text input to force native validation */}
      {!isDisabled && isEditable && (
        <Box mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <label htmlFor="file-upload">
            <input
              id="file-upload"
              type="file"
              hidden
              multiple={isMultiSelect}
              onChange={handleFileChange}
              accept={allowedFormats.join(',')}
            />
            <Tooltip title="Upload">
              <IconButton
                color="primary"
                component="span"
                sx={{ border: '1px dashed gray', padding: 2 }}
              >
                {uploading ? (
                  <CircularProgress size={24} />
                ) : (
                  <CloudUploadIcon />
                )}
              </IconButton>
            </Tooltip>
          </label>
          <Typography variant="body2">
            {t(`Upload File${isMultiSelect ? 's' : ''}`)}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          paddingBottom: 1,
        }}
      >
        {fileList.map((url, idx) => (
          <Box
            key={idx}
            sx={{
              width: 120,
              height: 120,
              border: '1px solid #ccc',
              borderRadius: 2,
              position: 'relative',
              flexShrink: 0,
              overflow: 'hidden',
              backgroundColor: '#f9f9f9',
            }}
          >
            {isEditable && !isDisabled && (
              <IconButton
                size="small"
                onClick={() => removeFile(idx)}
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  background: 'rgba(255,255,255,0.8)',
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            )}
            {isImage(url) ? (
              <img
                src={url}
                alt={`file-${idx}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  flexDirection: 'column',
                  color: '#555',
                }}
              >
                <InsertDriveFileIcon fontSize="large" />
                <Typography
                  variant="caption"
                  component="a"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textAlign: 'center', wordBreak: 'break-all' }}
                >
                  File {idx + 1}
                </Typography>
              </Box>
            )}
          </Box>
        ))}
      </Box>
      {/* {rawErrors.length > 0 && <FormHelperText>{rawErrors[0]}</FormHelperText>} */}
    </FormControl>
  );
};

export default CustomFileUpload;

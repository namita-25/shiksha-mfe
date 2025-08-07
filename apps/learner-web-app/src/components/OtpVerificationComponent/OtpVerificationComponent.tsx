'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Stack } from '@mui/material';

const OtpVerificationComponent = ({
  maskedNumber,
  onResend,
  otp,
  setOtp,
}: {
  maskedNumber?: string;
  onResend?: () => void;
  otp: string[];
  setOtp: any;
}) => {
  // const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [timer, setTimer] = useState(120);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) (nextInput as HTMLInputElement).focus();
    }
  };

  const handleResend = () => {
    setTimer(120);
    setOtp(['', '', '', '']);
    onResend?.();
  };

  return (
    <Box textAlign="center" p={4}>
      <Typography mb={2}>
        We’ve sent an OTP to verify your number <strong>{maskedNumber}</strong>
      </Typography>

      <Stack direction="row" justifyContent="center" spacing={2} mb={2}>
        {otp.map((digit, idx) => (
          <TextField
            key={idx}
            id={`otp-${idx}`}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && otp[idx] === '' && idx > 0) {
                const prevInput = document.getElementById(`otp-${idx - 1}`);
                if (prevInput) (prevInput as HTMLInputElement).focus();
              }
            }}
            inputProps={{
              maxLength: 1,
              style: { textAlign: 'center', fontSize: '20px' },
            }}
            sx={{ width: 50 }}
          />
        ))}
      </Stack>

      <Typography
        variant="body2"
        color="primary"
        sx={{ cursor: timer === 0 ? 'pointer' : 'default' }}
        onClick={timer === 0 ? handleResend : undefined}
      >
        {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
      </Typography>
    </Box>
  );
};
export default OtpVerificationComponent;

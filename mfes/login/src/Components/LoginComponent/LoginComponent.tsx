"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Paper,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Loader, useTranslation } from "@shared-lib"; // Updated import
import { sendOtpInterface } from "@learner/utils/API/OtPService";
import { checkUserExistenceWithTenant } from "@learner/utils/API/userService";

interface LoginComponentProps {
  onLogin: (data: {
    username: string;
    password: string;
    remember: boolean;
  }) => void;
  onVerifyOtp?: (data: {
    username: string;
    otp: string;
    remember: boolean;
  }) => void;
  handleAddAccount?: () => void;
  handleForgotPassword?: () => void;
  prefilledUsername?: string;
  onRedirectToLogin?: () => void;
}

const LoginComponent: React.FC<LoginComponentProps> = ({
  onLogin,
  onVerifyOtp,
  handleAddAccount,
  handleForgotPassword,
  prefilledUsername,
  onRedirectToLogin,
}) => {
  const { t } = useTranslation(); // Initialize translation function

  const [showPassword, setShowPassword] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [forcePasswordMode, setForcePasswordMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    otp: "",
    remember: false,
  });

  // Check if username is a mobile number (10+ digits)
  const isMobileNumber = (username: string) => {
    return /^\d{10,}$/.test(username);
  };

  // Process mobile number to handle country code
  const processMobileNumber = (mobile: string): string => {
    // Check if it's a 12-digit number starting with 91 (India country code)
    if (mobile.length === 12 && mobile.startsWith("91")) {
      return mobile.substring(2); // Remove the first 2 digits (91)
    }
    return mobile;
  };

  // Determine if we should show OTP mode
  const isOtpMode =
    prefilledUsername &&
    isMobileNumber(prefilledUsername) &&
    !forcePasswordMode;

  // Function to check user existence and send OTP
  const sendOtp = async (mobile: string) => {
    setIsSendingOtp(true);
    try {
      // Process the mobile number to handle country code
      const processedMobile = processMobileNumber(mobile);
      console.log(
        "Original mobile:",
        mobile,
        "Processed mobile:",
        processedMobile
      );

      // First check if user exists with the specific tenant ID
      const userCheckResponse = await checkUserExistenceWithTenant(
        processedMobile
      );
      console.log("User check response:", userCheckResponse);

      // Check if API returned an error (like 404 - User does not exist)
      if (
        userCheckResponse?.params?.status === "failed" ||
        userCheckResponse?.responseCode === 404
      ) {
        console.log("User does not exist, switching to username/password mode");
        setForcePasswordMode(true);
        return;
      }

      // Check if user exists and has the specific tenant ID
      const users = userCheckResponse?.result?.getUserDetails || [];
      const targetTenantId = process.env.NEXT_PUBLIC_TARGET_TENANT_ID;

      if (!users || users.length === 0) {
        console.log("No users found for this mobile number");
        setForcePasswordMode(true);
        return;
      }

      const userWithTargetTenant = users.find(
        (user: any) => user.tenantId === targetTenantId
      );

      if (userWithTargetTenant) {
        // User exists with target tenant, send OTP
        const response = await sendOtpInterface({
          mobile: processedMobile,
          reason: "signup",
          key: "SendOtpOn",
          replacements: {
            "{eventName}": "Swadaar OTP",
            "{programName}": "Swadaar",
          },
        });

        console.log("OTP sent successfully:", response);
        setOtpSent(true);
      } else {
        // User doesn't exist or doesn't have target tenant, switch to password mode
        console.log(
          "User not found with target tenant, switching to password mode"
        );
        setForcePasswordMode(true);
      }
    } catch (error) {
      console.error("Error in OTP flow:", error);
      // For any unexpected errors, switch to password mode
      setForcePasswordMode(true);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Set prefilled username if provided and send OTP if it's a mobile number
  useEffect(() => {
    if (prefilledUsername) {
      setFormData((prev) => ({
        ...prev,
        username: prefilledUsername,
      }));

      // If it's a mobile number, automatically send OTP
      if (isMobileNumber(prefilledUsername)) {
        sendOtp(prefilledUsername);
      }
    }
  }, [prefilledUsername]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    if (isOtpMode && onVerifyOtp) {
      // OTP mode
      onVerifyOtp({
        username: formData.username,
        otp: formData.otp,
        remember: formData.remember,
      });
    } else if (onLogin) {
      // Password mode
      onLogin({
        username: formData.username,
        password: formData.password,
        remember: formData.remember,
      });
    }
  };

  const handleResendOtp = () => {
    if (formData.username && isMobileNumber(formData.username)) {
      sendOtp(formData.username);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 400,
        p: 3,
        borderRadius: 2,
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 400,
            fontSize: "24px",
            lineHeight: "32px",
            letterSpacing: "0px",
            textAlign: "center",
            mb: 3,
          }}
        >
          {isOtpMode
            ? t("LEARNER_APP.LOGIN.login_title") || "Verify OTP"
            : t("LEARNER_APP.LOGIN.login_title")}
        </Typography>

        <TextField
          label={t("LEARNER_APP.LOGIN.username_label")}
          name="username"
          value={formData.username}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          margin="normal"
          disabled={Boolean(isOtpMode)} // Disable username field in OTP mode since it's prefilled
        />

        {isOtpMode ? (
          // OTP Mode
          <Box>
            <TextField
              label={t("LEARNER_APP.LOGIN.otp_label") || "Enter OTP"}
              name="otp"
              type="text"
              value={formData.otp}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              margin="normal"
              placeholder="Enter 6-digit OTP"
              inputProps={{
                maxLength: 6,
                pattern: "[0-9]*",
              }}
            />

            {/* OTP Status and Resend */}
            <Box
              mt={1}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              {isSendingOtp ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="textSecondary">
                    Sending OTP...
                  </Typography>
                </Box>
              ) : otpSent ? (
                <Typography variant="body2" color="success.main">
                  OTP sent successfully!
                </Typography>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  OTP will be sent automatically
                </Typography>
              )}

              {otpSent && (
                <Button
                  variant="text"
                  size="small"
                  onClick={handleResendOtp}
                  disabled={isSendingOtp}
                >
                  Resend OTP
                </Button>
              )}
            </Box>
          </Box>
        ) : (
          // Password Mode
          <TextField
            label={t("LEARNER_APP.LOGIN.password_label")}
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            margin="normal"
            autoComplete="new-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}

        <Box mt={1}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.remember}
                onChange={handleChange}
                name="remember"
              />
            }
            label={t("LEARNER_APP.LOGIN.remember_me")}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={Boolean(isOtpMode && !otpSent)}
          sx={{
            mt: 3,
            backgroundColor: "#FFC107",
            color: "#000",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "#ffb300",
            },
          }}
        >
          {isOtpMode
            ? t("LEARNER_APP.LOGIN.verify_otp_button") || "Verify OTP"
            : t("LEARNER_APP.LOGIN.login_button")}
        </Button>
      </form>
    </Paper>
  );
};

export default LoginComponent;

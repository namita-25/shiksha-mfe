import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Grid,
  IconButton,
  CircularProgress,
  FormHelperText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MasterDataService, { LocationOption } from '@/services/MasterDataService';
import TenantService from '@/services/TenantService';
import {
  createUserAccount,
  CreateUserPayload,
  updateUserAccount,
  UpdateUserPayload,
  getUserDetailsInfo,
} from '@/services/UserService';
import { showToastMessage } from '@/components/Toastify';
import { SWADHAAR_TENANT_ID } from '@/utils/app.constant';

export interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  availableRoles?: string[];
  initialData?: any;
  isEdit?: boolean;
}

interface FormState {
  fullName: string;
  employeeId: string;
  email: string;
  phone: string;
  gender: string;
  state: string;
  district: string;
  branch: string;
  program: string;
  role: string;
}

const initialFormState: FormState = {
  fullName: '',
  employeeId: '',
  email: '',
  phone: '',
  gender: 'Select',
  state: '',
  district: '',
  branch: '',
  program: '',
  role: '',
};

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  open,
  onClose,
  onSuccess,
  availableRoles = [],
  initialData,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState<boolean>(false);

  // Dynamic location options
  const [states, setStates] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [branches, setBranches] = useState<LocationOption[]>([]);
  const [programs, setPrograms] = useState<LocationOption[]>([]);

  // Load programs from MasterDataService
  useEffect(() => {
    setPrograms(MasterDataService.getPrograms());
  }, []);

  // Fetch states on mount / modal open
  useEffect(() => {
    if (open) {
      MasterDataService.getStates().then((res) => {
        setStates(res);
      });
    }
  }, [open]);

  // Fetch districts when state changes
  useEffect(() => {
    if (formData.state) {
      MasterDataService.getDistricts(formData.state).then((res) => {
        setDistricts(res);
      });
    } else {
      setDistricts([]);
      setBranches([]);
    }
  }, [formData.state]);

  // Fetch branches (blocks) when district changes
  useEffect(() => {
    if (formData.district) {
      MasterDataService.getBlocks(formData.district).then((res) => {
        setBranches(res);
      });
    } else {
      setBranches([]);
    }
  }, [formData.district]);

const toStr = (val: any): string => (val !== null && val !== undefined ? String(val) : '');

const formatGender = (gender?: any) => {
  if (!gender) return 'Select';
  const g = toStr(gender).trim().toLowerCase();
  if (g === 'male') return 'Male';
  if (g === 'female') return 'Female';
  if (g === 'other') return 'Other';
  return 'Select';
};

  // Reset or initialize on open
  useEffect(() => {
    if (open) {
      if (initialData && isEdit) {
        const rawEmail = toStr(initialData.email);
        const cleanEmail = rawEmail && rawEmail !== '-' ? rawEmail : '';
        const rawPhone = toStr(initialData.phone || initialData.mobile);
        const rawUsername = toStr(initialData.username);
        const cleanPhone =
          rawPhone || (/^\d{10}$/.test(rawUsername) ? rawUsername : '');
        const rawEmpId = toStr(initialData.employeeId);
        const cleanEmpId =
          rawEmpId || (!/^\d{10}$/.test(rawUsername) && rawUsername ? rawUsername : '');
        const cleanBranch =
          initialData.branch && initialData.branch !== '[Branch]'
            ? toStr(initialData.branch)
            : '';
        const cleanProgram =
          initialData.program && initialData.program !== '[Program]'
            ? toStr(initialData.program)
            : '';
        const cleanRole =
          initialData.role && initialData.role !== '-' ? toStr(initialData.role) : '';

        setFormData({
          fullName: toStr(initialData.fullName || initialData.name),
          employeeId: cleanEmpId,
          email: cleanEmail,
          phone: cleanPhone,
          gender: formatGender(initialData.gender),
          state: toStr(initialData.state),
          district: toStr(initialData.district),
          branch: cleanBranch,
          program: cleanProgram,
          role: cleanRole,
        });

        // Call getUserDetailsInfo to fetch complete profile data from server
        const targetUserId = toStr(initialData.userId || initialData.id);
        if (targetUserId) {
          getUserDetailsInfo(targetUserId)
            .then((res: any) => {
              const user = res?.result?.userData || res?.userData || res?.result || res;
              if (user) {
                setFormData((prev) => {
                  const fn = toStr(user.firstName);
                  const mn = toStr(user.middleName);
                  const ln = toStr(user.lastName);
                  const computedName =
                    toStr(user.name) || [fn, mn, ln].filter(Boolean).join(' ') || prev.fullName;
                  const uEmail = toStr(user.email);
                  const computedEmail = uEmail && uEmail !== '-' ? uEmail : prev.email;
                  const uPhone = toStr(user.mobile || user.phone);
                  const uUsername = toStr(user.username);
                  const computedPhone =
                    uPhone || (/^\d{10}$/.test(uUsername) ? uUsername : prev.phone);
                  const uEmpId = toStr(user.employeeId);
                  const computedEmpId =
                    uEmpId ||
                    (!/^\d{10}$/.test(uUsername) && uUsername
                      ? uUsername
                      : prev.employeeId);
                  const computedGender = formatGender(user.gender);
                  const computedRole =
                    toStr(user.role || user.tenantData?.[0]?.roleName) || prev.role;

                  let sVal = prev.state;
                  let dVal = prev.district;
                  let bVal = prev.branch;

                  if (Array.isArray(user.customFields)) {
                    const sField = user.customFields.find(
                      (cf: any) =>
                        cf.fieldId === '800265b1-9058-482a-94f4-726197e1dfe4' ||
                        cf.label?.toLowerCase() === 'state' ||
                        cf.name?.toLowerCase() === 'state'
                    );
                    if (sField && sField.value?.[0]) {
                      sVal = toStr(sField.value[0]);
                    }
                    const dField = user.customFields.find(
                      (cf: any) =>
                        cf.label?.toLowerCase() === 'district' ||
                        cf.name?.toLowerCase() === 'district'
                    );
                    if (dField && dField.value?.[0]) {
                      dVal = toStr(dField.value[0]);
                    }
                    const bField = user.customFields.find(
                      (cf: any) =>
                        cf.label?.toLowerCase() === 'branch' ||
                        cf.label?.toLowerCase() === 'block' ||
                        cf.name?.toLowerCase() === 'branch' ||
                        cf.name?.toLowerCase() === 'block'
                    );
                    if (bField && bField.value?.[0]) {
                      bVal = toStr(bField.value[0]);
                    }
                  }

                  return {
                    fullName: computedName || prev.fullName,
                    employeeId: computedEmpId || prev.employeeId,
                    email: computedEmail,
                    phone: computedPhone || prev.phone,
                    gender:
                      computedGender !== 'Select' ? computedGender : prev.gender,
                    state: sVal || prev.state,
                    district: dVal || prev.district,
                    branch: bVal || prev.branch,
                    program: toStr(user.program) || prev.program,
                    role:
                      computedRole && computedRole !== '-' ? computedRole : prev.role,
                  };
                });
              }
            })
            .catch((err) => {
              console.warn('Could not fetch user details for prefill:', err);
            });
        }
      } else {
        setFormData(initialFormState);
      }
      setErrors({});
    }
  }, [open, initialData, isEdit]);

  // Match state label or value with states list once loaded
  useEffect(() => {
    if (states.length > 0 && formData.state) {
      const match = states.find(
        (s) =>
          s.value === formData.state ||
          s.label.toLowerCase() === formData.state.toLowerCase()
      );
      if (match && match.value !== formData.state) {
        setFormData((prev) => ({ ...prev, state: match.value }));
      }
    }
  }, [states, formData.state]);

  // Match district label or value with districts list once loaded
  useEffect(() => {
    if (districts.length > 0 && formData.district) {
      const match = districts.find(
        (d) =>
          d.value === formData.district ||
          d.label.toLowerCase() === formData.district.toLowerCase()
      );
      if (match && match.value !== formData.district) {
        setFormData((prev) => ({ ...prev, district: match.value }));
      }
    }
  }, [districts, formData.district]);

  // Match branch label or value with branches list once loaded
  useEffect(() => {
    if (branches.length > 0 && formData.branch) {
      const match = branches.find(
        (b) =>
          b.value === formData.branch ||
          b.label.toLowerCase() === formData.branch.toLowerCase()
      );
      if (match && match.value !== formData.branch) {
        setFormData((prev) => ({ ...prev, branch: match.value }));
      }
    }
  }, [branches, formData.branch]);

  // Role options matching user list page filter with fallbacks
  const roleOptions = React.useMemo(() => {
    const defaultRoles = ['ARM', 'DI', 'Trainer', 'Admin'];
    const filteredAvailable = availableRoles
      .filter((r) => r && !['reviewer'].includes(r.toLowerCase()))
      .map((r) => r.trim());
    const combined = Array.from(new Set([...defaultRoles, ...filteredAvailable]));
    if (formData.role && !combined.includes(formData.role) && formData.role !== '-') {
      combined.push(formData.role);
    }
    return combined;
  }, [availableRoles, formData.role]);

  const handleChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: toStr(value) };
      // Cascade clear child location fields
      if (field === 'state') {
        next.district = '';
        next.branch = '';
      } else if (field === 'district') {
        next.branch = '';
      }
      return next;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    const fullName = toStr(formData.fullName).trim();
    const employeeId = toStr(formData.employeeId).trim();
    const email = toStr(formData.email).trim();
    const phone = toStr(formData.phone).trim();
    const state = toStr(formData.state).trim();
    const role = toStr(formData.role).trim();

    if (!fullName) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!isEdit && !employeeId) {
      newErrors.employeeId = 'Employee ID is required';
    }

    if (!isEdit && !email) {
      newErrors.email = 'Email address is required';
    } else if (
      email &&
      email !== '-' &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = 'Phone number must be a valid 10-digit number';
    }

    if (!state) {
      newErrors.state = 'State is required';
    }

    if (!role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const nameTrimmed = toStr(formData.fullName).trim();
      const nameParts = nameTrimmed.split(/\s+/);
      const firstName = nameParts[0] || '';
      let middleName = '';
      let lastName = '';
      if (nameParts.length === 2) {
        lastName = nameParts[1];
      } else if (nameParts.length > 2) {
        middleName = nameParts.slice(1, -1).join(' ');
        lastName = nameParts[nameParts.length - 1];
      } else {
        lastName = nameParts[0] || '';
      }
      const mobile = toStr(formData.phone).trim();
      const email = toStr(formData.email).trim();
      const employeeId = toStr(formData.employeeId).trim();

      if (isEdit) {
        const targetUserId = toStr(initialData?.userId || initialData?.id);
        if (!targetUserId) {
          showToastMessage('User ID is missing.', 'error');
          setLoading(false);
          return;
        }

        const userData: any = {
          firstName,
          lastName,
          middleName,
          gender:
            formData.gender && formData.gender !== 'Select'
              ? formData.gender.toLowerCase()
              : 'male',
          mobile,
        };

        if (email && email !== '-') {
          userData.email = email;
        }

        if (employeeId) {
          userData.employeeId = employeeId;
        }

        const updatePayload: UpdateUserPayload = {
          userData,
        };

        if (formData.state) {
          updatePayload.customFields = [
            {
              fieldId: '800265b1-9058-482a-94f4-726197e1dfe4',
              value: [String(formData.state)],
            },
          ];
        }

        const response = await updateUserAccount(targetUserId, updatePayload);

        if (
          response?.responseCode === 'OK' ||
          response?.responseCode === 200 ||
          response?.result ||
          response?.params?.status === 'successful'
        ) {
          showToastMessage(
            response?.params?.successmessage || 'User updated successfully.',
            'success'
          );
          onSuccess?.();
          onClose();
        } else {
          const errorMsg =
            response?.params?.errmsg ||
            response?.message ||
            'Failed to update user.';
          showToastMessage(errorMsg, 'error');
        }
        return;
      }

      // Create flow
      const tenantId = TenantService.getTenantId() || SWADHAAR_TENANT_ID;

      const payload: CreateUserPayload = {
        name: nameTrimmed,
        username: mobile || email,
        password: 'Password@123',
        firstName: firstName,
        lastName: lastName,
        gender:
          formData.gender && formData.gender !== 'Select'
            ? formData.gender.toLowerCase()
            : 'male',
        email: email,
        mobile: mobile,
        tenantCohortRoleMapping: [
          {
            tenantId: tenantId,
            roleId: '57bc16f8-f446-4e5d-b595-c908a229e776',
          },
        ],
        customFields: [
          {
            fieldId: '800265b1-9058-482a-94f4-726197e1dfe4',
            value: [String(formData.state || '4')],
          },
        ],
      };

      const response = await createUserAccount(payload);

      if (
        response?.responseCode === 'OK' ||
        response?.result ||
        response?.params?.status === 'successful'
      ) {
        showToastMessage('User created successfully!', 'success');
        onSuccess?.();
        onClose();
        setFormData(initialFormState);
      } else {
        const errorMsg =
          response?.params?.errmsg ||
          response?.message ||
          'Failed to create user.';
        showToastMessage(errorMsg, 'error');
      }
    } catch (err: any) {
      console.error(isEdit ? 'Update user error:' : 'Create user error:', err);
      const errMsg =
        err?.response?.data?.params?.errmsg ||
        err?.response?.data?.message ||
        err?.message ||
        (isEdit
          ? 'Error occurred while updating user.'
          : 'Error occurred while creating user.');
      showToastMessage(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Swadhaar UI theme styling matching cswadhaar / prototype
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '6px',
      backgroundColor: '#FFFFFF',
      fontSize: '14px',
      color: '#1F1E1C',
      fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
      '& fieldset': {
        borderColor: '#BDB9B1',
      },
      '&:hover fieldset': {
        borderColor: '#8A867F',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#E6873C',
        borderWidth: '1.5px',
      },
    },
    '& .MuiInputBase-input': {
      padding: '9.5px 12px',
      height: 'auto',
    },
  };

  const selectSx = {
    borderRadius: '6px',
    backgroundColor: '#FFFFFF',
    fontSize: '14px',
    color: '#1F1E1C',
    fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#BDB9B1',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#8A867F',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#E6873C',
      borderWidth: '1.5px',
    },
    '& .MuiSelect-select': {
      padding: '9.5px 12px',
    },
  };

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      onClose={(_event, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          return;
        }
      }}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '10px',
          boxShadow: '0 20px 48px rgba(31,30,28,0.25)',
          maxWidth: '740px',
          fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
          color: '#1F1E1C',
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          padding: '22px 28px 14px',
          borderBottom: '1px solid #ECEAE5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
            <Typography
              component="h2"
              sx={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 600,
                color: '#1F1E1C',
                fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
              }}
            >
              {isEdit ? 'Edit user' : 'Create user'}
            </Typography>
          </Box>
          <Typography
            sx={{
              margin: 0,
              fontSize: '13px',
              color: '#6B6862',
              fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
            }}
          >
            Fields marked * are mandatory.
          </Typography>
        </Box>

        <IconButton
          onClick={onClose}
          aria-label="Close"
          disabled={loading}
          sx={{
            width: 32,
            height: 32,
            color: '#3D3B37',
            '&:hover': { backgroundColor: '#F4F3EF' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent
        sx={{
          padding: '18px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.2,
        }}
      >
        {/* 1. PERSONAL DETAILS */}
        <Box>
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#6B6862',
              mb: 1.4,
              fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
            }}
          >
            Personal details
          </Typography>

          <Grid container spacing={2}>
            {/* Full name */}
            <Grid item xs={12} sm={6}>
              <Typography
                component="label"
                sx={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1F1E1C',
                  mb: 0.6,
                }}
              >
                Full name *
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                error={Boolean(errors.fullName)}
                helperText={errors.fullName}
                sx={inputSx}
              />
            </Grid>

            {/* Employee ID */}
            <Grid item xs={12} sm={6}>
              <Typography
                component="label"
                sx={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1F1E1C',
                  mb: 0.6,
                }}
              >
                Employee ID *
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={formData.employeeId}
                onChange={(e) => handleChange('employeeId', e.target.value)}
                error={Boolean(errors.employeeId)}
                helperText={errors.employeeId}
                sx={inputSx}
              />
              <Typography sx={{ fontSize: '12px', color: '#6B6862', mt: 0.5 }}>
                Must be unique
              </Typography>
            </Grid>

            {/* Email address */}
            <Grid item xs={12} sm={6}>
              <Typography
                component="label"
                sx={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1F1E1C',
                  mb: 0.6,
                }}
              >
                Email address *
              </Typography>
              <TextField
                fullWidth
                type="email"
                size="small"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={Boolean(errors.email)}
                helperText={errors.email}
                sx={inputSx}
              />
              <Typography sx={{ fontSize: '12px', color: '#6B6862', mt: 0.5 }}>
                Used as login ID
              </Typography>
            </Grid>

            {/* Phone number */}
            <Grid item xs={12} sm={6}>
              <Typography
                component="label"
                sx={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1F1E1C',
                  mb: 0.6,
                }}
              >
                Phone number *
              </Typography>
              <TextField
                fullWidth
                type="tel"
                size="small"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                error={Boolean(errors.phone)}
                helperText={errors.phone}
                sx={inputSx}
              />
              <Typography sx={{ fontSize: '12px', color: '#6B6862', mt: 0.5 }}>
                Used for SMS
              </Typography>
            </Grid>

            {/* Gender */}
            <Grid item xs={12} sm={6}>
              <Typography
                component="label"
                sx={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1F1E1C',
                  mb: 0.6,
                }}
              >
                Gender
              </Typography>
              <Select
                fullWidth
                size="small"
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                sx={selectSx}
              >
                <MenuItem value="Select">Select</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </Grid>
          </Grid>
        </Box>

        {/* 2. LOCATION AND PROGRAM */}
        <Box>
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#6B6862',
              mb: 1.4,
              fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
            }}
          >
            Location and program
          </Typography>

          <Grid container spacing={2}>
            {/* State */}
            <Grid item xs={12} sm={6}>
              <Typography
                component="label"
                sx={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1F1E1C',
                  mb: 0.6,
                }}
              >
                State *
              </Typography>
              <Select
                fullWidth
                size="small"
                value={formData.state}
                displayEmpty
                error={Boolean(errors.state)}
                onChange={(e) => handleChange('state', e.target.value)}
                sx={selectSx}
              >
                <MenuItem value="" disabled>
                  <em>Select state</em>
                </MenuItem>
                {states.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.state && (
                <FormHelperText error sx={{ mx: 0.5, fontSize: '11px' }}>
                  {errors.state}
                </FormHelperText>
              )}
            </Grid>

            {/* District */}
            <Grid item xs={12} sm={6}>
              <Typography
                component="label"
                sx={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1F1E1C',
                  mb: 0.6,
                }}
              >
                District
              </Typography>
              <Select
                fullWidth
                size="small"
                value={formData.district}
                displayEmpty
                disabled={!formData.state}
                onChange={(e) => handleChange('district', e.target.value)}
                sx={selectSx}
              >
                <MenuItem value="" disabled>
                  <em>{!formData.state ? 'Select state first' : 'Select district'}</em>
                </MenuItem>
                {districts.map((d) => (
                  <MenuItem key={d.value} value={d.value}>
                    {d.label}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            {/* Branch (Block) */}
            <Grid item xs={12} sm={6}>
              <Typography
                component="label"
                sx={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1F1E1C',
                  mb: 0.6,
                }}
              >
                Branch
              </Typography>
              <Select
                fullWidth
                size="small"
                value={formData.branch}
                displayEmpty
                disabled={!formData.district}
                onChange={(e) => handleChange('branch', e.target.value)}
                sx={selectSx}
              >
                <MenuItem value="" disabled>
                  <em>{!formData.district ? 'Select district first' : 'Select branch'}</em>
                </MenuItem>
                {branches.map((b) => (
                  <MenuItem key={b.value} value={b.value}>
                    {b.label}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            {/* Program */}
            <Grid item xs={12} sm={6}>
              <Typography
                component="label"
                sx={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1F1E1C',
                  mb: 0.6,
                }}
              >
                Program
              </Typography>
              <Select
                fullWidth
                size="small"
                value={formData.program}
                displayEmpty
                onChange={(e) => handleChange('program', e.target.value)}
                sx={selectSx}
              >
                <MenuItem value="" disabled>
                  <em>Select program</em>
                </MenuItem>
                {programs.map((p) => (
                  <MenuItem key={p.value} value={p.value}>
                    {p.label}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>
        </Box>

        {/* 3. ROLE */}
        <Box>
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#6B6862',
              mb: 1.4,
              fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
            }}
          >
            Role
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography
                component="label"
                sx={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1F1E1C',
                  mb: 0.6,
                }}
              >
                Role *
              </Typography>
              <Select
                fullWidth
                size="small"
                value={formData.role}
                displayEmpty
                error={Boolean(errors.role)}
                onChange={(e) => handleChange('role', e.target.value)}
                sx={selectSx}
              >
                <MenuItem value="" disabled>
                  <em>Select role</em>
                </MenuItem>
                {roleOptions.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
              {errors.role && (
                <FormHelperText error sx={{ mx: 0.5, fontSize: '11px' }}>
                  {errors.role}
                </FormHelperText>
              )}
              <Typography sx={{ fontSize: '12px', color: '#6B6862', mt: 0.5, lineHeight: 1.4 }}>
                Company role. Learner and Reviewer are assigned later, when the user is added to a group.
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Information Banner */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            padding: '12px 16px',
            backgroundColor: '#F4F3EF',
            borderRadius: '8px',
            mt: 0.5,
          }}
        >
          <Typography
            sx={{
              fontSize: '13px',
              lineHeight: 1.5,
              color: '#1F1E1C',
              fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
            }}
          >
            On save, credentials are generated and a welcome email and/or SMS is sent, asking the user to change their password on first login.
          </Typography>
        </Box>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions
        sx={{
          padding: '14px 28px',
          borderTop: '1px solid #ECEAE5',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1.5,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{
            backgroundColor: '#FFFFFF',
            color: '#1F1E1C',
            borderColor: '#BDB9B1',
            borderRadius: '6px',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '14px',
            px: 2.2,
            py: 0.9,
            fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
            '&:hover': {
              backgroundColor: '#F4F3EF',
              borderColor: '#8A867F',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            backgroundColor: '#1F1E1C',
            color: '#FFFFFF',
            borderRadius: '6px',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '14px',
            px: 2.5,
            py: 0.9,
            fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#D4752A',
              boxShadow: 'none',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={18} sx={{ color: '#FFFFFF', mr: 1 }} />
          ) : null}
          {isEdit ? 'Save changes' : 'Create user'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserModal;

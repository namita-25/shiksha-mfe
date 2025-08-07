// @ts-nocheck
// SearchTextFieldWidget.tsx
import React from 'react';
import { TextField, IconButton, InputAdornment } from '@mui/material';
import ClearIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

const SearchTextFieldWidget = ({
    id,
    placeholder,
    value,
    required,
    disabled,
    readonly,
    label,
    onChange,
    onBlur,
    onFocus,
    formContext,
}) => {
    const { t } = useTranslation();

    const handleClear = () => {
        onChange('');
        // Call form submit from formContext if available
        if (formContext?.onSubmit) {
            formContext.onSubmit();
        }
    };

    return (
        <TextField
        sx={{backgroundColor:"#eeeeee"}}
            id={id}
            label={t(label)}
            placeholder={placeholder}
            value={value || ''}
            required={required}
            disabled={disabled || readonly}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(id, e.target.value)}
            onFocus={(e) => onFocus(id, e.target.value)}
            fullWidth
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        {value && <IconButton onClick={handleClear} edge="end" size="small">
                            <ClearIcon />
                        </IconButton>}
                        <IconButton
                            edge="end"
                            size="small"
                        >
                            <SearchIcon />
                        </IconButton>
                    </InputAdornment>
                )
            }}
        />
    );
};

export default SearchTextFieldWidget;

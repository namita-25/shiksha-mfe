import React from "react";
import {
  FormControl,
  FormGroup,
  FormLabel,
  Checkbox,
  Grid,
} from "@mui/material";

interface CustomMultiselectCheckboxesProps {
  label: string;
  value: any;
  required: boolean;
  disabled: boolean;
  readonly: boolean;
  options: any;
  onChange: any;
  schema: any;
}
const MultiSelectCheckboxes: React.FC<CustomMultiselectCheckboxesProps> = ({
  schema,
  options,
  value,
  required,
  disabled,
  readonly,
  onChange,
  label,
}) => {
  const handleChange = (event: any) => {
    const { value: optionValue } = event.target;
    if (event.target.checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter((v: any) => v !== optionValue));
    }
  };

  return (
    <FormControl component="fieldset" disabled={disabled || readonly}>
      <FormLabel
        required={required}
        component="legend"
        style={{ color: "inherit" }}
      >
        {label || schema?.title}
      </FormLabel>
      <FormGroup>
        {options?.enumOptions?.map((option: any) => (
          <Grid
            container
            key={option.value}
            alignItems="center"
            justifyContent="space-between"
            style={{ color: "inherit" }}
          >
            <Grid item xs={10}>
              <FormLabel style={{ color: "inherit" }}>{option.label}</FormLabel>
            </Grid>
            <Grid item xs={2}>
              <Checkbox
                style={{ color: "inherit" }}
                checked={value.includes(option.value)}
                onChange={handleChange}
                value={option.value}
              />
            </Grid>
          </Grid>
        ))}
      </FormGroup>
    </FormControl>
  );
};

export default MultiSelectCheckboxes;

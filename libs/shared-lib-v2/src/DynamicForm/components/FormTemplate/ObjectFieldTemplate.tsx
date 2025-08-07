 //@ts-nocheck
import { Grid } from '@mui/material';

export const CustomObjectFieldTemplate = ({ properties }: any) => {
    return (
      <Grid container spacing={2}>
        {properties.map((prop: any) => {
          const gridOptions = prop.content?.props?.uiSchema?.['ui:options']?.grid || {};
  
          return (
            <Grid
              item
              key={prop.name}
              xs={gridOptions.xs || 12}
              sm={gridOptions.sm || 12}
              md={gridOptions.md || 12}
            >
              {prop.content}
            </Grid>
          );
        })}
      </Grid>
    );
  };
  

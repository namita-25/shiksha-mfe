import Typography, { TypographyProps } from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { CommonCircularProgressProps, Progress } from './Progress';

export function CircularProgressWithLabel(
  props: CommonCircularProgressProps & {
    _text?: TypographyProps;
    value: number;
  }
) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <Progress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="caption"
          component="div"
          sx={{ color: 'text.secondary' }}
          {...props._text}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

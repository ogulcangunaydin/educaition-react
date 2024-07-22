import { Button } from '@mui/material';
import { styled } from '@mui/system';

export const CenteredContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
});

export const StyledButton = styled(Button)({
  marginTop: '20px',
});

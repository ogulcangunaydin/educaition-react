import { Button, TableContainer as MuiTableContainer} from '@mui/material';
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

export const RoomCreationModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export const StyledTableContainer = styled(MuiTableContainer)({
  marginTop: '80px',
  maxHeight: '70vh', // Adjust the height as needed
  overflowY: 'auto',
});
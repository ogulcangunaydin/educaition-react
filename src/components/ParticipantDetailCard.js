import { Card, CardContent, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings'; // Updated import for Strategy icon
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled'; // Updated import for PlayCircleFilled icon
// For code highlighting
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Box from '@mui/material/Box';

const ParticipantDetails = ({ participant, isUserAuthenticated, blurText }) => {
  const textStyle = isUserAuthenticated && !blurText ? "" : "blurred-text";

  return (
    <Card>
      <CardContent>
        {participant.short_tactic && (
          <Box display="flex" justifyContent="center" alignItems="center">
            <Typography variant="h6" className={textStyle} component="div">
              <SettingsIcon style={{ verticalAlign: 'middle' }} /> {participant.short_tactic} <SettingsIcon style={{ verticalAlign: 'middle' }} />
            </Typography>
          </Box>
        )}
        <Box display="flex" justifyContent="center" alignItems="center">
          <Typography variant="body1" className={textStyle}>
            <PlayCircleFilledIcon style={{ verticalAlign: 'middle' }} /> {participant.player_tactic} {/* Updated icon usage */}
          </Typography>
        </Box>
        {isUserAuthenticated && !blurText ? (
          <SyntaxHighlighter language="javascript" style={dark}>
            {participant.player_code}
          </SyntaxHighlighter>
        ) : (
          <Typography component="pre" className="blurred-text">
            {participant.player_code}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ParticipantDetails;
/**
 * TestLayout Template
 * 
 * Layout for test/survey pages with centered content.
 */

import React from 'react';
import { Box, Container, Paper, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Header from '../organisms/Header';
import Typography from '../atoms/Typography';
import Spinner from '../atoms/Spinner';

const TestContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  paddingBottom: theme.spacing(4),
}));

const TestCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  marginBottom: theme.spacing(3),
}));

function TestLayout({
  children,
  title,
  subtitle,
  showHeader = true,
  headerProps = {},
  maxWidth = 'md',
  loading = false,
  loadingMessage = 'Yükleniyor...',
  progress,
  showProgress = false,
  step,
  totalSteps,
  withCard = true,
  ...props
}) {
  // Calculate progress percentage
  const progressValue = progress !== undefined 
    ? progress 
    : (step !== undefined && totalSteps) 
      ? ((step + 1) / totalSteps) * 100 
      : 0;

  const content = loading ? (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        gap: 2,
      }}
    >
      <Spinner size="large" />
      <Typography color="text.secondary">{loadingMessage}</Typography>
    </Box>
  ) : (
    <>
      {(title || subtitle) && (
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          {title && (
            <Typography variant="h5" gutterBottom>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
      
      {showProgress && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              İlerleme
            </Typography>
            {step !== undefined && totalSteps && (
              <Typography variant="caption" color="text.secondary">
                {step + 1} / {totalSteps}
              </Typography>
            )}
          </Box>
          <ProgressBar variant="determinate" value={progressValue} />
        </Box>
      )}
      
      {children}
    </>
  );

  return (
    <TestContainer {...props}>
      {showHeader && <Header {...headerProps} />}
      
      <Container maxWidth={maxWidth}>
        {withCard ? (
          <TestCard elevation={2}>
            {content}
          </TestCard>
        ) : (
          <Box sx={{ mt: 3 }}>
            {content}
          </Box>
        )}
      </Container>
    </TestContainer>
  );
}

TestLayout.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  showHeader: PropTypes.bool,
  headerProps: PropTypes.object,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  loading: PropTypes.bool,
  loadingMessage: PropTypes.string,
  progress: PropTypes.number,
  showProgress: PropTypes.bool,
  step: PropTypes.number,
  totalSteps: PropTypes.number,
  withCard: PropTypes.bool,
};

export default TestLayout;

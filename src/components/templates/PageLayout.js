/**
 * PageLayout Template
 * 
 * Base layout for all pages with header and content area.
 */

import React from 'react';
import { Box, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Header from '../organisms/Header';
import LoadingOverlay from '../molecules/LoadingOverlay';
import ErrorMessage from '../molecules/ErrorMessage';

const PageContainer = styled(Box)(({ theme, backgroundlogo }) => ({
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  position: 'relative',
  ...(backgroundlogo && {
    '&::before': {
      content: '""',
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '600px',
      height: '600px',
      backgroundImage: `url(${backgroundlogo})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: 'contain',
      opacity: 0.03,
      zIndex: 0,
      pointerEvents: 'none',
    },
  }),
}));

const ContentWrapper = styled(Box)({
  position: 'relative',
  zIndex: 1,
});

function PageLayout({
  children,
  title,
  showHeader = true,
  headerProps = {},
  maxWidth = 'lg',
  loading = false,
  loadingMessage,
  error = null,
  onRetry,
  backgroundLogo,
  fullWidth = false,
  noPadding = false,
  ...props
}) {
  return (
    <PageContainer backgroundlogo={backgroundLogo} {...props}>
      {showHeader && <Header title={title} {...headerProps} />}
      
      <ContentWrapper>
        {fullWidth ? (
          <Box sx={{ py: noPadding ? 0 : 3 }}>
            {loading ? (
              <LoadingOverlay open message={loadingMessage} />
            ) : error ? (
              <Container maxWidth={maxWidth}>
                <ErrorMessage error={error} onRetry={onRetry} />
              </Container>
            ) : (
              children
            )}
          </Box>
        ) : (
          <Container maxWidth={maxWidth} sx={{ py: noPadding ? 0 : 3 }}>
            {loading ? (
              <LoadingOverlay open message={loadingMessage} />
            ) : error ? (
              <ErrorMessage error={error} onRetry={onRetry} />
            ) : (
              children
            )}
          </Container>
        )}
      </ContentWrapper>
    </PageContainer>
  );
}

PageLayout.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  showHeader: PropTypes.bool,
  headerProps: PropTypes.object,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false]),
  loading: PropTypes.bool,
  loadingMessage: PropTypes.string,
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  onRetry: PropTypes.func,
  backgroundLogo: PropTypes.string,
  fullWidth: PropTypes.bool,
  noPadding: PropTypes.bool,
};

export default PageLayout;

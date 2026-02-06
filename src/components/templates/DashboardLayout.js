/**
 * DashboardLayout Template
 * 
 * Layout for dashboard pages with sidebar navigation.
 */

import React from 'react';
import { Box, Container, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Header from '../organisms/Header';
import LoadingOverlay from '../molecules/LoadingOverlay';
import ErrorMessage from '../molecules/ErrorMessage';
import Typography from '../atoms/Typography';

const DashboardContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
}));

const MainContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const PageHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}));

function DashboardLayout({
  children,
  title,
  subtitle,
  actions,
  showHeader = true,
  headerProps = {},
  maxWidth = 'xl',
  loading = false,
  loadingMessage,
  error = null,
  onRetry,
  sidebar,
  sidebarWidth = 280,
  ...props
}) {
  return (
    <DashboardContainer {...props}>
      {showHeader && <Header {...headerProps} />}
      
      <Box sx={{ display: 'flex' }}>
        {/* Sidebar */}
        {sidebar && (
          <Box
            sx={{
              width: sidebarWidth,
              flexShrink: 0,
              borderRight: 1,
              borderColor: 'divider',
              minHeight: 'calc(100vh - 64px)',
              bgcolor: 'background.paper',
            }}
          >
            {sidebar}
          </Box>
        )}
        
        {/* Main Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Container maxWidth={maxWidth} sx={{ py: 3 }}>
            {/* Page Header */}
            {(title || actions) && (
              <PageHeader>
                <Box>
                  {title && (
                    <Typography variant="h4" gutterBottom={!!subtitle}>
                      {title}
                    </Typography>
                  )}
                  {subtitle && (
                    <Typography variant="body1" color="text.secondary">
                      {subtitle}
                    </Typography>
                  )}
                </Box>
                {actions && <Box>{actions}</Box>}
              </PageHeader>
            )}
            
            {/* Content */}
            {loading ? (
              <LoadingOverlay open message={loadingMessage} fullScreen={false} />
            ) : error ? (
              <ErrorMessage error={error} onRetry={onRetry} />
            ) : (
              children
            )}
          </Container>
        </Box>
      </Box>
    </DashboardContainer>
  );
}

// Grid helpers for dashboard content
export function DashboardGrid({ children, spacing = 3 }) {
  return (
    <Grid container spacing={spacing}>
      {children}
    </Grid>
  );
}

export function DashboardCard({ children, xs = 12, sm = 6, md = 4, lg = 3 }) {
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg}>
      {children}
    </Grid>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
  showHeader: PropTypes.bool,
  headerProps: PropTypes.object,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false]),
  loading: PropTypes.bool,
  loadingMessage: PropTypes.string,
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  onRetry: PropTypes.func,
  sidebar: PropTypes.node,
  sidebarWidth: PropTypes.number,
};

DashboardGrid.propTypes = {
  children: PropTypes.node,
  spacing: PropTypes.number,
};

DashboardCard.propTypes = {
  children: PropTypes.node,
  xs: PropTypes.number,
  sm: PropTypes.number,
  md: PropTypes.number,
  lg: PropTypes.number,
};

export default DashboardLayout;

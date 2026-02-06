/**
 * EmptyState Molecule
 *
 * A placeholder for empty data states.
 */

import React from "react";
import { Box, Typography } from "@mui/material";
import { InboxOutlined } from "@mui/icons-material";
import PropTypes from "prop-types";
import Button from "../atoms/Button";

function EmptyState({
  icon: Icon = InboxOutlined,
  title = "Veri Bulunamadı",
  message,
  action,
  actionText,
  onAction,
  ...props
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
        px: 3,
        textAlign: "center",
      }}
      {...props}
    >
      <Icon
        sx={{
          fontSize: 64,
          color: "text.disabled",
          mb: 2,
        }}
      />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {message}
        </Typography>
      )}
      {(action || (actionText && onAction)) &&
        (action || (
          <Button onClick={onAction} variant="outlined">
            {actionText}
          </Button>
        ))}
    </Box>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string,
  message: PropTypes.string,
  action: PropTypes.node,
  actionText: PropTypes.string,
  onAction: PropTypes.func,
};

export default EmptyState;

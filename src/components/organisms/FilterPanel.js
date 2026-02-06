/**
 * FilterPanel Organism
 *
 * A collapsible filter panel with various filter types.
 */

import React, { useState } from "react";
import { Paper, Box, Collapse, IconButton, Typography, Grid, Chip, Divider } from "@mui/material";
import { ExpandMore, ExpandLess, FilterList, Clear } from "@mui/icons-material";
import PropTypes from "prop-types";
import Button from "../atoms/Button";

function FilterPanel({
  title = "Filtreler",
  children,
  expanded: controlledExpanded,
  onExpandChange,
  activeFiltersCount = 0,
  onClearAll,
  collapsible = true,
  defaultExpanded = true,
  ...props
}) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    if (isControlled) {
      onExpandChange?.(!expanded);
    } else {
      setInternalExpanded(!expanded);
    }
  };

  return (
    <Paper elevation={1} sx={{ mb: 3 }} {...props}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          cursor: collapsible ? "pointer" : "default",
        }}
        onClick={collapsible ? handleToggle : undefined}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FilterList color="action" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {activeFiltersCount > 0 && (
            <Chip label={activeFiltersCount} size="small" color="primary" sx={{ ml: 1 }} />
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {activeFiltersCount > 0 && onClearAll && (
            <Button
              size="small"
              variant="text"
              startIcon={<Clear />}
              onClick={(e) => {
                e.stopPropagation();
                onClearAll();
              }}
            >
              Temizle
            </Button>
          )}
          {collapsible && (
            <IconButton size="small">{expanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
          )}
        </Box>
      </Box>
      <Collapse in={expanded}>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {children}
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
}

// Helper component for filter items
export function FilterItem({ xs = 12, sm = 6, md = 4, lg = 3, children }) {
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg}>
      {children}
    </Grid>
  );
}

FilterPanel.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  expanded: PropTypes.bool,
  onExpandChange: PropTypes.func,
  activeFiltersCount: PropTypes.number,
  onClearAll: PropTypes.func,
  collapsible: PropTypes.bool,
  defaultExpanded: PropTypes.bool,
};

FilterItem.propTypes = {
  xs: PropTypes.number,
  sm: PropTypes.number,
  md: PropTypes.number,
  lg: PropTypes.number,
  children: PropTypes.node,
};

export default FilterPanel;

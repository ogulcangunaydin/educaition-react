/**
 * TestTypeSelector Molecule
 *
 * A card-based selector for choosing between different test types.
 * Used in the dashboard for unified test management navigation.
 */

import React from "react";
import PropTypes from "prop-types";
import { Box, Card, CardContent, CardActionArea, Grid } from "@mui/material";
import {
  Groups as GroupsIcon,
  Psychology as PsychologyIcon,
  School as SchoolIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import Typography from "../atoms/Typography";
import { TestType, TEST_TYPE_CONFIG } from "@services/testRoomService";

// Icon mapping
const ICONS = {
  Groups: GroupsIcon,
  Psychology: PsychologyIcon,
  School: SchoolIcon,
  Person: PersonIcon,
};

function TestTypeCard({ type, config, onClick, selected }) {
  const IconComponent = ICONS[config.icon] || PersonIcon;

  return (
    <Card
      sx={{
        height: "100%",
        border: 2,
        borderColor: selected ? config.color : "transparent",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 4,
        },
      }}
    >
      <CardActionArea onClick={() => onClick(type)} sx={{ height: "100%" }}>
        <CardContent sx={{ textAlign: "center", py: 3 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: config.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <IconComponent sx={{ fontSize: 28, color: "white" }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {config.label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {config.labelEn}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

TestTypeCard.propTypes = {
  type: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  selected: PropTypes.bool,
};

function TestTypeSelector({
  onSelect,
  selectedType,
  title = "Test Türü Seçin",
  description = "Yönetmek istediğiniz test türünü seçin.",
  enabledTypes,
  gridSize = { xs: 12, sm: 6, md: 3 },
}) {
  // Filter to only show enabled types, or all if not specified
  const typesToShow = enabledTypes
    ? Object.values(TestType).filter((t) => enabledTypes.includes(t))
    : Object.values(TestType);

  return (
    <Box>
      {(title || description) && (
        <Box sx={{ mb: 3 }}>
          {title && (
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
          )}
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
      )}

      <Grid container spacing={2}>
        {typesToShow.map((type) => {
          const config = TEST_TYPE_CONFIG[type];
          return (
            <Grid item key={type} {...gridSize}>
              <TestTypeCard
                type={type}
                config={config}
                onClick={onSelect}
                selected={selectedType === type}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

TestTypeSelector.propTypes = {
  /** Callback when a test type is selected */
  onSelect: PropTypes.func.isRequired,
  /** Currently selected test type */
  selectedType: PropTypes.string,
  /** Section title */
  title: PropTypes.string,
  /** Section description */
  description: PropTypes.string,
  /** Array of enabled test types (shows all if not provided) */
  enabledTypes: PropTypes.arrayOf(PropTypes.string),
  /** Grid size configuration */
  gridSize: PropTypes.object,
};

export default TestTypeSelector;

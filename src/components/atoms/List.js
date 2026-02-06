/**
 * List Atom
 *
 * Wrapper around MUI List with consistent styling.
 */

import React from "react";
import {
  List as MuiList,
  ListItem as MuiListItem,
  ListItemButton as MuiListItemButton,
  ListItemText as MuiListItemText,
  ListItemIcon as MuiListItemIcon,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import { COLORS, SPACING, SHADOWS } from "../../theme";

const StyledListItem = styled(MuiListItem)(({ theme }) => ({
  marginBottom: SPACING.sm,
  backgroundColor: COLORS.white,
  borderRadius: theme.shape.borderRadius,
  boxShadow: SHADOWS.sm,
  padding: 0,
  overflow: "hidden",
  transition: "all 0.2s ease",
  "&:hover": {
    boxShadow: SHADOWS.md,
    transform: "translateX(4px)",
  },
}));

function List({ children, ...props }) {
  return <MuiList {...props}>{children}</MuiList>;
}

function ListItem({ children, primary, secondary, icon, onClick, actions, ...props }) {
  const content =
    primary || secondary ? (
      <MuiListItemText
        primary={primary}
        secondary={secondary}
        primaryTypographyProps={{ fontWeight: 500 }}
      />
    ) : (
      children
    );

  if (onClick) {
    return (
      <StyledListItem {...props}>
        <MuiListItemButton onClick={onClick} sx={{ flexGrow: 1 }}>
          {icon && <MuiListItemIcon>{icon}</MuiListItemIcon>}
          {content}
        </MuiListItemButton>
        {actions}
      </StyledListItem>
    );
  }

  return (
    <StyledListItem {...props}>
      {icon && <MuiListItemIcon>{icon}</MuiListItemIcon>}
      {content}
      {actions}
    </StyledListItem>
  );
}

List.propTypes = {
  children: PropTypes.node.isRequired,
};

ListItem.propTypes = {
  children: PropTypes.node,
  primary: PropTypes.node,
  secondary: PropTypes.string,
  icon: PropTypes.node,
  onClick: PropTypes.func,
  actions: PropTypes.node,
};

export { List, ListItem };
export default List;

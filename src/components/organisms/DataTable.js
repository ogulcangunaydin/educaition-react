/**
 * DataTable Organism
 *
 * A data table with sorting, pagination, and row actions.
 * Supports built-in cell type renderers for common data patterns.
 *
 * Column types:
 *   - "string"     : renders value as-is, fallback to "-"
 *   - "number"     : renders number, fallback to "-"
 *   - "percentage" : renders Math.round(value) + "%", fallback to "-"
 *   - "date"       : formats with toLocaleDateString("tr-TR"), fallback to "-"
 *   - "chip"       : renders a MUI Chip using chipConfig(value, row) → { label, color }
 *   - "custom"     : uses the column's render(value, row) function
 *
 * If a column has a `render` function it always takes priority over `type`.
 */

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Paper,
  Box,
  Checkbox,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import PropTypes from "prop-types";
import EmptyState from "../molecules/EmptyState";
import Spinner from "../atoms/Spinner";

/**
 * Built-in cell renderer based on column type
 */
function renderCellByType(value, row, column) {
  // Custom render always wins
  if (column.render) {
    return column.render(value, row);
  }

  switch (column.type) {
    case "percentage":
      return value != null ? Math.round(value) + "%" : "-";

    case "number":
      return value != null ? value : "-";

    case "date":
      if (!value) return "-";
      try {
        return new Date(value).toLocaleDateString("tr-TR");
      } catch {
        return value;
      }

    case "chip": {
      if (!column.chipConfig) return value ?? "-";
      const config = column.chipConfig(value, row);
      if (!config) return "-";
      return <Chip label={config.label} color={config.color || "default"} size="small" />;
    }

    case "string":
    default:
      return value ?? "-";
  }
}

function DataTable({
  columns = [],
  data = [],
  loading = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  sortable = true,
  defaultSortBy,
  defaultSortOrder = "asc",
  pagination = true,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  actions = [],
  emptyMessage = "Veri bulunamadı",
  stickyHeader = false,
  maxHeight,
  getRowId = (row) => row.id,
  ...props
}) {
  const [orderBy, setOrderBy] = useState(defaultSortBy);
  const [order, setOrder] = useState(defaultSortOrder);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);

  // Handle sorting
  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  // Sort and paginate data
  const processedData = useMemo(() => {
    const sorted = [...data];

    if (orderBy) {
      sorted.sort((a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];

        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        const comparison = aValue < bValue ? -1 : 1;
        return order === "asc" ? comparison : -comparison;
      });
    }

    if (pagination) {
      const start = page * rowsPerPage;
      return sorted.slice(start, start + rowsPerPage);
    }

    return sorted;
  }, [data, orderBy, order, page, rowsPerPage, pagination]);

  // Handle selection
  const handleSelectAll = (e) => {
    if (!onSelectionChange) return;

    if (e.target.checked) {
      onSelectionChange(data.map(getRowId));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (rowId) => (e) => {
    if (!onSelectionChange) return;

    if (e.target.checked) {
      onSelectionChange([...selectedIds, rowId]);
    } else {
      onSelectionChange(selectedIds.filter((id) => id !== rowId));
    }
  };

  // Handle pagination
  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return <Spinner centered />;
  }

  if (data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  const isAllSelected = selectedIds.length === data.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < data.length;

  return (
    <Box {...props}>
      <TableContainer component={Paper} sx={{ maxHeight: maxHeight }}>
        <Table stickyHeader={stickyHeader} size="medium">
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={isIndeterminate}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || "left"}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {sortable && column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : "asc"}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {actions.length > 0 && <TableCell align="right">İşlemler</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {processedData.map((row) => {
              const rowId = getRowId(row);
              const isSelected = selectedIds.includes(rowId);

              return (
                <TableRow
                  key={rowId}
                  hover
                  selected={isSelected}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{ cursor: onRowClick ? "pointer" : "default" }}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={handleSelectRow(rowId)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align || "left"}>
                      {renderCellByType(row[column.id], row, column)}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell align="right">
                      {actions.map((action, index) => (
                        <Tooltip key={index} title={action.label}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                            color={action.color || "default"}
                            disabled={action.disabled?.(row)}
                          >
                            {action.icon}
                          </IconButton>
                        </Tooltip>
                      ))}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {pagination && (
        <TablePagination
          rowsPerPageOptions={pageSizeOptions}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Sayfa başına:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count !== -1 ? count : `${to}'den fazla`}`
          }
        />
      )}
    </Box>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      align: PropTypes.oneOf(["left", "center", "right"]),
      minWidth: PropTypes.number,
      sortable: PropTypes.bool,
      type: PropTypes.oneOf(["string", "number", "percentage", "date", "chip", "custom"]),
      chipConfig: PropTypes.func,
      render: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.array,
  loading: PropTypes.bool,
  selectable: PropTypes.bool,
  selectedIds: PropTypes.array,
  onSelectionChange: PropTypes.func,
  onRowClick: PropTypes.func,
  sortable: PropTypes.bool,
  defaultSortBy: PropTypes.string,
  defaultSortOrder: PropTypes.oneOf(["asc", "desc"]),
  pagination: PropTypes.bool,
  pageSize: PropTypes.number,
  pageSizeOptions: PropTypes.array,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      icon: PropTypes.node,
      onClick: PropTypes.func,
      color: PropTypes.string,
      disabled: PropTypes.func,
    })
  ),
  emptyMessage: PropTypes.string,
  stickyHeader: PropTypes.bool,
  maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  getRowId: PropTypes.func,
};

export default DataTable;

import React, { useState } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  Box,
  Checkbox,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatScore, formatRanking } from "../../utils/csvParser";
import { formatProgramName } from "../../utils/dataFilters";
import { useBasket } from "../../contexts/BasketContext";

const DepartmentList = ({ programs, year, metric }) => {
  const [orderBy, setOrderBy] = useState(
    metric === "ranking" ? "tbs" : "taban"
  );
  const [order, setOrder] = useState("asc");
  const { toggleProgram, isSelected, selectedPrograms, setYear } = useBasket();
  const navigate = useNavigate();

  if (!programs || programs.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          Eşleşen program bulunamadı
        </Typography>
      </Paper>
    );
  }

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const getSortedPrograms = () => {
    const sorted = [...programs].sort((a, b) => {
      let aValue, bValue;

      switch (orderBy) {
        case "university":
          aValue = a.university || "";
          bValue = b.university || "";
          break;
        case "city":
          aValue = a.city || "";
          bValue = b.city || "";
          break;
        case "program":
          aValue = formatProgramName(a);
          bValue = formatProgramName(b);
          break;
        case "taban":
          aValue = a[`taban_${year}`] || 0;
          bValue = b[`taban_${year}`] || 0;
          break;
        case "tavan":
          aValue = a[`tavan_${year}`] || 0;
          bValue = b[`tavan_${year}`] || 0;
          break;
        case "tbs":
          aValue = a[`tbs_${year}`] || 0;
          bValue = b[`tbs_${year}`] || 0;
          break;
        case "tavan_bs":
          aValue = a[`tavan_bs_${year}`] || 0;
          bValue = b[`tavan_bs_${year}`] || 0;
          break;
        default:
          return 0;
      }

      if (typeof aValue === "string") {
        return order === "asc"
          ? aValue.localeCompare(bValue, "tr")
          : bValue.localeCompare(aValue, "tr");
      }

      return order === "asc" ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  };

  const getUniversityTypeColor = (type) => {
    switch (type) {
      case "Devlet":
        return "primary";
      case "Vakıf":
        return "secondary";
      case "KKTC":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h6" gutterBottom>
            Eşleşen Programlar ({programs.length})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Seçilen programa benzer özelliklere sahip programlar
          </Typography>
        </Box>
        {selectedPrograms.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              label={`${selectedPrograms.length} program seçildi`}
              color="primary"
              variant="outlined"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setYear(year);
                navigate("/highschool-analysis");
              }}
              sx={{ mr: 1 }}
            >
              Lise Analizi →
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                setYear(year);
                navigate("/rival-analysis");
              }}
            >
              Rakip Analizi →
            </Button>
          </Box>
        )}
      </Box>

      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">Seç</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "university"}
                  direction={orderBy === "university" ? order : "asc"}
                  onClick={() => handleSort("university")}
                >
                  Üniversite
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "city"}
                  direction={orderBy === "city" ? order : "asc"}
                  onClick={() => handleSort("city")}
                >
                  Şehir
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "program"}
                  direction={orderBy === "program" ? order : "asc"}
                  onClick={() => handleSort("program")}
                >
                  Program
                </TableSortLabel>
              </TableCell>
              <TableCell>Tür</TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === "taban"}
                  direction={orderBy === "taban" ? order : "asc"}
                  onClick={() => handleSort("taban")}
                >
                  Min Puan
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === "tavan"}
                  direction={orderBy === "tavan" ? order : "asc"}
                  onClick={() => handleSort("tavan")}
                >
                  Max Puan
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === "tbs"}
                  direction={orderBy === "tbs" ? order : "asc"}
                  onClick={() => handleSort("tbs")}
                >
                  Min Sıralama
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === "tavan_bs"}
                  direction={orderBy === "tavan_bs" ? order : "asc"}
                  onClick={() => handleSort("tavan_bs")}
                >
                  Max Sıralama
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getSortedPrograms().map((program, index) => (
              <TableRow
                key={`${program.yop_kodu}-${index}`}
                onClick={() => toggleProgram(program)}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isSelected(program.yop_kodu)}
                    onChange={() => toggleProgram(program)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight:
                          program.university === "HALİÇ ÜNİVERSİTESİ"
                            ? "bold"
                            : "normal",
                      }}
                    >
                      {program.university}
                    </Typography>
                    <Chip
                      label={program.university_type}
                      size="small"
                      color={getUniversityTypeColor(program.university_type)}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{program.city || "-"}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatProgramName(program)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {program.faculty}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={program.puan_type.toUpperCase()}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  {formatScore(program[`taban_${year}`])}
                </TableCell>
                <TableCell align="right">
                  {formatScore(program[`tavan_${year}`])}
                </TableCell>
                <TableCell align="right">
                  {formatRanking(program[`tbs_${year}`])}
                </TableCell>
                <TableCell align="right">
                  {formatRanking(program[`tavan_bs_${year}`])}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default DepartmentList;

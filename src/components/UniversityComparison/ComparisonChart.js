import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Tooltip as MuiTooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { ArrowUpward, ArrowDownward, RestartAlt } from "@mui/icons-material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useUniversity } from "../../contexts/UniversityContext";

// Plugin to adjust bar width based on capacity tiers
const varyingBarWidthPlugin = {
  id: "varyingBarWidth",
  beforeDraw: (chart) => {
    const datasetIndex = 0; // Target the first dataset (main bars)
    const meta = chart.getDatasetMeta(datasetIndex);
    const dataset = chart.data.datasets[datasetIndex];

    if (!meta.data || meta.data.length === 0 || !dataset || !dataset.capacities)
      return;

    const capacities = dataset.capacities;
    const xScale = chart.scales.x;

    // Calculate the maximum width available for a single category
    const categoryWidth = xScale.width / (chart.data.labels.length || 1);

    // Use 90% of category width as the base maximum bar width
    const maxWidth = categoryWidth * 0.9;

    meta.data.forEach((bar, index) => {
      const cap = capacities[index] || 0;
      let factor = 1.0;

      if (cap < 5) {
        factor = 0.1; // Very small
      } else if (cap < 20) {
        factor = 0.3; // Small
      } else if (cap < 40) {
        factor = 0.5; // Medium-Small
      } else {
        factor = 0.6; // Very Large
      }

      // Override the width calculated by Chart.js
      bar.width = maxWidth * factor;
    });
  },
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ComparisonChart = ({
  chartData,
  selectedProgram,
  year,
  metric,
  totalPrograms,
  onExpandRange,
  currentRangeMin,
  currentRangeMax,
  onResetRange,
  recordLimit,
  onRecordLimitChange,
  sortBy,
  onSortChange,
}) => {
  const { university } = useUniversity();
  const [bufferStep, setBufferStep] = useState(
    metric === "ranking" ? 25000 : 50
  );

  // Update buffer step when metric changes
  React.useEffect(() => {
    setBufferStep(metric === "ranking" ? 25000 : 50);
  }, [metric]);

  if (!chartData || !chartData.labels || chartData.labels.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center", minHeight: 400 }}>
        <Typography variant="body1" color="text.secondary">
          Karşılaştırma için program seçiniz
        </Typography>
      </Paper>
    );
  }

  const handleExpandTop = () => {
    if (onExpandRange) {
      onExpandRange("top", bufferStep);
    }
  };

  const handleExpandBottom = () => {
    if (onExpandRange) {
      onExpandRange("bottom", bufferStep);
    }
  };

  const handleReset = () => {
    if (onResetRange) {
      onResetRange();
    }
  };

  // Get current range for display
  const minColumn = metric === "ranking" ? `tavan_bs_${year}` : `taban_${year}`;
  const maxColumn = metric === "ranking" ? `tbs_${year}` : `tavan_${year}`;
  const originalMin = selectedProgram?.[minColumn];
  const originalMax = selectedProgram?.[maxColumn];
  const displayMin = currentRangeMin !== null ? currentRangeMin : originalMin;
  const displayMax = currentRangeMax !== null ? currentRangeMax : originalMax;
  const isCustomRange = currentRangeMin !== null || currentRangeMax !== null;

  const formatValue = (val) =>
    metric === "ranking"
      ? Math.round(val).toLocaleString("tr-TR")
      : val.toLocaleString("tr-TR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

  // Create gradient backgrounds based on fulfillment rate
  const createGradientBackground = (ctx, chartArea, color, fulfillmentRate) => {
    if (!chartArea) return color;

    const { bottom, top } = chartArea;
    const gradient = ctx.createLinearGradient(0, bottom, 0, top);

    // Calculate where the transition should occur (as percentage from bottom)
    const fillPercentage = Math.min(fulfillmentRate, 100) / 100;

    // Extract RGB values from the color string
    const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!rgbaMatch) return color;

    const [, r, g, b] = rgbaMatch;

    // Create darker color (multiply RGB by 0.6) for filled portion
    const darkerColor = `rgba(${Math.round(r * 0.6)}, ${Math.round(
      g * 0.6
    )}, ${Math.round(b * 0.6)}, 0.8)`;
    // Create lighter color (keep original or slightly lighter) for unfilled portion
    const lighterColor = color.replace("0.6", "0.3").replace("0.8", "0.3");

    // Add color stops: from bottom (0) to fillPercentage use darker, rest use lighter
    gradient.addColorStop(0, darkerColor);
    gradient.addColorStop(fillPercentage, darkerColor);
    gradient.addColorStop(fillPercentage, lighterColor);
    gradient.addColorStop(1, lighterColor);

    return gradient;
  };

  // Only show price data for 2024 and 2025
  const showPrices = year === "2024" || year === "2025";

  // Calculate capacity ranges for bar width logic
  const capacities = chartData.dataPoints.map((d) => d.capacity || 0);

  // Prepare data for floating bar chart showing only min-max ranges
  // Plus a second dataset for price bars on secondary Y-axis (only for 2024/2025)
  const datasets = [
    {
      label:
        metric === "ranking"
          ? `${university.name} / Sıralama Aralığı Gösteriliyor`
          : `${university.name} / Puan Aralığı Gösteriliyor`,
      data: chartData.dataPoints.map((d) => [d.min, d.max]),
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        const index = context.dataIndex;
        const color = chartData.colors[index];
        const fulfillmentRate =
          chartData.dataPoints[index].fulfillmentRate || 100;
        return createGradientBackground(ctx, chartArea, color, fulfillmentRate);
      },
      // Attach capacities to dataset to ensure access in plugin
      capacities: capacities,
      borderColor: chartData.colors.map((c) => c.replace("0.6", "1")),
      borderWidth: 2,
      borderSkipped: false,
      yAxisID: "y",
      barPercentage: 0.8,
      categoryPercentage: 0.9,
    },
    // Only include price dataset for 2024 and 2025
    ...(showPrices
      ? [
          {
            label: "Yıllık Ücret (TL)",
            data: chartData.pricePoints || [],
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
            yAxisID: "y1",
            barPercentage: 0.3,
            categoryPercentage: 0.9,
          },
        ]
      : []),
  ];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "x",
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: true,
        text: `Üniversite Karşılaştırması - ${
          metric === "ranking" ? "Başarı Sıralaması" : "Puan"
        } (${year})`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            return chartData.labels[context[0].dataIndex];
          },
          label: (context) => {
            const dataIndex = context.dataIndex;
            const datasetIndex = context.datasetIndex;

            if (datasetIndex === 0) {
              // First dataset: range bars
              const dataPoint = chartData.dataPoints[dataIndex];
              const metricLabel = metric === "ranking" ? "Sıralama" : "Puan";
              const formatValue = (val) =>
                metric === "ranking"
                  ? Math.round(val).toLocaleString("tr-TR")
                  : val.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    });
              const spread = dataPoint.max - dataPoint.min;
              const fulfillmentRate = dataPoint.fulfillmentRate || 100;
              const result = [
                `Max ${metricLabel}: ${formatValue(dataPoint.max)}`,
                `Min ${metricLabel}: ${formatValue(dataPoint.min)}`,
                `Fark: ${formatValue(spread)}`,
                `Doluluk: %${Math.round(fulfillmentRate)}`,
                `Kontenjan: ${dataPoint.capacity || 0}`,
                `Yerleşen: ${dataPoint.yerlesen || 0}`,
              ];
              // Only show price for 2024 and 2025
              if (showPrices) {
                const price = chartData.pricePoints?.[dataIndex] || 0;
                result.push(`Ücret: ${price.toLocaleString("tr-TR")} ₺`);
              }
              return result;
            } else {
              // Second dataset: price bars
              const price = context.parsed.y;
              return `Yıllık Ücret: ${price.toLocaleString("tr-TR")} ₺`;
            }
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 90,
          minRotation: 45,
          font: {
            size: 9,
          },
          callback: function (value, index) {
            const label = this.getLabelForValue(value);
            // Split long labels into multiple lines (max 40 chars per line)
            const maxCharsPerLine = 40;
            if (label.length <= maxCharsPerLine) return label;

            const words = label.split(" ");
            const lines = [];
            let currentLine = "";

            words.forEach((word) => {
              if ((currentLine + " " + word).length <= maxCharsPerLine) {
                currentLine += (currentLine ? " " : "") + word;
              } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
              }
            });
            if (currentLine) lines.push(currentLine);

            return lines;
          },
        },
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: metric === "ranking" ? "Başarı Sıralaması" : "Puan",
        },
        beginAtZero: false,
        reverse: metric === "ranking", // Reverse Y-axis for ranking so lower numbers appear at top
      },
      y1: {
        type: "linear",
        display: showPrices, // Only display for 2024 and 2025
        position: "right",
        title: {
          display: showPrices,
          text: "Yıllık Ücret (TL)",
        },
        beginAtZero: true,
        grid: {
          drawOnChartArea: false, // Only draw grid lines for the left axis
        },
        ticks: {
          callback: function (value) {
            // Format price with thousands separator
            return value.toLocaleString("tr-TR") + " ₺";
          },
        },
      },
    },
  };

  const data = {
    labels: chartData.labels,
    datasets: datasets,
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            label={`Aralık Adımı (${
              metric === "ranking" ? "Sıralama" : "Puan"
            })`}
            type="number"
            value={bufferStep}
            onChange={(e) => setBufferStep(Number(e.target.value))}
            size="small"
            sx={{ width: 200 }}
            inputProps={{ min: 1, step: metric === "ranking" ? 1000 : 1 }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <MuiTooltip
                title={
                  metric === "ranking"
                    ? "Üst aralığı genişlet (daha küçük sıralamalar)"
                    : "Üst aralığı genişlet (daha yüksek puanlar)"
                }
              >
                <IconButton
                  onClick={handleExpandTop}
                  color="primary"
                  size="small"
                  sx={{
                    border: "1px solid",
                    borderColor: "primary.main",
                    "&:hover": { backgroundColor: "primary.light" },
                  }}
                >
                  <ArrowUpward />
                </IconButton>
              </MuiTooltip>
              <MuiTooltip
                title={
                  metric === "ranking"
                    ? "Alt aralığı genişlet (daha büyük sıralamalar)"
                    : "Alt aralığı genişlet (daha düşük puanlar)"
                }
              >
                <IconButton
                  onClick={handleExpandBottom}
                  color="secondary"
                  size="small"
                  sx={{
                    border: "1px solid",
                    borderColor: "secondary.main",
                    "&:hover": { backgroundColor: "secondary.light" },
                  }}
                >
                  <ArrowDownward />
                </IconButton>
              </MuiTooltip>
            </Box>
            <Box sx={{ ml: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                Mevcut Aralık:
              </Typography>
              <Typography
                variant="body2"
                color={isCustomRange ? "primary.main" : "text.primary"}
              >
                {formatValue(displayMin)} - {formatValue(displayMax)}
              </Typography>
              {isCustomRange && (
                <Typography variant="caption" color="text.secondary">
                  (Orijinal: {formatValue(originalMin)} -{" "}
                  {formatValue(originalMax)})
                </Typography>
              )}
            </Box>
          </Box>
          {isCustomRange && (
            <MuiTooltip title="Aralığı sıfırla">
              <IconButton
                onClick={handleReset}
                color="warning"
                size="small"
                sx={{
                  width: 20,
                  border: "1px solid",
                  borderColor: "warning.main",
                  "&:hover": { backgroundColor: "warning.light" },
                }}
              >
                <RestartAlt />
              </IconButton>
            </MuiTooltip>
          )}
        </Box>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Sıralama</InputLabel>
          <Select
            value={sortBy}
            label="Sıralama"
            onChange={(e) => onSortChange(e.target.value)}
          >
            <MenuItem value="spread">Aralık Büyüklüğü</MenuItem>
            <MenuItem value="price">Ücret</MenuItem>
            <MenuItem value="fulfillment">Doluluk Oranı</MenuItem>
            <MenuItem value="max">
              {metric === "ranking" ? "Taban Sıralama" : "Tavan Puan"}
            </MenuItem>
            <MenuItem value="min">
              {metric === "ranking" ? "Tavan Sıralama" : "Taban Puan"}
            </MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Gösterilecek Program Sayısı"
          type="number"
          value={recordLimit}
          onChange={(e) => {
            const val = e.target.value;
            const num = Number(val);
            if (num >= 10 && num <= 31) {
              onRecordLimitChange(num);
            }
          }}
          size="small"
          sx={{ width: 200 }}
          inputProps={{ min: 10, max: 30, step: 5 }}
        />
      </Box>
      <Box sx={{ height: 500 }}>
        <Bar options={options} data={data} plugins={[varyingBarWidthPlugin]} />
      </Box>
      <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Seçilen Program:
        </Typography>
        <Typography variant="body2">
          <strong>Üniversite:</strong> {selectedProgram?.university}
        </Typography>
        <Typography variant="body2">
          <strong>Program:</strong> {selectedProgram?.program}{" "}
          {selectedProgram?.program_detail}
        </Typography>
        <Typography variant="body2">
          <strong>Burs Türü:</strong> {selectedProgram?.scholarship}
        </Typography>
        {totalPrograms &&
          totalPrograms >
            chartData.dataPoints.reduce(
              (sum, d) => sum + d.programs.length,
              0
            ) && (
            <Typography variant="body2" color="warning.main">
              <strong>Toplam Eşleşen:</strong> {totalPrograms} program (Grafikte
              ilk{" "}
              {chartData.dataPoints.reduce(
                (sum, d) => sum + d.programs.length,
                0
              )}{" "}
              gösteriliyor)
            </Typography>
          )}
      </Box>
    </Paper>
  );
};

export default ComparisonChart;

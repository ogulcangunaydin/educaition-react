import React from "react";
import { Box, Paper, Typography } from "@mui/material";
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
}) => {
  if (!chartData || !chartData.labels || chartData.labels.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center", minHeight: 400 }}>
        <Typography variant="body1" color="text.secondary">
          Karşılaştırma için program seçiniz
        </Typography>
      </Paper>
    );
  }

  // Prepare data for floating bar chart showing only min-max ranges
  // Using floating bars: [min, max] creates a bar from min to max value
  const datasets = [
    {
      label: metric === "ranking" ? "Sıralama Aralığı" : "Puan Aralığı",
      data: chartData.dataPoints.map((d) => [d.min, d.max]),
      backgroundColor: chartData.colors,
      borderColor: chartData.colors.map((c) => c.replace("0.6", "1")),
      borderWidth: 2,
      borderSkipped: false,
    },
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
            const dataPoint = chartData.dataPoints[context.dataIndex];
            const metricLabel = metric === "ranking" ? "Sıralama" : "Puan";
            const formatValue = (val) =>
              metric === "ranking"
                ? Math.round(val).toLocaleString("tr-TR")
                : val.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  });
            return [
              `Max ${metricLabel}: ${formatValue(dataPoint.max)}`,
              `Min ${metricLabel}: ${formatValue(dataPoint.min)}`,
              `Program Sayısı: ${dataPoint.programs.length}`,
            ];
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
        title: {
          display: true,
          text: metric === "ranking" ? "Başarı Sıralaması" : "Puan",
        },
        beginAtZero: false,
      },
    },
  };

  const data = {
    labels: chartData.labels,
    datasets: datasets,
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ height: 500 }}>
        <Bar options={options} data={data} />
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
        <Typography variant="body2">
          <strong>Grafikte Gösterilen:</strong>{" "}
          {chartData.dataPoints.reduce((sum, d) => sum + d.programs.length, 0)}{" "}
          program (Bir kişi alıp max ve min farkı 0 olan programlar
          gösterilmemektedir)
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

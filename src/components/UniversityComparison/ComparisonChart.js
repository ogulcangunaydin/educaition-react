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

const ComparisonChart = ({ chartData, selectedProgram, year, metric }) => {
  if (!chartData || !chartData.labels || chartData.labels.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center", minHeight: 400 }}>
        <Typography variant="body1" color="text.secondary">
          Karşılaştırma için program seçiniz
        </Typography>
      </Paper>
    );
  }

  // Prepare data for stacked bar chart to simulate box plot
  const datasets = [
    {
      label: "Minimum",
      data: chartData.dataPoints.map((d) => d.min),
      backgroundColor: chartData.colors.map((c) => c.replace("0.6", "0.3")),
      borderColor: chartData.colors.map((c) => c.replace("0.6", "1")),
      borderWidth: 1,
    },
    {
      label: "Q1 - Min",
      data: chartData.dataPoints.map((d) => d.q1 - d.min),
      backgroundColor: chartData.colors.map((c) => c.replace("0.6", "0.5")),
      borderColor: chartData.colors.map((c) => c.replace("0.6", "1")),
      borderWidth: 1,
    },
    {
      label: "Median - Q1",
      data: chartData.dataPoints.map((d) => d.median - d.q1),
      backgroundColor: chartData.colors,
      borderColor: chartData.colors.map((c) => c.replace("0.6", "1")),
      borderWidth: 2,
    },
    {
      label: "Q3 - Median",
      data: chartData.dataPoints.map((d) => d.q3 - d.median),
      backgroundColor: chartData.colors.map((c) => c.replace("0.6", "0.5")),
      borderColor: chartData.colors.map((c) => c.replace("0.6", "1")),
      borderWidth: 1,
    },
    {
      label: "Maximum - Q3",
      data: chartData.dataPoints.map((d) => d.max - d.q3),
      backgroundColor: chartData.colors.map((c) => c.replace("0.6", "0.3")),
      borderColor: chartData.colors.map((c) => c.replace("0.6", "1")),
      borderWidth: 1,
    },
  ];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
            return [
              `Minimum: ${dataPoint.min.toFixed(2)}`,
              `Q1: ${dataPoint.q1.toFixed(2)}`,
              `Median: ${dataPoint.median.toFixed(2)}`,
              `Q3: ${dataPoint.q3.toFixed(2)}`,
              `Maximum: ${dataPoint.max.toFixed(2)}`,
              `Program Sayısı: ${dataPoint.programs.length}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          autoSkip: false,
          maxRotation: 90,
          minRotation: 45,
          font: {
            size: 10,
          },
        },
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: metric === "ranking" ? "Başarı Sıralaması" : "Puan",
        },
        reverse: metric === "ranking", // Reverse for ranking (lower is better)
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
          <strong>Toplam Eşleşen Program:</strong>{" "}
          {chartData.dataPoints.reduce((sum, d) => sum + d.programs.length, 0)}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ComparisonChart;

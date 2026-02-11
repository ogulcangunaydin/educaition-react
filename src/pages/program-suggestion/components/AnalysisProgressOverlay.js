/**
 * AnalysisProgressOverlay — Shows a step-by-step progress view
 * while the backend processes RIASEC results and GPT analysis.
 *
 * Each step auto-advances on a timer to simulate progress.
 * The final step stays active until the API actually completes.
 */

import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Paper, LinearProgress, Fade } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import AutorenewIcon from "@mui/icons-material/Autorenew";

const STEPS = [
  {
    label: "RIASEC puanları hesaplanıyor",
    description: "Cevaplarınız analiz ediliyor ve kişilik profiliniz çıkarılıyor",
    icon: "🧠",
    duration: 3000,
  },
  {
    label: "Kariyer profili oluşturuluyor",
    description: "6 RIASEC boyutundaki puanlarınız hesaplanıyor",
    icon: "📊",
    duration: 4000,
  },
  {
    label: "Meslek havuzu taranıyor",
    description: "RIASEC profilinize en uygun meslekler belirleniyor",
    icon: "🎯",
    duration: 5000,
  },
  {
    label: "Yapay zeka meslek seçimi yapıyor",
    description: "Puanınıza ve alanınıza göre en uygun meslekler seçiliyor",
    icon: "🤖",
    duration: 12000,
  },
  {
    label: "Üniversite programları araştırılıyor",
    description: "Her meslek için uygun programlar yapay zeka ile belirleniyor",
    icon: "🎓",
    duration: 15000,
  },
  {
    label: "Program eşleştirmesi yapılıyor",
    description: "Binlerce program arasından puanınıza uygun olanlar filtreleniyor",
    icon: "🏫",
    duration: 15000,
  },
  {
    label: "Burs ve kontenjan analizi",
    description: "Burs imkanları ve kontenjan durumları kontrol ediliyor",
    icon: "💰",
    duration: 12000,
  },
  {
    label: "Sıralama tahmini hesaplanıyor",
    description: "Geçen yılın verileriyle tahmini sıralamanız belirleniyor",
    icon: "📈",
    duration: 10000,
  },
  {
    label: "Sonuçlar hazırlanıyor",
    description: "Kişiselleştirilmiş önerileriniz son haline getiriliyor",
    icon: "✨",
    duration: null, // Stays until API completes
  },
];

function AnalysisProgressOverlay({ isComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Advance steps on timer
  useEffect(() => {
    if (isComplete) {
      setCurrentStep(STEPS.length); // Mark all done
      return;
    }

    const step = STEPS[currentStep];
    if (!step || step.duration === null) return; // Last step — wait for API

    const timer = setTimeout(() => {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, step.duration);

    return () => clearTimeout(timer);
  }, [currentStep, isComplete]);

  // Track elapsed time
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}dk ${s}sn` : `${s}sn`;
  };

  // Overall progress percentage
  const progress = isComplete
    ? 100
    : Math.min(95, (currentStep / STEPS.length) * 85 + (elapsed / 150) * 10);

  return (
    <Fade in timeout={400}>
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 1300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
        }}
      >
        <Paper
          elevation={8}
          sx={{
            maxWidth: 520,
            width: "90%",
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          {/* Title */}
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 0.5 }}>
            🔬 Analiz Devam Ediyor
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Lütfen bu sayfadan ayrılmayın — sonuçlarınız hazırlanıyor
          </Typography>

          {/* Overall progress bar */}
          <Box sx={{ mb: 3 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "#e0e0e0",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  background: "linear-gradient(90deg, #1976d2, #42a5f5)",
                  transition: "transform 1s ease",
                },
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {Math.round(progress)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Geçen süre: {formatTime(elapsed)}
              </Typography>
            </Box>
          </Box>

          {/* Steps */}
          <Box sx={{ textAlign: "left" }}>
            {STEPS.map((step, idx) => {
              const isDone = idx < currentStep || isComplete;
              const isActive = idx === currentStep && !isComplete;

              return (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                    py: 1,
                    opacity: idx > currentStep && !isComplete ? 0.4 : 1,
                    transition: "opacity 0.5s",
                  }}
                >
                  {/* Icon */}
                  <Box sx={{ mt: 0.3, flexShrink: 0 }}>
                    {isDone ? (
                      <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 22 }} />
                    ) : isActive ? (
                      <AutorenewIcon
                        sx={{
                          color: "#1976d2",
                          fontSize: 22,
                          animation: "spin 1.5s linear infinite",
                          "@keyframes spin": {
                            "0%": { transform: "rotate(0deg)" },
                            "100%": { transform: "rotate(360deg)" },
                          },
                        }}
                      />
                    ) : (
                      <RadioButtonUncheckedIcon sx={{ color: "#bdbdbd", fontSize: 22 }} />
                    )}
                  </Box>

                  {/* Text */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isActive || isDone ? "bold" : "normal",
                        color: isDone ? "#4caf50" : isActive ? "#1976d2" : "text.secondary",
                      }}
                    >
                      {step.icon} {step.label}
                    </Typography>
                    {(isActive || isDone) && (
                      <Fade in timeout={500}>
                        <Typography variant="caption" color="text.secondary">
                          {isDone ? "Tamamlandı ✓" : step.description}
                        </Typography>
                      </Fade>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Bottom note */}
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 3 }}>
            Bu işlem yapay zeka analizi içerdiğinden 1-2 dakika sürebilir, lütfen bekleyiniz.
          </Typography>
        </Paper>
      </Box>
    </Fade>
  );
}

export default AnalysisProgressOverlay;

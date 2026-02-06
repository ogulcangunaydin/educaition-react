/**
 * Dashboard Page
 *
 * Main dashboard with module navigation, stats, and quick actions.
 * Uses i18n for translations and atomic design components.
 */

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Typography, Divider, alpha } from "@mui/material";
import {
  Psychology,
  CompareArrows,
  School,
  Groups,
  Person,
  Dashboard as DashboardIcon,
  MeetingRoom,
  PlayCircle,
  People,
  Today,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@components/templates";
import { ModuleCard, StatCard } from "@components/molecules";
import { useAuth } from "@contexts/AuthContext";
import { canAccessModule } from "@config/permissions";
import testRoomService from "@services/testRoomService";

// Module configuration with i18n keys
const MODULE_CONFIG = [
  {
    id: "test-management",
    translationKey: "testManagement",
    path: "/test-management",
    icon: DashboardIcon,
    color: "#5c6bc0",
    isUnified: true,
  },
  {
    id: "prisoners-dilemma",
    translationKey: "prisonersDilemma",
    path: "/rooms",
    icon: Groups,
    color: "#1976d2",
  },
  {
    id: "dissonance-test",
    translationKey: "dissonanceTest",
    path: "/dissonanceTestParticipantList",
    icon: Psychology,
    color: "#9c27b0",
  },
  {
    id: "university-comparison",
    translationKey: "universityComparison",
    path: "/university-comparison",
    icon: CompareArrows,
    color: "#2e7d32",
  },
  {
    id: "program-suggestion",
    translationKey: "programSuggestion",
    path: "/high-school-rooms",
    icon: School,
    color: "#ed6c02",
  },
  {
    id: "personality-test",
    translationKey: "personalityTest",
    path: "/personality-test-rooms",
    icon: Person,
    color: "#00897b",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRooms: 0,
    activeRooms: 0,
    totalParticipants: 0,
    todayParticipants: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const rooms = await testRoomService.getTestRooms();
        const roomList = rooms.items || rooms || [];

        setStats({
          totalRooms: roomList.length,
          activeRooms: roomList.filter((r) => r.is_active).length,
          totalParticipants: roomList.reduce((acc, r) => acc + (r.participant_count || 0), 0),
          todayParticipants: 0, // Would need a separate API call
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Filter modules based on user permissions
  const accessibleModules = useMemo(() => {
    return MODULE_CONFIG.filter((m) => {
      // Test management is accessible if user can access any test module
      if (m.id === "test-management") {
        return (
          canAccessModule(user, "prisoners-dilemma") ||
          canAccessModule(user, "dissonance-test") ||
          canAccessModule(user, "program-suggestion") ||
          canAccessModule(user, "personality-test")
        );
      }
      return canAccessModule(user, m.id);
    });
  }, [user]);

  // Get greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "🌅";
    if (hour < 18) return "☀️";
    return "🌙";
  }, []);

  const userName = user?.username || user?.name || "";

  return (
    <PageLayout title={t("dashboard.title")} maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {greeting}{" "}
            {userName ? t("dashboard.welcomeBack", { name: userName }) : t("dashboard.welcome")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("dashboard.selectModule")}
          </Typography>
        </Box>

        {/* Stats Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title={t("dashboard.stats.totalRooms")}
              value={stats.totalRooms}
              icon={MeetingRoom}
              color="#5c6bc0"
              loading={statsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title={t("dashboard.stats.activeRooms")}
              value={stats.activeRooms}
              icon={PlayCircle}
              color="#2e7d32"
              loading={statsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title={t("dashboard.stats.totalParticipants")}
              value={stats.totalParticipants}
              icon={People}
              color="#1976d2"
              loading={statsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title={t("dashboard.stats.todayParticipants")}
              value={stats.todayParticipants}
              icon={Today}
              color="#ed6c02"
              loading={statsLoading}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Modules Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {t("navigation.modules")}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {accessibleModules.map((module) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={module.id}>
              <ModuleCard
                title={t(`dashboard.modules.${module.translationKey}.title`)}
                description={t(`dashboard.modules.${module.translationKey}.description`)}
                icon={module.icon}
                color={module.color}
                onClick={() => navigate(module.path)}
              />
            </Grid>
          ))}
        </Grid>

        {/* Empty State */}
        {accessibleModules.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: 4,
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t("common.noData")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("common.somethingWentWrong")}
            </Typography>
          </Box>
        )}
      </Box>
    </PageLayout>
  );
}

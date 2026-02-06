/**
 * TestManagement Page
 *
 * Unified test management dashboard that allows users to:
 * - View all test types in one place
 * - Navigate to specific test room management
 * - See quick statistics across all tests
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Groups as GroupsIcon,
  Psychology as PsychologyIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { PageLayout } from "@components/templates";
import { Typography, Button } from "@components/atoms";
import { TestType, TEST_TYPE_CONFIG, getTestRooms } from "../services/testRoomService";
import { canAccessModule } from "@config/permissions";
import { useAuth } from "@contexts/AuthContext";

// Icon mapping
const ICONS = {
  Groups: GroupsIcon,
  Psychology: PsychologyIcon,
  School: SchoolIcon,
  Person: PersonIcon,
};

// Test type to module ID mapping
const TEST_TYPE_TO_MODULE = {
  [TestType.PRISONERS_DILEMMA]: "prisoners-dilemma",
  [TestType.DISSONANCE_TEST]: "dissonance-test",
  [TestType.PROGRAM_SUGGESTION]: "program-suggestion",
  [TestType.PERSONALITY_TEST]: "personality-test",
};

// Test type to route mapping
const TEST_TYPE_TO_ROUTE = {
  [TestType.PRISONERS_DILEMMA]: "/rooms",
  [TestType.DISSONANCE_TEST]: "/dissonanceTestParticipantList",
  [TestType.PROGRAM_SUGGESTION]: "/high-school-rooms",
  [TestType.PERSONALITY_TEST]: "/personality-test-rooms",
};

function TestTypeCard({ config, stats, loading, onClick }) {
  const IconComponent = ICONS[config.icon] || PersonIcon;

  return (
    <Card
      sx={{
        height: "100%",
        borderLeft: 4,
        borderColor: config.color,
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ height: "100%" }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                backgroundColor: `${config.color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <IconComponent sx={{ fontSize: 24, color: config.color }} />
            </Box>
            <ArrowForwardIcon color="action" />
          </Box>

          <Typography variant="h6" gutterBottom>
            {config.label}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {config.labelEn}
          </Typography>

          {loading ? (
            <CircularProgress size={20} />
          ) : (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip
                label={`${stats?.rooms || 0} Oda`}
                size="small"
                variant="outlined"
                sx={{ borderColor: config.color, color: config.color }}
              />
              <Chip
                label={`${stats?.active || 0} Aktif`}
                size="small"
                color="success"
                variant="outlined"
              />
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function TestManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const newStats = {};

      // Fetch stats for each test type
      for (const type of Object.values(TestType)) {
        try {
          const response = await getTestRooms({ testType: type });
          const rooms = response.items || response || [];
          newStats[type] = {
            rooms: rooms.length,
            active: rooms.filter((r) => r.is_active).length,
          };
        } catch (err) {
          console.error(`Failed to fetch stats for ${type}:`, err);
          newStats[type] = { rooms: 0, active: 0 };
        }
      }

      setStats(newStats);
      setLoading(false);
    };

    fetchStats();
  }, []);

  // Filter test types based on user permissions
  const accessibleTypes = Object.values(TestType).filter((type) => {
    const moduleId = TEST_TYPE_TO_MODULE[type];
    return canAccessModule(user, moduleId);
  });

  const handleTestTypeClick = (type) => {
    const route = TEST_TYPE_TO_ROUTE[type];
    if (route) {
      navigate(route);
    }
  };

  const totalRooms = Object.values(stats).reduce((acc, s) => acc + (s.rooms || 0), 0);
  const totalActive = Object.values(stats).reduce((acc, s) => acc + (s.active || 0), 0);

  return (
    <PageLayout
      title="Test Yönetimi"
      maxWidth="lg"
      showBackButton
      onBack={() => navigate("/dashboard")}
    >
      <Box sx={{ mt: 2 }}>
        {/* Overview Stats */}
        <Card sx={{ mb: 4, bgcolor: "primary.main", color: "white" }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h5" gutterBottom sx={{ color: "inherit" }}>
                  Test Odaları Yönetimi
                </Typography>
                <Typography variant="body1" sx={{ color: "inherit", opacity: 0.9 }}>
                  Tüm test türlerinizi tek bir yerden yönetin. Her test türüne tıklayarak odalarını
                  görüntüleyebilir ve yönetebilirsiniz.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 3,
                    justifyContent: { xs: "flex-start", md: "flex-end" },
                  }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h3" sx={{ color: "inherit" }}>
                      {loading ? "-" : totalRooms}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "inherit", opacity: 0.8 }}>
                      Toplam Oda
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h3" sx={{ color: "inherit" }}>
                      {loading ? "-" : totalActive}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "inherit", opacity: 0.8 }}>
                      Aktif Oda
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Test Type Cards */}
        <Typography variant="h6" gutterBottom>
          Test Türleri
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Yönetmek istediğiniz test türünü seçin
        </Typography>

        <Grid container spacing={3}>
          {accessibleTypes.map((type) => {
            const config = TEST_TYPE_CONFIG[type];
            return (
              <Grid item xs={12} sm={6} md={3} key={type}>
                <TestTypeCard
                  type={type}
                  config={config}
                  stats={stats[type]}
                  loading={loading}
                  onClick={() => handleTestTypeClick(type)}
                />
              </Grid>
            );
          })}
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Hızlı İşlemler
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/personality-test-rooms")}
              startIcon={<PersonIcon />}
            >
              Kişilik Testi Odaları
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/high-school-rooms")}
              startIcon={<SchoolIcon />}
            >
              Lise Odaları
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/rooms")}
              startIcon={<GroupsIcon />}
            >
              Oyun Odaları
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/dissonanceTestParticipantList")}
              startIcon={<PsychologyIcon />}
            >
              Bilişsel Uyumsuzluk
            </Button>
          </Box>
        </Box>
      </Box>
    </PageLayout>
  );
}

export default TestManagement;

import { useNavigate } from "react-router-dom";
import { Box, Grid, Paper, Typography } from "@mui/material";
import {
  Psychology,
  CompareArrows,
  School,
  Groups,
  Person,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { PageLayout } from "@components/templates";
import { useAuth } from "@contexts/AuthContext";
import { canAccessModule } from "@config/permissions";

// Dashboard card styling
const ModuleCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  cursor: "pointer",
  transition: "transform 0.2s, box-shadow 0.2s",
  height: "100%",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}));

const IconWrapper = styled(Box)(({ theme, bgcolor }) => ({
  width: 64,
  height: 64,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: bgcolor || theme.palette.primary.main,
  color: "#fff",
  marginBottom: theme.spacing(2),
}));

// Module configuration
const MODULES = [
  {
    id: "test-management",
    title: "Test Yönetimi",
    description: "Tüm test odalarını tek yerden yönetin",
    path: "/test-management",
    icon: DashboardIcon,
    color: "#5c6bc0",
    isUnified: true,
  },
  {
    id: "prisoners-dilemma",
    title: "Mahkum İkilemi",
    description: "Oyun teorisi ve karar verme simülasyonu",
    path: "/rooms",
    icon: Groups,
    color: "#1976d2",
  },
  {
    id: "dissonance-test",
    title: "Bilişsel Uyumsuzluk Testi",
    description: "Katılımcı listesi ve test sonuçları",
    path: "/dissonanceTestParticipantList",
    icon: Psychology,
    color: "#9c27b0",
  },
  {
    id: "university-comparison",
    title: "Üniversite Karşılaştırma",
    description: "Üniversite ve program analizi",
    path: "/university-comparison",
    icon: CompareArrows,
    color: "#2e7d32",
  },
  {
    id: "program-suggestion",
    title: "Program Öneri Sistemi",
    description: "Lise odaları ve program önerileri",
    path: "/high-school-rooms",
    icon: School,
    color: "#ed6c02",
  },
  {
    id: "personality-test",
    title: "Kişilik Testi",
    description: "Big Five kişilik testi odaları",
    path: "/personality-test-rooms",
    icon: Person,
    color: "#00897b",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const accessibleModules = MODULES.filter((m) => {
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

  return (
    <PageLayout title="Dashboard" maxWidth="lg">
      <Box sx={{ mt: 10, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Hoş Geldiniz
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Bir modül seçerek başlayın
        </Typography>

        <Grid container spacing={3}>
          {accessibleModules.map((module) => {
            const IconComponent = module.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={module.id}>
                <ModuleCard elevation={2} onClick={() => navigate(module.path)}>
                  <IconWrapper bgcolor={module.color}>
                    <IconComponent sx={{ fontSize: 32 }} />
                  </IconWrapper>
                  <Typography variant="h6" gutterBottom>
                    {module.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {module.description}
                  </Typography>
                </ModuleCard>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </PageLayout>
  );
}

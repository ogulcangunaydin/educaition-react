/**
 * ProgramSuggestionRoomDetail Page
 *
 * Shows detailed view of a program suggestion room including:
 * - Room information and QR code
 * - Participant list with completion status
 * - RIASEC scores and job recommendations
 */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconButton, Tooltip, Chip, Box, Typography } from "@mui/material";
import { Visibility as ViewIcon, BugReport as BugReportIcon } from "@mui/icons-material";
import { PageLayout, PageLoading, PageError } from "@components/templates";
import { QRCodeOverlay, RoomParticipantEmptyState, MarkdownSection } from "@components/molecules";
import { RoomInfoHeader, DataTable, RadarChart, ResultDetailDialog } from "@components/organisms";
import programSuggestionService from "@services/programSuggestionService";
import { getTestRoom, generateRoomUrl, TestType } from "@services/testRoomService";
import jobTranslations from "@data/riasec/job_translations.json";

// Normalize string for comparison (handle dash/comma confusion, whitespace, etc.)
const normalizeForComparison = (str) => {
  return str
    .toLocaleLowerCase("en-US")
    .replace(/[,\-–—]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

// Helper function to translate job name from English to Turkish
const translateJob = (englishName) => {
  const normalizedInput = normalizeForComparison(englishName);
  const translation = jobTranslations.find(
    (job) => normalizeForComparison(job.en) === normalizedInput
  );
  return translation ? translation.tr : englishName;
};

// RIASEC trait names
const RIASEC_NAMES = {
  R: "Realistic (Gerçekçi)",
  I: "Investigative (Araştırmacı)",
  A: "Artistic (Sanatsal)",
  S: "Social (Sosyal)",
  E: "Enterprising (Girişimci)",
  C: "Conventional (Geleneksel)",
};

// Status configuration for chips
const getStatusConfig = (status) => {
  const statusConfig = {
    started: { label: "Başladı", color: "default" },
    step1_completed: { label: "Adım 1", color: "info" },
    step2_completed: { label: "Adım 2", color: "info" },
    step3_completed: { label: "Adım 3", color: "info" },
    step4_completed: { label: "Adım 4", color: "warning" },
    riasec_completed: { label: "RIASEC Tamamlandı", color: "warning" },
    completed: { label: "Tamamlandı", color: "success" },
  };
  return statusConfig[status] || { label: status, color: "default" };
};

function ProgramSuggestionRoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQR, setShowQR] = useState(false);

  // Result detail dialog
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [debugData, setDebugData] = useState(null);
  const [debugLoading, setDebugLoading] = useState(false);

  const fetchRoomData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const roomData = await getTestRoom(roomId);
      setRoom(roomData);

      try {
        // Use test room API to get participants
        const participantsData = await programSuggestionService.getParticipants(roomId);
        setParticipants(participantsData || []);
      } catch (err) {
        console.error("Error fetching participants:", err);
      }
    } catch (err) {
      console.error("Error fetching room data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRoomData();
  }, [fetchRoomData]);

  const handleViewResult = (studentId) => {
    navigate(`/program-test-result/${studentId}`);
  };

  const handleViewDebug = async (participant) => {
    setSelectedParticipant(participant);
    setDebugLoading(true);
    try {
      const data = await programSuggestionService.getStudentDebug(participant.id);
      setDebugData(data);
    } catch (error) {
      console.error("Failed to fetch debug data:", error);
    } finally {
      setDebugLoading(false);
    }
  };

  const handleDeleteParticipant = async (participant) => {
    await programSuggestionService.deleteStudent(participant.id);
    setParticipants((prev) => prev.filter((p) => p.id !== participant.id));
  };

  if (loading) return <PageLoading onBack={() => navigate(-1)} />;
  if (error) return <PageError message={error} onBack={() => navigate(-1)} />;

  const roomUrl = generateRoomUrl(roomId, TestType.PROGRAM_SUGGESTION);
  const completedCount = participants.filter((p) => p.status === "completed").length;

  // RIASEC radar chart labels
  const riasecLabels = Object.values(RIASEC_NAMES);

  const getRadarDatasets = (participant) => {
    const scores = participant.riasec_scores || {};
    return [
      {
        label: t("tests.programSuggestion.riasecProfile", "RIASEC Profili"),
        data: [
          scores.R || 0,
          scores.I || 0,
          scores.A || 0,
          scores.S || 0,
          scores.E || 0,
          scores.C || 0,
        ],
      },
    ];
  };

  return (
    <PageLayout
      title={room?.name || t("tests.programSuggestion.roomDetail.pageTitle", "Program Öneri Odası")}
      maxWidth="lg"
      showBackButton
      onBack={() => navigate("/program-suggestion-rooms")}
    >
      {/* Room Info Header */}
      <RoomInfoHeader
        room={room}
        roomId={roomId}
        testType={TestType.PROGRAM_SUGGESTION}
        participantCount={participants.length}
        completedCount={completedCount}
        onShowQR={() => setShowQR(true)}
        onRefresh={fetchRoomData}
      />

      {/* Participants Table */}
      {participants.length === 0 ? (
        <RoomParticipantEmptyState onShowQR={() => setShowQR(true)} />
      ) : (
        <DataTable
          columns={[
            { id: "id", label: "ID", type: "string", width: 60 },
            { id: "name", label: t("tests.participantInfo.name", "İsim"), type: "string" },
            { id: "gender", label: t("tests.participantInfo.gender", "Cinsiyet"), type: "string" },
            {
              id: "birth_year",
              label: t("tests.participantInfo.birthYear", "Doğum Yılı"),
              type: "string",
            },
            {
              id: "area",
              label: t("tests.programSuggestion.area", "Alan"),
              render: (value, row) => (
                <Box>
                  {value?.toUpperCase() || "-"}
                  {row.alternative_area && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      / {row.alternative_area.toUpperCase()}
                    </Typography>
                  )}
                </Box>
              ),
            },
            {
              id: "status",
              label: t("common.status", "Durum"),
              align: "center",
              render: (value) => {
                const config = getStatusConfig(value);
                return <Chip label={config.label} color={config.color} size="small" />;
              },
            },
            { id: "created_at", label: t("common.date", "Tarih"), type: "date" },
            {
              id: "actions",
              label: t("tests.result", "Sonuç"),
              align: "center",
              sortable: false,
              render: (_value, row) =>
                row.status === "completed" ? (
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                    <Tooltip title={t("tests.viewResults", "Sonuçları Gör")}>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleViewResult(row.id)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Debug">
                      <IconButton
                        color="secondary"
                        size="small"
                        onClick={() => handleViewDebug(row)}
                      >
                        <BugReportIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ) : (
                  "-"
                ),
            },
          ]}
          data={participants}
          pagination={participants.length > 10}
          defaultSortBy="created_at"
          defaultSortOrder="desc"
          exportable
          exportFileName={`program_suggestion_${room?.name || roomId}_${new Date().toISOString().split("T")[0]}`}
          emptyMessage={t("tests.noParticipantsYet", "Henüz katılımcı yok")}
          deletable
          onDeleteRow={handleDeleteParticipant}
        />
      )}

      {/* Result Detail Dialog (for Debug) */}
      <ResultDetailDialog
        open={!!selectedParticipant}
        onClose={() => {
          setSelectedParticipant(null);
          setDebugData(null);
        }}
        title={t("tests.programSuggestion.debugTitle", "Debug Bilgileri")}
        participant={selectedParticipant}
        loading={debugLoading}
      >
        {selectedParticipant && !debugLoading && debugData && (
          <>
            {/* RIASEC Profile */}
            {debugData.riasec_scores && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  RIASEC Profili
                </Typography>
                <RadarChart labels={riasecLabels} datasets={getRadarDatasets(debugData)} />
              </Box>
            )}

            {/* Top Jobs */}
            {debugData.top_jobs && debugData.top_jobs.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Önerilen Meslekler
                </Typography>
                {debugData.top_jobs.map((job, index) => (
                  <Chip
                    key={index}
                    label={translateJob(job)}
                    sx={{ mr: 1, mb: 1 }}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}

            {/* Raw Debug Data */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Ham Veri
              </Typography>
              <Box
                component="pre"
                sx={{
                  backgroundColor: "#f5f5f5",
                  p: 2,
                  borderRadius: 1,
                  overflow: "auto",
                  maxHeight: 300,
                  fontSize: "0.75rem",
                }}
              >
                {JSON.stringify(debugData, null, 2)}
              </Box>
            </Box>
          </>
        )}
      </ResultDetailDialog>

      {/* QR Code Overlay */}
      {showQR && (
        <QRCodeOverlay
          url={roomUrl}
          onClose={() => setShowQR(false)}
          title={`${room?.name} - ${t("tests.programSuggestion.title", "Program Öneri Testi")}`}
        />
      )}
    </PageLayout>
  );
}

export default ProgramSuggestionRoomDetail;

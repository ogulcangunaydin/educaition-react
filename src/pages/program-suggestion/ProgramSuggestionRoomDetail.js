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
import {
  IconButton,
  Tooltip,
  Chip,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  TouchApp as InteractionIcon,
  Search as SearchIcon,
  ShoppingBasket as BasketIcon,
  RemoveShoppingCart as RemoveBasketIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { PageLayout, PageLoading, PageError } from "@components/templates";
import { QRCodeOverlay, RoomParticipantEmptyState } from "@components/molecules";
import { RoomInfoHeader, DataTable } from "@components/organisms";
import programSuggestionService from "@services/programSuggestionService";
import { getTestRoom, generateRoomUrl, TestType } from "@services/testRoomService";

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
  const [interactions, setInteractions] = useState([]);
  const [interactionDialog, setInteractionDialog] = useState({
    open: false,
    studentName: "",
    studentId: null,
  });
  const [studentInteractions, setStudentInteractions] = useState([]);

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

      try {
        const interactionsData = await programSuggestionService.getRoomInteractions(roomId);
        setInteractions(interactionsData || []);
      } catch (err) {
        console.error("Error fetching interactions:", err);
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
    window.open(`/admin/program-test-result/${studentId}`, "_blank");
  };

  const handleDeleteParticipant = async (participant) => {
    await programSuggestionService.deleteStudent(participant.id);
    setParticipants((prev) => prev.filter((p) => p.id !== participant.id));
  };

  // Get interaction count for a student
  const getInteractionCount = (studentId) => {
    return interactions.filter((i) => i.student_id === studentId).length;
  };

  // Open interaction detail dialog for a student
  const handleViewInteractions = async (studentId, studentName) => {
    try {
      const data = await programSuggestionService.getStudentInteractions(studentId);
      setStudentInteractions(data || []);
    } catch (err) {
      console.error("Error fetching student interactions:", err);
      setStudentInteractions(interactions.filter((i) => i.student_id === studentId));
    }
    setInteractionDialog({ open: true, studentName: studentName || `#${studentId}`, studentId });
  };

  const ACTION_CONFIG = {
    google_search: {
      label: "Google Arama",
      icon: <SearchIcon fontSize="small" />,
      color: "#1976d2",
    },
    add_to_basket: {
      label: "Sepete Ekledi",
      icon: <BasketIcon fontSize="small" />,
      color: "#2e7d32",
    },
    remove_from_basket: {
      label: "Sepetten Çıkardı",
      icon: <RemoveBasketIcon fontSize="small" />,
      color: "#d32f2f",
    },
    view_details: {
      label: "Detay Görüntüledi",
      icon: <InfoIcon fontSize="small" />,
      color: "#ed6c02",
    },
  };

  if (loading) return <PageLoading onBack={() => navigate(-1)} />;
  if (error) return <PageError message={error} onBack={() => navigate(-1)} />;

  const roomUrl = generateRoomUrl(roomId, TestType.PROGRAM_SUGGESTION);
  const completedCount = participants.filter((p) => p.status === "completed").length;

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
                  <Tooltip title={t("tests.viewResults", "Sonuçları Gör")}>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleViewResult(row.id)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  "-"
                ),
            },
            {
              id: "interactions",
              label: "Etkileşim",
              align: "center",
              sortable: false,
              render: (_value, row) => {
                const count = getInteractionCount(row.id);
                return count > 0 ? (
                  <Tooltip title="Etkileşimleri Gör">
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => handleViewInteractions(row.id, row.name)}
                    >
                      <Badge badgeContent={count} color="secondary">
                        <InteractionIcon />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    —
                  </Typography>
                );
              },
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

      {/* QR Code Overlay */}
      {showQR && (
        <QRCodeOverlay
          url={roomUrl}
          onClose={() => setShowQR(false)}
          title={`${room?.name} - ${t("tests.programSuggestion.title", "Program Öneri Testi")}`}
        />
      )}

      {/* Interaction Logs Dialog */}
      <Dialog
        open={interactionDialog.open}
        onClose={() => setInteractionDialog({ open: false, studentName: "", studentId: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{interactionDialog.studentName} - Etkileşim Geçmişi</DialogTitle>
        <DialogContent dividers>
          {studentInteractions.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
              Henüz etkileşim kaydı yok
            </Typography>
          ) : (
            <List dense>
              {studentInteractions.map((log) => {
                const config = ACTION_CONFIG[log.action] || {
                  label: log.action,
                  icon: <InfoIcon fontSize="small" />,
                  color: "#666",
                };
                return (
                  <ListItem key={log.id} sx={{ borderBottom: "1px solid #f0f0f0" }}>
                    <ListItemIcon sx={{ minWidth: 36, color: config.color }}>
                      {config.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
                        >
                          <Chip
                            label={config.label}
                            size="small"
                            sx={{ bgcolor: config.color, color: "#fff", fontSize: "0.7rem" }}
                          />
                          <Typography variant="body2" fontWeight="bold">
                            {log.program_name}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="caption" display="block">
                            {log.university}
                            {log.scholarship && ` • ${log.scholarship}`}
                            {log.city && ` • ${log.city}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.created_at}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setInteractionDialog({ open: false, studentName: "", studentId: null })}
          >
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
}

export default ProgramSuggestionRoomDetail;

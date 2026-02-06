/**
 * TestRoomList Organism
 *
 * A complete test room management component with list, create, and delete functionality.
 */

import React, { useState } from "react";
import PropTypes from "prop-types";
import { Box, Grid, Alert, CircularProgress } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import Typography from "../atoms/Typography";
import Button from "../atoms/Button";
import { EmptyState, ConfirmDialog, QRCodeOverlay } from "../molecules";
import TestRoomCard from "../molecules/TestRoomCard";
import CreateTestRoomModal from "../molecules/CreateTestRoomModal";
import { useTestRooms } from "../../hooks/useTestRooms";
import { generateRoomUrl, TEST_TYPE_CONFIG } from "@services/testRoomService";

function TestRoomList({
  testType,
  title,
  description,
  onRoomClick,
  emptyStateMessage,
  showCreateButton = true,
  gridSize = { xs: 12, sm: 6, md: 4 },
}) {
  const { rooms, loading, error, addRoom, removeRoom, toggleActive } = useTestRooms({ testType });

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [qrRoom, setQrRoom] = useState(null);

  const config = testType ? TEST_TYPE_CONFIG[testType] : null;
  const displayTitle = title || (config ? `${config.label} Odaları` : "Test Odaları");
  const displayDescription = description || "Test odalarınızı yönetin ve QR kod ile paylaşın.";

  const handleCreateRoom = async (roomData) => {
    setCreateLoading(true);
    setCreateError(null);

    try {
      await addRoom(roomData);
      setCreateModalOpen(false);
    } catch (err) {
      setCreateError(err.message);
      throw err;
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteClick = (room) => {
    setRoomToDelete(room);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roomToDelete) return;

    setDeleteLoading(true);

    try {
      await removeRoom(roomToDelete.id);
      setDeleteDialogOpen(false);
      setRoomToDelete(null);
    } catch (err) {
      console.error("Failed to delete room:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleActive = async (room) => {
    try {
      await toggleActive(room.id);
    } catch (err) {
      console.error("Failed to toggle room status:", err);
    }
  };

  const handleShowQR = (room) => {
    setQrRoom(room);
  };

  const handleView = (room) => {
    if (onRoomClick) {
      onRoomClick(room);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            {displayTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {displayDescription}
          </Typography>
        </Box>

        {showCreateButton && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
            sx={{ backgroundColor: config?.color }}
          >
            Yeni Oda
          </Button>
        )}
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Room Grid */}
      {rooms.length === 0 ? (
        <EmptyState
          title="Henüz oda yok"
          description={emptyStateMessage || "Yeni bir oda oluşturarak başlayın."}
          action={
            showCreateButton ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateModalOpen(true)}
              >
                İlk Odayı Oluştur
              </Button>
            ) : null
          }
        />
      ) : (
        <Grid container spacing={3}>
          {rooms.map((room) => (
            <Grid item key={room.id} {...gridSize}>
              <TestRoomCard
                room={room}
                onView={onRoomClick ? handleView : null}
                onDelete={handleDeleteClick}
                onToggleActive={handleToggleActive}
                onShowQR={handleShowQR}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Modal */}
      <CreateTestRoomModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateRoom}
        testType={testType}
        loading={createLoading}
        error={createError}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Odayı Sil"
        message={`"${roomToDelete?.name}" odasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmLabel="Sil"
        cancelLabel="İptal"
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          setDeleteDialogOpen(false);
          setRoomToDelete(null);
        }}
        loading={deleteLoading}
        confirmColor="error"
      />

      {/* QR Code Overlay */}
      {qrRoom && (
        <QRCodeOverlay
          url={generateRoomUrl(qrRoom.id, qrRoom.test_type)}
          onClose={() => setQrRoom(null)}
          size={300}
        />
      )}
    </Box>
  );
}

TestRoomList.propTypes = {
  testType: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  onRoomClick: PropTypes.func,
  emptyStateMessage: PropTypes.string,
  showCreateButton: PropTypes.bool,
  gridSize: PropTypes.object,
};

export default TestRoomList;

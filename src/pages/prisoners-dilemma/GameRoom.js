import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { PageLayout } from "@components/templates";
import { Button, TextField, Modal } from "@components/atoms";
import { List, ListItem } from "@components/atoms/List";
import { EmptyState } from "@components/molecules";
import { useRooms } from "@hooks/prisoners-dilemma";
import { SPACING } from "@theme";

export default function GameRoom() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { rooms, loading, error, creating, createRoom, deleteRoom, refetch } = useRooms();

  const [modalOpen, setModalOpen] = useState(false);
  const [roomName, setRoomName] = useState("");

  const handleCreate = useCallback(
    async (e) => {
      e.preventDefault();
      const result = await createRoom(roomName);
      if (result.success) {
        setModalOpen(false);
        setRoomName("");
      }
    },
    [roomName, createRoom]
  );

  const handleDelete = useCallback(
    async (e, roomId) => {
      e.stopPropagation();
      await deleteRoom(roomId);
    },
    [deleteRoom]
  );

  const openModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    setRoomName("");
  };

  return (
    <PageLayout
      title={t("tests.prisonersDilemma.gameRooms.title")}
      subtitle={t("tests.prisonersDilemma.gameRooms.subtitle")}
      loading={loading}
      error={error}
      onRetry={refetch}
      headerActions={
        <>
          <Button variant="outlined" onClick={() => navigate("/dashboard")}>
            {t("nav.dashboard")}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openModal}>
            {t("tests.createRoom")}
          </Button>
        </>
      }
    >
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {rooms.length === 0 ? (
          <EmptyState
            title={t("tests.prisonersDilemma.gameRooms.noRoomsTitle")}
            message={t("tests.prisonersDilemma.gameRooms.noRoomsMessage")}
            actionLabel={t("tests.createRoom")}
            onAction={openModal}
          />
        ) : (
          <List>
            {rooms.map((room, i) => (
              <ListItem
                key={room.id}
                primary={room.name || `Room-${i + 1}`}
                onClick={() =>
                  navigate(`/playground/${room.id}`, { state: { roomName: room.name } })
                }
                actions={
                  <Button
                    variant="text"
                    color="error"
                    size="small"
                    onClick={(e) => handleDelete(e, room.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </Button>
                }
              />
            ))}
          </List>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={t("tests.prisonersDilemma.gameRooms.createTitle")}
        actions={
          <>
            <Button variant="outlined" onClick={closeModal}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="contained"
              loading={creating}
              disabled={!roomName.trim()}
              onClick={handleCreate}
            >
              {t("common.create")}
            </Button>
          </>
        }
      >
        <TextField
          autoFocus
          fullWidth
          label={t("tests.prisonersDilemma.gameRooms.roomName")}
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder={t("tests.prisonersDilemma.gameRooms.roomNamePlaceholder")}
          sx={{ mb: SPACING.md }}
        />
      </Modal>
    </PageLayout>
  );
}

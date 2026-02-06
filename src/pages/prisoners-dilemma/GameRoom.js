import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
      title="Game Rooms"
      subtitle="Manage your Prisoners Dilemma game rooms"
      loading={loading}
      error={error}
      onRetry={refetch}
      headerActions={
        <>
          <Button variant="outlined" onClick={() => navigate("/dashboard")}>
            Dashboard
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openModal}>
            Create Room
          </Button>
        </>
      }
    >
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {rooms.length === 0 ? (
          <EmptyState
            title="No Rooms Yet"
            message="Create your first game room to get started."
            actionLabel="Create Room"
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
        title="Create New Room"
        actions={
          <>
            <Button variant="outlined" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              variant="contained"
              loading={creating}
              disabled={!roomName.trim()}
              onClick={handleCreate}
            >
              Create
            </Button>
          </>
        }
      >
        <TextField
          autoFocus
          fullWidth
          label="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Enter room name"
          sx={{ mb: SPACING.md }}
        />
      </Modal>
    </PageLayout>
  );
}

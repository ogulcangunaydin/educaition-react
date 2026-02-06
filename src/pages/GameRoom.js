import React, { useState, useCallback } from "react";
import { List, ListItemButton, ListItemText, Modal, Box, styled } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import validator from "validator";
import { useNavigate } from "react-router-dom";

// Components
import { PageLayout } from "../components/templates";
import { Button, TextField } from "../components/atoms";
import { EmptyState } from "../components/molecules";
import { useApi } from "../hooks";
import { COLORS, SPACING, SHADOWS } from "../theme";

/**
 * Styled Components
 */
const RoomListContainer = styled(Box)({
  maxWidth: 600,
  margin: "0 auto",
  padding: SPACING.lg,
});

const RoomItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: SPACING.sm,
  backgroundColor: COLORS.white,
  borderRadius: theme.shape.borderRadius,
  boxShadow: SHADOWS.sm,
  transition: "all 0.2s ease",
  "&:hover": {
    boxShadow: SHADOWS.md,
    transform: "translateX(4px)",
  },
}));

const ModalContent = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  backgroundColor: COLORS.white,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: SHADOWS.xl,
  padding: SPACING.xl,
}));

const ModalTitle = styled("h2")({
  margin: 0,
  marginBottom: SPACING.lg,
  color: COLORS.text.primary,
  fontSize: "1.25rem",
  fontWeight: 600,
});

/**
 * GameRoom Page
 *
 * Displays a list of game rooms for the Prisoners Dilemma module.
 * Users can create, view, and delete rooms.
 */
function GameRoom() {
  const [rooms, setRooms] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch rooms on mount
  const { loading, error, refetch } = useApi(`${process.env.REACT_APP_BACKEND_BASE_URL}/rooms`, {
    immediate: true,
    onSuccess: (data) => setRooms(data || []),
  });

  // Modal handlers
  const handleOpenModal = useCallback(() => setOpenModal(true), []);
  const handleCloseModal = useCallback(() => {
    setOpenModal(false);
    setRoomName("");
  }, []);

  // Create room
  const handleCreateRoom = useCallback(
    async (event) => {
      event.preventDefault();
      setCreateLoading(true);

      try {
        const formBody = new FormData();
        const sanitizedName = validator.escape(roomName);
        const cleanedName = sanitizedName.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "");
        formBody.append("name", cleanedName);

        const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/rooms`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          method: "POST",
          body: formBody,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setRooms((prev) => [...prev, data]);
        handleCloseModal();
      } catch (err) {
        console.error("Failed to create room:", err);
      } finally {
        setCreateLoading(false);
      }
    },
    [roomName, handleCloseModal]
  );

  // Delete room
  const handleDeleteRoom = useCallback(async (roomId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/rooms/delete/${roomId}`,
        {
          method: "POST",
          body: JSON.stringify({ _method: "DELETE" }),
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setRooms((prev) => prev.filter((room) => room.id !== roomId));
    } catch (err) {
      console.error("Failed to delete room:", err);
    }
  }, []);

  // Navigation handlers
  const handleRedirect = useCallback(
    (room) => {
      navigate(`/playground/${room.id}`, { state: { roomName: room.name } });
    },
    [navigate]
  );

  const handleBackToDashboard = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  // Header actions
  const headerActions = (
    <>
      <Button variant="outlined" onClick={handleBackToDashboard}>
        Back to Dashboard
      </Button>
      <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenModal}>
        Create Room
      </Button>
    </>
  );

  return (
    <PageLayout
      title="Game Rooms"
      subtitle="Manage your Prisoners Dilemma game rooms"
      loading={loading}
      error={error}
      onRetry={refetch}
      headerActions={headerActions}
    >
      <RoomListContainer>
        {rooms.length === 0 ? (
          <EmptyState
            title="No Rooms Yet"
            message="Create your first game room to get started with the Prisoners Dilemma experiment."
            actionLabel="Create Room"
            onAction={handleOpenModal}
          />
        ) : (
          <List>
            {rooms.map((room, index) => (
              <RoomItem key={room.id}>
                <ListItemButton onClick={() => handleRedirect(room)}>
                  <ListItemText
                    primary={room.name || `Room-${index + 1}`}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItemButton>
                <Button
                  onClick={() => handleDeleteRoom(room.id)}
                  variant="text"
                  color="error"
                  size="small"
                  sx={{ mr: 1 }}
                >
                  <DeleteIcon fontSize="small" />
                </Button>
              </RoomItem>
            ))}
          </List>
        )}
      </RoomListContainer>

      {/* Create Room Modal */}
      <Modal open={openModal} onClose={handleCloseModal} aria-labelledby="create-room-modal">
        <ModalContent>
          <ModalTitle>Create New Room</ModalTitle>
          <form onSubmit={handleCreateRoom}>
            <TextField
              autoFocus
              fullWidth
              label="Room Name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter a name for your room"
              sx={{ mb: SPACING.lg }}
            />
            <Box sx={{ display: "flex", gap: SPACING.sm, justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                loading={createLoading}
                disabled={!roomName.trim()}
              >
                Create
              </Button>
            </Box>
          </form>
        </ModalContent>
      </Modal>
    </PageLayout>
  );
}

export default GameRoom;

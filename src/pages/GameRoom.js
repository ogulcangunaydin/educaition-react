import React, { useState, useCallback, useEffect } from "react";
import { List, ListItemButton, ListItemText, Modal, Box, styled } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import validator from "validator";
import { useNavigate } from "react-router-dom";

// Components
import { PageLayout } from "../components/templates";
import { Button, TextField } from "../components/atoms";
import { EmptyState } from "../components/molecules";
import { COLORS, SPACING, SHADOWS } from "../theme";
import roomService from "@services/roomService";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const data = await roomService.getRooms();
        setRooms(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

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
        const sanitizedName = validator.escape(roomName);
        const cleanedName = sanitizedName.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "");

        const data = await roomService.createRoom(cleanedName);
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
      await roomService.deleteRoom(roomId);
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

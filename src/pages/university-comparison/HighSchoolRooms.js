import React, { useEffect, useState } from "react";
import {
  List,
  ListItemButton,
  ListItemText,
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
  Autocomplete,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import highSchoolService from "@services/highSchoolService";
import { CenteredContainer, StyledButton, RoomCreationModalStyle } from "@/styles/CommonStyles";
import Header from "@organisms/Header";
import { useNavigate } from "react-router-dom";
import { searchLise } from "@services/liseService";

function HighSchoolRooms() {
  const [rooms, setRooms] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedHighSchool, setSelectedHighSchool] = useState(null);
  const [highSchools, setHighSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highSchoolsLoading, setHighSchoolsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await highSchoolService.getRooms();
        setRooms(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Debounced server-side search for high schools
  useEffect(() => {
    if (!searchInput || searchInput.length < 2) {
      setHighSchools([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setHighSchoolsLoading(true);
      try {
        const results = await searchLise(searchInput, "2025", 50);
        setHighSchools(results);
      } catch (error) {
        console.error("Error searching high schools:", error);
        setHighSchools([]);
      } finally {
        setHighSchoolsLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchInput]);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedHighSchool(null);
  };

  const handleCreateRoom = async (event) => {
    event.preventDefault();

    if (!selectedHighSchool) {
      alert("Lütfen bir lise seçin");
      return;
    }

    try {
      const data = await highSchoolService.createRoom({
        name: selectedHighSchool.name,
        high_school_code: selectedHighSchool.code || "",
      });
      setRooms([...rooms, data]);
      handleCloseModal();
    } catch (error) {
      console.error("Failed to create room:", error);
      alert("Oda oluşturulamadı: " + error.message);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Bu odayı silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await highSchoolService.deleteRoom(roomId);
      setRooms(rooms.filter((room) => room.id !== roomId));
    } catch (error) {
      console.error("Failed to delete room:", error);
      alert("Oda silinemedi: " + error.message);
    }
  };

  const handleRedirect = (room) => {
    navigate(`/high-school-room/${room.id}`, {
      state: { highSchoolName: room.high_school_name },
    });
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <>
      <Header title="Lise Odaları - Program Öneri Sistemi">
        <Button variant="contained" color="primary" onClick={handleBackToDashboard}>
          Dashboard'a Dön
        </Button>
      </Header>
      <CenteredContainer>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Öğrencilerin program öneri testini yapabilmesi için bir lise odası oluşturun.
            </Typography>
            <List sx={{ width: "100%", maxWidth: 600 }}>
              {rooms && rooms.length > 0 ? (
                rooms.map((room) => (
                  <Box key={room.id} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <ListItemButton
                      component="a"
                      onClick={() => handleRedirect(room)}
                      sx={{
                        backgroundColor: "#f5f5f5",
                        borderRadius: 1,
                        "&:hover": { backgroundColor: "#e0e0e0" },
                      }}
                    >
                      <ListItemText
                        primary={room.high_school_name}
                        secondary={`Oluşturulma: ${room.created_at}`}
                      />
                    </ListItemButton>
                    <Button
                      onClick={() => handleDeleteRoom(room.id)}
                      variant="contained"
                      color="error"
                      size="small"
                      sx={{ ml: 2 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </Button>
                  </Box>
                ))
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center" }}>
                  Henüz oda oluşturulmamış. Yeni bir oda oluşturmak için aşağıdaki butona tıklayın.
                </Typography>
              )}
            </List>
            <Button onClick={handleOpenModal} variant="contained" color="primary" sx={{ mt: 3 }}>
              Yeni Lise Odası Oluştur
            </Button>
          </>
        )}
        <Modal open={openModal} onClose={handleCloseModal} aria-labelledby="create-room-modal">
          <Box
            sx={{
              ...RoomCreationModalStyle,
              width: 500,
            }}
          >
            <Typography id="create-room-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
              Yeni Lise Odası Oluştur
            </Typography>
            <form onSubmit={handleCreateRoom}>
              <Autocomplete
                options={highSchools}
                getOptionLabel={(option) => option.name || ""}
                loading={highSchoolsLoading}
                value={selectedHighSchool}
                onChange={(event, newValue) => setSelectedHighSchool(newValue)}
                onInputChange={(event, newInputValue) => setSearchInput(newInputValue)}
                filterOptions={(x) => x} // Disable client-side filtering (server handles it)
                renderOption={(props, option) => (
                  <li {...props} key={option.code}>
                    <Box>
                      <Typography variant="body1">{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.city}
                      </Typography>
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Lise Ara ve Seç"
                    placeholder="En az 2 karakter yazın..."
                    variant="outlined"
                    fullWidth
                    required
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {highSchoolsLoading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                noOptionsText={
                  searchInput.length < 2 ? "En az 2 karakter yazın" : "Lise bulunamadı"
                }
                loadingText="Aranıyor..."
              />
              <StyledButton
                type="submit"
                variant="contained"
                color="primary"
                disabled={!selectedHighSchool}
              >
                Oluştur
              </StyledButton>
            </form>
          </Box>
        </Modal>
      </CenteredContainer>
    </>
  );
}

export default HighSchoolRooms;

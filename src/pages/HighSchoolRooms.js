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
import fetchWithAuth from "../utils/fetchWithAuth";
import { CenteredContainer, StyledButton, RoomCreationModalStyle } from "../styles/CommonStyles";
import Header from "../components/organisms/Header";
import { useNavigate } from "react-router-dom";
import { fetchLiseMapping } from "../services/liseService";

// Load high school list from API
const loadHighSchools = async () => {
  try {
    const mapping = await fetchLiseMapping("2025");
    const highSchools = Object.entries(mapping)
      .map(([liseId, info]) => ({
        name: info.lise_adi || "",
        city: info.sehir || "",
        code: liseId,
      }))
      .filter((hs) => hs.name);
    return highSchools;
  } catch (error) {
    console.error("Error loading high schools:", error);
    return [];
  }
};

function HighSchoolRooms() {
  const [rooms, setRooms] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedHighSchool, setSelectedHighSchool] = useState(null);
  const [highSchools, setHighSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highSchoolsLoading, setHighSchoolsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetchWithAuth(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/high-school-rooms/`,
          { method: "GET" }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setRooms(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
        setLoading(false);
      }
    };

    const loadHighSchoolList = async () => {
      const list = await loadHighSchools();
      setHighSchools(list);
      setHighSchoolsLoading(false);
    };

    fetchRooms();
    loadHighSchoolList();
  }, []);

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
      const formBody = new FormData();
      formBody.append("high_school_name", selectedHighSchool.name);
      formBody.append("high_school_code", selectedHighSchool.code || "");

      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/high-school-rooms/`, {
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
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/high-school-rooms/${roomId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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
                rooms.map((room, index) => (
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
                filterOptions={(options, { inputValue }) => {
                  const searchTerm = inputValue.toLocaleLowerCase("tr-TR");
                  return options
                    .filter(
                      (option) =>
                        option.name.toLocaleLowerCase("tr-TR").includes(searchTerm) ||
                        option.city.toLocaleLowerCase("tr-TR").includes(searchTerm)
                    )
                    .slice(0, 50); // Limit to 50 results for performance
                }}
                noOptionsText="Lise bulunamadı"
                loadingText="Yükleniyor..."
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

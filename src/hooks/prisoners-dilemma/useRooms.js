import { useState, useCallback, useEffect } from "react";
import api from "@services/api";
import validator from "validator";

export default function useRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.auth.get("/rooms");
      if (response.ok) {
        setRooms(response.data || []);
      } else {
        setError("Failed to fetch rooms");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const createRoom = useCallback(async (name) => {
    setCreating(true);

    try {
      const formBody = new FormData();
      const cleanedName = validator
        .escape(name)
        .replace(/\s+/g, "")
        .replace(/[^a-zA-Z0-9]/g, "");
      formBody.append("name", cleanedName);

      const response = await api.auth.post("/rooms", formBody);

      if (response.ok) {
        setRooms((prev) => [...prev, response.data]);
        return { success: true, room: response.data };
      }
      return { success: false, error: "Failed to create room" };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setCreating(false);
    }
  }, []);

  const deleteRoom = useCallback(async (roomId) => {
    try {
      const response = await api.auth.post(`/rooms/delete/${roomId}`, { _method: "DELETE" });

      if (response.ok) {
        setRooms((prev) => prev.filter((room) => room.id !== roomId));
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }, []);

  return {
    rooms,
    loading,
    error,
    creating,
    createRoom,
    deleteRoom,
    refetch: fetchRooms,
  };
}

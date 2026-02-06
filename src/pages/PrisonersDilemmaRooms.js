/**
 * PrisonersDilemmaRooms Page (Refactored)
 *
 * New version of GameRoom that uses the unified TestRoomList component.
 * This provides consistent UI/UX with other test modules.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@components/templates";
import { TestRoomList } from "@components/organisms";
import { TestType } from "../services/testRoomService";

function PrisonersDilemmaRooms() {
  const navigate = useNavigate();

  const handleRoomClick = (room) => {
    // Navigate to the playground page for this room
    navigate(`/playground/${room.id}`);
  };

  return (
    <PageLayout
      title="Mahkum İkilemi - Oyun Odaları"
      maxWidth="lg"
      showBackButton
      onBack={() => navigate("/dashboard")}
    >
      <TestRoomList
        testType={TestType.PRISONERS_DILEMMA}
        title="Oyun Odaları"
        description="Mahkum ikilemi oyunu için oda oluşturun. Öğrenciler QR kod ile oyuna katılabilir."
        onRoomClick={handleRoomClick}
        emptyStateMessage="Henüz oyun odası oluşturmadınız. Yeni bir oda oluşturarak oyun teorisi simülasyonunu başlatın."
      />
    </PageLayout>
  );
}

export default PrisonersDilemmaRooms;

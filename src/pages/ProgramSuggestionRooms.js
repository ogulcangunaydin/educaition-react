/**
 * ProgramSuggestionRooms Page (Refactored)
 *
 * New version of HighSchoolRooms that uses the unified TestRoomList component.
 * This provides consistent UI/UX with other test modules.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@components/templates";
import { TestRoomList } from "@components/organisms";
import { TestType } from "../services/testRoomService";

function ProgramSuggestionRooms() {
  const navigate = useNavigate();

  const handleRoomClick = (room) => {
    // Navigate to the room detail page
    // The settings contain the high_school_code
    navigate(`/high-school-room/${room.id}`, {
      state: { highSchoolName: room.name },
    });
  };

  return (
    <PageLayout
      title="Program Öneri Sistemi - Lise Odaları"
      maxWidth="lg"
      showBackButton
      onBack={() => navigate("/dashboard")}
    >
      <TestRoomList
        testType={TestType.PROGRAM_SUGGESTION}
        title="Lise Odaları"
        description="Öğrencilerin program öneri testini yapabilmesi için bir lise odası oluşturun. QR kod ile öğrenciler teste katılabilir."
        onRoomClick={handleRoomClick}
        emptyStateMessage="Henüz lise odası oluşturmadınız. Yeni bir oda oluşturarak öğrencilerinizin program önerisi almasını sağlayın."
      />
    </PageLayout>
  );
}

export default ProgramSuggestionRooms;

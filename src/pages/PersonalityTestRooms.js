/**
 * PersonalityTestRooms Page
 *
 * Page for teachers/admins to manage personality test rooms.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@components/templates";
import { TestRoomList } from "@components/organisms";
import { TestType } from "../services/testRoomService";

function PersonalityTestRooms() {
  const navigate = useNavigate();

  const handleRoomClick = (room) => {
    navigate(`/personality-test-room/${room.id}`);
  };

  return (
    <PageLayout
      title="Kişilik Testi Odaları"
      maxWidth="lg"
      showBackButton
      onBack={() => navigate("/dashboard")}
    >
      <TestRoomList
        testType={TestType.PERSONALITY_TEST}
        title="Kişilik Testi Odaları"
        description="Big Five kişilik testi odalarınızı yönetin. Öğrenciler QR kod ile teste katılabilir."
        onRoomClick={handleRoomClick}
        emptyStateMessage="Henüz kişilik testi odası oluşturmadınız. Yeni bir oda oluşturarak öğrencilerinizin kişilik testini çözmesini sağlayın."
      />
    </PageLayout>
  );
}

export default PersonalityTestRooms;

/**
 * TestRoomsPage - Generic test rooms page template
 *
 * A reusable page template for all test types' room management.
 * Derives all text/config from TEST_TYPE_CONFIG based on the testType prop.
 *
 * Usage:
 *   <TestRoomsPage testType={TestType.PERSONALITY_TEST} />
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@components/templates";
import { TestRoomList } from "@components/organisms";
import { TEST_TYPE_CONFIG } from "../../services/testRoomService";

function TestRoomsPage({ testType }) {
  const navigate = useNavigate();
  const config = TEST_TYPE_CONFIG[testType];

  if (!config || !config.rooms) {
    return null;
  }

  const { rooms } = config;

  const handleRoomClick = (room) => {
    const path = rooms.getDetailPath(room);
    const state = rooms.getNavigateState?.(room);
    navigate(path, state ? { state } : undefined);
  };

  return (
    <PageLayout
      title={rooms.pageTitle}
      maxWidth="lg"
      showBackButton
      onBack={() => navigate("/dashboard")}
    >
      <TestRoomList
        testType={testType}
        title={rooms.listTitle}
        description={rooms.description}
        onRoomClick={handleRoomClick}
        emptyStateMessage={rooms.emptyStateMessage}
      />
    </PageLayout>
  );
}

export default TestRoomsPage;

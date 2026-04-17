import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { eventBus } from "../events/eventBus";

// Automatic cleanup after each test
afterEach(() => {
  cleanup();
  eventBus.clear();
});

import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "../Toaster";
import { eventBus } from "../../events/eventBus";

describe("Toaster", () => {
  it("renders nothing when there are no toasts", () => {
    const { container } = render(<Toaster />);
    expect(container.innerHTML).toBe("");
  });

  it("displays a toast on notify:info event", () => {
    render(<Toaster />);
    act(() => { eventBus.emit("notify:info", { message: "Hello info" }); });
    expect(screen.getByText("Hello info")).toBeInTheDocument();
  });

  it("displays a toast on notify:error event", () => {
    render(<Toaster />);
    act(() => { eventBus.emit("notify:error", { message: "Something failed" }); });
    expect(screen.getByText("Something failed")).toBeInTheDocument();
  });

  it("displays a toast on notify:success event", () => {
    render(<Toaster />);
    act(() => { eventBus.emit("notify:success", { message: "All good" }); });
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("applies correct CSS class per toast kind", () => {
    render(<Toaster />);
    act(() => { eventBus.emit("notify:error", { message: "Error toast" }); });
    const toast = screen.getByText("Error toast").closest(".toast");
    expect(toast).toHaveClass("toast--error");
  });

  it("can dismiss a toast manually", async () => {
    const user = userEvent.setup();
    render(<Toaster />);
    act(() => { eventBus.emit("notify:info", { message: "Dismissable" }); });
    expect(screen.getByText("Dismissable")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    // Toast gets exiting class immediately, removed after 300ms
    const toast = screen.getByText("Dismissable").closest(".toast");
    expect(toast).toHaveClass("toast--exit");
  });

  it("shows multiple toasts", () => {
    render(<Toaster />);
    act(() => {
      eventBus.emit("notify:info", { message: "First" });
      eventBus.emit("notify:success", { message: "Second" });
      eventBus.emit("notify:error", { message: "Third" });
    });
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(screen.getByText("Third")).toBeInTheDocument();
  });

  it("has correct aria attributes for accessibility", () => {
    render(<Toaster />);
    act(() => { eventBus.emit("notify:info", { message: "Accessible" }); });
    const container = screen.getByRole("status");
    expect(container).toHaveAttribute("aria-live", "polite");
  });
});

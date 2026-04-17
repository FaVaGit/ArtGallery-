import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "../ConfirmDialog";
import { defaultConfirmLabels } from "../../test/factories";

const { title, message, confirmLabel, cancelLabel } = defaultConfirmLabels;

function renderDialog(overrides: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const result = render(
    <ConfirmDialog
      open
      title={title}
      message={message}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...overrides}
    />,
  );
  return { ...result, onConfirm, onCancel };
}

describe("ConfirmDialog", () => {
  it("renders nothing when closed", () => {
    const { container } = renderDialog({ open: false });
    expect(container.innerHTML).toBe("");
  });

  it("renders title and message when open", () => {
    renderDialog();
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();
    await user.click(screen.getByRole("button", { name: confirmLabel }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderDialog();
    await user.click(screen.getByRole("button", { name: cancelLabel }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("calls onCancel on overlay click", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderDialog();
    await user.click(screen.getByRole("dialog"));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("does not dismiss when clicking inside the dialog", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderDialog();
    await user.click(screen.getByText(title));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("calls onCancel on Escape key", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderDialog();
    await user.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("applies danger class to confirm button when danger prop set", () => {
    renderDialog({ danger: true });
    const btn = screen.getByRole("button", { name: confirmLabel });
    expect(btn).toHaveClass("danger");
  });

  it("does not apply danger class by default", () => {
    renderDialog();
    const btn = screen.getByRole("button", { name: confirmLabel });
    expect(btn).not.toHaveClass("danger");
  });

  it("has correct aria attributes", () => {
    renderDialog();
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", title);
  });
});

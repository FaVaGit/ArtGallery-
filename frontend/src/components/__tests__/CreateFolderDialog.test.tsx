import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateFolderDialog } from "../CreateFolderDialog";
import { defaultCreateFolderLabels } from "../../test/factories";

const labels = defaultCreateFolderLabels;

function renderDialog(overrides: Partial<Parameters<typeof CreateFolderDialog>[0]> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const result = render(
    <CreateFolderDialog
      open
      loading={false}
      labels={labels}
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...overrides}
    />,
  );
  return { ...result, onConfirm, onCancel };
}

describe("CreateFolderDialog", () => {
  it("renders nothing when closed", () => {
    const { container } = renderDialog({ open: false });
    expect(container.innerHTML).toBe("");
  });

  it("renders title and input when open", () => {
    renderDialog();
    expect(screen.getByText(labels.title)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(labels.namePlaceholder)).toBeInTheDocument();
  });

  it("disables create button when name is empty", () => {
    renderDialog();
    const createBtn = screen.getByRole("button", { name: labels.create });
    expect(createBtn).toBeDisabled();
  });

  it("enables create button when name is provided", async () => {
    const user = userEvent.setup();
    renderDialog();
    const input = screen.getByPlaceholderText(labels.namePlaceholder);
    await user.type(input, "My Folder");
    const createBtn = screen.getByRole("button", { name: labels.create });
    expect(createBtn).toBeEnabled();
  });

  it("calls onConfirm with trimmed name on button click", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();
    await user.type(screen.getByPlaceholderText(labels.namePlaceholder), "  Nice Folder  ");
    await user.click(screen.getByRole("button", { name: labels.create }));
    expect(onConfirm).toHaveBeenCalledWith("Nice Folder");
  });

  it("calls onConfirm on Enter key", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();
    const input = screen.getByPlaceholderText(labels.namePlaceholder);
    await user.type(input, "Folder via Enter");
    await user.keyboard("{Enter}");
    expect(onConfirm).toHaveBeenCalledWith("Folder via Enter");
  });

  it("calls onCancel on Cancel button click", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderDialog();
    await user.click(screen.getByRole("button", { name: labels.cancel }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("calls onCancel on overlay click", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderDialog();
    const overlay = screen.getByRole("dialog");
    await user.click(overlay);
    expect(onCancel).toHaveBeenCalled();
  });

  it("does not call onCancel when clicking inside dialog", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderDialog();
    await user.click(screen.getByText(labels.title));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("disables inputs and buttons when loading", () => {
    renderDialog({ loading: true });
    expect(screen.getByPlaceholderText(labels.namePlaceholder)).toBeDisabled();
    expect(screen.getByRole("button", { name: labels.cancel })).toBeDisabled();
  });

  it("does not accept whitespace-only name", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(screen.getByPlaceholderText(labels.namePlaceholder), "   ");
    expect(screen.getByRole("button", { name: labels.create })).toBeDisabled();
  });

  it("resets name when cancel is clicked", async () => {
    const user = userEvent.setup();
    renderDialog();
    const input = screen.getByPlaceholderText(labels.namePlaceholder);
    await user.type(input, "Some name");
    await user.click(screen.getByRole("button", { name: labels.cancel }));
    expect(input).toHaveValue("");
  });

  it("resets name after confirm", async () => {
    const user = userEvent.setup();
    renderDialog();
    const input = screen.getByPlaceholderText(labels.namePlaceholder);
    await user.type(input, "My Folder");
    await user.click(screen.getByRole("button", { name: labels.create }));
    expect(input).toHaveValue("");
  });

  it("has aria-modal and role attributes", () => {
    renderDialog();
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", labels.title);
  });
});

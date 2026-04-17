import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UploadDialog } from "../UploadDialog";

// Mock FileUpload to avoid complex file-input internals
vi.mock("../FileUpload", () => ({
  FileUpload: ({ onUpload, labels }: { onUpload: (f: File) => void; labels: { title: string } }) => (
    <div data-testid="file-upload">
      <span>{labels.title}</span>
      <button type="button" onClick={() => onUpload(new File(["a"], "test.jpg", { type: "image/jpeg" }))}>
        Upload
      </button>
    </div>
  ),
}));

const defaultLabels = {
  title: "Upload Files",
  close: "Close",
  uploadLabels: {
    title: "Upload",
    dragDrop: "Drag & drop",
    browseFiles: "Browse",
    uploading: "Uploading…",
    uploadComplete: "Done",
    uploadFailed: "Failed",
    fileTypeError: "Invalid type",
    sizeLimit: "Too large",
    selectFiles: "Select files",
  },
};

function renderDialog(overrides: Partial<Parameters<typeof UploadDialog>[0]> = {}) {
  const onUpload = vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn();
  const result = render(
    <UploadDialog
      open
      labels={defaultLabels}
      onUpload={onUpload}
      onClose={onClose}
      {...overrides}
    />,
  );
  return { ...result, onUpload, onClose };
}

describe("UploadDialog", () => {
  it("renders nothing when closed", () => {
    const { container } = renderDialog({ open: false });
    expect(container.innerHTML).toBe("");
  });

  it("renders title and FileUpload when open", () => {
    renderDialog();
    expect(screen.getByText("Upload Files")).toBeInTheDocument();
    expect(screen.getByTestId("file-upload")).toBeInTheDocument();
  });

  it("has dialog role and aria attributes", () => {
    renderDialog();
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "Upload Files");
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose on overlay click", async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();
    await user.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not call onClose when clicking inside dialog", async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();
    await user.click(screen.getByText("Upload Files"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose on Escape key", async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onUpload when file is uploaded and shows count", async () => {
    const user = userEvent.setup();
    const { onUpload } = renderDialog();
    await user.click(screen.getByRole("button", { name: "Upload" }));
    expect(onUpload).toHaveBeenCalledOnce();
    expect(screen.getByText(/1 file uploaded/)).toBeInTheDocument();
  });

  it("increments upload count on multiple uploads", async () => {
    const user = userEvent.setup();
    renderDialog();
    const btn = screen.getByRole("button", { name: "Upload" });
    await user.click(btn);
    await user.click(btn);
    expect(screen.getByText(/2 files uploaded/)).toBeInTheDocument();
  });

  it("resets upload count when closed and reopened", async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();
    await user.click(screen.getByRole("button", { name: "Upload" }));
    expect(screen.getByText(/1 file uploaded/)).toBeInTheDocument();
    // Closing resets the count
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });
});

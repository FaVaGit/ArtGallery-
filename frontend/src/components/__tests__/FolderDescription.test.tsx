import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { FolderDescription } from "../FolderDescription";

vi.mock("../../api/driveApi", () => ({
  getFolderReadme: vi.fn(),
}));

import { getFolderReadme } from "../../api/driveApi";
const mockGetFolderReadme = vi.mocked(getFolderReadme);

describe("FolderDescription", () => {
  it("renders nothing while loading", () => {
    mockGetFolderReadme.mockReturnValue(new Promise(() => {})); // never resolves
    const { container } = render(<FolderDescription folderId="folder-1" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when content is null", async () => {
    mockGetFolderReadme.mockResolvedValue(null);
    const { container } = render(<FolderDescription folderId="folder-1" />);
    await waitFor(() => expect(mockGetFolderReadme).toHaveBeenCalled());
    expect(container.innerHTML).toBe("");
  });

  it("renders paragraphs from content", async () => {
    mockGetFolderReadme.mockResolvedValue("First paragraph\n\nSecond paragraph");
    render(<FolderDescription folderId="folder-1" />);
    await waitFor(() => {
      expect(screen.getByText("First paragraph")).toBeInTheDocument();
      expect(screen.getByText("Second paragraph")).toBeInTheDocument();
    });
  });

  it("has region role and aria label", async () => {
    mockGetFolderReadme.mockResolvedValue("Some content");
    render(<FolderDescription folderId="folder-1" />);
    await waitFor(() => {
      const region = screen.getByRole("region", { name: "Folder description" });
      expect(region).toBeInTheDocument();
    });
  });

  it("refetches when folderId changes", async () => {
    mockGetFolderReadme.mockResolvedValue("Content A");
    const { rerender } = render(<FolderDescription folderId="folder-1" />);
    await waitFor(() => expect(screen.getByText("Content A")).toBeInTheDocument());

    mockGetFolderReadme.mockClear();
    mockGetFolderReadme.mockResolvedValue("Content B");
    rerender(<FolderDescription folderId="folder-2" />);
    await waitFor(() => expect(screen.getByText("Content B")).toBeInTheDocument());
    expect(mockGetFolderReadme).toHaveBeenCalledWith("folder-2");
  });

  it("renders nothing on API error", async () => {
    mockGetFolderReadme.mockRejectedValue(new Error("Network error"));
    const { container } = render(<FolderDescription folderId="folder-1" />);
    await waitFor(() => expect(mockGetFolderReadme).toHaveBeenCalled());
    expect(container.innerHTML).toBe("");
  });
});

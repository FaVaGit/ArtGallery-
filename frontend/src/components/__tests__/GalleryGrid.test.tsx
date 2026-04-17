import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GalleryGrid } from "../GalleryGrid";
import { makeDriveItem, makeFolder, defaultLabels } from "../../test/factories";

// Mock getApiBaseUrl
vi.mock("../../api/client", () => ({
  getApiBaseUrl: () => "http://localhost:4000/api",
}));

function renderGrid(overrides: Partial<Parameters<typeof GalleryGrid>[0]> = {}) {
  const onOpenFolder = vi.fn();
  const onViewFile = vi.fn();
  const result = render(
    <GalleryGrid
      items={[]}
      labels={defaultLabels}
      onOpenFolder={onOpenFolder}
      onViewFile={onViewFile}
      {...overrides}
    />,
  );
  return { ...result, onOpenFolder, onViewFile };
}

describe("GalleryGrid", () => {
  it("renders empty state when no items", () => {
    renderGrid();
    expect(screen.getByText(defaultLabels.noContent)).toBeInTheDocument();
  });

  it("renders file items", () => {
    const items = [makeDriveItem({ id: "f1", name: "Sunset.jpg" })];
    renderGrid({ items });
    expect(screen.getByText("Sunset.jpg")).toBeInTheDocument();
  });

  it("renders folder items", () => {
    const items = [makeFolder({ id: "d1", name: "Landscapes" })];
    renderGrid({ items });
    expect(screen.getByText("Landscapes")).toBeInTheDocument();
    expect(screen.getByText(/Folder/)).toBeInTheDocument();
  });

  it("calls onOpenFolder when clicking a folder card", async () => {
    const user = userEvent.setup();
    const folder = makeFolder({ id: "d1", name: "Portraits" });
    const { onOpenFolder } = renderGrid({ items: [folder] });
    await user.click(screen.getByRole("button", { name: /Portraits/ }));
    expect(onOpenFolder).toHaveBeenCalledWith(folder);
  });

  it("calls onViewFile when clicking a file card", async () => {
    const user = userEvent.setup();
    const file = makeDriveItem({ id: "f1", name: "Photo.jpg" });
    const { onViewFile } = renderGrid({ items: [file] });
    await user.click(screen.getByRole("button", { name: /Photo/ }));
    expect(onViewFile).toHaveBeenCalledWith(file);
  });

  it("navigates folder on Enter key", async () => {
    const user = userEvent.setup();
    const folder = makeFolder({ id: "d1", name: "Works" });
    const { onOpenFolder } = renderGrid({ items: [folder] });
    const card = screen.getByRole("button", { name: /Works/ });
    card.focus();
    await user.keyboard("{Enter}");
    expect(onOpenFolder).toHaveBeenCalledWith(folder);
  });

  it("formats dates correctly", () => {
    const items = [makeDriveItem({ id: "f1", name: "Test", modifiedTime: "2025-06-15T10:00:00Z" })];
    renderGrid({ items });
    // Should display a formatted date (locale-dependent, just check it's not "-")
    const dateCell = screen.getByText(/Updated/).closest("p");
    expect(dateCell?.textContent).not.toContain("-");
  });

  it("displays dash for null dates", () => {
    const items = [makeDriveItem({ id: "f1", name: "Test", modifiedTime: null })];
    renderGrid({ items });
    expect(screen.getByText(/Updated: -/)).toBeInTheDocument();
  });

  it("applies selected class when item is selected", () => {
    const file = makeDriveItem({ id: "f1", name: "Selected" });
    renderGrid({ items: [file], selectedId: "f1" });
    const card = screen.getByRole("button", { name: /Selected/ });
    expect(card).toHaveClass("selected");
  });

  it("renders multiple items", () => {
    const items = [
      makeDriveItem({ id: "f1", name: "Item One" }),
      makeDriveItem({ id: "f2", name: "Item Two" }),
      makeFolder({ id: "d1", name: "Folder Three" }),
    ];
    renderGrid({ items });
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });
});

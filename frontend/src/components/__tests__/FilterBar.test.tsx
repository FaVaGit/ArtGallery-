import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterBar, type FilterState } from "../FilterBar";
import { defaultFilterLabels } from "../../test/factories";

const labels = defaultFilterLabels;
const defaultFilters: FilterState = { type: "all", sortBy: "name", sortOrder: "asc" };

function renderFilterBar(overrides: Partial<{ filters: FilterState; onChange: (f: FilterState) => void }> = {}) {
  const onChange = vi.fn();
  const result = render(
    <FilterBar
      filters={overrides.filters ?? defaultFilters}
      onChange={overrides.onChange ?? onChange}
      labels={labels}
    />,
  );
  return { ...result, onChange };
}

describe("FilterBar", () => {
  it("renders all type chips", () => {
    renderFilterBar();
    expect(screen.getByRole("radio", { name: labels.typeAll })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: labels.typeFolders })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: labels.typeImages })).toBeInTheDocument();
  });

  it("marks the active chip as checked", () => {
    renderFilterBar({ filters: { ...defaultFilters, type: "folders" } });
    expect(screen.getByRole("radio", { name: labels.typeFolders })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: labels.typeAll })).toHaveAttribute("aria-checked", "false");
  });

  it("calls onChange with updated type when chip is clicked", async () => {
    const user = userEvent.setup();
    const { onChange } = renderFilterBar();
    await user.click(screen.getByRole("radio", { name: labels.typeImages }));
    expect(onChange).toHaveBeenCalledWith({ ...defaultFilters, type: "images" });
  });

  it("renders sort select with correct default", () => {
    renderFilterBar();
    const select = screen.getByRole("combobox", { name: labels.sortBy });
    expect(select).toHaveValue("name-asc");
  });

  it("calls onChange with updated sort when select changes", async () => {
    const user = userEvent.setup();
    const { onChange } = renderFilterBar();
    const select = screen.getByRole("combobox", { name: labels.sortBy });
    await user.selectOptions(select, "date-desc");
    expect(onChange).toHaveBeenCalledWith({ ...defaultFilters, sortBy: "date", sortOrder: "desc" });
  });

  it("has proper toolbar role", () => {
    renderFilterBar();
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
  });
});

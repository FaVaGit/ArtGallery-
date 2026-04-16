import type { AppMessages } from "../i18n/messages";

export interface FilterState {
  type: "all" | "folders" | "images";
  sortBy: "name" | "date";
  sortOrder: "asc" | "desc";
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  labels: AppMessages["filter"];
}

export function FilterBar({ filters, onChange, labels }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <select
        value={filters.type}
        onChange={(e) => onChange({ ...filters, type: e.target.value as FilterState["type"] })}
        aria-label={labels.filterType}
      >
        <option value="all">{labels.typeAll}</option>
        <option value="folders">{labels.typeFolders}</option>
        <option value="images">{labels.typeImages}</option>
      </select>

      <select
        value={`${filters.sortBy}-${filters.sortOrder}`}
        onChange={(e) => {
          const [sortBy, sortOrder] = e.target.value.split("-") as [FilterState["sortBy"], FilterState["sortOrder"]];
          onChange({ ...filters, sortBy, sortOrder });
        }}
        aria-label={labels.sortBy}
      >
        <option value="name-asc">{labels.sortNameAsc}</option>
        <option value="name-desc">{labels.sortNameDesc}</option>
        <option value="date-desc">{labels.sortNewest}</option>
        <option value="date-asc">{labels.sortOldest}</option>
      </select>
    </div>
  );
}

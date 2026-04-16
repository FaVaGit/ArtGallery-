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

const typeOptions: { value: FilterState["type"]; labelKey: "typeAll" | "typeFolders" | "typeImages" }[] = [
  { value: "all", labelKey: "typeAll" },
  { value: "folders", labelKey: "typeFolders" },
  { value: "images", labelKey: "typeImages" },
];

export function FilterBar({ filters, onChange, labels }: FilterBarProps) {
  return (
    <div className="filter-bar" role="toolbar" aria-label={labels.filterType}>
      <div className="filter-chips" role="radiogroup" aria-label={labels.filterType}>
        {typeOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`filter-chip ${filters.type === opt.value ? "filter-chip--active" : ""}`}
            role="radio"
            aria-checked={filters.type === opt.value}
            onClick={() => onChange({ ...filters, type: opt.value })}
          >
            {labels[opt.labelKey]}
          </button>
        ))}
      </div>

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

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocationMap } from "../LocationMap";

describe("LocationMap", () => {
  const lat = 44.4056;
  const lng = 8.9463;

  it("renders an iframe with correct src", () => {
    render(<LocationMap latitude={lat} longitude={lng} />);
    const iframe = screen.getByTitle("Location map");
    const bbox = `${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}`;
    expect(iframe).toHaveAttribute("src", expect.stringContaining(bbox));
    expect(iframe).toHaveAttribute("src", expect.stringContaining(`marker=${lat},${lng}`));
  });

  it("renders a Google Maps external link", () => {
    render(<LocationMap latitude={lat} longitude={lng} />);
    const link = screen.getByText(/Open in Google Maps/);
    expect(link).toHaveAttribute("href", `https://www.google.com/maps?q=${lat},${lng}`);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("shows title when provided", () => {
    render(<LocationMap latitude={lat} longitude={lng} title="Sunset Beach" />);
    expect(screen.getByText("Sunset Beach")).toBeInTheDocument();
  });

  it("does not render title when omitted", () => {
    const { container } = render(<LocationMap latitude={lat} longitude={lng} />);
    expect(container.querySelector(".location-map-title")).not.toBeInTheDocument();
  });

  it("iframe has lazy loading", () => {
    render(<LocationMap latitude={lat} longitude={lng} />);
    expect(screen.getByTitle("Location map")).toHaveAttribute("loading", "lazy");
  });
});

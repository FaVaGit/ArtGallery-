import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocationBadge } from "../LocationBadge";

describe("LocationBadge", () => {
  const lat = 44.4056;
  const lng = 8.9463;

  it("renders a link to Google Maps", () => {
    render(<LocationBadge latitude={lat} longitude={lng} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", `https://www.google.com/maps?q=${lat},${lng}`);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("shows coordinates in title", () => {
    render(<LocationBadge latitude={lat} longitude={lng} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("title", `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  });

  it("renders 'Map' text in full mode", () => {
    render(<LocationBadge latitude={lat} longitude={lng} />);
    expect(screen.getByText("Map")).toBeInTheDocument();
  });

  it("hides 'Map' text in compact mode", () => {
    render(<LocationBadge latitude={lat} longitude={lng} compact />);
    expect(screen.queryByText("Map")).not.toBeInTheDocument();
  });

  it("renders an SVG pin icon", () => {
    const { container } = render(<LocationBadge latitude={lat} longitude={lng} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});

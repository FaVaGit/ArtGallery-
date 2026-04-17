import { describe, it, expect } from "vitest";
import { eventBus } from "../../events/eventBus";

describe("EventBus", () => {
  it("delivers events to subscribers", () => {
    const handler = vi.fn();
    eventBus.on("notify:info", handler);
    eventBus.emit("notify:info", { message: "test" });
    expect(handler).toHaveBeenCalledWith({ message: "test" });
  });

  it("supports multiple subscribers for the same event", () => {
    const h1 = vi.fn();
    const h2 = vi.fn();
    eventBus.on("notify:info", h1);
    eventBus.on("notify:info", h2);
    eventBus.emit("notify:info", { message: "multi" });
    expect(h1).toHaveBeenCalledOnce();
    expect(h2).toHaveBeenCalledOnce();
  });

  it("returns an unsubscribe function", () => {
    const handler = vi.fn();
    const off = eventBus.on("notify:info", handler);
    off();
    eventBus.emit("notify:info", { message: "should not arrive" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("does not throw when emitting with no subscribers", () => {
    expect(() => eventBus.emit("notify:info", { message: "noop" })).not.toThrow();
  });

  it("clear() removes all listeners", () => {
    const handler = vi.fn();
    eventBus.on("notify:error", handler);
    eventBus.clear();
    eventBus.emit("notify:error", { message: "cleared" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("isolates different event types", () => {
    const infoHandler = vi.fn();
    const errorHandler = vi.fn();
    eventBus.on("notify:info", infoHandler);
    eventBus.on("notify:error", errorHandler);
    eventBus.emit("notify:info", { message: "only info" });
    expect(infoHandler).toHaveBeenCalledOnce();
    expect(errorHandler).not.toHaveBeenCalled();
  });

  it("does not crash if handler throws", () => {
    const badHandler = vi.fn(() => { throw new Error("boom"); });
    const goodHandler = vi.fn();
    eventBus.on("notify:info", badHandler);
    eventBus.on("notify:info", goodHandler);
    expect(() => eventBus.emit("notify:info", { message: "test" })).not.toThrow();
    expect(goodHandler).toHaveBeenCalledOnce();
  });
});

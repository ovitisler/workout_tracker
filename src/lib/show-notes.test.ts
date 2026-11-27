import { afterEach, describe, expect, it, vi } from "vitest";

import { resolveShowNotes } from "./show-notes";

describe("resolveShowNotes", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the box when nothing is saved", async () => {
    expect(await resolveShowNotes(async () => undefined)).toBe(true);
  });

  it.each([true, false])("uses a saved value of %s", async (saved) => {
    expect(await resolveShowNotes(async () => saved)).toBe(saved);
  });

  it("shows the box and logs the error when the read fails", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("relation does not exist");

    expect(await resolveShowNotes(() => Promise.reject(error))).toBe(true);
    expect(log).toHaveBeenCalledWith(expect.any(String), error);
  });

  it("also shows the box when the read throws before returning a promise", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const read = () => {
      throw new Error("DATABASE_URL is not set");
    };

    expect(await resolveShowNotes(read)).toBe(true);
  });
});

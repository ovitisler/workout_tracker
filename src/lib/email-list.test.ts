import { describe, expect, it } from "vitest";

import { isValidEmail, parseEmailList } from "./email-list";

describe("parseEmailList", () => {
  it("splits, trims and lowercases", () => {
    expect(parseEmailList(" A@x.com, b@Y.com ,,")).toEqual(["a@x.com", "b@y.com"]);
  });

  it("is empty when unset", () => {
    expect(parseEmailList(undefined)).toEqual([]);
    expect(parseEmailList("")).toEqual([]);
  });
});

describe("isValidEmail", () => {
  it("accepts ordinary addresses", () => {
    expect(isValidEmail("ovi.tisler@gmail.com")).toBe(true);
    expect(isValidEmail("a+tag@sub.example.co.uk")).toBe(true);
  });

  it("rejects obvious junk", () => {
    for (const email of ["", "nope", "a@b", "a @b.com", "@b.com", `${"a".repeat(250)}@b.com`]) {
      expect(isValidEmail(email)).toBe(false);
    }
  });
});

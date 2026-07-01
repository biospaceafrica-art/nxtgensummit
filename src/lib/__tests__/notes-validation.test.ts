import { describe, it, expect } from "vitest";
import { validateNotes, NOTES_MAX } from "@/lib/notes-validation";

describe("validateNotes", () => {
  it("treats an untouched empty draft as clean, valid, and save-disabled", () => {
    const s = validateNotes(undefined, null);
    expect(s.errorMessage).toBe("");
    expect(s.ariaInvalid).toBe(false);
    expect(s.dirty).toBe(false);
    expect(s.saveDisabled).toBe(true);
    expect(s.length).toBe(0);
  });

  it("enables save only when the draft differs from the saved value", () => {
    const same = validateNotes("hello", "hello");
    expect(same.dirty).toBe(false);
    expect(same.saveDisabled).toBe(true);

    const changed = validateNotes("hello world", "hello");
    expect(changed.dirty).toBe(true);
    expect(changed.saveDisabled).toBe(false);
    expect(changed.errorMessage).toBe("");
    expect(changed.ariaInvalid).toBe(false);
  });

  it("accepts exactly NOTES_MAX characters as valid", () => {
    const s = validateNotes("a".repeat(NOTES_MAX), "");
    expect(s.length).toBe(NOTES_MAX);
    expect(s.ariaInvalid).toBe(false);
    expect(s.errorMessage).toBe("");
    expect(s.saveDisabled).toBe(false); // dirty and valid
  });

  it("rejects NOTES_MAX + 1 characters with a clear error and disables save", () => {
    const s = validateNotes("a".repeat(NOTES_MAX + 1), "");
    expect(s.length).toBe(NOTES_MAX + 1);
    expect(s.ariaInvalid).toBe(true);
    expect(s.errorMessage).toContain(`${NOTES_MAX + 1}/${NOTES_MAX}`);
    expect(s.errorMessage).toMatch(/exceed/i);
    expect(s.saveDisabled).toBe(true);
  });

  it("keeps save disabled even for a dirty over-limit draft (consistency)", () => {
    const s = validateNotes("a".repeat(NOTES_MAX + 500), "prev");
    expect(s.dirty).toBe(true);
    expect(s.ariaInvalid).toBe(true);
    expect(s.saveDisabled).toBe(true);
  });

  it("clearing text (draft='') vs untouched (draft=undefined) behave correctly", () => {
    const cleared = validateNotes("", "old notes");
    expect(cleared.dirty).toBe(true);
    expect(cleared.saveDisabled).toBe(false); // valid + dirty → can save empty

    const untouched = validateNotes(undefined, "old notes");
    expect(untouched.dirty).toBe(false);
    expect(untouched.saveDisabled).toBe(true);
    expect(untouched.length).toBe("old notes".length);
  });

  it("emits a consistent triple: error message ↔ aria-invalid ↔ save disabled", () => {
    // Sweep boundary values and assert the three signals stay in lockstep.
    for (const len of [0, 1, NOTES_MAX - 1, NOTES_MAX, NOTES_MAX + 1, NOTES_MAX * 2]) {
      const s = validateNotes("a".repeat(len), "");
      const overLimit = len > NOTES_MAX;
      expect(s.ariaInvalid).toBe(overLimit);
      expect(!!s.errorMessage).toBe(overLimit);
      if (overLimit) expect(s.saveDisabled).toBe(true);
    }
  });
});

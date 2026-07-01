// Pure helper mirroring the notes-editing rules used in
// src/pages/SelectionDashboard.tsx. Kept in its own module so the
// exact same logic can be unit-tested without rendering the dashboard.

export const NOTES_MAX = 1000;

export interface NotesState {
  /** Inline error message to render inside role="alert" (empty when valid). */
  errorMessage: string;
  /** Whether the input should carry aria-invalid="true". */
  ariaInvalid: boolean;
  /** Whether the Save button must be disabled. */
  saveDisabled: boolean;
  /** Whether the draft differs from the saved value (dirty state). */
  dirty: boolean;
  /** Live character count for the counter UI. */
  length: number;
}

export function validateNotes(
  draft: string | undefined,
  saved: string | null | undefined,
): NotesState {
  const savedValue = saved ?? "";
  const current = draft ?? savedValue;
  const length = current.length;
  const tooLong = length > NOTES_MAX;
  const dirty = draft !== undefined && draft !== savedValue;

  return {
    errorMessage: tooLong
      ? `Notes exceed the ${NOTES_MAX}-character limit (${length}/${NOTES_MAX}).`
      : "",
    ariaInvalid: tooLong,
    // Save is disabled when the value is too long OR when there is nothing to save.
    saveDisabled: tooLong || !dirty,
    dirty,
    length,
  };
}

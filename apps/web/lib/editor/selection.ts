export type SelectionPayload = {
  from: number;
  to: number;
  text: string;
};

export function hasSelectedText(selection: SelectionPayload | null) {
  return Boolean(selection && selection.text.trim().length > 0);
}

export function textToString(text: String, length: number = 24) {
  if (length < 2) return text;
  if (text.length > length) {
    return text.slice(0, length/2) + "…" +
           text.slice(-length/2+1);
  }
  return text;
}

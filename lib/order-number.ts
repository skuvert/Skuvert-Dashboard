const ORDER_NUMBER_REGEX = /SKV-\d{4}-\d+/;

export function extractOrderNumber(text: string): string {
  return text.match(ORDER_NUMBER_REGEX)?.[0] ?? "";
}

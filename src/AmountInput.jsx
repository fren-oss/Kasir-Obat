import { formatGroupedAmountInput } from "./lib";

export default function AmountInput({
  value,
  onChange,
  inputMode = "decimal",
  ...props
}) {
  const handleChange = (event) => {
    const input = event.currentTarget;
    const raw = input.value;
    const cursor = input.selectionStart ?? raw.length;
    const beforeCursor = raw.slice(0, cursor);
    const digitsBeforeCursor = beforeCursor.replace(/\D/g, "").length;
    const commaIndex = beforeCursor.lastIndexOf(",");
    const fractionDigitsBeforeCursor =
      commaIndex < 0
        ? null
        : beforeCursor.slice(commaIndex + 1).replace(/\D/g, "").length;
    const formatted = formatGroupedAmountInput(raw);

    onChange(formatted);

    requestAnimationFrame(() => {
      if (document.activeElement !== input) return;
      if (fractionDigitsBeforeCursor !== null && formatted.includes(",")) {
        const nextCursor =
          formatted.indexOf(",") + 1 + fractionDigitsBeforeCursor;
        input.setSelectionRange(nextCursor, nextCursor);
        return;
      }

      let nextCursor = 0;
      let digitCount = 0;
      while (nextCursor < formatted.length && digitCount < digitsBeforeCursor) {
        if (/\d/.test(formatted[nextCursor])) digitCount += 1;
        nextCursor += 1;
      }
      input.setSelectionRange(nextCursor, nextCursor);
    });
  };

  return (
    <input
      {...props}
      type="text"
      inputMode={inputMode}
      value={value}
      onChange={handleChange}
    />
  );
}

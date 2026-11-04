export const inputClass =
  "border-line-strong bg-sunk text-ink w-full border px-3 py-2 text-sm";

export const primaryButtonClass =
  "bg-accent text-on-accent cursor-pointer px-4 py-2 text-sm font-medium disabled:opacity-50";

export function Field({
  label,
  errors,
  children,
}: {
  label: string;
  errors?: string[];
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-ink-2 mb-1 block font-mono text-xs">{label}</span>
      {children}
      {errors?.map((error) => (
        <span
          key={error}
          role="alert"
          className="text-danger mt-1 block text-xs"
        >
          {error}
        </span>
      ))}
    </label>
  );
}

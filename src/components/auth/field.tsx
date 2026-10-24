import { Label } from "@/components/ui/label";

type Props = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
};

export function Field({ id, label, error, hint, children }: Props) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-xs text-neutral-800">
        {label}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-neutral-400">{hint}</p>
      )}
    </div>
  );
}

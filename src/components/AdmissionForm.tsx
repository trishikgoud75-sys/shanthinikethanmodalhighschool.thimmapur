import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { admissionSchema } from "@/lib/admission-schema";
import { submitAdmission } from "@/lib/admissions.functions";
import { SCHOOL_GRADES } from "@/lib/school-rules";

function F({ name, label, type = "text", req, variant, errors }: { name: string; label: string; type?: string; req?: boolean; variant: string; errors: Record<string, string> }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={`${variant}-${name}`}>{label}{req ? " *" : ""}</Label>
      <Input id={`${variant}-${name}`} name={name} type={type} inputMode={type === "tel" ? "numeric" : undefined}
        maxLength={type === "tel" ? 10 : 255} className="bg-background/80 text-foreground" />
      {errors[name] ? <p className="text-xs font-medium text-destructive">{errors[name]}</p> : null}
    </div>
  );
}

export function AdmissionForm({ variant }: { variant: "quick" | "full" }) {
  const submit = useServerFn(submitAdmission);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = admissionSchema.safeParse({ ...fd, source: variant });
    const errs: Record<string, string> = {};
    if (!parsed.success) for (const i of parsed.error.issues) errs[String(i.path[0])] ??= i.message;
    setErrors(errs);
    if (!parsed.success) return;
    setBusy(true);
    try {
      await submit({ data: parsed.data });
      setDone(true);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Something went wrong" });
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center animate-in fade-in zoom-in-95 duration-500">
        <CheckCircle2 className="size-16 text-gold animate-in zoom-in duration-700" />
        <h3 className="font-display text-2xl font-semibold">Thank you!</h3>
        <p className="max-w-sm text-sm opacity-80">Our school will contact you soon.</p>
      </div>
    );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <F variant={variant} errors={errors} name="student_name" label="Student name" req />
      <F variant={variant} errors={errors} name="father_name" label="Father's name" req />
      <F variant={variant} errors={errors} name="mother_name" label="Mother's name" req />
      <F variant={variant} errors={errors} name="mobile" label="Mobile number" type="tel" req />
      <F variant={variant} errors={errors} name="alt_mobile" label="Alternate mobile number" type="tel" />
      <F variant={variant} errors={errors} name="email" label="Email address" type="email" />
      <div className="grid gap-1.5 sm:col-span-2">
        <Label htmlFor={`${variant}-class`}>Class applying for *</Label>
        <select id={`${variant}-class`} name="class_applying" className="h-9 rounded-md border border-input bg-background/80 px-3 text-sm">
          <option value="">Select class</option>
          {SCHOOL_GRADES.map((c) => <option key={c}>{c}</option>)}
        </select>
        {errors["class_applying"] ? <p className="text-xs font-medium text-destructive">{errors["class_applying"]}</p> : null}
      </div>
      {errors["form"] ? <p className="text-sm font-medium text-destructive sm:col-span-2">{errors["form"]}</p> : null}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={busy} className="rounded-full px-8">
          {busy ? <Loader2 className="size-4 animate-spin" /> : null} Submit
        </Button>
      </div>
    </form>
  );
}

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const FEEDBACK_CATEGORIES = {
  faculty: "About Faculty",
  facilities: "About Facilities",
  school: "About School",
} as const;

export const feedbackSchema = z.object({
  category: z.enum(["faculty", "facilities", "school"]),
  name: z.string().trim().max(100).optional(),
  mobile: z.union([z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"), z.literal("")]).optional(),
  email: z.union([z.string().trim().email("Enter a valid email").max(255), z.literal("")]).optional(),
  message: z.string().trim().min(5, "Please write a little more").max(2000),
  website: z.string().max(200).optional(),
});

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const ADMIN_EMAILS = ["trishikgoud75@gmail.com", "shanthi123@gmail.com"];

export const submitFeedback = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => feedbackSchema.parse(d))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("feedback")
      .insert({ category: data.category, name: data.name || null, mobile: data.mobile || null, email: data.email || null, message: data.message })
      .select("id")
      .single();
    if (error || !row) {
      console.error("Feedback insert failed", error);
      throw new Error("Could not save your feedback. Please try again.");
    }
    let emailStatus = "sent";
    try {
      const key = process.env["RESEND_API_KEY"];
      if (!key) throw new Error("Email key missing");
      const label = FEEDBACK_CATEGORIES[data.category];
      const rows: [string, string][] = [
        ["Category", label], ["Name", data.name || "—"], ["Mobile", data.mobile || "—"],
        ["Email", data.email || "—"], ["Feedback", data.message],
        ["Submitted at", new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })],
      ];
      const html = `<h2 style="font-family:Georgia,serif;color:#0b1f4d">New Feedback - ${esc(label)}</h2><table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${rows.map(([k, v]) => `<tr><td style="border:1px solid #ddd;padding:8px;background:#f5f1e6;font-weight:bold">${esc(k)}</td><td style="border:1px solid #ddd;padding:8px;white-space:pre-wrap">${esc(v)}</td></tr>`).join("")}</table>`;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ from: "Shanthinikethan School <onboarding@resend.dev>", to: ADMIN_EMAILS, subject: `New Feedback - ${label}`, html, ...(data.email ? { reply_to: data.email } : {}) }),
      });
      if (!res.ok) throw new Error(`Resend [${res.status}]: ${await res.text()}`);
    } catch (e) {
      emailStatus = "failed";
      console.error("Feedback email failed", e);
    }
    await supabaseAdmin.from("feedback").update({ email_status: emailStatus }).eq("id", row.id);
    return { ok: true };
  });

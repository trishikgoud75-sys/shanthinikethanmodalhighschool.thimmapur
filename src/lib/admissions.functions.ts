import { createServerFn } from "@tanstack/react-start";
import { admissionSchema } from "./admission-schema";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const ADMIN_EMAILS = ["trishikgoud75@gmail.com", "shanthi123@gmail.com"];

export const submitAdmission = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => admissionSchema.parse(d))
  .handler(async ({ data }) => {
    // Honeypot: pretend success for bots, store nothing.
    if (data.website) return { ok: true };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Rate limiting: one enquiry per mobile number per minute.
    const since = new Date(Date.now() - 60_000).toISOString();
    const { count } = await supabaseAdmin
      .from("admission_enquiries")
      .select("id", { count: "exact", head: true })
      .eq("mobile", data.mobile)
      .gte("created_at", since);
    if ((count ?? 0) > 0) {
      throw new Error("This number was just submitted. Please wait a minute and try again.");
    }

    const { data: row, error } = await supabaseAdmin
      .from("admission_enquiries")
      .insert({
        student_name: data.student_name,
        father_name: data.father_name,
        mother_name: data.mother_name,
        mobile: data.mobile,
        alt_mobile: data.alt_mobile || null,
        email: data.email || null,
        class_applying: data.class_applying,
      })
      .select("id")
      .single();
    if (error || !row) {
      console.error("Admission enquiry insert failed", error);
      throw new Error("Could not save the enquiry. Please try again.");
    }

    let emailStatus = "sent";
    try {
      const RESEND_API_KEY = process.env["RESEND_API_KEY"];
      if (!RESEND_API_KEY) throw new Error("Email keys missing");
      const rows: [string, string][] = [
        ["Student name", data.student_name],
        ["Father's name", data.father_name],
        ["Mother's name", data.mother_name],
        ["Mobile", data.mobile],
        ["Alternate mobile", data.alt_mobile || "—"],
        ["Email", data.email || "—"],
        ["Class applying for", data.class_applying],
        ["Submitted at", new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })],
      ];
      const html = `<h2 style="font-family:Georgia,serif;color:#0b1f4d">New Admission Enquiry</h2>
<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${rows
        .map(
          ([k, v]) =>
            `<tr><td style="border:1px solid #ddd;padding:8px;background:#f5f1e6;font-weight:bold">${esc(k)}</td><td style="border:1px solid #ddd;padding:8px">${esc(v)}</td></tr>`,
        )
        .join("")}</table>`;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Shanthinikethan School <onboarding@resend.dev>",
          to: ADMIN_EMAILS,
          subject: `New Admission Enquiry - ${data.student_name} - Class ${data.class_applying}`,
          html,
          ...(data.email ? { reply_to: data.email } : {}),
        }),
      });
      if (!res.ok) throw new Error(`Resend [${res.status}]: ${await res.text()}`);
    } catch (e) {
      emailStatus = "failed";
      console.error("Admission enquiry email failed", e);
    }
    await supabaseAdmin.from("admission_enquiries").update({ email_status: emailStatus }).eq("id", row.id);

    return { ok: true };
  });

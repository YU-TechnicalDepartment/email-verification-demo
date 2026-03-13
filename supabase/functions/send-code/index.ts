import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  const { email } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const code = Math.floor(1000 + Math.random() * 9000).toString();

  await supabase
    .from("verification_codes")
    .upsert({ email, code });

  const html = `
  <div style="font-family: 'Segoe UI', sans-serif; padding: 24px; background: #0f172a; color: #e2e8f0;">
    <h2 style="color:#6366f1; font-size: 24px;">Your Verification Code</h2>
    <p style="margin-top: 12px; font-size: 15px;">
      以下の認証コードを入力してください。
    </p>
    <div style="
      margin-top: 24px;
      font-size: 40px;
      font-weight: bold;
      letter-spacing: 12px;
      padding: 20px;
      background: #1e293b;
      border-radius: 12px;
      text-align: center;
      color: #ffffff;
      border: 1px solid #475569;
    ">
      ${code}
    </div>
    <p style="margin-top: 24px; font-size: 13px; color: #94a3b8;">
      このコードは10分間有効です。
    </p>
  </div>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "noreply@yourdomain.com",
      to: email,
      subject: "Your Verification Code",
      html
    })
  });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" }
  });
});

import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  const answers = await req.json();
  const body = `New Lead from SoCalHomePlan.com\n\nName: ${answers.contact?.name}\nPhone: ${answers.contact?.phone}\nEmail: ${answers.contact?.email}\n\nCity: ${answers.city}\nBudget: ${answers.budget}\nDown Payment: ${answers.downpayment}\nMonthly Payment: ${answers.payment}\nTimeline: ${answers.timeline}\nFamily Size: ${answers.familysize}\nFirst Time Buyer: ${answers.firsttime}\nHome Type: ${answers.hometype}\nFeatures: ${(answers.features||[]).join(', ')}\nConcern: ${answers.concern}`;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.RESEND_API_KEY}` },
    body: JSON.stringify({ from: "leads@socalhomeplan.com", to: "socalhomeplan@gmail.com", subject: `New Lead: ${answers.contact?.name} - ${answers.city} - ${answers.budget}`, text: body }),
  });
  return NextResponse.json({ success: true });
}

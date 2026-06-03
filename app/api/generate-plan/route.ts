import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const answers = await req.json();
  const prompt = `You are a licensed Southern California real estate agent. Generate a personalized home-buying plan. Buyer: City: ${answers.city}, Budget: ${answers.budget}, Down payment: ${answers.downpayment}, Monthly comfort: ${answers.payment}, Timeline: ${answers.timeline}, Family: ${answers.familysize}, First-time: ${answers.firsttime}, Home type: ${answers.hometype}, Features: ${(answers.features||[]).join(', ')}, Concern: ${answers.concern}. Return exactly 7 sections as: <section icon="EMOJI" title="TITLE">CONTENT</section>. Titles: Best Cities to Consider | Estimated Price Range | Your Loan Path | Down Payment Strategy | Must-Have Features | Your Buying Timeline | Next Step This Week. 3-5 sentences each. Be specific, local, practical. Return ONLY the section tags.`;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await response.json();
  const raw = data.content?.map((c: {text:string}) => c.text || "").join("") || "";
  return NextResponse.json({ raw });
}

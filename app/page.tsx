'use client';
import { useState } from "react";

type Step = {
  id: string;
  label: string;
  opts?: string[];
  multi?: boolean;
  isContact?: boolean;
};

const STEPS: Step[] = [
  {id:"budget",label:"What is your target home price?",opts:["Under $400,000","$400,000 – $500,000","$500,000 – $600,000","$600,000 – $700,000","$700,000 – $800,000","$800,000+"]},
  {id:"payment",label:"What monthly payment feels comfortable?",opts:["Under $2,000","$2,000 – $2,600","$2,600 – $3,200","$3,200 – $4,000","Over $4,000"]},
  {id:"city",label:"Which area are you focused on?",opts:["Riverside","Corona","Menifee","Murrieta","Temecula","Moreno Valley","Rancho Cucamonga","Ontario","Perris","Lake Elsinore","Other"]},
  {id:"timeline",label:"When are you looking to buy?",opts:["As soon as possible","1 – 3 Months","3 – 6 Months","6 – 12 Months","Just exploring"]},
  {id:"firsttime",label:"Have you purchased a home before?",opts:["No, this is my first home","Yes, I have owned before","It has been a while"]},
  {id:"downpayment",label:"How are you planning your down payment?",opts:["I need down payment assistance","I have some saved but need help","I have my down payment ready","Not sure yet"]},
  {id:"hometype",label:"What type of home are you looking for?",opts:["Single Family Home","Townhouse or Condo","New Construction","Flexible — open to options"]},
  {id:"bedsbaths",label:"How many bedrooms do you need?",opts:["2 Bedrooms","3 Bedrooms","4 Bedrooms","5+ Bedrooms"]},
  {id:"concern",label:"What is your biggest concern right now?",opts:["Affording a down payment","Getting approved for a loan","Finding homes in my budget","Understanding the buying process","Rising interest rates","Competing with other buyers"]},
  {id:"contact",label:"Where should we send your plan?",isContact:true},
];

const AREAS = [
  {name:"Riverside",med:"$585,000",tax:"~1.1%",hoa:"Varies",note:"Strong schools, freeway access, established neighborhoods"},
  {name:"Menifee",med:"$575,000",tax:"~1.2%",hoa:"Many HOAs",note:"Fast-growing, newer construction, family friendly"},
  {name:"Murrieta",med:"$650,000",tax:"~1.1%",hoa:"Common",note:"Top-rated schools, quiet suburbs, commuter friendly"},
  {name:"Moreno Valley",med:"$485,000",tax:"~1.2%",hoa:"Some",note:"Most affordable in the region, close to job centers"},
  {name:"Temecula",med:"$680,000",tax:"~1.1%",hoa:"Common",note:"Wine country lifestyle, great schools, active community"},
  {name:"Corona",med:"$620,000",tax:"~1.1%",hoa:"Varies",note:"Close to Orange County, established city, good value"},
];

export default function Home() {
  const [view, setView] = useState("home");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const current = STEPS[step];
  const val = answers[current?.id];

  const canAdv = () => {
    if (current.isContact) {
      const c = (answers.contact as Record<string, string>) || {};
      return !!(c.name?.trim() && c.email?.trim() && c.phone?.trim());
    }
    if (current.multi) return ((val as string[]) || []).length > 0;
    return !!val;
  };

  const setAns = (v: string) => setAnswers(p => ({ ...p, [current.id]: v }));
  const setContact = (k: string, v: string) => setAnswers(p => ({ ...p, contact: { ...((p.contact as Record<string, string>) || {}), [k]: v } }));

  const generatePlan = async () => {
    setView("plan"); setLoading(true); setPlan(null);
    fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(answers) });
    try {
      const res = await fetch("/api/generate-plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(answers) });
      const data = await res.json();
      const raw = data.raw || "";
      const re = /<section icon="([^"]+)" title="([^"]+)">([\s\S]*?)<\/section>/g;
      let html = ""; let m;
      while ((m = re.exec(raw)) !== null) {
        const [, icon, title, content] = m;
        html += `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px 22px;margin-bottom:14px;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;"><span style="font-size:18px;">${icon}</span><strong style="font-size:15px;color:#0B1F4B;">${title}</strong></div><p style="font-size:14px;color:#374151;line-height:1.75;margin:0;">${content.trim()}</p></div>`;
      }
      setPlan(html || "<p style='color:#6b7280;font-size:14px;'>Your plan is being prepared. A local agent will follow up shortly.</p>");
    } catch {
      setPlan("<p style='color:#6b7280;font-size:14px;'>We will follow up with your personalized plan shortly. Call us at 951-212-6116.</p>");
    }
    setLoading(false);
  };

  const goQuiz = () => { setView("quiz"); setStep(0); setAnswers({}); setPlan(null); };

  // PLAN VIEW
  if (view === "plan") {
    const name = ((answers.contact as Record<string, string>)?.name || "").split(" ")[0] || "there";
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "Georgia, serif" }}>
        <nav style={{ background: "#0B1F4B", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span onClick={() => setView("home")} style={{ cursor: "pointer", fontWeight: 800, fontSize: 18, color: "#fff", fontFamily: "Georgia, serif" }}>
            SoCal<span style={{ color: "#3B82F6" }}>Home</span>Plan
          </span>
          <button onClick={() => { setView("home"); setStep(0); setAnswers({}); setPlan(null); }} style={{ background: "none", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 6, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>Start Over</button>
        </nav>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "36px 20px 60px" }}>
          <div style={{ background: "linear-gradient(135deg,#0B1F4B,#1A3A6B)", borderRadius: 14, padding: "28px 26px", marginBottom: 20, color: "#fff" }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: "#93C5FD", marginBottom: 6, textTransform: "uppercase" }}>Your Home Buying Plan</div>
            <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700 }}>{name}&apos;s Southern California Plan</h2>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>{answers.city as string} · {answers.budget as string} · {answers.timeline as string}</p>
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: 48 }}>
              <div style={{ width: 36, height: 36, border: "3px solid #e5e7eb", borderTop: "3px solid #3B82F6", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
              <p style={{ color: "#6b7280", fontSize: 14 }}>Building your personalized plan…</p>
              <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
            </div>
          ) : <div dangerouslySetInnerHTML={{ __html: plan || "" }} />}
          <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 12, padding: "22px 24px", marginTop: 10 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "#0B1F4B", fontWeight: 700 }}>Ready to take the next step?</h3>
            <p style={{ margin: "0 0 16px", fontSize: 14, color: "#374151", lineHeight: 1.6 }}>A licensed Southern California Realtor will reach out to walk you through your plan and show you available homes in your area.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href="tel:+19512126116" style={{ padding: "11px 22px", background: "#0B1F4B", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Call 951-212-6116</a>
              <a href="https://calendly.com/socalhomeplan" style={{ padding: "11px 22px", border: "2px solid #0B1F4B", color: "#0B1F4B", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Schedule a Free Call</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // QUIZ VIEW
  if (view === "quiz") {
    const pct = Math.round(((step + 1) / STEPS.length) * 100);
    const isLast = step === STEPS.length - 1;
    const contactVals = (answers.contact as Record<string, string>) || {};
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "Georgia, serif" }}>
        <nav style={{ background: "#0B1F4B", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span onClick={() => setView("home")} style={{ cursor: "pointer", fontWeight: 800, fontSize: 18, color: "#fff" }}>
            SoCal<span style={{ color: "#3B82F6" }}>Home</span>Plan
          </span>
          <button onClick={() => setView("home")} style={{ background: "none", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 6, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>← Back</button>
        </nav>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "36px 20px 60px" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>Step {step + 1} of {STEPS.length}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#3B82F6" }}>{pct}% complete</span>
            </div>
            <div style={{ height: 5, background: "#e5e7eb", borderRadius: 99 }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "#0B1F4B", borderRadius: 99, transition: "width 0.4s" }} />
            </div>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0B1F4B", marginBottom: 24, lineHeight: 1.3 }}>{current.label}</h2>
          {current.isContact ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "14px 16px", fontSize: 14, color: "#0B1F4B", lineHeight: 1.6 }}>
                Your plan is ready. Enter your information below and we will send it to you right away.
              </div>
              {(["name", "phone", "email"] as const).map(k => {
                const labels = { name: "Full Name", phone: "Phone Number", email: "Email Address" };
                const types = { name: "text", phone: "tel", email: "email" };
                const placeholders = { name: "Jane Smith", phone: "(951) 555-0100", email: "jane@email.com" };
                return (
                  <div key={k}>
                    <label style={{ fontSize: 14, fontWeight: 700, color: "#0B1F4B", display: "block", marginBottom: 6 }}>{labels[k]}</label>
                    <input type={types[k]} placeholder={placeholders[k]} value={contactVals[k] || ""} onChange={e => setContact(k, e.target.value)}
                      style={{ width: "100%", padding: "13px 14px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 15, boxSizing: "border-box", fontFamily: "Georgia, serif" }} />
                  </div>
                );
              })}
              <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.6 }}>By submitting you agree to be contacted by a licensed California real estate agent. This is not a mortgage pre-approval. All estimates are for planning purposes only.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(current.opts || []).map(o => {
                const sel = val === o;
                return (
                  <button key={o} onClick={() => setAns(o)} style={{ padding: "15px 18px", border: `${sel ? "2" : "1.5"}px solid ${sel ? "#0B1F4B" : "#d1d5db"}`, borderRadius: 10, background: sel ? "#EFF6FF" : "#fff", color: sel ? "#0B1F4B" : "#374151", fontWeight: sel ? 700 : 400, fontSize: 15, textAlign: "left", cursor: "pointer", fontFamily: "Georgia, serif", transition: "all 0.15s" }}>
                    {sel && <span style={{ color: "#0B1F4B", marginRight: 8 }}>✓</span>}{o}
                  </button>
                );
              })}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            {step > 0 && <button onClick={() => setStep(s => s - 1)} style={{ padding: "13px 20px", background: "transparent", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#374151", fontFamily: "Georgia, serif" }}>← Back</button>}
            <button onClick={() => { if (step < STEPS.length - 1) setStep(s => s + 1); else generatePlan(); }} disabled={!canAdv()}
              style={{ flex: 1, padding: "14px", background: canAdv() ? "#0B1F4B" : "#d1d5db", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: canAdv() ? "pointer" : "not-allowed", fontFamily: "Georgia, serif", transition: "background 0.2s" }}>
              {isLast ? "Get My Free Home Plan" : "Continue →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // HOME VIEW
  return (
    <div style={{ fontFamily: "Georgia, serif", background: "#fff", color: "#1f2937" }}>

      {/* NAV */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
        <span onClick={() => setView("home")} style={{ cursor: "pointer", fontWeight: 800, fontSize: 20, color: "#0B1F4B" }}>
          SoCal<span style={{ color: "#3B82F6" }}>Home</span>Plan
        </span>
        <span style={{ fontSize: 13, color: "#6b7280", display: "flex", alignItems: "center", gap: 6 }}>
          <span>📞</span> 951-212-6116
        </span>
        <button onClick={goQuiz} style={{ padding: "10px 22px", background: "#0B1F4B", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "Georgia, serif" }}>
          Get My Free Home Plan
        </button>
      </nav>

      {/* HERO */}
      <section style={{ background: "#0B1F4B", color: "#fff", padding: "72px 40px 80px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <p style={{ fontSize: 13, letterSpacing: 2, color: "#93C5FD", textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>Free for Southern California Home Buyers</p>
          <h1 style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.2, margin: "0 0 20px" }}>
            Know Exactly What You Can Afford Before You Start Looking
          </h1>
          <p style={{ fontSize: 18, opacity: 0.85, lineHeight: 1.7, margin: "0 0 36px", maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
            Get a free personalized home-buying plan built around your budget, monthly payment, preferred city, and timeline. No pressure. No obligation.
          </p>
          <button onClick={goQuiz} style={{ padding: "17px 44px", background: "#3B82F6", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 17, cursor: "pointer", fontFamily: "Georgia, serif" }}>
            Get My Free Home Plan
          </button>
          <p style={{ marginTop: 14, fontSize: 13, opacity: 0.55 }}>Takes about 2 minutes · No commitment · 100% free</p>
        </div>
      </section>

      {/* QUICK QUIZ */}
      <section style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", padding: "52px 40px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: "#0B1F4B", textAlign: "center", marginBottom: 8 }}>Start With a Few Quick Questions</h2>
          <p style={{ textAlign: "center", color: "#6b7280", marginBottom: 32, fontSize: 15 }}>Tell us what you are looking for and we will build your plan.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { label: "Target Home Price", opts: ["Under $400k", "$400k–$500k", "$500k–$600k", "$600k–$700k", "$700k–$800k", "$800k+"] },
              { label: "Monthly Payment Comfort", opts: ["Under $2,000", "$2,000–$2,600", "$2,600–$3,200", "$3,200–$4,000", "Over $4,000"] },
              { label: "Preferred City or Area", opts: ["Riverside", "Corona", "Menifee", "Murrieta", "Temecula", "Moreno Valley", "Other"] },
              { label: "When Do You Want to Buy?", opts: ["As soon as possible", "1–3 Months", "3–6 Months", "6–12 Months", "Just exploring"] },
            ].map(f => (
              <div key={f.label}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>{f.label}</label>
                <select style={{ width: "100%", padding: "11px 12px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 14, color: "#374151", background: "#fff", fontFamily: "Georgia, serif" }}>
                  <option>Select...</option>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button onClick={goQuiz} style={{ width: "100%", marginTop: 20, padding: "15px", background: "#0B1F4B", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "Georgia, serif" }}>
            Get My Free Home Plan →
          </button>
          <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", marginTop: 10 }}>Your information is never shared. This is not a mortgage application.</p>
        </div>
      </section>

      {/* 3 BENEFIT CARDS */}
      <section style={{ padding: "64px 40px", background: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: "#0B1F4B", textAlign: "center", marginBottom: 40 }}>What You Get With Your Free Plan</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { title: "Payment Reality Check", body: "Most buyers are surprised by what homeownership actually costs. Your plan breaks down the full monthly picture including taxes, insurance, and HOA so there are no surprises at closing." },
              { title: "Best City Match", body: "Not every city fits every budget. Your plan compares Riverside, Corona, Menifee, Murrieta, Temecula, and nearby areas based on what you can actually afford today." },
              { title: "Home Search Plan", body: "Stop scrolling Zillow aimlessly. Your plan gives you a clear starting point — price range, neighborhoods, loan type, and the exact steps to take this week." },
            ].map(c => (
              <div key={c.title} style={{ padding: "28px 24px", border: "1px solid #e5e7eb", borderRadius: 14, background: "#fff" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0B1F4B", margin: "0 0 12px" }}>{c.title}</h3>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY SECTION */}
      <section style={{ padding: "64px 40px", background: "#f9fafb" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: "#0B1F4B", marginBottom: 20 }}>Southern California Buyers Need a Real Plan</h2>
          <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.8, marginBottom: 16 }}>
            Most buyers in Riverside County and San Bernardino County start their search on Zillow or Redfin and waste months looking at homes that do not fit their actual budget or loan situation.
          </p>
          <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.8, marginBottom: 16 }}>
            The hidden costs — property taxes, HOA fees, Mello-Roos, insurance — can add $400 to $800 per month on top of your mortgage. Most buyers do not find out until they are already in escrow.
          </p>
          <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.8, marginBottom: 32 }}>
            Your free home-buying plan gives you the full picture upfront so you can shop with confidence, avoid wasted time, and make the right move for your family.
          </p>
          <button onClick={goQuiz} style={{ padding: "15px 36px", background: "#0B1F4B", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "Georgia, serif" }}>
            Get My Free Home Plan
          </button>
        </div>
      </section>

      {/* AREA COMPARISON */}
      <section style={{ padding: "64px 40px", background: "#fff" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: "#0B1F4B", textAlign: "center", marginBottom: 8 }}>Compare Southern California Cities</h2>
          <p style={{ textAlign: "center", color: "#6b7280", marginBottom: 36, fontSize: 15 }}>Every city has a different price point, tax rate, and lifestyle. Here is a quick overview.</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#0B1F4B", color: "#fff" }}>
                  {["City", "Median Price", "Avg Property Tax", "HOA", "Why Buyers Choose It"].map(h => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontWeight: 700, fontSize: 13 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AREAS.map((a, i) => (
                  <tr key={a.name} style={{ background: i % 2 === 0 ? "#f9fafb" : "#fff", borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "#0B1F4B" }}>{a.name}</td>
                    <td style={{ padding: "14px 16px", color: "#374151" }}>{a.med}</td>
                    <td style={{ padding: "14px 16px", color: "#374151" }}>{a.tax}</td>
                    <td style={{ padding: "14px 16px", color: "#374151" }}>{a.hoa}</td>
                    <td style={{ padding: "14px 16px", color: "#6b7280" }}>{a.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "72px 40px", background: "#0B1F4B", textAlign: "center", color: "#fff" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 16px" }}>Ready to Find Out What You Can Really Afford?</h2>
          <p style={{ fontSize: 16, opacity: 0.8, margin: "0 0 32px", lineHeight: 1.7 }}>Get your free Southern California home-buying plan in about 2 minutes. A licensed local Realtor will follow up to walk you through your results.</p>
          <button onClick={goQuiz} style={{ padding: "17px 44px", background: "#3B82F6", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 17, cursor: "pointer", fontFamily: "Georgia, serif" }}>
            Get My Free Home Plan
          </button>
          <p style={{ marginTop: 14, fontSize: 13, opacity: 0.5 }}>No commitment required · 100% free · Takes about 2 minutes</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#111827", color: "rgba(255,255,255,0.5)", padding: "32px 40px", fontSize: 13, lineHeight: 1.8 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32 }}>
          <div>
            <div style={{ fontWeight: 700, color: "#fff", fontSize: 16, marginBottom: 8 }}>SoCalHomePlan.com</div>
            <div>📞 951-212-6116</div>
            <div style={{ marginTop: 4 }}>Licensed California Real Estate Agent</div>
            <div>CA DRE #[Your License Number]</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#fff", marginBottom: 8 }}>Service Areas</div>
            <div>Riverside · Corona · Menifee</div>
            <div>Murrieta · Temecula · Moreno Valley</div>
            <div>Rancho Cucamonga · Ontario · Perris</div>
            <div>Lake Elsinore · San Bernardino County</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#fff", marginBottom: 8 }}>Important Notice</div>
            <div>This website provides informational planning tools only. Results are not a mortgage pre-approval or guarantee of financing. Consult a licensed lender to verify loan qualification. All estimates are for planning purposes only.</div>
          </div>
        </div>
        <div style={{ maxWidth: 960, margin: "24px auto 0", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
          © 2025 SoCalHomePlan.com · All Rights Reserved
        </div>
      </footer>
    </div>
  );
}

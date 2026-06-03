'use client';
import { useState } from "react";

const N="#0B1F4B",B="#1A56C4",LB="#EBF2FF",G50="#F8FAFC",G100="#F1F5F9",G300="#CBD5E1",G500="#64748B",G700="#334155",GR="#16A34A",W="#fff";

const STEPS=[
  {id:"budget",label:"Budget (Total Home Price)",opts:["Under $400,000","$400,000 – $500,000","$500,000 – $600,000","$600,000 – $700,000","$700,000 – $800,000","$800,000+"]},
  {id:"downpayment",label:"Down Payment",opts:["Less than 3.5% (FHA)","3.5% – 5%","5% – 10%","10% – 20%","20%+ (Conventional)","Not sure"]},
  {id:"city",label:"Desired City",opts:["Riverside","Corona","Menifee","Murrieta","Temecula","Moreno Valley","Rancho Cucamonga","Ontario","Perris","Lake Elsinore","Other"]},
  {id:"timeline",label:"Timeline",opts:["ASAP – I'm ready now","1 – 3 Months","3 – 6 Months","6 – 12 Months","Just exploring"]},
  {id:"familysize",label:"Family Size",opts:["1 – 2 people","3 – 4 people","5 – 6 people","7+ people"]},
  {id:"payment",label:"Monthly Payment Comfort",opts:["Under $2,000","$2,000 – $2,600","$2,600 – $3,200","$3,200 – $4,000","Over $4,000"]},
  {id:"firsttime",label:"First-Time Buyer?",opts:["Yes, first time","No, I've owned before","It's been a while"]},
  {id:"hometype",label:"Home Type",opts:["Single Family Home","Townhouse / Condo","New Construction","55+ Community","Flexible"]},
  {id:"features",label:"Must-Have Features",opts:["Pool","No HOA","Good Schools","Single Story","Big Backyard","New Construction","Multi-Gen Layout","Extra Parking"],multi:true},
  {id:"concern",label:"Biggest Concern",opts:["Affording a down payment","Getting loan approved","Finding homes in budget","Competing with buyers","Understanding the process","Rising interest rates"]},
  {id:"contact",label:"Get Your Free Plan",isContact:true},
] as const;

const AREAS=[
  {name:"Riverside",price:"$585,000",img:"https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&q=80"},
  {name:"Corona",price:"$620,000",img:"https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80"},
  {name:"Menifee",price:"$575,000",img:"https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80"},
  {name:"Moreno Valley",price:"$485,000",img:"https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80"},
  {name:"Murrieta",price:"$650,000",img:"https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=400&q=80"},
];

function Logo({dark=false}:{dark?:boolean}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{width:42,height:42,background:`linear-gradient(135deg,${N},${B})`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🏠</div>
      <div>
        <div style={{fontSize:17,fontWeight:900,lineHeight:1.1,fontFamily:"'Montserrat',sans-serif"}}>
          <span style={{color:dark?W:N}}>SoCal</span>
          <span style={{color:B}}>Home</span>
          <span style={{color:dark?W:N}}>Plan</span>
          <span style={{color:B,fontSize:11}}>.com</span>
        </div>
        <div style={{fontSize:9,color:dark?"rgba(255,255,255,0.55)":G500}}>Home Buying Decision Engine for Southern California</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [view,setView]=useState("home");
  const [step,setStep]=useState(0);
  const [answers,setAnswers]=useState<Record<string,any>>({});
  const [plan,setPlan]=useState<string|null>(null);
  const [loading,setLoading]=useState(false);

  const current=STEPS[step];
  const val=answers[current?.id];

  const canAdv=()=>{
    if(current.isContact){const c=answers.contact||{};return!!(c.name?.trim()&&c.email?.trim()&&c.phone?.trim());}
    if("multi" in current&&current.multi)return(val||[]).length>0;
    return!!val;
  };

  const setAns=(v:string)=>setAnswers(p=>({...p,[current.id]:v}));
  const toggleAns=(v:string)=>{const arr=val||[];setAnswers(p=>({...p,[current.id]:arr.includes(v)?arr.filter((x:string)=>x!==v):[...arr,v]}));};
  const setContact=(k:string,v:string)=>setAnswers(p=>({...p,contact:{...(p.contact||{}),[k]:v}}));

  const generatePlan=async()=>{
    setView("plan");setLoading(true);setPlan(null);
    const a=answers;
    const prompt=`You are a licensed Southern California real estate agent. Generate a personalized home-buying plan.
Buyer: City: ${a.city}, Budget: ${a.budget}, Down payment: ${a.downpayment}, Monthly comfort: ${a.payment}, Timeline: ${a.timeline}, Family: ${a.familysize}, First-time: ${a.firsttime}, Home type: ${a.hometype}, Features: ${(a.features||[]).join(', ')}, Concern: ${a.concern}
Return exactly 7 sections as: <section icon="EMOJI" title="TITLE">CONTENT</section>
Titles: Best Cities to Consider | Estimated Price Range | Your Loan Path | Down Payment Strategy | Must-Have Features | Your Buying Timeline | Next Step This Week
3-5 sentences each. Be specific, local, practical. Return ONLY the section tags.`;
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      const raw=data.content?.map((c:any)=>c.text||"").join("")||"";
      const re=/<section icon="([^"]+)" title="([^"]+)">([\s\S]*?)<\/section>/g;
      let html="";let m;
      while((m=re.exec(raw))!==null){
        const[,icon,title,content]=m;
        html+=`<div style="background:#fff;border:1.5px solid #E2E8F0;border-radius:12px;padding:18px 20px;margin-bottom:12px;"><div style="display:flex;align-items:center;gap:9px;margin-bottom:8px;"><span style="font-size:19px;">${icon}</span><strong style="font-size:14px;color:${N};font-family:'Montserrat',sans-serif;">${title}</strong></div><p style="font-size:13px;color:${G700};line-height:1.7;margin:0;">${content.trim()}</p></div>`;
      }
      setPlan(html||"<p>A licensed agent will follow up with your full personalized plan!</p>");
    }catch{
      setPlan("<p>We'll follow up with your personalized plan shortly. Call us at 951-212-6116!</p>");
    }
    setLoading(false);
  };

  const goQuiz=()=>{setView("quiz");setStep(0);setAnswers({});setPlan(null);};

  if(view==="plan"){
    const name=(answers.contact?.name||"").split(" ")[0]||"there";
    return(
      <div style={{minHeight:"100vh",background:G50,fontFamily:"sans-serif"}}>
        <nav style={{background:N,padding:"14px 28px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <Logo dark/>
          <button onClick={()=>setView("home")} style={{background:"none",border:"1px solid rgba(255,255,255,0.3)",color:W,borderRadius:6,padding:"6px 14px",fontSize:12,cursor:"pointer"}}>Start Over</button>
        </nav>
        <div style={{maxWidth:620,margin:"0 auto",padding:"30px 18px 60px"}}>
          <div style={{background:`linear-gradient(135deg,${N},${B})`,borderRadius:16,padding:"26px 24px",marginBottom:18,color:W}}>
            <div style={{fontSize:10,letterSpacing:2,color:"#93C5FD",marginBottom:5,textTransform:"uppercase"}}>SoCalHomePlan.com</div>
            <h2 style={{margin:"0 0 5px",fontSize:20,fontFamily:"'Montserrat',sans-serif",fontWeight:800}}>{name}&apos;s Home Buying Plan</h2>
            <p style={{margin:0,fontSize:12,opacity:0.7}}>{answers.city} · {answers.budget} · {answers.timeline}</p>
          </div>
          {loading?(
            <div style={{textAlign:"center",padding:40}}>
              <div style={{width:36,height:36,border:`3px solid ${G100}`,borderTop:`3px solid ${B}`,borderRadius:"50%",margin:"0 auto 14px",animation:"spin 0.8s linear infinite"}}/>
              <p style={{color:G500,fontSize:13}}>Generating your personalized plan…</p>
              <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
            </div>
          ):(
            <div dangerouslySetInnerHTML={{__html:plan||""}}/>
          )}
          <div style={{background:LB,border:`1.5px solid ${B}`,borderRadius:12,padding:20,marginTop:10}}>
            <h3 style={{margin:"0 0 7px",fontSize:15,color:N,fontFamily:"'Montserrat',sans-serif",fontWeight:800}}>📞 Ready to review your plan?</h3>
            <p style={{margin:"0 0 14px",fontSize:13,color:G700,lineHeight:1.6}}>A licensed SoCal Realtor will walk you through your results and show you real listings.</p>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <a href="tel:+19512126116" style={{padding:"10px 20px",background:N,color:W,borderRadius:8,fontSize:13,fontWeight:700,textDecoration:"none"}}>📱 951-212-6116</a>
              <a href="https://calendly.com/socalhomeplan" style={{padding:"10px 20px",border:`2px solid ${N}`,color:N,borderRadius:8,fontSize:13,fontWeight:700,textDecoration:"none"}}>📅 Schedule a Call</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if(view==="quiz"){
    const pct=Math.round(((step+1)/STEPS.length)*100);
    const isLast=step===STEPS.length-1;
    return(
      <div style={{minHeight:"100vh",background:G50,fontFamily:"sans-serif"}}>
        <nav style={{background:N,padding:"14px 28px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <Logo dark/>
          <button onClick={()=>setView("home")} style={{background:"none",border:"1px solid rgba(255,255,255,0.3)",color:W,borderRadius:6,padding:"6px 14px",fontSize:12,cursor:"pointer"}}>← Back to Home</button>
        </nav>
        <div style={{maxWidth:540,margin:"0 auto",padding:"28px 18px 60px"}}>
          <div style={{marginBottom:22}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{fontSize:12,color:G500}}>Step {step+1} of {STEPS.length}</span>
              <span style={{fontSize:12,fontWeight:700,color:B}}>{pct}% complete</span>
            </div>
            <div style={{height:6,background:G100,borderRadius:99}}>
              <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${N},${B})`,borderRadius:99,transition:"width 0.4s"}}/>
            </div>
          </div>
          <h2 style={{fontSize:20,fontWeight:800,color:N,marginBottom:20,fontFamily:"'Montserrat',sans-serif"}}>
            {current.isContact?"Last step — get your free plan":current.label}
          </h2>
          {current.isContact?(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{background:LB,border:"1px solid #BFDBFE",borderRadius:10,padding:"12px 16px",fontSize:13,color:N}}>
                🏡 Your personalized AI home-buying plan is ready. Enter your info below.
              </div>
              {([["name","Full Name","text","Jane Smith"],["phone","Phone Number","tel","951-212-6116"],["email","Email Address","email","jane@email.com"]] as const).map(([k,label,type,ph])=>(
                <div key={k}>
                  <label style={{fontSize:13,fontWeight:700,color:N,display:"block",marginBottom:4}}>{label}</label>
                  <input type={type} placeholder={ph} value={answers.contact?.[k]||""} onChange={e=>setContact(k,e.target.value)} style={{width:"100%",padding:"12px 13px",border:`1.5px solid ${G300}`,borderRadius:8,fontSize:14,boxSizing:"border-box"}}/>
                </div>
              ))}
              <p style={{fontSize:11,color:G500,lineHeight:1.5}}>By submitting you agree to be contacted by a licensed California real estate agent. Not a mortgage pre-approval.</p>
            </div>
          ):"multi" in current&&current.multi?(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:8}}>
              {current.opts.map((o:string)=>{
                const sel=(val||[]).includes(o);
                return<button key={o} onClick={()=>toggleAns(o)} style={{padding:"11px 14px",border:`${sel?"2":"1.5"}px solid ${sel?B:G300}`,borderRadius:10,background:sel?LB:W,color:sel?N:G700,fontWeight:sel?700:400,fontSize:13,textAlign:"left",cursor:"pointer"}}>{sel&&<span style={{color:B,marginRight:4}}>✓</span>}{o}</button>;
              })}
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {current.opts.map((o:string)=>{
                const sel=val===o;
                return<button key={o} onClick={()=>setAns(o)} style={{padding:"13px 16px",border:`${sel?"2":"1.5"}px solid ${sel?B:G300}`,borderRadius:10,background:sel?LB:W,color:sel?N:G700,fontWeight:sel?700:400,fontSize:14,textAlign:"left",cursor:"pointer"}}>{sel&&<span style={{color:B,marginRight:6}}>✓</span>}{o}</button>;
              })}
            </div>
          )}
          <div style={{display:"flex",gap:10,marginTop:26}}>
            {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{padding:"12px 18px",background:"transparent",border:`1.5px solid ${G300}`,borderRadius:8,fontSize:13,cursor:"pointer",color:G700}}>← Back</button>}
            <button onClick={()=>{if(step<STEPS.length-1)setStep(s=>s+1);else generatePlan();}} disabled={!canAdv()} style={{flex:1,padding:13,background:canAdv()?N:G300,color:W,border:"none",borderRadius:10,fontWeight:800,fontSize:14,cursor:canAdv()?"pointer":"not-allowed",fontFamily:"'Montserrat',sans-serif"}}>
              {isLast?"✨ Generate My Home Plan":"Continue →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return(
    <div style={{fontFamily:"sans-serif",background:W}}>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet"/>
      <nav style={{background:W,borderBottom:`1px solid ${G300}`,padding:"14px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
        <Logo/>
        <div style={{display:"flex",gap:24,fontSize:13,fontWeight:600}}>
          {["Home","Buyers","Areas","About","Contact"].map((item,i)=>(
            <a key={item} href="#" style={{textDecoration:"none",color:i===0?B:G700,borderBottom:i===0?`2px solid ${B}`:"none",paddingBottom:2}}>{item}</a>
          ))}
        </div>
        <button onClick={goQuiz} style={{padding:"10px 22px",background:N,color:W,border:"none",borderRadius:8,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'Montserrat',sans-serif"}}>Get My Free Home Plan</button>
      </nav>

      <section style={{position:"relative",minHeight:480,background:`linear-gradient(to right,rgba(11,31,75,0.88) 38%,rgba(11,31,75,0.25) 100%),url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=80') center/cover`,display:"flex",alignItems:"center",padding:"52px 40px",gap:32}}>
        <div style={{flex:1,maxWidth:480,color:W}}>
          <h1 style={{fontSize:38,fontWeight:900,lineHeight:1.2,margin:"0 0 16px",fontFamily:"'Montserrat',sans-serif"}}>Find Out What You Can Really Afford in Southern California</h1>
          <p style={{fontSize:15,opacity:0.88,lineHeight:1.7,margin:"0 0 28px"}}>Get your personalized AI home-buying plan in 60 seconds — built around your budget, lifestyle, and the local market.</p>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <button onClick={goQuiz} style={{padding:"14px 30px",background:B,color:W,border:"none",borderRadius:10,fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"'Montserrat',sans-serif",boxShadow:"0 4px 18px rgba(26,86,196,0.5)"}}>✨ Get My Free Home Plan</button>
          </div>
          <div style={{display:"flex",gap:20,marginTop:18}}>
            {["100% Free","60 Seconds","No Obligation"].map(t=>(
              <span key={t} style={{fontSize:12,opacity:0.8,display:"flex",alignItems:"center",gap:4}}><span style={{color:"#4ADE80"}}>✓</span>{t}</span>
            ))}
          </div>
        </div>
        <div style={{background:W,borderRadius:16,boxShadow:"0 20px 60px rgba(0,0,0,0.25)",padding:"24px 22px",width:300,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
            <span style={{fontSize:16}}>✨</span>
            <span style={{fontWeight:800,fontSize:15,color:N,fontFamily:"'Montserrat',sans-serif"}}>AI Home Buyer Quiz</span>
          </div>
          <p style={{fontSize:11,color:G500,marginBottom:16}}>Answer a few quick questions to get your personalized home plan.</p>
          {[
            {id:"budget",label:"Budget",icon:"🏠",opts:["$400k–$500k","$500k–$600k","$600k–$700k","$700k–$800k","$800k+"]},
            {id:"city",label:"Desired City",icon:"📍",opts:["Riverside","Corona","Menifee","Murrieta","Temecula","Moreno Valley"]},
            {id:"timeline",label:"Timeline",icon:"⏰",opts:["ASAP","1–3 Months","3–6 Months","6–12 Months"]},
            {id:"payment",label:"Monthly Payment",icon:"💳",opts:["$2,000–$2,600","$2,600–$3,200","$3,200–$4,000","$4,000+"]},
          ].map(f=>(
            <div key={f.id} style={{marginBottom:9}}>
              <label style={{fontSize:11,fontWeight:700,color:G700,display:"flex",alignItems:"center",gap:4,marginBottom:3}}>{f.icon} {f.label}</label>
              <select style={{width:"100%",padding:"8px 10px",border:`1.5px solid ${G300}`,borderRadius:7,fontSize:12,color:G700,background:W}}>
                <option>Select...</option>
                {f.opts.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <button onClick={goQuiz} style={{width:"100%",marginTop:12,padding:12,background:B,color:W,border:"none",borderRadius:9,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'Montserrat',sans-serif"}}>✨ Get My Free Home Plan</button>
          <p style={{fontSize:10,color:G500,textAlign:"center",marginTop:7}}>🔒 Your information is secure and never shared.</p>
        </div>
      </section>

      <section style={{padding:"40px 40px",background:W}}>
        <div style={{maxWidth:980,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:18}}>
          {[
            {icon:"🏠",title:"AI Home Match",desc:"Our AI analyzes thousands of homes and matches you with the best options that fit your budget, lifestyle, and goals."},
            {icon:"🧮",title:"Payment Reality Calculator",desc:"See the true cost of homeownership including taxes, insurance, HOA, and maintenance — so there are no surprises."},
            {icon:"📍",title:"Neighborhood Matcher",desc:"Find the right community for your family based on schools, commute, crime rates, and local amenities."},
            {icon:"🛡️",title:"Deal Risk Scanner",desc:"AI evaluates potential red flags and market risks so you can buy with confidence and avoid costly mistakes."},
          ].map(f=>(
            <div key={f.title} style={{padding:"20px 18px",border:`1px solid ${G300}`,borderRadius:14,background:W}}>
              <div style={{fontSize:26,marginBottom:9}}>{f.icon}</div>
              <h3 style={{fontSize:13,fontWeight:800,color:N,margin:"0 0 7px",fontFamily:"'Montserrat',sans-serif"}}>{f.title}</h3>
              <p style={{fontSize:12,color:G500,lineHeight:1.6,margin:0}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{padding:"48px 40px",background:G50}}>
        <div style={{maxWidth:980,margin:"0 auto"}}>
          <h2 style={{textAlign:"center",fontSize:26,fontWeight:900,color:N,fontFamily:"'Montserrat',sans-serif",marginBottom:5}}>Explore Top Inland Empire Areas</h2>
          <p style={{textAlign:"center",color:G500,marginBottom:28,fontSize:13}}>Great communities. Strong value. Room to grow.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(165px,1fr))",gap:14}}>
            {AREAS.map(a=>(
              <div key={a.name} onClick={goQuiz} style={{borderRadius:12,overflow:"hidden",border:`1px solid ${G300}`,cursor:"pointer",background:W}}>
                <div style={{height:110,backgroundImage:`url(${a.img})`,backgroundSize:"cover",backgroundPosition:"center"}}/>
                <div style={{padding:"11px 13px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontWeight:800,fontSize:13,color:N,fontFamily:"'Montserrat',sans-serif"}}>{a.name}</div>
                    <div style={{fontSize:11,color:G500}}>Median Price: {a.price}</div>
                  </div>
                  <span style={{color:B,fontSize:15}}>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{padding:"40px 40px",background:W}}>
        <div style={{maxWidth:980,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:40}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
              <div style={{width:58,height:58,borderRadius:"50%",background:`linear-gradient(135deg,${N},${B})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:W,flexShrink:0}}>👤</div>
              <div>
                <div style={{fontWeight:800,fontSize:15,color:N,fontFamily:"'Montserrat',sans-serif"}}>Licensed Southern California Realtor</div>
                <div style={{fontSize:12,color:G500}}>Local Market Knowledge. Real Results.</div>
              </div>
            </div>
            <div style={{padding:"13px 16px",background:LB,borderRadius:10,display:"flex",alignItems:"center",gap:12,marginTop:16}}>
              <span style={{fontSize:18}}>📞</span>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:N,fontFamily:"'Montserrat',sans-serif"}}>951-212-6116</div>
                <div style={{fontSize:11,color:G500}}>Call or text anytime</div>
              </div>
            </div>
          </div>
          <div>
            <h3 style={{fontSize:19,fontWeight:900,color:N,fontFamily:"'Montserrat',sans-serif",marginBottom:5}}>Your Personalized Home Buying Plan</h3>
            <p style={{fontSize:13,color:G500,marginBottom:16}}>Get a custom report with everything you need to buy with confidence.</p>
            <div style={{border:`2px solid ${B}`,borderRadius:12,overflow:"hidden"}}>
              <div style={{background:N,padding:"9px 14px"}}><span style={{fontSize:10,color:"#93C5FD",fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Sample Report Preview</span></div>
              <div style={{padding:14}}>
                {["Your Home Price Range","Monthly Payment Breakdown","Best Cities for You","Recommended Neighborhoods","Affordability & Savings Plan","Next Steps & Timeline"].map(item=>(
                  <div key={item} style={{fontSize:12,color:GR,marginBottom:5,fontWeight:600}}>✓ {item}</div>
                ))}
              </div>
            </div>
            <button onClick={goQuiz} style={{width:"100%",marginTop:12,padding:13,background:B,color:W,border:"none",borderRadius:10,fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"'Montserrat',sans-serif"}}>✨ Get My Free Home Plan</button>
          </div>
        </div>
      </section>

      <footer style={{background:N,color:"rgba(255,255,255,0.55)",padding:"24px 40px",textAlign:"center",fontSize:11,lineHeight:1.8}}>
        <div style={{fontWeight:800,color:W,fontSize:14,marginBottom:4,fontFamily:"'Montserrat',sans-serif"}}>SoCalHomePlan.com</div>
        <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,marginBottom:6}}>📞 951-212-6116</div>
        Licensed California Real Estate Agent · CA DRE #[Your License] · Serving Riverside County, San Bernardino County & surrounding areas<br/>
        This website provides informational planning tools only. Not a mortgage pre-approval. All estimates are for planning purposes only.<br/>
        © 2025 SoCalHomePlan.com
      </footer>
    </div>
  );
}
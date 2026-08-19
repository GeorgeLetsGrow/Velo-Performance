'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import s from './NevinsPitching.module.css';

const iso=d=>d.toISOString().slice(0,10);
const label=d=>new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric'}).format(new Date(`${d}T12:00:00`));

export default function NevinsPitching(){
  const [date,setDate]=useState(''),[avail,setAvail]=useState(null),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
  const [form,setForm]=useState({athlete:'',age:'',parent:'',contact:'',smsOptIn:false});
  const dates=useMemo(()=>{const out=[],today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York'}).format(new Date()),d=new Date(`${today}T12:00:00Z`);while(out.length<10){const day=d.getUTCDay();if(day===3||day===4)out.push(iso(d));d.setUTCDate(d.getUTCDate()+1)}return out},[]);
  useEffect(()=>{fetch(`/.netlify/functions/get-availability?from=${dates[0]}&to=${dates.at(-1)}`).then(r=>r.ok?r.json():Promise.reject()).then(setAvail).catch(()=>setAvail('error'))},[dates]);
  const left=d=>!avail||avail==='error'?null:Math.max(0,avail.capacity-(avail.taken?.[d]||0));
  const field=(key,name,type='text')=><label className={s.field}><span>{name}</span><input type={type} required value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>;
  async function submit(e){e.preventDefault();if(!date||busy)return;setBusy(true);setNotice('');try{const r=await fetch('/.netlify/functions/nevins-pitching-checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({date,...form})});const d=await r.json().catch(()=>({}));if(r.ok&&d.url){location.assign(d.url);return}setNotice(r.status===409?'That clinic just filled up. Please choose another date.':'We couldn’t start checkout. Please try again.')}catch{setNotice('We couldn’t start checkout. Please try again.')}setBusy(false)}
  return <main className={s.page}>
    <header className={s.header}><Link href="/"><img src="/assets/velo-logo-transparent.png" alt="Velo Performance Lab"/></Link><Link href="/">← Home</Link></header>
    <section className={s.hero}><div><p className={s.kicker}>Wednesdays &amp; Thursdays · 6:00–7:00 PM</p><h1>Nevin's <em>Pitching</em></h1><p className={s.lead}>Pitch with purpose.</p><div className={s.facts}><strong>$20<small>per player</small></strong><span>Former White Sox pitcher</span><span>Limited spots</span></div><a className={s.cta} href="#reserve">Reserve a spot ↓</a></div><div className={s.image}><img src="/assets/pitching-clinic.jpg" alt="Nevin Griffith pitching clinic flyer"/></div></section>
    <section className={s.skills}>{['Accuracy','Velocity','Mechanics'].map(x=><span key={x}>{x}</span>)}</section>
    <section id="reserve" className={s.reserve}><div className={s.intro}><p className={s.kicker}>Choose your clinic</p><h2>Develop your<br/>complete delivery.</h2><p>Train with former White Sox pitcher Nevin Griffith in a focused small-group session designed to improve command, build velocity, and sharpen pitching mechanics.</p></div>
      <form className={s.form} onSubmit={submit}><fieldset><legend>1 · Select a date</legend><div className={s.dates}>{dates.map(d=>{const n=left(d),full=n===0;return <label key={d} className={`${s.date} ${date===d?s.selected:''} ${full?s.full:''}`}><input type="radio" name="date" disabled={full} checked={date===d} onChange={()=>setDate(d)}/><strong>{label(d)}</strong><small>{full?'Full':n==null?'6:00–7:00 PM':`${n} spots left`}</small></label>})}</div></fieldset>
        <fieldset><legend>2 · Player details</legend><div className={s.grid}>{field('athlete','Athlete name')}{field('age','Age','number')}{field('parent','Parent / guardian')}<div className={s.wide}>{field('contact','Email or phone')}</div></div><label className={s.check}><input type="checkbox" checked={form.smsOptIn} onChange={e=>setForm({...form,smsOptIn:e.target.checked})}/>I agree to receive text messages about my booking. Message and data rates may apply. Reply STOP to opt out.</label></fieldset>
        {notice&&<p className={s.notice} role="alert">{notice}</p>}<button className={s.pay} disabled={!date||busy}>{busy?'Opening secure checkout…':`Reserve for $20${date?` · ${label(date)}`:''} →`}</button><p className={s.fine}>Secure payment via Stripe. One player per reservation.</p>
      </form></section>
  </main>
}

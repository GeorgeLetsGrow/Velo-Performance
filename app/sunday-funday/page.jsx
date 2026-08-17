'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import s from './SundayFunday.module.css';

const DATES=['2026-08-09','2026-08-16','2026-08-23','2026-09-06','2026-09-20','2026-10-04','2026-10-25','2026-11-01','2026-11-08','2026-11-22','2026-12-20'];
const label=d=>new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(d+'T00:00:00Z'));

export default function SundayFunday(){
  const [date,setDate]=useState(''),[avail,setAvail]=useState(null),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
  const [form,setForm]=useState({athlete:'',age:'',sport:'Baseball',parent:'',contact:'',smsOptIn:false});
  const open=useMemo(()=>{const now=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York'}).format(new Date());return DATES.filter(d=>d>=now)},[]);
  useEffect(()=>{if(!open.length)return;fetch(`/.netlify/functions/get-availability?from=${open[0]}&to=${open.at(-1)}`).then(r=>r.ok?r.json():Promise.reject()).then(setAvail).catch(()=>setAvail('error'))},[open]);
  const left=d=>!avail||avail==='error'?null:Math.max(0,avail.capacity-(avail.taken?.[d]||0));
  const field=(key,name,type='text')=><label className={s.field}><span>{name}</span><input type={type} required value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>;
  async function submit(e){e.preventDefault();if(!date||busy)return;setBusy(true);setNotice('');try{const r=await fetch('/.netlify/functions/sunday-checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({date,...form})});const d=await r.json().catch(()=>({}));if(r.ok&&d.url){location.assign(d.url);return}setNotice(r.status===409?'That camp just filled up. Please choose another Sunday.':'We couldn’t start checkout. Please try again.')}catch{setNotice('We couldn’t start checkout. Please try again.')}setBusy(false)}
  return <main className={s.page}>
    <header className={s.header}><Link href="/"><img src="/assets/velo-logo-transparent.png" alt="Velo Performance Lab"/></Link><Link href="/">← Home</Link></header>
    <section className={s.hero}><div><p className={s.kicker}>Select Sundays · Fall 2026</p><h1>Sunday <em>Funday</em></h1><p className={s.lead}>Small group camps. Big results.</p><div className={s.facts}><strong>$30<small>per player</small></strong><span>9:00–11:00 AM</span><span>Limited spots</span></div><a className={s.cta} href="#reserve">Reserve a spot ↓</a></div><div className={s.image}><img src="/assets/sunday-funday.jpg" alt="Young baseball player fielding a ground ball"/></div></section>
    <section className={s.skills}>{['Hit','Field','Throw','Compete'].map(x=><span key={x}>{x}</span>)}</section>
    <section id="reserve" className={s.reserve}><div className={s.intro}><p className={s.kicker}>Choose your camp</p><h2>Train different.<br/>Train smarter.</h2><p>Pick any available Sunday. Each two-hour camp gives baseball and softball athletes intentional reps, coaching, and competition in a small-group setting.</p></div>
      <form className={s.form} onSubmit={submit}><fieldset><legend>1 · Select a Sunday</legend><div className={s.dates}>{open.map(d=>{const n=left(d),full=n===0;return <label key={d} className={`${s.date} ${date===d?s.selected:''} ${full?s.full:''}`}><input type="radio" name="date" disabled={full} checked={date===d} onChange={()=>setDate(d)}/><strong>{label(d)}</strong><small>{full?'Full':n==null?'9:00–11:00 AM':`${n} spots left`}</small></label>})}</div></fieldset>
        <fieldset><legend>2 · Player details</legend><div className={s.grid}>{field('athlete','Athlete name')}{field('age','Age','number')}<label className={s.field}><span>Sport</span><select value={form.sport} onChange={e=>setForm({...form,sport:e.target.value})}><option>Baseball</option><option>Softball</option></select></label>{field('parent','Parent / guardian')}<div className={s.wide}>{field('contact','Email or phone')}</div></div><label className={s.check}><input type="checkbox" checked={form.smsOptIn} onChange={e=>setForm({...form,smsOptIn:e.target.checked})}/>I agree to receive text messages about my booking. Message and data rates may apply. Reply STOP to opt out.</label></fieldset>
        {notice&&<p className={s.notice} role="alert">{notice}</p>}<button className={s.pay} disabled={!date||busy}>{busy?'Opening secure checkout…':`Reserve for $30${date?` · ${label(date)}`:''} →`}</button><p className={s.fine}>Secure payment via Stripe. One player per reservation.</p>
      </form></section>
  </main>
}

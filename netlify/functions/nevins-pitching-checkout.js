const {sb}=require('../../lib/db');
const HOLD_MINUTES=35;
const json=(statusCode,obj)=>({statusCode,headers:{'Content-Type':'application/json'},body:JSON.stringify(obj)});
const validClinicDate=value=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(`${value}T12:00:00Z`),day=d.getUTCDay();return !Number.isNaN(d.valueOf())&&(day===3||day===4)};
const day=d=>new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(`${d}T12:00:00Z`));

exports.handler=async event=>{
  if(event.httpMethod!=='POST')return json(405,{error:'method_not_allowed'});
  if(!process.env.STRIPE_SECRET_KEY)return json(503,{error:'payments_not_configured'});
  let input;try{input=JSON.parse(event.body||'{}')}catch{return json(400,{error:'bad_json'})}
  const date=String(input.date||''),athlete=String(input.athlete||'').trim(),contact=String(input.contact||'').trim();
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York'}).format(new Date());
  if(!validClinicDate(date)||date<today)return json(400,{error:'bad_date'});
  if(!athlete||!contact)return json(400,{error:'missing_fields'});
  try{
    await sb(`/bookings?status=eq.hold&hold_expires_at=lt.${new Date().toISOString()}`,{method:'DELETE'});
    const hold=await sb('/bookings',{method:'POST',prefer:'return=representation',body:{kind:'pass',item_id:'nevins-pitching',item_name:"Nevin's Pitching Clinic",price_cents:2000,athlete_name:athlete,athlete_age:String(input.age||'').trim()||null,sport:'Baseball',parent_name:String(input.parent||'').trim()||null,contact,sms_opt_in:input.smsOptIn===true,status:'hold',hold_expires_at:new Date(Date.now()+HOLD_MINUTES*60000).toISOString()}});
    if(hold.status===409)return json(409,{error:'full'});
    if(!hold.ok||!hold.data?.[0])return json(502,{error:'db'});
    const booking=hold.data[0],days=await sb('/booking_days',{method:'POST',body:[{booking_id:booking.id,session_date:date}]});
    if(!days.ok){await sb(`/bookings?id=eq.${booking.id}&status=eq.hold`,{method:'DELETE'});return json(days.status===409?409:502,{error:days.status===409?'full':'db'})}
    const origin=process.env.URL||`https://${event.headers.host}`,when=`${day(date)} · 6:00–7:00 PM`;
    const params=new URLSearchParams({mode:'payment',allow_promotion_codes:'true',expires_at:String(Math.floor(Date.now()/1000)+1800),'line_items[0][quantity]':'1','line_items[0][price_data][currency]':'usd','line_items[0][price_data][unit_amount]':'2000','line_items[0][price_data][product_data][name]':`Nevin's Pitching Clinic — ${when}`,'line_items[0][price_data][product_data][description]':`Athlete: ${athlete}`,'success_url':`${origin}/book/?paid=1&sid={CHECKOUT_SESSION_ID}`,'cancel_url':`${origin}/nevins-pitching?cancelled=1&bid=${booking.id}`,'metadata[booking_id]':booking.id,'payment_intent_data[description]':`Nevin's Pitching Clinic (${when}) — ${athlete}`});
    if(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact))params.set('customer_email',contact);
    const r=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:`Bearer ${process.env.STRIPE_SECRET_KEY}`,'Content-Type':'application/x-www-form-urlencoded'},body:params}),session=await r.json();
    if(!r.ok){await sb(`/bookings?id=eq.${booking.id}&status=eq.hold`,{method:'DELETE'});return json(502,{error:'stripe'})}
    await sb(`/bookings?id=eq.${booking.id}`,{method:'PATCH',body:{stripe_session_id:session.id}});
    return json(200,{url:session.url});
  }catch(e){console.error(e);return json(502,{error:'unavailable'})}
};

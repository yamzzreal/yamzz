export default async function handler(req,res){
 const token=process.env.BOT_TOKEN,app=process.env.APP_URL;
 if(!token)return res.status(500).json({error:"BOT_TOKEN belum diset."});
 if(!app)return res.status(500).json({error:"APP_URL belum diset."});
 try{
  const r=await fetch(`https://api.telegram.org/bot${token}/setWebhook`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:`${app}/api/telegram-webhook`})});
  const d=await r.json();return res.status(d.ok?200:500).json(d);
 }catch(e){return res.status(500).json({error:e.message})}
}

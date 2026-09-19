const TELEGRAM_API=`https://api.telegram.org/bot${process.env.BOT_TOKEN}`;
const JSONBIN_URL=`https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}`;
export default async function handler(req,res){
 if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
 try{
  const update=req.body;if(!update.callback_query)return res.status(200).json({ok:true});
  const cb=update.callback_query,parts=cb.data.split(":"),action=parts[0],id=parts[1];
  if(!["approve","reject"].includes(action))return res.status(400).json({error:"Action tidak valid."});
  if(String(cb.from.id)!==String(process.env.ADMIN_TELEGRAM_ID)){await answerCallback(cb.id,"❌ Kamu bukan admin.",true);return res.status(200).json({ok:true})}
  const db=await getDatabase(),item=db.requests.find(x=>x.id===id);
  if(!item){await answerCallback(cb.id,"❌ Data tidak ditemukan.",true);return res.status(200).json({ok:true})}
  item.status=action==="approve"?"approved":"rejected";item.reviewedAt=new Date().toISOString();item.reviewedBy=cb.from.id;
  await saveDatabase(db);
  const status=action==="approve"?"✅ DIKONFIRMASI":"❌ DITOLAK";
  await fetch(`${TELEGRAM_API}/editMessageCaption`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:cb.message.chat.id,message_id:cb.message.message_id,caption:`🔔 PERMINTAAN VERIFIKASI\n\n👤 User:\n${item.username}\n\n🆔 ID:\n${item.id}\n\nStatus:\n${status}\n\n🕐 Diproses:\n${new Date().toLocaleString("id-ID",{timeZone:"Asia/Jakarta"})}`,reply_markup:{inline_keyboard:[]}})});
  await answerCallback(cb.id,status,false);return res.status(200).json({ok:true});
 }catch(e){console.error(e);return res.status(500).json({error:"Webhook error"})}
}
async function answerCallback(id,text,alert){await fetch(`${TELEGRAM_API}/answerCallbackQuery`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({callback_query_id:id,text,show_alert:alert})})}
async function getDatabase(){const r=await fetch(JSONBIN_URL+"/latest",{headers:{"X-Master-Key":process.env.JSONBIN_MASTER_KEY}});const d=await r.json();return d.record||{requests:[]}}
async function saveDatabase(data){await fetch(JSONBIN_URL,{method:"PUT",headers:{"Content-Type":"application/json","X-Master-Key":process.env.JSONBIN_MASTER_KEY},body:JSON.stringify(data)})}

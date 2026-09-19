const TELEGRAM_API=`https://api.telegram.org/bot${process.env.BOT_TOKEN}`;
const JSONBIN_URL=`https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}`;
export default async function handler(req,res){
 if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
 try{
  const {sessionId,username,image}=req.body||{};
  if(!sessionId||!username||!image)return res.status(400).json({error:"Data tidak lengkap."});
  if(typeof image!=="string"||!image.startsWith("data:image/"))return res.status(400).json({error:"Format gambar tidak valid."});
  const db=await getDatabase();
  if(db.requests.find(x=>x.id===sessionId))return res.status(409).json({error:"Bukti untuk sesi ini sudah pernah dikirim."});
  db.requests.push({id:sessionId,username,status:"pending",createdAt:new Date().toISOString()});
  await saveDatabase(db);
  const base64=image.split(",")[1],buffer=Buffer.from(base64,"base64");
  const form=new FormData();
  form.append("chat_id",process.env.ADMIN_CHAT_ID);
  form.append("photo",new Blob([buffer],{type:"image/jpeg"}),"proof.jpg");
  form.append("caption",`🔔 PERMINTAAN VERIFIKASI\n\n👤 User:\n${username}\n\n🆔 ID:\n${sessionId}\n\n📅 Waktu:\n${new Date().toLocaleString("id-ID",{timeZone:"Asia/Jakarta"})}\n\nStatus:\n⏳ MENUNGGU KONFIRMASI`);
  form.append("reply_markup",JSON.stringify({inline_keyboard:[[{text:"✅ KONFIRMASI",callback_data:`approve:${sessionId}`}],[{text:"❌ TOLAK",callback_data:`reject:${sessionId}`}]]}));
  const tg=await fetch(`${TELEGRAM_API}/sendPhoto`,{method:"POST",body:form}),data=await tg.json();
  if(!data.ok)return res.status(500).json({error:"Gagal mengirim bukti ke Telegram."});
  return res.status(200).json({success:true,status:"pending"});
 }catch(e){console.error(e);return res.status(500).json({error:"Terjadi kesalahan server."})}
}
async function getDatabase(){const r=await fetch(JSONBIN_URL+"/latest",{headers:{"X-Master-Key":process.env.JSONBIN_MASTER_KEY}});if(!r.ok)throw new Error("Gagal membaca database.");const d=await r.json();return d.record||{requests:[]}}
async function saveDatabase(data){const r=await fetch(JSONBIN_URL,{method:"PUT",headers:{"Content-Type":"application/json","X-Master-Key":process.env.JSONBIN_MASTER_KEY},body:JSON.stringify(data)});if(!r.ok)throw new Error("Gagal menyimpan database.")}

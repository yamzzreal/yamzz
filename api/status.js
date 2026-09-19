const JSONBIN_URL=`https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}`;
export default async function handler(req,res){
 if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});
 try{
  const id=req.query.id;if(!id)return res.status(400).json({error:"ID tidak ada."});
  const r=await fetch(JSONBIN_URL+"/latest",{headers:{"X-Master-Key":process.env.JSONBIN_MASTER_KEY}});
  if(!r.ok)throw new Error("Database error");
  const d=await r.json(),db=d.record||{requests:[]},item=db.requests.find(x=>x.id===id);
  if(!item)return res.status(404).json({status:"not_found"});
  return res.status(200).json({status:item.status});
 }catch(e){return res.status(500).json({error:"Gagal mengecek status."})}
}

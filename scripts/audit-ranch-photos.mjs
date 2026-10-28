// Temporary preview-only source audit. Never run from the browser.
const domain = "https://jds-horse-ranch-v1751084549.websitepro-cdn.com/wp-content/uploads/2020/09/";
const url = "https://jdshorseranch.com/";
const fetchSafe = async (u, method="GET") => {
  try {
    const res = await fetch(u,{method,signal:AbortSignal.timeout(13000),redirect:"follow",headers:{"user-agent":"JD-Ranch-photo-audit/1.0"}});
    return {res,code:res.status,contentType:res.headers.get("content-type"),length:res.headers.get("content-length")};
  } catch(e) {return {code:0,error:String(e).slice(0,150)};}
};
console.log("RANCH_PHOTO_AUDIT_BEGIN");
const home=await fetchSafe(url);
console.log("RANCH_OFFICIAL_HOME",JSON.stringify({status:home.code,type:home.contentType}));
if(home.res?.ok){
 const html=await home.res.text();
 const raw=[...html.matchAll(/(?:src|data-src|href|srcset|data-bg|url\()\s*[=:]\s*["']?([^"'>\s)]+(?:jpg|jpeg|png|webp)(?:\?[^"'>\s)]*)?)/gi)].map(m=>m[1]);
 const all=[...new Set(raw.map(x=>{try{return new URL(x,url).href.replace(/&amp;/g,"&")}catch{return ""}}).filter(Boolean))];
 console.log("RANCH_OFFICIAL_IMAGE_URL_COUNT",all.length);
 all.slice(0,35).forEach(x=>console.log("RANCH_OFFICIAL_IMAGE",x.slice(0,280)));
}
const imageUrls=Array.from({length:10},(_,i)=>domain+"image"+i+".jpeg");
const tested=await Promise.all(imageUrls.map(async (url)=>{
 const result=await fetchSafe(url,"HEAD");
 return {url:url.split("/").pop(),status:result.code,type:result.contentType,bytes:result.length,error:result.error||null};
}));
console.log("RANCH_ORIGINAL_IMAGES",JSON.stringify(tested));
console.log("RANCH_PHOTO_AUDIT_END");

const liveUrls=Array.from({length:10},(_,i)=>"https://jdshorseranch.com/wp-content/uploads/2020/09/image"+i+".jpeg");
const liveResults=await Promise.all(liveUrls.map(async url=>{
 const result=await fetchSafe(url,"HEAD");
 return {file:url.split("/").pop(),status:result.code,type:result.contentType,length:result.length,error:result.error||null};
}));
console.log("RANCH_LIVE_IMAGES",JSON.stringify(liveResults));

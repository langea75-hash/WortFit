// WortFit 2.3 - verbesserte Wikimedia-Bildsuche

const BLOCKED = [
 "painting","artwork","drawing","illustration","museum",
 "sketch","engraving","oil","watercolor","gemälde","kunst"
];

async function loadCommonsImage(card){
  image.removeAttribute("src");
  imageLoading.classList.remove("hidden");

  try{
    const url=new URL("https://commons.wikimedia.org/w/api.php");
    url.searchParams.set("origin","*");
    url.searchParams.set("action","query");
    url.searchParams.set("generator","search");
    url.searchParams.set("gsrsearch",'"'+card.word+'" file');
    url.searchParams.set("gsrnamespace","6");
    url.searchParams.set("gsrlimit","30");
    url.searchParams.set("prop","imageinfo");
    url.searchParams.set("iiprop","url|extmetadata");
    url.searchParams.set("iiurlwidth","800");
    url.searchParams.set("format","json");

    const res=await fetch(url);
    const json=await res.json();
    const pages=Object.values(json.query?.pages||{});

    let best=null;

    for(const p of pages){
      const info=p.imageinfo?.[0];
      if(!info) continue;

      const text=((p.title||"")+" "+
        (info.extmetadata?.ImageDescription?.value||"")+" "+
        (info.extmetadata?.Categories?.value||"")).toLowerCase();

      if(BLOCKED.some(x=>text.includes(x))) continue;

      if(text.includes(card.word.toLowerCase())){
        best=info;
        break;
      }
    }

    if(!best) throw new Error();

    image.src=best.thumburl||best.url;
    imageLoading.classList.add("hidden");

  }catch(e){
    showFallbackImage(card.word);
  }
}

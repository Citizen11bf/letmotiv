const nav=document.querySelector('.nav'),burger=document.querySelector('.burger');burger&&burger.addEventListener('click',()=>nav.classList.toggle('open'));
const fmt=n=>new Intl.NumberFormat('fr-FR').format(Math.round(n));
function calc(){const people=+document.querySelector('#people')?.value||0;const hours=+document.querySelector('#hours')?.value||0;const week=people*hours;const year=week*44;const rate=33.5;const cost=year*rate;const save=cost/2;const roi=(save-5000)/5000*100;['week','year','cost','save','roi'].forEach(id=>{const el=document.getElementById(id);if(!el)return;if(id==='week')el.textContent=fmt(week)+' h';if(id==='year')el.textContent=fmt(year)+' h';if(id==='cost')el.textContent=fmt(cost)+' € / an';if(id==='save')el.textContent=fmt(save)+' € / an';if(id==='roi')el.textContent='+'+fmt(roi)+' %';});}
function revealRoi(){calc();const result=document.querySelector('.result');const roiBox=document.querySelector('.roi');if(!result||!roiBox)return;result.classList.remove('revealed');result.querySelectorAll('.message').forEach(m=>m.classList.remove('show'));roiBox.classList.remove('roiOpen');void result.offsetWidth;roiBox.classList.add('roiOpen');setTimeout(()=>{result.classList.add('revealed');const messages=[...result.querySelectorAll('.message')];messages.forEach((m,i)=>setTimeout(()=>m.classList.add('show'),i*500));if(matchMedia('(max-width:900px)').matches){setTimeout(()=>result.scrollIntoView({behavior:'smooth',block:'start'}),280)}},260)}
document.querySelector('#calc')?.addEventListener('click',revealRoi);calc();
document.querySelectorAll('.logos img').forEach(img=>img.addEventListener('click',()=>{img.classList.toggle('active'); const track=img.closest('.logosTrack'); if(track){track.style.animationPlayState=img.classList.contains('active')?'paused':'running';}}));

// Correctifs v4 : expansion des témoignages
document.querySelectorAll('.testiMore').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();const card=btn.closest('.testiCard');if(!card)return;card.classList.toggle('open');btn.setAttribute('aria-expanded',card.classList.contains('open')?'true':'false');}));


// Correctifs v7 : logos clients automatiques (Logo_*.webp)
async function loadClientLogos(){
  const section=document.querySelector('.logos[data-auto-logos]');
  if(!section) return;
  const track=section.querySelector('.logosTrack');
  if(!track) return;
  const fallback=(section.dataset.fallbackLogos||'').split(',').map(s=>s.trim()).filter(Boolean);
  let logos=[];
  const repo=section.dataset.githubRepo;
  const ref=section.dataset.githubRef || 'main';
  const apiPath=section.dataset.githubPath || '';
  if(repo){
    const candidates=[
      `https://api.github.com/repos/${repo}/contents/${apiPath}?ref=${ref}`,
      `https://api.github.com/repos/${repo}/contents/images?ref=main`,
      `https://api.github.com/repos/${repo}/contents/images?ref=${ref}`
    ];
    for(const url of candidates){
      try{
        const res=await fetch(url,{headers:{'Accept':'application/vnd.github+json'}});
        if(!res.ok) continue;
        const data=await res.json();
        if(Array.isArray(data)){
          logos=data.map(f=>f.name).filter(name=>/^Logo_.+\.webp$/i.test(name));
          if(logos.length) break;
        }
      }catch(e){}
    }
  }
  if(!logos.length) logos=fallback;
  logos=[...new Set(logos)].sort((a,b)=>a.localeCompare(b,'fr'));
  if(!logos.length) return;
  const repeated=[...logos,...logos];
  track.innerHTML='';
  repeated.forEach(name=>{
    const img=document.createElement('img');
    img.src=`images/${name}`;
    img.alt=name.replace(/^Logo_/,'').replace(/\.webp$/i,'').replace(/_/g,' ');
    img.loading='lazy';
    img.addEventListener('click',()=>{img.classList.toggle('active');track.style.animationPlayState=img.classList.contains('active')?'paused':'running';});
    track.appendChild(img);
  });
}
loadClientLogos();

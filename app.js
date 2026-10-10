'use strict';
let data, dataset='cohorts', visible=[];
const $=id=>document.getElementById(id);
const fmt=n=>new Intl.NumberFormat('en').format(n);
const sum=(rows,key)=>rows.reduce((n,row)=>n+row[key],0);
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateLabel=(value,day=false)=>new Date(value+(value.length===7?'-01':'')+'T12:00:00Z').toLocaleDateString('en-GB',{month:'short',year:'numeric',...(day?{day:'numeric'}:{}),timeZone:'UTC'});
const periodRows=(rows,key)=>rows.filter(r=>$('year').value==='all'||r[key].startsWith($('year').value));
function chart(rows,key,labelKey,color,container,labels){
 const W=530,H=205,L=32,R=12,T=15,B=35,max=Math.max(...rows.map(r=>r[key]),1),top=Math.ceil(max/10)*10;
 if(!rows.length){$(container).innerHTML='<p class="chart-note">No records for this period.</p>';return;}
 const width=W-L-R,height=H-T-B,step=width/rows.length;
 let svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+escapeHTML(labels)+'"><title>'+escapeHTML(labels)+'</title>';
 for(let i=0;i<=4;i++){let y=T+height*i/4;svg+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'" stroke="#283441" stroke-dasharray="3 4"/><text x="'+(L-8)+'" y="'+(y+3)+'" text-anchor="end">'+Math.round(top*(1-i/4))+'</text>';}
 rows.forEach((r,i)=>{let h=height*r[key]/top,x=L+step*i+step*.2,y=T+height-h;let label=r[labelKey];svg+='<g><rect x="'+x+'" y="'+y+'" width="'+step*.6+'" height="'+h+'" rx="3" fill="'+color+'"><title>'+escapeHTML(label)+': '+r[key]+'</title></rect>';if(rows.length<10||i%2===0||i===rows.length-1)svg+='<text x="'+(L+step*i+step*.5)+'" y="'+(H-15)+'" text-anchor="middle">'+escapeHTML(label)+'</text>';svg+='</g>';});
 $(container).innerHTML=svg+'</svg>';
}
function overview(){
 let cohorts=periodRows(data.cohorts,'month'),meetups=periodRows(data.meetups,'date');
 $('grad-total').textContent=fmt(sum(cohorts,'graduates'));$('cohort-total').textContent='Across '+cohorts.length+' cohorts';
 $('attendance-total').textContent=fmt(sum(meetups,'attendance'));$('event-total').textContent='Across '+meetups.length+' events';
 chart(cohorts.map(r=>({...r,label:'#'+r.cohort})),'graduates','label','#fa9814','cohort-chart','Graduates per cohort for the selected period');
 let months={};meetups.forEach(r=>{const m=r.date.slice(0,7);months[m]=(months[m]||0)+r.attendance;});
 chart(Object.entries(months).map(([month,attendance])=>({attendance,label:new Date(month+'-01T12:00:00Z').toLocaleDateString('en-GB',{month:'short',year:'2-digit',timeZone:'UTC'})})),'attendance','label','#04b4e7','meetup-chart','Monthly meetup attendance visits for the selected period');
 let areas=['Livingstone','Mukuni Village'];$('education-note').textContent=areas.map(a=>a+': '+sum(cohorts.filter(r=>r.area===a),'graduates')+' graduates').join(' · ');
}
function render(){
 if(!data)return;
 const query=$('search').value.trim().toLowerCase();
 let rows=dataset==='cohorts'?periodRows(data.cohorts,'month'):dataset==='meetups'?periodRows(data.meetups,'date'):data.merchants;
 if(dataset==='cohorts'&&$('area').value!=='all')rows=rows.filter(r=>r.area===$('area').value);
 visible=rows.filter(r=>Object.values(r).join(' ').toLowerCase().includes(query));
 $('area-label').hidden=dataset!=='cohorts';
 const columns=dataset==='cohorts'?['Cohort','Graduates','Month & year','Area']:dataset==='meetups'?['Date','Attendance visits','Theme','Venue']:['Merchant','Location','Source'];
 $('table-head').innerHTML='<tr>'+columns.map(c=>'<th scope="col">'+c+'</th>').join('')+'</tr>';
 $('table-caption').textContent=dataset==='cohorts'?'Education cohort records':dataset==='meetups'?'Meetup event records':'Latest-added merchant sample from BTC Map';
 $('table-body').innerHTML=visible.length?visible.map(r=>{
 if(dataset==='cohorts')return '<tr><td>Cohort '+r.cohort+'</td><td><strong>'+r.graduates+'</strong></td><td>'+dateLabel(r.month)+'</td><td><span class="pill">'+escapeHTML(r.area)+'</span></td></tr>';
 if(dataset==='meetups')return '<tr><td>'+dateLabel(r.date,true)+'</td><td><strong>'+r.attendance+'</strong></td><td class="theme">'+escapeHTML(r.theme)+'</td><td>'+escapeHTML(r.venue)+'</td></tr>';
 return '<tr><td>'+escapeHTML(r.name)+'</td><td class="theme">'+escapeHTML(r.address)+'</td><td><a href="https://btcmap.org/merchant/'+r.id+'" target="_blank" rel="noopener">View on BTC Map ↗</a></td></tr>';
 }).join(''):'<tr><td class="empty" colspan="'+columns.length+'">No matching records. Try another search or reset the filters.</td></tr>';
 let total=dataset==='cohorts'?fmt(sum(visible,'graduates'))+' graduates':dataset==='meetups'?fmt(sum(visible,'attendance'))+' attendance visits':'latest-added sample';
 $('results').textContent=visible.length+' records · '+total;
 $('dataset-note').textContent=dataset==='merchants'?'6 sampled listings / 124 mapped locations · period filter does not apply':'Community records · through June 2026';
 $('export').disabled=!visible.length;
}
function selectDataset(name){
 dataset=name;document.querySelectorAll('[data-dataset]').forEach(b=>{let selected=b.dataset.dataset===name;b.classList.toggle('selected',selected);b.setAttribute('aria-selected',selected);b.tabIndex=selected?0:-1;});
 $('data-view').setAttribute('aria-labelledby','tab-'+name);$('search').value='';$('area').value='all';render();
}
function exportCSV(){
 const fields=dataset==='cohorts'?['cohort','graduates','month','area']:dataset==='meetups'?['date','attendance','theme','venue']:['name','address','id'];
 const cell=v=>'"'+String(v).replace(/"/g,'""')+'"';
 const csv='\uFEFF'+[fields.join(','),...visible.map(r=>fields.map(f=>cell(r[f])).join(','))].join('\r\n');
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
 const a=document.createElement('a');a.href=url;a.download='bitcoin-victoria-falls-'+dataset+'-'+$('year').value+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
fetch('data.json').then(r=>{if(!r.ok)throw new Error('Data unavailable');return r.json();}).then(d=>{
 data=d;overview();render();
 $('year').addEventListener('change',()=>{overview();render();});
 $('search').addEventListener('input',render);$('area').addEventListener('change',render);
 $('reset').addEventListener('click',()=>{$('year').value='all';$('area').value='all';$('search').value='';overview();render();});
 document.querySelectorAll('[data-dataset]').forEach(b=>{b.addEventListener('click',()=>selectDataset(b.dataset.dataset));b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();let names=['cohorts','meetups','merchants'],i=names.indexOf(dataset);i=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;selectDataset(names[i]);$('tab-'+names[i]).focus();});});
 $('export').addEventListener('click',exportCSV);
}).catch(()=>{$('load-error').hidden=false;$('export').disabled=true;});
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)document.querySelectorAll('.nav-link').forEach(link=>link.classList.toggle('active',link.getAttribute('href')==='#'+entry.target.id));});},{rootMargin:'-15% 0px -65% 0px'});
document.querySelectorAll('main>section[id]').forEach(section=>observer.observe(section));
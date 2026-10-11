'use strict';
const $ = selector => document.querySelector(selector);
const defaultDataset = () => document.body.dataset.dataset || (location.hash === '#meetups' ? 'meetups' : 'education');
let dataset = defaultDataset(), records = [], data;
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const fmt = (value, month = value.length === 7) => new Date(value + (month ? '-01' : '') + 'T12:00:00').toLocaleDateString('en-GB', month ? {month:'short',year:'numeric'} : {day:'numeric',month:'short',year:'numeric'});
function render() {
  const education = dataset === 'education';
  document.title = (education ? 'Education' : 'Meetups') + ' · Bitcoin Victoria Falls';
  records = (education ? data.cohorts : data.meetups).filter(row =>
    (!$('#year').value || (row.month || row.date).startsWith($('#year').value)) &&
    (!education || !$('#area').value || row.area === $('#area').value) &&
    Object.values(row).join(' ').toLowerCase().includes($('#search').value.toLowerCase())
  );
  const total = records.reduce((sum, row) => sum + (education ? row.graduates : row.attendance), 0);
  $('#record-total').textContent = total.toLocaleString('en-GB');
  $('#total-label').textContent = education ? 'Total graduates' : 'Total attendance';
  for (const selector of ['#meetup-count', '#record-count']) if ($(selector)) $(selector).textContent = records.length;
  if ($('#record-count-label')) $('#record-count-label').textContent = education ? 'Completed cohorts' : 'Meetups since 2025';
  if ($('#records-title')) $('#records-title').textContent = education ? 'Education' : 'Meetups';
  if ($('#attendance-note')) $('#attendance-note').hidden = education;
  const chartTitle = (education ? 'Graduates' : 'Attendance') + ' by year';
  if ($('#chart-title')) $('#chart-title').textContent = chartTitle;
  $('#chart').setAttribute('aria-label', chartTitle);
  $('#result-count').textContent = records.length + ' ' + (education ? 'cohorts' : 'meetups') + ' shown';
  const headers = education ? ['Cohort','Graduated','Area','Venue','Graduates'] : ['Date','Event','Venue','Attendance'];
  $('#table-head').innerHTML = '<tr>' + headers.map(title => '<th scope="col">' + title + '</th>').join('') + '</tr>';
  $('#table-body').innerHTML = records.length ? records.slice().reverse().map(row => {
    const cells = education ? ['#'+row.cohort, fmt(row.month,true), row.area, row.venue || '—', row.graduates] : [fmt(row.date), row.theme, row.venue, row.attendance];
    return '<tr>' + cells.map((cell,index) => '<td data-label="' + headers[index] + '">' + esc(cell) + '</td>').join('') + '</tr>';
  }).join('') : '<tr><td colspan="' + headers.length + '">No matching records.</td></tr>';
  const years = [...new Set(records.map(row => (row.month || row.date).slice(0,4)))].sort();
  const totals = years.map(year => records.filter(row => (row.month || row.date).startsWith(year)).reduce((sum,row) => sum + (education ? row.graduates : row.attendance),0));
  $('#chart').innerHTML = years.map((year,index) => '<div class="bar"><b>'+totals[index]+'</b><i style="height:'+Math.max(2,totals[index]/Math.max(...totals)*80)+'px"></i><span>'+year+'</span></div>').join('');
}
function download(text, name, type) {
  const url = URL.createObjectURL(new Blob([text],{type}));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url),1000);
}
function selectDataset(id) {
  dataset = id;
  $('#education')?.setAttribute('aria-pressed', id === 'education');
  $('#meetups')?.setAttribute('aria-pressed', id === 'meetups');
  $('#area-label').hidden = id === 'meetups';
  $('#year').value = ''; $('#area').value = ''; $('#search').value = '';
  if (data) render();
}
if (document.body.dataset.page === '1') {
  window.addEventListener('hashchange', () => selectDataset(defaultDataset()));
  fetch('data.json?v=20261011-refined-2',{cache:'no-store'}).then(response => {
    if (!response.ok) throw Error('Data unavailable');
    return response.json();
  }).then(result => { data = result; selectDataset(defaultDataset()); }).catch(() => {
    $('#load-status').textContent = 'Records could not load. Please reload the page.';
  });
  ['year','area','search'].forEach(id => $('#'+id).addEventListener(id === 'search' ? 'input' : 'change', () => { if (data) render(); }));
  ['education','meetups'].forEach(id => $('#'+id)?.addEventListener('click', () => { location.hash = id; selectDataset(id); }));
  $('#export').addEventListener('click', () => {
    if (!data) return;
    const keys = dataset === 'education' ? ['cohort','month','area','venue','graduates'] : ['date','theme','venue','attendance'];
    const cell = value => '"'+String(value ?? '').replace(/"/g,'""')+'"';
    download([keys,...records.map(row => keys.map(key => row[key] ?? ''))].map(row => row.map(cell).join(',')).join('\r\n'),dataset+'.csv','text/csv;charset=utf-8');
  });
}
if (document.body.dataset.page === '2') {
  let month = 9, year = 2026;
  function calendar() {
    const title = new Date(year,month,1).toLocaleDateString('en-GB',{month:'long',year:'numeric'});
    $('#month-title').textContent = title;
    $('#calendar').setAttribute('aria-label',title+' calendar');
    let html = '<span></span>'.repeat((new Date(year,month,1).getDay()+6)%7);
    for (let day=1; day<=new Date(year,month+1,0).getDate(); day++) {
      const event = year===2026 && month===9 && (day===16 || day===17), cohort = day===16 ? 19 : 20;
      html += event ? '<button aria-label="'+day+' October 2026, Cohort '+cohort+' lessons start" aria-pressed="false" data-cohort="'+cohort+'">'+day+'</button>' : '<span style="display:grid;place-items:center">'+day+'</span>';
    }
    $('#calendar').innerHTML = html;
    $('#calendar').querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      $('#calendar').querySelectorAll('button').forEach(other => other.setAttribute('aria-pressed','false'));
      button.setAttribute('aria-pressed','true'); location.hash = 'cohort-'+button.dataset.cohort;
    }));
  }
  $('#prev').onclick = () => { month--; if(month<0){month=11;year--;} calendar(); };
  $('#next').onclick = () => { month++; if(month>11){month=0;year++;} calendar(); };
  $('#reset-month').onclick = () => { year=2026;month=9;calendar(); };
  calendar();
}

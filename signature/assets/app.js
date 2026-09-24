const menu = document.querySelector('.menu-button');
const navigation = document.querySelector('.nav-links');
menu?.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); navigation.classList.toggle('open', open); menu.textContent = open ? 'Sluiten' : 'Menu'; });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu) { menu.setAttribute('aria-expanded', 'false'); navigation.classList.remove('open'); menu.textContent = 'Menu'; } });
const privacyDialog = document.querySelector('#privacy-dialog');
document.querySelectorAll('.privacy').forEach(button => button.addEventListener('click', () => privacyDialog.showModal()));
document.querySelector('.close-dialog')?.addEventListener('click', () => privacyDialog.close());
privacyDialog?.addEventListener('click', e => { if (e.target === privacyDialog) { const r = privacyDialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) privacyDialog.close(); } });
const form = document.querySelector('#quote-form');
const params = new URLSearchParams(location.search);
const service = params.get('dienst');
if (form && service) { const field = form.querySelector('select[name="dienst"]'); if (field && Array.from(field.options).some(o => o.value === service)) field.value = service; form.querySelectorAll('input[name="dienst"]').forEach(input => { input.checked = input.value === service; }); }
let step = 0;
const steps = form ? Array.from(form.querySelectorAll('[data-step]')) : [];
function showStep(index) { step = index; steps.forEach((el, i) => { el.hidden = i !== index; }); document.querySelectorAll('.form-progress span').forEach((el, i) => el.classList.toggle('active', i <= index)); const label = document.querySelector('#step-label'); if (label) label.textContent = `Stap ${index + 1} van 2`; if (index === 1) steps[index].querySelector('input')?.focus(); }
document.querySelector('[data-next]')?.addEventListener('click', () => { const fields = [...steps[0].querySelectorAll('input,select,textarea')]; for (const field of fields) if (!field.reportValidity()) return; showStep(1); });
document.querySelector('[data-back]')?.addEventListener('click', () => showStep(0));
form?.addEventListener('submit', event => {
  event.preventDefault();
  if (steps.length && step === 0) { document.querySelector('[data-next]').click(); return; }
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const body = `Beste Bart,\n\nIk ontvang graag meer informatie over ${data.get('dienst')}.\n\nMijn vraag:\n${data.get('bericht') || 'Graag bespreken we de mogelijkheden.'}\n\nNaam: ${data.get('naam')}\nE-mail: ${data.get('email')}\nTelefoon: ${data.get('telefoon') || 'Niet opgegeven'}\nPostcode / plaats: ${data.get('plaats')}\nGewenste periode: ${data.get('planning') || 'In overleg'}\n\nMet vriendelijke groet,\n${data.get('naam')}`;
  const result = document.querySelector('.form-success');
  result.hidden = false;
  const output = document.querySelector('#request-copy'); output.value = body;
  const mailto = `mailto:info@baverinstallatietechniek.nl?subject=${encodeURIComponent('Aanvraag: ' + data.get('dienst'))}&body=${encodeURIComponent(body)}`;
  document.querySelector('#mail-again').href = mailto;
  window.location.href = mailto;
  result.scrollIntoView({behavior: 'smooth', block:'center'});
});
document.querySelector('#copy-request')?.addEventListener('click', async event => { const output = document.querySelector('#request-copy'); try { await navigator.clipboard.writeText(output.value); event.target.textContent = 'Aanvraag gekopieerd'; } catch { output.focus(); output.select(); event.target.textContent = 'Tekst geselecteerd — kopieer de aanvraag'; } });
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('[data-filter]').forEach(el => el.setAttribute('aria-pressed', String(el === button))); const filter = button.dataset.filter; document.querySelector('.project-grid')?.classList.toggle('is-filtered', filter !== 'all'); let total = 0; document.querySelectorAll('[data-category]').forEach(card => { card.hidden = filter !== 'all' && card.dataset.category !== filter; if (!card.hidden) total++; }); const status = document.querySelector('#filter-status'); if(status) status.textContent = `${total} ${total === 1 ? "project" : "projecten"} getoond`; }));
if (form && document.modelContext?.registerTool) {
  const serviceFields = [...form.querySelectorAll('[name="dienst"]')];
  const available = serviceFields[0]?.tagName === 'SELECT' ? [...serviceFields[0].options].map(o => o.value).filter(Boolean) : serviceFields.map(o => o.value);
  const lifecycle = new AbortController();
  try { Promise.resolve(document.modelContext.registerTool({name:'stage_service_request',title:'Onderwerp voor aanvraag kiezen',description:'Kies het onderwerp in het zichtbare aanvraagformulier. Verstuurt geen bericht en maakt geen afspraak.',inputSchema:{type:'object',properties:{service:{type:'string',enum:available}},required:['service'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input || typeof input.service !== 'string' || !available.includes(input.service)) throw new Error('Kies een geldig onderwerp.');if(serviceFields[0].tagName==='SELECT')serviceFields[0].value=input.service;else serviceFields.forEach(f=>{f.checked=f.value===input.service;});if(steps.length)showStep(0);return {service:input.service,status:'staged',sent:false};}},{signal:lifecycle.signal})).catch(()=>{}); } catch {}
  addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const f = x => +x.toFixed(2), G = ['tests', 'assign', 'quiz', 'tut', 'prac'];
let st = {};
const PH = { 'g-tests': 'Test name', 'g-assign': 'Assignment name', 'g-quiz': 'Quiz name', 'g-tut': 'Tutorial name', 'g-prac': 'Practical name' };
function show(id) { $$('.screen').forEach(e => e.hidden = e.id !== id); scrollTo(0, 0); if (id === 'pred') predict() }
function renum(g) { $$('#' + g + ' .n').forEach((e, i) => e.textContent = i + 1) }
function addRow(g) {
    const d = document.createElement('div'); d.className = 'row';
    d.innerHTML = '<span class="n"></span><input type="text" placeholder="' + PH[g] + '" aria-label="Name"><input type="number" inputmode="decimal" step="any" aria-label="Mark percent"><input type="number" inputmode="decimal" step="any" aria-label="Weight percent"><button class="x" aria-label="Remove row">✕</button>';
    d.querySelector('.x').onclick = () => { d.remove(); renum(g); validate() };
    $('#' + g).appendChild(d); renum(g);
}
function getCw() { const v = $('#cw').value, n = +v; return v !== '' && n >= 1 && n <= 99 ? n : null }
function scan() {
    const r = { items: [], err: {}, tests: 0 };
    G.forEach(k => {
        r.err[k] = 0;
        $$('#g-' + k + ' .row').forEach(row => {
            const mv = row.children[2].value, wv = row.children[3].value; let bad = false;
            if (mv === '' && wv === '') { }
            else if (mv === '' || wv === '') { bad = true }
            else { const m = +mv, w = +wv; if (m < 0 || m > 100 || w <= 0) bad = true; else { r.items.push([m, w]); if (k === 'tests') r.tests++ } }
            row.classList.toggle('bad', bad); if (bad) r.err[k]++;
        });
    });
    return r;
}
function validate() {
    const cw = getCw(), r = scan();
    $('#ew').textContent = cw ? f(100 - cw) + '%' : '—';
    $('#n1').disabled = cw === null;
    $('#n2').disabled = r.tests < 1 || r.err.tests > 0;
    $('#m2').textContent = r.err.tests ? 'Fix the highlighted rows: each needs a mark from 0 to 100 and a weight above 0.' : r.tests < 1 ? 'Add at least one test to continue.' : '';
    $('#m2').className = 'msg' + (r.err.tests ? ' err' : '');
    const sw = r.items.reduce((a, i) => a + i[1], 0), errs = G.reduce((a, k) => a + r.err[k], 0);
    const over = cw !== null && sw > cw + 1e-9;
    $('#calc').disabled = !(cw !== null && r.tests > 0 && !errs && !over);
    $('#m3').textContent = errs ? 'Fix the highlighted rows: each needs a mark from 0 to 100 and a weight above 0.' : over ? 'Total weight (' + f(sw) + ') is more than the class weight (' + cw + '). Check your weights.' : cw !== null ? 'Weight entered: ' + f(sw) + ' of ' + cw : '';
    $('#m3').className = 'msg' + (errs || over ? ' err' : '');
}
function calc() {
    const cw = getCw(), r = scan(); let sw = 0, smw = 0;
    r.items.forEach(([m, w]) => { sw += w; smw += m * w });
    st = { cw, cm: smw / sw, banked: smw / 100, sw };
    $('#rv').textContent = f(st.cm) + '%';
    $('#rb').textContent = 'Banked: ' + f(st.banked) + ' out of ' + cw + ' marks';
    $('#rw').textContent = sw < cw - 1e-9 ? 'Only ' + f(sw) + ' of the ' + cw + ' class weight is entered. The exam prediction counts the rest as 0, so add the remaining marks for an accurate result.' : '';
    show('res');
}
function predict() {
    const cwv = $('#pcw').value, cmv = $('#pcm').value, cw = +cwv, cm = +cmv, sub = $('#psub').value === '' ? 0 : +$('#psub').value;
    const out = $('#pout');
    if (!(cwv !== '' && cw >= 1 && cw <= 99 && cmv !== '' && cm >= 0 && cm <= 100)) { out.innerHTML = '<p class="msg">Enter the class weight (1 to 99) and your class mark (0 to 100) to see the result.</p>'; return }
    const ew = 100 - cw, banked = cm * cw / 100;
    out.innerHTML = [['Pass', $('#ppass').value], ['Distinction', $('#pdist').value]].map(([n, tv]) => {
        const t = +tv; if (tv === '' || t < 0 || t > 100) return '';
        const need = (t - banked) / (ew / 100), req = Math.max(need, sub);
        let big, note = '', cls = '';
        if (req > 100) { big = 'Not possible'; cls = ' no'; note = 'Even 100% in the exam won’t reach ' + f(t) + '%.' }
        else if (need <= 0 && sub === 0) { big = 'Already secured'; note = 'Your class mark alone reaches ' + f(t) + '%.' }
        else { big = f(req) + '%'; note = sub > need ? 'Your sub-minimum of ' + f(sub) + '% applies.' : 'Needed to reach ' + f(t) + '% overall.' }
        return '<div class="out' + cls + '"><span>' + n + ' (' + f(t) + '%)</span><b>' + big + '</b><span class="mute">' + note + '</span></div>';
    }).join('');
}
$$('[data-go]').forEach(b => b.onclick = () => show(b.dataset.go));
$$('[data-add]').forEach(b => b.onclick = () => { addRow(b.dataset.add); validate() });
$('#b-class').onclick = () => show('s1');
$('#b-pred').onclick = () => { ['pcw', 'pcm', 'psub'].forEach(i => $('#' + i).value = ''); show('pred') };
$('#n1').onclick = () => show('s2');
$('#n2').onclick = () => show('s3');
$('#calc').onclick = calc;
$('#to-pred').onclick = () => { $('#pcw').value = st.cw; $('#pcm').value = f(st.banked / st.cw * 100); show('pred') };
document.addEventListener('input', e => { if (e.target.closest('#s1,#s2,#s3')) validate(); if (e.target.closest('#pred')) predict() });
G.forEach(addRow); validate();

document.getElementById('year').textContent = new Date().getFullYear();
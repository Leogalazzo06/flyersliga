// ============================================================
// TABLA DE POSICIONES — Generador de flyers Liga A.F.O.CH
// Se carga ANTES de flyers-liga.js; ese archivo lo inicia con window.tablaLiga.iniciar(api).
//
// Idea: cargás UNA vez los puntos que cada equipo ya tiene ("base") y después, fecha por
// fecha, pegás los resultados. La tabla se recalcula siempre como base + resultados,
// así que corregir un resultado o borrar una fecha nunca descuenta ni suma de más.
//
// Formato de la base (un equipo por renglón; PJ G E P GF GC [PTS]; si falta PTS = 3·G + E):
//   1ra - Zona Sur            <- renglón sin números = título de una tabla
//   Villa Dora 5 3 1 1 10 5 10
// Formato de los resultados (por fecha):
//   1ra - Zona Sur            <- opcional: a qué tabla van (si hay una sola, no hace falta)
//   Villa Dora 2 - 1 Avenida FC
// ============================================================
(() => {
    let api = null;
    let E = null;   // estado de la app (estado.tabla es lo nuestro)

    const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const RE_BASE = /^(.*?)[\s|,;\t]+(-?\d+(?:[\s|,;\t]+-?\d+){5,6})\s*$/;
    const RE_RES1 = /^(.+?)\s+(\d{1,2})\s*[-–:]\s*(\d{1,2})\s+(.+?)$/;      // Local 2 - 1 Visita
    const RE_RES2 = /^(.+?)\s+(\d{1,2})\s+(.+?)\s+(\d{1,2})$/;              // Local 2 Visita 1
    const limpiar = (l) => l.replace(/[*•]/g, '').trim();

    function parseBase(texto) {
        const out = [];
        let cur = null;
        for (const raw of String(texto || '').split(/\r?\n/)) {
            const l = limpiar(raw);
            if (!l || /^-{3,}$/.test(l)) continue;
            const m = l.match(RE_BASE);
            if (m) {
                if (!cur) { cur = { titulo: '', equipos: [] }; out.push(cur); }
                const n = m[2].split(/[\s|,;\t]+/).map(Number);
                const [pj, g, e, p, gf, gc] = n;
                cur.equipos.push({ nombre: m[1].trim(), pj, g, e, p, gf, gc, pts: n.length > 6 ? n[6] : 3 * g + e });
            } else { cur = { titulo: l, equipos: [] }; out.push(cur); }
        }
        return out.filter(t => t.equipos.length);
    }

    // base + resultados -> tablas ordenadas y avisos
    function calcular() {
        const tablas = parseBase(E.tabla.base);
        const avisos = [];
        tablas.forEach(t => {
            t.n = norm(t.titulo);
            t.buscar = api.crearBuscador(t.equipos.map(e => ({ nombre: e.nombre, alias: '' })));
            t.equipos.forEach(e => {
                if (e.pj !== e.g + e.e + e.p) avisos.push(`${e.nombre}: los PJ no coinciden con G + E + P.`);
            });
        });
        // Resultados cargados desde la programación (cada uno ya sabe a qué tabla va)
        Object.values(E.tabla.res).forEach(r => {
            const t = tablas.find(x => x.n === r.t);
            const A = t && t.buscar(r.l), B = t && t.buscar(r.v);
            if (!A || !B || A.nombre === B.nombre) { avisos.push(`Resultado sin tabla o equipos: ${r.l} ${r.gl}-${r.gv} ${r.v}.`); return; }
            sumar(t.equipos.find(e => e.nombre === A.nombre), r.gl, r.gv);
            sumar(t.equipos.find(e => e.nombre === B.nombre), r.gv, r.gl);
        });
        E.tabla.fechas.forEach(f => {
            let sec = '';
            for (const raw of String(f.texto || '').split(/\r?\n/)) {
                const l = limpiar(raw);
                if (!l) continue;
                const m = l.match(RE_RES1), m2 = !m && l.match(RE_RES2);
                if (!m && !m2) { sec = norm(l); continue; }
                const [a, gl, gv, b] = m ? [m[1], +m[2], +m[3], m[4]] : [m2[1], +m2[2], +m2[4], m2[3]];
                const cand = tablas.filter(t => !sec || t.n.includes(sec) || sec.includes(t.n));
                let ok = false;
                for (const t of cand) {
                    const A = t.buscar(a), B = t.buscar(b);
                    if (!A || !B || A.nombre === B.nombre) continue;
                    sumar(t.equipos.find(e => e.nombre === A.nombre), gl, gv);
                    sumar(t.equipos.find(e => e.nombre === B.nombre), gv, gl);
                    ok = true;
                    if (!sec) break;   // sin título se cuenta una sola vez (en la primera tabla donde estén los dos)
                }
                if (!ok) avisos.push(`${f.etiqueta || 'Fecha'}: no encontré a los dos equipos de "${l}".`);
            }
        });
        tablas.forEach(t => {
            t.equipos.forEach(e => { e.dg = e.gf - e.gc; });
            t.equipos.sort((x, y) => y.pts - x.pts || y.dg - x.dg || y.gf - x.gf || x.nombre.localeCompare(y.nombre));
        });
        return { tablas, avisos };
    }
    function sumar(e, gf, gc) {
        e.pj++; e.gf += gf; e.gc += gc;
        if (gf > gc) { e.g++; e.pts += 3; } else if (gf === gc) { e.e++; e.pts += 1; } else e.p++;
    }

    // Cuerpo del flyer: cabecera de columnas + una fila por equipo
    function cuerpoHtml(t, f, escudoDe) {
        const C = api.color(), esc = api.esc;
        const disp = api.alturaUtil(f) - api.H.cat - 24;
        const h = Math.max(16, Math.min(36, Math.floor(disp / t.equipos.length)));
        const fs = Math.round(h * 0.56), escT = h - 6, linea = api.tema().fila === 'linea';
        const cols = `24px minmax(0,1fr) repeat(7,28px) 40px`;
        const num = (v, extra = '') => `<span style="text-align:center; ${extra}">${v}</span>`;
        const cab = `<div style="height:24px; display:grid; grid-template-columns:${cols}; column-gap:4px; align-items:center; font-family:${api.TEXTO}; font-weight:800; font-size:13px; letter-spacing:0.06em; color:${C.acento}; border-bottom:2px solid ${C.celesteSuave}; box-sizing:border-box;">
            <span></span><span>EQUIPO</span>${['PJ', 'G', 'E', 'P', 'GF', 'GC', 'DG', 'PTS'].map(x => num(x)).join('')}</div>`;
        const filas = t.equipos.map((e, i) => {
            const url = escudoDe ? escudoDe(e.nombre) : '';
            const img = escudoDe ? `<span style="width:${escT}px; height:${escT}px; flex-shrink:0; display:flex; align-items:center; justify-content:center;">${url ? `<img src="${url}" alt="" draggable="false" style="max-width:100%; max-height:100%; object-fit:contain; display:block;">` : ''}</span>` : '';
            const fondo = linea ? 'transparent' : (i % 2 === 0 ? C.celesteFondo : 'transparent');
            const borde = linea ? `border-bottom:1px solid ${C.celesteSuave};` : 'border-radius:6px;';
            const tam = Math.min(fs, 168 / (Math.max(e.nombre.length, 1) * 0.45));
            return `<div style="height:${h}px; display:grid; grid-template-columns:${cols}; column-gap:4px; align-items:center; background:${fondo}; ${borde} box-sizing:border-box; font-family:${api.TEXTO}; font-weight:700; font-size:${fs}px; line-height:1; color:${C.tinta};">
                ${num(i + 1, `font-family:${api.TITULAR}; color:${C.acento};`)}
                <span style="display:flex; align-items:center; gap:6px; min-width:0;">${img}<span style="font-weight:800; font-size:${tam}px; text-transform:uppercase; letter-spacing:0.02em; white-space:nowrap; overflow:hidden;">${esc(e.nombre)}</span></span>
                ${[e.pj, e.g, e.e, e.p, e.gf, e.gc].map(v => num(v)).join('')}${num(e.dg > 0 ? '+' + e.dg : e.dg)}
                <span style="text-align:center;"><span style="display:block; margin:0 auto; width:34px; padding:${Math.round(h * 0.12)}px 0; border-radius:5px; background:${C.celeste}; color:${C.chipTexto}; font-family:${api.TITULAR}; font-size:${Math.round(fs * 1.1)}px;">${e.pts}</span></span>
            </div>`;
        }).join('');
        return cab + filas;
    }

    // ---------- Resultados desde la programación ----------
    let sigRes = null;
    // Categoría de una tabla ("Primera División - Zona Sur" -> "primera") y de un bloque de la programación ("1ra y Sub-20")
    const canon = (x) => norm(x).replace(/\b(primera division|primera|1ra|1ro)\b/g, 'primera').replace(/sub ?20/g, 'sub20');
    const catDeTabla = (t) => canon(t.titulo.replace(/\b(zona|grupo)\b.*$/i, ''));
    const etiquetaCat = (t) => t.titulo.replace(/\b(zona|grupo)\b.*$/i, '').replace(/[-–·\s]+$/, '') || 'Tabla';
    const keyDe = (b, f, t) => norm(`${b.cat} ${b.zona} ${f.etiqueta || ''} ${f.l} ${f.v}`) + '|' + t.n;
    // Tablas donde cuenta el partido: una por categoría (1ra, Sub-20...); en cada una, la de la zona que más se parece
    function destinos(tablas, b, f) {
        const cat = ` ${canon(b.cat)} `;
        const ctx = ` ${norm([b.cat, b.zona, f.etiqueta].join(' '))} `;
        const mejor = new Map();
        tablas.forEach(t => {
            const tc = catDeTabla(t);
            if (tc && !cat.includes(` ${tc} `)) return;
            const A = t.buscar(f.l), B = t.buscar(f.v);
            if (!A || !B || A.nombre === B.nombre) return;
            const pts = t.n.split(' ').filter(w => w.length > 2 && ctx.includes(` ${w} `)).length;
            const m = mejor.get(tc);
            if (!m || pts > m.pts) mejor.set(tc, { t, pts });
        });
        return [...mejor.values()].map(x => x.t);
    }
    function pintarRes(tablas) {
        const sig = [E.texto, E.tabla.base].join('\u0001');
        if (sig === sigRes) return;   // no se redibuja mientras escribís un marcador (perdería el foco)
        sigRes = sig;
        const esc = api.esc;
        const vistos = new Set();
        let html = '', oculto = 0;
        api.parsearProgramacion(E.texto).forEach(b => {
            let cabecera = false;
            b.filas.forEach(f => {
                if (!f.l) return;
                const ts = destinos(tablas, b, f);
                if (!ts.length) { oculto++; return; }
                if (!cabecera) { html += `<div class="arb-dia">${esc([b.cat, b.zona].filter(Boolean).join(' · '))}</div>`; cabecera = true; }
                ts.forEach(t => {
                    const key = keyDe(b, f, t);
                    vistos.add(key);
                    const r = E.tabla.res[key] || {};
                    const inp = (g, v) => `<input type="number" min="0" max="99" inputmode="numeric" data-g="${g}" value="${v == null ? '' : v}" class="campo campo-sm" style="width:3.1rem; text-align:center; padding:0.35rem 0.2rem;" aria-label="Goles ${g === 'gl' ? 'del local' : 'del visitante'}">`;
                    html += `<div class="arb-card flex items-center gap-2" data-res="${esc(key)}" data-t="${esc(t.n)}" data-l="${esc(f.l)}" data-v="${esc(f.v)}">
                        <span class="arb-hora" style="min-width:3.6rem;">${esc(etiquetaCat(t))}</span>
                        <span class="arb-partido flex-1 text-right">${esc(f.l)}</span>${inp('gl', r.gl)}<span class="font-extrabold text-slate-400">-</span>${inp('gv', r.gv)}
                        <span class="arb-partido flex-1">${esc(f.v)}</span></div>`;
                });
            });
        });
        const $ = api.$;
        $('lista-tb-res').innerHTML = html || '<p class="campo-ayuda">No hay partidos de esas categorías en la programación.</p>';
        const viejos = Object.entries(E.tabla.res).filter(([k]) => !vistos.has(k));
        $('tb-res-viejos').innerHTML = viejos.length ? `<details class="mt-3"><summary class="text-[0.72rem] font-extrabold text-slate-600 cursor-pointer">Resultados guardados de otras programaciones (${viejos.length})</summary>
            <div class="flex flex-col gap-1 mt-2">${viejos.map(([k, r]) => `<div class="flex items-center justify-between gap-2 text-xs font-bold text-slate-700"><span>${esc(r.l)} ${r.gl} - ${r.gv} ${esc(r.v)}</span><button type="button" class="btn-sec !py-1 !px-2" data-quitar="${k}">Quitar</button></div>`).join('')}</div></details>` : '';
        $('tb-res-resumen').textContent = `${Object.keys(E.tabla.res).length} resultados cargados` + (oculto ? ` · ${oculto} partidos (otras categorías o equipos que no están en las tablas) no se muestran` : '');
    }

    async function render() {
        const $ = api.$;
        const f = api.FORMATOS[E.formato];
        const { tablas, avisos } = calcular();
        pintarRes(tablas);
        api.aplicarDiseno(E.diseno);
        const hayEscudos = !!E.usarEscudos && E.equipos.some(e => e.escudo);
        const escudoDe = hayEscudos ? api.escudoDe() : null;
        if (hayEscudos) api.precargarEscudos().then(c => { if (c) api.renderDiferido(false); });
        const hecha = [...E.tabla.fechas].reverse().find(x => String(x.texto || '').trim());
        const ctx = { f, diseno: E.diseno, logoTam: E.logoTam, titulo: E.tabla.titulo, fecha: hecha ? `Hasta la ${hecha.etiqueta || 'última fecha'}`.slice(0, 40) : '', pie: E.pie, logo: api.logo(), escudoDe, hayEscudos };
        const htmls = tablas.map((t, i) => api.htmlFlyer({
            items: [{ t: 'cat', txt: t.titulo || 'Posiciones' }, { t: 'html', html: cuerpoHtml(t, f, escudoDe) }],
            usado: api.alturaUtil(f),
        }, i, tablas.length, ctx));
        api.publicar(htmls, tablas.map((t, i) => `afoch-posiciones-${api.slug(t.titulo || 'tabla')}-${f.archivo}.png`), f);

        const nEq = tablas.reduce((a, t) => a + t.equipos.length, 0);
        $('tb-resumen').textContent = tablas.length ? `${tablas.length} ${tablas.length === 1 ? 'tabla' : 'tablas'} · ${nEq} equipos` : 'Pegá los puntos actuales para ver la tabla.';
        $('btn-tb-todos').disabled = !tablas.length;
        const av = $('tb-avisos');
        av.classList.toggle('hidden', !avisos.length);
        av.innerHTML = avisos.slice(0, 12).map(a => `• ${api.esc(a)}`).join('<br>') + (avisos.length > 12 ? `<br>…y ${avisos.length - 12} más` : '');
        const P = 270 / f.ancho;
        $('tb-previews').innerHTML = htmls.map((h, i) => `
            <div class="flex flex-col gap-2 items-center">
                <div data-ver="${i}" style="width:${f.ancho * P}px; height:${f.alto * P}px; cursor:zoom-in;" class="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                    <div style="width:${f.ancho}px; height:${f.alto}px; transform:scale(${P}); transform-origin: top left;">${h}</div>
                </div>
                <div class="flex gap-2"><button type="button" data-ver="${i}" class="btn-sec">Ampliar</button><button type="button" data-descargar="${i}" class="btn-sec">Descargar</button></div>
            </div>`).join('');
    }

    // ---------- Controles ----------
    const guardar = () => api.guardarEstado();
    function pintarFechas() {
        const esc = api.esc;
        api.$('lista-tb-fechas').innerHTML = E.tabla.fechas.map((f, i) => `
            <div class="arb-card" data-fecha="${i}">
                <div class="flex items-center gap-2 mb-2">
                    <input type="text" class="campo campo-sm flex-1" data-campo="etiqueta" value="${esc(f.etiqueta)}" maxlength="30" aria-label="Nombre de la fecha">
                    <button type="button" class="btn-sec" data-borrar="${i}">Quitar</button>
                </div>
                <textarea class="campo campo-sm" data-campo="texto" rows="5" spellcheck="false" wrap="off" style="font-family:ui-monospace,monospace; white-space:pre;" placeholder="Villa Dora 2 - 1 Avenida FC">${esc(f.texto)}</textarea>
            </div>`).join('');
    }
    function iniciar(a) {
        api = a; E = api.estado;
        const $ = api.$;
        $('in-tb-base').value = E.tabla.base;
        $('in-tb-titulo').value = E.tabla.titulo;
        $('sel-tb-diseno').innerHTML = Object.entries(api.DISENOS).map(([id, d]) => `<option value="${id}">${api.esc(d.label)}</option>`).join('');
        $('sel-tb-formato').innerHTML = Object.entries(api.FORMATOS).map(([id, d]) => `<option value="${id}">${api.esc(d.label)}</option>`).join('');
        $('sel-tb-diseno').value = E.diseno;
        $('sel-tb-formato').value = E.formato;
        pintarFechas();

        $('in-tb-base').addEventListener('input', (e) => { E.tabla.base = e.target.value; guardar(); api.renderDiferido(false); });
        $('lista-tb-res').addEventListener('input', (e) => {
            const card = e.target.closest('[data-res]');
            if (!card) return;
            const [a, b] = ['gl', 'gv'].map(g => card.querySelector(`[data-g="${g}"]`).value.trim());
            const d = card.dataset;
            if (a !== '' && b !== '') E.tabla.res[d.res] = { t: d.t, l: d.l, v: d.v, gl: Math.max(0, Math.round(+a)), gv: Math.max(0, Math.round(+b)) };
            else delete E.tabla.res[d.res];
            guardar(); api.renderDiferido(false);
        });
        $('tb-res-viejos').addEventListener('click', (e) => {
            const b = e.target.closest('[data-quitar]');
            if (!b) return;
            delete E.tabla.res[b.dataset.quitar];
            sigRes = null; guardar(); api.renderDiferido(false);
        });
        $('in-tb-titulo').addEventListener('input', (e) => { E.tabla.titulo = e.target.value; guardar(); api.renderDiferido(false); });
        $('sel-tb-diseno').addEventListener('change', (e) => { E.diseno = e.target.value; guardar(); api.renderDiferido(false); });
        $('sel-tb-formato').addEventListener('change', (e) => { E.formato = e.target.value; guardar(); api.renderDiferido(false); });
        $('btn-tb-fecha').addEventListener('click', () => {
            E.tabla.fechas.push({ etiqueta: `Fecha ${E.tabla.fechas.length + 1}`, texto: '' });
            guardar(); pintarFechas(); api.renderDiferido(false);
        });
        const lista = $('lista-tb-fechas');
        lista.addEventListener('input', (e) => {
            const card = e.target.closest('[data-fecha]');
            if (!card || !e.target.dataset.campo) return;
            E.tabla.fechas[Number(card.dataset.fecha)][e.target.dataset.campo] = e.target.value;
            guardar(); api.renderDiferido(false);
        });
        lista.addEventListener('click', (e) => {
            const b = e.target.closest('[data-borrar]');
            if (!b || !confirm('¿Quitar esta fecha? Sus resultados dejan de sumarse.')) return;
            E.tabla.fechas.splice(Number(b.dataset.borrar), 1);
            guardar(); pintarFechas(); api.renderDiferido(false);
        });
        $('tb-previews').addEventListener('click', (e) => {
            const v = e.target.closest('[data-ver]');
            if (v) { api.abrirVisor(Number(v.dataset.ver)); return; }
            const b = e.target.closest('[data-descargar]');
            if (b) api.descargar([Number(b.dataset.descargar)], b);
        });
        $('btn-tb-todos').addEventListener('click', (e) => api.descargar(api.nombresActuales(), e.currentTarget));

        // Nube: un solo documento con la base y las fechas
        $('btn-tb-nube-guardar').addEventListener('click', async () => {
            try {
                await window.fb.tabla.guardar({ base: E.tabla.base, cats: E.tabla.cats, res: E.tabla.res, titulo: E.tabla.titulo, fechas: E.tabla.fechas });
                api.toast('Tabla guardada en la nube.');
            } catch (err) { api.toast('No se pudo guardar en la nube (revisá las reglas de Firestore para "tablas").', 'error'); }
        });
        $('btn-tb-nube-cargar').addEventListener('click', async () => {
            try {
                const d = await window.fb.tabla.cargar();
                if (!d) { api.toast('Todavía no hay una tabla guardada en la nube.', 'error'); return; }
                if (!confirm('Esto reemplaza lo que tenés cargado acá. ¿Seguir?')) return;
                E.tabla = { base: String(d.base || ''), cats: String(d.cats == null ? '1ra, primera' : d.cats), res: (d.res && typeof d.res === 'object') ? d.res : {}, titulo: String(d.titulo || ''), fechas: Array.isArray(d.fechas) ? d.fechas.map(x => ({ etiqueta: String(x.etiqueta || ''), texto: String(x.texto || '') })) : [] };
                guardar(); sigRes = null; iniciarCampos(); api.renderDiferido(false);
                api.toast('Tabla cargada desde la nube.');
            } catch (err) { api.toast('No se pudo leer la nube.', 'error'); }
        });
    }
    function iniciarCampos() {
        api.$('in-tb-base').value = E.tabla.base;
        api.$('in-tb-titulo').value = E.tabla.titulo;
        pintarFechas();
    }

    window.tablaLiga = { iniciar, render };
})();
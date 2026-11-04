// ============================================================
// PESTAÑA "CRUCES" — Liga A.F.O.CH
// Pegás los cruces de cuartos de final (tal como te los mandan) y se arma una
// llave estilo Champions League: 4 cuartos → 2 semifinales → final con copa.
// Sale un flyer por cada copa / categoría (Primera Copa de Oro, Copa de Plata, Sub-20…).
//
// Se engancha igual que la pestaña Posiciones: flyers-liga.js llama a
//   window.crucesLiga.iniciar(api)   una sola vez
//   window.crucesLiga.render()       cada vez que hay que redibujar
//
// Formato del texto que entiende:
//   ... CRUCES DE CUARTOS DE FINAL EN PRIMERA DIVISION:   -> categoría
//   COPA DE ORO:                                          -> nueva llave (también COPA DE PLATA)
//   A: 1° ZONA NORTE: EQUIPO 1 VS 4° ZONA SUR: EQUIPO 2   -> cruce (A, B, C, D)
//   MARCELINO UGARTE/ALVEAR                               -> si todavía no se sabe, separar con /
//   SEMIFINALES: / A VS C / B VS D                        -> quién se cruza en semis (opcional)
//   ... – Sábado 14/11 – 16:00 Hs                         -> día y hora (opcional) al final de un cruce, de una semi o de la FINAL
//   A: Sábado 14/11 – 16:00 Hs                            -> o en un renglón aparte, para agregarlos después
// ============================================================
(function () {
    'use strict';

    let api = null;

    const EJEMPLO = `Los cruces en Primera División.

TORNEO CLAUSURA DE AFOCH 2026 CRUCES DE CUARTOS DE FINAL EN PRIMERA DIVISION:
COPA DE ORO:
A: 1° ZONA NORTE: UNION DE SAN BERNARDO FC VS 4° ZONA SUR: MARCELINO UGARTE/ALVEAR – 14:00 Hs
C: 2° ZONA SUR: AVENIDA FC/DEPORTIVO COMERCIO VS 3° ZONA NORTE: COOPERATIVA – 14:00 Hs

B: 2° ZONA NORTE: RACING FC VS 3° ZONA SUR: ATLÉTICO ALVEAR/UGARTE – 14:00 Hs
D: 1° ZONA SUR: AVENIDA FC/DEPORTIVO COMERCIO VS 4° ZONA NORTE: POLIDEPORTIVO SAMUHU – 14:00 Hs

SEMIFINALES:
A VS C – 14:00 Hs
B VS D – 14:00 Hs
FINAL – 14:00 Hs

COPA DE PLATA:
A: 5° ZONA SUR: R. ESCALADA/PROGRESISTA VS 8° ZONA NORTE: FUIMOS HEROES – 14:00 Hs
C: 6° ZONA NORTE: DEP. MARTIRES CBA/PROGRESISTA VS 7° ZONA SUR: DEP. ARGENTINO/PROGRESISTA/ESCALADA – 14:00 Hs

B: 5° ZONA NORTE: DEPORTIVO ENRIQUE URIEN VS 8° ZONA SUR: SPORTIVO ESPAÑOL – 14:00 Hs
D: 6° ZONA SUR: UNION PROGRESISTA/R. ESCALADA VS 7° ZONA NORTE: JUVENTUD – 14:00 Hs

SEMIFINALES:
A VS C – 14:00 Hs
B VS D – 14:00 Hs
FINAL – 14:00 Hs

TORNEO CLAUSURA DE AFOCH 2026 CRUCES DE CUARTOS DE FINAL EN SUB-20:

A: 1° ZONA NORTE: COOPERATIVA VS 4° ZONA SUR: U. PROGRESISTA – 14:00 Hs
C: 2° ZONA SUR: DEPORTIVO COMERCIO VS 3° ZONA NORTE: MARTIRES CORDOBA – 14:00 Hs

B: 2° ZONA NORTE: UNION SB VS 3° ZONA SUR: M. UGARTE – 14:00 Hs
D: 1° ZONA SUR: AVENIDA FC VS 4° ZONA NORTE: RACING FC – 14:00 Hs

SEMIFINALES:
A VS C – 14:00 Hs
B VS D – 14:00 Hs
FINAL – 14:00 Hs`;

    const DEFECTO = {
        texto: EJEMPLO,
        titulo: 'CUARTOS DE FINAL',
        torneo: 'TORNEO CLAUSURA 2026',
        pie: 'A.F.O.CH',
        paleta: 'medianoche',
        formato: 'vertical',
    };

    // Paletas del flyer: fondo oscuro sobrio. El color de acento lo da la copa (oro / plata / celeste de la liga)
    const PALETAS = {
        medianoche: { label: 'Medianoche', sub: 'Azul muy oscuro',
            top: '#050A18', mid: '#071634', bot: '#0B2253', foco: 'rgba(80,150,255,0.24)',
            borde: 'rgba(255,255,255,0.20)', caja: 'rgba(255,255,255,0.06)', tira: 'rgba(2,6,20,0.60)', tenue: 'rgba(255,255,255,0.60)', linea: 'rgba(255,255,255,0.42)' },
        carbon: { label: 'Carbón', sub: 'Negro y metal',
            top: '#060607', mid: '#0F1013', bot: '#1B1D23', foco: 'rgba(255,255,255,0.13)',
            borde: 'rgba(255,255,255,0.20)', caja: 'rgba(255,255,255,0.06)', tira: 'rgba(0,0,0,0.55)', tenue: 'rgba(255,255,255,0.60)', linea: 'rgba(255,255,255,0.42)' },
    };
    const ACENTOS = {
        ORO:   { a: '#F6E2A8', b: '#E0B14A', c: '#9A6B1C' },
        PLATA: { a: '#FFFFFF', b: '#C9D2DF', c: '#808C9E' },
        LIGA:  { a: '#CFEBFB', b: '#4DB3EE', c: '#0673C8' },
    };

    // ------------------------------------------------------------
    // Utilidades
    // ------------------------------------------------------------
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    const px = (n) => `${Math.round(n * 10) / 10}px`;
    const ajustar = (txt, base, maxPx, factor = 0.43) => Math.max(8.5, Math.min(base, maxPx / (Math.max(String(txt).length, 1) * factor)));
    const sinAcentos = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const estado = () => api.estado.cruces;

    // ------------------------------------------------------------
    // 1) PARSER: texto -> llaves [{ cat, copa, qf: {A: {a, b}}, semis: [[A,C],[B,D]] }]
    //    cada lado = { seed: '1° ZONA NORTE', opts: ['AVENIDA FC', 'DEPORTIVO COMERCIO'] }
    // ------------------------------------------------------------
    const DIAS_ABREV = { lunes: 'LUN', martes: 'MAR', miercoles: 'MIÉ', jueves: 'JUE', viernes: 'VIE', sabado: 'SÁB', domingo: 'DOM' };
    // Saca de un renglón el día, la fecha y la hora (todo opcional). Devuelve el texto que queda y el horario encontrado.
    function extraerHorario(l) {
        let t = String(l), dia = '', fecha = '', hora = '';
        t = t.replace(/\b(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\b/i, (m) => { dia = DIAS_ABREV[sinAcentos(m).toLowerCase()] || ''; return ' '; });
        t = t.replace(/\b(\d{1,2})\s*\/\s*(\d{1,2})\b/, (m, d, mes) => { fecha = `${Number(d)}/${Number(mes)}`; return ' '; });
        // Hora: 14:00 / 14;00 / 14:00 hs / 14.00hs / 14 hs / 14h / 14 horas (el punto solo vale si trae "hs", para no confundir con fechas)
        t = t.replace(/\b(\d{1,2})\s*[:;]\s*(\d{2})\s*(?:hs?\b\.?|horas?\b)?|\b(\d{1,2})\s*\.\s*(\d{2})\s*(?:hs?\b\.?|horas?\b)|\b(\d{1,2})\s*(?:hs?|horas?)\b\.?/i, (m, h1, m1, h2, m2, h3) => {
            const h = Number(h1 != null ? h1 : h2 != null ? h2 : h3);
            const mi = m1 != null ? m1 : m2 != null ? m2 : '00';
            if (h <= 24) hora = `${String(h).padStart(2, '0')}:${mi} HS`;
            return ' ';
        });
        if (!dia && !fecha && !hora) return { texto: String(l), hor: null };
        t = t.replace(/\s+/g, ' ').replace(/\s*[-–—|,·:]\s*(?=[-–—|,·]\s|$)/g, ' ').replace(/[\s\-–—|,·:]+$/, '').replace(/^[\s\-–—|,·]+/, '').trim();
        return { texto: t, hor: { dia, fecha, hora } };
    }
    const limpiar = (l) => String(l).replace(/[\u200b\t\u00a0]/g, ' ').replace(/^[\s•*·▪●\-–—]+/, '').replace(/\*+/g, '').replace(/\s+/g, ' ').trim();

    function detectarCategoria(l) {
        let m = l.match(/sub[\s-]*(\d+)/i);
        if (m) return `SUB-${m[1]}`;
        if (/primera|1ra/i.test(l)) return 'PRIMERA DIVISIÓN';
        m = l.match(/\ben\s+(.+?)[\s:.]*$/i);
        return m ? m[1].toUpperCase() : '';
    }
    function parsearLado(t) {
        let seed = '', team = String(t).trim();
        const m = team.match(/^(\d+\s*[°ºo]?\s*zona\s+[a-záéíóúñ]+)\s*:\s*(.+)$/i);
        if (m) { seed = m[1].toUpperCase().replace(/\s*([°º])\s*/, '$1 ').replace(/\s+/g, ' ').trim(); team = m[2]; }
        const opts = team.split(/\s*\/\s*/).map(s => s.trim().replace(/[.,;:]+$/, '')).filter(Boolean);
        return { seed, opts };
    }
    function parsear(texto) {
        const llaves = [], avisos = [];
        let cat = '', copa = '', cur = null;
        const nueva = () => { cur = { cat, copa, qf: {}, orden: [], semis: [], semisHor: [], hor: {}, final: null }; llaves.push(cur); return cur; };
        String(texto || '').split(/\r?\n/).forEach(raw => {
            const l = limpiar(raw);
            if (!l) return;
            let m;
            if (/cruces/i.test(l)) { cat = detectarCategoria(l) || cat; copa = ''; cur = null; return; }
            if ((m = l.match(/^copa\s+de\s+([a-záéíóúñ]+)\s*:?$/i))) { copa = m[1].toUpperCase(); nueva(); return; }
            const ex = extraerHorario(l);
            let lt = ex.texto.replace(/^semifinal(?:es)?\s*\d?\s*:?\s*/i, '').trim();
            if (!lt && /^semifinal/i.test(l) && !ex.hor) return;
            if (/^(la\s+)?final$/i.test(lt)) { if (cur && ex.hor) cur.final = ex.hor; return; }
            if ((m = lt.match(/^([A-H])\s+vs\.?\s+([A-H])$/i))) {
                if (cur) { cur.semis.push([m[1].toUpperCase(), m[2].toUpperCase()]); cur.semisHor.push(ex.hor); }
                return;
            }
            if ((m = lt.match(/^([A-H])\s*[:\-.)]\s*(.+?)\s+vs\.?\s+(.+)$/i))) {
                if (!cur) nueva();
                const k = m[1].toUpperCase();
                cur.qf[k] = { a: parsearLado(m[2]), b: parsearLado(m[3]) };
                if (!cur.orden.includes(k)) cur.orden.push(k);
                if (ex.hor) cur.hor[k] = ex.hor;
                return;
            }
            if (ex.hor && cur && (m = lt.match(/^([A-H])$/i))) { cur.hor[m[1].toUpperCase()] = ex.hor; return; }
            avisos.push(`No entendí este renglón: “${l.slice(0, 60)}”`);
        });
        const validas = llaves.filter(b => b.orden.length);
        validas.forEach(b => {
            // Semifinales por defecto: 1° vs 3° cruce y 2° vs 4° (A-C, B-D)
            const letras = [...b.orden].sort();
            const s = b.semis.slice(0, 2);
            if (s.length < 1 && letras[0] && letras[2]) s.push([letras[0], letras[2]]);
            if (s.length < 2 && letras[1] && letras[3]) s.push([letras[1], letras[3]]);
            while (s.length < 2) s.push([letras[0] || 'A', letras[1] || 'B']);
            b.semis = s;
            b.semisHor = [b.semisHor[0] || null, b.semisHor[1] || null];
        });
        return { llaves: validas, avisos };
    }
    const etiquetaLlave = (b) => [b.cat, b.copa ? `COPA DE ${b.copa}` : ''].filter(Boolean).join(' · ') || 'CUARTOS DE FINAL';

    // ------------------------------------------------------------
    // 2) DISEÑO DE CADA FLYER
    // ------------------------------------------------------------
    function logoHtml(logo, tam) {
        const caja = `width:${tam}px; height:${tam}px; border-radius:9999px; background:#fff; display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0;`;
        if (logo) return `<div style="${caja}"><img src="${logo}" alt="A.F.O.CH" draggable="false" style="max-width:${Math.round(tam * 0.84)}px; max-height:${Math.round(tam * 0.84)}px; object-fit:contain; display:block;" /></div>`;
        return `<div style="${caja}"><span style="font-family:${api.TITULAR}; font-size:${Math.round(tam * 0.27)}px; line-height:1; color:#0673C8; text-align:center;">A.F.<br>O.CH</span></div>`;
    }

    // Copa en trazo lineal (no hay foto): sobria, del color de acento de la copa
    function copaSvg(A, ancho, alto, id) {
        const g = `cr-copa-${id}`;
        return `<svg width="${ancho}" height="${alto}" viewBox="0 0 100 136" xmlns="http://www.w3.org/2000/svg" style="display:block; overflow:visible;" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <defs>
                <linearGradient id="${g}-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${A.a}"/><stop offset="0.55" stop-color="${A.b}"/><stop offset="1" stop-color="${A.c}"/></linearGradient>
                <linearGradient id="${g}-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${A.b}" stop-opacity="0.30"/><stop offset="1" stop-color="${A.b}" stop-opacity="0.04"/></linearGradient>
            </defs>
            <path d="M29 16 H71 V42 C71 59 61.5 69 50 71 C38.5 69 29 59 29 42 Z" fill="url(#${g}-f)" stroke="url(#${g}-s)" stroke-width="2.2"/>
            <path d="M24 16 H76" stroke="url(#${g}-s)" stroke-width="3.2"/>
            <path d="M29 24 C13 24 11 46 32 52" stroke="url(#${g}-s)" stroke-width="2.2"/>
            <path d="M71 24 C87 24 89 46 68 52" stroke="url(#${g}-s)" stroke-width="2.2"/>
            <path d="M44.5 71 L46.5 98 H53.5 L55.5 71" fill="url(#${g}-f)" stroke="url(#${g}-s)" stroke-width="2.2"/>
            <path d="M42 98 H58" stroke="url(#${g}-s)" stroke-width="2.6"/>
            <path d="M33 118 L37 104 H63 L67 118 Z" fill="url(#${g}-f)" stroke="url(#${g}-s)" stroke-width="2.2"/>
            <path d="M28 118 H72 V124 H28 Z" fill="url(#${g}-f)" stroke="url(#${g}-s)" stroke-width="2.2"/>
            <path d="M50 30 L52.6 37 L60 37.4 L54.2 42 L56.2 49 L50 45 L43.8 49 L45.8 42 L40 37.4 L47.4 37 Z" fill="url(#${g}-s)" stroke="none" opacity="0.9"/>
            <path d="M35 24 C36 40 40 52 46 61" stroke="#fff" stroke-width="1.4" opacity="0.35"/>
        </svg>`;
    }

    const fmtFecha = (h) => (h ? [h.dia, h.fecha].filter(Boolean).join(' ') : '');
    // Línea "SÁB 14/11 · 16:00 HS" (fecha en blanco, hora en el color de acento)
    function horarioHtml(h, A, P) {
        if (!h) return '';
        const f = fmtFecha(h);
        return [f ? `<span style="color:#fff;">${esc(f)}</span>` : '', h.hora ? `<span style="color:${A.b};">${esc(h.hora)}</span>` : ''].filter(Boolean).join(`<span style="color:${P.tenue};"> · </span>`);
    }

    const siglas = (n) => {
        const pal = sinAcentos(n).replace(/[^A-Za-z ]/g, ' ').split(/\s+/).filter(w => w && !/^(fc|de|del|la|el|y|dep|c|club)$/i.test(w));
        return (pal.length > 1 ? pal[0][0] + pal[1][0] : (pal[0] || '?').slice(0, 2)).toUpperCase();
    };

    // Un lado del cruce (escudo/s + zona + nombre/s)
    function ladoHtml(lado, o) {
        const { P, A, rowH, textoAncho, conEscudos, escudoDe } = o;
        if (!lado) {
            return `<div style="height:${rowH}px; display:flex; align-items:center; justify-content:center; font-family:${api.TEXTO}; font-weight:700; font-size:11px; letter-spacing:0.16em; color:${P.tenue};">A DEFINIR</div>`;
        }
        const opts = lado.opts.length ? lado.opts : ['A DEFINIR'];
        const n = opts.length;
        let escudos = '';
        if (conEscudos) {
            const tam = n === 1 ? Math.min(34, rowH - 14) : n === 2 ? 22 : 14;
            escudos = `<div style="width:34px; flex-shrink:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:${n > 2 ? 1 : 3}px;">${opts.map(nombre => {
                const u = escudoDe ? escudoDe(nombre) : '';
                return u
                    ? `<img src="${u}" alt="" draggable="false" style="width:${tam}px; height:${tam}px; object-fit:contain; display:block;" />`
                    : `<div style="width:${tam}px; height:${tam}px; border-radius:9999px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.28); box-sizing:border-box; display:flex; align-items:center; justify-content:center; font-family:${api.TEXTO}; font-weight:700; font-size:${Math.round(tam * 0.38)}px; color:rgba(255,255,255,0.75); line-height:1;">${esc(siglas(nombre))}</div>`;
            }).join('')}</div>`;
        }
        const seed = lado.seed ? `<div style="font-family:${api.TEXTO}; font-weight:700; font-size:9.5px; letter-spacing:0.12em; color:${A.b}; line-height:1; margin-bottom:${n > 2 ? 1 : 3}px; white-space:nowrap;">${esc(lado.seed)}</div>` : '';
        let nombres;
        if (n === 1) {
            const len = opts[0].length;
            const fs = len <= 14 ? 15 : len <= 20 ? 13 : 12;
            nombres = `<div style="font-family:${api.TEXTO}; font-weight:700; font-size:${fs}px; line-height:1.04; color:#fff; text-transform:uppercase; letter-spacing:0.02em; overflow:hidden; max-height:${Math.round(fs * 3.2)}px;">${esc(opts[0])}</div>`;
        } else {
            nombres = opts.map((nom, k) => {
                const fs = ajustar(nom + (k < n - 1 ? ' /' : ''), n > 2 ? 10.5 : 13, textoAncho, 0.5);
                return `<div style="font-family:${api.TEXTO}; font-weight:700; font-size:${px(fs)}; line-height:${n > 2 ? 1 : 1.08}; color:#fff; text-transform:uppercase; letter-spacing:0.02em; white-space:nowrap;">${esc(nom)}${k < n - 1 ? `<span style="color:${P.tenue};"> /</span>` : ''}</div>`;
            }).join('');
        }
        return `<div style="height:${rowH}px; display:flex; align-items:center; gap:6px; padding:0 7px 0 8px; box-sizing:border-box;">${escudos}<div style="flex:1; min-width:0;">${seed}${nombres}</div></div>`;
    }

    function htmlCruce(b, i, total, c, f) {
        const P = PALETAS[c.paleta] || PALETAS.medianoche;
        const tipoCopa = b.copa === 'PLATA' ? 'PLATA' : b.copa ? 'ORO' : 'LIGA';
        const A = ACENTOS[tipoCopa];
        const W = f.ancho, Hh = f.alto, sup = f.seguroSup, inf = f.seguroInf;
        const alto = Hh > 800;
        const M = 10, g = 10, QW = 138, SW = 50;
        const CW = W - 2 * (M + QW + g + SW + g);
        const rowH = alto ? 58 : 52, vsH = 16, ch = rowH * 2 + vsH;
        const HEAD = 112, FOOT = 34;
        const y0 = sup + HEAD + 6;
        const y1 = Hh - inf - FOOT - 6;
        const ba = y1 - y0 - 8;
        const gp = Math.max(30, Math.min(alto ? 250 : 165, ba - 2 * ch - 44));
        const Hb = 2 * ch + gp;
        const top = y0 + 8 + Math.max(0, (ba - Hb) / 2);
        const cA = top + ch / 2, cC = top + ch + gp + ch / 2, yc = (cA + cC) / 2;
        const conEscudos = !!c.escudoDe;
        const o = { P, A, rowH, textoAncho: QW - 15 - (conEscudos ? 40 : 0), conEscudos, escudoDe: c.escudoDe };

        const linea = (x, y, w, h, col) => `<div style="position:absolute; left:${px(x)}; top:${px(y)}; width:${px(w)}; height:${px(h)}; background:${col || P.linea};"></div>`;
        const hL = (x, y, w, col) => linea(x, y - 0.75, w, 1.5, col);
        const vL = (x, y, h) => linea(x - 0.75, y, 1.5, h);

        // ----- Fondo: oscuro, con foco de estadio, césped rayado y líneas de cancha muy tenues -----
        const yPie = Hh - inf - FOOT;
        const fondo = `
            <div style="position:absolute; inset:0; background:linear-gradient(180deg, ${P.top} 0%, ${P.mid} 55%, ${P.bot} 100%);"></div>
            <div style="position:absolute; inset:0; background:repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 45px, rgba(255,255,255,0) 45px, rgba(255,255,255,0) 90px);"></div>
            <div style="position:absolute; inset:0; background:radial-gradient(ellipse 75% 46% at 50% 0%, ${P.foco}, rgba(0,0,0,0) 72%);"></div>
            <svg style="position:absolute; left:0; top:0;" width="${W}" height="${Hh}" viewBox="0 0 ${W} ${Hh}" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#fff" stroke-opacity="0.075" stroke-width="1.6">
                <circle cx="${W / 2}" cy="${yc}" r="112"/>
                <circle cx="${W / 2}" cy="${yc}" r="3.5" fill="#fff" fill-opacity="0.12" stroke="none"/>
                <line x1="0" y1="${yc}" x2="${W}" y2="${yc}"/>
                <rect x="${W / 2 - 138}" y="${yPie - 96}" width="276" height="96"/>
                <rect x="${W / 2 - 64}" y="${yPie - 38}" width="128" height="38"/>
                <path d="M${W / 2 - 54} ${yPie - 96} A54 54 0 0 1 ${W / 2 + 54} ${yPie - 96}"/>
            </svg>
            <div style="position:absolute; inset:0; background:radial-gradient(ellipse 90% 75% at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%);"></div>
            <div style="position:absolute; left:0; top:${sup}px; width:100%; height:3px; background:linear-gradient(90deg, ${A.b}, ${A.a} 40%, rgba(255,255,255,0) 100%);"></div>`;

        // ----- Cabecera -----
        const tamLogo = 54;
        const titulo = ((c.titulo || '').split('\n').map(s => s.trim()).filter(Boolean).join(' ')) || 'CUARTOS DE FINAL';
        const xTit = M + 8 + tamLogo + 14;
        const anchoTit = W - xTit - M - 8;
        const tamTit = Math.min(48, anchoTit / (titulo.length * 0.405));
        const subCat = b.cat ? `<span style="color:#fff;">${esc(b.cat)}</span>` : '';
        const subCopa = b.copa ? `<span style="color:${A.b};">${b.cat ? '<span style="color:' + P.tenue + '; margin:0 6px;">/</span>' : ''}COPA DE ${esc(b.copa)}</span>` : '';
        const cabecera = `
            <div style="position:absolute; left:${M + 8}px; top:${sup + 24}px;">${logoHtml(c.logo, tamLogo)}</div>
            <div style="position:absolute; left:${xTit}px; top:${sup + 19}px; width:${anchoTit}px;">
                <div style="font-family:${api.TEXTO}; font-weight:700; font-size:12.5px; letter-spacing:0.28em; color:${A.b}; text-transform:uppercase; line-height:1; white-space:nowrap;">${esc(c.torneo || '')}</div>
                <div style="font-family:${api.TITULAR}; font-size:${px(tamTit)}; line-height:1; color:#fff; letter-spacing:0.035em; text-transform:uppercase; margin-top:5px; white-space:nowrap;">${esc(titulo)}</div>
                <div style="margin-top:7px; font-family:${api.TEXTO}; font-weight:700; font-size:14px; letter-spacing:0.2em; text-transform:uppercase; line-height:1; white-space:nowrap;">${subCat}${subCopa}</div>
            </div>
            <div style="position:absolute; left:${M + 8}px; right:${M + 8}px; top:${sup + HEAD - 2}px; height:1px; background:linear-gradient(90deg, ${A.b}, rgba(255,255,255,0.14) 55%, rgba(255,255,255,0));"></div>`;

        // ----- Cruces -----
        const tarjeta = (letra, x, ytop) => {
            const q = b.qf[letra];
            return `<div style="position:absolute; left:${px(x)}; top:${px(ytop)}; width:${QW}px; height:${ch}px; border:1px solid ${P.borde}; border-left:3px solid ${A.b}; border-radius:3px; background:${P.caja}; overflow:hidden; box-sizing:border-box; box-shadow:0 6px 18px rgba(0,0,0,0.35);">
                <div>${ladoHtml(q && q.a, o)}</div>
                <div style="position:relative; height:${vsH}px; background:${P.tira}; display:flex; align-items:center; justify-content:center; font-family:${api.TEXTO}; font-weight:700; font-size:10px; letter-spacing:0.24em; color:${P.tenue};">
                    <span style="position:absolute; left:7px; font-family:${api.TITULAR}; font-size:13px; letter-spacing:0.05em; color:${A.b};">${esc(letra)}</span>VS
                </div>
                <div>${ladoHtml(q && q.b, o)}</div>
            </div>
            ${b.hor[letra] ? `<div style="position:absolute; left:${px(x)}; width:${QW}px; top:${px(ytop + ch + 5)}; text-align:center; font-family:${api.TEXTO}; font-weight:700; font-size:10.5px; letter-spacing:0.09em; line-height:1; white-space:nowrap;">${horarioHtml(b.hor[letra], A, P)}</div>` : ''}`;
        };
        const slot = (x, y, w, h, txt, col) => `<div style="position:absolute; left:${px(x)}; top:${px(y)}; width:${px(w)}; height:${px(h)}; border:1px solid ${col || P.borde}; background:${P.caja}; border-radius:3px; box-sizing:border-box; display:flex; align-items:center; justify-content:center; text-align:center; font-family:${api.TEXTO}; font-weight:700; font-size:10px; letter-spacing:0.1em; color:${P.tenue}; line-height:1.1;">${txt}</div>`;
        const vsMini = (x, y, w, h) => `<div style="position:absolute; left:${px(x)}; top:${px(y)}; width:${px(w)}; height:${px(h)}; display:flex; align-items:center; justify-content:center; font-family:${api.TEXTO}; font-weight:700; font-size:9px; letter-spacing:0.2em; color:${P.tenue};">VS</div>`;

        const [semiIzq, semiDer] = b.semis;
        const xQI = M, xQD = W - M - QW;
        const xSI = M + QW + g, xSD = W - M - QW - g - SW;
        const jI = M + QW + g / 2, jD = W - M - QW - g / 2;
        const cx0 = M + QW + g + SW + g;
        const sh = 24, shVs = 14, shT = sh * 2 + shVs;

        const semiBox = (x, par, n, h) => `
            <div style="position:absolute; left:${px(x - 16)}; width:${SW + 32}px; top:${px(yc - shT / 2 - 15)}; text-align:center; font-family:${api.TEXTO}; font-weight:700; font-size:9.5px; letter-spacing:0.14em; color:${A.b}; white-space:nowrap;">SEMIFINAL ${n}</div>
            ${slot(x, yc - shT / 2, SW, sh, `GAN. ${esc(par[0])}`)}
            ${vsMini(x, yc - shT / 2 + sh, SW, shVs)}
            ${slot(x, yc + shT / 2 - sh, SW, sh, `GAN. ${esc(par[1])}`)}
            ${h ? `<div style="position:absolute; left:${px(x - 16)}; width:${SW + 32}px; top:${px(yc + shT / 2 + 6)}; text-align:center; font-family:${api.TEXTO}; font-weight:700; font-size:10px; letter-spacing:0.08em; line-height:1.25; white-space:nowrap;"><div style="color:#fff;">${esc(fmtFecha(h))}</div><div style="color:${A.b};">${esc(h.hora || '')}</div></div>` : ''}`;

        const cruces = `
            ${tarjeta(semiIzq[0], xQI, top)}
            ${tarjeta(semiIzq[1], xQI, top + ch + gp)}
            ${tarjeta(semiDer[0], xQD, top)}
            ${tarjeta(semiDer[1], xQD, top + ch + gp)}
            ${hL(M + QW, cA, g / 2 + 1)}${hL(M + QW, cC, g / 2 + 1)}${vL(jI, cA, cC - cA)}${hL(jI, yc, g / 2)}${hL(xSI + SW, yc, g, A.b)}
            ${hL(jD, cA, g / 2 + 1)}${hL(jD, cC, g / 2 + 1)}${vL(jD, cA, cC - cA)}${hL(xSD + SW, yc, g / 2)}${hL(W - cx0, yc, g, A.b)}
            ${semiBox(xSI, semiIzq, 1, b.semisHor[0])}
            ${semiBox(xSD, semiDer, 2, b.semisHor[1])}`;

        // ----- Final + copa -----
        const fh = 44, fw = (CW - 24) / 2;
        const thCopa = Math.max(110, Math.min(alto ? 232 : 186, (yc - 44) - (y0 + 8)));
        const twCopa = thCopa * (100 / 136);
        const xc = W / 2;
        const final = `
            <div style="position:absolute; left:${px(xc - 120)}; top:${px(yc - 46 - thCopa)}; width:240px; height:${px(thCopa + 40)}; background:radial-gradient(ellipse at 50% 50%, ${A.b}30, rgba(0,0,0,0) 68%);"></div>
            <div style="position:absolute; left:${px(xc - twCopa / 2)}; top:${px(yc - 40 - thCopa)};">${copaSvg(A, twCopa, thCopa, i)}</div>
            ${slot(cx0, yc - fh / 2, fw, fh, 'GAN.<br>SEMI 1', A.b)}
            ${vsMini(cx0 + fw, yc - fh / 2, 24, fh)}
            ${slot(cx0 + fw + 24, yc - fh / 2, fw, fh, 'GAN.<br>SEMI 2', A.b)}
            <div style="position:absolute; left:${px(xc - CW / 2)}; width:${CW}px; top:${px(yc + fh / 2 + 10)}; text-align:center;">
                <div style="font-family:${api.TITULAR}; font-size:27px; line-height:1; letter-spacing:0.08em; color:#fff; white-space:nowrap;">LA FINAL</div>
                <div style="width:28px; height:2px; background:${A.b}; margin:6px auto 5px;"></div>
                <div style="font-family:${api.TEXTO}; font-weight:700; font-size:10.5px; letter-spacing:0.2em; color:${A.b}; text-transform:uppercase; white-space:nowrap;">${esc(b.copa ? `COPA DE ${b.copa}` : (b.cat || 'CAMPEÓN'))}</div>
                ${b.final ? `<div style="margin-top:8px; font-family:${api.TEXTO}; font-weight:700; font-size:10.5px; letter-spacing:0.09em; line-height:1.25; white-space:nowrap;"><div style="color:#fff;">${esc(fmtFecha(b.final))}</div><div style="color:${A.b};">${esc(b.final.hora || '')}</div></div>` : ''}
            </div>`;

        // ----- Pie -----
        const contador = total > 1 ? `${i + 1}/${total}` : '';
        const pie = `
            <div style="position:absolute; left:${M + 8}px; right:${M + 8}px; bottom:${inf}px; height:${FOOT}px; border-top:1px solid rgba(255,255,255,0.16); display:flex; align-items:center; justify-content:space-between; box-sizing:border-box; font-family:${api.TEXTO}; font-weight:700; font-size:11.5px; letter-spacing:0.24em; color:${P.tenue}; text-transform:uppercase;">
                <span style="white-space:nowrap; color:#fff;">${esc(c.pie || '')}</span>
                <span style="white-space:nowrap;">${esc(b.cat || '')}</span>
                <span style="font-family:${api.TITULAR}; font-size:16px; letter-spacing:0.08em; min-width:30px; text-align:right;">${contador}</span>
            </div>`;

        return `<div data-flyer="${i}" style="position:relative; width:${W}px; height:${Hh}px; overflow:hidden; background:${P.top}; font-family:${api.TEXTO};">${fondo}${cabecera}${cruces}${final}${pie}</div>`;
    }

    // ------------------------------------------------------------
    // 3) RENDER + CONTROLES
    // ------------------------------------------------------------
    async function render() {
        if (!api) return;
        const e = estado();
        await api.cargarLogo();
        const f = api.FORMATOS[e.formato] || api.FORMATOS.vertical;
        const { llaves, avisos } = parsear(e.texto);
        const hayEscudos = api.estado.usarEscudos !== false && api.estado.equipos.some(x => x.escudo);
        const escudoDe = hayEscudos ? api.escudoDe() : null;
        if (hayEscudos) api.precargarEscudos().then(cambio => { if (cambio) api.renderDiferido(false); });
        const total = llaves.length;
        const contexto = { paleta: e.paleta, titulo: e.titulo, torneo: e.torneo, pie: e.pie, logo: api.logo(), escudoDe };
        const htmls = llaves.map((b, i) => htmlCruce(b, i, total, contexto, f));

        // Avisos: renglones que no se entendieron + equipos sin escudo
        const sinEscudo = [];
        if (escudoDe) {
            llaves.forEach(b => Object.values(b.qf).forEach(q => [q.a, q.b].forEach(l => l.opts.forEach(n => { if (!escudoDe(n) && !sinEscudo.includes(n)) sinEscudo.push(n); }))));
        }
        const partes = [...avisos];
        if (sinEscudo.length) partes.push(`Sin escudo cargado: ${sinEscudo.join(', ')}. Agregalos en la pestaña Flyers (se reconocen aunque el nombre venga abreviado).`);
        const elAv = api.$('cr-avisos');
        elAv.innerHTML = partes.map(esc).join('<br>');
        elAv.classList.toggle('hidden', !partes.length);

        api.$('cr-resumen').textContent = total
            ? `${total} ${total === 1 ? 'llave' : 'llaves'} → ${total} ${total === 1 ? 'flyer' : 'flyers'} (${llaves.map(etiquetaLlave).join(' | ')})`
            : 'Pegá los cruces para ver las llaves.';
        api.$('cr-btn-todos').disabled = !total;

        const ESC_PREV = 270 / f.ancho;
        api.$('cr-previews').innerHTML = htmls.map((h, i) => `
            <div class="flex flex-col gap-2 items-center">
                <div data-ver="${i}" title="Tocá para ampliar" style="width:${f.ancho * ESC_PREV}px; height:${f.alto * ESC_PREV}px; cursor:zoom-in;" class="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                    <div style="width:${f.ancho}px; height:${f.alto}px; transform:scale(${ESC_PREV}); transform-origin: top left;">${h}</div>
                </div>
                <div class="flex gap-2">
                    <button type="button" data-ver="${i}" class="btn-sec">Ampliar</button>
                    <button type="button" data-descargar="${i}" class="btn-sec">Descargar ${i + 1}/${total}</button>
                </div>
            </div>`).join('');

        const nombres = llaves.map((b, i) => `afoch-cruces-${api.slug(etiquetaLlave(b))}-${f.archivo}.png`);
        api.publicar(htmls, nombres, f);
        // publicar() usa el fondo del diseño activo del resto de la app: acá el fondo es propio del flyer
    }

    function construirTiles() {
        const e = estado();
        api.$('cr-tiles-paleta').innerHTML = Object.entries(PALETAS).map(([k, p]) => `
            <button type="button" class="tile ${e.paleta === k ? 'tile-activo' : ''}" data-cr-paleta="${k}">
                <span class="tile-forma" style="width:1.6rem; height:0.9rem; border:none; background:linear-gradient(90deg, ${p.top}, ${p.mid}, ${p.bot});"></span>
                <span class="tile-label">${p.label}</span><span class="tile-sub">${p.sub}</span>
            </button>`).join('');
        api.$('cr-tiles-formato').innerHTML = Object.entries(api.FORMATOS).map(([k, f]) => `
            <button type="button" class="tile ${e.formato === k ? 'tile-activo' : ''}" data-cr-formato="${k}">
                <span class="tile-forma" style="width:${k === 'historia' ? '0.8rem' : '1rem'}; height:${k === 'historia' ? '1.4rem' : '1.25rem'};"></span>
                <span class="tile-label">${f.label}</span><span class="tile-sub">${f.sub}</span>
            </button>`).join('');
    }
    function llenar() {
        const e = estado();
        api.$('cr-texto').value = e.texto;
        api.$('cr-titulo').value = e.titulo;
        api.$('cr-torneo').value = e.torneo;
        api.$('cr-pie').value = e.pie;
        api.$('cr-chk-escudos').checked = api.estado.usarEscudos !== false;
        construirTiles();
    }

    function iniciar(a) {
        api = a;
        api.estado.cruces = { ...DEFECTO, ...(api.estado.cruces && typeof api.estado.cruces === 'object' ? api.estado.cruces : {}) };
        const e = estado();
        if (!PALETAS[e.paleta]) e.paleta = DEFECTO.paleta;
        if (!api.FORMATOS[e.formato]) e.formato = DEFECTO.formato;
        llenar();

        const cambiar = () => { api.guardarEstado(); api.renderDiferido(false); };
        api.$('cr-texto').addEventListener('input', (ev) => { e.texto = ev.target.value; cambiar(); });
        api.$('cr-titulo').addEventListener('input', (ev) => { e.titulo = ev.target.value; cambiar(); });
        api.$('cr-torneo').addEventListener('input', (ev) => { e.torneo = ev.target.value; cambiar(); });
        api.$('cr-pie').addEventListener('input', (ev) => { e.pie = ev.target.value; cambiar(); });
        api.$('cr-btn-ejemplo').addEventListener('click', () => { e.texto = EJEMPLO; llenar(); cambiar(); });
        api.$('cr-btn-borrar').addEventListener('click', () => { e.texto = ''; llenar(); cambiar(); });
        api.$('cr-chk-escudos').addEventListener('change', (ev) => {
            api.estado.usarEscudos = ev.target.checked;
            const otro = api.$('chk-escudos'); if (otro) otro.checked = ev.target.checked;
            cambiar();
        });
        api.$('cr-tiles-paleta').addEventListener('click', (ev) => {
            const b = ev.target.closest('[data-cr-paleta]'); if (!b) return;
            e.paleta = b.dataset.crPaleta; construirTiles(); cambiar();
        });
        api.$('cr-tiles-formato').addEventListener('click', (ev) => {
            const b = ev.target.closest('[data-cr-formato]'); if (!b) return;
            e.formato = b.dataset.crFormato; construirTiles(); cambiar();
        });
        api.$('cr-previews').addEventListener('click', (ev) => {
            const v = ev.target.closest('[data-ver]');
            if (v) { api.abrirVisor(Number(v.dataset.ver)); return; }
            const d = ev.target.closest('[data-descargar]');
            if (d) api.descargar([Number(d.dataset.descargar)], d);
        });
        api.$('cr-btn-todos').addEventListener('click', (ev) => api.descargar(api.nombresActuales(), ev.currentTarget));
    }

    window.crucesLiga = { iniciar, render, parsear, htmlCruce, llenar };
})();

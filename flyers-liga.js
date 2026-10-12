// ============================================================
// GENERADOR DE FLYERS DE PROGRAMACIÓN — Liga A.F.O.CH
// Pegás la programación (formato WhatsApp) y se reparte sola en varios
// flyers en blanco y celeste, listos para descargar en PNG.
//
// Depende de (cargadas en flyers-liga.html):
//   - htmlToImage (cdn "html-to-image") -> para descargar el PNG
//   - afoch-logo.png en la misma carpeta (o lo subís desde la página)
//
// Formato del texto que entiende:
//   *PRIMERA DIVISION*          -> categoría (barra celeste)
//   *ZONA SUR F7*               -> zona / grupo dentro de la categoría
//   * CAMPING FC VS DEP. ARG    -> partido (acepta *, - o • al inicio)
//   16:30 - A VS B              -> partido con horario (opcional)
//   ---                         -> corte manual: empieza un flyer nuevo
// ============================================================

// ------------------------------------------------------------
// CONFIGURACIÓN (colores, medidas y formatos)
// ------------------------------------------------------------
const RUTA_LOGO = 'afoch-logo.png';

// Paleta base (diseño "Celeste clásico"). Cada diseño pisa solo lo que cambia.
const BASE_COLORES = {
    celeste:      '#35A7EA',   // acento principal (barras, chips de hora)
    celesteClaro: '#7CC4F2',   // segundo tono del degradé
    celesteSuave: '#BFE3F8',   // líneas y bordes suaves
    celesteFondo: '#F0F8FE',   // fondo de filas alternas
    azul:         '#0673C8',
    tinta:        '#0B3A66',   // color del texto principal
    fondo:        '#FFFFFF',   // fondo del flyer
    cabA: '#35A7EA', cabB: '#7CC4F2', cabBorde: '#BFE3F8',   // cabecera
    pieA: '#7CC4F2', pieB: '#35A7EA', pieBorde: '#BFE3F8',   // barra inferior
    cabTexto: '#FFFFFF', sombraTitulo: 'rgba(6,115,200,0.45)',
    catTexto: '#FFFFFF', catSombra: '#0673C8',
    chipTexto: '#FFFFFF', chipBg: '#FFFFFF', acento: '#0673C8',
    logoSombra: 'rgba(6,115,200,0.35)', logoTexto: '#0673C8',
    marca: '#35A7EA',
};

// Diseños disponibles. Además de los colores, cambian la forma de la cabecera
// ('diagonal' | 'recta'), de la barra de categoría ('inclinada' | 'plana') y de las filas ('cinta' | 'linea').
const DISENOS = {
    clasico: { label: 'Celeste clásico', sub: 'Blanco y celeste',
        cab: 'diagonal', cat: 'inclinada', fila: 'cinta', marca: true, colores: {} },
    noche: { label: 'Noche neón', sub: 'Fondo oscuro y cian',
        cab: 'diagonal', cat: 'inclinada', fila: 'cinta', marca: true,
        colores: {
            fondo: '#0A1626', tinta: '#E8F3FF', celeste: '#22D3EE', celesteClaro: '#67E8F9',
            celesteSuave: '#1F4062', celesteFondo: '#10243A', azul: '#0E7490', acento: '#67E8F9',
            chipBg: '#0F2A44', chipTexto: '#04141F', catTexto: '#04141F', catSombra: '#0E7490',
            cabA: '#14406E', cabB: '#0B2A4A', cabBorde: '#22D3EE', pieA: '#0B2A4A', pieB: '#14406E', pieBorde: '#22D3EE',
            sombraTitulo: 'rgba(34,211,238,0.55)', logoSombra: 'rgba(34,211,238,0.45)', logoTexto: '#0E7490', marca: '#22D3EE',
        } },
    cancha: { label: 'Verde cancha', sub: 'Verde y blanco',
        cab: 'recta', cat: 'plana', fila: 'cinta', marca: true,
        colores: {
            fondo: '#F4FAF2', tinta: '#0F3D1E', celeste: '#1E9E4A', celesteClaro: '#4CC26E',
            celesteSuave: '#BFE6C9', celesteFondo: '#E6F4E8', azul: '#14703A', acento: '#14703A',
            cabA: '#14703A', cabB: '#2FAE5A', cabBorde: '#BFE6C9', pieA: '#2FAE5A', pieB: '#14703A', pieBorde: '#BFE6C9',
            sombraTitulo: 'rgba(10,70,30,0.5)', catSombra: '#14703A', logoSombra: 'rgba(20,112,58,0.35)', logoTexto: '#14703A', marca: '#1E9E4A',
        } },
    fuego: { label: 'Rojo y negro', sub: 'Fuerte, estilo clásico de fútbol',
        cab: 'recta', cat: 'inclinada', fila: 'linea', marca: false,
        colores: {
            fondo: '#FFFFFF', tinta: '#111111', celeste: '#D62828', celesteClaro: '#F25C54',
            celesteSuave: '#F0B9B6', celesteFondo: '#FBEDEC', azul: '#B01E1E', acento: '#B01E1E',
            cabA: '#111111', cabB: '#2B2B2B', cabBorde: '#D62828', pieA: '#2B2B2B', pieB: '#111111', pieBorde: '#D62828',
            sombraTitulo: 'rgba(214,40,40,0.85)', catSombra: '#111111', logoSombra: 'rgba(214,40,40,0.5)', logoTexto: '#B01E1E', marca: '#D62828',
        } },
    limpio: { label: 'Minimal', sub: 'Negro, blanco y un detalle dorado',
        cab: 'recta', cat: 'plana', fila: 'linea', marca: false,
        colores: {
            fondo: '#FFFFFF', tinta: '#18181B', celeste: '#18181B', celesteClaro: '#3F3F46',
            celesteSuave: '#D4D4D8', celesteFondo: '#F4F4F5', azul: '#18181B', acento: '#18181B',
            cabA: '#18181B', cabB: '#27272A', cabBorde: '#F5B700', pieA: '#27272A', pieB: '#18181B', pieBorde: '#F5B700',
            sombraTitulo: 'rgba(0,0,0,0)', catSombra: 'rgba(0,0,0,0)', logoSombra: 'rgba(245,183,0,0.7)', logoTexto: '#18181B', marca: '#18181B',
        } },
    gala: { label: 'Azul y dorado', sub: 'Elegante, para finales y eventos',
        cab: 'diagonal', cat: 'inclinada', fila: 'cinta', marca: true,
        colores: {
            fondo: '#FFFDF6', tinta: '#0A2540', celeste: '#C9A227', celesteClaro: '#E6C65A',
            celesteSuave: '#EBDDA8', celesteFondo: '#FBF5DF', azul: '#0A2540', acento: '#0A2540',
            chipTexto: '#0A2540', catTexto: '#0A2540', catSombra: '#0A2540',
            cabA: '#0A2540', cabB: '#16406B', cabBorde: '#C9A227', pieA: '#16406B', pieB: '#0A2540', pieBorde: '#C9A227',
            sombraTitulo: 'rgba(0,0,0,0.5)', logoSombra: 'rgba(201,162,39,0.6)', logoTexto: '#0A2540', marca: '#C9A227',
        } },
};
const COLOR = { ...BASE_COLORES };
let TEMA = DISENOS.clasico;
// Deja activo el diseño `id` (pisa COLOR y TEMA). Se llama al armar cada flyer.
function aplicarDiseno(id) {
    TEMA = DISENOS[id] || DISENOS.clasico;
    Object.assign(COLOR, BASE_COLORES, TEMA.colores);
    return TEMA;
}

const TITULAR = "'Bebas Neue', 'Oswald', 'Arial Narrow', sans-serif";
const TEXTO   = "'Barlow Condensed', 'Arial Narrow', sans-serif";
// Especificación para Google Fonts (se usa también para incrustar la letra en el PNG)
const FUENTES_GF = ['Bebas+Neue', 'Barlow+Condensed:wght@500;600;700;800'];

// Alturas (px de diseño) de cada tipo de renglón. Son fijas para poder
// calcular cuántos entran en cada flyer.
const H = { cat: 40, zona: 26, fila: 28, sede: 15 };   // sede = renglón extra "CANCHA: X" bajo un partido
// Alto de un partido: los que se juegan en otra cancha llevan un renglón extra
const costoFila = (f) => H.fila + (f && f.nota && f.l ? H.sede : 0);
const CAB_H = 128;   // alto de la cabecera celeste
const PIE_H = 38;    // alto de la barra inferior
const PAD_SUP = 10;
const PAD_INF = 14;
const MARGEN = 24;   // margen lateral
const MANTENER_JUNTAS = 5;  // zonas de hasta N partidos se mantienen en un solo flyer

// Se diseña a 540 px de ancho y se exporta al doble (1080 px).
const ANCHO_SALIDA = 1080;
const FORMATOS = {
    vertical: { label: 'Post vertical', sub: '1080 × 1350 · feed 4:5', ancho: 540, alto: 675, seguroSup: 0,  seguroInf: 0,  archivo: 'vertical' },
    historia: { label: 'Historia',      sub: '1080 × 1920 · Stories',  ancho: 540, alto: 960, seguroSup: 50, seguroInf: 70, archivo: 'historia' },
};

function alturaUtil(f) {
    return f.alto - CAB_H - PIE_H - PAD_SUP - PAD_INF - f.seguroSup - f.seguroInf;
}

// ------------------------------------------------------------
// 1) PARSER: texto de WhatsApp -> bloques { cat, zona, filas[], salto }
// ------------------------------------------------------------
const DIAS_ABREV = {
    lunes: 'LUN', martes: 'MAR', miercoles: 'MIÉ', 'miércoles': 'MIÉ',
    jueves: 'JUE', viernes: 'VIE', sabado: 'SÁB', 'sábado': 'SÁB', domingo: 'DOM',
};
const RE_DIA_FECHA = /[\s\-–—]*(?:\b(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\b)?[\s\-–—]*(?:(\d{1,2})\s*\/\s*(\d{1,2}))?[\s\-–—]*$/i;

// Horario al final: "20:00 Hs", "15:30HS", "9HS", "– 9:30 Hs."  (sin minutos hace falta el "HS")
const RE_HORA_FIN = /[\s\-–—]*\b(\d{1,2})(?:\s*:\s*(\d{2})\s*(?:hs?\b\.?)?|\s*hs?\b\.?)\s*$/i;
// Estado al final en lugar de horario: PENDIENTE / PEN, A CONFIRMAR, SUSPENDIDO, POSTERGADO
const RE_ESTADO_FIN = /[\s\-–—]*\b(pendiente|pend|pen|a\s+confirmar|a\s+conf|a\s+definir|suspendido|susp|postergado|post)\b\.?\s*$/i;
function etiquetaEstado(palabra) {
    const p = palabra.toLowerCase().replace(/\s+/g, ' ');
    if (p.startsWith('pen')) return 'PEN';
    if (p.startsWith('a conf')) return 'A CONF';
    if (p.startsWith('a def')) return 'A DEF';
    if (p.startsWith('susp')) return 'SUSP';
    return 'POST';
}
const horaDe = (h, m) => `${String(h).padStart(2, '0')}:${m || '00'}`;

// Acepta cosas como:
//   Marcelino Ugarte Vs. Deportivo Comercio – Miércoles 23/09 – 20:00 Hs
//   M. UGARTE VS CAMPING FC DOMINGO 11/10 15HS
//   CAMPING FC VS DEP. ARGENTINO PENDIENTE        (el horario muestra PEN)
//   MARA VS PROGRESISTA LUNES 12/10 16HS (PROGRESISTA)   (nota entre paréntesis)
//   Zona Sur Fecha 2: Avenida FC Vs. M. Ugarte – Martes 22/09 – 20:00 Hs
//   Cooperativa Vs. Avenida – 19:30 Hs            (sin día)
//   16:30 - A VS B                                (horario al principio)
function parsearFila(linea) {
    let t = linea.replace(/\t/g, ' ').replace(/^[*\-•·▪►>]+\s*/, '').replace(/\s+/g, ' ').trim();
    let hora = '', dia = '', etiqueta = '', nota = '', pend = false;

    // Horario al principio: "16:30 - A VS B"
    const mh = t.match(/^(\d{1,2})\s*[:.hH]\s*(\d{2})\s*(?:hs?\b\.?)?\s*[-–—]\s*(.*)$/i);
    if (mh) {
        hora = horaDe(mh[1], mh[2]);
        t = mh[3].trim();
    }
    // Nota entre paréntesis al final: "(PROGRESISTA)"
    const mn = t.match(/\s*\(([^)]{1,30})\)\s*$/);
    if (mn) { nota = mn[1].replace(/^(cancha|sede|en|local)\s*[:\-]?\s+/i, '').trim(); t = t.slice(0, mn.index).trim(); }
    // Estado al final: PENDIENTE, PEN, A CONFIRMAR...
    const me = t.match(RE_ESTADO_FIN);
    if (me && me.index > 0) { pend = etiquetaEstado(me[1]); t = t.slice(0, me.index).trim(); }
    // Horario al final
    if (!hora) {
        const mt = t.match(RE_HORA_FIN);
        if (mt) {
            hora = horaDe(mt[1], mt[2]);
            t = t.slice(0, mt.index).trim();
        }
    }
    // Día y fecha al final: "Miércoles 23/09", "Jueves - 24/09", "23/09"
    const md = t.match(RE_DIA_FECHA);
    if (md && (md[1] || md[2])) {
        const nombre = md[1] ? (DIAS_ABREV[md[1].toLowerCase()] || md[1].toUpperCase()) : '';
        const fecha = md[2] ? `${md[2].padStart(2, '0')}/${md[3].padStart(2, '0')}` : '';
        dia = [nombre, fecha].filter(Boolean).join(' ');
        t = t.slice(0, md.index).trim();
    }
    t = t.replace(/[\s\-–—.]+$/, '').trim();
    if (pend) hora = pend;   // el estado reemplaza al horario

    // Etiqueta antes de los dos puntos: "Zona Sur Fecha 2: A Vs B"
    const ml = t.match(/^([^:]{1,40}?)\s*:\s*(.+)$/);
    if (ml && !/\bvs\b/i.test(ml[1])) {
        etiqueta = ml[1].trim();
        t = ml[2].trim();
    }

    const base = { hora, pend: !!pend, dia, etiqueta, nota };
    const partes = t.split(/\s+VS\.?\s+/i);
    if (partes.length === 2 && partes[0].trim() && partes[1].trim()) {
        return { ...base, l: partes[0].trim(), v: partes[1].trim() };
    }
    return { ...base, texto: t };
}

// Títulos con datos pegados: "LOCAL PROGRESISTA VIERNES 09/10 20:30HS" -> "LOCAL PROGRESISTA · VIE 09/10 · 20:30 HS"
function detalleTitulo(txt) {
    let t = txt, hora = '', dia = '';
    const mt = t.match(RE_HORA_FIN);
    if (mt) { hora = horaDe(mt[1], mt[2]); t = t.slice(0, mt.index).trim(); }
    const md = t.match(RE_DIA_FECHA);
    if (md && (md[1] || md[2])) {
        const nombre = md[1] ? (DIAS_ABREV[md[1].toLowerCase()] || md[1].toUpperCase()) : '';
        const fecha = md[2] ? `${md[2].padStart(2, '0')}/${md[3].padStart(2, '0')}` : '';
        dia = [nombre, fecha].filter(Boolean).join(' ');
        t = t.slice(0, md.index).trim();
    }
    return [t, dia, hora && `${hora} HS`].filter(Boolean).join(' · ');
}

function parsearProgramacion(texto) {
    const bloques = [];
    let cat = null, zona = null, saltoPend = false;
    let seccion = [];   // bloques creados desde el último título (para agrupar por etiqueta)

    // Un título puede traer algo después de un guion largo: "Veteranos +40 Fecha 4 – Sábado - Dep. Comercio (Local)"
    const titulo = (txt) => {
        txt = txt.replace(/\s+/g, ' ').replace(/\s*:$/, '').trim();
        if (/^PROGRAMACI[OÓ]N/i.test(txt) && !bloques.length && cat === null) return;
        if (/^ZONA\b/i.test(txt)) {
            zona = detalleTitulo(txt.split(/\s+[–—]\s+/).join(' · '));
        } else {
            const partes = txt.split(/\s+[–—]\s+/);
            let c = partes[0];
            let extra = partes.slice(1).join(' · ');
            // "VETERANOS +40 LOCAL AVENIDA FC FECHA 5" -> categoría "VETERANOS +40" y detalle "LOCAL AVENIDA FC FECHA 5"
            const ml = c.match(/^(.*?)\s+(LOCAL\b.*)$/i);
            if (ml) { c = ml[1]; extra = [ml[2], extra].filter(Boolean).join(' · '); }
            cat = c;
            zona = extra ? detalleTitulo(extra) : null;
        }
        seccion = [];
    };

    String(texto || '').split(/\r?\n/).forEach(crudo => {
        const t = crudo.replace(/\t/g, ' ').trim();
        if (!t) return;
        if (/^[-=_]{3,}$/.test(t)) { saltoPend = true; seccion = []; return; }

        // Título con asteriscos: *PRIMERA DIVISION*
        const h = t.match(/^\*+\s*([^*].*?)\s*\*+$/);
        if (h) { titulo(h[1].trim()); return; }

        // Línea sin viñeta y sin "VS" = título (formato copiado de un documento)
        const conVineta = /^[*\-•·▪►>]/.test(t);
        if (!conVineta && !/\sVS\.?\s/i.test(t)) { titulo(t); return; }

        const fila = parsearFila(t);
        if (!fila.texto && !fila.l) return;

        // Zona efectiva: la etiqueta del partido ("Fecha 2", "Zona Sur Fecha 2") agrupa partidos
        let z = zona;
        if (fila.etiqueta) {
            z = /^ZONA\b/i.test(fila.etiqueta) || !zona ? fila.etiqueta : `${zona} · ${fila.etiqueta}`;
        }
        let bloque = seccion.find(b => b.zona === z);
        if (!bloque) {
            bloque = { cat: cat || '', zona: z, filas: [], salto: saltoPend };
            saltoPend = false;
            seccion.push(bloque);
            bloques.push(bloque);
        }
        bloque.filas.push(fila);
    });
    return bloques;
}

// ------------------------------------------------------------
// 2) PAGINADO: reparte los bloques en flyers sin dejar títulos huérfanos
//    y balanceando para que el último no quede casi vacío.
// ------------------------------------------------------------
function paginarCon(bloques, cap) {
    const paginas = [];
    let pag = null;
    const nueva = () => { pag = { items: [], usado: 0, cat: null }; paginas.push(pag); };

    bloques.forEach(b => {
        if (!pag) nueva();
        else if (b.salto && pag.items.length) nueva();

        let i = 0;
        while (i < b.filas.length) {
            const necesitaCat = !!b.cat && pag.cat !== b.cat;
            const cab = (necesitaCat ? H.cat : 0) + (b.zona ? H.zona : 0);
            // Las zonas chicas (hasta 5 partidos) no se parten entre dos flyers
            const resta = b.filas.length - i;
            const minFilas = resta <= MANTENER_JUNTAS ? resta : 2;
            const costoMin = b.filas.slice(i, i + minFilas).reduce((a, fl) => a + costoFila(fl), 0);
            if (pag.items.length && pag.usado + cab + costoMin > cap) { nueva(); continue; }

            if (necesitaCat) { pag.items.push({ t: 'cat', txt: b.cat }); pag.usado += H.cat; pag.cat = b.cat; }
            if (b.zona) { pag.items.push({ t: 'zona', txt: b.zona }); pag.usado += H.zona; }

            let puestas = 0;
            while (i < b.filas.length && (puestas < minFilas || pag.usado + costoFila(b.filas[i]) <= cap)) {
                pag.items.push({ t: 'fila', ...b.filas[i] });
                pag.usado += costoFila(b.filas[i]);
                i++; puestas++;
            }
            if (i < b.filas.length) nueva();
        }
    });
    return paginas;
}

function repartir(bloques, cap) {
    const base = paginarCon(bloques, cap);
    const n = base.length;
    if (n <= 1) return base;
    // Busca la altura más chica que sigue dando la misma cantidad de flyers
    let lo = Math.floor(cap * 0.35), hi = cap, mejor = base;
    while (hi - lo > 1) {
        const mid = Math.floor((lo + hi) / 2);
        const p = paginarCon(bloques, mid);
        if (p.length === n) { hi = mid; mejor = p; } else { lo = mid; }
    }
    return mejor;
}

// ------------------------------------------------------------
// 3) DISEÑO DE CADA FLYER (HTML con estilos en línea, tamaño de diseño)
// ------------------------------------------------------------
const px = (n) => `${Math.round(n * 10) / 10}px`;
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, m => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]
    ));
}
// Tamaño de letra que entra en `maxPx` de ancho
const ajustar = (txt, base, maxPx, factor = 0.46) => Math.min(base, maxPx / (Math.max(String(txt).length, 1) * factor));

function logoHtml(logo, tam = 84) {
    const caja = `width:${tam}px; height:${tam}px; border-radius:9999px; background:#fff; display:flex; align-items:center; justify-content:center; overflow:hidden; box-shadow:0 3px 0 ${COLOR.logoSombra};`;
    if (logo) {
        return `<div style="${caja}"><img src="${logo}" alt="A.F.O.CH" draggable="false" style="max-width:${Math.round(tam * 0.81)}px; max-height:${Math.round(tam * 0.81)}px; object-fit:contain; display:block;" /></div>`;
    }
    return `<div style="${caja}"><span style="font-family:${TITULAR}; font-size:${Math.round(tam * 0.25)}px; line-height:1; color:${COLOR.logoTexto}; letter-spacing:0.03em; text-align:center;">A.F.<br>O.CH</span></div>`;
}

function itemHtml(it, sc, ctx) {
    if (it.t === 'cat') {
        const tam = ajustar(it.txt, 24 * sc, 440, 0.46);
        const plana = TEMA.cat === 'plana';
        const barra = plana
            ? `height:100%; background:linear-gradient(90deg, ${COLOR.celeste}, ${COLOR.celesteClaro}); border-left:7px solid ${COLOR.cabBorde}; border-radius:2px; display:flex; align-items:center; padding:0 14px; box-sizing:border-box;`
            : `height:100%; background:linear-gradient(90deg, ${COLOR.celeste}, ${COLOR.celesteClaro}); transform:skewX(-10deg); border-radius:4px; display:flex; align-items:center; padding:0 18px; box-shadow:3px 3px 0 ${COLOR.catSombra};`;
        const txt = plana ? '' : 'transform:skewX(10deg);';
        return `<div style="height:${px(H.cat * sc)}; padding-top:${px(10 * sc)}; box-sizing:border-box;">
            <div style="${barra}">
                <span style="display:block; ${txt} font-family:${TITULAR}; font-size:${px(tam)}; line-height:1; color:${COLOR.catTexto}; letter-spacing:0.04em; white-space:nowrap; text-transform:uppercase;">${esc(it.txt)}</span>
            </div></div>`;
    }
    if (it.t === 'zona') {
        return `<div style="height:${px(H.zona * sc)}; display:flex; align-items:center; gap:8px; padding:0 4px; box-sizing:border-box;">
            <span style="width:8px; height:8px; background:${COLOR.celeste}; transform:rotate(45deg); flex-shrink:0;"></span>
            <span style="font-family:${TEXTO}; font-weight:800; font-size:${px(15 * sc)}; line-height:1; letter-spacing:0.07em; color:${COLOR.tinta}; text-transform:uppercase; white-space:nowrap;">${esc(it.txt)}</span>
            <span style="flex:1; height:2px; background:${COLOR.celesteSuave}; border-radius:2px;"></span>
        </div>`;
    }
    // fila
    const alt = ctx.nFila++ % 2 === 0;
    const fondo = alt ? COLOR.celesteFondo : 'transparent';
    const alto = px(H.fila * sc);
    const conSede = !!(it.nota && it.l);   // el local juega en otra cancha
    const altoTotal = px((H.fila + (conSede ? H.sede : 0)) * sc);
    const linea = TEMA.fila === 'linea';
    const base = `height:${altoTotal}; background:${linea ? 'transparent' : fondo}; ${linea ? `border-bottom:1px solid ${COLOR.celesteSuave};` : 'border-radius:6px;'} padding:0 6px; box-sizing:border-box;`;
    const k = Math.min(sc, 1.1);   // las columnas de día y hora crecen menos que el resto
    // Los estados (PEN, A CONF...) se ven con borde punteado en lugar de relleno
    const estiloHora = it.pend
        ? `background:transparent; border:1.5px dashed ${COLOR.acento}; color:${COLOR.acento};`
        : `background:${COLOR.celeste}; color:${COLOR.chipTexto};`;
    const wDia = Math.round(68 * k), wHora = Math.round(48 * k);
    const dia = ctx.hayDia
        ? `<div style="display:flex; align-items:center; justify-content:center;">${it.dia ? `<span style="display:block; width:100%; box-sizing:border-box; text-align:center; background:${COLOR.chipBg}; border:1.5px solid ${COLOR.celesteSuave}; color:${COLOR.acento}; font-family:${TEXTO}; font-weight:800; font-size:${px(12.5 * k)}; line-height:1; padding:3px 0 2px; border-radius:4px; letter-spacing:0.03em; white-space:nowrap;">${esc(it.dia)}</span>` : ''}</div>`
        : '';
    const hora = ctx.hayHora
        ? `<div style="display:flex; align-items:center; justify-content:flex-start;">${it.hora ? `<span style="display:block; width:100%; box-sizing:border-box; text-align:center; ${estiloHora} font-family:${TITULAR}; font-size:${px(14 * k)}; line-height:1; padding:3px 0 2px; border-radius:4px; letter-spacing:0.04em;">${esc(it.hora)}</span>` : ''}</div>`
        : '';
    if (it.texto) {
        const tam = ajustar(it.texto, 18 * sc, 440, 0.44);
        return `<div style="${base} display:flex; align-items:center; justify-content:center; gap:10px;">
            ${it.dia ? `<span style="color:${COLOR.acento}; font-family:${TEXTO}; font-weight:800; font-size:${px(13 * k)}; line-height:1; white-space:nowrap;">${esc(it.dia)}</span>` : ''}
            ${it.hora ? `<span style="${estiloHora} font-family:${TITULAR}; font-size:${px(14 * k)}; line-height:1; padding:3px 6px 2px; border-radius:4px;">${esc(it.hora)}</span>` : ''}
            <span style="font-family:${TEXTO}; font-weight:800; font-size:${px(tam)}; line-height:1; color:${COLOR.tinta}; text-transform:uppercase; letter-spacing:0.02em; white-space:nowrap;">${esc(it.texto)}</span></div>`;
    }
    const columnas = 3 + (ctx.hayDia ? 1 : 0) + (ctx.hayHora ? 1 : 0);
    const reservado = (ctx.hayDia ? wDia : 0) + (ctx.hayHora ? wHora : 0);
    const anchoNombre = (ctx.anchoUtil - 12 - 38 - reservado - (columnas - 1) * 6) / 2 - 2;
    const nombre = (txt, align) => {
        const tam = ajustar(txt, 18 * sc, anchoNombre, 0.45);
        return `<div style="text-align:${align}; font-family:${TEXTO}; font-weight:800; font-size:${px(tam)}; line-height:1; color:${COLOR.tinta}; text-transform:uppercase; letter-spacing:0.02em; white-space:nowrap; overflow:hidden;">${esc(txt)}</div>`;
    };
    const cols = `${ctx.hayDia ? `${wDia}px ` : ''}${ctx.hayHora ? `${wHora}px ` : ''}minmax(0,1fr) 38px minmax(0,1fr)`;
    const sede = conSede
        ? `<div style="height:${px(H.sede * sc)}; display:flex; align-items:flex-start; justify-content:center; gap:4px;">
            <svg width="9" height="11" viewBox="0 0 24 30" style="flex-shrink:0; margin-top:1px;"><path fill-rule="evenodd" fill="${COLOR.acento}" d="M12 0C5.4 0 0 5.2 0 11.7 0 20 12 30 12 30s12-10 12-18.3C24 5.2 18.6 0 12 0zM12 16.5a4.8 4.8 0 100-9.6 4.8 4.8 0 000 9.6z"/></svg>
            <span style="font-family:${TEXTO}; font-weight:800; font-size:${px(11.5 * k)}; line-height:1; letter-spacing:0.1em; color:${COLOR.acento}; text-transform:uppercase; white-space:nowrap;">Cancha: ${esc(it.nota)}</span>
        </div>`
        : '';
    return `<div style="${base}">
        <div style="height:${alto}; display:grid; grid-template-columns:${cols}; align-items:center; column-gap:6px;">
            ${dia}${hora}
            ${nombre(it.l, 'right')}
            <div style="display:flex; justify-content:center;"><span style="font-family:${TITULAR}; font-size:${px(12 * sc)}; line-height:1; color:${COLOR.acento}; background:${COLOR.chipBg}; border:1.5px solid ${COLOR.celesteSuave}; border-radius:9999px; padding:3px 6px 2px; letter-spacing:0.05em;">VS</span></div>
            ${nombre(it.v, 'left')}
        </div>${sede}
    </div>`;
}

function htmlFlyer(pag, i, total, c) {
    aplicarDiseno(c.diseno);
    const f = c.f;
    const tamLogo = Math.max(50, Math.min(124, Number(c.logoTam) || 84));   // diámetro del logo (px de diseño)
    const topLogo = f.seguroSup + Math.max(4, Math.round(60 - tamLogo / 2));
    const recta = TEMA.cab === 'recta';
    const cabAtras  = recta ? 'none' : 'polygon(0 0, 100% 0, 100% calc(100% - 4px), 0 100%)';
    const cabFrente = recta ? 'none' : 'polygon(0 0, 100% 0, 100% calc(100% - 18px), 0 100%)';
    const pieAtras  = recta ? 'none' : 'polygon(0 12px, 100% 2px, 100% 100%, 0 100%)';
    const pieFrente = recta ? 'none' : 'polygon(0 14px, 100% 0, 100% 100%, 0 100%)';
    const avail = alturaUtil(f);
    const sc = Math.max(1, Math.min(1.35, avail / Math.max(pag.usado, 1)));
    const ctx = {
        nFila: 0,
        hayHora: pag.items.some(it => it.t === 'fila' && it.hora),
        hayDia: pag.items.some(it => it.t === 'fila' && it.dia),
        anchoUtil: f.ancho - MARGEN * 2,
    };
    const cuerpoTop = CAB_H + f.seguroSup + PAD_SUP;
    const cuerpoAlto = f.alto - cuerpoTop - PIE_H - f.seguroInf - PAD_INF;
    const items = pag.items.map(it => itemHtml(it, sc, ctx)).join('');

    // Título (se puede escribir en varias líneas)
    const lineasTitulo = (c.titulo || '').split('\n').map(s => s.trim()).filter(Boolean);
    const maxLinea = Math.max(...lineasTitulo.map(s => s.length), 1);
    const anchoTitulo = f.ancho - (MARGEN + tamLogo + 14) - MARGEN;
    const tamTitulo = Math.min(lineasTitulo.length > 1 ? 36 : 46, anchoTitulo / (maxLinea * 0.44));
    const tituloHtml = lineasTitulo.map(s => esc(s)).join('<br>');

    const fecha = (c.fecha || '').trim();
    const pie = (c.pie || '').trim();
    const contador = total > 1 ? `${i + 1}/${total}` : '';

    return `<div data-flyer="${i}" style="position:relative; width:${f.ancho}px; height:${f.alto}px; background:${COLOR.fondo}; overflow:hidden; font-family:${TEXTO};">

        <!-- Marca de cancha (círculo central y línea media) -->
        <div style="position:absolute; left:${f.ancho / 2 - 150}px; top:${cuerpoTop + cuerpoAlto / 2 - 150}px; width:300px; height:300px; border-radius:9999px; border:5px solid ${COLOR.marca}; opacity:${TEMA.marca ? 0.07 : 0}; box-sizing:border-box;"></div>
        <div style="position:absolute; left:0; right:0; top:${cuerpoTop + cuerpoAlto / 2 - 2}px; height:5px; background:${COLOR.marca}; opacity:${TEMA.marca ? 0.07 : 0};"></div>

        <!-- Cabecera -->
        <div style="position:absolute; left:0; top:0; width:100%; height:${CAB_H + f.seguroSup + 10}px; background:${COLOR.cabBorde}; clip-path:${cabAtras};"></div>
        <div style="position:absolute; left:0; top:0; width:100%; height:${CAB_H + f.seguroSup}px; background:linear-gradient(110deg, ${COLOR.cabA} 0%, ${COLOR.cabB} 100%); clip-path:${cabFrente};"></div>
        <div style="position:absolute; left:${MARGEN}px; top:${topLogo}px;">${logoHtml(c.logo, tamLogo)}</div>
        <div style="position:absolute; left:${MARGEN + tamLogo + 14}px; top:${f.seguroSup + 18}px; width:${anchoTitulo}px; height:84px; display:flex; flex-direction:column; justify-content:center;">
            <div style="font-family:${TITULAR}; font-size:${px(tamTitulo)}; line-height:0.98; color:${COLOR.cabTexto}; letter-spacing:0.03em; text-shadow:2px 2px 0 ${COLOR.sombraTitulo}; text-transform:uppercase;">${tituloHtml}</div>
            ${fecha ? `<div style="margin-top:7px;"><span style="display:inline-block; background:${COLOR.chipBg}; color:${COLOR.acento}; font-family:${TEXTO}; font-weight:800; font-size:15px; line-height:1; padding:4px 12px; border-radius:9999px; letter-spacing:0.08em; text-transform:uppercase; white-space:nowrap;">${esc(fecha)}</span></div>` : ''}
        </div>

        <!-- Partidos -->
        <div style="position:absolute; left:${MARGEN}px; right:${MARGEN}px; top:${cuerpoTop}px;">${items}</div>

        <!-- Barra inferior -->
        <div style="position:absolute; left:0; bottom:0; width:100%; height:${PIE_H + f.seguroInf + 10}px; background:${COLOR.pieBorde}; clip-path:${pieAtras};"></div>
        <div style="position:absolute; left:0; bottom:0; width:100%; height:${PIE_H + f.seguroInf}px; background:linear-gradient(110deg, ${COLOR.pieA} 0%, ${COLOR.pieB} 100%); clip-path:${pieFrente};"></div>
        <div style="position:absolute; left:${MARGEN}px; right:${MARGEN}px; bottom:${f.seguroInf}px; height:${PIE_H}px; display:flex; align-items:center; justify-content:space-between; padding-top:8px; box-sizing:border-box;">
            <span style="font-family:${TEXTO}; font-weight:800; font-size:15px; letter-spacing:0.1em; color:${COLOR.cabTexto}; text-transform:uppercase; white-space:nowrap;">${esc(pie)}</span>
            <span style="font-family:${TITULAR}; font-size:20px; letter-spacing:0.06em; color:${COLOR.cabTexto};">${contador}</span>
        </div>
    </div>`;
}

// Fuera del navegador (tests en Node) exportamos solo la lógica pura
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parsearProgramacion, parsearFila, paginarCon, repartir, alturaUtil, FORMATOS, H, htmlFlyer, DISENOS, aplicarDiseno };
}

// ============================================================
// A PARTIR DE ACÁ: TODO LO QUE TOCA LA PÁGINA (solo en el navegador)
// ============================================================
if (typeof document !== 'undefined') {

const CLAVE_LS = 'afoch_flyers_estado_v1';
const TEXTO_EJEMPLO = `1ra y Sub-20
Zona Sur - Fecha 6
•  Marcelino Ugarte Vs. Deportivo Comercio – Miércoles 23/09 – 20:00 Hs
•  Villa Dora Vs. Avenida FC – Jueves  24/09 – 20:30 Hs
•  Sportivo Español Vs. R. Escalada – Sábado 26/09 – 16:00 Hs
•  Progresista Vs. M. Renz – Sábado 26/09 – 17:00 Hs
•  Deportivo Argentino Vs. Alvear – Domingo 27/09 – 14:00 Hs
Zona Norte Reprogramado - Fecha 5
•  Fuimos Héroes Vs. Unión – Martes 22/09 – 19:30 Hs.
•  Racing FC Vs. Urien – Miércoles 23/09 – 19:30 Hs
Zona Norte Fecha 6
•  Deportivo E. Urien Vs. Fuimos Héroes – Sábado 26/09 – 18:00 Hs
•  Juventud Vs. Mártires Córdoba – Domingo 27/09 – 15:00 Hs
•  Unión Vs. Cooperativa – Domingo 27/09 – 17:00 Hs
•  Polidep. Samuhú Vs. Racing FC – Domingo 27/09 – 15:30 Hs 
Juveniles
•  Zona Sur Fecha 2: Avenida FC Vs. M. Ugarte – Martes 22/09 – 20:00 Hs
•  Zona Norte Fecha 2: Tigre Vs. Sportivo Español – Viernes 25/09 – 21:00 Hs
•  Zona Sur Fecha 2: R. Escalada Vs. Villa Dora Viernes 25/09 - 19:30 Hs 
•  Zona Sur Fecha 1: 90 Viviendas Vs. M. Ugarte – Sábado 26/09 – 9:30 Hs
•  Zona Sur Fecha 2: Camping FC Vs. Dep. Comercio – Domingo 27/09 – 16:00 Hs
•  Zona Sur Fecha 2: Dep. Argentino Vs. M. Renz – Domingo 27/09 – 11:30 Hs
Infantiles 
Zona Sur  
•  Fecha 2: M. Ugarte Vs. C. Juvenil – Sábado 26/09 – 9:30 Hs
•  Fecha 2: Dep. Argentino Vs. M. Renz – Domingo 27/09 – 9:00 Hs
Zona Centro Fecha 3
•  Alvear Vs. Avenida FC – Jueves - 24/09 -  19:30 Hs
•  Progresista Vs. 90 Viviendas - Domingo 27/09 - 9:30 Hs
•   Camping Fc Vs. Villa Dora – Domingo 27/09 – 9:30 Hs
Zona Norte 
•  Fecha 2: Racing Vs. Cooperativa – Jueves 24/09 – 21:30 Hs
•  Fecha 3: Tigre Vs. Union – Viernes 25/09 - 19:00 Hs
Veteranos +40  Fecha 4 – Sábado - Dep. Comercio (Local)
•  Cooperativa Vs. Avenida – 19:30 Hs
•  Progresista Vs. Racing – 21:30 Hs 
•  Fuimos Heroes Vs. Dep. Comercio – 22:30 Hs`;

const ESTADO_INICIAL = {
    formato: 'vertical',
    diseno: 'clasico',
    logoTam: 84,
    texto: TEXTO_EJEMPLO,
    titulo: 'PROGRAMACIÓN\nTENTATIVA',
    fecha: '',
    pie: 'A.F.O.CH',
    logoSubido: '',
};
let estado = cargarEstado();
let logoArchivo = null;   // logo leído de afoch-logo.png (data URL), o false si no está
let flyersActuales = [];  // [{ nombre, nodo }] listos para exportar
let htmlsActuales = [];   // HTML de cada flyer (para la vista ampliada)
let visorIdx = -1;        // flyer abierto en la vista ampliada (-1 = cerrada)

function cargarEstado() {
    try {
        const g = JSON.parse(localStorage.getItem(CLAVE_LS) || 'null');
        if (g && typeof g === 'object') {
            const e = { ...ESTADO_INICIAL, ...g };
            if (!FORMATOS[e.formato]) e.formato = ESTADO_INICIAL.formato;
            if (!DISENOS[e.diseno]) e.diseno = ESTADO_INICIAL.diseno;
            e.logoTam = Math.max(50, Math.min(124, Number(e.logoTam) || 84));
            return e;
        }
    } catch (err) { /* storage bloqueado o JSON roto */ }
    return { ...ESTADO_INICIAL };
}
function guardarEstado() {
    try { localStorage.setItem(CLAVE_LS, JSON.stringify(estado)); }
    catch (err) {
        try { localStorage.setItem(CLAVE_LS, JSON.stringify({ ...estado, logoSubido: '' })); } catch (e2) { /* sin storage */ }
    }
}

const $ = (id) => document.getElementById(id);

// ---------- Logo ----------
async function cargarLogoArchivo() {
    if (logoArchivo !== null) return logoArchivo;
    try {
        const img = await new Promise((resolve, reject) => {
            const i = new Image();
            i.onload = () => resolve(i);
            i.onerror = reject;
            i.src = RUTA_LOGO;
        });
        const esc2 = Math.min(1, 300 / img.naturalHeight);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.naturalWidth * esc2));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * esc2));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        logoArchivo = canvas.toDataURL('image/png');
    } catch (err) {
        console.warn('No se pudo cargar el logo de la liga:', err);
        logoArchivo = false;
    }
    return logoArchivo;
}
const logoActual = () => estado.logoSubido || logoArchivo || '';

// ---------- Render ----------
let temporizador = null;
function renderDiferido() { clearTimeout(temporizador); temporizador = setTimeout(render, 160); }

async function render() {
    await cargarLogoArchivo();
    const f = FORMATOS[estado.formato];
    const bloques = parsearProgramacion(estado.texto);
    const paginas = repartir(bloques, alturaUtil(f));
    const total = paginas.length;
    const nPartidos = bloques.reduce((a, b) => a + b.filas.length, 0);
    const contexto = { f, diseno: estado.diseno, logoTam: estado.logoTam, titulo: estado.titulo, fecha: estado.fecha, pie: estado.pie, logo: logoActual() };

    $('resumen').textContent = total
        ? `${nPartidos} ${nPartidos === 1 ? 'partido' : 'partidos'} → ${total} ${total === 1 ? 'flyer' : 'flyers'}`
        : 'Pegá la programación para ver los flyers.';
    $('btn-todos').disabled = !total;

    const ESC_PREV = 270 / f.ancho;
    const htmls = paginas.map((p, i) => htmlFlyer(p, i, total, contexto));
    htmlsActuales = htmls;

    // Vistas previas (escaladas)
    $('previews').innerHTML = htmls.map((h, i) => `
        <div class="flex flex-col gap-2 items-center">
            <div data-ver="${i}" title="Tocá para ampliar" style="width:${f.ancho * ESC_PREV}px; height:${f.alto * ESC_PREV}px; cursor:zoom-in;" class="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                <div style="width:${f.ancho}px; height:${f.alto}px; transform:scale(${ESC_PREV}); transform-origin: top left;">${h}</div>
            </div>
            <div class="flex gap-2">
                <button type="button" data-ver="${i}" class="btn-sec">Ampliar</button>
                <button type="button" data-descargar="${i}" class="btn-sec">Descargar ${i + 1}/${total}</button>
            </div>
        </div>`).join('');

    // Copia a tamaño real, fuera de pantalla, de donde sale el PNG
    $('export').innerHTML = htmls.map(h => `<div style="width:${f.ancho}px; height:${f.alto}px;">${h}</div>`).join('');
    flyersActuales = paginas.map((p, i) => ({
        nombre: `afoch-programacion-${f.archivo}-${i + 1}de${total}.png`,
        nodo: $('export').querySelector(`[data-flyer="${i}"]`),
    }));
    if (visorIdx >= 0) pintarVisor();   // si la vista ampliada está abierta, se actualiza
}

// ---------- Vista ampliada (para leer bien sin descargar) ----------
function pintarVisor() {
    const n = htmlsActuales.length;
    if (!n) { cerrarVisor(); return; }
    visorIdx = Math.max(0, Math.min(n - 1, visorIdx));
    const f = FORMATOS[estado.formato];
    const esc = Math.min((window.innerWidth - 24) / f.ancho, (window.innerHeight - 96) / f.alto);
    const caja = $('visor-caja');
    caja.style.width = `${f.ancho * esc}px`;
    caja.style.height = `${f.alto * esc}px`;
    caja.innerHTML = `<div style="width:${f.ancho}px; height:${f.alto}px; transform:scale(${esc}); transform-origin: top left;">${htmlsActuales[visorIdx]}</div>`;
    $('visor-pos').textContent = n > 1 ? `${visorIdx + 1} / ${n}` : '';
    $('visor-prev').classList.toggle('hidden', n < 2);
    $('visor-next').classList.toggle('hidden', n < 2);
    $('visor-prev').disabled = visorIdx === 0;
    $('visor-next').disabled = visorIdx === n - 1;
}
function abrirVisor(i) {
    visorIdx = i;
    $('visor').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    pintarVisor();
}
function cerrarVisor() {
    visorIdx = -1;
    $('visor').style.display = 'none';
    $('visor-caja').innerHTML = '';
    document.body.style.overflow = '';
}

// ---------- Tipografía para la exportación ----------
const cacheCSSFuentes = new Map();
function blobADataURL(blob) {
    return new Promise((resolve, reject) => {
        const l = new FileReader();
        l.onload = () => resolve(l.result);
        l.onerror = reject;
        l.readAsDataURL(blob);
    });
}
async function cssFuenteIncrustada(gf) {
    if (cacheCSSFuentes.has(gf)) return cacheCSSFuentes.get(gf);
    const resp = await fetch(`https://fonts.googleapis.com/css2?family=${gf}&display=swap`);
    if (!resp.ok) throw new Error(`Google Fonts respondió ${resp.status}`);
    const css = await resp.text();
    let bloques = [];
    const conSubset = /\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g;
    let m;
    while ((m = conSubset.exec(css)) !== null) {
        if (m[1] === 'latin' || m[1] === 'latin-ext') bloques.push(m[2]);
    }
    if (!bloques.length) bloques = css.match(/@font-face\s*\{[^}]*\}/g) || [];
    if (!bloques.length) throw new Error('El CSS de la fuente vino vacío.');
    const incrustados = await Promise.all(bloques.map(async (bloque) => {
        const urls = [...new Set((bloque.match(/url\((https?:[^)]+)\)/g) || [])
            .map(u => u.slice(4, -1).replace(/^['"]|['"]$/g, '')))];
        let salida = bloque;
        for (const url of urls) {
            const r = await fetch(url);
            if (!r.ok) throw new Error(`No se pudo bajar la fuente (${r.status})`);
            salida = salida.split(url).join(await blobADataURL(await r.blob()));
        }
        return salida;
    }));
    const resultado = incrustados.join('\n');
    cacheCSSFuentes.set(gf, resultado);
    return resultado;
}

async function prepararFuentes() {
    if (document.fonts && document.fonts.load) {
        await Promise.all([
            '400 24px "Bebas Neue"', '500 24px "Barlow Condensed"',
            '600 24px "Barlow Condensed"', '700 24px "Barlow Condensed"', '800 24px "Barlow Condensed"',
        ].map(x => document.fonts.load(x).catch(() => null)));
        await document.fonts.ready;
    }
    let css = '';
    try {
        css = (await Promise.all(FUENTES_GF.map(cssFuenteIncrustada))).join('\n');
    } catch (err) {
        console.warn('No se pudo incrustar la tipografía a mano:', err);
    }
    return css;
}

// ---------- Descarga ----------
function mostrarToast(mensaje, tipo = 'ok') {
    const t = $('toast');
    t.textContent = mensaje;
    t.className = `toast ${tipo === 'error' ? 'toast-error' : 'toast-ok'}`;
    clearTimeout(mostrarToast.id);
    mostrarToast.id = setTimeout(() => t.classList.add('hidden'), 3500);
}
const esMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const pausa = (ms) => new Promise(r => setTimeout(r, ms));

async function generarArchivos(indices) {
    clearTimeout(temporizador);
    await render();
    const f = FORMATOS[estado.formato];
    const cssFuente = await prepararFuentes();
    const archivos = [];
    for (const i of indices) {
        const item = flyersActuales[i];
        if (!item || !item.nodo) continue;
        const opciones = {
            pixelRatio: ANCHO_SALIDA / f.ancho,
            backgroundColor: COLOR.fondo,
            style: { transform: 'none' },
            cacheBust: true,
        };
        if (cssFuente) opciones.fontEmbedCSS = cssFuente;
        await htmlToImage.toPng(item.nodo, { ...opciones, pixelRatio: 1 }); // pasada de calentamiento
        const dataUrl = await htmlToImage.toPng(item.nodo, opciones);
        const blob = await (await fetch(dataUrl)).blob();
        archivos.push({ nombre: item.nombre, dataUrl, file: new File([blob], item.nombre, { type: 'image/png' }) });
    }
    return archivos;
}

function bajar(a) {
    const el = document.createElement('a');
    el.download = a.nombre;
    el.href = a.dataUrl;
    document.body.appendChild(el);
    el.click();
    el.remove();
}

async function descargar(indices, boton) {
    const label = boton.textContent;
    boton.disabled = true;
    boton.textContent = 'Generando…';
    try {
        const archivos = await generarArchivos(indices);
        if (!archivos.length) throw new Error('No hay flyers para exportar.');
        const files = archivos.map(a => a.file);
        if (esMobile() && navigator.canShare && navigator.canShare({ files })) {
            await navigator.share({ files, title: 'Programación A.F.O.CH' });
            mostrarToast('¡Listo! Guardalos o compartilos desde el panel.');
        } else {
            for (let k = 0; k < archivos.length; k++) {
                bajar(archivos[k]);
                if (k < archivos.length - 1) await pausa(450);
            }
            mostrarToast(archivos.length > 1 ? `${archivos.length} imágenes descargadas.` : 'Imagen descargada.');
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Error exportando los flyers:', err);
            mostrarToast('No se pudo generar la imagen. Probá de nuevo.', 'error');
        }
    } finally {
        boton.disabled = false;
        boton.textContent = label;
    }
}

// ---------- Controles ----------
function construirFormatos() {
    $('tiles-formato').innerHTML = Object.entries(FORMATOS).map(([k, f]) => `
        <button type="button" class="tile" data-formato="${k}">
            <span class="tile-forma" style="width:${k === 'historia' ? '0.8rem' : '1rem'}; height:${k === 'historia' ? '1.4rem' : '1.25rem'};"></span>
            <span class="tile-label">${f.label}</span><span class="tile-sub">${f.sub}</span>
        </button>`).join('');
    sincronizarFormato();
}
function construirDisenos() {
    $('tiles-diseno').innerHTML = Object.entries(DISENOS).map(([k, d]) => {
        const c = { ...BASE_COLORES, ...d.colores };
        return `<button type="button" class="tile" data-diseno="${k}">
            <span style="display:block; width:100%; height:1.35rem; border-radius:0.35rem; background:${c.fondo}; border:1px solid #cbd5e1; position:relative; overflow:hidden; margin-bottom:0.2rem;">
                <span style="position:absolute; left:0; right:0; top:0; height:0.55rem; background:linear-gradient(90deg, ${c.cabA}, ${c.cabB}); border-bottom:2px solid ${c.cabBorde};"></span>
                <span style="position:absolute; left:6px; right:6px; bottom:3px; height:0.28rem; border-radius:2px; background:${c.celeste};"></span>
            </span>
            <span class="tile-label">${d.label}</span><span class="tile-sub">${d.sub}</span>
        </button>`;
    }).join('');
    sincronizarDiseno();
}
function sincronizarDiseno() {
    document.querySelectorAll('[data-diseno]').forEach(b => b.classList.toggle('tile-activo', b.dataset.diseno === estado.diseno));
}
function sincronizarFormato() {
    document.querySelectorAll('[data-formato]').forEach(b => b.classList.toggle('tile-activo', b.dataset.formato === estado.formato));
}
function llenarInputs() {
    $('in-texto').value = estado.texto;
    $('in-titulo').value = estado.titulo;
    $('in-fecha').value = estado.fecha;
    $('in-pie').value = estado.pie;
    $('logo-estado').textContent = estado.logoSubido ? 'Logo subido desde tu equipo' : (logoArchivo ? 'Usando afoch-logo.png' : 'Sin logo (se muestra el texto A.F.O.CH)');
    $('btn-logo-quitar').classList.toggle('hidden', !estado.logoSubido);
    $('in-logo-tam').value = estado.logoTam;
    $('logo-tam-valor').textContent = `${Math.round(estado.logoTam / 84 * 100)}%`;
}

function leerLogo(archivo) {
    if (!archivo || !/^image\//.test(archivo.type)) { mostrarToast('Elegí un archivo de imagen.', 'error'); return; }
    const lector = new FileReader();
    lector.onload = () => {
        const img = new Image();
        img.onload = () => {
            const esc2 = Math.min(1, 300 / img.naturalHeight);
            const c = document.createElement('canvas');
            c.width = Math.max(1, Math.round(img.naturalWidth * esc2));
            c.height = Math.max(1, Math.round(img.naturalHeight * esc2));
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
            estado.logoSubido = c.toDataURL('image/png');
            guardarEstado(); llenarInputs(); render();
        };
        img.onerror = () => mostrarToast('No se pudo leer esa imagen.', 'error');
        img.src = lector.result;
    };
    lector.readAsDataURL(archivo);
}

async function iniciar() {
    construirFormatos();
    construirDisenos();
    llenarInputs();

    $('tiles-diseno').addEventListener('click', (e) => {
        const b = e.target.closest('[data-diseno]');
        if (!b) return;
        estado.diseno = b.dataset.diseno;
        guardarEstado(); sincronizarDiseno(); render();
    });
    $('in-texto').addEventListener('input', (e) => { estado.texto = e.target.value; guardarEstado(); renderDiferido(); });
    $('in-titulo').addEventListener('input', (e) => { estado.titulo = e.target.value; guardarEstado(); renderDiferido(); });
    $('in-fecha').addEventListener('input', (e) => { estado.fecha = e.target.value; guardarEstado(); renderDiferido(); });
    $('in-pie').addEventListener('input', (e) => { estado.pie = e.target.value; guardarEstado(); renderDiferido(); });
    $('tiles-formato').addEventListener('click', (e) => {
        const b = e.target.closest('[data-formato]');
        if (!b) return;
        estado.formato = b.dataset.formato;
        guardarEstado(); sincronizarFormato(); render();
    });
    $('in-logo-tam').addEventListener('input', (e) => {
        estado.logoTam = Number(e.target.value);
        $('logo-tam-valor').textContent = `${Math.round(estado.logoTam / 84 * 100)}%`;
        guardarEstado(); renderDiferido();
    });
    $('btn-logo-tam-reset').addEventListener('click', () => { estado.logoTam = 84; guardarEstado(); llenarInputs(); render(); });
    $('in-logo').addEventListener('change', (e) => { leerLogo(e.target.files[0]); e.target.value = ''; });
    $('btn-logo-quitar').addEventListener('click', () => { estado.logoSubido = ''; guardarEstado(); llenarInputs(); render(); });
    $('btn-ejemplo').addEventListener('click', () => { estado.texto = TEXTO_EJEMPLO; guardarEstado(); llenarInputs(); render(); });
    $('btn-limpiar').addEventListener('click', () => { estado.texto = ''; guardarEstado(); llenarInputs(); render(); });
    $('previews').addEventListener('click', (e) => {
        const v = e.target.closest('[data-ver]');
        if (v) { abrirVisor(Number(v.dataset.ver)); return; }
        const b = e.target.closest('[data-descargar]');
        if (b) descargar([Number(b.dataset.descargar)], b);
    });
    $('btn-todos').addEventListener('click', (e) => {
        descargar(flyersActuales.map((_, i) => i), e.currentTarget);
    });

    $('visor-cerrar').addEventListener('click', cerrarVisor);
    $('visor').addEventListener('click', (e) => { if (e.target === $('visor')) cerrarVisor(); });
    $('visor-prev').addEventListener('click', () => { visorIdx--; pintarVisor(); });
    $('visor-next').addEventListener('click', () => { visorIdx++; pintarVisor(); });
    $('visor-desc').addEventListener('click', (e) => { if (visorIdx >= 0) descargar([visorIdx], e.currentTarget); });
    document.addEventListener('keydown', (e) => {
        if (visorIdx < 0) return;
        if (e.key === 'Escape') cerrarVisor();
        else if (e.key === 'ArrowLeft' && visorIdx > 0) { visorIdx--; pintarVisor(); }
        else if (e.key === 'ArrowRight' && visorIdx < htmlsActuales.length - 1) { visorIdx++; pintarVisor(); }
    });
    window.addEventListener('resize', () => { if (visorIdx >= 0) pintarVisor(); });

    await render();
    llenarInputs();
    // Cuando terminan de cargar las tipografías, se vuelve a dibujar con las definitivas
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(render);
}

iniciar();

} // fin del bloque solo-navegador
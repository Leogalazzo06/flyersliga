// ============================================================
// GENERADOR DE FLYERS DE PROGRAMACIÓN — Liga A.F.O.CH
// Pegás la programación (formato WhatsApp) y se reparte sola en varios
// flyers en blanco y celeste, listos para descargar en PNG.
//
// Escudos: cargás la lista de equipos (con su imagen) y, al pegar la programación,
// cada nombre se reconoce solo y se dibuja con su escudo (ver sección ESCUDOS).
//
// Pestaña "Árbitros": la misma programación se vuelve una planilla (hora, partido,
// cancha, árbitro principal y asistentes) agrupada por día y categoría/zona.
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
// ('diagonal' | 'recta' | 'curva'), de la barra de categoría ('inclinada' | 'plana' | 'pildora'), de las filas ('cinta' | 'linea' | 'tarjeta')
// y de los chips de hora ('pildora' = redondeados).
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
    // ---- Diseños modernos: cabecera curva, categorías en píldora, partidos en tarjetas ----
    aurora: { label: 'Aurora', sub: 'Violeta y fucsia sobre oscuro',
        cab: 'curva', cat: 'pildora', fila: 'tarjeta', chip: 'pildora', marca: false,
        colores: {
            fondo: '#0F0A24', tinta: '#F3EEFF', celeste: '#8B5CF6', celesteClaro: '#D946EF',
            celesteSuave: '#3A2D75', celesteFondo: '#1B1342', azul: '#A78BFA', acento: '#C4B5FD',
            chipBg: '#1B1342', chipTexto: '#FFFFFF', catTexto: '#FFFFFF', catSombra: 'rgba(0,0,0,0)',
            cabA: '#5B21B6', cabB: '#C026D3', cabBorde: '#D946EF', pieA: '#C026D3', pieB: '#5B21B6', pieBorde: '#8B5CF6',
            sombraTitulo: 'rgba(0,0,0,0)', logoSombra: 'rgba(217,70,239,0.5)', logoTexto: '#5B21B6', marca: '#8B5CF6',
        } },
    grafito: { label: 'Grafito y lima', sub: 'Oscuro con acento lima',
        cab: 'recta', cat: 'plana', fila: 'tarjeta', chip: 'pildora', marca: false,
        colores: {
            fondo: '#101114', tinta: '#F4F5F7', celeste: '#A3E635', celesteClaro: '#D9F99D',
            celesteSuave: '#2F3239', celesteFondo: '#1A1C21', azul: '#A3E635', acento: '#BEF264',
            chipBg: '#1A1C21', chipTexto: '#101114', catTexto: '#101114', catSombra: 'rgba(0,0,0,0)',
            cabA: '#1B1D22', cabB: '#2A2D34', cabBorde: '#A3E635', pieA: '#2A2D34', pieB: '#1B1D22', pieBorde: '#A3E635',
            sombraTitulo: 'rgba(0,0,0,0)', logoSombra: 'rgba(163,230,53,0.6)', logoTexto: '#101114', marca: '#A3E635',
        } },
    menta: { label: 'Menta', sub: 'Verde agua, fresco y limpio',
        cab: 'curva', cat: 'pildora', fila: 'tarjeta', chip: 'pildora', marca: false,
        colores: {
            fondo: '#F5FBFA', tinta: '#0A2A27', celeste: '#14B8A6', celesteClaro: '#5EEAD4',
            celesteSuave: '#BFEDE6', celesteFondo: '#E8F7F4', azul: '#0F766E', acento: '#0F766E',
            chipTexto: '#042F2C', catTexto: '#042F2C', catSombra: 'rgba(0,0,0,0)',
            cabA: '#0F766E', cabB: '#14B8A6', cabBorde: '#5EEAD4', pieA: '#14B8A6', pieB: '#0F766E', pieBorde: '#5EEAD4',
            sombraTitulo: 'rgba(0,0,0,0)', logoSombra: 'rgba(15,118,110,0.35)', logoTexto: '#0F766E', marca: '#14B8A6',
        } },
    atardecer: { label: 'Atardecer', sub: 'Naranja y rosa, cálido',
        cab: 'curva', cat: 'pildora', fila: 'linea', chip: 'pildora', marca: false,
        colores: {
            fondo: '#FFF9F5', tinta: '#3B1420', celeste: '#F97316', celesteClaro: '#FB7185',
            celesteSuave: '#FFD9C7', celesteFondo: '#FFF0E8', azul: '#E11D48', acento: '#C2410C',
            chipTexto: '#2B0B14', catTexto: '#2B0B14', catSombra: 'rgba(0,0,0,0)',
            cabA: '#EA580C', cabB: '#DB2777', cabBorde: '#FDBA74', pieA: '#DB2777', pieB: '#EA580C', pieBorde: '#FDBA74',
            sombraTitulo: 'rgba(80,10,30,0.35)', logoSombra: 'rgba(219,39,119,0.35)', logoTexto: '#C2410C', marca: '#F97316',
        } },
    electrico: { label: 'Azul eléctrico', sub: 'Azul intenso, estilo deportivo',
        cab: 'recta', cat: 'pildora', fila: 'tarjeta', chip: 'pildora', marca: false,
        colores: {
            fondo: '#F6F8FF', tinta: '#0B1640', celeste: '#2563EB', celesteClaro: '#60A5FA',
            celesteSuave: '#C7D7FE', celesteFondo: '#EAF0FF', azul: '#1D4ED8', acento: '#1D4ED8',
            chipTexto: '#FFFFFF', catTexto: '#FFFFFF', catSombra: 'rgba(0,0,0,0)',
            cabA: '#1E3A8A', cabB: '#2563EB', cabBorde: '#93C5FD', pieA: '#2563EB', pieB: '#1E3A8A', pieBorde: '#93C5FD',
            sombraTitulo: 'rgba(0,0,0,0)', logoSombra: 'rgba(37,99,235,0.35)', logoTexto: '#1D4ED8', marca: '#2563EB',
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
// Con escudos las filas son más altas para que el escudo se vea bien (se decide en render())
const H_FILA = { normal: 28, escudos: 36 };
let CAB_H = 128;   // alto de la cabecera celeste (cambia con la densidad)
let PIE_H = 38;    // alto de la barra inferior (cambia con la densidad)
const PAD_SUP = 10;
const PAD_INF = 14;
const MARGEN = 24;   // margen lateral
let MANTENER_JUNTAS = 5;  // zonas de hasta N partidos se mantienen en un solo flyer (cambia con la densidad)

// Densidad: cuántos partidos entran por flyer. "Normal" es el tamaño de siempre; las otras achican
// renglones, cabecera, pie y letra para que salgan menos imágenes.
const DENSIDADES = {
    normal:   { label: 'Normal',       sub: 'Letra grande',        cab: 128, pie: 38, fila: 28, filaEsc: 36, cat: 40, zona: 26, sede: 15, juntas: 5, fs: 1,    tit: 1,    logo: 1,    pieFs: 1 },
    compacta: { label: 'Compacta',     sub: 'Más partidos',        cab: 104, pie: 30, fila: 24, filaEsc: 30, cat: 32, zona: 22, sede: 13, juntas: 3, fs: 0.9,  tit: 0.82, logo: 0.85, pieFs: 0.9 },
    minima:   { label: 'Muy compacta', sub: 'El máximo por flyer', cab: 88,  pie: 26, fila: 21, filaEsc: 26, cat: 28, zona: 19, sede: 12, juntas: 2, fs: 0.8,  tit: 0.7,  logo: 0.7,  pieFs: 0.82 },
};
let DENS = DENSIDADES.normal;
// Deja activa la densidad `id`. El alto de las filas (H.fila) lo fija render() según haya escudos o no.
function aplicarDensidad(id) {
    DENS = DENSIDADES[id] || DENSIDADES.normal;
    H.cat = DENS.cat; H.zona = DENS.zona; H.sede = DENS.sede;
    CAB_H = DENS.cab; PIE_H = DENS.pie; MANTENER_JUNTAS = DENS.juntas;
    return DENS;
}

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

// Resultados: "Dep. Argentino 2 Vs. Sp. Español 0" -> fila con l, v, gl (goles local), gv (goles visitante)
function parsearResultados(texto) {
    const bloques = parsearProgramacion(texto);
    bloques.forEach(b => b.filas.forEach(f => {
        if (!f.l || !f.v) return;
        const ml = f.l.match(/^(.*\S)\s+\(?(\d{1,2})\)?$/);
        const mv = f.v.match(/^(.*\S)\s+\(?(\d{1,2})\)?$/);
        if (!ml || !mv) return;   // sin los dos marcadores se deja como partido sin resultado
        f.l = ml[1].trim(); f.gl = Number(ml[2]);
        f.v = mv[1].trim(); f.gv = Number(mv[2]);
    }));
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
// ESCUDOS: lista de equipos y detección por nombre
//   Cada equipo tiene: nombre, otros nombres (alias) y escudo (imagen).
//   El nombre que viene en la programación se compara con la lista ignorando
//   mayúsculas, tildes, "FC"/"Club" y abreviaturas ("Dep." = Deportivo,
//   "M. Ugarte" = Marcelino Ugarte). Si dos equipos empatan, no se elige ninguno.
// ------------------------------------------------------------
const PALABRAS_VACIAS = new Set(['fc', 'cf', 'ca', 'club', 'de', 'del', 'la', 'el', 'los', 'las', 'y']);
function sinAcentos(s) {
    return String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
function tokensEquipo(nombre) {
    const toks = sinAcentos(nombre).split(/[^a-z0-9]+/).filter(t => t && !PALABRAS_VACIAS.has(t));
    return { fuertes: toks.filter(t => t.length > 1), iniciales: toks.filter(t => t.length === 1), norm: toks.join(' ') };
}
// Dos palabras coinciden si son iguales o una es el comienzo de la otra ("dep" / "deportivo")
const tokIgual = (a, b) => a === b || (Math.min(a.length, b.length) >= 3 && (a.startsWith(b) || b.startsWith(a)));
function puntajeEquipo(q, t) {
    if (q.norm && q.norm === t.norm) return 2;
    if (!q.fuertes.length || !t.fuertes.length) return 0;
    const [chico, grande] = q.fuertes.length <= t.fuertes.length ? [q, t] : [t, q];
    const usados = new Set();
    for (const p of chico.fuertes) {   // todas las palabras del nombre más corto tienen que estar en el más largo
        const k = grande.fuertes.findIndex((g, n) => !usados.has(n) && tokIgual(p, g));
        if (k < 0) return 0;
        usados.add(k);
    }
    const bono = (ini, fuertes) => ini.filter(x => fuertes.some(w => w[0] === x)).length * 0.05;
    return chico.fuertes.length / grande.fuertes.length + bono(q.iniciales, t.fuertes) + bono(t.iniciales, q.fuertes);
}
// Devuelve una función nombre -> equipo (o null si no hay uno claro)
function crearBuscador(equipos) {
    const prep = (equipos || []).map(eq => {
        const nombres = [eq.nombre, ...String(eq.alias || '').split(/[,;|]/)].map(tokensEquipo).filter(t => t.norm);
        return { eq, nombres };
    }).filter(p => p.nombres.length);
    const memo = new Map();
    return (nombre) => {
        const clave = sinAcentos(nombre).replace(/\s+/g, ' ').trim();
        if (memo.has(clave)) return memo.get(clave);
        const q = tokensEquipo(nombre);
        let mejor = null, pm = 0, empate = false;
        prep.forEach(p => {
            const pt = Math.max(...p.nombres.map(n => puntajeEquipo(q, n)));
            if (pt <= 0) return;
            if (pt > pm + 1e-9) { mejor = p.eq; pm = pt; empate = false; }
            else if (Math.abs(pt - pm) < 1e-9) empate = true;
        });
        const r = (mejor && !empate && pm >= 0.5) ? mejor : null;
        memo.set(clave, r);
        return r;
    };
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
    if (it.t === 'html') return it.html;   // bloque ya armado (lo usa la pestaña Posiciones)
    if (it.t === 'cat') {
        const tam = ajustar(it.txt, 24 * sc * DENS.fs, 440, 0.46);
        const pildora = TEMA.cat === 'pildora';
        const plana = TEMA.cat === 'plana' || pildora;
        const barra = pildora
            ? `height:100%; background:linear-gradient(90deg, ${COLOR.celeste}, ${COLOR.celesteClaro}); border-radius:9999px; display:flex; align-items:center; padding:0 20px; box-sizing:border-box;`
            : plana
            ? `height:100%; background:linear-gradient(90deg, ${COLOR.celeste}, ${COLOR.celesteClaro}); border-left:7px solid ${COLOR.cabBorde}; border-radius:2px; display:flex; align-items:center; padding:0 14px; box-sizing:border-box;`
            : `height:100%; background:linear-gradient(90deg, ${COLOR.celeste}, ${COLOR.celesteClaro}); transform:skewX(-10deg); border-radius:4px; display:flex; align-items:center; padding:0 18px; box-shadow:3px 3px 0 ${COLOR.catSombra};`;
        const txt = plana ? '' : 'transform:skewX(10deg);';
        return `<div style="height:${px(H.cat * sc)}; padding-top:${px(10 * sc * (H.cat / 40))}; box-sizing:border-box;">
            <div style="${barra}">
                <span style="display:block; ${txt} font-family:${TITULAR}; font-size:${px(tam)}; line-height:1; color:${COLOR.catTexto}; letter-spacing:0.04em; white-space:nowrap; text-transform:uppercase;">${esc(it.txt)}</span>
            </div></div>`;
    }
    if (it.t === 'zona') {
        return `<div style="height:${px(H.zona * sc)}; display:flex; align-items:center; gap:8px; padding:0 4px; box-sizing:border-box;">
            <span style="width:8px; height:8px; background:${COLOR.celeste}; transform:rotate(45deg); flex-shrink:0;"></span>
            <span style="font-family:${TEXTO}; font-weight:800; font-size:${px(15 * sc * DENS.fs)}; line-height:1; letter-spacing:0.07em; color:${COLOR.tinta}; text-transform:uppercase; white-space:nowrap;">${esc(it.txt)}</span>
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
    const tarjeta = TEMA.fila === 'tarjeta';
    const rChip = TEMA.chip === 'pildora' ? '9999px' : '4px';
    // Tarjeta: fondo redondeado con borde fino y una barrita de color a la izquierda; el borde transparente de 2px deja aire entre partidos
    const base = tarjeta
        ? `height:${altoTotal}; background:${COLOR.celesteFondo}; background-clip:padding-box; border-top:2px solid transparent; border-bottom:2px solid transparent; border-radius:12px; box-shadow:inset 0 0 0 1px ${COLOR.celesteSuave}, inset 4px 0 0 0 ${COLOR.celeste}; padding:0 10px; box-sizing:border-box;`
        : `height:${altoTotal}; background:${linea ? 'transparent' : fondo}; ${linea ? `border-bottom:1px solid ${COLOR.celesteSuave};` : 'border-radius:6px;'} padding:0 6px; box-sizing:border-box;`;
    const k = Math.min(sc, 1.1) * DENS.fs;   // las columnas de día y hora crecen menos que el resto
    // Los estados (PEN, A CONF...) se ven con borde punteado en lugar de relleno
    const estiloHora = it.pend
        ? `background:transparent; border:1.5px dashed ${COLOR.acento}; color:${COLOR.acento};`
        : `background:${COLOR.celeste}; color:${COLOR.chipTexto};`;
    const wDia = Math.round(68 * k), wHora = Math.round(48 * k);
    const dia = ctx.hayDia
        ? `<div style="display:flex; align-items:center; justify-content:center;">${it.dia ? `<span style="display:block; width:100%; box-sizing:border-box; text-align:center; background:${COLOR.chipBg}; border:1.5px solid ${COLOR.celesteSuave}; color:${COLOR.acento}; font-family:${TEXTO}; font-weight:800; font-size:${px(12.5 * k)}; line-height:1; padding:3px 0 2px; border-radius:${rChip}; letter-spacing:0.03em; white-space:nowrap;">${esc(it.dia)}</span>` : ''}</div>`
        : '';
    const hora = ctx.hayHora
        ? `<div style="display:flex; align-items:center; justify-content:flex-start;">${it.hora ? `<span style="display:block; width:100%; box-sizing:border-box; text-align:center; ${estiloHora} font-family:${TITULAR}; font-size:${px(14 * k)}; line-height:1; padding:3px 0 2px; border-radius:${rChip}; letter-spacing:0.04em;">${esc(it.hora)}</span>` : ''}</div>`
        : '';
    if (it.texto) {
        const tam = ajustar(it.texto, 18 * sc * DENS.fs, 440, 0.44);
        return `<div style="${base} display:flex; align-items:center; justify-content:center; gap:10px;">
            ${it.dia ? `<span style="color:${COLOR.acento}; font-family:${TEXTO}; font-weight:800; font-size:${px(13 * k)}; line-height:1; white-space:nowrap;">${esc(it.dia)}</span>` : ''}
            ${it.hora ? `<span style="${estiloHora} font-family:${TITULAR}; font-size:${px(14 * k)}; line-height:1; padding:3px 6px 2px; border-radius:${rChip};">${esc(it.hora)}</span>` : ''}
            <span style="font-family:${TEXTO}; font-weight:800; font-size:${px(tam)}; line-height:1; color:${COLOR.tinta}; text-transform:uppercase; letter-spacing:0.02em; white-space:nowrap;">${esc(it.texto)}</span></div>`;
    }
    const columnas = 3 + (ctx.hayDia ? 1 : 0) + (ctx.hayHora ? 1 : 0);
    const wVs = ctx.hayRes ? 70 : 38;   // ancho de la columna central (VS o marcador)
    const conMarcador = it.gl != null && it.gv != null;
    const reservado = (ctx.hayDia ? wDia : 0) + (ctx.hayHora ? wHora : 0);
    // Escudo: cuadrado fijo junto al "VS" (se reserva el lugar aunque falte, para que los nombres queden alineados)
    const escT = ctx.hayEscudos ? Math.round(H.fila * sc - 6) : 0;
    const escGap = 6;
    const anchoNombre = (ctx.anchoUtil - 12 - wVs - reservado - (columnas - 1) * 6) / 2 - 2 - (escT ? escT + escGap : 0);
    const nombre = (txt, align) => {
        const tam = ajustar(txt, 18 * sc * DENS.fs, anchoNombre, 0.45);
        const estiloTxt = `font-family:${TEXTO}; font-weight:800; font-size:${px(tam)}; line-height:1; color:${COLOR.tinta}; text-transform:uppercase; letter-spacing:0.02em; white-space:nowrap; overflow:hidden;`;
        if (!escT) return `<div style="text-align:${align}; ${estiloTxt}">${esc(txt)}</div>`;
        const url = ctx.escudoDe ? ctx.escudoDe(txt) : '';
        const caja = `<div style="width:${escT}px; height:${escT}px; flex-shrink:0; display:flex; align-items:center; justify-content:center;">${url ? `<img src="${url}" alt="" draggable="false" style="max-width:100%; max-height:100%; object-fit:contain; display:block;" />` : ''}</div>`;
        const t = `<span style="display:block; min-width:0; ${estiloTxt}">${esc(txt)}</span>`;
        return `<div style="display:flex; align-items:center; gap:${escGap}px; min-width:0; justify-content:${align === 'right' ? 'flex-end' : 'flex-start'};">${align === 'right' ? t + caja : caja + t}</div>`;
    };
    const cols = `${ctx.hayDia ? `${wDia}px ` : ''}${ctx.hayHora ? `${wHora}px ` : ''}minmax(0,1fr) ${wVs}px minmax(0,1fr)`;
    const sede = conSede
        ? `<div style="height:${px(H.sede * sc)}; display:flex; align-items:flex-start; justify-content:center; gap:4px;">
            <svg width="9" height="11" viewBox="0 0 24 30" style="flex-shrink:0; margin-top:1px;"><path fill-rule="evenodd" fill="${COLOR.acento}" d="M12 0C5.4 0 0 5.2 0 11.7 0 20 12 30 12 30s12-10 12-18.3C24 5.2 18.6 0 12 0zM12 16.5a4.8 4.8 0 100-9.6 4.8 4.8 0 000 9.6z"/></svg>
            <span style="font-family:${TEXTO}; font-weight:800; font-size:${px(11.5 * k)}; line-height:1; letter-spacing:0.1em; color:${COLOR.acento}; text-transform:uppercase; white-space:nowrap;">Cancha: ${esc(it.nota)}</span>
        </div>`
        : '';
    return `<div style="${base}">
        <div style="height:${alto}; ${tarjeta ? 'margin-top:-2px; ' : ''}display:grid; grid-template-columns:${cols}; align-items:center; column-gap:6px;">
            ${dia}${hora}
            ${nombre(it.l, 'right')}
            <div style="display:flex; justify-content:center;">${conMarcador
                ? `<span style="font-family:${TITULAR}; font-size:${px(18 * sc * DENS.fs)}; line-height:1; color:${COLOR.chipTexto}; background:${COLOR.celeste}; border-radius:${TEMA.chip === 'pildora' ? '9999px' : '6px'}; padding:4px 9px 3px; letter-spacing:0.06em; white-space:nowrap;">${it.gl} - ${it.gv}</span>`
                : `<span style="font-family:${TITULAR}; font-size:${px(12 * sc * DENS.fs)}; line-height:1; color:${COLOR.acento}; background:${COLOR.chipBg}; border:1.5px solid ${COLOR.celesteSuave}; border-radius:9999px; padding:3px 6px 2px; letter-spacing:0.05em;">VS</span>`}</div>
            ${nombre(it.v, 'left')}
        </div>${sede}
    </div>`;
}

function htmlFlyer(pag, i, total, c) {
    aplicarDiseno(c.diseno);
    const f = c.f;
    const tamLogo = Math.max(40, Math.round(Math.max(50, Math.min(124, Number(c.logoTam) || 84)) * DENS.logo));   // diámetro del logo (px de diseño)
    const centroCab = Math.round(CAB_H * 0.47);   // línea central del logo y el título dentro de la cabecera
    const altoTit = Math.round(CAB_H * 0.656);
    const topTit = f.seguroSup + Math.round(centroCab - altoTit / 2);
    const topLogo = f.seguroSup + Math.max(4, Math.round(centroCab - tamLogo / 2));
    const curva = TEMA.cab === 'curva';
    const recta = TEMA.cab === 'recta' || curva;
    const radCab = curva ? 'border-radius:0 0 30px 30px;' : '';
    const radPie = curva ? 'border-radius:30px 30px 0 0;' : '';
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
        hayRes: pag.items.some(it => it.t === 'fila' && it.gl != null),
        anchoUtil: f.ancho - MARGEN * 2,
        escudoDe: c.escudoDe || null,
        hayEscudos: !!c.hayEscudos,
    };
    const cuerpoTop = CAB_H + f.seguroSup + PAD_SUP;
    const cuerpoAlto = f.alto - cuerpoTop - PIE_H - f.seguroInf - PAD_INF;
    const items = pag.items.map(it => itemHtml(it, sc, ctx)).join('');

    // Título (se puede escribir en varias líneas)
    const lineasTitulo = (c.titulo || '').split('\n').map(s => s.trim()).filter(Boolean);
    const maxLinea = Math.max(...lineasTitulo.map(s => s.length), 1);
    const anchoTitulo = f.ancho - (MARGEN + tamLogo + 14) - MARGEN;
    const tamTitulo = Math.min((lineasTitulo.length > 1 ? 36 : 46) * DENS.tit, anchoTitulo / (maxLinea * 0.44));
    const tituloHtml = lineasTitulo.map(s => esc(s)).join('<br>');

    const fecha = (c.fecha || '').trim();
    const pie = (c.pie || '').trim();
    const contador = total > 1 ? `${i + 1}/${total}` : '';

    return `<div data-flyer="${i}" style="position:relative; width:${f.ancho}px; height:${f.alto}px; background:${COLOR.fondo}; overflow:hidden; font-family:${TEXTO};">

        <!-- Marca de cancha (círculo central y línea media) -->
        <div style="position:absolute; left:${f.ancho / 2 - 150}px; top:${cuerpoTop + cuerpoAlto / 2 - 150}px; width:300px; height:300px; border-radius:9999px; border:5px solid ${COLOR.marca}; opacity:${TEMA.marca ? 0.07 : 0}; box-sizing:border-box;"></div>
        <div style="position:absolute; left:0; right:0; top:${cuerpoTop + cuerpoAlto / 2 - 2}px; height:5px; background:${COLOR.marca}; opacity:${TEMA.marca ? 0.07 : 0};"></div>

        <!-- Cabecera -->
        <div style="position:absolute; left:0; top:0; width:100%; height:${CAB_H + f.seguroSup + 10}px; background:${COLOR.cabBorde}; ${radCab} clip-path:${cabAtras};"></div>
        <div style="position:absolute; left:0; top:0; width:100%; height:${CAB_H + f.seguroSup}px; background:linear-gradient(110deg, ${COLOR.cabA} 0%, ${COLOR.cabB} 100%); ${radCab} clip-path:${cabFrente};"></div>
        <div style="position:absolute; left:${MARGEN}px; top:${topLogo}px;">${logoHtml(c.logo, tamLogo)}</div>
        <div style="position:absolute; left:${MARGEN + tamLogo + 14}px; top:${topTit}px; width:${anchoTitulo}px; height:${altoTit}px; display:flex; flex-direction:column; justify-content:center;">
            <div style="font-family:${TITULAR}; font-size:${px(tamTitulo)}; line-height:0.98; color:${COLOR.cabTexto}; letter-spacing:0.03em; text-shadow:2px 2px 0 ${COLOR.sombraTitulo}; text-transform:uppercase;">${tituloHtml}</div>
            ${fecha ? `<div style="margin-top:${Math.round(7 * DENS.tit)}px;"><span style="display:inline-block; background:${COLOR.chipBg}; color:${COLOR.acento}; font-family:${TEXTO}; font-weight:800; font-size:${Math.round(15 * DENS.tit)}px; line-height:1; padding:${Math.round(4 * DENS.tit)}px 12px; border-radius:9999px; letter-spacing:0.08em; text-transform:uppercase; white-space:nowrap;">${esc(fecha)}</span></div>` : ''}
        </div>

        <!-- Partidos -->
        <div style="position:absolute; left:${MARGEN}px; right:${MARGEN}px; top:${cuerpoTop}px;">${items}</div>

        <!-- Barra inferior -->
        <div style="position:absolute; left:0; bottom:0; width:100%; height:${PIE_H + f.seguroInf + 10}px; background:${COLOR.pieBorde}; ${radPie} clip-path:${pieAtras};"></div>
        <div style="position:absolute; left:0; bottom:0; width:100%; height:${PIE_H + f.seguroInf}px; background:linear-gradient(110deg, ${COLOR.pieA} 0%, ${COLOR.pieB} 100%); ${radPie} clip-path:${pieFrente};"></div>
        <div style="position:absolute; left:${MARGEN}px; right:${MARGEN}px; bottom:${f.seguroInf}px; height:${PIE_H}px; display:flex; align-items:center; justify-content:space-between; padding-top:${Math.round(8 * PIE_H / 38)}px; box-sizing:border-box;">
            <span style="font-family:${TEXTO}; font-weight:800; font-size:${Math.round(15 * DENS.pieFs)}px; letter-spacing:0.1em; color:${COLOR.cabTexto}; text-transform:uppercase; white-space:nowrap;">${esc(pie)}</span>
            <span style="font-family:${TITULAR}; font-size:${Math.round(20 * DENS.pieFs)}px; letter-spacing:0.06em; color:${COLOR.cabTexto};">${contador}</span>
        </div>
    </div>`;
}

// ------------------------------------------------------------
// 4) PLANILLA DE ÁRBITROS
//    Usa la MISMA programación que los flyers. Cada partido se completa con
//    cancha y árbitros, y se arma una planilla (como el Excel) agrupada por
//    día y por categoría/zona, lista para descargar en PNG.
// ------------------------------------------------------------
const DIAS_NOMBRE = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
const ABREV_A_NOMBRE = { LUN: 'LUNES', MAR: 'MARTES', 'MIÉ': 'MIÉRCOLES', JUE: 'JUEVES', VIE: 'VIERNES', 'SÁB': 'SÁBADO', DOM: 'DOMINGO' };

// Medidas de la planilla (px de diseño). Se exporta a 1,5x.
const A = { ancho: 1352, dia: 36, banda: 28, head: 28, fila: 29, cap: 1000, max: 1400, pie: 26 };   // cap: alto objetivo de una hoja (≈ A4 apaisada); max: un día solo se corta si pasa de este alto
const ARB_RATIO = 1.5;
const COLS_ARB = [96, 222, 334, 168, 172, 176, 176];   // suman 1344 + 6 separadores + 2 bordes = 1352
const TITULOS_COLS = ['Hora', 'Detalle / Etapa', 'Partido / Encuentro', 'Estadio / Cancha', 'Árbitro Principal', 'Asistente 1', 'Asistente 2'];

// Colores de la planilla: "excel" imita la planilla actual; el resto reutiliza los diseños de los flyers
function paletaPlanilla(id) {
    if (id === 'excel' || !DISENOS[id]) {
        return { fondo: '#FFFFFF', titBg: '#DDE3EC', titTxt: '#111827', bandBg: '#F3F6FB', bandTxt: '#2E75B6',
                 headBg: '#2B4F82', headTxt: '#FFFFFF', rowA: '#FFFFFF', rowB: '#F3F6FB', borde: '#D5DCE8', txt: '#111827' };
    }
    const c = { ...BASE_COLORES, ...DISENOS[id].colores };
    return { fondo: c.fondo, titBg: c.celesteSuave, titTxt: c.tinta, bandBg: c.celesteFondo, bandTxt: c.acento,
             headBg: c.cabA, headTxt: c.cabTexto, rowA: c.fondo, rowB: c.celesteFondo, borde: c.celesteSuave, txt: c.tinta };
}

function tituloCase(s) {
    s = String(s || '').trim();
    if (s && s === s.toUpperCase() && s !== s.toLowerCase()) {
        s = s.toLowerCase().replace(/(^|[\s.\-/(])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()).replace(/\bFc\b/g, 'FC');
    }
    return s;
}

// "Veteranos +40 · LOCAL AVENIDA FC FECHA 5"  o  "Sábado - Dep. Comercio (Local)"  ->  cancha donde se juegan todos
function sedeDeTitulo(txt) {
    txt = String(txt || '');
    let m = txt.match(/\blocal\b\s*:?\s*([^()·]+?)(?:\s+fecha\b[^·]*)?\s*(?:[·)]|$)/i);
    if (m && m[1].trim()) return tituloCase(m[1]);
    m = txt.match(/([^()·\-–—]+?)\s*\(\s*local\s*\)/i);
    return m ? tituloCase(m[1]) : '';
}

// Día del partido -> { key (para ordenar), label ("SÁBADO 10/10/2026") }
function fechaDe(dia, opts) {
    let y = Number(opts.anio) || new Date().getFullYear();
    let dd = '', mm = '';
    const m = String(dia || '').match(/(\d{1,2})\/(\d{1,2})/);
    if (m) { dd = m[1].padStart(2, '0'); mm = m[2].padStart(2, '0'); }
    else if (opts.diaDefault) {
        const d = String(opts.diaDefault).match(/^\s*(\d{1,2})\s*\/\s*(\d{1,2})(?:\s*\/\s*(\d{2,4}))?\s*$/);
        if (d) {
            dd = d[1].padStart(2, '0'); mm = d[2].padStart(2, '0');
            if (d[3]) y = d[3].length === 2 ? 2000 + Number(d[3]) : Number(d[3]);
        }
    }
    if (dd) {
        const f = new Date(y, Number(mm) - 1, Number(dd));
        return { key: `${y}-${mm}-${dd}`, label: `${DIAS_NOMBRE[f.getDay()]} ${dd}/${mm}/${y}` };
    }
    const ab = String(dia || '').trim().toUpperCase();
    if (ABREV_A_NOMBRE[ab]) return { key: `0-${ABREV_A_NOMBRE[ab]}`, label: ABREV_A_NOMBRE[ab] };
    return { key: 'zzzz', label: '' };
}

// "Jornada Promocional (Sede Atl. Alvear)" -> "Atl. Alvear"
function notaEnTexto(txt) {
    const m = String(txt || '').match(/\(\s*(?:(?:sede|cancha|en)\s*:?\s+)?([^)]{2,40}?)\s*\)/i);
    return m ? m[1].trim() : '';
}

// bloques (del parser de flyers) -> lista plana de partidos, ordenada por día y horario
function armarPartidos(bloques, opts = {}) {
    const lista = [], vistos = {};
    let n = 0;
    bloques.forEach(b => {
        const sede = sedeDeTitulo([b.cat, b.zona].filter(Boolean).join(' · '));
        const detalle = (b.zona && /^(zona|fecha|grupo)\b/i.test(b.zona)) ? b.zona : (b.cat || b.zona || '');
        const bandaTxt = [b.cat, b.zona].filter(Boolean).join(' - ');
        b.filas.forEach(f => {
            const partido = f.l ? `${f.l} vs. ${f.v}` : f.texto;
            let key = `${partido}|${f.dia || ''}`.toLowerCase().replace(/\s+/g, ' ');
            vistos[key] = (vistos[key] || 0) + 1;
            if (vistos[key] > 1) key += `#${vistos[key]}`;
            const fecha = fechaDe(f.dia, opts);
            lista.push({
                key, idx: n++, partido, hora: f.hora || '', pend: !!f.pend,
                fechaKey: fecha.key, fechaLabel: fecha.label,
                detalle, bandaTxt: (bandaTxt || 'GENERAL').toUpperCase(),
                banda: `CATEGORÍA / ZONA: ${(bandaTxt || 'GENERAL').toUpperCase()}`,
                canchaAuto: f.nota || notaEnTexto(f.texto) || sede || f.l || '',
            });
        });
    });
    const horaOrd = (h) => /^\d{1,2}:\d{2}$/.test(h) ? h.padStart(5, '0') : '99:99';
    lista.sort((a, b) => {
        if (a.fechaKey !== b.fechaKey) return a.fechaKey < b.fechaKey ? -1 : 1;
        if (opts.ordenar !== false) {
            const ha = horaOrd(a.hora), hb = horaOrd(b.hora);
            if (ha !== hb) return ha < hb ? -1 : 1;
        }
        return a.idx - b.idx;
    });
    return lista;
}

// partidos + asignaciones -> días > bandas (categoría/zona) > filas
function agruparDias(partidos, asig) {
    const dias = [];
    partidos.forEach(p => {
        let d = dias[dias.length - 1];
        if (!d || d.key !== p.fechaKey) { d = { key: p.fechaKey, label: p.fechaLabel, bandas: [] }; dias.push(d); }
        let b = d.bandas[d.bandas.length - 1];
        if (!b || b.label !== p.banda) { b = { label: p.banda, filas: [] }; d.bandas.push(b); }
        const a = (asig && asig[p.key]) || {};
        const t = (v) => String(v || '').trim();
        b.filas.push({
            hora: p.hora, pend: p.pend, detalle: p.detalle, partido: p.partido,
            cancha: t(a.cancha) || p.canchaAuto, ap: t(a.ap), a1: t(a.a1), a2: t(a.a2),
        });
    });
    if (dias.length > 1) dias.forEach(d => { if (!d.label) d.label = 'SIN FECHA DEFINIDA'; });
    return dias;
}

// Reparte en hojas: junta días enteros hasta llenar la hoja (si un día es larguísimo, repite el título y la banda al cortar)
function paginarPlanilla(dias, cap) {
    const pags = [];
    let pag = null;
    const nueva = () => { pag = { items: [], usado: 0, dia: null, banda: null }; pags.push(pag); };
    dias.forEach(d => {
      // Un día nunca se corta si entra entero en una hoja: se acomoda en la actual o abre otra
      const altoDia = (d.label ? A.dia : 0) + d.bandas.reduce((a, b) => a + A.banda + A.head + b.filas.length * A.fila, 0);
      if (pag && pag.items.length && pag.usado + altoDia > cap) nueva();
      d.bandas.forEach(b => {
        let i = 0;
        while (i < b.filas.length) {
            if (!pag) nueva();
            const nd = !!d.label && pag.dia !== d;
            const nb = pag.banda !== b;
            const cab = (nd ? A.dia : 0) + (nb ? A.banda + A.head : 0);
            if (pag.items.length && pag.usado + cab + A.fila > A.max) { nueva(); continue; }
            if (nd) { pag.items.push({ t: 'dia', txt: d.label }); pag.usado += A.dia; pag.dia = d; }
            if (nb) {
                pag.items.push({ t: 'banda', txt: b.label }, { t: 'head' });
                pag.usado += A.banda + A.head; pag.banda = b;
            }
            let primera = true;
            while (i < b.filas.length && (primera || pag.usado + A.fila <= A.max)) {
                pag.items.push({ t: 'fila', ...b.filas[i] });
                pag.usado += A.fila; i++; primera = false;
            }
            if (i < b.filas.length) nueva();
        }
      });
    });
    return pags;
}

// Misma cantidad de hojas, pero parejas (la última no queda casi vacía)
function repartirPlanilla(dias, cap) {
    const base = paginarPlanilla(dias, cap);
    const n = base.length;
    if (n <= 1) return base;
    let lo = Math.floor(cap * 0.3), hi = cap, mejor = base;
    while (hi - lo > 1) {
        const mid = Math.floor((lo + hi) / 2);
        const p = paginarPlanilla(dias, mid);
        if (p.length === n) { hi = mid; mejor = p; } else { lo = mid; }
    }
    return mejor;
}

function htmlPlanilla(pag, i, total, c) {
    const p = c.paleta, W = COLS_ARB;
    const grid = `display:grid; grid-template-columns:${W.map(w => w + 'px').join(' ')}; gap:1px; padding:0 1px 1px; box-sizing:border-box; width:${A.ancho}px;`;
    const celda = (txt, w, o) => `<div style="background:${o.bg}; display:flex; align-items:center; justify-content:${o.j || 'flex-start'}; padding:0 8px; overflow:hidden; box-sizing:border-box;"><span style="font-family:${TEXTO}; font-weight:${o.w || 600}; font-size:${px(ajustar(txt, o.t || 22, w - 16, 0.41))}; line-height:1; color:${o.c}; white-space:nowrap;">${esc(txt)}</span></div>`;
    let nFila = 0;
    const items = pag.items.map(it => {
        if (it.t === 'dia') {
            return `<div style="height:${A.dia}px; width:${A.ancho}px; background:${p.titBg}; color:${p.titTxt}; font-family:${TEXTO}; font-weight:800; font-size:34px; line-height:${A.dia}px; text-align:center; white-space:nowrap; text-transform:uppercase; box-sizing:border-box;">FECHA: ${esc(it.txt)}</div>`;
        }
        if (it.t === 'banda') {
            return `<div style="height:${A.banda}px; width:${A.ancho}px; background:${p.bandBg}; display:flex; align-items:center; padding:0 14px; box-sizing:border-box;"><span style="font-family:${TEXTO}; font-weight:700; font-size:${px(ajustar(it.txt, 23, A.ancho - 28, 0.44))}; line-height:1; color:${p.bandTxt}; white-space:nowrap;">${esc(it.txt)}</span></div>`;
        }
        if (it.t === 'head') {
            return `<div style="${grid} height:${A.head}px; background:${p.fondo};">${TITULOS_COLS.map((t, k) => celda(t, W[k], { bg: p.headBg, c: p.headTxt, w: 700, j: 'center', t: 21 })).join('')}</div>`;
        }
        const bg = nFila++ % 2 === 0 ? p.rowA : p.rowB;
        const o = (extra) => ({ bg, c: p.txt, ...extra });
        return `<div style="${grid} height:${A.fila}px; background:${p.borde};">`
            + celda(it.hora, W[0], o({ w: 700, j: 'center' }))
            + celda(it.detalle, W[1], o({ t: 21 }))
            + celda(it.partido, W[2], o({ w: 800 }))
            + celda(it.cancha, W[3], o({ j: 'center' }))
            + celda(it.ap, W[4], o({}))
            + celda(it.a1, W[5], o({}))
            + celda(it.a2, W[6], o({}))
            + `</div>`;
    }).join('');
    const contador = total > 1 ? `<div style="position:absolute; right:14px; bottom:3px; font-family:${TITULAR}; font-size:18px; line-height:1; letter-spacing:0.06em; color:${p.bandTxt};">${i + 1}/${total}</div>` : '';
    return `<div data-flyer="${i}" style="position:relative; width:${A.ancho}px; height:${c.alto}px; background:${p.fondo}; overflow:hidden; font-family:${TEXTO};">${items}${contador}</div>`;
}

// ------------------------------------------------------------
// ORDENADOR: texto corrido (sin viñetas, sin días ni horarios) -> formato de programación
//   Primera y Sub-20 Zona Sur – Fecha 10 Dep. Argentino Vs. Sp. Español ...
//   pasa a:
//   Primera y Sub-20
//   Zona Sur – Fecha 10
//   • Dep. Argentino Vs. Sp. Español
// Lo difícil es saber dónde termina un equipo y empieza el siguiente ("Avenida FC Atl. Alvear"),
// así que se apoya en los equipos conocidos (lista de la app + los que se ven en el propio texto)
// y en pistas de forma: las abreviaturas ("Atl.", "M.") empiezan un equipo y "FC"/"SB"/"VB" lo cierran.
// Devuelve { texto, avisos[] }: avisos son los renglones donde la separación fue una suposición.
// ------------------------------------------------------------
const RE_ENCABEZADO = /(zona(?:\s+(?!fecha\b)[^\s–—-]+){1,3}\s*(?:[–—-]\s*)?fecha\s*\d+|veteranos\s*\+\s*\d+\s*(?:[–—-]\s*)?fecha\s*\d+)(\s*[–—-]\s*(?:local|sede)\s*:?)?/gi;
const RE_CORTE_CATEGORIA = /\s+(?=(?:juveniles|infantiles|veteranos(?!\s*\+)|(?:primera|1ra)\s+y\s+sub-?\d+)\b)/gi;
const RE_ABREV = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{1,4}\.$/;
const RE_SIGLA = /^[A-ZÁÉÍÓÚÑ]{2,3}$/;      // FC, SB, VB...
const RE_CONECTOR = /^(de|del|la|las|los|el|y)$/i;
const claveNombre = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// Separa las palabras de un tramo en [izquierda, derecha] (fin de un equipo + comienzo del siguiente)
function dividirEquipos(palabras, K) {
    if (palabras.length < 2) return { izq: palabras.join(' '), der: '', seguro: false };
    let mejor = null, pm = -Infinity, empate = false;
    for (let k = 1; k < palabras.length; k++) {
        const L = palabras.slice(0, k), R = palabras.slice(k);
        let p = 0;
        if (K.has(claveNombre(L.join(' ')))) p += 2;
        if (K.has(claveNombre(R.join(' ')))) p += 2;
        if (RE_ABREV.test(palabras[k])) p += 1;                       // "... | Atl. Alvear"
        if (RE_SIGLA.test(palabras[k - 1]) && !RE_CONECTOR.test(palabras[k])) p += 1;   // "Avenida FC | ..."
        if (RE_ABREV.test(palabras[k - 1])) p -= 3;                   // no dejar "M." suelto
        if (RE_CONECTOR.test(palabras[k]) || RE_CONECTOR.test(palabras[k - 1])) p -= 3;   // "Mártires de | Córdoba"
        if (RE_SIGLA.test(R[0]) && !K.has(claveNombre(R.join(' ')))) p -= 3;              // un equipo no empieza con "FC"
        if (p > pm + 1e-9) { mejor = k; pm = p; empate = false; } else if (Math.abs(p - pm) < 1e-9) empate = true;
    }
    return { izq: palabras.slice(0, mejor).join(' '), der: palabras.slice(mejor).join(' '), seguro: pm > 0 && !empate };
}

// "FHFC Fuimos Héroes FC" / "R. Escalada R. Escalada" -> local (sede) + primer equipo
function separarLocal(palabras, K) {
    const n = palabras.length;
    if (n < 2) return { local: '', resto: palabras.join(' '), seguro: false };
    const corte = (k) => ({ local: palabras.slice(0, k).join(' '), resto: palabras.slice(k).join(' '), seguro: true });
    if (n % 2 === 0 && claveNombre(palabras.slice(0, n / 2).join(' ')) === claveNombre(palabras.slice(n / 2).join(' '))) return corte(n / 2);   // la sede repite al equipo
    if (/^[A-ZÁÉÍÓÚÑ]{3,}$/.test(palabras[0]) && !K.has(claveNombre(palabras[0]))) return corte(1);                                      // sigla: FHFC
    let mejor = 0, pm = 0;
    for (let k = 1; k < n; k++) {
        const p = (K.has(claveNombre(palabras.slice(0, k).join(' '))) ? 1 : 0) + (K.has(claveNombre(palabras.slice(k).join(' '))) ? 1 : 0);
        if (p > pm) { mejor = k; pm = p; }
    }
    return pm ? corte(mejor) : { local: '', resto: palabras.join(' '), seguro: false };
}

function ordenarProgramacion(texto, conocidos = []) {
    const avisos = [];
    const K = new Set((conocidos || []).map(claveNombre).filter(Boolean));
    const lineas = String(texto || '').replace(/\r/g, '').replace(/\t/g, ' ')
        .split('\n').map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean)
        .flatMap(l => l.replace(RE_CORTE_CATEGORIA, '\n').split('\n').map(s => s.trim()).filter(Boolean));
    const esVs = /\svs\.?\s/i;
    const partirVs = (s) => s.split(/\s+vs\.?\s+/i).map(x => x.trim());

    // 1) Primera pasada: se aprende de los extremos de cada tramo (son nombres completos y seguros)
    const piezas = lineas.map(l => {
        if (!esVs.test(l) || /^[*\-•·▪►>]/.test(l)) return { crudo: l };
        const hs = [...l.matchAll(RE_ENCABEZADO)];
        const cabeza = (hs.length ? l.slice(0, hs[0].index) : '').trim();
        const tramos = hs.length
            ? hs.map((h, i) => ({ h, cuerpo: l.slice(h.index + h[0].length, i + 1 < hs.length ? hs[i + 1].index : undefined).replace(/^[\s:–—-]+/, '').trim() }))
            : [{ h: null, cuerpo: l }];
        tramos.forEach(t => {
            if (t.h && t.h[2]) return;   // con sede el primer equipo viene pegado a la sede
            const s = partirVs(t.cuerpo);
            if (s.length >= 2) { K.add(claveNombre(s[0])); K.add(claveNombre(s[s.length - 1])); }
        });
        return { cabeza, tramos };
    });

    // 2) Segunda pasada: armado del texto
    const salida = [];
    piezas.forEach(pz => {
        if (pz.crudo !== undefined) { salida.push(pz.crudo); return; }
        const primero = pz.tramos[0].h ? pz.tramos[0].h[1] : '';
        const cabezaSobra = pz.cabeza && primero && claveNombre(primero).startsWith(claveNombre(pz.cabeza));   // "Veteranos" + "Veteranos +40 ..."
        if (pz.cabeza && !cabezaSobra) salida.push(pz.cabeza);
        pz.tramos.forEach(t => {
            let cuerpo = t.cuerpo, titulo = t.h ? t.h[1].replace(/\s+/g, ' ').trim() : '';
            if (t.h && t.h[2]) {   // sede: "– Local: FHFC"
                const sp = partirVs(cuerpo);
                const r = separarLocal(sp[0].split(' '), K);
                if (!r.seguro) avisos.push(`${titulo}: no pude separar la sede del primer equipo`);
                titulo += r.local ? ` – Local: ${r.local}` : '';
                sp[0] = r.resto;
                cuerpo = sp.join(' Vs. ');
                const s0 = partirVs(cuerpo)[0]; if (s0) K.add(claveNombre(s0));
            }
            if (titulo) salida.push(titulo);
            const partidos = [];
            if (/\d{1,2}\s*[:.]\s*\d{2}\s*hs|\b\d{1,2}\s*hs\b|pendiente|a confirmar/i.test(cuerpo)) {
                // ya trae días/horarios: cada partido termina en su horario o estado
                cuerpo.split(/(?<=(?:\d{1,2}\s*[:.]\s*\d{2}\s*hs?\.?|\b\d{1,2}\s*hs\.?|pendiente|a confirmar))\s+(?=\S)/i).forEach(p => p.trim() && partidos.push(p.trim()));
            } else {
                const s = partirVs(cuerpo);
                if (s.length < 2) { if (cuerpo) partidos.push(cuerpo); return; }
                let izq = s[0];
                for (let i = 1; i < s.length; i++) {
                    if (i === s.length - 1) { partidos.push(`${izq} Vs. ${s[i]}`); break; }
                    const d = dividirEquipos(s[i].split(' '), K);
                    if (!d.seguro) avisos.push(`${izq} Vs. ${d.izq}  |  ${d.der}`);
                    partidos.push(`${izq} Vs. ${d.izq}`);
                    izq = d.der;
                }
            }
            partidos.forEach(p => salida.push(`• ${p}`));
        });
    });
    return { texto: salida.join('\n'), avisos };
}

// Fuera del navegador (tests en Node) exportamos solo la lógica pura
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parsearProgramacion, parsearResultados, parsearFila, paginarCon, repartir, alturaUtil, FORMATOS, H, htmlFlyer, DISENOS, aplicarDiseno, DENSIDADES, aplicarDensidad,
        armarPartidos, agruparDias, paginarPlanilla, repartirPlanilla, htmlPlanilla, paletaPlanilla, fechaDe, sedeDeTitulo, A, crearBuscador, tokensEquipo, ordenarProgramacion };
}

// ============================================================
// A PARTIR DE ACÁ: TODO LO QUE TOCA LA PÁGINA (solo en el navegador)
// ============================================================
if (typeof document !== 'undefined') {

const CLAVE_LS = 'afoch_flyers_estado_v1';
const CLAVE_EQ = 'afoch_flyers_equipos_v1';   // equipos y escudos van aparte: pesan más que el resto del estado
const RE_IMG_DATA = /^data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/i;
const RE_IMG_URL = /^https:\/\/[^\s"'<>]+$/i;   // enlace a una imagen (Cloudinary)
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

const TEXTO_EJEMPLO_RES = `Primera
Zona Sur - Fecha 6
•  Marcelino Ugarte 1 Vs. Deportivo Comercio 1
•  Villa Dora 3 Vs. Avenida FC 2
•  Sportivo Español 0 Vs. R. Escalada 2
•  Progresista 2 Vs. M. Renz 0
•  Dep. Argentino 2 Vs. Sp. Español 0
Zona Norte - Fecha 6
•  Deportivo E. Urien 0 Vs. Fuimos Héroes 1
•  Juventud 4 Vs. Mártires Córdoba 1`;

const ESTADO_INICIAL = {
    formato: 'vertical',
    diseno: 'clasico',
    densidad: 'compacta',   // cuántos partidos entran por flyer (ver DENSIDADES)
    logoTam: 84,
    texto: TEXTO_EJEMPLO,       // programación de la pestaña Flyers
    textoArb: TEXTO_EJEMPLO,    // programación de la pestaña Árbitros (independiente de la de flyers)
    textoRes: TEXTO_EJEMPLO_RES,   // resultados (pestaña Resultados)
    tituloRes: 'RESULTADOS\nDE LA FECHA',
    titulo: 'PROGRAMACIÓN\nTENTATIVA',
    fecha: '',
    pie: 'A.F.O.CH',
    logoSubido: '',
    usarEscudos: true,
    equipos: [],    // [{ id, nombre, alias, escudo }]  (se guarda aparte, ver CLAVE_EQ)
    // Pestaña de árbitros
    pestana: 'flyers',
    disenoArb: 'excel',
    anio: new Date().getFullYear(),
    diaDefault: '',
    ordenar: true,
    nomina: '',
    arbitros: {},   // { clave del partido: { cancha, ap, a1, a2 } }
    // Programación guardada en la nube que se está editando (vacío = todavía no se guardó)
    progId: '',        // Flyers: registro guardado que se está editando
    progNombre: '',
    progIdArb: '',     // Árbitros: registro guardado que se está editando (se guarda aparte de los flyers)
    progNombreArb: '',
    // Pestaña de posiciones: puntos actuales (base) + resultados de cada fecha, que se suman
    tabla: { base: '', cats: '1ra, primera', res: {}, titulo: 'TABLA DE\nPOSICIONES', fechas: [{ etiqueta: 'Fecha 1', texto: '' }] },
    subirFlyers: true,   // al guardar una programación, subir también los PNG a ImageKit
};
let estado = cargarEstado();
let logoArchivo = null;   // logo leído de afoch-logo.png (data URL), o false si no está
let flyersActuales = [];  // [{ nombre, nodo }] listos para exportar
let htmlsActuales = [];   // HTML de cada flyer (para la vista ampliada)
let visorIdx = -1;        // flyer abierto en la vista ampliada (-1 = cerrada)
let vista = { ancho: 540, alto: 675, ratio: 2, fondo: '#FFFFFF' };   // medidas de lo que se está mostrando / exportando
let partidosArb = [];     // partidos de la pestaña Árbitros
let pendLista = false;    // hay que reconstruir la lista de asignación en el próximo render

function cargarEstado() {
    try {
        const g = JSON.parse(localStorage.getItem(CLAVE_LS) || 'null');
        if (g && typeof g === 'object') {
            const e = { ...ESTADO_INICIAL, ...g };
            if (!FORMATOS[e.formato]) e.formato = ESTADO_INICIAL.formato;
            if (!DISENOS[e.diseno]) e.diseno = ESTADO_INICIAL.diseno;
            if (!DENSIDADES[e.densidad]) e.densidad = ESTADO_INICIAL.densidad;
            e.logoTam = Math.max(50, Math.min(124, Number(e.logoTam) || 84));
            if (e.pestana !== 'arbitros' && e.pestana !== 'tabla' && e.pestana !== 'resultados') e.pestana = 'flyers';
            e.textoRes = typeof g.textoRes === 'string' ? g.textoRes : TEXTO_EJEMPLO_RES;
            e.tituloRes = typeof g.tituloRes === 'string' ? g.tituloRes : ESTADO_INICIAL.tituloRes;
            const tb = e.tabla;
            e.tabla = (tb && typeof tb === 'object' && Array.isArray(tb.fechas))
                ? { base: String(tb.base || ''), cats: String(tb.cats == null ? '1ra, primera' : tb.cats), res: (tb.res && typeof tb.res === 'object' && !Array.isArray(tb.res)) ? tb.res : {}, titulo: String(tb.titulo || ''), fechas: tb.fechas.map(x => ({ etiqueta: String((x && x.etiqueta) || ''), texto: String((x && x.texto) || '') })) }
                : JSON.parse(JSON.stringify(ESTADO_INICIAL.tabla));
            if (e.disenoArb !== 'excel' && !DISENOS[e.disenoArb]) e.disenoArb = 'excel';
            if (!e.arbitros || typeof e.arbitros !== 'object' || Array.isArray(e.arbitros)) e.arbitros = {};
            // Antes había un solo texto compartido: si todavía no hay uno propio para árbitros, arranca con una copia
            e.textoArb = typeof g.textoArb === 'string' ? g.textoArb : String(e.texto || '');
            e.anio = Number(e.anio) || new Date().getFullYear();
            e.usarEscudos = e.usarEscudos !== false;
            e.subirFlyers = e.subirFlyers !== false;
            e.equipos = leerEquipos();
            return e;
        }
    } catch (err) { /* storage bloqueado o JSON roto */ }
    return { ...ESTADO_INICIAL, equipos: leerEquipos() };
}
function leerEquipos() {
    try {
        const g = JSON.parse(localStorage.getItem(CLAVE_EQ) || '[]');
        if (Array.isArray(g)) return g.filter(x => x && typeof x === 'object').map(normalizarEquipo);
    } catch (err) { /* storage bloqueado o JSON roto */ }
    return [];
}
function idEquipo() { return 'eq' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function normalizarEquipo(x) {
    return {
        id: String(x.id || idEquipo()).replace(/[^\w-]/g, ''),
        nombre: String(x.nombre || '').trim(),
        alias: String(x.alias || ''),
        escudo: (RE_IMG_DATA.test(String(x.escudo || '')) || RE_IMG_URL.test(String(x.escudo || ''))) ? String(x.escudo) : '',   // solo imágenes en base64 o enlaces https
    };
}
function guardarEstado() {
    const { equipos, ...resto } = estado;
    try { localStorage.setItem(CLAVE_LS, JSON.stringify(resto)); }
    catch (err) {
        try { localStorage.setItem(CLAVE_LS, JSON.stringify({ ...resto, logoSubido: '' })); } catch (e2) { /* sin storage */ }
    }
}
// Copia en este navegador (localStorage)
function guardarEquiposLocal() {
    try { localStorage.setItem(CLAVE_EQ, JSON.stringify(estado.equipos)); return true; }
    catch (err) { return false; }
}
// Copia en este navegador + subida a la nube (con una pequeña espera para no escribir en cada tecla)
function guardarEquipos() {
    const ok = guardarEquiposLocal();
    if (!ok && !nubeListo) mostrarToast('No hay lugar para guardar tantos escudos en este navegador. Usá "Guardar copia".', 'error');
    programarSyncEquipos();
    return ok;
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
// (renderDiferido y renderActivo están más abajo, junto a la pestaña de árbitros)

async function render() {
    await cargarLogoArchivo();
    // La densidad solo vale mientras se arman los flyers (el resto, como la tabla de posiciones, sigue con medidas normales)
    aplicarDensidad(estado.densidad);
    let hayEscudos = false;
    try { hayEscudos = renderFlyers(); }
    finally { aplicarDensidad('normal'); H.fila = hayEscudos ? H_FILA.escudos : H_FILA.normal; }
}
function renderFlyers() {
    const f = FORMATOS[estado.formato];
    const res = estado.pestana === 'resultados';
    const bloques = res ? parsearResultados(estado.textoRes) : parsearProgramacion(estado.texto);
    // Escudos: si hay al menos uno cargado, las filas se hacen más altas (antes de repartir los partidos)
    const hayEscudos = !!estado.usarEscudos && estado.equipos.some(e => e.escudo);
    H.fila = hayEscudos ? DENS.filaEsc : DENS.fila;
    const buscarEq = hayEscudos ? crearBuscador(estado.equipos) : null;
    const escudoDe = buscarEq ? (n) => { const e = buscarEq(n); const u = (e && e.escudo) || ''; return cacheEscudos.get(u) || u; } : null;
    if (hayEscudos) precargarEscudos().then(cambio => { if (cambio) renderDiferido(false); });
    const paginas = repartir(bloques, alturaUtil(f));
    const total = paginas.length;
    const nPartidos = bloques.reduce((a, b) => a + b.filas.length, 0);
    const contexto = { f, diseno: estado.diseno, logoTam: estado.logoTam, titulo: res ? estado.tituloRes : estado.titulo, fecha: estado.fecha, pie: estado.pie, logo: logoActual(), escudoDe, hayEscudos };

    $('resumen').textContent = total
        ? `${nPartidos} ${nPartidos === 1 ? 'partido' : 'partidos'} → ${total} ${total === 1 ? 'flyer' : 'flyers'}`
        : (res ? 'Pegá los resultados para ver los banners.' : 'Pegá la programación para ver los flyers.');
    $('btn-todos').disabled = !total;
    actualizarPanelEscudos();

    const ESC_PREV = 270 / f.ancho;
    const htmls = paginas.map((p, i) => htmlFlyer(p, i, total, contexto));
    htmlsActuales = htmls;
    vista = { ancho: f.ancho, alto: f.alto, ratio: ANCHO_SALIDA / f.ancho, fondo: COLOR.fondo };

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
        nombre: `afoch-${res ? 'resultados' : 'programacion'}-${f.archivo}-${i + 1}de${total}.png`,
        nodo: $('export').querySelector(`[data-flyer="${i}"]`),
    }));
    if (visorIdx >= 0) pintarVisor();   // si la vista ampliada está abierta, se actualiza
    return hayEscudos;
}

// ---------- Vista ampliada (para leer bien sin descargar) ----------
function pintarVisor() {
    const n = htmlsActuales.length;
    if (!n) { cerrarVisor(); return; }
    visorIdx = Math.max(0, Math.min(n - 1, visorIdx));
    const f = vista;
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
    // Primero las fuentes incrustadas en fuentes-liga.js (no dependen de internet)
    if (window.CSS_FUENTES_LIGA) return window.CSS_FUENTES_LIGA;
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
    pendLista = false;
    await precargarEscudos();   // los escudos de ImageKit tienen que estar como imagen en memoria para salir en el PNG
    await renderActivo(false);
    const cssFuente = await prepararFuentes();
    const archivos = [];
    for (const i of indices) {
        const item = flyersActuales[i];
        if (!item || !item.nodo) continue;
        const opciones = {
            pixelRatio: vista.ratio,
            backgroundColor: vista.fondo,
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
function construirDensidades() {
    $('tiles-densidad').innerHTML = Object.entries(DENSIDADES).map(([k, d]) => `
        <button type="button" class="tile" data-densidad="${k}">
            <span class="tile-label">${d.label}</span><span class="tile-sub">${d.sub}</span>
        </button>`).join('');
    sincronizarDensidad();
}
function sincronizarDensidad() {
    document.querySelectorAll('[data-densidad]').forEach(b => b.classList.toggle('tile-activo', b.dataset.densidad === estado.densidad));
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
    $('in-texto-arb').value = estado.textoArb;
    $('in-texto-res').value = estado.textoRes;
    $('in-titulo').value = estado.pestana === 'resultados' ? estado.tituloRes : estado.titulo;
    $('in-fecha').value = estado.fecha;
    $('in-pie').value = estado.pie;
    $('logo-estado').textContent = estado.logoSubido ? 'Logo subido desde tu equipo' : (logoArchivo ? 'Usando afoch-logo.png' : 'Sin logo (se muestra el texto A.F.O.CH)');
    $('btn-logo-quitar').classList.toggle('hidden', !estado.logoSubido);
    $('in-logo-tam').value = estado.logoTam;
    $('chk-escudos').checked = !!estado.usarEscudos;
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

// ---------- Escudos de los equipos ----------
// Reduce la imagen (máx. 200 px) y la devuelve como data URL PNG, para que entre en el almacenamiento y salga en el PNG final
function imagenADataURL(archivo, max = 200) {
    return new Promise((resolve, reject) => {
        if (!archivo || !/^image\//.test(archivo.type)) { reject(new Error('no es una imagen')); return; }
        const lector = new FileReader();
        lector.onerror = reject;
        lector.onload = () => {
            const img = new Image();
            img.onerror = reject;
            img.onload = () => {
                const w = img.naturalWidth || max, h = img.naturalHeight || max;
                const esc2 = Math.min(1, max / Math.max(w, h));
                const c = document.createElement('canvas');
                c.width = Math.max(1, Math.round(w * esc2));
                c.height = Math.max(1, Math.round(h * esc2));
                c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
                resolve(c.toDataURL('image/png'));
            };
            img.src = lector.result;
        };
        lector.readAsDataURL(archivo);
    });
}

// Nombres de equipos que aparecen en la programación (sin repetir)
function equiposDeProgramacion() {
    const vistos = new Map();
    [parsearProgramacion(estado.texto), parsearProgramacion(estado.textoArb), parsearResultados(estado.textoRes)].forEach(bl => bl.forEach(b => b.filas.forEach(f => {
        if (!f.l) return;
        [f.l, f.v].forEach(n => { const k = sinAcentos(n).replace(/\s+/g, ' ').trim(); if (!vistos.has(k)) vistos.set(k, n); });
    })));
    return [...vistos.values()];
}

// Agrega a la lista los nombres que todavía no tienen equipo. Acepta "Nombre | otro nombre, otro más". Devuelve cuántos agregó.
function agregarEquipos(lineas) {
    const nuevos = [];
    // primero los nombres largos: "Marcelino Ugarte" queda como nombre y "M. Ugarte" se reconoce como el mismo
    String(lineas.join('\n')).split(/\r?\n/).map(s => s.trim()).filter(Boolean).sort((a, b) => b.length - a.length).forEach(linea => {
        const [nombre, ...resto] = linea.split('|').map(s => s.trim());
        if (!nombre || crearBuscador([...estado.equipos, ...nuevos])(nombre)) return;
        nuevos.push({ id: idEquipo(), nombre, alias: resto.filter(Boolean).join(', '), escudo: '' });
    });
    nuevos.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    estado.equipos.push(...nuevos);
    return nuevos.length;
}

function construirEquipos() {
    const cont = $('lista-equipos');
    if (!estado.equipos.length) {
        cont.innerHTML = '<p class="campo-ayuda">Todavía no hay equipos. Tocá "Traer equipos de la programación" o pegá una lista.</p>';
        return;
    }
    // Buscador: por nombre u otros nombres, sin importar mayúsculas ni tildes
    const q = sinAcentos(filtroEq.q).replace(/\s+/g, ' ').trim();
    const lista = estado.equipos.filter(e =>
        (!q || sinAcentos(`${e.nombre} ${e.alias}`).includes(q)) && (!filtroEq.sinEscudo || !e.escudo));
    $('eq-contador').textContent = (q || filtroEq.sinEscudo) ? `${lista.length} de ${estado.equipos.length}` : `${estado.equipos.length}`;
    if (!lista.length) {
        cont.innerHTML = '<p class="campo-ayuda">Ningún equipo coincide con la búsqueda.</p>';
        return;
    }
    cont.innerHTML = lista.map(e => `
        <div class="eq-card ${e.escudo ? '' : 'eq-sin'}" data-eq="${esc(e.id)}">
            <label class="eq-escudo" title="${e.escudo ? 'Cambiar escudo' : 'Subir escudo'}">
                ${e.escudo ? `<img src="${e.escudo}" alt="" draggable="false">` : '<span>+</span>'}
                <input type="file" accept="image/*" class="hidden" data-eq-file>
            </label>
            <div class="min-w-0 flex-1 flex flex-col gap-1">
                <input type="text" class="campo campo-sm" data-eq-nombre value="${esc(e.nombre)}" placeholder="Nombre del equipo" autocomplete="off">
                <input type="text" class="campo campo-sm" data-eq-alias value="${esc(e.alias)}" placeholder="Otros nombres (separados por coma)" autocomplete="off">
            </div>
            <button type="button" class="btn-sec !px-2.5" data-eq-borrar aria-label="Quitar equipo">✕</button>
        </div>`).join('');
}

// Resumen y avisos: qué equipos de la programación no están en la lista o no tienen escudo
function actualizarPanelEscudos() {
    const buscar = crearBuscador(estado.equipos);
    const nombres = equiposDeProgramacion();
    const sinEquipo = nombres.filter(n => !buscar(n));
    const sinImagen = [...new Set(nombres.map(n => buscar(n)).filter(e => e && !e.escudo).map(e => e.nombre))];
    const con = estado.equipos.filter(e => e.escudo).length;
    $('escudos-resumen').textContent = estado.equipos.length
        ? `${estado.equipos.length} ${estado.equipos.length === 1 ? 'equipo' : 'equipos'} · ${con} con escudo`
        : 'Todavía no cargaste equipos.';
    const avisos = [];
    if (sinEquipo.length) avisos.push(`Sin equipo en la lista (${sinEquipo.length}): ${sinEquipo.join(', ')}.`);
    if (sinImagen.length) avisos.push(`Sin escudo (${sinImagen.length}): ${sinImagen.join(', ')}.`);
    if (!ikListo()) avisos.push('ImageKit sin claves (más abajo): los escudos nuevos se guardan como imagen dentro de Firestore.');
    $('escudos-avisos').textContent = avisos.join(' ');
    $('escudos-avisos').classList.toggle('hidden', !avisos.length);
}

function guardarCopiaEquipos() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, equipos: estado.equipos })], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'afoch-escudos.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
}
function cargarCopiaEquipos(archivo) {
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = () => {
        try {
            const d = JSON.parse(lector.result);
            const lista = Array.isArray(d) ? d : d.equipos;
            if (!Array.isArray(lista)) throw new Error('formato');
            let nuevos = 0, actualizados = 0;
            lista.filter(x => x && typeof x === 'object').map(normalizarEquipo).filter(x => x.nombre).forEach(x => {
                const ex = crearBuscador(estado.equipos)(x.nombre);
                if (!ex) { estado.equipos.push(x); nuevos++; }
                else if (x.escudo && !ex.escudo) { ex.escudo = x.escudo; actualizados++; }
            });
            guardarEquipos(); construirEquipos(); render();
            mostrarToast(`Copia cargada: ${nuevos} equipos nuevos, ${actualizados} escudos completados.`);
        } catch (err) { mostrarToast('Ese archivo no es una copia de escudos válida.', 'error'); }
    };
    lector.readAsText(archivo);
}

// ---------- Buscador y alta de equipos con escudo ----------
const filtroEq = { q: '', sinEscudo: false };
let nuevoEscudo = '';   // escudo elegido en el formulario "Agregar un equipo" (data URL)

function pintarNuevoEscudo() {
    $('eq-nuevo-preview').innerHTML = nuevoEscudo ? `<img src="${nuevoEscudo}" alt="" draggable="false">` : '+';
}

async function agregarEquipoNuevo() {
    const nombre = $('in-eq-nuevo-nombre').value.replace(/\s+/g, ' ').trim();
    if (!nombre) { mostrarToast('Escribí el nombre del equipo.', 'error'); return; }
    const boton = $('btn-eq-nuevo');
    boton.disabled = true;
    try {
        let eq = crearBuscador(estado.equipos)(nombre);
        if (eq) {
            if (!nuevoEscudo) { mostrarToast(`Ya existe "${eq.nombre}" en la lista.`, 'error'); return; }
            if (!confirm(`Ya existe "${eq.nombre}". ¿Reemplazar su escudo?`)) return;
        } else {
            eq = { id: idEquipo(), nombre, alias: '', escudo: '' };
            estado.equipos.push(eq);
        }
        if (nuevoEscudo) eq.escudo = await escudoParaGuardar(eq, nuevoEscudo);
        estado.equipos.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
        guardarEquipos();
        nuevoEscudo = ''; pintarNuevoEscudo();
        $('in-eq-nuevo-nombre').value = '';
        // se deja la búsqueda en el equipo agregado para que se vea enseguida
        filtroEq.q = eq.nombre; filtroEq.sinEscudo = false;
        $('in-eq-buscar').value = eq.nombre; $('chk-eq-sin').checked = false;
        construirEquipos(); renderActivo(false);
        mostrarToast(`Listo: ${eq.nombre}${eq.escudo ? ' con su escudo' : ' (todavía sin escudo)'}.`);
    } finally {
        boton.disabled = false;
    }
}

function iniciarBuscadorEscudos() {
    $('in-eq-buscar').addEventListener('input', (e) => { filtroEq.q = e.target.value; construirEquipos(); });
    $('chk-eq-sin').addEventListener('change', (e) => { filtroEq.sinEscudo = e.target.checked; construirEquipos(); });
    $('in-eq-nuevo-file').addEventListener('change', async (e) => {
        const archivo = e.target.files[0];
        e.target.value = '';
        if (!archivo) return;
        try {
            nuevoEscudo = await imagenADataURL(archivo);
            pintarNuevoEscudo();
            const campo = $('in-eq-nuevo-nombre');
            if (!campo.value.trim()) campo.value = archivo.name.replace(/\.[^.]+$/, '').replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim();
        } catch (err) { mostrarToast('No se pudo leer esa imagen.', 'error'); }
    });
    $('btn-eq-nuevo').addEventListener('click', agregarEquipoNuevo);
    $('in-eq-nuevo-nombre').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); agregarEquipoNuevo(); } });
}

function iniciarEscudos() {
    $('chk-escudos').addEventListener('change', (e) => { estado.usarEscudos = e.target.checked; guardarEstado(); render(); });

    const tras = (n, texto) => {
        if (n) { guardarEquipos(); construirEquipos(); render(); }
        mostrarToast(n ? texto : 'No hay equipos nuevos para agregar.');
    };
    $('btn-eq-prog').addEventListener('click', () => {
        const n = agregarEquipos(equiposDeProgramacion());
        tras(n, `Se agregaron ${n} ${n === 1 ? 'equipo' : 'equipos'}. Ahora subí los escudos.`);
    });
    $('btn-eq-agregar').addEventListener('click', () => {
        const n = agregarEquipos([$('in-eq-texto').value]);
        $('in-eq-texto').value = '';
        tras(n, `Se agregaron ${n} ${n === 1 ? 'equipo' : 'equipos'}.`);
    });

    // Varios escudos de una vez: el nombre del archivo es el del equipo (si no existe en la lista, lo crea)
    $('in-escudos-multi').addEventListener('change', async (e) => {
        const archivos = [...e.target.files];
        e.target.value = '';
        let nuevos = 0, puestos = 0;
        for (const a of archivos) {
            try {
                const url = await imagenADataURL(a);
                const nombre = a.name.replace(/\.[^.]+$/, '').replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim();
                let eq = crearBuscador(estado.equipos)(nombre);
                if (!eq) { eq = { id: idEquipo(), nombre, alias: '', escudo: '' }; estado.equipos.push(eq); nuevos++; }
                eq.escudo = await escudoParaGuardar(eq, url); puestos++;
            } catch (err) { /* archivo que no es imagen: se ignora */ }
        }
        if (!puestos) { mostrarToast('No se pudo leer ninguna imagen.', 'error'); return; }
        guardarEquipos(); construirEquipos(); render();
        mostrarToast(`${puestos} ${puestos === 1 ? 'escudo cargado' : 'escudos cargados'}${nuevos ? ` (${nuevos} equipos nuevos)` : ''}.`);
    });

    $('btn-eq-copia').addEventListener('click', guardarCopiaEquipos);
    $('in-eq-copia').addEventListener('change', (e) => { cargarCopiaEquipos(e.target.files[0]); e.target.value = ''; });

    const lista = $('lista-equipos');
    const equipoDe = (el) => { const c = el.closest('[data-eq]'); return c && estado.equipos.find(x => x.id === c.dataset.eq); };
    lista.addEventListener('input', (e) => {
        const eq = equipoDe(e.target);
        if (!eq) return;
        if (e.target.matches('[data-eq-nombre]')) eq.nombre = e.target.value;
        else if (e.target.matches('[data-eq-alias]')) eq.alias = e.target.value;
        else return;
        guardarEquipos(); renderDiferido(false);
    });
    lista.addEventListener('change', async (e) => {
        if (!e.target.matches('[data-eq-file]')) return;
        const eq = equipoDe(e.target), archivo = e.target.files[0];
        e.target.value = '';
        if (!eq || !archivo) return;
        try {
            eq.escudo = await escudoParaGuardar(eq, await imagenADataURL(archivo));
            guardarEquipos(); construirEquipos(); render();
        } catch (err) { mostrarToast('No se pudo leer esa imagen.', 'error'); }
    });
    lista.addEventListener('click', (e) => {
        if (!e.target.closest('[data-eq-borrar]')) return;
        const eq = equipoDe(e.target);
        if (!eq) return;
        if (!confirm(`¿Quitar a ${eq.nombre || 'este equipo'} de la lista?`)) return;
        estado.equipos = estado.equipos.filter(x => x !== eq);
        guardarEquipos(); construirEquipos(); render();
    });
}

// ---------- Pestaña ÁRBITROS ----------
const opcionesArb = () => ({ anio: estado.anio, diaDefault: estado.diaDefault, ordenar: estado.ordenar });
const normNombre = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
let anchoPrevArb = 0;   // ancho con el que se dibujó la vista previa de la planilla
const hayHora = (h) => /^\d{1,2}:\d{2}$/.test(h);

function renderActivo(lista = true) {
    if (estado.pestana === 'historial') return Promise.resolve();   // el historial no dibuja flyers
    if (estado.pestana === 'tabla') return window.tablaLiga ? window.tablaLiga.render() : Promise.resolve();
    return estado.pestana === 'arbitros' ? renderArb(lista) : render();
}
function renderDiferido(lista = true) {
    pendLista = pendLista || lista;
    clearTimeout(temporizador);
    temporizador = setTimeout(() => { const l = pendLista; pendLista = false; renderActivo(l); }, 160);
}

function aplicarPestana(p) {
    const arb = p === 'arbitros', hist = p === 'historial', tab = p === 'tabla', res = p === 'resultados';
    if (visorIdx >= 0) cerrarVisor();
    $('vista-flyers').classList.toggle('hidden', arb || hist || tab);
    $('vista-tabla').classList.toggle('hidden', !tab);
    $('vista-arbitros').classList.toggle('hidden', !arb);
    $('vista-historial').classList.toggle('hidden', !hist);
    // La tarjeta (guardar/borrar) se mueve de una pestaña a la otra, pero cada pestaña tiene su propio texto
    if (!hist && !tab) $(arb ? 'slot-prog-arb' : 'slot-prog-flyers').appendChild($('sec-programacion'));
    // Cada pestaña tiene su propio cuadro de texto dentro de la misma tarjeta
    $('wrap-texto-flyers').classList.toggle('hidden', arb || res);
    $('wrap-texto-arb').classList.toggle('hidden', !arb);
    $('wrap-texto-res').classList.toggle('hidden', !res);
    // En Resultados no se guarda en la nube ni se ordena: solo se arma y se descarga
    $('fila-prog-guardar').classList.toggle('hidden', res);
    $('btn-ordenar').classList.toggle('hidden', res);
    $('in-titulo').value = res ? estado.tituloRes : estado.titulo;
    if (!hist && !tab && !res) sincronizarBotonesProg();
    document.querySelectorAll('[data-pestana]').forEach(b => {
        const on = b.dataset.pestana === p;
        b.classList.toggle('tab-activa', on);
        b.setAttribute('aria-selected', String(on));
    });
}

function actualizarDatalist() {
    const nombres = new Set();
    String(estado.nomina || '').split(/\r?\n/).forEach(s => { s = s.trim(); if (s) nombres.add(s); });
    Object.values(estado.arbitros).forEach(a => ['ap', 'a1', 'a2'].forEach(c => { const v = String((a && a[c]) || '').trim(); if (v) nombres.add(v); }));
    $('dl-arbitros').innerHTML = [...nombres].sort((x, y) => x.localeCompare(y, 'es')).map(n => `<option value="${esc(n)}"></option>`).join('');
}

function construirListaArb() {
    const cont = $('lista-arb');
    actualizarDatalist();
    if (!partidosArb.length) {
        cont.innerHTML = '<p class="campo-ayuda">Pegá la programación para cargar los partidos.</p>';
        return;
    }
    let dia = null, html = '';
    partidosArb.forEach(p => {
        if (p.fechaKey !== dia) {
            dia = p.fechaKey;
            html += `<div class="arb-dia">${esc(p.fechaLabel || 'Sin fecha definida')}</div>`;
        }
        const a = estado.arbitros[p.key] || {};
        const campo = (k, rotulo, ph, lista) => `<div><span class="arb-rot">${rotulo}</span><input type="text" class="campo campo-sm" data-campo="${k}" value="${esc(a[k] || '')}" placeholder="${esc(ph)}" autocomplete="off" ${lista ? 'list="dl-arbitros"' : ''}></div>`;
        html += `<div class="arb-card" data-pk="${esc(p.key)}">
            <div class="flex items-baseline justify-between gap-2">
                <span class="arb-partido">${esc(p.partido)}</span>
                <span class="arb-hora">${esc(p.hora)}</span>
            </div>
            <div class="arb-detalle">${esc(p.bandaTxt)}</div>
            <div class="mb-2">${campo('cancha', 'Cancha', p.canchaAuto || 'Cancha', false)}</div>
            <div class="grid grid-cols-3 gap-1.5">
                ${campo('ap', 'Principal', 'Árbitro', true)}
                ${campo('a1', 'Asist. 1', 'Asistente 1', true)}
                ${campo('a2', 'Asist. 2', 'Asistente 2', true)}
            </div>
            <p class="arb-aviso hidden">Hay un árbitro repetido en este partido o en otro a la misma hora.</p>
        </div>`;
    });
    cont.innerHTML = html;
}

// Marca los partidos con un mismo árbitro dos veces, o en dos partidos del mismo día y hora
function marcarConflictos() {
    const mal = new Set(), enHora = {};
    partidosArb.forEach(p => {
        const a = estado.arbitros[p.key] || {};
        const nombres = [a.ap, a.a1, a.a2].map(normNombre).filter(Boolean);
        if (new Set(nombres).size < nombres.length) mal.add(p.key);
        if (!hayHora(p.hora)) return;
        nombres.forEach(n => { const k = `${p.fechaKey}|${p.hora}|${n}`; (enHora[k] = enHora[k] || []).push(p.key); });
    });
    Object.values(enHora).forEach(ks => { if (new Set(ks).size > 1) ks.forEach(k => mal.add(k)); });
    document.querySelectorAll('#lista-arb [data-pk]').forEach(c => {
        const m = mal.has(c.dataset.pk);
        c.classList.toggle('arb-alerta', m);
        c.querySelector('.arb-aviso').classList.toggle('hidden', !m);
    });
}

async function renderArb(lista = true) {
    partidosArb = armarPartidos(parsearProgramacion(estado.textoArb), opcionesArb());
    const dias = agruparDias(partidosArb, estado.arbitros);
    const paginas = repartirPlanilla(dias, A.cap);
    const total = paginas.length;
    const paleta = paletaPlanilla(estado.disenoArb);
    const alto = Math.max(1, ...paginas.map(p => p.usado)) + (total > 1 ? A.pie : 0);
    const n = partidosArb.length;
    const sin = partidosArb.filter(p => !String((estado.arbitros[p.key] || {}).ap || '').trim()).length;

    $('resumen-arb').textContent = n
        ? `${n} ${n === 1 ? 'partido' : 'partidos'} → ${total} ${total === 1 ? 'hoja' : 'hojas'}${sin ? ` · ${sin} sin árbitro principal` : ''}`
        : 'Pegá la programación para armar la planilla.';
    $('btn-todos-arb').disabled = !total;

    vista = { ancho: A.ancho, alto, ratio: ARB_RATIO, fondo: paleta.fondo };
    const htmls = paginas.map((p, i) => htmlPlanilla(p, i, total, { paleta, alto }));
    htmlsActuales = htmls;

    const cont = $('previews-arb');
    anchoPrevArb = cont.clientWidth;
    const escala = Math.max(280, Math.min(900, cont.clientWidth - 42)) / A.ancho;
    cont.innerHTML = htmls.map((h, i) => `
        <div class="flex flex-col gap-2 items-center">
            <div data-ver="${i}" title="Tocá para ampliar" style="width:${A.ancho * escala}px; height:${alto * escala}px; cursor:zoom-in;" class="rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-white">
                <div style="width:${A.ancho}px; height:${alto}px; transform:scale(${escala}); transform-origin: top left;">${h}</div>
            </div>
            <div class="flex gap-2">
                <button type="button" data-ver="${i}" class="btn-sec">Ampliar</button>
                <button type="button" data-descargar="${i}" class="btn-sec">Descargar ${i + 1}/${total}</button>
            </div>
        </div>`).join('');

    $('export').innerHTML = htmls.map(h => `<div style="width:${A.ancho}px; height:${alto}px;">${h}</div>`).join('');
    flyersActuales = paginas.map((p, i) => ({
        nombre: `afoch-arbitros-${i + 1}de${total}.png`,
        nodo: $('export').querySelector(`[data-flyer="${i}"]`),
    }));

    if (lista) construirListaArb();
    marcarConflictos();
    if (visorIdx >= 0) pintarVisor();
}

function sincronizarEstiloArb() {
    document.querySelectorAll('[data-estilo]').forEach(b => b.classList.toggle('tile-activo', b.dataset.estilo === estado.disenoArb));
}

function iniciarArbitros() {
    // Pestañas
    document.querySelector('[data-pestana]').parentElement.addEventListener('click', (e) => {
        const b = e.target.closest('[data-pestana]');
        if (!b || b.dataset.pestana === estado.pestana) return;
        estado.pestana = b.dataset.pestana;
        guardarEstado(); aplicarPestana(estado.pestana);
        if (estado.pestana === 'historial') cargarHistorial(); else renderActivo(true);
    });

    // Estilos de la planilla
    const estilos = [['excel', { label: 'Planilla Excel', sub: 'Como la actual' }], ...Object.entries(DISENOS)];
    $('tiles-estilo-arb').innerHTML = estilos.map(([k, d]) => {
        const p = paletaPlanilla(k);
        return `<button type="button" class="tile" data-estilo="${k}">
            <span style="display:block; width:100%; height:1.35rem; border-radius:0.35rem; background:${p.fondo}; border:1px solid #cbd5e1; position:relative; overflow:hidden; margin-bottom:0.2rem;">
                <span style="position:absolute; left:0; right:0; top:0; height:0.4rem; background:${p.titBg};"></span>
                <span style="position:absolute; left:0; right:0; top:0.4rem; height:0.35rem; background:${p.headBg};"></span>
                <span style="position:absolute; left:6px; right:6px; bottom:2px; height:0.18rem; background:${p.borde};"></span>
            </span>
            <span class="tile-label">${d.label}</span><span class="tile-sub">${d.sub}</span>
        </button>`;
    }).join('');
    sincronizarEstiloArb();
    $('tiles-estilo-arb').addEventListener('click', (e) => {
        const b = e.target.closest('[data-estilo]');
        if (!b) return;
        estado.disenoArb = b.dataset.estilo;
        guardarEstado(); sincronizarEstiloArb(); renderArb(false);
    });

    // Opciones
    $('in-anio').value = estado.anio;
    $('in-dia-def').value = estado.diaDefault;
    $('chk-ordenar').checked = !!estado.ordenar;
    $('in-nomina').value = estado.nomina;
    $('in-anio').addEventListener('input', (e) => { estado.anio = Number(e.target.value) || new Date().getFullYear(); guardarEstado(); renderDiferido(true); });
    $('in-dia-def').addEventListener('input', (e) => { estado.diaDefault = e.target.value; guardarEstado(); renderDiferido(true); });
    $('chk-ordenar').addEventListener('change', (e) => { estado.ordenar = e.target.checked; guardarEstado(); renderActivo(true); });
    $('in-nomina').addEventListener('input', (e) => { estado.nomina = e.target.value; guardarEstado(); actualizarDatalist(); });

    // Asignación por partido (delegación: no se reconstruye la lista mientras se escribe)
    $('lista-arb').addEventListener('input', (e) => {
        const inp = e.target.closest('[data-campo]');
        if (!inp) return;
        const pk = inp.closest('[data-pk]').dataset.pk;
        const a = estado.arbitros[pk] || (estado.arbitros[pk] = {});
        a[inp.dataset.campo] = inp.value;
        guardarEstado(); marcarConflictos(); renderDiferido(false);
    });
    $('lista-arb').addEventListener('change', actualizarDatalist);
    $('btn-arb-limpiar').addEventListener('click', () => {
        if (!Object.keys(estado.arbitros).length) return;
        if (!confirm('¿Borrar los árbitros y canchas cargados en todos los partidos?')) return;
        estado.arbitros = {};
        guardarEstado(); renderArb(true);
    });

    // Vista previa y descarga (mismo comportamiento que los flyers)
    $('previews-arb').addEventListener('click', (e) => {
        const v = e.target.closest('[data-ver]');
        if (v) { abrirVisor(Number(v.dataset.ver)); return; }
        const b = e.target.closest('[data-descargar]');
        if (b) descargar([Number(b.dataset.descargar)], b);
    });
    $('btn-todos-arb').addEventListener('click', (e) => {
        descargar(flyersActuales.map((_, i) => i), e.currentTarget);
    });
    // La vista previa se reescala sola cuando cambia el ancho disponible (rotar el celular, terminar de cargar estilos, etc.)
    if (window.ResizeObserver) {
        new ResizeObserver(() => {
            const w = $('previews-arb').clientWidth;
            if (estado.pestana !== 'arbitros' || !w || Math.abs(w - anchoPrevArb) < 4) return;
            renderDiferido(false);
        }).observe($('previews-arb'));
    }
}

// ---------- Nube (Firebase) ----------
// firebase-liga.js deja listo window.fb (Firestore). Si no carga, el generador sigue andando igual en este navegador.
const CLAVE_NUBE = 'afoch_flyers_nube_v1';   // marca: los equipos de este navegador ya se subieron a la nube una vez
const nube = () => window.fb || null;
let nubeIniciada = false, nubeListo = false, tempNube = null;
let nubeEquipos = new Map();   // id -> JSON del equipo tal como está guardado en la nube
let historial = [];            // programaciones guardadas (pestaña Historial)

function estadoNube(texto, tipo) {
    const el = $('nube-estado');
    el.textContent = texto;
    el.dataset.tipo = tipo;
}
function mensajeErrorNube(err) {
    const c = String((err && err.code) || '');
    if (c.includes('permission-denied')) return 'Firebase rechazó la operación: revisá las reglas de Firestore.';
    if (c.includes('unavailable') || c.includes('network')) return 'No hay conexión con Firebase.';
    return 'No se pudo completar la operación en Firebase.';
}

// Primera conexión: trae los equipos de la nube. La primera vez, los que solo estaban en este navegador se suben.
async function iniciarNube() {
    const fb = nube();
    if (!fb || nubeIniciada) return;
    nubeIniciada = true;
    estadoNube('Nube: conectando…', 'espera');
    try {
        const remotos = (await fb.equipos.listar()).map(normalizarEquipo).filter(x => x.nombre);
        nubeEquipos = new Map(remotos.map(x => [x.id, JSON.stringify(x)]));
        let migrado = false;
        try { migrado = !!localStorage.getItem(CLAVE_NUBE); } catch (err) { /* sin storage */ }
        const lista = new Map(remotos.map(x => [x.id, x]));
        if (!migrado) estado.equipos.forEach(x => { if (x.nombre && !lista.has(x.id)) lista.set(x.id, x); });
        estado.equipos = [...lista.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
        nubeListo = true;
        guardarEquiposLocal();
        construirEquipos();
        renderActivo(false);
        // Sube lo que falte; solo si salió bien se marca la migración (si no, se reintenta la próxima vez)
        if (await sincronizarEquiposNube()) {
            try { localStorage.setItem(CLAVE_NUBE, '1'); } catch (err) { /* sin storage */ }
        }
        if (estado.pestana === 'historial') cargarHistorial();
    } catch (err) {
        nubeIniciada = false;
        console.error('No se pudo conectar con Firebase:', err);
        estadoNube('Nube: error de conexión', 'error');
        mostrarToast(mensajeErrorNube(err), 'error');
    }
}

function programarSyncEquipos() {
    if (!nubeListo) return;
    clearTimeout(tempNube);
    tempNube = setTimeout(sincronizarEquiposNube, 900);
}
// Sube los equipos nuevos o cambiados y borra de la nube los que se quitaron. Devuelve true si quedó todo al día.
async function sincronizarEquiposNube() {
    const fb = nube();
    if (!fb || !nubeListo) return false;
    const guardar = estado.equipos.filter(x => x.nombre && nubeEquipos.get(x.id) !== JSON.stringify(x));
    const ids = new Set(estado.equipos.map(x => x.id));
    const borrar = [...nubeEquipos.keys()].filter(id => !ids.has(id));
    if (!guardar.length && !borrar.length) return true;
    estadoNube('Nube: guardando…', 'espera');
    try {
        await fb.equipos.sincronizar(guardar, borrar);
        guardar.forEach(x => nubeEquipos.set(x.id, JSON.stringify(x)));
        borrar.forEach(id => nubeEquipos.delete(id));
        estadoNube('Nube: conectada', 'ok');
        return true;
    } catch (err) {
        console.error('No se pudieron guardar los equipos en la nube:', err);
        estadoNube('Nube: error al guardar', 'error');
        mostrarToast(mensajeErrorNube(err), 'error');
        return false;
    }
}

// ---------- Programaciones guardadas ----------
// Cada guardado es de UNA pestaña: tipo 'flyers' (flyers de partidos) o 'arbitros' (planilla de árbitros).
// Los registros viejos, sin tipo, tenían todo junto y se siguen pudiendo abrir.
const tipoActual = () => estado.pestana === 'arbitros' ? 'arbitros' : 'flyers';
const idProg = (t) => t === 'arbitros' ? estado.progIdArb : estado.progId;
const nombreProg = (t) => t === 'arbitros' ? estado.progNombreArb : estado.progNombre;
function fijarProg(t, id, nombre) {
    if (t === 'arbitros') { estado.progIdArb = id; estado.progNombreArb = nombre; }
    else { estado.progId = id; estado.progNombre = nombre; }
}

function sincronizarBotonesProg() {
    const t = tipoActual();
    const abierta = !!idProg(t);
    $('btn-prog-guardar').textContent = abierta ? 'Actualizar' : 'Guardar';
    $('btn-prog-nueva').classList.toggle('hidden', !abierta);
    const donde = t === 'arbitros' ? 'planilla de árbitros' : 'flyers';
    $('prog-estado').textContent = abierta ? `Guardada (${donde}): ${nombreProg(t) || 'sin nombre'}` : `Todavía no está guardada en la nube (${donde})`;
}

function nombreSugerido(t) {
    if (t === 'arbitros') {
        const ba = parsearProgramacion(estado.textoArb)[0];
        const baseA = ba ? [ba.cat, ba.zona].filter(Boolean).join(' - ') : '';
        return (baseA || 'Árbitros').slice(0, 60);
    }
    const f = String(estado.fecha || '').trim();
    if (f) return f;
    const b = parsearProgramacion(estado.texto)[0];
    const base = b ? [b.cat, b.zona].filter(Boolean).join(' - ') : '';
    return (base || 'Programación').slice(0, 60);
}

// Lo necesario para volver a armar lo de UNA pestaña (los flyers, o la planilla de árbitros)
function datosProgramacion(t) {
    if (t === 'arbitros') {
        return {
            tipo: 'arbitros',
            texto: String(estado.textoArb || ''),
            nPartidos: parsearProgramacion(estado.textoArb).reduce((a, b) => a + b.filas.length, 0),
            anio: estado.anio,
            diaDefault: String(estado.diaDefault || ''),
            ordenar: !!estado.ordenar,
            disenoArb: estado.disenoArb,
            nomina: String(estado.nomina || ''),
            arbitrosJson: JSON.stringify(estado.arbitros || {}),   // en texto: las claves de los partidos tienen puntos y barras
        };
    }
    return {
        tipo: 'flyers',
        texto: String(estado.texto || ''),
        titulo: String(estado.titulo || ''),
        fecha: String(estado.fecha || ''),
        pie: String(estado.pie || ''),
        diseno: estado.diseno,
        formato: estado.formato,
        densidad: estado.densidad,
        logoTam: estado.logoTam,
        nPartidos: parsearProgramacion(estado.texto).reduce((a, b) => a + b.filas.length, 0),
    };
}

async function guardarProgramacion(comoNueva) {
    const fb = nube();
    if (!fb) { mostrarToast('Todavía no hay conexión con Firebase. Probá recargar la página.', 'error'); return; }
    const t = tipoActual();
    const textoTab = t === 'arbitros' ? estado.textoArb : estado.texto;
    if (!String(textoTab || '').trim()) { mostrarToast('Pegá una programación antes de guardar.', 'error'); return; }
    const actualiza = !!idProg(t) && !comoNueva;
    const sugerido = (actualiza && nombreProg(t)) || nombreSugerido(t);
    const nombre = prompt(actualiza ? 'Nombre (se actualiza lo guardado):' : (t === 'arbitros' ? 'Nombre de la planilla de árbitros:' : 'Nombre de los flyers:'), sugerido);
    if (nombre === null) return;

    const botones = [$('btn-prog-guardar'), $('btn-prog-nueva')];
    botones.forEach(b => { b.disabled = true; });
    estadoNube('Nube: guardando…', 'espera');
    try {
        const datos = { ...datosProgramacion(t), nombre: nombre.trim() || sugerido };
        let id = idProg(t);
        if (actualiza) {
            try { await fb.programaciones.actualizar(id, datos); }
            catch (err) {
                // si la borraron desde otro lado, se vuelve a crear
                if (String((err && err.code) || '').includes('not-found')) id = await fb.programaciones.crear(datos);
                else throw err;
            }
        } else {
            id = await fb.programaciones.crear(datos);
        }
        fijarProg(t, id, datos.nombre);
        guardarEstado(); sincronizarBotonesProg();

        // Imágenes de la pestaña en la que estás (flyers o planilla de árbitros). Lo guardado ya quedó guardado.
        let extra = '';
        if (estado.subirFlyers && ikListo()) {
            try {
                const n = await subirImagenesProgramacion(id);
                extra = n ? ` Se subieron ${n} ${n === 1 ? 'imagen' : 'imágenes'}.` : '';
            } catch (err2) {
                console.error('No se pudieron subir las imágenes:', err2);
                estadoNube('Nube: error con las imágenes', 'error');
                mostrarToast(`Se guardó, pero las imágenes no: ${mensajeErrorIk(err2)}`, 'error');
                return;
            }
        } else if (estado.subirFlyers) {
            extra = ' (Sin claves de ImageKit: no se subieron las imágenes.)';
        }
        estadoNube('Nube: conectada', 'ok');
        const que = t === 'arbitros' ? 'Planilla de árbitros' : 'Flyers';
        mostrarToast((actualiza ? `${que} actualizados.` : `${que} guardados.`).replace('Planilla de árbitros actualizados', 'Planilla de árbitros actualizada').replace('Planilla de árbitros guardados', 'Planilla de árbitros guardada') + extra);
    } catch (err) {
        console.error('No se pudo guardar:', err);
        estadoNube('Nube: error al guardar', 'error');
        mostrarToast(mensajeErrorNube(err), 'error');
    } finally {
        botones.forEach(b => { b.disabled = false; });
    }
}

// ---------- Historial ----------
const fechaCorta = (ms) => ms ? new Date(ms).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

async function cargarHistorial() {
    const cont = $('lista-historial');
    const fb = nube();
    if (!fb) { cont.innerHTML = '<p class="campo-ayuda">Todavía no hay conexión con Firebase.</p>'; return; }
    cont.innerHTML = '<p class="campo-ayuda">Cargando…</p>';
    try {
        if (!nubeListo) await iniciarNube();
        historial = await fb.programaciones.listar(100);
        pintarHistorial();
    } catch (err) {
        console.error('No se pudo leer el historial:', err);
        cont.innerHTML = `<p class="arb-aviso">${esc(mensajeErrorNube(err))}</p>`;
    }
}

const miniatura = (url, ancho) => `${url}${url.includes('?') ? '&' : '?'}tr=w-${ancho}`;
function imagenesHtml(p) {
    const lista = [...(Array.isArray(p.flyers) ? p.flyers : []), ...(Array.isArray(p.planilla) ? p.planilla : [])]
        .filter(x => x && RE_IMG_URL.test(String(x.url || '')));
    if (!lista.length) return '';
    return `<div class="flex flex-wrap gap-2 mt-2">${lista.map(x => `<a href="${esc(x.url)}" target="_blank" rel="noopener" title="${esc(x.nombre || '')}"><img class="hist-mini" src="${esc(miniatura(x.url, 200))}" alt="" loading="lazy"></a>`).join('')}</div>`;
}

function tarjetaHistorial(p) {
    const tipo = p.tipo === 'arbitros' ? 'arbitros' : (p.tipo === 'flyers' ? 'flyers' : 'mixto');
    const abierta = (tipo === 'arbitros' ? estado.progIdArb : estado.progId) === p.id && tipo !== 'mixto';
    const editada = p.actualizada && p.creada && p.actualizada - p.creada > 60000 ? `editada ${fechaCorta(p.actualizada)}` : '';
    const estilo = tipo === 'arbitros'
        ? (p.disenoArb === 'excel' ? 'Excel' : (DISENOS[p.disenoArb] || {}).label)
        : [(DISENOS[p.diseno] || {}).label, (FORMATOS[p.formato] || {}).label].filter(Boolean).join(' · ');
    const detalle = [`Guardada ${fechaCorta(p.creada)}`, editada, `${p.nPartidos || 0} partidos`, estilo].filter(Boolean).join(' · ');
    return `<div class="hist-card ${abierta ? 'hist-abierta' : ''}" data-hid="${esc(p.id)}">
            <div class="min-w-0 flex-1">
                <p class="hist-nombre">${esc(p.nombre || 'Sin nombre')}${abierta ? ' <span style="color:#0673C8;">· abierta</span>' : ''}</p>
                <p class="hist-detalle">${esc(detalle)}</p>
                <details class="mt-1"><summary class="text-[0.68rem] font-extrabold text-slate-500 cursor-pointer">Ver texto</summary><pre class="hist-texto">${esc(p.texto)}</pre></details>
                ${imagenesHtml(p)}
            </div>
            <div class="flex gap-2">
                <button type="button" class="btn-sec" data-hist-abrir>Abrir</button>
                <button type="button" class="btn-sec" data-hist-borrar>Borrar</button>
            </div>
        </div>`;
}

function pintarHistorial() {
    const cont = $('lista-historial');
    if (!historial.length) {
        cont.innerHTML = '<p class="campo-ayuda">Todavía no hay nada guardado. Armá algo y tocá "Guardar".</p>';
        return;
    }
    // Los flyers y las planillas de árbitros se guardan por separado, cada uno en su sección
    const grupos = [
        ['Flyers de partidos', historial.filter(p => p.tipo === 'flyers'), 'Todavía no guardaste flyers.'],
        ['Planillas de árbitros', historial.filter(p => p.tipo === 'arbitros'), 'Todavía no guardaste ninguna planilla de árbitros.'],
    ];
    const viejos = historial.filter(p => p.tipo !== 'flyers' && p.tipo !== 'arbitros');
    if (viejos.length) grupos.push(['Guardados anteriores (flyers + árbitros juntos)', viejos, '']);
    cont.innerHTML = grupos.map(([titulo, lista, vacio]) => `
        <h3 class="text-xs font-extrabold text-slate-700 mt-3 first:mt-0">${esc(titulo)} <span class="text-slate-400">(${lista.length})</span></h3>
        ${lista.length ? lista.map(tarjetaHistorial).join('') : `<p class="campo-ayuda !mt-0">${esc(vacio)}</p>`}`).join('');
}

function llenarInputsArb() {
    $('in-anio').value = estado.anio;
    $('in-dia-def').value = estado.diaDefault;
    $('chk-ordenar').checked = !!estado.ordenar;
    $('in-nomina').value = estado.nomina;
}

function abrirProgramacion(id) {
    const p = historial.find(x => x.id === id);
    if (!p) return;
    const tipo = p.tipo === 'arbitros' ? 'arbitros' : (p.tipo === 'flyers' ? 'flyers' : 'mixto');
    const textoP = String(p.texto || '');
    const pisaFlyers = tipo !== 'arbitros' && String(estado.texto || '').trim() && estado.texto !== textoP;
    const pisaArb = tipo !== 'flyers' && String(estado.textoArb || '').trim() && estado.textoArb !== textoP;
    if ((pisaFlyers || pisaArb) && !confirm(`Se va a reemplazar ${tipo === 'arbitros' ? 'la planilla de árbitros' : (tipo === 'flyers' ? 'la programación de flyers' : 'lo que tenés en pantalla')}. ¿Seguir?`)) return;

    if (tipo !== 'arbitros') {
        estado.texto = textoP;
        estado.titulo = String(p.titulo || '');
        estado.fecha = String(p.fecha || '');
        estado.pie = String(p.pie || '');
        if (DISENOS[p.diseno]) estado.diseno = p.diseno;
        if (FORMATOS[p.formato]) estado.formato = p.formato;
        estado.densidad = DENSIDADES[p.densidad] ? p.densidad : 'normal';   // lo guardado antes de existir la opción se hizo en tamaño normal
        estado.logoTam = Math.max(50, Math.min(124, Number(p.logoTam) || 84));
    }
    if (tipo !== 'flyers') {
        let arbitros = {};
        try { const a = JSON.parse(p.arbitrosJson || '{}'); if (a && typeof a === 'object' && !Array.isArray(a)) arbitros = a; } catch (err) { /* queda vacío */ }
        estado.textoArb = textoP;
        estado.anio = Number(p.anio) || new Date().getFullYear();
        estado.diaDefault = String(p.diaDefault || '');
        estado.ordenar = p.ordenar !== false;
        if (p.disenoArb === 'excel' || DISENOS[p.disenoArb]) estado.disenoArb = p.disenoArb;
        estado.nomina = String(p.nomina || '');
        estado.arbitros = arbitros;
    }
    // Un guardado viejo (todo junto) se abre como copia: al guardar se crean registros nuevos y el viejo queda como estaba
    if (tipo === 'flyers') fijarProg('flyers', p.id, String(p.nombre || ''));
    else if (tipo === 'arbitros') fijarProg('arbitros', p.id, String(p.nombre || ''));
    else { fijarProg('flyers', '', ''); fijarProg('arbitros', '', ''); }
    estado.pestana = tipo === 'arbitros' ? 'arbitros' : 'flyers';

    guardarEstado();
    llenarInputs(); llenarInputsArb();
    sincronizarDiseno(); sincronizarFormato(); sincronizarDensidad(); sincronizarEstiloArb(); sincronizarBotonesProg();
    aplicarPestana(estado.pestana);
    renderActivo(true);
    mostrarToast(`Abierta: ${p.nombre || 'programación'}${tipo === 'mixto' ? ' (se carga en las dos pestañas; al guardar se crean registros nuevos)' : ''}`);
}

async function borrarProgramacion(id) {
    const p = historial.find(x => x.id === id);
    if (!p || !confirm(`¿Borrar "${p.nombre || 'esta programación'}" del historial? No se puede deshacer.`)) return;
    try {
        await nube().programaciones.borrar(id);
        historial = historial.filter(x => x.id !== id);
        if (estado.progId === id) fijarProg('flyers', '', '');
        if (estado.progIdArb === id) fijarProg('arbitros', '', '');
        guardarEstado(); sincronizarBotonesProg();
        pintarHistorial();
        mostrarToast('Programación borrada.');
    } catch (err) {
        console.error('No se pudo borrar la programación:', err);
        mostrarToast(mensajeErrorNube(err), 'error');
    }
}

// ---------- ImageKit (escudos y PNG de las programaciones) ----------
const ik = () => window.ik || null;
const ikListo = () => !!(ik() && ik().configurado());
const cacheEscudos = new Map();   // enlace https -> la misma imagen como data URL (para que entre en el PNG)
const bajandoEscudos = new Map();   // enlace -> descarga en curso

function mensajeErrorIk(err) {
    const c = String((err && err.code) || '');
    if (c === 'ik/sin-claves') return 'Faltan las claves de ImageKit.';
    if (c === 'ik/401' || c === 'ik/403') return 'ImageKit rechazó las claves: revisalas.';
    return `ImageKit: ${(err && err.message) || 'no se pudo subir la imagen'}`;
}

// Si ImageKit está configurado sube el escudo y devuelve su enlace; si no (o si falla) devuelve la imagen tal cual
async function escudoParaGuardar(eq, dataUrl) {
    if (!ikListo()) return dataUrl;
    try {
        return (await ik().subir(dataUrl, `escudo-${eq.id}.png`, '/escudos')).url;
    } catch (err) {
        console.error('No se pudo subir el escudo a ImageKit:', err);
        mostrarToast(`${mensajeErrorIk(err)} El escudo se guardó dentro de Firestore.`, 'error');
        return dataUrl;
    }
}

// Baja una vez cada escudo de ImageKit y lo guarda como data URL. Devuelve true si cargó alguno nuevo.
async function precargarEscudos() {
    const urls = [...new Set(estado.equipos.map(e => e.escudo).filter(u => /^https:/i.test(u) && !cacheEscudos.has(u)))];
    if (!urls.length) return false;
    let nuevo = false;
    await Promise.all(urls.map((u) => {
        if (!bajandoEscudos.has(u)) {   // si otra pasada ya lo está bajando, se espera a esa
            nuevo = true;
            bajandoEscudos.set(u, (async () => {
                try {
                    const r = await fetch(u, { mode: 'cors' });
                    if (!r.ok) throw new Error(`HTTP ${r.status}`);
                    cacheEscudos.set(u, await blobADataURL(await r.blob()));
                } catch (err) {
                    console.warn('No se pudo bajar el escudo para el PNG:', u, err);
                    cacheEscudos.set(u, u);   // queda el enlace tal cual
                } finally {
                    bajandoEscudos.delete(u);
                }
            })());
        }
        return bajandoEscudos.get(u);
    }));
    return nuevo;
}

// Genera los PNG de la pestaña activa (flyers o planilla), los sube y deja los enlaces en la programación
async function subirImagenesProgramacion(id) {
    const campo = estado.pestana === 'arbitros' ? 'planilla' : 'flyers';
    clearTimeout(temporizador);
    pendLista = false;
    await renderActivo(false);
    if (!flyersActuales.length) return 0;
    estadoNube('Nube: generando imágenes…', 'espera');
    const archivos = await generarArchivos(flyersActuales.map((_, i) => i));
    const subidas = [];
    for (let k = 0; k < archivos.length; k++) {
        estadoNube(`Nube: subiendo imagen ${k + 1}/${archivos.length}…`, 'espera');
        const r = await ik().subir(archivos[k].file, archivos[k].nombre, `/${campo}/${id}`);
        subidas.push({ url: r.url, fileId: r.fileId, nombre: archivos[k].nombre });
    }
    await nube().programaciones.actualizar(id, { [campo]: subidas });
    return subidas.length;
}

async function migrarEscudosAIk() {
    if (!ikListo()) { mostrarToast('Primero cargá las claves de ImageKit.', 'error'); return; }
    const pendientes = estado.equipos.filter(e => /^data:image\//i.test(e.escudo));
    if (!pendientes.length) { mostrarToast('No hay escudos para mover: todos ya están en ImageKit o no tienen imagen.'); return; }
    const boton = $('btn-ik-migrar');
    boton.disabled = true;
    let ok = 0, fallo = '';
    try {
        for (let i = 0; i < pendientes.length; i++) {
            mostrarToast(`Subiendo escudo ${i + 1}/${pendientes.length}…`);
            try {
                pendientes[i].escudo = (await ik().subir(pendientes[i].escudo, `escudo-${pendientes[i].id}.png`, '/escudos')).url;
                ok++;
            } catch (err) {
                console.error('No se pudo mover el escudo:', err);
                fallo = mensajeErrorIk(err);
                break;
            }
        }
    } finally {
        boton.disabled = false;
    }
    if (ok) { guardarEquipos(); construirEquipos(); renderActivo(false); }
    if (fallo) mostrarToast(`Se movieron ${ok} de ${pendientes.length}. ${fallo}`, 'error');
    else mostrarToast(`Listo: ${ok} ${ok === 1 ? 'escudo movido' : 'escudos movidos'} a ImageKit.`);
}

function actualizarEstadoIk() {
    const api = ik(), c = api && api.claves();
    const el = $('ik-estado');
    el.textContent = !api ? 'No cargó imagekit-liga.js' : (c ? 'Claves cargadas' : 'Sin claves');
    el.style.color = c ? '#0673C8' : '#b45309';
    $('btn-ik-quitar').classList.toggle('hidden', !c);
    $('in-ik-pub').value = c ? c.pub : '';
    $('in-ik-priv').value = '';
    $('in-ik-priv').placeholder = c ? '•••••• (guardada; escribí otra para cambiarla)' : 'private_...';
}

function iniciarImageKitUI() {
    $('chk-subir-flyers').checked = !!estado.subirFlyers;
    $('chk-subir-flyers').addEventListener('change', (e) => { estado.subirFlyers = e.target.checked; guardarEstado(); });
    $('btn-ik-guardar').addEventListener('click', () => {
        const api = ik();
        if (!api) { mostrarToast('No cargó imagekit-liga.js: revisá que esté en la misma carpeta.', 'error'); return; }
        const pub = $('in-ik-pub').value.trim();
        const previa = api.claves();
        const priv = $('in-ik-priv').value.trim() || (previa ? previa.priv : '');
        if (!pub || !priv) { mostrarToast('Completá la public key y la private key.', 'error'); return; }
        try { api.guardarClaves(pub, priv); }
        catch (err) { mostrarToast('Este navegador no dejó guardar las claves.', 'error'); return; }
        actualizarEstadoIk(); actualizarPanelEscudos();
        mostrarToast('Claves guardadas en este navegador.');
    });
    $('btn-ik-quitar').addEventListener('click', () => {
        if (!ik() || !confirm('¿Quitar las claves de ImageKit de este navegador?')) return;
        ik().quitarClaves();
        actualizarEstadoIk(); actualizarPanelEscudos();
    });
    $('btn-ik-migrar').addEventListener('click', migrarEscudosAIk);
    actualizarEstadoIk();
}

function iniciarNubeUI() {
    $('btn-prog-guardar').addEventListener('click', () => guardarProgramacion(false));
    $('btn-prog-nueva').addEventListener('click', () => guardarProgramacion(true));
    $('btn-hist-recargar').addEventListener('click', cargarHistorial);
    $('lista-historial').addEventListener('click', (e) => {
        const card = e.target.closest('[data-hid]');
        if (!card) return;
        if (e.target.closest('[data-hist-abrir]')) abrirProgramacion(card.dataset.hid);
        else if (e.target.closest('[data-hist-borrar]')) borrarProgramacion(card.dataset.hid);
    });
    sincronizarBotonesProg();
    // El módulo de Firebase carga después de este script: se espera su aviso (o se arranca si ya estaba)
    window.addEventListener('fb-listo', iniciarNube);
    if (nube()) iniciarNube();
    else setTimeout(() => { if (!nube()) estadoNube('Nube: sin conexión', 'error'); }, 6000);
}

// ---------- Ordenar la programación pegada ----------
function nombresConocidos() {
    const n = [];
    estado.equipos.forEach(eq => { n.push(eq.nombre); String(eq.alias || '').split(/[,;|]/).forEach(a => n.push(a.trim())); });
    return n.concat(equiposDeProgramacion()).filter(Boolean);
}
function avisarOrden(avisos) {
    if (avisos.length) mostrarToast(`Texto ordenado. Revisá ${avisos.length === 1 ? 'este partido' : 'estos ' + avisos.length + ' partidos'}: ${avisos[0]}${avisos.length > 1 ? '…' : ''}`, 'error');
    else mostrarToast('Texto ordenado');
}
function iniciarOrdenAuto() {
    // al pegar, el texto entra ya ordenado (con Ctrl+Z se deshace)
    ['in-texto', 'in-texto-arb'].forEach(id => {
        const ta = $(id);
        ta.addEventListener('paste', (e) => {
            const crudo = (e.clipboardData || window.clipboardData || { getData: () => '' }).getData('text');
            if (!crudo || !/\svs\.?\s/i.test(crudo)) return;
            const r = ordenarProgramacion(crudo, nombresConocidos());
            if (r.texto === crudo.replace(/\r/g, '')) return;
            e.preventDefault();
            ta.focus();
            if (!document.execCommand || !document.execCommand('insertText', false, r.texto)) {
                ta.setRangeText(r.texto, ta.selectionStart, ta.selectionEnd, 'end');
                ta.dispatchEvent(new Event('input', { bubbles: true }));
            }
            avisarOrden(r.avisos);
        });
    });
    // botón "Ordenar": reordena todo lo que hay en la caja de la pestaña activa
    $('btn-ordenar').addEventListener('click', () => {
        const arb = estado.pestana === 'arbitros';
        const r = ordenarProgramacion(arb ? estado.textoArb : estado.texto, nombresConocidos());
        if (arb) estado.textoArb = r.texto; else estado.texto = r.texto;
        guardarEstado(); llenarInputs(); renderActivo(true);
        avisarOrden(r.avisos);
    });
}

async function iniciar() {
    construirFormatos();
    construirDensidades();
    construirDisenos();
    llenarInputs();

    $('tiles-diseno').addEventListener('click', (e) => {
        const b = e.target.closest('[data-diseno]');
        if (!b) return;
        estado.diseno = b.dataset.diseno;
        guardarEstado(); sincronizarDiseno(); render();
    });
    iniciarOrdenAuto();
    $('in-texto').addEventListener('input', (e) => { estado.texto = e.target.value; guardarEstado(); renderDiferido(); });
    $('in-texto-arb').addEventListener('input', (e) => { estado.textoArb = e.target.value; guardarEstado(); renderDiferido(); });
    $('in-texto-res').addEventListener('input', (e) => { estado.textoRes = e.target.value; guardarEstado(); renderDiferido(); });
    $('in-titulo').addEventListener('input', (e) => { if (estado.pestana === 'resultados') estado.tituloRes = e.target.value; else estado.titulo = e.target.value; guardarEstado(); renderDiferido(); });
    $('in-fecha').addEventListener('input', (e) => { estado.fecha = e.target.value; guardarEstado(); renderDiferido(); });
    $('in-pie').addEventListener('input', (e) => { estado.pie = e.target.value; guardarEstado(); renderDiferido(); });
    $('tiles-densidad').addEventListener('click', (e) => {
        const b = e.target.closest('[data-densidad]');
        if (!b) return;
        estado.densidad = b.dataset.densidad;
        guardarEstado(); sincronizarDensidad(); render();
    });
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
    // Ejemplo y Borrar empiezan de cero: ya no se está editando una programación guardada
    $('btn-ejemplo').addEventListener('click', () => { if (estado.pestana === 'resultados') { estado.textoRes = TEXTO_EJEMPLO_RES; guardarEstado(); llenarInputs(); renderActivo(true); return; } if (estado.pestana === 'arbitros') estado.textoArb = TEXTO_EJEMPLO; else estado.texto = TEXTO_EJEMPLO; fijarProg(tipoActual(), '', ''); guardarEstado(); llenarInputs(); sincronizarBotonesProg(); renderActivo(true); });
    $('btn-limpiar').addEventListener('click', () => { if (estado.pestana === 'resultados') { estado.textoRes = ''; guardarEstado(); llenarInputs(); renderActivo(true); return; } if (estado.pestana === 'arbitros') estado.textoArb = ''; else estado.texto = ''; fijarProg(tipoActual(), '', ''); guardarEstado(); llenarInputs(); sincronizarBotonesProg(); renderActivo(true); });
    $('previews').addEventListener('click', (e) => {
        const v = e.target.closest('[data-ver]');
        if (v) { abrirVisor(Number(v.dataset.ver)); return; }
        const b = e.target.closest('[data-descargar]');
        if (b) descargar([Number(b.dataset.descargar)], b);
    });
    $('btn-todos').addEventListener('click', (e) => {
        descargar(flyersActuales.map((_, i) => i), e.currentTarget);
    });

    iniciarArbitros();
    construirEquipos();
    iniciarEscudos();
    iniciarBuscadorEscudos();
    iniciarNubeUI();
    iniciarImageKitUI();
    if (window.tablaLiga) window.tablaLiga.iniciar({
        estado, $, guardarEstado, esc, crearBuscador, parsearProgramacion, htmlFlyer, aplicarDiseno, alturaUtil, H, TEXTO, TITULAR, FORMATOS, DISENOS,
        precargarEscudos, renderDiferido, abrirVisor, descargar,
        color: () => COLOR, tema: () => TEMA, logo: logoActual, toast: mostrarToast,
        slug: (t) => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tabla',
        escudoDe: () => { const b = crearBuscador(estado.equipos); return (n) => { const e = b(n); const u = (e && e.escudo) || ''; return cacheEscudos.get(u) || u; }; },
        nombresActuales: () => flyersActuales.map((_, i) => i),
        publicar: (htmls, nombres, f) => {   // deja listos los PNG a tamaño real y la vista ampliada
            htmlsActuales = htmls;
            vista = { ancho: f.ancho, alto: f.alto, ratio: ANCHO_SALIDA / f.ancho, fondo: COLOR.fondo };
            $('export').innerHTML = htmls.map(h => `<div style="width:${f.ancho}px; height:${f.alto}px;">${h}</div>`).join('');
            flyersActuales = nombres.map((nombre, i) => ({ nombre, nodo: $('export').querySelector(`[data-flyer="${i}"]`) }));
            if (visorIdx >= 0) pintarVisor();
        },
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

    aplicarPestana(estado.pestana);
    await renderActivo(true);
    llenarInputs();
    // Cuando terminan de cargar las tipografías, se vuelve a dibujar con las definitivas
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => renderActivo(false));
}

iniciar();

} // fin del bloque solo-navegador

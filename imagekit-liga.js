// ============================================================
// IMAGEKIT — Generador de flyers Liga A.F.O.CH
// Sube imágenes (escudos y PNG de los flyers) a ImageKit directo desde el navegador.
//
// ImageKit pide que cada subida lleve una firma (token + expire + signature) calculada
// con la clave PRIVADA. Su documentación recomienda hacerlo en un servidor; como esta
// herramienta es de uso interno, acá se calcula en el propio navegador con las claves
// que cargás una sola vez en la página. Quedan en el localStorage de este navegador:
// no están en este archivo, ni en el HTML, ni en Firebase.
//
// Deja listo `window.ik`. Se carga como script común, antes de flyers-liga.js.
// La firma usa WebCrypto, que solo existe en https o en localhost.
// ============================================================
(() => {
    const URL_ENDPOINT = 'https://ik.imagekit.io/5wj1tw4ym';
    const URL_SUBIDA = 'https://upload.imagekit.io/api/v1/files/upload';
    const CLAVE_LS = 'afoch_flyers_ik_v1';
    const VALIDEZ_FIRMA = 30 * 60;   // segundos (ImageKit exige que sea menos de una hora)

    function claves() {
        try {
            const g = JSON.parse(localStorage.getItem(CLAVE_LS) || 'null');
            if (g && g.pub && g.priv) return { pub: String(g.pub).trim(), priv: String(g.priv).trim() };
        } catch (err) { /* storage bloqueado o JSON roto */ }
        return null;
    }
    function guardarClaves(pub, priv) {
        localStorage.setItem(CLAVE_LS, JSON.stringify({ pub: String(pub).trim(), priv: String(priv).trim() }));
    }
    function quitarClaves() {
        try { localStorage.removeItem(CLAVE_LS); } catch (err) { /* sin storage */ }
    }

    const aHex = (bytes) => [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');
    const aleatorio = () => aHex(crypto.getRandomValues(new Uint8Array(16)));

    // signature = HMAC-SHA1(token + expire) con la clave privada, en hexadecimal
    async function firmar(token, expire, privada) {
        if (!(window.crypto && crypto.subtle)) {
            throw Object.assign(new Error('Para firmar la subida abrí la página por https o desde localhost.'), { code: 'ik/sin-crypto' });
        }
        const enc = new TextEncoder();
        const llave = await crypto.subtle.importKey('raw', enc.encode(privada), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
        return aHex(await crypto.subtle.sign('HMAC', llave, enc.encode(token + expire)));
    }

    // `archivo`: File/Blob o una imagen en data URL. Devuelve { url, fileId, nombre }.
    async function subir(archivo, nombre, carpeta) {
        const c = claves();
        if (!c) throw Object.assign(new Error('Faltan las claves de ImageKit.'), { code: 'ik/sin-claves' });
        const blob = typeof archivo === 'string' ? await (await fetch(archivo)).blob() : archivo;
        const token = aleatorio();
        const expire = Math.floor(Date.now() / 1000) + VALIDEZ_FIRMA;

        const f = new FormData();
        f.append('file', blob, nombre);
        f.append('fileName', nombre);
        f.append('publicKey', c.pub);
        f.append('signature', await firmar(token, expire, c.priv));
        f.append('expire', String(expire));
        f.append('token', token);
        f.append('useUniqueFileName', 'true');   // cada subida es un archivo nuevo (evita que quede una versión vieja en la caché)
        if (carpeta) f.append('folder', carpeta);

        const r = await fetch(URL_SUBIDA, { method: 'POST', body: f });
        let d = null;
        try { d = await r.json(); } catch (err) { /* respuesta sin JSON */ }
        if (!r.ok || !d || !d.url) {
            throw Object.assign(new Error((d && d.message) || `ImageKit respondió ${r.status}`), { code: `ik/${r.status}` });
        }
        return { url: d.url, fileId: d.fileId, nombre: d.name };
    }

    window.ik = {
        endpoint: URL_ENDPOINT,
        claves,
        configurado: () => !!claves(),
        guardarClaves,
        quitarClaves,
        subir,
        _firmar: firmar,   // expuesto para pruebas
    };
})();

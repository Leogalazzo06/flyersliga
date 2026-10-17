// ============================================================
// CONEXIÓN CON FIREBASE — Generador de flyers Liga A.F.O.CH
// Se carga como módulo (<script type="module" src="firebase-liga.js">) y deja
// listo `window.fb` para que lo use flyers-liga.js. Cuando termina avisa con el
// evento "fb-listo". Si este archivo no carga, el generador sigue andando igual
// (solo que sin nube).
//
// Colecciones de Firestore:
//   equipos/{id}          -> { nombre, alias, escudo }
//   programaciones/{id}   -> { nombre, texto, titulo, fecha, pie, diseno, formato, ...,
//                              creada, actualizada }
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import {
    getFirestore, collection, doc, addDoc, updateDoc, getDocs, deleteDoc,
    query, orderBy, limit, serverTimestamp, writeBatch,
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDfUmx_eosoh-OVFw3IKipwkk6EqjLOOVA",
    authDomain: "flyersliga.firebaseapp.com",
    projectId: "flyersliga",
    storageBucket: "flyersliga.firebasestorage.app",
    messagingSenderId: "554644526534",
    appId: "1:554644526534:web:bd39b95a6b0f1327c70ec7",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const colEquipos = collection(db, "equipos");
const colProg = collection(db, "programaciones");

// Timestamp de Firestore -> milisegundos (o null si todavía no tiene)
const aMs = (t) => (t && typeof t.toMillis === "function" ? t.toMillis() : null);

// Firestore permite hasta 500 operaciones por lote: se parte en tandas más chicas
async function enLotes(operaciones, tam = 100) {
    for (let i = 0; i < operaciones.length; i += tam) {
        const lote = writeBatch(db);
        operaciones.slice(i, i + tam).forEach((op) => op(lote));
        await lote.commit();
    }
}

window.fb = {
    equipos: {
        async listar() {
            const snap = await getDocs(colEquipos);
            return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        },
        // Sube los equipos de `guardar` ([{ id, nombre, alias, escudo }]) y borra los ids de `borrar`
        async sincronizar(guardar = [], borrar = []) {
            const ops = [
                ...guardar.map(({ id, ...resto }) => (lote) => lote.set(doc(colEquipos, id), resto)),
                ...borrar.map((id) => (lote) => lote.delete(doc(colEquipos, id))),
            ];
            await enLotes(ops);
        },
    },

    programaciones: {
        async crear(datos) {
            const ref = await addDoc(colProg, { ...datos, creada: serverTimestamp(), actualizada: serverTimestamp() });
            return ref.id;
        },
        // Falla con code "not-found" si la programación ya no existe (la borraron desde otro lado)
        async actualizar(id, datos) {
            await updateDoc(doc(colProg, id), { ...datos, actualizada: serverTimestamp() });
        },
        async listar(max = 100) {
            const snap = await getDocs(query(colProg, orderBy("creada", "desc"), limit(max)));
            return snap.docs.map((d) => {
                const x = d.data();
                return { id: d.id, ...x, creada: aMs(x.creada), actualizada: aMs(x.actualizada) };
            });
        },
        async borrar(id) {
            await deleteDoc(doc(colProg, id));
        },
    },
};

window.dispatchEvent(new Event("fb-listo"));
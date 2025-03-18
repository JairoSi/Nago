import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

// 1️⃣ 🔹 Inicializando o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 3️⃣ 🔹 Captura o usuário do localStorage
const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuarioLogado || !usuarioLogado.uid) {
    alert("Acesso negado! Você precisa estar autenticado.");
    window.location.href = "index.html";
}

// 4️⃣ 🔹 Verifica se o usuário tem permissão para acessar a página
async function verificarPermissao() {
    try {
        const usuarioRef = doc(db, "usuarios", usuarioLogado.uid);
        const usuarioSnap = await getDoc(usuarioRef);

        if (!usuarioSnap.exists()) {
            alert("Usuário não encontrado.");
            window.location.href = "index.html";
            return;
        }

        const dadosUsuario = usuarioSnap.data();
        usuarioLogado.nivel = dadosUsuario.nivel || "Aluno";

        // ✅ Atualizado para refletir os níveis corretos utilizados no sistema
        const niveisPermitidos = ["Mestre", "Contra-mestre", "Professor", "Graduado", "Estagiário"];

        if (!niveisPermitidos.includes(usuarioLogado.nivel)) {
            alert("Acesso negado! Você não tem permissão para acessar esta área.");
            window.location.href = "dashboard.html";
        } else {
            document.getElementById("bloqueio").style.display = "none";
        }
    } catch (error) {
        alert("Erro ao verificar permissão. Redirecionando...");
        window.location.href = "index.html";
    }
}

// Restante do código mantido...
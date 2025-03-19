import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

// 1️⃣ 🔹 Inicializando o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 3️⃣ 🔹 Captura o usuário do localStorage
const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuarioLogado || !usuarioLogado.uid) {
    alert("Acesso negado! Faça login para continuar.");
    window.location.href = "index.html";
}

// 4️⃣ 🔹 Função para carregar dados do usuário e garantir redirecionamento correto
async function carregarDadosUsuario() {
    try {
        const usuarioRef = doc(db, "usuarios", usuarioLogado.uid);
        const usuarioSnap = await getDoc(usuarioRef);

        if (usuarioSnap.exists()) {
            const dadosUsuario = usuarioSnap.data();

            usuarioLogado.nivel = dadosUsuario.nivel || "Aluno";
            localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

            // 🔹 Redirecionamento para usuários com nível de gestão atualizado
            const niveisDeGestao = ["Mestre", "Contra-mestre", "Professor", "Graduado", "Estagiário"];
            if (niveisDeGestao.includes(usuarioLogado.nivel)) {
                window.location.href = "gestao.html";
                return;
            }

            document.getElementById("user-nome").textContent = usuarioLogado.nome;
            document.getElementById("user-email").textContent = usuarioLogado.email;
            document.getElementById("user-nivel").textContent = usuarioLogado.nivel;

        } else {
            window.location.href = "index.html";
        }
    } catch (error) {
        window.location.href = "index.html";
    }
}

// Restante do dashboard.js mantido com a importação de config.js e níveis corrigidos

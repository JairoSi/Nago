import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔹 Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDEwWz8aFhwYQzQmBmQR5YFUBd7vg5mJSk",
    authDomain: "nagocapoeira-6cae5.firebaseapp.com",
    projectId: "nagocapoeira-6cae5",
    storageBucket: "nagocapoeira-6cae5.appspot.com",
    messagingSenderId: "14626642245",
    appId: ""
};

// 🔹 Inicializando o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 Captura o usuário do localStorage
const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuarioLogado || !usuarioLogado.uid) {
    alert("Acesso negado! Você precisa estar autenticado.");
    window.location.href = "index.html";
}

// 🔹 ALTERAÇÃO EM 12/03/2025 às 22:40
// 🔹 Correção: Garantir que o script só rode após o DOM estar carregado e que a tabela de pagamentos exista antes de ser manipulada.
document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Documento carregado!");

    const tabelaPagamentos = document.getElementById("tabela-pagamentos-body");
    if (!tabelaPagamentos) {
        console.error("❌ Erro: Elemento 'tabela-pagamentos-body' não encontrado no HTML.");
        return;
    }

    console.log("✅ Tabela de pagamentos encontrada, carregando dados...");
    carregarPagamentos();
});

// 🔹 Verifica se o usuário tem permissão para acessar a página
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
        const nivelUsuario = dadosUsuario.nivel || "Aluno";

        // 🔹 Define os níveis permitidos (mantendo os já definidos)
        const niveisPermitidos = ["Mestre", "Professor", "Monitor"];

        if (!niveisPermitidos.includes(nivelUsuario)) {
            alert("Acesso negado! Você não tem permissão para acessar esta área.");
            window.location.href = "dashboard.html";
        } else {
            // 🔹 Remove o bloqueio visual caso o usuário seja autorizado
            document.getElementById("bloqueio").style.display = "none";
            console.log("✅ Acesso permitido:", nivelUsuario);
        }
    } catch (error) {
        console.error("❌ Erro ao verificar permissão:", error);
        alert("Erro ao verificar permissão. Redirecionando...");
        window.location.href = "index.html";
    }
}

// 🔹 Carregar os dados do grupo
async function carregarResumo() {
    const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
    const totalAlunos = usuariosSnapshot.size;

    let totalArrecadado = 0;
    let totalDoacoes = 0;
    let totalEventos = 5; // Número fictício de eventos (depois carregamos do Firestore)

    usuariosSnapshot.forEach(async (userDoc) => {
        const pagamentosSnapshot = await getDocs(collection(db, "usuarios", userDoc.id, "pagamentos"));
        pagamentosSnapshot.forEach((pagamento) => {
            totalArrecadado += pagamento.data().valor;
        });
    });

    document.getElementById("total-alunos").textContent = totalAlunos;
    document.getElementById("total-arrecadado").textContent = totalArrecadado.toFixed(2);
    document.getElementById("total-doacoes").textContent = totalDoacoes.toFixed(2);
    document.getElementById("total-eventos").textContent = totalEventos;
}

// 🔹 ALTERAÇÃO EM 12/03/2025 às 22:40
// 🔹 Correção: Adicionado verificação para evitar erro ao carregar pagamentos.
async function carregarPagamentos() {
    const tabelaPagamentos = document.getElementById("tabela-pagamentos-body");

    if (!tabelaPagamentos) {
        console.error("❌ Erro: Elemento 'tabela-pagamentos-body' não encontrado.");
        return;
    }

    tabelaPagamentos.innerHTML = "<tr><td colspan='5'>Carregando...</td></tr>";

    const usuariosSnapshot = await getDocs(collection(db, "usuarios"));

    let linhas = "";
    for (const userDoc of usuariosSnapshot.docs) {
        const pagamentosSnapshot = await getDocs(collection(db, "usuarios", userDoc.id, "pagamentos"));
        pagamentosSnapshot.forEach((pagamento) => {
            linhas += `
                <tr>
                    <td>${userDoc.data().nome}</td>
                    <td>R$ ${pagamento.data().valor.toFixed(2)}</td>
                    <td>${new Date(pagamento.data().data.toDate()).toLocaleDateString("pt-BR")}</td>
                    <td>${pagamento.data().metodo}</td>
                    <td>${pagamento.data().status}</td>
                </tr>`;
        });
    }

    tabelaPagamentos.innerHTML = linhas || "<tr><td colspan='5'>Nenhum pagamento registrado.</td></tr>";
}

// 🔹 LOGOUT
document.getElementById("logout").addEventListener("click", function () {
    localStorage.removeItem("usuarioLogado");
    alert("Você saiu com sucesso!");
    window.location.href = "index.html";
});

// 🔹 Executa ao carregar a página
verificarPermissao();
carregarResumo();
carregarMeusPagamentos();
carregarUsuarios();

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

// 🔹 Carregar pagamentos dos alunos
async function carregarPagamentos() {
    const tabelaPagamentos = document.getElementById("tabela-pagamentos");
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

// 🔹 Carregar pagamentos do próprio usuário logado (Mestre)
async function carregarMeusPagamentos() {
    const tabelaMeusPagamentos = document.getElementById("tabela-meus-pagamentos");
    tabelaMeusPagamentos.innerHTML = "<tr><td colspan='4'>Carregando...</td></tr>";

    const usuarioId = usuarioLogado.uid;
    const pagamentosRef = collection(db, "usuarios", usuarioId, "pagamentos");
    const pagamentosSnapshot = await getDocs(pagamentosRef);

    let linhas = "";
    pagamentosSnapshot.forEach((pagamento) => {
        linhas += `
            <tr>
                <td>R$ ${pagamento.data().valor.toFixed(2)}</td>
                <td>${new Date(pagamento.data().data.toDate()).toLocaleDateString("pt-BR")}</td>
                <td>${pagamento.data().metodo}</td>
                <td>${pagamento.data().status}</td>
            </tr>`;
    });

    tabelaMeusPagamentos.innerHTML = linhas || "<tr><td colspan='4'>Nenhum pagamento registrado.</td></tr>";
}

// 🔹 Carregar lista de usuários para alteração de nível
async function carregarUsuarios() {
    const usuariosRef = collection(db, "usuarios");
    const usuariosSnapshot = await getDocs(usuariosRef);

    const usuarioSelect = document.getElementById("usuario-select");
    usuarioSelect.innerHTML = "<option value=''>Selecione um usuário</option>";

    usuariosSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        usuarioSelect.innerHTML += `<option value="${userDoc.id}">${userData.nome} (${userData.nivel})</option>`;
    });
}

// 🔹 Função para alterar o nível de um usuário
async function alterarNivelUsuario() {
    const usuarioId = document.getElementById("usuario-select").value;
    const novoNivel = document.getElementById("novo-nivel").value;

    if (!usuarioId) {
        alert("Por favor, selecione um usuário.");
        return;
    }

    try {
        const usuarioRef = doc(db, "usuarios", usuarioId);
        await updateDoc(usuarioRef, { nivel: novoNivel });

        alert(`✅ Nível alterado com sucesso para ${novoNivel}!`);
        carregarUsuarios(); // Atualiza a lista de usuários

    } catch (error) {
        console.error("❌ Erro ao alterar nível:", error);
        alert("Erro ao alterar nível do usuário.");
    }
}

// 🔹 Adicionar evento ao botão de alteração de nível
document.getElementById("alterar-nivel").addEventListener("click", alterarNivelUsuario);

// 🔹 LOGOUT
document.getElementById("logout").addEventListener("click", function () {
    localStorage.removeItem("usuarioLogado");
    alert("Você saiu com sucesso!");
    window.location.href = "index.html";
});

// 🔹 Executa ao carregar a página
verificarPermissao();
carregarResumo();
carregarPagamentos();
carregarMeusPagamentos();
carregarUsuarios();

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

        // 🔹 Define os níveis permitidos para gestão
        const niveisPermitidos = ["Mestre", "Professor", "Contra-mestre"];

        if (!niveisPermitidos.includes(nivelUsuario)) {
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

// 🔹 Carregar pagamentos
// 🔹 Função para carregar todos os pagamentos para os usuários da gestão
async function carregarPagamentos() {
    const tabelaPagamentos = document.getElementById("tabela-pagamentos-body");

    if (!tabelaPagamentos) return;

    tabelaPagamentos.innerHTML = "<tr><td colspan='6'>Carregando...</td></tr>";

    const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
    let linhas = "";

    for (const userDoc of usuariosSnapshot.docs) {
        const pagamentosSnapshot = await getDocs(collection(db, "usuarios", userDoc.id, "pagamentos"));

        pagamentosSnapshot.forEach((pagamento) => {
            const pagamentoData = pagamento.data();
            const pagamentoId = pagamento.id;
            const status = pagamentoData.status;

            const podeAprovar = ["Mestre", "Professor", "Contra-mestre"].includes(usuarioLogado.nivel);

            // 🔹 Sempre inicia com "Aprovar" se estiver pendente
            const nomeBotao = status === "pago" ? "Reprovar" : "Aprovar";

            linhas += `
                <tr>
                    <td>${userDoc.data().nome}</td>
                    <td>R$ ${pagamentoData.valor.toFixed(2)}</td>
                    <td>${new Date(pagamentoData.data.toDate()).toLocaleDateString("pt-BR")}</td>
                    <td>${pagamentoData.metodo}</td>
                    <td id="status-${pagamentoId}">${status}</td>
                    <td id="acao-${pagamentoId}">
                        ${podeAprovar ? `<button onclick="alterarStatusPagamento('${userDoc.id}', '${pagamentoId}', '${status}')">${nomeBotao}</button>` : ""}
                    </td>
                </tr>`;
        });
    }

    tabelaPagamentos.innerHTML = linhas || "<tr><td colspan='6'>Nenhum pagamento registrado.</td></tr>";
}


// 🔹 Função para carregar apenas os pagamentos do usuário logado
window.carregarMeusPagamentos = async function () {
    const tabelaMeusPagamentos = document.getElementById("tabela-meus-pagamentos");

    if (!tabelaMeusPagamentos) return;

    tabelaMeusPagamentos.innerHTML = "<tr><td colspan='4'>Carregando...</td></tr>";

    try {
        const usuarioId = usuarioLogado.uid;
        const pagamentosRef = collection(db, "usuarios", usuarioId, "pagamentos");
        const pagamentosSnapshot = await getDocs(pagamentosRef);

        let linhas = "";
        pagamentosSnapshot.forEach((pagamento) => {
            const dadosPagamento = pagamento.data();
            linhas += `
                <tr>
                    <td>R$ ${dadosPagamento.valor.toFixed(2)}</td>
                    <td>${new Date(dadosPagamento.data.toDate()).toLocaleDateString("pt-BR")}</td>
                    <td>${dadosPagamento.metodo}</td>
                    <td>${dadosPagamento.status}</td>
                </tr>`;
        });

        tabelaMeusPagamentos.innerHTML = linhas || "<tr><td colspan='4'>Nenhum pagamento encontrado.</td></tr>";

    } catch (error) {
        tabelaMeusPagamentos.innerHTML = "<tr><td colspan='4'>Erro ao carregar pagamentos.</td></tr>";
    }
};

// 🔹 Função para aprovar/reprovar pagamento
window.alterarStatusPagamento = async function (userId, pagamentoId, statusAtual) {
    try {
        const novoStatus = statusAtual === "pendente" ? "pago" : "pendente";
        const pagamentoRef = doc(db, "usuarios", userId, "pagamentos", pagamentoId);
        await updateDoc(pagamentoRef, { status: novoStatus });

        document.getElementById(`status-${pagamentoId}`).textContent = novoStatus;
        document.getElementById(`acao-${pagamentoId}`).innerHTML = `<button onclick="alterarStatusPagamento('${userId}', '${pagamentoId}', '${novoStatus}')">${novoStatus === "pendente" ? "Aprovar" : "Reprovar"}</button>`;
    } catch (error) {
        alert("Erro ao atualizar pagamento.");
    }
};

// 🔹 Função para carregar usuários
window.carregarUsuarios = async function () {
    try {
        const usuariosRef = collection(db, "usuarios");
        const usuariosSnapshot = await getDocs(usuariosRef);

        const usuarioSelect = document.getElementById("usuario-select");

        if (!usuarioSelect) {
            console.error("❌ Erro: Elemento 'usuario-select' não encontrado no HTML.");
            return;
        }

        usuarioSelect.innerHTML = "<option value=''>Selecione um usuário</option>";

        usuariosSnapshot.forEach((userDoc) => {
            const userData = userDoc.data();
            usuarioSelect.innerHTML += `<option value="${userDoc.id}">${userData.nome} (${userData.nivel})</option>`;
        });

        console.log("✅ Lista de usuários carregada com sucesso.");
    } catch (error) {
        console.error("❌ Erro ao carregar usuários:", error);
    }
};

// 🔹 Função para alterar nível do usuário
window.alterarNivelUsuario = async function () {
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
        carregarUsuarios();
    } catch (error) {
        console.error("❌ Erro ao alterar nível:", error);
        alert("Erro ao alterar nível do usuário.");
    }
};

// 🔹 Logout
document.getElementById("logout").addEventListener("click", function () {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
});

// 🔹 Executa ao carregar a página
verificarPermissao();
carregarPagamentos();
carregarMeusPagamentos();
carregarUsuarios();

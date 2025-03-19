import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1️⃣ 🔹 Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDEwWz8aFhwYQzQmBmQR5YFUBd7vg5mJSk",
    authDomain: "nagocapoeira-6cae5.firebaseapp.com",
    projectId: "nagocapoeira-6cae5",
    storageBucket: "nagocapoeira-6cae5.appspot.com",
    messagingSenderId: "14626642245",
    appId: ""
};

// 2️⃣ 🔹 Inicializando o Firebase
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

        const niveisPermitidos = ["Mestre", "Professor", "Contra-mestre"];

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

/*
// 5️⃣ 🔹 Função para carregar pagamentos separados por aluno ✅
// 🆕 Atualização em 14/03/2025 - 16:30 (Brasília): Melhor organização da tabela e cores.
// 5️⃣ 🔹 Função para carregar pagamentos separados por aluno ✅
async function carregarPagamentos() {
    const tabelaPagamentos = document.getElementById("tabela-pagamentos-body");

    if (!tabelaPagamentos) return;

    tabelaPagamentos.innerHTML = "<tr><td colspan='6'>Carregando...</td></tr>";

    const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
    let pagamentosPorAluno = {};

    for (const userDoc of usuariosSnapshot.docs) {
        const pagamentosSnapshot = await getDocs(collection(db, "usuarios", userDoc.id, "pagamentos"));

        let totalPago = 0;
        let totalPendente = 0;
        let pagamentos = [];

        pagamentosSnapshot.forEach((pagamento) => {
            const pagamentoData = pagamento.data();
            const valor = parseFloat(pagamentoData.valor);
            const status = pagamentoData.status;
            const dataFormatada = new Date(pagamentoData.data.toDate()).toLocaleDateString("pt-BR");

            if (status === "pago") {
                totalPago += valor;
            } else {
                totalPendente += valor;
            }

            pagamentos.push({
                nome: userDoc.data().nome,
                valor,
                data: dataFormatada,
                metodo: pagamentoData.metodo,
                status,
                pagamentoId: pagamento.id,
                userId: userDoc.id
            });
        });

        if (pagamentos.length > 0) {
            pagamentosPorAluno[userDoc.data().nome] = { pagamentos, totalPago, totalPendente };
        }
    }

    let linhas = "";
    Object.keys(pagamentosPorAluno).forEach((nomeAluno) => {
        let alunoData = pagamentosPorAluno[nomeAluno];

        linhas += `<tr style="background: #cce5ff; font-weight: bold;"><td colspan="6">${nomeAluno}</td></tr>`;

        alunoData.pagamentos.forEach((pagamento) => {
            const nomeBotao = pagamento.status === "pago" ? "Reprovar" : "Aprovar";
            linhas += `
                <tr style="background: #f9f9f9;">
                    <td>${pagamento.nome}</td>
                    <td>${pagamento.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    <td>${pagamento.data}</td>
                    <td>${pagamento.metodo}</td>
                    <td style="color: ${pagamento.status === 'pago' ? 'green' : 'red'}; font-weight: bold;">${pagamento.status}</td>
                    <td id="acao-${pagamento.pagamentoId}">
                        <button onclick="alterarStatusPagamento('${pagamento.userId}', '${pagamento.pagamentoId}', '${pagamento.status}')">${nomeBotao}</button>
                    </td>
                </tr>`;
        });

        linhas += `
            <tr style="background: #e0e0e0; font-weight: bold;">
                <td colspan="2" style="color: green;">Total Pago: ${alunoData.totalPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td colspan="2" style="color: red;">Total Pendente: ${alunoData.totalPendente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td colspan="2"></td>
            </tr>`;
    });

    tabelaPagamentos.innerHTML = linhas;
}
*/



// 6️⃣ 🔹 Função para carregar pagamentos do usuário logado ✅
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

        tabelaMeusPagamentos.innerHTML = linhas;
    } catch (error) {
        tabelaMeusPagamentos.innerHTML = "<tr><td colspan='4'>Erro ao carregar pagamentos.</td></tr>";
    }
};
// 7️⃣ 🔹 Função para carregar usuários ✅
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

    // 🔹 Código mantido
};

// 8️⃣ 🔹 Função para alterar nível do usuário ✅
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

// 🔹 Código mantido
};

// 5️⃣ 🔹 Função para carregar pagamentos separados por aluno ✅
// 🆕 Atualização em 14/03/2025 - 16:30 (Brasília): Melhor organização da tabela e cores.
// 5️⃣ 🔹 Função para carregar pagamentos separados por aluno ✅
// 🆕 Atualização em 14/03/2025 - 16:50 (Brasília): Usando Promise.all para melhorar o desempenho

// INÍCIO DA ATUALIZAÇÃO DA FUNÇÃO carregarPagamentos
async function carregarPagamentos() {
    const tabelaPagamentos = document.getElementById("tabela-pagamentos-body");

    if (!tabelaPagamentos) return;

    tabelaPagamentos.innerHTML = "<tr><td colspan='6'>Carregando...</td></tr>";

    try {
        const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
        
        // Usando Promise.all para executar as requisições de forma paralela
        const pagamentosPromises = usuariosSnapshot.docs.map(async (userDoc) => {
            const pagamentosSnapshot = await getDocs(collection(db, "usuarios", userDoc.id, "pagamentos"));

            let totalPago = 0;
            let totalPendente = 0;
            let pagamentos = [];

            pagamentosSnapshot.forEach((pagamento) => {
                const pagamentoData = pagamento.data();
                const valor = parseFloat(pagamentoData.valor);
                const status = pagamentoData.status;
                const dataFormatada = new Date(pagamentoData.data.toDate()).toLocaleDateString("pt-BR");

                if (status === "pago") {
                    totalPago += valor;
                } else {
                    totalPendente += valor;
                }

                pagamentos.push({
                    nome: userDoc.data().nome,
                    valor,
                    data: dataFormatada,
                    metodo: pagamentoData.metodo,
                    status,
                    pagamentoId: pagamento.id,
                    userId: userDoc.id
                });
            });

            return { pagamentos, totalPago, totalPendente, nomeAluno: userDoc.data().nome };
        });

        // Espera todas as requisições serem completadas
        const pagamentosPorAluno = await Promise.all(pagamentosPromises);

        let linhas = "";
        pagamentosPorAluno.forEach((alunoData) => {
            linhas += `<tr style="background: #cce5ff; font-weight: bold;"><td colspan="6">${alunoData.nomeAluno}</td></tr>`;

            alunoData.pagamentos.forEach((pagamento) => {
                const nomeBotao = pagamento.status === "pago" ? "Reprovar" : "Aprovar";
                linhas += `
                    <tr style="background: #f9f9f9;">
                        <td>${pagamento.nome}</td>
                        <td>${pagamento.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                        <td>${pagamento.data}</td>
                        <td>${pagamento.metodo}</td>
                        <td style="color: ${pagamento.status === 'pago' ? 'green' : 'red'}; font-weight: bold;">${pagamento.status}</td>
                        <td id="acao-${pagamento.pagamentoId}">
                            <button onclick="alterarStatusPagamento('${pagamento.userId}', '${pagamento.pagamentoId}', '${pagamento.status}')">${nomeBotao}</button>
                        </td>
                    </tr>`;
            });

            linhas += `
                <tr style="background: #e0e0e0; font-weight: bold;">
                    <td colspan="2" style="color: green;">Total Pago: ${alunoData.totalPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    <td colspan="2" style="color: red;">Total Pendente: ${alunoData.totalPendente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    <td colspan="2"></td>
                </tr>`;
        });

        // Atualiza o conteúdo da tabela
        tabelaPagamentos.innerHTML = linhas;

    } catch (error) {
        console.error("❌ Erro ao carregar pagamentos:", error);
        tabelaPagamentos.innerHTML = "<tr><td colspan='6'>Erro ao carregar pagamentos.</td></tr>";
    }
}
// FIM DA ATUALIZAÇÃO DA FUNÇÃO carregarPagamentos


// 9️⃣ 🔹 Função para aprovar/reprovar pagamento ✅
// 🆕 Atualização em 14/03/2025 - 17:30 (Brasília): Correção para evitar erro ao buscar elementos no DOM
// INÍCIO DA ATUALIZAÇÃO DA FUNÇÃO alterarStatusPagamento
window.alterarStatusPagamento = async function (userId, pagamentoId, statusAtual) {
    try {
        // Obtém a referência do pagamento
        const pagamentoRef = doc(db, "usuarios", userId, "pagamentos", pagamentoId);
        const pagamentoSnap = await getDoc(pagamentoRef);

        if (!pagamentoSnap.exists()) {
            alert("Erro: Pagamento não encontrado.");
            return;
        }

        const pagamentoData = pagamentoSnap.data();
        const novoStatus = statusAtual === "pendente" ? "pago" : "pendente";

        // Atualiza o status do pagamento no Firestore
        await updateDoc(pagamentoRef, { status: novoStatus })
            .then(() => console.log(`✅ Pagamento ${pagamentoId} atualizado no Firestore para: ${novoStatus}`))
            .catch(err => console.error("Erro ao atualizar Firestore:", err));

        // Pequeno delay para garantir que os elementos do DOM estejam disponíveis
        setTimeout(() => {
            const statusElement = document.getElementById(`status-${pagamentoId}`);
            const botaoElement = document.getElementById(`acao-${pagamentoId}`);

            // Verifica se os elementos do DOM existem antes de tentar manipulá-los
            if (statusElement) {
                statusElement.textContent = novoStatus;
                statusElement.style.color = novoStatus === "pago" ? "green" : "red";
            } else {
                console.warn(`⚠️ Elemento status-${pagamentoId} não encontrado.`);
            }

            if (botaoElement) {
                botaoElement.innerHTML = `
                    <button onclick="alterarStatusPagamento('${userId}', '${pagamentoId}', '${novoStatus}')">
                        ${novoStatus === "pendente" ? "Aprovar" : "Reprovar"}
                    </button>`;
            } else {
                console.warn(`⚠️ Elemento acao-${pagamentoId} não encontrado.`);
            }
        }, 500); // Atraso para garantir que o DOM tenha sido atualizado corretamente

    } catch (error) {
        console.error("❌ Erro ao atualizar pagamento:", error);
        alert("Erro ao atualizar pagamento. Tente novamente.");
    }
};
// FIM DA ATUALIZAÇÃO DA FUNÇÃO alterarStatusPagamento


/*

// 9️⃣ 🔹 Função para aprovar/reprovar pagamento ✅
// 9️⃣ 🔹 Função para aprovar/reprovar pagamento ✅
// 🆕 Atualização em 14/03/2025 - 16:50 (Brasília): Corrigida a lógica de atualização do status e botão.
// 9️⃣ 🔹 Função para aprovar/reprovar pagamento ✅
// 🆕 Atualização em 14/03/2025 - 17:10 (Brasília): Correção para evitar erro de elemento nulo.
// 9️⃣ 🔹 Função para aprovar/reprovar pagamento ✅
// 🆕 Atualização em 14/03/2025 - 17:30 (Brasília): Correção para evitar erro ao buscar elementos no DOM.
window.alterarStatusPagamento = async function (userId, pagamentoId) {
    try {
        // Obtém a referência do pagamento
        const pagamentoRef = doc(db, "usuarios", userId, "pagamentos", pagamentoId);
        const pagamentoSnap = await getDoc(pagamentoRef);

        if (!pagamentoSnap.exists()) {
            alert("Erro: Pagamento não encontrado.");
            return;
        }

        const pagamentoData = pagamentoSnap.data();
        const statusAtual = pagamentoData.status;
        const novoStatus = statusAtual === "pendente" ? "pago" : "pendente";

        // Atualiza o status do pagamento no Firestore
        await updateDoc(pagamentoRef, { status: novoStatus })
            .then(() => console.log(`✅ Pagamento ${pagamentoId} atualizado no Firestore para: ${novoStatus}`))
            .catch(err => console.error("Erro ao atualizar Firestore:", err));

        // Pequeno delay para garantir que os elementos do DOM estejam disponíveis
        setTimeout(() => {
            const statusElement = document.getElementById(`status-${pagamentoId}`);
            const botaoElement = document.getElementById(`acao-${pagamentoId}`);

            if (statusElement) {
                statusElement.textContent = novoStatus;
                statusElement.style.color = novoStatus === "pago" ? "green" : "red";
            } else {
                console.warn(`⚠️ Elemento status-${pagamentoId} não encontrado.`);
            }

            if (botaoElement) {
                botaoElement.innerHTML = `
                    <button onclick="alterarStatusPagamento('${userId}', '${pagamentoId}')">
                        ${novoStatus === "pendente" ? "Aprovar" : "Reprovar"}
                    </button>`;
            } else {
                console.warn(`⚠️ Elemento acao-${pagamentoId} não encontrado.`);
            }
        }, 500); // Tempo para garantir que o DOM foi atualizado corretamente

    } catch (error) {
        console.error("❌ Erro ao atualizar pagamento:", error);
        alert("Erro ao atualizar pagamento. Tente novamente.");
    }
};

*/

/*
window.alterarStatusPagamento = async function (userId, pagamentoId) {
    try {
        // Obtém a referência do pagamento
        const pagamentoRef = doc(db, "usuarios", userId, "pagamentos", pagamentoId);
        const pagamentoSnap = await getDoc(pagamentoRef);

        if (!pagamentoSnap.exists()) {
            alert("Erro: Pagamento não encontrado.");
            return;
        }

        const pagamentoData = pagamentoSnap.data();
        const statusAtual = pagamentoData.status;
        const novoStatus = statusAtual === "pendente" ? "pago" : "pendente";

        // Atualiza o status do pagamento no Firestore
        await updateDoc(pagamentoRef, { status: novoStatus })
            .then(() => console.log(`✅ Pagamento ${pagamentoId} atualizado no Firestore para: ${novoStatus}`))
            .catch(err => console.error("Erro ao atualizar Firestore:", err));

        // Pequeno delay para garantir que os elementos do DOM estejam disponíveis
        setTimeout(() => {
            const statusElement = document.getElementById(`status-${pagamentoId}`);
            const botaoElement = document.getElementById(`acao-${pagamentoId}`);

            // Verifica se os elementos do DOM existem antes de tentar manipulá-los
            if (statusElement) {
                statusElement.textContent = novoStatus;
                statusElement.style.color = novoStatus === "pago" ? "green" : "red";
            } else {
                console.warn(`⚠️ Elemento status-${pagamentoId} não encontrado.`);
            }

            if (botaoElement) {
                botaoElement.innerHTML = `
                    <button onclick="alterarStatusPagamento('${userId}', '${pagamentoId}')">
                        ${novoStatus === "pendente" ? "Aprovar" : "Reprovar"}
                    </button>`;
            } else {
                console.warn(`⚠️ Elemento acao-${pagamentoId} não encontrado.`);
            }
        }, 500); // Atraso para garantir que o DOM tenha sido atualizado corretamente

    } catch (error) {
        console.error("❌ Erro ao atualizar pagamento:", error);
        alert("Erro ao atualizar pagamento. Tente novamente.");
    }
};

*/


// 🔟 🔹 Logout ✅
document.getElementById("logout").addEventListener("click", function () {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
});

// 1️⃣1️⃣ 🔹 Executa ao carregar a página ✅
verificarPermissao();
carregarPagamentos();
carregarMeusPagamentos();
carregarUsuarios();
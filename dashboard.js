// 🔹 Importando Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, collection, addDoc, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
let usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuarioLogado || !usuarioLogado.uid) {
    alert("Acesso negado! Para acessar esta área, você precisa estar autenticado.");
    window.location.href = "index.html";
}

// 🔹 Definir a variável antes de usá-la no gerarCalendario()
let currentDate = new Date();

// 🔹 Atualiza o nível do usuário ao fazer login e redireciona conforme necessário
async function carregarDadosUsuario() {
    try {
        const usuarioRef = doc(db, "usuarios", usuarioLogado.uid);
        const usuarioSnap = await getDoc(usuarioRef);

        if (usuarioSnap.exists()) {
            const dadosUsuario = usuarioSnap.data();

            usuarioLogado.nivel = dadosUsuario.nivel || "Aluno";
            localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

            console.log("✅ Usuário atualizado:", usuarioLogado);

            // 🔹 Redireciona para a página correta
            if (window.location.pathname.includes("dashboard.html") && usuarioLogado.nivel === "Mestre") {
                window.location.href = "gestao.html";
            } else if (window.location.pathname.includes("gestao.html") && usuarioLogado.nivel !== "Mestre") {
                window.location.href = "dashboard.html";
            }

            document.getElementById("user-nome").textContent = usuarioLogado.nome;
            document.getElementById("user-email").textContent = usuarioLogado.email;
            document.getElementById("user-nivel").textContent = usuarioLogado.nivel;
        } else {
            console.log("❌ Usuário não encontrado no Firestore.");
        }
    } catch (error) {
        console.error("❌ Erro ao carregar usuário:", error);
    }
}

// ===================== 🔹 REGISTRAR PAGAMENTO 🔹 =====================
async function registrarPagamento(valor, metodo) {
    console.log("🔹 Tentando registrar pagamento...");
    console.log("🔹 Valor:", valor);
    console.log("🔹 Método:", metodo);

    const usuarioId = usuarioLogado.uid;
    if (!usuarioId) {
        console.error("❌ Erro: Usuário não autenticado.");
        return;
    }

    try {
        const pagamentosRef = collection(db, "usuarios", usuarioId, "pagamentos");

        await addDoc(pagamentosRef, {
            valor: parseFloat(valor),
            data: new Date(),
            metodo: metodo,
            status: "Pendente"
        });

        console.log("✅ Pagamento registrado com sucesso!");
        alert("Pagamento registrado com sucesso!");

        carregarPagamentos();
    } catch (error) {
        console.error("❌ Erro ao registrar pagamento:", error);
        alert("Erro ao registrar pagamento. Verifique o console para mais detalhes.");
    }
}

// 🔹 Capturar evento de submissão do formulário de pagamento
document.getElementById("form-pagamento").addEventListener("submit", function(event) {
    event.preventDefault();

    let valor = document.getElementById("valor-pagamento").value;
    let metodo = document.getElementById("tipo-pagamento").value;

    console.log("🔹 Formulário enviado. Valor:", valor, "Método:", metodo);

    if (!valor || !metodo) {
        alert("Preencha todos os campos antes de registrar o pagamento.");
        return;
    }

    registrarPagamento(valor, metodo);
});

// ===================== 🔹 CARREGAR PAGAMENTOS 🔹 =====================

// 🔹 INÍCIO DA ALTERAÇÃO - Adicionado em 13/03/2025 às 21:40:00
// 🔹 INÍCIO DA ALTERAÇÃO - Adicionado em 13/03/2025 às 21:40:00


// 🔹 INÍCIO DA ALTERAÇÃO - Adicionado em 13/03/2025 às 22:10:00
async function carregarPagamentos() {
    console.log("🚀 Buscando pagamentos do usuário...");

    const usuarioId = usuarioLogado.uid;
    const pagamentosRef = collection(db, "usuarios", usuarioId, "pagamentos");
    const pagamentosSnapshot = await getDocs(pagamentosRef);

    let totalPago = 0;
    let totalPendente = 0;
    
    const tabelaPagamentos = document.querySelector("#tabela-pagamentos tbody");
    tabelaPagamentos.innerHTML = "";

    if (pagamentosSnapshot.empty) {
        tabelaPagamentos.innerHTML = "<tr><td colspan='5'>Nenhum pagamento registrado.</td></tr>";
        return;
    }

    pagamentosSnapshot.forEach((doc) => {
        const pagamento = doc.data();
        console.log("🔎 Pagamento encontrado:", pagamento);

        const dataFormatada = pagamento.data.toDate().toLocaleDateString("pt-BR");
        
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${dataFormatada}</td>
            <td>R$ ${pagamento.valor.toFixed(2)}</td>
            <td>${pagamento.metodo}</td>
            <td>${pagamento.status}</td>
        `;
        tabelaPagamentos.appendChild(row);

        // 🔹 Aceita variações do status "Aprovado"
        if (["Aprovado", "Pago", "pago"].includes(pagamento.status)) {
            totalPago += parseFloat(pagamento.valor);
        } else if (["Pendente", "Em Análise"].includes(pagamento.status)) {
            totalPendente += parseFloat(pagamento.valor);
        }
    });

    console.log("✅ Total Pago:", totalPago, "| Total Pendente:", totalPendente);

    document.getElementById("total-pago").textContent = `R$ ${totalPago.toFixed(2)}`;
    
    const pendentesEl = document.getElementById("pagamentos-pendentes");
    pendentesEl.textContent = totalPendente > 0 
        ? `Você tem R$ ${totalPendente.toFixed(2)} em análise.` 
        : "";

    console.log("✅ Pagamentos carregados com sucesso!");
}


// 🔹 FIM DA ALTERAÇÃO - Adicionado em 13/03/2025 às 22:10:00
// 🔹 FIM DA ALTERAÇÃO - Adicionado em 13/03/2025 às 21:40:00


// ===================== 🔹 GERAR CALENDÁRIO 🔹 =====================
async function gerarCalendario() {
    console.log("🚀 Atualizando calendário...");

    const calendarGrid = document.getElementById("calendar-grid");
    if (!calendarGrid) {
        console.error("❌ Erro: Elemento 'calendar-grid' não encontrado.");
        return;
    }

    calendarGrid.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    document.getElementById("month-year").textContent = `${new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate)}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const pagamentosRef = collection(db, "usuarios", usuarioLogado.uid, "pagamentos");
    const pagamentosSnapshot = await getDocs(pagamentosRef);

    let pagamentos = [];
    pagamentosSnapshot.forEach(doc => {
        const dataFirestore = doc.data().data.toDate();
        const dataFormatada = dataFirestore.toLocaleDateString("pt-BR");
        pagamentos.push(dataFormatada);
    });

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.classList.add("calendar-day");
        emptyCell.style.visibility = "hidden";
        calendarGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement("div");
        dayCell.classList.add("calendar-day");
        dayCell.textContent = day;

        const dataCompleta = `${day}/${month + 1}/${year}`;

        if (pagamentos.includes(dataCompleta)) {
            dayCell.classList.add("pagamento");
            dayCell.innerHTML += " 💰";
        }

        calendarGrid.appendChild(dayCell);
    }

    console.log("✅ Calendário atualizado com pagamentos:", pagamentos);
}

// 🔹 Executa ao carregar a página
carregarDadosUsuario();
carregarPagamentos();
gerarCalendario();

// 🔹 Função de Logout
document.getElementById("logout").addEventListener("click", function(event) {
    event.preventDefault();
    localStorage.removeItem("usuarioLogado"); // Remove os dados de login
    alert("Você saiu da sua conta!");
    window.location.href = "index.html"; // Redireciona para a página inicial
});
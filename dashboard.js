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

// 🔹 Atualiza o nível do usuário ao fazer login
async function carregarDadosUsuario() {
    try {
        const usuarioRef = doc(db, "usuarios", usuarioLogado.uid);
        const usuarioSnap = await getDoc(usuarioRef);

        if (usuarioSnap.exists()) {
            const dadosUsuario = usuarioSnap.data();
            usuarioLogado.nivel = dadosUsuario.nivel || "Aluno"; 
            localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

            console.log("✅ Usuário atualizado:", usuarioLogado);

            document.getElementById("user-nome").textContent = usuarioLogado.nome;
            document.getElementById("user-email").textContent = usuarioLogado.email;
            document.getElementById("user-nivel").textContent = usuarioLogado.nivel;

            // 🔹 Aplicar as restrições de acesso após carregar os dados
            aplicarRestricoesDeAcesso();
        } else {
            console.log("❌ Usuário não encontrado no Firestore.");
            alert("Erro ao carregar usuário. Faça login novamente.");
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error("❌ Erro ao carregar usuário:", error);
    }
}

// 🔹 Função para validar nível de acesso
function aplicarRestricoesDeAcesso() {
    if (!usuarioLogado || !usuarioLogado.nivel) {
        console.error("❌ Erro: Nível do usuário não encontrado.");
        return;
    }

    const nivelUsuario = usuarioLogado.nivel.toLowerCase();
    console.log("🔹 Nível do usuário:", nivelUsuario);

    // 🔹 Se for Mestre, redireciona para a página de gestão
    if (nivelUsuario === "mestre") {
        console.log("🔹 Redirecionando Mestre para gestao.html...");
        window.location.href = "gestao.html";
        return;
    }

    // 🔹 Oculta todas as seções restritas por padrão
    document.querySelectorAll(".nivel-restrito").forEach(el => el.style.display = "none");

    // 🔹 Exibe permissões específicas com base no nível
    if (nivelUsuario === "professor") {
        document.querySelectorAll(".professor").forEach(el => el.style.display = "block");
    } else if (nivelUsuario === "monitor") {
        document.querySelectorAll(".monitor").forEach(el => el.style.display = "block");
    } else if (nivelUsuario === "aluno") {
        document.querySelectorAll(".aluno").forEach(el => el.style.display = "block");
    }
}

// ===================== 🔹 REGISTRAR PAGAMENTO 🔹 =====================
async function registrarPagamento(valor, metodo) {
    console.log("🔹 Tentando registrar pagamento...");
    
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
async function carregarPagamentos() {
    console.log("🚀 Buscando pagamentos do usuário...");

    const usuarioId = usuarioLogado.uid;
    const pagamentosRef = collection(db, "usuarios", usuarioId, "pagamentos");
    const pagamentosSnapshot = await getDocs(pagamentosRef);

    const tabelaPagamentos = document.querySelector("#tabela-pagamentos tbody");
    tabelaPagamentos.innerHTML = "";

    if (pagamentosSnapshot.empty) {
        tabelaPagamentos.innerHTML = "<tr><td colspan='4'>Nenhum pagamento registrado.</td></tr>";
        return;
    }

    pagamentosSnapshot.forEach((doc) => {
        const pagamento = doc.data();
        const dataFormatada = pagamento.data.toDate().toLocaleDateString("pt-BR");

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${dataFormatada}</td>
            <td>R$ ${pagamento.valor.toFixed(2)}</td>
            <td>${pagamento.metodo}</td>
            <td>${pagamento.status}</td>
        `;
        tabelaPagamentos.appendChild(row);
    });

    console.log("✅ Pagamentos carregados com sucesso!");
}

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

        if (pagamentos.includes(`${day}/${month + 1}/${year}`)) {
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

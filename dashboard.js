// 🔹 Importando Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, collection, addDoc, getDocs, updateDoc, increment, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// 🔹 Atualiza o nível do usuário ao fazer login
async function carregarDadosUsuario() {
    try {
        const usuarioRef = doc(db, "usuarios", usuarioLogado.uid);
        const usuarioSnap = await getDoc(usuarioRef);

        if (usuarioSnap.exists()) {
            const dadosUsuario = usuarioSnap.data();

            usuarioLogado.nivel = dadosUsuario.nivel || "Aluno"; // 🔹 Atualiza o nível corretamente
            localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

            console.log("✅ Usuário atualizado:", usuarioLogado);

            document.getElementById("user-nome").textContent = usuarioLogado.nome;
            document.getElementById("user-email").textContent = usuarioLogado.email;
            document.getElementById("user-nivel").textContent = usuarioLogado.nivel;

            aplicarRestricoesDeAcesso();
        } else {
            console.log("❌ Usuário não encontrado no Firestore.");
        }
    } catch (error) {
        console.error("❌ Erro ao carregar usuário:", error);
    }
}

// 🔹 Função para exibir seções conforme o nível do usuário
function aplicarRestricoesDeAcesso() {
    const nivelUsuario = usuarioLogado.nivel.toLowerCase();

    if (nivelUsuario === "mestre") {
        window.location.href = "gestao.html"; // 🔹 Redireciona diretamente para a página de gestão
        return;
    }

    document.querySelectorAll(".nivel-restrito").forEach(el => el.style.display = "none");

    if (nivelUsuario === "professor") {
        document.querySelectorAll(".professor").forEach(el => el.style.display = "block");
    } else if (nivelUsuario === "monitor") {
        document.querySelectorAll(".monitor").forEach(el => el.style.display = "block");
    }
}

// ===================== 🔹 LOGOUT 🔹 =====================
document.getElementById("logout").addEventListener("click", function () {
    localStorage.removeItem("usuarioLogado");
    alert("Você saiu com sucesso!");
    window.location.href = "index.html";
});

// ===================== 🔹 VARIÁVEL GLOBAL PARA O CALENDÁRIO 🔹 =====================
let currentDate = new Date();

// ===================== 🔹 CARREGAR PAGAMENTOS 🔹 =====================
async function carregarPagamentos() {
    console.log("🚀 Buscando pagamentos do usuário...");

    const usuarioId = usuarioLogado.uid;
    const pagamentosRef = collection(db, "usuarios", usuarioId, "pagamentos");
    const pagamentosSnapshot = await getDocs(pagamentosRef);

    const tabelaPagamentos = document.querySelector("#tabela-pagamentos tbody");
    tabelaPagamentos.innerHTML = "";

    if (pagamentosSnapshot.empty) {
        tabelaPagamentos.innerHTML = "<tr><td colspan='5'>Nenhum pagamento registrado.</td></tr>";
        return;
    }

    pagamentosSnapshot.forEach((doc) => {
        const pagamento = doc.data();
        const dataFormatada = pagamento.data.toDate().toLocaleDateString("pt-BR");

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${dataFormatada}</td>
            <td>R$ ${pagamento.valor.toFixed(2)}</td>
            <td>${pagamento.referencia}</td>
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

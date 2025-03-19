// 🔹 INÍCIO DO CÓDIGO ATUALIZADO COM ENUMERAÇÃO CLARA (17/03/2025 às 13:45 - Horário de Brasília)

// 1️⃣ Importações e inicialização do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, collection, addDoc, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2️⃣ Inicialização do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDEwWz8aFhwYQzQmBmQR5YFUBd7vg5mJSk",
    authDomain: "nagocapoeira-6cae5.firebaseapp.com",
    projectId: "nagocapoeira-6cae5",
    storageBucket: "nagocapoeira-6cae5.appspot.com",
    messagingSenderId: "14626642245",
    appId: ""
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 3️⃣ Recuperação do usuário logado do LocalStorage
let usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuarioLogado || !usuarioLogado.uid) {
    alert("Acesso negado! Faça login para continuar.");
    window.location.href = "index.html";
}

// 4️⃣ Variáveis Globais
let currentDate = new Date();

// 5️⃣ Função para carregar dados do usuário e garantir redirecionamento correto
async function carregarDadosUsuario() {
    try {
        console.log("🔹 Buscando dados do usuário...");

        const usuarioRef = doc(db, "usuarios", usuarioLogado.uid);
        const usuarioSnap = await getDoc(usuarioRef);

        if (usuarioSnap.exists()) {
            const dadosUsuario = usuarioSnap.data();

            usuarioLogado.nivel = dadosUsuario.nivel || "Aluno";
            localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

            console.log("✅ Usuário atualizado:", usuarioLogado);

            // 🔹 Redirecionamento para usuários com nível de gestão
            const niveisDeGestao = ["Mestre", "Administrador", "Instrutor"];
            if (niveisDeGestao.includes(usuarioLogado.nivel)) {
                console.log("🔹 Usuário de gestão identificado! Redirecionando...");
                window.location.href = "gestao.html";
                return;
            }

            // 🔹 Exibe os dados do usuário no HTML
            document.getElementById("user-nome").textContent = usuarioLogado.nome;
            document.getElementById("user-email").textContent = usuarioLogado.email;
            document.getElementById("user-nivel").textContent = usuarioLogado.nivel;

        } else {
            console.log("❌ Usuário não encontrado no Firestore.");
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error("❌ Erro ao carregar usuário:", error);
        window.location.href = "index.html";
    }
}

// 6️⃣ Função para registrar pagamento no Firebase
async function registrarPagamento(valor, metodo) {
    try {
        const usuarioId = usuarioLogado.uid;
        const pagamentosRef = collection(db, "usuarios", usuarioId, "pagamentos");

        await addDoc(pagamentosRef, {
            valor: parseFloat(valor),
            data: new Date(),
            metodo: metodo,
            status: "Pendente"
        });

        carregarPagamentos();
    } catch (error) {
        alert("Erro ao registrar pagamento.");
    }
}

// 7️⃣ Evento para capturar submissão do formulário de pagamento
document.getElementById("form-pagamento").addEventListener("submit", function(event) {
    event.preventDefault();

    let valor = document.getElementById("valor-pagamento").value;
    let metodo = document.getElementById("tipo-pagamento").value;

    if (!valor || !metodo) return;

    registrarPagamento(valor, metodo);
});

// 8️⃣ Função para carregar pagamentos do Firebase para a tabela
async function carregarPagamentos() {
    try {
        const usuarioId = usuarioLogado.uid;
        const pagamentosRef = collection(db, "usuarios", usuarioId, "pagamentos");
        const pagamentosSnapshot = await getDocs(pagamentosRef);

        const tabelaPagamentos = document.querySelector("#tabela-pagamentos tbody");
        tabelaPagamentos.innerHTML = "";

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
    } catch (error) {
        console.error("❌ Erro ao carregar pagamentos:", error);
    }
}



// 9️⃣ Função para carregar treinos do Firebase
async function carregarTreinos() {
    try {
        console.log("🔹 Carregando treinos...");

        const usuarioId = usuarioLogado.uid;
        const treinosRef = collection(db, "usuarios", usuarioId, "treinos");
        const treinosSnapshot = await getDocs(treinosRef);

        const tabelaTreinos = document.querySelector("#tabela-treinos tbody");
        tabelaTreinos.innerHTML = "";

        if (treinosSnapshot.empty) {
            tabelaTreinos.innerHTML = "<tr><td colspan='4'>Ainda não há treinos registrados.</td></tr>";
            return;
        }

        treinosSnapshot.forEach((doc) => {
            const treino = doc.data();
            const dataFormatada = treino.data;
            const horaFormatada = treino.hora;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${dataFormatada}</td>
                <td>${horaFormatada}</td>
                <td>${treino.tipo_registro}</td>
                <td style="color: ${treino.status === 'Confirmado' ? 'green' : 'red'}; font-weight: bold;">${treino.status}</td>
            `;
            tabelaTreinos.appendChild(row);
        });

        console.log("✅ Treinos carregados com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao carregar treinos:", error);
    }
}

// 🔟 Função para registrar treino no Firebase
async function registrarTreino(tipo_registro) {
    try {
        console.log("🔹 Tentando registrar treino...");

        const treinoRef = collection(db, "usuarios", usuarioLogado.uid, "treinos");

        await addDoc(treinoRef, {
            data: new Date().toISOString().split('T')[0],
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            tipo_registro,
            status: "Confirmado"
        });

        console.log("✅ Treino registrado com sucesso!");
        alert("Treino registrado com sucesso!");

        carregarTreinos();
    } catch (error) {
        console.error("❌ Erro ao registrar treino:", error);
        alert("Erro ao registrar treino.");
    }
}
// 1️⃣4️⃣ Evento de clique para registrar treino ✅ (Correção)
document.addEventListener("DOMContentLoaded", () => {
    const botaoTreino = document.getElementById("registrar-treino");

    if (!botaoTreino) {
        console.error("❌ Erro: Botão 'registrar-treino' não encontrado no HTML.");
        return;
    }

    botaoTreino.addEventListener("click", async () => {
        console.log("🔹 Botão Registrar Treino Clicado!");
        const confirmar = confirm("Deseja registrar um treino rápido agora?");
        if (confirmar) {
            await registrarTreino("rapido");
        }
    });
});

// 🔹 INÍCIO DA ATUALIZAÇÃO (Calendário corrigido)

// 4️⃣ Variáveis Globais

async function gerarCalendario() {
    console.log("🔹 Gerando calendário...");

    const calendarGrid = document.getElementById("calendar-grid");
    const tituloMes = document.getElementById("titulo-mes");

    if (!calendarGrid || !tituloMes) {
        console.error("❌ Erro: Elementos do calendário não encontrados no HTML.");
        return;
    }

    calendarGrid.innerHTML = "";

    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // ✅ Atualiza o nome do mês corretamente
    tituloMes.textContent = `${meses[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

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
        calendarGrid.appendChild(dayCell);
    }

    console.log("✅ Calendário gerado com sucesso!");
}

// 🔹 Adicionando eventos apenas se os botões existirem
document.addEventListener("DOMContentLoaded", () => {
    const prevMonthBtn = document.getElementById("prev-month");
    const nextMonthBtn = document.getElementById("next-month");

    if (prevMonthBtn && nextMonthBtn) {
        prevMonthBtn.addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() - 1); // 🔹 Voltar um mês
            gerarCalendario();
        });

        nextMonthBtn.addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() + 1); // 🔹 Avançar um mês
            gerarCalendario();
        });
    }

    // 🔹 Inicializa o calendário na primeira carga
    gerarCalendario();
});


// 🔹 TÉRMINO DA ATUALIZAÇÃO (Calendário corrigido)


// 1️⃣2️⃣ Função de inicialização ao carregar a página
async function iniciarPagina() {
    await carregarDadosUsuario();
    carregarPagamentos();
    carregarTreinos();
    gerarCalendario();
}

// 1️⃣3️⃣ Chama a inicialização ao carregar a página
iniciarPagina();

// 🔹 Função de Logout
document.getElementById("logout").addEventListener("click", function(event) {
    event.preventDefault();
    localStorage.removeItem("usuarioLogado"); // Remove os dados de login
    alert("Você saiu da sua conta!");
    window.location.href = "index.html"; // Redireciona para a página inicial
});
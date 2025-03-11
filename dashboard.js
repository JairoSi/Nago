// 🔹 Importando Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, collection, addDoc, getDocs, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const db = getFirestore(app); // Firestore agora inicializado corretamente

// 🔹 Aguarda o carregamento completo do DOM antes de executar o script
document.addEventListener("DOMContentLoaded", function () {
    console.log("🚀 Iniciando o Dashboard...");

    // 🔹 Verifica se há um usuário autenticado no localStorage
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuarioLogado || !usuarioLogado.uid) {
        alert("Acesso negado! Para acessar esta área, você precisa estar autenticado.");
        window.location.href = "index.html";
        return;
    }

    console.log("✅ Usuário autenticado:", usuarioLogado);

    // Exibe o nome e e-mail do usuário no dashboard
    document.getElementById("user-nome").textContent = usuarioLogado.nome;
    document.getElementById("user-email").textContent = usuarioLogado.email;

    // ===================== 🔹 LOGOUT 🔹 =====================
    document.getElementById("logout").addEventListener("click", function () {
        localStorage.removeItem("usuarioLogado");
        alert("Você saiu com sucesso!");
        window.location.href = "index.html";
    });

    // ===================== 🔹 FUNÇÃO PARA CARREGAR PAGAMENTOS 🔹 =====================
    async function carregarPagamentos() {
        console.log("🚀 Buscando pagamentos do usuário...");

        const usuarioId = usuarioLogado.uid;
        const pagamentosRef = collection(db, "usuarios", usuarioId, "pagamentos");
        const pagamentosSnapshot = await getDocs(pagamentosRef);

        const tabelaPagamentos = document.querySelector("#tabela-pagamentos tbody");
        tabelaPagamentos.innerHTML = "";

        if (pagamentosSnapshot.empty) {
            tabelaPagamentos.innerHTML = "<tr><td colspan='3'>Nenhum pagamento registrado.</td></tr>";
            return;
        }

        pagamentosSnapshot.forEach((doc) => {
            const pagamento = doc.data();
            const dataFormatada = pagamento.data.toDate().toLocaleDateString("pt-BR");

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${dataFormatada}</td>
                <td>R$ ${pagamento.valor.toFixed(2)}</td>
                <td>${pagamento.metodo} (${pagamento.referencia})</td>
            `;
            tabelaPagamentos.appendChild(row);
        });

        console.log("✅ Pagamentos carregados com sucesso!");
    }

    // ===================== 🔹 REGISTRO DE MENSALIDADE NO FIRESTORE 🔹 =====================
    async function registrarMensalidade(valor, metodo, referencia) {
        try {
            const usuarioId = usuarioLogado.uid;
            const dataPagamento = new Date();

            // 🔹 Referência para a subcoleção 'pagamentos' dentro do usuário autenticado
            const pagamentosRef = collection(db, "usuarios", usuarioId, "pagamentos");

            // 🔹 Adiciona o pagamento ao Firestore
            await addDoc(pagamentosRef, {
                data: dataPagamento,
                valor: valor,
                metodo: metodo,
                referencia: referencia,
                status: "pago"
            });

            // 🔹 Atualiza o total pago pelo usuário no Firestore
            const usuarioRef = doc(db, "usuarios", usuarioId);
            await updateDoc(usuarioRef, {
                total_pago: increment(valor)
            });

            alert("✅ Pagamento registrado com sucesso!");

            console.log("📌 Novo pagamento registrado:", {
                data: dataPagamento,
                valor: valor,
                metodo: metodo,
                referencia: referencia
            });

            carregarPagamentos(); // 🔹 Atualiza a interface com os novos pagamentos
            gerarCalendario(); // 🔹 Atualiza o calendário automaticamente

        } catch (error) {
            console.error("❌ Erro ao registrar pagamento:", error);
            alert("Erro ao registrar pagamento.");
        }
    }

    // ===================== 🔹 FORMULÁRIO DE PAGAMENTO 🔹 =====================
    document.getElementById("form-pagamento").addEventListener("submit", function (event) {
        event.preventDefault();

        const valor = parseFloat(document.getElementById("valor-pagamento").value);
        const metodo = document.getElementById("tipo-pagamento").value;
        const referencia = `mensalidade ${new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" })}`;

        if (isNaN(valor) || valor <= 0 || !metodo) {
            alert("Preencha os campos corretamente.");
            return;
        }

        registrarMensalidade(valor, metodo, referencia);
        document.getElementById("form-pagamento").reset();
    });

    // ===================== 🔹 GERAR CALENDÁRIO 🔹 =====================
    async function gerarCalendario() {
        console.log("🚀 Atualizando calendário...");

        const calendarGrid = document.getElementById("calendar-grid");
        calendarGrid.innerHTML = "";

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        monthYearElement.textContent = `${new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate)}`;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // 🔹 Buscar pagamentos do Firestore para preencher o calendário
        const usuarioId = usuarioLogado.uid;
        const pagamentosRef = collection(db, "usuarios", usuarioId, "pagamentos");
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

    document.getElementById("prev-month").addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        gerarCalendario();
    });

    document.getElementById("next-month").addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        gerarCalendario();
    });

    let currentDate = new Date();
    const monthYearElement = document.getElementById("month-year");

    carregarPagamentos(); // 🔹 Agora carrega os pagamentos ao iniciar
    gerarCalendario(); // 🔹 Carrega o calendário ao iniciar

});

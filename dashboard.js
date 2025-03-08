document.addEventListener("DOMContentLoaded", function () {
    console.log("🚀 Iniciando o Dashboard...");

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuarioLogado) {
        alert("Acesso negado! Para acessar esta área, você precisa estar autenticado.");
        window.location.href = "index.html";
        return;
    }

    console.log("✅ Usuário autenticado:", usuarioLogado);

    // ===================== 🔹 PAGAMENTOS 🔹 =====================
    function carregarPagamentos() {
        const pagamentos = JSON.parse(localStorage.getItem("pagamentos")) || [];
        const tabelaPagamentos = document.querySelector("#tabela-pagamentos tbody");
        tabelaPagamentos.innerHTML = "";

        if (pagamentos.length === 0) {
            tabelaPagamentos.innerHTML = "<tr><td colspan='3'>Nenhum pagamento registrado.</td></tr>";
            return;
        }

        pagamentos.forEach(pagamento => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${pagamento.data}</td>
                <td>R$ ${pagamento.valor.toFixed(2)}</td>
                <td>${pagamento.tipo} (${pagamento.metodo})</td>
            `;
            tabelaPagamentos.appendChild(row);
        });

        console.log("📌 Pagamentos carregados:", pagamentos);
    }

    document.getElementById("form-pagamento").addEventListener("submit", function (event) {
        event.preventDefault();

        const valor = parseFloat(document.getElementById("valor-pagamento").value);
        const tipo = document.getElementById("tipo-pagamento").value;
        const metodo = prompt("Informe o método de pagamento: Pix, Dinheiro ou Isento").trim();
        const data = new Date().toLocaleDateString("pt-BR");

        if (isNaN(valor) || valor <= 0 || !metodo) {
            alert("Digite um valor e método de pagamento válido.");
            return;
        }

        const novoPagamento = { data, valor, tipo, metodo };
        const pagamentos = JSON.parse(localStorage.getItem("pagamentos")) || [];
        pagamentos.push(novoPagamento);

        localStorage.setItem("pagamentos", JSON.stringify(pagamentos));
        carregarPagamentos();

        alert("Pagamento registrado com sucesso!");
        document.getElementById("form-pagamento").reset();

        console.log("✅ Novo pagamento registrado:", novoPagamento);
    });

    carregarPagamentos();

    // ===================== 🔹 CONTROLE DE TREINOS 🔹 =====================
    function carregarTreinos() {
        const treinos = JSON.parse(localStorage.getItem("treinos")) || [];
        const listaTreinos = document.getElementById("treinos-list");
        const totalTreinosElement = document.getElementById("total-treinos");

        listaTreinos.innerHTML = "";

        if (treinos.length === 0) {
            listaTreinos.innerHTML = "<li>Nenhum treino registrado.</li>";
            totalTreinosElement.textContent = "0";
            return;
        }

        treinos.forEach(treino => {
            const li = document.createElement("li");
            li.textContent = treino.data;
            listaTreinos.appendChild(li);
        });

        const mesAtual = new Date().getMonth();
        const totalTreinos = treinos.filter(treino => new Date(treino.data).getMonth() === mesAtual).length;
        totalTreinosElement.textContent = totalTreinos;

        console.log("📌 Treinos carregados:", treinos);
    }

    document.getElementById("registrar-treino").addEventListener("click", function () {
        const data = new Date().toLocaleDateString("pt-BR");

        let treinos = JSON.parse(localStorage.getItem("treinos")) || [];

        if (treinos.some(treino => treino.data === data)) {
            alert("Você já registrou um treino para hoje!");
            return;
        }

        treinos.push({ data });
        localStorage.setItem("treinos", JSON.stringify(treinos));

        carregarTreinos();
        alert("Treino registrado com sucesso!");

        console.log("✅ Novo treino registrado:", data);
    });

    carregarTreinos();

    // ===================== 🔹 CALENDÁRIO 🔹 =====================
    console.log("🚀 Iniciando o Calendário...");

    let currentDate = new Date();
    const monthYearElement = document.getElementById("month-year");
    const calendarGrid = document.getElementById("calendar-grid");

    function gerarCalendario() {
        calendarGrid.innerHTML = "";
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        monthYearElement.textContent = `${new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate)}`;

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

            const dataCompleta = `${day}/${month + 1}/${year}`;

            const pagamentos = JSON.parse(localStorage.getItem("pagamentos")) || [];
            const treinos = JSON.parse(localStorage.getItem("treinos")) || [];
            const eventos = JSON.parse(localStorage.getItem("eventos")) || [];

            if (pagamentos.some(p => p.data === dataCompleta)) {
                dayCell.classList.add("pagamento");
            }
            if (treinos.some(t => t.data === dataCompleta)) {
                dayCell.classList.add("treino");
            }
            if (eventos.some(e => e.data === dataCompleta)) {
                dayCell.classList.add("evento");
            }

            calendarGrid.appendChild(dayCell);
        }
    }

    document.getElementById("prev-month").addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        gerarCalendario();
    });

    document.getElementById("next-month").addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        gerarCalendario();
    });

    gerarCalendario();
});

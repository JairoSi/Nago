document.addEventListener("DOMContentLoaded", function () {
    console.log("🚀 Iniciando o Controle de Treinos...");

    // 🔹 Função para carregar treinos salvos no localStorage
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

        // 🔹 Exibir os treinos realizados
        treinos.forEach(treino => {
            const li = document.createElement("li");
            li.textContent = treino.data;
            listaTreinos.appendChild(li);
        });

        // 🔹 Atualizar contador de treinos no mês atual
        const mesAtual = new Date().getMonth();
        const totalTreinos = treinos.filter(treino => new Date(treino.data).getMonth() === mesAtual).length;
        totalTreinosElement.textContent = totalTreinos;

        console.log("📌 Treinos carregados:", treinos);
    }

    // 🔹 Função para registrar um treino novo
    document.getElementById("registrar-treino").addEventListener("click", function () {
        const data = new Date().toLocaleDateString("pt-BR");

        let treinos = JSON.parse(localStorage.getItem("treinos")) || [];

        // 🔹 Evita duplicação de treinos no mesmo dia
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

    // 🔹 Carregar treinos ao abrir a página
    carregarTreinos();
});

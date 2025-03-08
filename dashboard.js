document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 Verificando autenticação...");
    
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    console.log("📌 Dados no localStorage:", usuarioLogado);

    if (!usuarioLogado || usuarioLogado === "null") {
        console.warn("❌ Nenhum usuário logado encontrado! Redirecionando para index.html...");
        alert("Acesso negado! Para acessar esta área, você precisa estar autenticado.");
        window.location.href = "index.html"; 
        return;
    }

    try {
        const userData = JSON.parse(usuarioLogado);
        console.log("✅ Usuário autenticado com sucesso:", userData);

        const nomeUsuarioElement = document.getElementById("user-nome");
        const emailUsuarioElement = document.getElementById("user-email");

        if (nomeUsuarioElement && emailUsuarioElement) {
            nomeUsuarioElement.textContent = userData.nome;
            emailUsuarioElement.textContent = userData.email;
        } else {
            console.error("⚠️ Elementos HTML não encontrados!");
        }
    } catch (error) {
        console.error("❌ Erro ao processar os dados do usuário:", error);
        window.location.href = "index.html";
    }
});

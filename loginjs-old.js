// login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import bcrypt from "https://cdn.jsdelivr.net/npm/bcryptjs@2.4.3/+esm";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função de cadastro (faltava no seu código atual)
async function cadastrarUsuario(nome, email, senha) {
    try {
        const senhaCriptografada = await bcrypt.hash(senha, 10);
        await addDoc(collection(db, "usuarios"), {
            nome: nome,
            email: email,
            senha_hash: senhaCriptografada,
            status: "pendente" // Todos os cadastros aguardam habilitação
        });

        alert("Cadastro realizado com sucesso! Aguarde aprovação.");
        document.getElementById("cadastro-container").style.display = "none";
        document.getElementById("login-form").style.display = "block";

    } catch (error) {
        alert("Erro ao cadastrar usuário: " + error.message);
    }
}

// Evento do formulário de cadastro
const cadastroForm = document.getElementById("cadastro-form");
cadastroForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email-cadastro").value;
    const senha = document.getElementById("senha-cadastro").value;
    cadastrarUsuario(nome, email, senha);
});

// Função de login existente
async function login(email, senhaDigitada) {
    try {
        const q = query(collection(db, "usuarios"), where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("Usuário não encontrado.");
            return;
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        if (!userData.status || userData.status === "pendente") {
            window.location.href = "pendente.html"; // Redireciona automaticamente para tela de aviso
            return;
        }

        if (!userData.senha_hash) {
            alert("Seu cadastro não possui senha registrada corretamente. Entre em contato com o suporte.");
            return;
        }

        const senhaCorreta = await bcrypt.compare(senhaDigitada, userData.senha_hash);

        if (senhaCorreta) {
            alert("Login bem-sucedido!");
            localStorage.setItem("usuarioLogado", JSON.stringify({
                uid: userDoc.id,
                nome: userData.nome,
                email: userData.email,
                nivel: userData.nivel,
                grupo_origem: userData.grupo_origem
            }));
            window.location.href = "dashboard.html";
        } else {
            alert("Senha incorreta.");
        }
    } catch (error) {
        alert("Erro ao fazer login: " + error.message);
    }
}

document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault();
    const email = document.getElementById("email-login").value;
    const senha = document.getElementById("senha-login").value;
    login(email, senha);
});

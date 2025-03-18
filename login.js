// login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import bcrypt from "https://cdn.jsdelivr.net/npm/bcryptjs@2.4.3/+esm";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
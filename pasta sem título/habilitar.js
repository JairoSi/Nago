import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

const pendentesContainer = document.getElementById("pendentes-container");
const formHabilitar = document.getElementById("habilitar-form");
const habilitarSection = document.getElementById("habilitar-aluno");

async function carregarPendentes() {
    pendentesContainer.innerHTML = "Carregando...";
    const usuariosSnapshot = await getDocs(collection(db, "usuarios"));

    let html = "";
    usuariosSnapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.status === "pendente") {
            html += `<div><strong>${data.nome}</strong> (${data.email}) <button onclick=\"abrirFormulario('${docSnap.id}', '${data.nome}', '${data.email}')\">Habilitar</button></div>`;
        }
    });

    pendentesContainer.innerHTML = html || "Nenhum cadastro pendente encontrado.";
}

window.abrirFormulario = function (id, nome, email) {
    habilitarSection.style.display = "block";
    formHabilitar.setAttribute("data-id", id);
    document.getElementById("habilitar-nome").innerText = nome;
    document.getElementById("habilitar-email").innerText = email;
}

formHabilitar.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = formHabilitar.getAttribute("data-id");
    const nivel = document.getElementById("habilitar-nivel").value;
    const tipoAluno = document.getElementById("habilitar-tipo-aluno").value;
    const frequencia = document.getElementById("frequencia-treinos").value;
    const nomeResponsavel = document.getElementById("nome-responsavel").value;
    const contatoResponsavel = document.getElementById("contato-responsavel").value;
    const autorizacaoPais = document.getElementById("autorizacao-pais").checked;
    const lgpd = document.getElementById("habilitar-lgpd").checked;

    if (!lgpd) {
        alert("É necessário concordar com a LGPD.");
        return;
    }

    await updateDoc(doc(db, "usuarios", id), {
        nivel,
        tipoAluno,
        frequencia,
        nomeResponsavel,
        contatoResponsavel,
        autorizacaoPais,
        status: "aprovado",
        aluno: true
    });

    alert("Aluno habilitado com sucesso!");
    habilitarSection.style.display = "none";
    carregarPendentes();
});

window.cancelarHabilitacao = function () {
    habilitarSection.style.display = "none";
};

carregarPendentes();

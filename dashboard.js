import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged, updatePassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "SUA-API-KEY",
    authDomain: "nagocapoeira-6cae5.firebaseapp.com",
    projectId: "nagocapoeira-6cae5",
    storageBucket: "nagocapoeira-6cae5.appspot.com",
    messagingSenderId: "14626642245",
    appId: "AIzaSyDEwWz8aFhwYQzQmBmQR5YFUBd7vg5mJSk"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 🔹 Monitorar login do usuário
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("user-email").innerText = user.email;

    const q = query(collection(db, "usuarios"), where("email", "==", user.email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        document.getElementById("user-nome").innerText = userData.nome;
        document.getElementById("user-foto").src = userData.foto || "default-avatar.png";
    }

    carregarPagamentos(user.email);
    carregarTreinos();
});

// 🔹 Atualizar Perfil (Nome e Foto)
document.getElementById("editar-perfil").addEventListener("click", async () => {
    const novoNome = prompt("Digite seu novo nome:");
    const novaFoto = prompt("Insira o link da nova foto:");

    if (!novoNome && !novaFoto) return;

    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "usuarios"), where("email", "==", user.email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const usuarioRef = doc(db, "usuarios", querySnapshot.docs[0].id);
        await updateDoc(usuarioRef, {
            nome: novoNome || querySnapshot.docs[0].data().nome,
            foto: novaFoto || querySnapshot.docs[0].data().foto
        });

        alert("Perfil atualizado com sucesso!");
        window.location.reload();
    }
});

// 🔹 Carregar Histórico de Pagamentos
async function carregarPagamentos(email) {
    const pagamentosQ = query(collection(db, "pagamentos"), where("email", "==", email));
    const pagamentosSnap = await getDocs(pagamentosQ);
    const pagamentosList = document.getElementById("pagamentos-list");

    pagamentosList.innerHTML = pagamentosSnap.empty ? "<li>Nenhum pagamento encontrado.</li>" : "";
    pagamentosSnap.forEach(doc => {
        const pagamento = doc.data();
        pagamentosList.innerHTML += `<li>${pagamento.data} - ${pagamento.valor} - ${pagamento.status}</li>`;
    });
}

// 🔹 Gerar Opção de Pagamento
document.getElementById("pagar-mensalidade").addEventListener("click", () => {
    alert("Para pagar sua mensalidade, use o PIX: nagocg@gmail.com");
});

// 🔹 Carregar Próximos Treinos
async function carregarTreinos() {
    const treinosSnap = await getDocs(collection(db, "treinos"));
    const treinosList = document.getElementById("treinos-list");

    treinosList.innerHTML = treinosSnap.empty ? "<li>Nenhum treino disponível.</li>" : "";
    treinosSnap.forEach(doc => {
        const treino = doc.data();
        treinosList.innerHTML += `<li>${treino.data} - ${treino.local} - ${treino.horario} <button onclick="confirmarPresenca('${doc.id}')">Confirmar Presença</button></li>`;
    });
}

// 🔹 Marcar Presença no Treino
async function confirmarPresenca(treinoId) {
    alert(`Presença confirmada para o treino ${treinoId}!`);
}

// 🔹 Logout do Usuário
document.getElementById("logout").addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
});

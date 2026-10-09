// NAVEGAÇÃO ENTRE AS PÁGINAS
const abas = document.querySelectorAll(".aba");
const paginas = document.querySelectorAll(".pagina");
function abrirPagina(id) {
    const paginaDestino = document.getElementById(id);
    if (!paginaDestino) {
        return;
    }
    paginas.forEach((pagina) => {
        pagina.classList.remove("ativa");
    });
    abas.forEach((aba) => {
        aba.classList.toggle("ativa", aba.dataset.aba === id);
    });
    paginaDestino.classList.add("ativa");
    window.scrollTo({ top: 0, behavior: "smooth" });
}
abas.forEach((aba) => {
    aba.addEventListener("click", () => {
        abrirPagina(aba.dataset.aba);
    });
});
document.querySelectorAll("[data-ir]").forEach((botao) => {
    botao.addEventListener("click", () => {
        abrirPagina(botao.dataset.ir);
    });
});
// MODO MONOCROMÁTICO
const botaoModo = document.getElementById("modoMonocromatico");
const botaoModo2 = document.getElementById("modoMonocromatico2");
function atualizarModoMonocromatico(ativado) {
    document.body.classList.toggle("monocromatico", ativado);
    [botaoModo, botaoModo2].forEach((botao) => {
        if (!botao) return;
        botao.setAttribute("aria-pressed", String(ativado));
        if (botao === botaoModo) {
            botao.textContent = ativado
                ? "◐ Desativar modo monocromático"
                : "◐ Modo monocromático";
        }
        if (botao === botaoModo2) {
            botao.textContent = ativado
                ? "Desativar modo monocromático"
                : "Ativar modo monocromático";
        }
    });
    try {
        localStorage.setItem("modoMonocromatico", String(ativado));
    } catch (erro) {
        console.warn("Não foi possível salvar a preferência de aparência.");
    }
}
function alternarModoMonocromatico() {
    const ativado = !document.body.classList.contains("monocromatico");
    atualizarModoMonocromatico(ativado);
}
botaoModo.addEventListener("click", alternarModoMonocromatico);
botaoModo2.addEventListener("click", alternarModoMonocromatico);
try {
    const modoSalvo = localStorage.getItem("modoMonocromatico");
    atualizarModoMonocromatico(modoSalvo === "true");
} catch (erro) {
    atualizarModoMonocromatico(false);
}
// CADASTRO DE PACIENTE
const formCadastro = document.getElementById("formCadastro");
const mensagemCadastro = document.getElementById("mensagemCadastro");
formCadastro.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const dataNascimento = document.getElementById("dataNascimento").value;
    const cpf = document.getElementById("cpf").value.trim();
    const necessidade = document.getElementById("necessidade").value;
    if (!nome || !email || !telefone || !dataNascimento || !cpf) {
        mostrarMensagem(
            mensagemCadastro,
            "Preencha todos os campos obrigatórios.",
            false
        );
        return;
    }
    const paciente = {
        nome,
        email,
        telefone,
        dataNascimento,
        cpf,
        necessidade
    };
    try {
        localStorage.setItem("pacienteInovaSaude", JSON.stringify(paciente));
        document.getElementById("paciente").value = nome;
        mostrarMensagem(
            mensagemCadastro,
            "Cadastro realizado com sucesso neste navegador!",
            true
        );
    } catch (erro) {
        mostrarMensagem(
            mensagemCadastro,
            "Não foi possível salvar o cadastro neste navegador.",
            false
        );
    }
});
// CARREGAR CADASTRO SALVO
try {
    const pacienteSalvo = localStorage.getItem("pacienteInovaSaude");
    if (pacienteSalvo) {
        const paciente = JSON.parse(pacienteSalvo);
        document.getElementById("nome").value = paciente.nome || "";
        document.getElementById("email").value = paciente.email || "";
        document.getElementById("telefone").value = paciente.telefone || "";
        document.getElementById("dataNascimento").value =
            paciente.dataNascimento || "";
        document.getElementById("cpf").value = paciente.cpf || "";
        document.getElementById("necessidade").value =
            paciente.necessidade || "Nenhuma informada";
        document.getElementById("paciente").value = paciente.nome || "";
    }
} catch (erro) {
    console.warn("Não foi possível carregar o cadastro salvo.");
}
// AGENDAMENTO DE CONSULTAS
const formAgendamento = document.getElementById("formAgendamento");
const mensagemAgendamento =
    document.getElementById("mensagemAgendamento");
const listaConsultas = document.getElementById("listaConsultas");
let consultas = [];
try {
    const consultasSalvas = localStorage.getItem("consultasInovaSaude");
    if (consultasSalvas) {
        consultas = JSON.parse(consultasSalvas);
        if (!Array.isArray(consultas)) {
            consultas = [];
        }
    }
} catch (erro) {
    consultas = [];
}
formAgendamento.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const paciente = document.getElementById("paciente").value.trim();
    const especialidade = document.getElementById("especialidade").value;
    const data = document.getElementById("dataConsulta").value;
    const horario = document.getElementById("horario").value;
    const tipo = document.getElementById("tipoAtendimento").value;
    if (!paciente || !especialidade || !data || !horario || !tipo) {
        mostrarMensagem(
            mensagemAgendamento,
            "Preencha todos os campos do agendamento.",
            false
        );
        return;
    }
    const dataEscolhida = new Date(`${data}T00:00:00`);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (dataEscolhida < hoje) {
        mostrarMensagem(
            mensagemAgendamento,
            "Escolha uma data igual ou posterior à data de hoje.",
            false
        );
        return;
    }
    const conflito = consultas.some((consulta) => {
        return consulta.data === data &&
            consulta.horario === horario &&
            consulta.especialidade === especialidade;
    });
    if (conflito) {
        mostrarMensagem(
            mensagemAgendamento,
            "Já existe um agendamento para essa especialidade, data e horário neste navegador.",
            false
        );
        return;
    }
    const consulta = {
        id: Date.now(),
        paciente,
        especialidade,
        data,
        horario,
        tipo
    };
    consultas.push(consulta);
    if (!salvarConsultas()) {
        consultas.pop();
        mostrarMensagem(
            mensagemAgendamento,
            "Não foi possível salvar o agendamento. Verifique o armazenamento do navegador.",
            false
        );
        return;
    }
    mostrarMensagem(
        mensagemAgendamento,
        "Agendamento registrado com sucesso neste navegador!",
        true
    );
    formAgendamento.reset();
    renderizarConsultas();
});
// SALVAR CONSULTAS
function salvarConsultas() {
    try {
        localStorage.setItem(
            "consultasInovaSaude",
            JSON.stringify(consultas)
        );
        return true;
    } catch (erro) {
        return false;
    }
}
// EXIBIR CONSULTAS
function renderizarConsultas() {
    listaConsultas.innerHTML = "";
    if (consultas.length === 0) {
        listaConsultas.innerHTML = `
            <div class="estado-vazio">
                <span>📋</span>
                <h3>Nenhuma consulta encontrada</h3>
                <p>Quando você fizer um agendamento, ele aparecerá aqui.</p>
            </div>
        `;
        return;
    }
    consultas.forEach((consulta) => {
        const cartao = document.createElement("article");
        cartao.className = "consulta-card";
        const titulo = document.createElement("h3");
        titulo.textContent = consulta.especialidade;
        const nome = document.createElement("p");
        nome.textContent = `Paciente: ${consulta.paciente}`;
        const data = document.createElement("p");
        data.textContent = `Data: ${formatarData(consulta.data)}`;
        const horario = document.createElement("p");
        horario.textContent = `Horário: ${consulta.horario}`;
        const tipo = document.createElement("p");
        tipo.textContent = `Atendimento: ${consulta.tipo}`;
        const botaoCancelar = document.createElement("button");
        botaoCancelar.type = "button";
        botaoCancelar.className = "botao";
        botaoCancelar.textContent = "Cancelar agendamento";
        botaoCancelar.addEventListener("click", () => {
            cancelarConsulta(consulta.id);
        });
        cartao.append(
            titulo,
            nome,
            data,
            horario,
            tipo,
            botaoCancelar
        );
        listaConsultas.appendChild(cartao);
    });
}
// CANCELAR CONSULTA
function cancelarConsulta(id) {
    const confirmacao = window.confirm(
        "Deseja realmente cancelar este agendamento?"
    );
    if (!confirmacao) {
        return;
    }
    const consultasAnteriores = [...consultas];
    consultas = consultas.filter((consulta) => consulta.id !== id);
    if (!salvarConsultas()) {
        consultas = consultasAnteriores;
        alert("Não foi possível cancelar o agendamento.");
        return;
    }
    renderizarConsultas();
}
// FORMATAR DATA
function formatarData(data) {
    if (!data) return "";
    const partes = data.split("-");
    if (partes.length !== 3) {
        return data;
    }
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}
// MENSAGENS DOS FORMULÁRIOS
function mostrarMensagem(elemento, texto, sucesso) {
    elemento.textContent = texto;
    elemento.className = sucesso
        ? "mensagem sucesso"
        : "mensagem erro";
}
// TAMANHO DO TEXTO
let tamanhoTexto = 16;
function aplicarTamanhoTexto() {
    document.body.style.fontSize = `${tamanhoTexto}px`;
}
document.getElementById("aumentarTexto").addEventListener("click", () => {
    if (tamanhoTexto < 24) {
        tamanhoTexto += 2;
        aplicarTamanhoTexto();
    }
});
document.getElementById("diminuirTexto").addEventListener("click", () => {
    if (tamanhoTexto > 12) {
        tamanhoTexto -= 2;
        aplicarTamanhoTexto();
    }
});
document.getElementById("textoNormal").addEventListener("click", () => {
    tamanhoTexto = 16;
    aplicarTamanhoTexto();
});
// LEITURA DE TEXTO POR VOZ
const campoLeitura = document.getElementById("textoLeitura");
const botaoLer = document.getElementById("lerTexto");
const botaoParar = document.getElementById("pararLeitura");
botaoLer.addEventListener("click", () => {
    const texto = campoLeitura.value.trim();
    if (!texto) {
        alert("Digite um texto para realizar a leitura.");
        return;
    }
    if (!("speechSynthesis" in window)) {
        alert("Seu navegador não oferece suporte à leitura por voz.");
        return;
    }
    window.speechSynthesis.cancel();
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = "pt-BR";
    fala.rate = 1;
    window.speechSynthesis.speak(fala);
});
botaoParar.addEventListener("click", () => {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }
});
// DEFINIR DATA MÍNIMA PARA AGENDAMENTOS
const campoDataConsulta = document.getElementById("dataConsulta");
const agora = new Date();
const ano = agora.getFullYear();
const mes = String(agora.getMonth() + 1).padStart(2, "0");
const dia = String(agora.getDate()).padStart(2, "0");
campoDataConsulta.min = `${ano}-${mes}-${dia}`;
// INICIALIZAR A LISTA DE CONSULTAS
renderizarConsultas();
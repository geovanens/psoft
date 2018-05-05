const listagem = document.getElementById('listagem');
const usuario = document.getElementById("user-login");
const senha = document.getElementById("secret");
const titulo = document.getElementById("input-titulo");
const mensagem = document.getElementById("input-mensagem");
const autor = document.getElementById("input-autor");
let mensagens = [];

function verify_user() {
    let check_user = document.getElementById("check-user");
    fetch("http://150.165.85.16:9900/api/frontends").then(
        d => d.json()
    ).then(
        function (dados) {
            if (!dados.includes(usuario.value)) {
                check_user.className.baseVal = "svg-inline--fa fa-check fa-w-16 has-text-danger";
            }
            else {
                check_user.className.baseVal = "svg-inline--fa fa-check fa-w-16 has-text-success";
            }
        }
    );
}

function login_logout(botao) {
    if (botao.innerText === "Login") {
        document.getElementById("box-login").hidden = false;
        botao.innerText = "Cancel";
    }
    else if (botao.innerText === "Cancel") {
        document.getElementById("box-login").hidden = true;
        botao.innerText = "Login";
    }
    else {
        botao.innerText = "Login";
        localStorage.setItem("logado", false);
        localStorage.removeItem("credentials");
        /*document.getElementById("listagem").parentElement.style.filter = "blur(5px)";*/
        location.reload();

    }
}

function confirma_login () {
    if (usuario.value === "") {
        document.getElementById("required-user").hidden = false;
    }
    if (senha.value === "") {
        document.getElementById("required-secret").hidden = false;
    }
	if (usuario.value != "" && senha.value != "") {
        document.getElementById("required-user").hidden = true;
        document.getElementById("required-secret").hidden = true;

		const credenciais = `${usuario.value}:${senha.value}`;
		const status_login = document.getElementById("status-login");
		const dados = {
			title:".", 
			msg:".", 
			author:".", 
			credentials:credenciais
		};
		const corpo = JSON.stringify(dados);
		var resposta = null;
		fetch('http://150.165.85.16:9900/api/msgs', { method: 'POST', body: corpo}).then(
			function (response) { 
                resposta = response;
                return response.json()
            }).then(function (dados) {
				if (resposta.ok) {
                    document.getElementById("box-login").hidden = true;
                    document.getElementById("btn-login-logout").innerText = "Logout";
                    status_login.hidden = true;
                    document.getElementById("listagem").parentElement.style.filter = "blur(0px)";
                    
                    localStorage.setItem("credentials", credenciais);
                    localStorage.setItem("logado", true);

                    const corpo_delete = JSON.stringify({credentials:credenciais});
					fetch(dados.url, {method:'DELETE', body: corpo_delete})
					/*new Promise((resolve) => setTimeout(resolve, 500)).then(() => 
					atualiza_mensagens());*/
				}
				else {
					var erro = dados.message;
					if (dados.message === "secret inválido") {
						erro = "senha inválida";
					}
					else if (dados.message === "frontend_id não reconhecido") {
						erro = "usuario não cadastrado";
					}
					status_login.innerHTML = `<small style="color: red">${erro}</small>`;
					status_login.hidden = false;
				}
			});
	}
	
}

function enviar_mensagem() {
	if (titulo.value.trim == "" || mensagem.value.trim == "" || autor.value.trim == "") {
		const stat_mensagem = document.getElementById('status-mensagem');
		stat.innerHTML = `<small style="color: red">Dados de mensagem inválidos</small>`;
		stat_mensagem.hidden = false;
	}
	else {
		const dados = {
			title:titulo.value, 
			msg:mensagem.value, 
			author:autor.value, 
			credentials:`${usuario.value}:${senha.value}`
		};
		const corpo = JSON.stringify(dados);
		fetch('http://150.165.85.16:9900/api/msgs', { method: 'POST', body: corpo});
		titulo.value = "";
		mensagem.value = "";
		autor.value = "";
	}
}

let tab_ativa = "mural-tab";
function managerTabs (parent) {
    document.getElementById(tab_ativa).className = "";
    tab_ativa = parent.id;
    parent.className = "is-active";

    if (localStorage.getItem("logado") === "true") {
        if (tab_ativa === "mural-tab") {
            document.getElementById("input-search").parentElement.hidden = true;
            document.getElementById("box-mensagem").hidden = true;
            get_messages().then(function () {
                const itens = mensagens.filter(function (e) {
                    if (e.frontend != "icaro" && e.frontend != "caiolira" && e.frontend != "hgalvao") {
                        return e;
                    }
                });
                update_view(itens);
            });
        }
        else if (tab_ativa === "buscar-tab") {
            document.getElementById("box-mensagem").hidden = true;
            var find = document.getElementById("input-search");
            update_view([]);
            find.parentElement.hidden = false;
        }
        else if (tab_ativa === "enviar-mensagens-tab") {
            document.getElementById("input-search").parentElement.hidden = true;
            document.getElementById("box-mensagem").hidden = false;
            update_view([]);
        }
        else {
            document.getElementById("box-mensagem").hidden = true;
            document.getElementById("input-search").parentElement.hidden = true;
            get_messages().then(function () {
                const itens = mensagens.filter(function (e) {
                    if (e.frontend === usuario.value) {
                        return e;
                    }
                })
                update_view(itens);
            });
        }
    }
}

function check_storage() {
    if (localStorage.getItem("logado") === "true") {
        document.getElementById("btn-login-logout").innerText = "Logout";
        document.getElementById("listagem").parentElement.style.filter = "blur(0px)";
        usuario.value = localStorage.getItem("credentials").split(":")[0];
        senha.value = localStorage.getItem("credentials").split(":")[1];

    }
}

function update_view (mensagens_update) {
    itens = mensagens_update.map(function (e) {
        var corpo_msg = `
        <div class="column is-4">
            <div class="card">
                <header class="card-header">
                    <p class="card-header-title">
                        ${e.title}
                    </p>`;
                    if (usuario.value == e.frontend) {
                        corpo_msg += `
                        <a href="#" class="card-header-icon" aria-label="more options">
                            <a id="delete" class="delete is-small is-danger" onclick="deletar('${e.id}')"></a>
                        </a>`
                    }
                    
                corpo_msg += `
                </header>
                <div class="card-content">
                    <div id="corpo-msg" class="content">
                        <p>${e.msg}</p>
                    </div>
                </div>
                <footer class="card-content">
                    <div class="content">
                        <span style="font-size: 12px">
                            ${e.author}, 
                            Em ${new Date(e.created_at).toLocaleDateString()} às ${new Date(e.created_at).toLocaleTimeString("pt-BR")}
                        </span>
                    </div>
                </footer>
            </div>
        </div>`;
        
        return corpo_msg;
    }
        );	
    listagem.innerHTML = itens.join("\n");
}

function pressEnter () {
	if (window.event.keyCode == 13){   
		buscar_mensagens();
  	}
}

function buscar_mensagens() {
    var value = document.getElementById("input-search").value;
	const filtradas = mensagens.filter(e => 
		e.title.includes(value) || e.author.includes(value) ||
		e.msg.includes(value)
		)
	update_view(filtradas);

}

function get_messages () {
    return fetch('http://150.165.85.16:9900/api/msgs')
	.then(r => r.json())
	.then(data => {
		Object.assign(mensagens, data);
        mensagens.sort(function(a,b) {return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()});
    });
}

function deletar(id) {
	const corpo = JSON.stringify({credentials:`${usuario.value}:${senha.value}`});
    fetch(`http://150.165.85.16:9900/api/msgs/${id}`, {method:'DELETE', body: corpo})
    .then(function () {
		managerTabs(document.getElementById(tab_ativa));
	});
}

check_storage();
get_messages().then(function () {
    const itens = mensagens.filter(function (e) {
        if (e.frontend != "icaro" && e.frontend != "caiolira" && e.frontend != "hgalvao") {
            return e;
        }
    });
    update_view(itens);
});
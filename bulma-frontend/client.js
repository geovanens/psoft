const listagem = document.getElementById('listagem');
const usuario = document.getElementById("user-login");
const senha = document.getElementById("secret");

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

let tab_ativa = "mural-tab";
function managerTabs (parent) {
    document.getElementById(tab_ativa).className = "";
    tab_ativa = parent.id;
    parent.className = "is-active";

    if (localStorage.getItem("logado") === "true") {
        if (tab_ativa === "mural-tab") {
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
            var find = document.getElementById("input-search");
            update_view([]);
            find.parentElement.hidden = false;
        }
        else {
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
                    </p>
                    <a href="#" class="card-header-icon" aria-label="more options">
                        <span class="icon">
                            <i class="fas fa-angle-down" aria-hidden="true"></i>
                        </span>
                    </a>
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

check_storage();
get_messages().then(function () {
    const itens = mensagens.filter(function (e) {
        if (e.frontend != "icaro" && e.frontend != "caiolira" && e.frontend != "hgalvao") {
            return e;
        }
    });
    update_view(itens);
});
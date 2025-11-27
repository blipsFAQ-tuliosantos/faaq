// ===================================
// Lógica para o Fluxo de Conteúdo (loadMenu, loadContent, Fluxo Sim/Não, Hierarquia)
// ===================================

/**
 * Carrega o menu específico do setor e o conteúdo inicial.
 */
function loadMenu(sector) {
    const menuEl = document.getElementById('menu-area-content');
    const sidebarTitle = document.querySelector('.sidebar h2');
    const conteudo = document.getElementById("conteudo");
    
    const sectorConfigs = {
        'onboarding_instalacao': {
            title: "FAQ INSTALAÇÃO",
            menu: `
                <a class="menu-item" onclick="loadContent('colaboradores', this)">👥 Colaboradores</a>
                <a class="menu-item" onclick="loadContent('pré_despacho', this)">🚚 Pré Despacho</a>
                <a class="menu-item" onclick="loadContent('maquina_chegou', this)">📦 Máquina Chegou</a>
                <a class="menu-item" onclick="loadContent('conclusao', this)">🏆 Conclusão</a>
                <a class="menu-item" onclick="loadContent('links_uteis', this)">🔗 Links Úteis</a>
                <a class="menu-item" onclick="loadContent('dicas', this)">💡 Dicas</a>
            `,
            initialContent: 'maquina_chegou'
        },
        'vendas': { title: "FAQ VENDAS", menu: '<li>Guia Vendas (Em Construção)</li>', initialContent: 'em_construcao' },
        'documentacao': { title: "FAQ DOCUMENTAÇÃO", menu: '<li>Guia Documentação (Em Construção)</li>', initialContent: 'em_construcao' },
        'ongoing': { title: "FAQ ONGOING", menu: '<li>Guia Ongoing (Em Construção)</li>', initialContent: 'em_construcao' },
        'sac': { title: "FAQ SAC", menu: '<li>Guia SAC (Em Construção)</li>', initialContent: 'em_construcao' }
    };
    
    const config = sectorConfigs[sector];

    if (config) {
        sidebarTitle.textContent = config.title;
        
        // renderSectorSelection está definido em js/auth.js
        const backButton = `
            <a href="#" class="menu-item" onclick="renderSectorSelection()">
                ⬅️ Voltar ao Seletor
            </a>
            <ul style="list-style: none; padding: 0; margin: 0;">
                ${config.menu}
            </ul>
        `;
        menuEl.innerHTML = backButton;
        
        if (config.initialContent === 'em_construcao') {
            conteudo.innerHTML = `
                <h2>🚧 ${config.title}</h2>
                <div class="card card-alerta-erro">
                    <h3>Ops! Calma lá...</h3>
                    <p style="font-size: 1.1em; font-weight: 600; color: #f0f0f0;">Este guia está "em construção"! Por favor, **volte ao seletor** e escolha sua área. 😉</p>
                </div>
            `;
        } else {
            // Seleciona e ativa o item de menu inicial
            const initialItem = document.querySelector(`[onclick="loadContent('${config.initialContent}', this)"]`);
            if (initialItem) {
                 loadContent(config.initialContent, initialItem);
            }
        }
    } else {
        sidebarTitle.textContent = "Área Não Definida";
        menuEl.innerHTML = '';
        conteudo.innerHTML = `
            <h2>ERRO</h2>
            <div class="card card-alerta-erro">
                <p>Setor não configurado. Por favor, faça logout e tente novamente.</p>
            </div>
        `;
    }
}


/**
 * Lógica para abrir/fechar os níveis da hierarquia
 */
function toggleNivel(id, buttonElement = null, isDirector = false) {
    const el = document.getElementById(id);
    
    if (!el) return;
    
    // Lógica para fechar outros níveis abertos no mesmo grupo (exceto o nível Diretor)
    if (buttonElement && !isDirector) {
        
        const parentNivel = buttonElement.closest('.nivel');
        
        if (parentNivel) {
            // Fecha outros níveis
            parentNivel.querySelectorAll('.nivel').forEach(nivel => {
                if (nivel.id !== id && !nivel.classList.contains('oculto')) {
                    nivel.classList.add('oculto');
                }
            });
            
            // Remove o 'active' de outros botões (sub)
            parentNivel.querySelectorAll('.card-btn.sub').forEach(btn => {
                if (btn !== buttonElement && btn.classList.contains('active')) {
                    btn.classList.remove('active');
                }
            });
        }
    }
    
    el.classList.toggle('oculto');
    
    if (buttonElement && buttonElement.classList.contains('card-btn')) {
        buttonElement.classList.toggle('active', !el.classList.contains('oculto'));
    }
}

/**
 * Lógica para o Fluxo de Decisão (Sim/Não) 
 */
function nextFlow(questionId, answer, element = null) {
    
    const questionContainer = element ? element.closest('.card') : null;
    const arrowElement = document.getElementById('flow-arrow-' + questionId);

    // Oculta todos os fluxos relacionados à questionId
    document.querySelectorAll('[id^="flow-' + questionId + '-"]').forEach(flow => {
        flow.classList.add('oculto');
    });
    
    // Remove o 'active' de todos os botões da pergunta
    if (questionContainer) {
        questionContainer.querySelectorAll('.botoes-fluxo .card-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    if (arrowElement) {
        arrowElement.classList.add('oculto');
    }

    if (answer === 'atender' || answer === 'testes') {
        const flowToShow = document.getElementById('flow-' + questionId + '-' + answer);
        if (flowToShow) {
            flowToShow.classList.remove('oculto');
            
            // Mostra a seta se houver conteúdo visível
            if (arrowElement && flowToShow.querySelector('.card')) {
                arrowElement.classList.remove('oculto');
            }
        }
        if (element) {
            element.classList.add('active'); 
        }
    } 
    // Caso de resetar o fluxo (resposta não prevista ou re-clique)
    if (answer === 'reset' && questionContainer) {
        questionContainer.querySelectorAll('.botoes-fluxo .card-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }
}

/**
 * Lógica para abrir/fechar categorias de Máquinas
 */
function toggleMachineMenu(category, buttonElement) {
    const el = document.getElementById(category);

    if (!el) return;

    // Fecha todos os outros menus (da mesma categoria pai)
    const parentContainer = buttonElement.closest('.hierarquia'); 
    
    if (parentContainer) {
        parentContainer.querySelectorAll('.maquina-menu').forEach(menu => {
            if (menu.id !== category && !menu.classList.contains('oculto')) {
                menu.classList.add('oculto');
            }
        });
        
        // Desativa o botão de todos os outros menus
        parentContainer.querySelectorAll('.card-btn.category-btn').forEach(btn => {
            if (btn !== buttonElement && btn.classList.contains('active')) {
                btn.classList.remove('active');
            }
        });
    }
    
    // Alterna a visibilidade do menu clicado
    el.classList.toggle('oculto');
    
    // Alterna o estado 'active' do botão clicado
    if (buttonElement) {
        buttonElement.classList.toggle('active', !el.classList.contains('oculto'));
    }
}

// ===================================================================
// FUNÇÕES DE FLUXO "COMO ATENDER" (MOVIDAS PARA O ESCOPO GLOBAL)
// ===================================================================

/**
 * Lógica para abrir/fechar os passos do checklist (Acordeão).
 * Fecha todos os outros passos abertos para manter apenas um aberto por vez.
 */
function togglePasso(passoId, element) {
    const passoContent = document.getElementById(passoId);
    const parentContainer = element.closest('#passos-iniciais-atendimento');
    
    if (!passoContent || !parentContainer) return;

    // 1. Oculta todos os outros conteúdos de passo
    parentContainer.querySelectorAll('.passo-content').forEach(content => {
        if (content.id !== passoId && !content.classList.contains('oculto')) {
            content.classList.add('oculto');
        }
    });

    // 2. Remove a classe 'active' de todos os outros botões/títulos
    parentContainer.querySelectorAll('.passo-titulo').forEach(title => {
        if (title !== element && title.classList.contains('active')) {
            title.classList.remove('active');
        }
    });

    // 3. Alterna a visibilidade do conteúdo clicado
    passoContent.classList.toggle('oculto');
    
    // 4. Alterna o estado 'active' do título clicado
    element.classList.toggle('active', !passoContent.classList.contains('oculto'));
}


/**
 * Controla a exibição e o estado de colapsamento dos fluxos "Cliente é meu" / "Cliente não é meu".
 * @param {boolean} isMine - True se o botão clicado for "Cliente é meu", False se for "Cliente não é meu".
 * @param {string} initialStepsId - ID do div que contém os passos iniciais (a ser colapsado).
 * @param {string} myClientFlowId - ID do div que contém o fluxo do "Cliente é meu".
 * @param {string} notMyClientFlowId - ID do div que contém o fluxo do "Cliente não é meu" (mensagem).
 */
function mostrarFluxoCliente(isMine, initialStepsId, myClientFlowId, notMyClientFlowId) {
    const passosIniciais = document.getElementById(initialStepsId);
    const fluxoMeu = document.getElementById(myClientFlowId);
    const fluxoNaoMeu = document.getElementById(notMyClientFlowId);
    const btnToggle = document.getElementById('btn-toggle-passos-iniciais');

    // Reseta o estado
    if (fluxoMeu) fluxoMeu.classList.add('oculto');
    if (fluxoNaoMeu) fluxoNaoMeu.classList.add('oculto');
    
    // Minimiza o passo a passo inicial para dar foco ao próximo passo
    if(passosIniciais) passosIniciais.classList.add('oculto'); 
    
    // Atualiza o botão de toggle para o estado minimizado
    if (btnToggle) btnToggle.textContent = '➡️ Mostrar Passos Iniciais (Clique para expandir)';

    if (isMine) {
        // Mostra o sub-fluxo "Cliente é Meu"
        if(fluxoMeu) fluxoMeu.classList.remove('oculto');
    } else {
        // Mostra a mensagem "Cliente Não é Meu"
        if(fluxoNaoMeu) fluxoNaoMeu.classList.remove('oculto');
    }
}

/**
 * Permite ao usuário colapsar/expandir o bloco de passos iniciais a qualquer momento.
 */
function togglePassosIniciais() {
    const passosIniciais = document.getElementById('passos-iniciais-atendimento');
    const btn = document.getElementById('btn-toggle-passos-iniciais');
    
    if (!passosIniciais || !btn) return;

    passosIniciais.classList.toggle('oculto');
    
    if (passosIniciais.classList.contains('oculto')) {
        btn.textContent = '➡️ Mostrar Passos Iniciais (Clique para expandir)';
        
        // Oculta os fluxos de decisão quando o checklist inicial é minimizado
        const fluxoMeu = document.getElementById('fluxo-cliente-meu');
        const fluxoNaoMeu = document.getElementById('fluxo-cliente-nao-meu');
        if (fluxoMeu) fluxoMeu.classList.add('oculto');
        if (fluxoNaoMeu) fluxoNaoMeu.classList.add('oculto');
        
    } else {
        btn.textContent = '✅ Fluxo Inicial Concluído (Clique para Ocultar)';
        
        // Oculta os fluxos de decisão quando o checklist inicial é expandido
        const fluxoMeu = document.getElementById('fluxo-cliente-meu');
        const fluxoNaoMeu = document.getElementById('fluxo-cliente-nao-meu');
        if (fluxoMeu) fluxoMeu.classList.add('oculto');
        if (fluxoNaoMeu) fluxoNaoMeu.classList.add('oculto');
    }
}

// ===================================================================
// Lógica para carregar o conteúdo na área principal 
// (Contém todos os templates HTML de conteúdo)
// ===================================================================
function loadContent(section, element) {

    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove("active"));
    document.querySelectorAll('.maquina-menu button').forEach(i => i.classList.remove("active"));
    
    // Adiciona a classe 'active' ao item clicado 
    if (element) {
        element.classList.add("active");
    }

    const conteudo = document.getElementById("conteudo");

    const pages = {
        
        // =================================
        // SEÇÃO: COLABORADORES (Hierarquia)
        // =================================
        colaboradores: `
            <h2>👥 Colaboradores</h2>
            <p>Contatos e hierarquia para resolução de problemas e dúvidas específicas.</p>

            <div class="hierarquia">

                <button class="card-btn" id="btn-diretor" onclick="toggleNivel('diretor', this, true)">
                    Diretor de Operações - Fernando Motta
                </button>

                <div id="diretor" class="nivel oculto">

                    <button class="card-btn sub" onclick="toggleNivel('tecnico', this)">Gerente dos Técnicos — Marcelo Ramos</button>
                    <div id="tecnico" class="nivel oculto">
                        <div class="card-mini">
                            <p><h4>Kathiúcia: <a class="contato-rapido" href="${whatsappLink('34998285621', 'Olá Kathiúcia, preciso de ajuda com um pagamento/peça remanejada.')}" target="_blank">📞 (34) 9 9828-5621</a></h4></p>
                            <p>Responsável por fazer o pagamento dos técnicos, acompanhar envio de peça de máquinas remanejadas e autoriza a troca de técnicos responsáveis pela instalação.</p>
                        </div>
                    </div>

                    <button class="card-btn sub" onclick="toggleNivel('logistica', this)">Gerente de Logística — Thiago Machado</button>
                    <div id="logistica" class="nivel oculto">
                        <div class="card-mini">
                            <p><h4>Thiago Machado: <a class="contato-rapido" href="${whatsappLink('34996439323', 'Olá Thiago, preciso de auxílio com checklist/fases pré despacho.')}" target="_blank">📞 (34) 9 9643-9323</a></h4></p>
                            <p>Responsável por checklist de envio e fases pré despacho.</p>
                        </div>
                    </div>

                    <button class="card-btn sub" onclick="toggleNivel('estoque', this)">Gerente de Estoque — Fabiano Carvalho (BOI)</button>
                    <div id="estoque" class="nivel oculto">
                        <div class="card-mini">
                            <p><h4>Fabiano Carvalho: <a class="contato-rapido" href="${whatsappLink('34999067831', 'Olá Fabiano, preciso de auxílio urgente com um despacho/estoque.')}" target="_blank">📞 (34) 9 9906-7831</a></h4></p>
                            <p>Responsável pelo estoque e despacho via sedex.</p>
                        </div>
                    </div>

                    <button class="card-btn sub" onclick="toggleNivel('suprimentos', this)">
                            Supervisora Suprimentos / E-commerce — Daynn Costa
                        </button>
                        <div id="suprimentos" class="nivel oculto">
                            <div class="card-mini">
                                <p>
                                    <h4>Daynn Costa: 
                                        <a class="contato-rapido" 
                                            href="${whatsappLink('34999067831', 'Olá Daynn, preciso de auxílio com suprimentos/e-commerce.')}" 
                                            target="_blank">
                                            📞 (34) 9 9906-7831
                                        </a>
                                    </h4>
                                </p>
                                <p>
                                    Responsável por vender o suprimentos e informar sobre o envio para o Fabiano faturar e o Thiago colocar no envio com a maquina.
                                </p>
                            </div>
                        </div>

                    <button class="card-btn sub" onclick="toggleNivel('cs', this)">Customer Services — Mayara Resende (Supervisores abaixo)</button>
                    <div id="cs" class="nivel oculto">
                        <div class="card-time">
                            <h3>Supervisor SAC — Bruno Moura</h3>
                            <p>Colaboradores: Responsáveis por resolver RA (Reclame Aqui).</p>
                            <ul>
                                <li>Camilla Souza</li><li>Matheus Silva</li><li>Zarrara Alves</li>
                                <li>Waliane Mendes</li><li>Rayane Cristina</li>
                            </ul>
                        </div>

                        <div class="card-time">
                            <h3>Supervisor Ongoing — Vinícius Leal</h3>
                            <p>Colaboradores: Responsáveis por resolverem problemas e acompanhar o sucesso do cliente pós instalação.</p>
                            <ul>
                                <li>Lucas Santos</li><li>Thiago Garcia</li><li>Suhyene Nina Alves</li>
                                <li>Rafael Gomes</li><li>José Vieira</li><li>Sabrina Mendonça</li>
                                <li>Mariane Brito</li><li>Wesley (Retenção)</li><li>Mychelle Rosa (Retenção)</li>
                                <li>Rayanne Duarte Brasil (Retenção)</li><li>Thayanne Tomé (Retenção)</li>
                            </ul>
                        </div>

                        <div class="card-time">
                            <h3>Supervisor Suporte ao Cliente — Hebert Cardoso</h3>
                            <p>Colaboradores: Focais que auxiliam em problemas técnicos durante e pós instalação.</p>
                            <ul>
                                <li>Izabela Aparecida</li><li>Diogo Soares</li><li>Paulo Ferreira</li>          
                            </ul>
                        </div>
                    </div>

                    <button class="card-btn sub" onclick="toggleNivel('operacao', this)">Operação — Mariane Carvalho (Supervisores abaixo)</button>
                    <div id="operacao" class="nivel oculto">
                        <div class="card-time">
                            <h3>Supervisora Instalação/CV — Débora</h3>
                            <p>Analistas:</p>
                            <ul>
                                <li>Natalia Akemi (Install) </li><li>Guilherme França (Install)</li><li>Tulio de Paula (Install)</li><li>Rubia (Install)</li>
                                <li>Jheyme (Install)</li><li>Marilia (Acompanha entrega)</li><li>Gabrielle (Acompanha entrega)</li>
                            </ul>
                        </div>

                        <div class="card-time">
                            <h3>Supervisora Instalação/Estética,Fitness e food — Paula</h3>
                            <p>Analistas:</p>
                            <ul>
                                <li>João Victor</li><li>Gustavo Magoso</li><li>Hugo</li><li>Cecilia</li><li>Taís</li>
                            </ul>
                        </div>

                        <div class="card-time">
                            <h3>Supervisor Documentação — (Vaga aberta)</h3>
                            <p>Analistas: Responsáveis por fazer a formalização da venda através das documentações, garantia de checklist e que o pagameto estejam liberados para a máquina ser enviada.</p>
                            <ul>
                                <li>Suzana</li><li>Sabrina</li><li>Ayna</li><li>Thiago</li>
                                <li>Gustavo franco</li><li>Pedro</li><li>João Teixeira</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

<div class="hierarquia">
        <button class="card-btn" onclick="toggleNivel('salvador', this, true)">
            Salvador (ROBÔ)
        </button>
        <div id="salvador" class="nivel oculto">
            <div class="card">
                <p>
                    <h4>Salvador: 
                        <a class="contato-rapido" 
                           href="${whatsappLink('1231973176', 'Olá, Salvador, gostaria de verificar a situação de um ativo.')}" 
                           target="_blank">
                           📞 (12) 3197-3176
                        </a>
                    </h4>
                </p>
                <p>
                    Descrição: Verificar situação do ativo (bloqueios, créditos, pendências financeiras etc)
                </p>
                </div>
        </div>
    </div>
        `,
        // =================================
        // SEÇÃO: PRÉ DESPACHO 
        // =================================
        pré_despacho: `
            <h2>🚚 Pré Despacho</h2>
            <p>Fases e Status do pedido antes da máquina ser entregue ao cliente.</p>

            <div class="hierarquia">

                <button class="card-btn" id="btn-fases-despacho" onclick="toggleNivel('fases_despacho', this, true)">
                    Fases e Checklist (SLA de 5 dias úteis) - Responsável Thiago Machado
                </button>

                <div id="fases_despacho" class="nivel oculto">
                    <button class="card-btn sub" onclick="toggleNivel('neuronio', this)">1. Aguardando Neurônio</button>
                    <div id="neuronio" class="nivel oculto">
                        <div class="card-mini">
                            <p><strong>Descrição:</strong> A máquina está aguardando a configuração inicial e o link com o sistema Blips.</p>
                            <p><strong>Ação:</strong> Acompanhar SLA.</p>
                        </div>
                    </div>

                    <button class="card-btn sub" onclick="toggleNivel('vincular_ativo', this)">2. Aguardando Vincular Ativo</button>
                    <div id="vincular_ativo" class="nivel oculto">
                        <div class="card-mini">
                            <p><strong>Descrição:</strong> O número de série da máquina (ativo) está sendo associado à conta do cliente no sistema.</p>
                            <p><strong>Ação:</strong> Acompanhar o SLA.</p>
                        </div>
                    </div>

                    <button class="card-btn sub" onclick="toggleNivel('checklist', this)">3. Checklist de Envio</button>
                    <div id="checklist" class="nivel oculto">
                        <div class="card-mini">
                            <p><strong>Descrição:</strong> Verificação final de todos os itens necessários antes de a máquina sair do estoque.</p>
                            <p><strong>Itens:</strong> Acompanhar o SLA.</p>
                        </div>
                    </div>

                    <button class="card-btn sub" onclick="toggleNivel('remessa', this)">4. Remessa</button>
                    <div id="remessa" class="nivel oculto">
                        <div class="card-mini">
                            <p><strong>Descrição:</strong> O documento fiscal é gerado, e o pedido é transferido para a transportadora.</p>
                            <p><strong>Ação:</strong> Acompanhar o SLA.</p>
                        </div>
                    </div>

                    <button class="card-btn sub" onclick="toggleNivel('despacho', this)">5. Despacho</button>
                    <div id="despacho" class="nivel oculto">
                        <div class="card-mini">
                            <p><strong>Descrição:</strong> Máquina foi liberada e está fisicamente em trânsito para o endereço do cliente.</p>
                            <p><strong>Ação:</strong> Monitoramento ativo do transporte.</p>
                        </div>
                    </div>

                </div>
            </div>

            <div class="card hierarquia">
        
        </div>

    <div class="card card-alerta-aviso" style="margin-top: 20px;">
        <h3>⚠️ IMPORTANTE: Rastreamento de Status</h3>
        <p style="text-align: center;">
            TODAS AS FASES APARECEM NO HISTÓRICO DA PLATAFORMA <a href="https://app.blips.com.br" target="_blank" style="color: #FCBA28; font-weight: bold;">APP.BLIPS.COM.BR</a> 
            NA ABA HISTÓRICO
        </p>
    </div>

    <div class="card" style="padding: 10px; text-align: center;">
        <img src="prints/historico_plataforma.png" alt="Print da aba Histórico da plataforma BLiP" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #444;">
    </div>
    <button class="card-btn active" onclick="loadContent('maquina_chegou', this)">
        Próximo Passo: 📦 Máquina Chegou
    </button>

        `,
        
        // =================================
        // SEÇÃO: MÁQUINA CHEGOU
        // =================================
        maquina_chegou: `
            <h2>📦 Máquina Chegou</h2>
            <p>Selecione a abordagem desejada após o recebimento da máquina no local de instalação.</p>
            
            <div class="hierarquia" id="maquina-chegou-flow">
                
                <div class="card" id="q1-fluxo-principal">
                    <h3>Qual a sua próxima ação?</h3>
                    <div class="botoes-fluxo">
                        <button class="card-btn" onclick="nextFlow('q1', 'atender', this)">🧑‍💻 Como Atender?</button>
                        <button class="card-btn" onclick="nextFlow('q1', 'testes', this)">🛠️ Iniciando Testes</button>
                    </div>
                </div>

                <div id="flow-arrow-q1" class="flow-arrow oculto">
                    <p>➡️ Próxima Etapa</p>
                </div>

                <div id="flow-q1-atender" class="card-alerta-sucesso oculto" style="color: #f0f0f0;">
                    <h3>🧑‍💻 Conteúdo: Como Atender o Cliente</h3>
                    <!-- BOTÃO PARA MINIMIZAR/MAXIMIZAR O CHECKLIST INICIAL (Mantido, mas oculto por padrão no acordeão) -->
                    <button id="btn-toggle-passos-iniciais" class="card-btn sub oculto" onclick="togglePassosIniciais()">
                        ➡️ Mostrar Passos Iniciais (Clique para expandir)
                    </button>

                    <!-- CHECKLIST INICIAL (Passos 1 a 6) - AGORA EM FORMATO ACORDEÃO -->
                    <div id="passos-iniciais-atendimento">
                        
                        <!-- ALERTA IMPORTANTE (Mantido no topo) -->
                        <div class="card card-alerta-aviso">
                            <h3>⚠️ ATENÇÃO - PASSO OBRIGATÓRIO</h3>
                            <p style="font-size: 1.1em; font-weight: 600; color: #f0f0f0;">
                                ANTES DE CONVERSAR COM O CLIENTE É <strong>OBRIGATÓRIO</strong> VOCÊ SABER QUEM É O RESPONSÁVEL DO CARD DO CLIENTE CONFORME OS PASSOS ABAIXO!
                            </p>
                        </div>

                        <!-- PASSO 1: Identificar o Cliente no Sistema -->
                        <button class="card-btn passo-titulo" onclick="togglePasso('passo-1-content', this)">
                            📋 Passo 1: Identificar o Cliente no Sistema
                        </button>
                        <div id="passo-1-content" class="passo-content oculto">
                            <div class="card card-mini">
                                <p style="margin-bottom: 10px;">
                                    Copie o <strong>CNPJ / CPF</strong> ou <strong>número do contrato</strong> do cliente na parte superior central dentro do chat do 
                                    <a href="https://desk.hyperflow.global/auth" class="contato-rapido" target="_blank">HyperFlow</a>.
                                </p>
                            </div>
                        </div>

                        <!-- PASSO 2: Acessar a Plataforma BLIPS -->
                        <button class="card-btn passo-titulo" onclick="togglePasso('passo-2-content', this)">
                            🔍 Passo 2: Acessar a Plataforma BLIPS
                        </button>
                        <div id="passo-2-content" class="passo-content oculto">
                            <div class="card card-mini">
                                <p style="margin-bottom: 10px;">
                                    Acesse sua conta na 
                                    <a href="https://app.blips.com.br" class="contato-rapido" target="_blank">Plataforma BLIPS</a> 
                                    e siga os passos:
                                </p>
                                <ol style="margin-left: 20px; line-height: 1.8;">
                                    <li>Selecione a opção <strong>GESTOR</strong></li>
                                    <li>Clique no <strong>ícone de computador</strong> na barra lateral esquerda da tela</li>
                                    <li>Em seguida, vá em <strong>Negociações</strong></li>
                                    <li>Cole a informação copiada no Passo 1 e <strong>pesquise</strong></li>
                                </ol>
                                
                                <div class="card-alerta-aviso" style="margin-top: 15px;">
                                    <p style="font-size: 0.95em; margin: 0;">
                                        <strong>📌 OBS:</strong> Após pesquisar, vai aparecer o contrato correspondente ou uma lista. 
                                        Existem clientes com mais de 1 contrato, <strong>tenha atenção em qual você está tratando</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- PASSO 3: Visualizar Detalhes do Contrato -->
                        <button class="card-btn passo-titulo" onclick="togglePasso('passo-3-content', this)">
                            👁️ Passo 3: Visualizar Detalhes do Contrato
                        </button>
                        <div id="passo-3-content" class="passo-content oculto">
                            <div class="card card-mini">
                                <p style="margin-bottom: 10px;">
                                    Do lado esquerdo da tela você encontra um botão com <strong>3 PONTOS</strong> referente ao(s) contrato(s).
                                </p>
                                <ol style="margin-left: 20px; line-height: 1.8;">
                                    <li>Clique nos <strong>3 pontos</strong></li>
                                    <li>Selecione a opção <strong>VISUALIZAR DETALHE</strong></li>
                                </ol>
                                
                                <!-- Placeholder para imagem explicativa -->
                                <div style="background-color: #1e1e1e; border: 2px dashed #FCBA28; border-radius: 8px; padding: 20px; text-align: center; margin-top: 15px;">
                                    <p style="color: #FCBA28; font-weight: 600; margin: 0;">
                                        📷 [IMAGEM: Localização do botão 3 pontos]
                                    </p>
                                    <p style="color: #ccc; font-size: 0.9em; margin-top: 5px;">
                                        Adicione aqui uma captura de tela mostrando onde está o botão
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- PASSO 4: Identificar o Gerente de Instalação -->
                        <button class="card-btn passo-titulo" onclick="togglePasso('passo-4-content', this)">
                            🏢 Passo 4: Identificar o Gerente de Instalação
                        </button>
                        <div id="passo-4-content" class="passo-content oculto">
                            <div class="card card-mini">
                                <p style="margin-bottom: 10px;">
                                    Na tela de detalhes do contrato:
                                </p>
                                <ol style="margin-left: 20px; line-height: 1.8;">
                                    <li>Localize a aba <strong>INFORMAÇÕES BÁSICAS</strong></li>
                                    <li>Desça a tela até o final</li>
                                    <li>Encontre a aba <strong>Gerente de Conta</strong></li>
                                    <li>Procure por <strong>INSTALAÇÃO</strong> e observe o responsável</li>
                                </ol>
                            </div>
                        </div>

                        <!-- PASSO 5: Verificar no BITRIX -->
                        <button class="card-btn passo-titulo" onclick="togglePasso('passo-5-content', this)">
                            📊 Passo 5: Verificar no BITRIX
                        </button>
                        <div id="passo-5-content" class="passo-content oculto">
                            <div class="card card-mini">
                                <p style="margin-bottom: 10px;">
                                    Sendo seu ou não o cliente, acesse o 
                                    <a href="https://blips.bitrix24.com.br/vibe/" class="contato-rapido" target="_blank">BITRIX</a> 
                                    e siga:
                                </p>
                                <ol style="margin-left: 20px; line-height: 1.8;">
                                    <li>Pesquise o cliente na aba <strong>CRM</strong> na lateral esquerda da tela</li>
                                    <li>No topo da tela (lado esquerdo), clique na opção <strong>NEGÓCIOS</strong></li>
                                    <li>Use a <strong>LUPA central SUPERIOR</strong> para pesquisar a mesma informação copiada no Passo 1</li>
                                    <li>Procure pelo card do cliente que tenha o nome <strong>[DOCUMENTAÇÃO] - [INSTALAÇÃO]</strong></li>
                                </ol>
                                
                                <div class="card-alerta-aviso" style="margin-top: 15px;">
                                    <p style="font-size: 0.95em; margin: 0;">
                                        <strong>💡 DICA:</strong> O nome [DOCUMENTAÇÃO] - [INSTALAÇÃO] indica que aquele é o card da sua fase.
                                    </p>
                                </div>
                                
                                <!-- Placeholder para imagem explicativa -->
                                <div style="background-color: #1e1e1e; border: 2px dashed #FCBA28; border-radius: 8px; padding: 20px; text-align: center; margin-top: 15px;">
                                    <p style="color: #FCBA28; font-weight: 600; margin: 0;">
                                        📷 [IMAGEM: Navegação no BITRIX - CRM > Negócios]
                                    </p>
                                    <p style="color: #ccc; font-size: 0.9em; margin-top: 5px;">
                                        Adicione aqui uma captura de tela mostrando onde está o botão
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- PASSO 6: Confirmar Responsabilidade -->
                        <button class="card-btn passo-titulo" onclick="togglePasso('passo-6-content', this)">
                            ✅ Passo 6: Confirmar Responsabilidade
                        </button>
                        <div id="passo-6-content" class="passo-content oculto">
                            <div class="card card-mini">
                                <p style="margin-bottom: 10px;">
                                    Com o Card aberto no BITRIX:
                                </p>
                                <ol style="margin-left: 20px; line-height: 1.8;">
                                    <li>Encontre do lado esquerdo o campo <strong>RESPONSÁVEL</strong> dentro da BOX "Sobre o negócio"</li>
                                    <li>Observe se de fato <strong>você é o responsável</strong>, ou não</li>
                                </ol>
                            </div>

                            <!-- OBSERVAÇÕES FINAIS IMPORTANTES -->
                            <div class="card card-alerta-aviso">
                                <h3>⚠️ OBSERVAÇÕES IMPORTANTES</h3>
                                
                                <div style="margin-bottom: 15px; padding: 10px; background-color: rgba(252, 186, 40, 0.1); border-left: 4px solid #FCBA28; border-radius: 4px;">
                                    <p style="margin: 0; font-weight: 600; color: #FCBA28;">📌 OBS 1: Divergência entre Plataformas</p>
                                    <p style="margin: 8px 0 0 0; line-height: 1.6;">
                                        Caso você seja o responsável no <strong>BITRIX</strong>, porém na <strong>Plataforma BLIPS</strong> não, 
                                        o cliente é <strong>SEU</strong>. Ou seja, altere para o seu nome na 
                                        <a href="https://app.blips.com.br" class="contato-rapido" target="_blank">Plataforma BLIPS</a>, 
                                        pois a <strong>plataforma oficial de gestão de CARD é o BITRIX</strong>!
                                    </p>
                                </div>
                                
                                <div style="padding: 10px; background-color: rgba(252, 186, 40, 0.1); border-left: 4px solid #FCBA28; border-radius: 4px;">
                                    <p style="margin: 0; font-weight: 600; color: #FCBA28;">📌 OBS 2: Cliente de Outro Analista</p>
                                    <p style="margin: 8px 0 0 0; line-height: 1.6;">
                                        Caso o responsável no <strong>BITRIX</strong> seja outro analista, apenas 
                                        <strong>transfira o chat do HyperFlow</strong> para o analista responsável, 
                                        pois ele fará o acompanhamento e atualizará o gerente na Plataforma BLIPS caso esteja incorreto!
                                    </p>
                                </div>
                            </div>
                        </div>
                        <!-- FIM DO CHECKLIST INICIAL -->
                    </div>
                    
                    <hr style="border-color: #444; margin: 20px 0;">

                    <!-- DECISÃO DE RESPONSABILIDADE -->
                    <div class="card">
                        <h3>Qual o resultado da sua análise de responsabilidade?</h3>
                        <div class="botoes-fluxo">
                            <!-- Opção 1: Cliente é meu -->
                            <button class="card-btn" onclick="mostrarFluxoCliente(true, 'passos-iniciais-atendimento', 'fluxo-cliente-meu', 'fluxo-cliente-nao-meu')">
                                ✅ Cliente é meu
                            </button>
                            <!-- Opção 2: Cliente não é meu -->
                            <button class="card-btn" onclick="mostrarFluxoCliente(false, 'passos-iniciais-atendimento', 'fluxo-cliente-meu', 'fluxo-cliente-nao-meu')">
                                ❌ Cliente não é meu
                            </button>
                        </div>
                    </div>

                    <!-- FLUXO 1: CLIENTE É MEU -->
                    <div id="fluxo-cliente-meu" class="card-alerta-sucesso oculto" style="margin-top: 20px;">
                        <h3>🛠️ Próxima Etapa: Tipo de Instalação</h3>
                        
                        <div class="card card-mini">
                            <p>
                                Com o ativo do cliente aberto na 
                                <a href="https://app.blips.com.br" class="contato-rapido" target="_blank">Plataforma BLIPS</a>, 
                                navegue até a opção <strong>Itens de locação</strong> e observe qual é o modelo da máquina.
                            </p>
                            <p style="margin-top: 10px;">
                                <strong>OBS:</strong> Para saber se o modelo é instalado presencialmente ou remotamente, 
                                prossiga o fluxo de <strong>INICIANDO TESTES</strong> e procure o modelo.
                            </p>
                        </div>
                        
                        <p style="font-weight: 600; margin-top: 15px;">Selecione o tipo de instalação correspondente:</p>
                        
                        <div class="botoes-fluxo">
                            <!-- Opção 1.1: Presencial (A ser implementado) -->
                            <button class="card-btn" onclick="alert('Fluxo Presencial a ser implementado!')">
                                🧑‍🔧 PRESENCIAL
                            </button>
                            <!-- Opção 1.2: Remoto (A ser implementado) -->
                            <button class="card-btn" onclick="alert('Fluxo Remoto a ser implementado!')">
                                💻 REMOTO
                            </button>
                        </div>
                    </div>

                    <!-- FLUXO 2: CLIENTE NÃO É MEU -->
                    <div id="fluxo-cliente-nao-meu" class="card-alerta-erro oculto" style="margin-top: 20px;">
                        <h3>❌ Cliente Não é de sua Responsabilidade</h3>
                        <p style="font-size: 1.2em; font-weight: 700; text-align: center;">
                            Faça a transferência do chat no HyperFlow e prossiga com outro cliente.
                        </p>
                    </div>

                    <!-- BOTÃO DE RETORNO AO FLUXO PRINCIPAL -->
                    <button class="card-btn sub" onclick="nextFlow('q1', 'reset', document.getElementById('q1-fluxo-principal').querySelector('[onclick*=\\'atender\\']'))">
                        ⬅️ Voltar ao Fluxo Principal
                    </button>
                </div>

                <div id="flow-q1-testes" class="card-alerta-sucesso oculto" style="color: #f0f0f0;">
                    <h3>🛠️ Seleção do Modelo de Máquina para Teste</h3>
                    
                    <p>Selecione a categoria e o modelo da máquina que será instalado para visualizar o checklist de testes.</p>
                    
                    <button class="card-btn category-btn" onclick="toggleMachineMenu('cv_machines', this)">
                        🖼️ COMUNICAÇÃO VISUAL
                    </button>
                    <div id="cv_machines" class="maquina-menu nivel oculto">
                        <button class="card-btn sub" onclick="loadContent('teste_i1600_i3200', this)">Plotter de Impressão i1600/i3200 Ecossolvente (TÉCNICO PRESENCIAL)</button>
                        <button class="card-btn sub" onclick="loadContent('teste_xp600', this)">Plotter de Impressão XP600 (TÉCNICO PRESENCIAL)</button>
                        <button class="card-btn sub" onclick="loadContent('teste_servo', this)">Plotter de recorte SERVO (ANALISTA REMOTO)</button>
                        <button class="card-btn sub" onclick="loadContent('teste_passo', this)">Plotter de recorte PASSO (ANALISTA REMOTO)</button>
                        <button class="card-btn sub" onclick="loadContent('teste_cnc_10060', this)">CNC 10060 (ANALISTA REMOTO)</button>
                        <button class="card-btn sub" onclick="loadContent('teste_cnc_6040', this)">CNC 6040 (ANALISTA REMOTO)</button>
                        <button class="card-btn sub" onclick="loadContent('teste_cnc_4040', this)">CNC 4040 (ANALISTA REMOTO)</button>
                        <button class="card-btn sub" onclick="loadContent('teste_fiber_desktop', this)">Fiber Desktop (ANALISTA REMOTO)</button>
                        <button class="card-btn sub" onclick="loadContent('teste_fiber_50w', this)">Fiber 50W (ANALISTA REMOTO)</button>
                        <button class="card-btn sub" onclick="loadContent('teste_fiber_30w', this)">Fiber 30W (ANALISTA REMOTO)</button>
                        <button class="card-btn sub" onclick="loadContent('teste_fiber_5w_uv', this)">Fiber 5w (UV) (ANALISTA REMOTO)</button>
                        <button class="card-btn sub" onclick="loadContent('teste_flatbed', this)">FLATBED (TÉCNICO PRESENCIAL)</button>
                        <button class="card-btn sub" onclick="loadContent('teste_dtf_uv', this)">DTF UV (TÉCNICO PRESENCIAL)</button>
                    </div>

                    <button class="card-btn category-btn" onclick="toggleMachineMenu('cc_machines', this)">
                        🏗️ CONSTRUÇÃO CIVIL
                    </button>
                    <div id="cc_machines" class="maquina-menu nivel oculto">
                        <button class="card-btn sub" onclick="loadContent('teste_miniescavadeira', this)">MiniEscavadeira Vuze (ANALISTA REMOTO)</button>
                    </div>

                    <button class="card-btn category-btn" onclick="toggleMachineMenu('cf_machines', this)">
                        🧵 CONFECÇÃO
                    </button>
                    <div id="cf_machines" class="maquina-menu nivel oculto">
                        <button class="card-btn sub" onclick="loadContent('teste_sublimatica', this)">Plotter de impressão Sublimática (TÉCNICO PRESENCIAL)</button>
                        <button class="card-btn sub" onclick="loadContent('teste_dtf_textil', this)">DTF Têxtil (TÉCNICO PRESENCIAL)</button>
                    </div>
                </div>
            </div>
        `,


        
        // =================================
        // OUTRAS PÁGINAS (LINKS E FIM)
        // =================================
        conclusao: `
            <h2>🏆 Conclusão</h2>
            <div class="card"><p>Informações e checklist de encerramento da instalação.</p></div>
        `,
links_uteis: `
    <h2>🔗 Links Úteis</h2>
    <p>Acesso rápido aos sistemas e documentos de apoio essenciais.</p>

    <div class="card">
        <h3>Sistemas de Comunicação e CRM</h3>
        <ul>
            <li>
                <a href="https://app.blips.com.br" class="contato-rapido link-principal" target="_blank">
                    Plataforma BLIPS (Acessar informação do cliente)
                </a>
            </li>
            <li>
                <a href="https://desk.hyperflow.global/auth" class="contato-rapido link-principal" target="_blank">
                    Hyper Flow (Falar com o cliente)
                </a>
            </li>
            <li>
                <a href="https://blips.bitrix24.com.br/vibe/" class="contato-rapido link-principal" target="_blank">
                    Bitrix (Acompanhar cards e tarefas)
                </a>
            </li>
        </ul>
    </div>

    <div class="card">
        <h3>Treinamento e Conhecimento</h3>
        <ul>
            <li>
                <a href="https://cursos.blips.com.br/" class="contato-rapido link-principal" target="_blank">
                    Blips Educa (Treinamento sobre todas as máquinas)
                </a>
            </li>
            <li>
                <a href="https://ajuda.blips.com.br/" class="contato-rapido link-principal" target="_blank">
                    Ajuda Blips (Informações especificas, peso, largura etc)
                </a>
            </li>
        </ul>
    </div>
    
    <div class="card"> 
        <h3>Rastreio de Transportadoras</h3>
        <p>Acesso direto aos portais de rastreio.</p>
        <ul>
            <li>
                <a href="https://rastreamento.correios.com.br/app/index.php" class="contato-rapido link-principal" target="_blank">
                    Correios (Rastreio)
                </a>
            </li>
            <li>
                <a href="https://www.braspress.com/rastreie-sua-encomenda/" class="contato-rapido link-principal" target="_blank">
                    Braspress (Consulta de Embarque)
                </a>
            </li>
            <li>
                <a href="https://alfatransportes.com.br/" class="contato-rapido link-principal" target="_blank">
                    Alfa Transportes (Rastreamento)
                </a>
            </li>
            <li>
                <a href="https://portalunico.solistica.com.br/Solistica.Portal.UI/entrar" class="contato-rapido link-principal" target="_blank">
                    Solistica (Rastreamento Tragetta)
                </a>
            </li>
        </ul>
    </div>

    <div class="card">
        <h3>Sistemas TomTicket (Chamados)</h3>
        <ul>
            <li>
                <a href="https://ideal.tomticket.com/helpdesk" class="contato-rapido link-principal" target="_blank">
                    TomTicket Helpdesk (Abrir novo chamado de suporte)
                </a>
            </li>
            <li>
                <a href="https://console.tomticket.com/dashboard/" class="contato-rapido link-principal" target="_blank">
                    TomTicket Console (Acompanhar chamados abertos pelo suporte)
                </a>
            </li>
        </ul>
    </div>

    <div class="card">
        <h3>Monitoramento, Inventário e Garantias</h3>
        <ul>
            <li>
                <a href="https://flow.blips.com.br" class="contato-rapido link-principal" target="_blank">
                    Flow (Acompanhar Garantias das Máquinas)
                </a>
            </li>
            <li>
                <a href="https://lookerstudio.google.com/u/0/reporting/a1b5494b-8ed0-49a4-b378-75f7c71814ee/page/p_90j0v40s6c" class="contato-rapido link-principal" target="_blank">
                    Painel Neurônio (Verificar Créditos)
                </a>
            </li>
            <li>
                <a href="https://docs.google.com/spreadsheets/d/1FJxNu7LyiPDvEbQZ7ofjQMVt7Muxn1cDs4KktKdmu7c/edit?pli=1&gid=1713699446#gid=1713699446" class="contato-rapido link-principal" target="_blank">
                    Máquinas em Manutenção (Planilha Google Sheets)
                </a>
            </li>
        </ul>
    </div>

    <div class="card">
        <h3>Recursos Humanos (RH)</h3>
        <ul>
            <li>
                <a href="https://app.tangerino.com.br/" class="contato-rapido link-principal" target="_blank">
                    Solides (Ver e Bater Folha de Ponto)
                </a>
            </li>
            <li>
                <a href="https://sqabrasil.app.questorpublico.com.br/Authorize/LogOn?ReturnUrl=%2fcliente%2fpainel" class="contato-rapido link-principal" target="_blank">
                    Sistema Questor (Ver Holerite)
                </a>
            </li>
        </ul>
    </div>
`,
        dicas: `
            <h2>💡 Dicas</h2>
            <div class="card"><p>Dicas gerais de instalação, segurança e atendimento ao cliente.</p></div>
        `,
        
        // =================================
        // CONTEÚDOS DE TESTE DE MÁQUINA
        // =================================
        teste_i1600_i3200: `
            <h2>🛠️ Checklist: Plotter i1600/i3200 Ecossolvente</h2>
            <div class="card">
                <h3>Teste 1: Nível de Tinta</h3>
                <p>Verificar se todos os dampers estão cheios e se o sistema de bulk ink está pressurizado.</p>
                
            </div>
            <div class="card">
                <h3>Teste 2: Alinhamento de Cabeças</h3>
                <p>Imprimir o teste de nozzle para checar a qualidade e o alinhamento das cabeças de impressão.</p>
                
            </div>
            <button class="card-btn active" onclick="loadContent('maquina_chegou', this)">
                ⬅️ Voltar à Seleção de Máquinas
            </button>
        `,
        teste_xp600: `
            <h2>🛠️ Checklist: Plotter XP600</h2>
            <div class="card"><p>Conteúdo de teste para a Plotter XP600 a ser adicionado.</p></div>
            <button class="card-btn active" onclick="loadContent('maquina_chegou', this)">
                ⬅️ Voltar à Seleção de Máquinas
            </button>
        `,
        teste_servo: `
            <h2>🛠️ Checklist: Plotter de recorte SERVO</h2>
            <div class="card"><p>Conteúdo de teste para Plotter de recorte SERVO a ser adicionado.</p></div>
            <button class="card-btn active" onclick="loadContent('maquina_chegou', this)">
                ⬅️ Voltar à Seleção de Máquinas
            </button>
        `,
        // ... (Adicionar placeholders para os outros modelos aqui)
 
        // Adicionar os placeholders de teste_X faltantes aqui
        teste_cnc_10060: `
            <h2>🛠️ Checklist: CNC 10060</h2>
            <div class="card"><p>Conteúdo de teste para a CNC 10060 a ser adicionado.</p></div>
            <button class="card-btn active" onclick="loadContent('maquina_chegou', this)">
                ⬅️ Voltar à Seleção de Máquinas
            </button>
        `,
        teste_cnc_6040: `
            <h2>🛠️ Checklist: CNC 6040</h2>
            <div class="card"><p>Conteúdo de teste para a CNC 6040 a ser adicionado.</p></div>
            <button class="card-btn active" onclick="loadContent('maquina_chegou', this)">
                ⬅️ Voltar à Seleção de Máquinas
            </button>
        `,
        teste_cnc_4040: `
            <h2>🛠️ Checklist: CNC 4040</h2>
            <div class="card"><p>Conteúdo de teste para a CNC 4040 a ser adicionado.</p></div>
            <button class="card-btn active" onclick="loadContent('maquina_chegou', this)">
                ⬅️ Voltar à Seleção de Máquinas
            </button>
        `,
        teste_fiber_desktop: `
            <h2>🛠️ Checklist: Fiber Desktop</h2>
            <div class="card"><p>Conteúdo de teste para a Fiber Desktop a ser adicionado.</p></div>
            <button class="card-btn active" onclick="loadContent('maquina_chegou', this)">
                ⬅️ Voltar à Seleção de Máquinas
            </button>
        `,
        teste_fiber_50w: `
            <h2>🛠️ Checklist: Fiber 50W</h2>
            <div class="card"><p>Conteúdo de teste para a Fiber 50W a ser adicionado.</p></div>
            <button class="card-btn active" onclick="loadContent('maquina_chegou', this)">
                ⬅️ Voltar à Seleção de Máquinas
            </button>
        `,
        teste_fiber_30w: `
            <h2>🛠️ Checklist: Fiber 30W</h2>
            <div class="card"><p>Conteúdo de teste para a Fiber 30W a ser adicionado.</p></div>
            <button class="card-btn active" onclick="loadContent('maquina_chegou', this)">
                ⬅️ Voltar à Seleção de Máquinas
            </button>
        `,
        teste_fiber_5w_uv: `
            <h2>🛠️ Checklist: Fiber 5W (UV)</h2>
            <div class="card"><p>Conteúdo de teste para a Fiber 5W (UV) a ser adicionado.</p></div>
            <button class="card-btn active" onclick="loadContent('maquina_chegou', this)">
                ⬅️ Voltar à Seleção de Máquinas
            </button>
        `,
        teste_flatbed: `
            <h2>🛠️ Checklist: FLATBED</h2>
            <div class="card"><p>Conteúdo de teste para a FLATBED a ser adicionado.</p></div>
            <button class="card-btn active" onclick="loadContent('maquina_chegou', this)">
                ⬅️ Voltar à Seleção de Máquinas
            </button>
        `,
        teste_dtf_uv: `
            <h2>🛠️ Checklist: DTF UV</h2>
            <div class="card"><p>Conteúdo de teste para a DTF UV a ser adicionado.</p></div>
            <button class="card-btn active" onclick="loadContent('maquina_chegou', this)">
                ⬅️ Voltar à Seleção de Máquinas
            </button>
        `,
        teste_miniescavadeira: `
            <h2>🛠️ Checklist: MiniEscavadeira Vuze</h2>
            <div class="card"><p>Conteúdo de teste para a MiniEscavadeira Vuze a ser adicionado.</p></div>
            <button class="card-btn active" onclick="loadContent('maquina_chegou', this)">
                ⬅️ Voltar à Seleção de Máquinas
            </button>
        `,
        teste_sublimatica: `
            <h2>🛠️ Checklist: Plotter de impressão Sublimática</h2>
            <div class="card"><p>Conteúdo de teste para a Plotter de impressão Sublimática a ser adicionado.</p></div>
            <button class="card-btn active" onclick="loadContent('maquina_chegou', this)">
                ⬅️ Voltar à Seleção de Máquinas
            </button>
        `,
        teste_dtf_textil: `
            <h2>🛠️ Checklist: DTF Têxtil</h2>
            <div class="card"><p>Conteúdo de teste para a DTF Têxtil a ser adicionado.</p></div>
            <button class="card-btn active" onclick="loadContent('maquina_chegou', this)">
                ⬅️ Voltar à Seleção de Máquinas
            </button>
        `,
    };


    // Caso o modelo clicado ainda não tenha conteúdo, mostrar um placeholder
    if (section.startsWith('teste_') && !pages[section]) {
        conteudo.innerHTML = `
            <h2>🛠️ Checklist: Conteúdo em Construção</h2>
            <div class="card card-alerta-erro">
                <h3 style="color: #FF5252;">🚧 Conteúdo Não Disponível</h3>
                <p style="color: #f0f0f0;">O checklist para o modelo <strong>${section.replace('teste_', '').toUpperCase().replace(/_/g, ' ')}</strong> ainda está sendo preparado.</p>
                <p style="color: #f0f0f0;">Por favor, utilize os manuais disponíveis ou entre em contato com o suporte.</p>
            </div>
            <button class="card-btn active" onclick="loadContent('maquina_chegou', this)">
                ⬅️ Voltar à Seleção de Máquinas
            </button>
        `;
        return;
    }


    conteudo.innerHTML = pages[section] || "<p>Erro ao carregar conteúdo.</p>";
}
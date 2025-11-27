// ===================================
// Lógica de Autenticação e Fluxo de Telas (LOGIN, SELETOR, LOGOUT)
// ===================================

// Credenciais (Recomendável armazenar em um local mais seguro em produção!)
const USERNAME_VALIDO = "BLIPS";
const PASSWORD_VALIDA = "BLIPS";

function handleLogin(event) {
    event.preventDefault(); 
    
    const username = document.getElementById('username').value.trim().toUpperCase();
    const password = document.getElementById('password').value.trim().toUpperCase();
    const errorEl = document.getElementById('login-error');

    if (username === USERNAME_VALIDO && password === PASSWORD_VALIDA) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.removeItem('currentSector'); 
        errorEl.textContent = '';
        
        // Inicia a transição para a seleção de setor
        fadeScreenOut(renderSectorSelectionContent); 
        
    } else {
        errorEl.textContent = '❌ Usuário ou senha inválidos. Tente ADMIN/ADMIN.';
    }
}

/**
 * Função interna que renderiza o CONTEÚDO da tela de seleção de setor e a MOSTRA.
 * (Contém template HTML)
 */
function renderSectorSelectionContent() {
    
    const sectorScreen = document.getElementById('sector-selection-screen');
    
    // 1. Oculta outras telas
    document.getElementById('login-screen').classList.add('oculto');
    document.getElementById('app-container').classList.add('oculto');
    
    // 2. Preenche o conteúdo do seletor 
    // OBS: selectSector e handleLogout DEVEM estar definidos neste ou em outro script carregado.
    sectorScreen.innerHTML = `
        <div class="card login-container">
            <h2>Selecione sua Área 🎯</h2>
            
            <div class="sector-grid">
                
                <div class="sector-card" onclick="selectSector('vendas', this)">
                    <span class="icon">💰</span>
                    <h3>VENDAS</h3>
                </div>

                <div class="sector-card" onclick="selectSector('documentacao', this)">
                    <span class="icon">📑</span>
                    <h3>DOCUMENTAÇÃO</h3>
                </div>

                <div class="sector-card" onclick="selectSector('onboarding_instalacao', this)">
                    <span class="icon">🚀</span>
                    <h3>ONBOARDING / INSTALAÇÃO</h3>
                </div>
                
                <div class="sector-card" onclick="selectSector('ongoing', this)">
                    <span class="icon">🔄</span>
                    <h3>ONGOING (Pós-Venda)</h3>
                </div>
                
                <div class="sector-card" onclick="selectSector('sac', this)">
                    <span class="icon">📞</span>
                    <h3>SAC (Atendimento)</h3>
                </div>
                
            </div>
            <button class="card-btn active" onclick="handleLogout()">Sair do Acesso</button>
        </div>
    `;
    
    // 3. Mostra a tela de seleção
    sectorScreen.classList.remove('oculto');
}

/**
 * Função pública para forçar a renderização da tela de seleção (usada para voltar).
 */
function renderSectorSelection() {
    fadeScreenOut(renderSectorSelectionContent);
}


function selectSector(sector, element) {
    localStorage.setItem('currentSector', sector);
    
    // Adiciona a classe ativa ANTES da transição de tela
    if (element) {
        // Remove a classe de todos os cards (dentro da tela de seleção)
        document.querySelectorAll('#sector-selection-screen .sector-card').forEach(card => card.classList.remove('active-sector'));
        // Adiciona a classe no card clicado (Dark Mode ativo: Laranja)
        element.classList.add('active-sector'); 
    }
    
    // Transição suave para a tela do aplicativo
    fadeScreenOut(() => {
        document.getElementById('sector-selection-screen').classList.add('oculto');
        
        const appContainer = document.getElementById('app-container');
        appContainer.classList.remove('oculto');
        
        // loadMenu está definido em js/app.js
        loadMenu(sector);
        
        // Remove a classe ativa APÓS o fade, para garantir que o estado inicial ao voltar esteja limpo
        if (element) {
            element.classList.remove('active-sector');
        }
    });
}

function handleLogout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentSector');

    // Transição suave para a tela de login
    fadeScreenOut(() => {
        document.getElementById('app-container').classList.add('oculto');
        document.getElementById('sector-selection-screen').classList.add('oculto');
        
        document.getElementById('login-screen').classList.remove('oculto');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    });

}

/**
 * Verifica o estado da sessão ao carregar a página.
 */
window.onload = function() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const currentSector = localStorage.getItem('currentSector');
    
    // Esconde todas as telas para garantir que o fluxo comece do zero
    document.getElementById('login-screen').classList.add('oculto');
    document.getElementById('sector-selection-screen').classList.add('oculto');
    document.getElementById('app-container').classList.add('oculto');
    
    if (isAuthenticated && currentSector) {
        document.getElementById('app-container').classList.remove('oculto');
        // loadMenu está definido em js/app.js
        loadMenu(currentSector);
    } else if (isAuthenticated) {
        renderSectorSelectionContent();
    } else {
        document.getElementById('login-screen').classList.remove('oculto');
    }
    
};
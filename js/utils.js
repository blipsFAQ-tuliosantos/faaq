// ===================================
// Lógica para o WhatsApp
// (Função utilitária)
// ===================================
function whatsappLink(number, message) {
    // Remove qualquer caractere que não seja dígito do número
    const cleanNumber = number.replace(/\D/g, ''); 
    const encodedMessage = encodeURIComponent(message);
    // Adiciona o código 55 do Brasil.
    return `https://wa.me/55${cleanNumber}?text=${encodedMessage}`;
}

// ===================================
// Lógica de Transição de Tela
// (Função utilitária)
// ===================================

/**
 * Aplica um fade-out suave na tela VISÍVEL e executa o callback após a transição.
 * @param {function} callback A função a ser executada após o fade-out.
 */
function fadeScreenOut(callback) {
    // Encontra a tela atualmente VISÍVEL entre as 3 principais.
    const visibleScreen = document.querySelector('#login-screen:not(.oculto), #sector-selection-screen:not(.oculto), #app-container:not(.oculto)');

    if (visibleScreen) {
        visibleScreen.classList.add('fade-out');
    }
    
    // Tempo de espera (0.4s corresponde ao CSS transition-duration)
    setTimeout(() => {
        // Esconde a tela atual
        if (visibleScreen) {
            visibleScreen.classList.add('oculto');
            visibleScreen.classList.remove('fade-out'); 
        }

        // Executa a função que irá MOSTRAR (remover 'oculto') a próxima tela
        if (callback) {
            callback();
        }

    }, 400); 
}
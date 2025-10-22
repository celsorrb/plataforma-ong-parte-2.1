document.addEventListener('DOMContentLoaded', () => {
    const cpfInput = document.getElementById('cpf');
    const telefoneInput = document.getElementById('telefone');
    const cepInput = document.getElementById('cep');
    const enderecoInput = document.getElementById('endereco');
    const cidadeInput = document.getElementById('cidade');
    const estadoSelect = document.getElementById('estado');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.getElementById('navegacao-principal');
    
    /* ========================================= */
    /* 1. NAVEGAÇÃO MOBILE (MENU HAMBÚRGUER) */
    /* ========================================= */
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('mobile-active');
            
            // Adiciona ou remove o bloqueio de scroll no body
            document.body.style.overflow = navMenu.classList.contains('mobile-active') ? 'hidden' : '';
        });
        
        // Fechar menu ao clicar em um link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 991) { // Só fecha se for em tela mobile/tablet
                    menuToggle.setAttribute('aria-expanded', 'false');
                    navMenu.classList.remove('mobile-active');
                    document.body.style.overflow = '';
                }
            });
        });
    }


    /* ========================================= */
    /* 2. MÁSCARAS DE INPUT */
    /* ========================================= */

    // Função genérica para aplicar máscara
    const applyMask = (input, mask) => {
        if (!input) return; 
        input.addEventListener('input', (event) => {
            let value = event.target.value.replace(/\D/g, ''); 
            let maskedValue = '';
            let k = 0;

            for (let i = 0; i < mask.length; i++) {
                if (k >= value.length) break;

                if (mask[i] === '#') {
                    maskedValue += value[k++];
                } else {
                    maskedValue += mask[i];
                }
            }
            event.target.value = maskedValue;
        });
    };

    // Máscara para CPF (###.###.###-##)
    applyMask(cpfInput, '###.###.###-##');

    // Máscara para CEP (#####-###)
    applyMask(cepInput, '#####-###');

    // Máscara para Telefone ((##) #####-#### ou (##) ####-####)
    if (telefoneInput) {
        telefoneInput.addEventListener('input', (event) => {
            let value = event.target.value.replace(/\D/g, ''); 
            let maskedValue = '';

            if (value.length > 11) {
                value = value.substring(0, 11);
            }

            if (value.length > 0) {
                maskedValue += '(' + value.substring(0, 2);
            }
            if (value.length > 2) {
                maskedValue += ') ';
            }
            if (value.length > 7 && value.length <= 11) { // Celular (5 dígitos)
                maskedValue += value.substring(2, 7) + '-' + value.substring(7, 11);
            } else if (value.length > 6) { // Fixo (4 dígitos)
                 maskedValue += value.substring(2, 6) + '-' + value.substring(6, 10);
            } else if (value.length > 2) {
                maskedValue += value.substring(2, value.length);
            }

            event.target.value = maskedValue;
        });
    }

    /* ========================================= */
    /* 3. FUNÇÃO DE BUSCA DE ENDEREÇO POR CEP (ViaCEP) */
    /* ========================================= */
    const buscaCEP = async () => {
        if (!cepInput || !enderecoInput || !cidadeInput || !estadoSelect) return;

        let cep = cepInput.value.replace(/\D/g, ''); 

        if (cep.length !== 8) {
            return;
        }

        enderecoInput.value = 'Buscando...';
        enderecoInput.disabled = true;
        cidadeInput.disabled = true;
        estadoSelect.disabled = true;

        try {
            const url = `https://viacep.com.br/ws/${cep}/json/`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.erro) {
                alert('CEP não encontrado ou inválido.');
                enderecoInput.value = '';
                cidadeInput.value = '';
                estadoSelect.value = '';
            } else {
                enderecoInput.value = data.logradouro + (data.bairro ? (', ' + data.bairro) : '');
                cidadeInput.value = data.localidade;
                estadoSelect.value = data.uf; 
            }

        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            alert('Falha na comunicação com o serviço de CEP.');
        } finally {
            enderecoInput.disabled = false;
            cidadeInput.disabled = false;
            estadoSelect.disabled = false;
        }
    };

    if (cepInput) {
        cepInput.addEventListener('blur', buscaCEP);
    }
    
    /* ========================================= */
    /* 4. VALIDAÇÃO ADICIONAL DE FORMULÁRIO */
    /* ========================================= */
    const cadastroForm = document.getElementById('cadastroForm');
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', (e) => {
            const voluntario = document.getElementById('voluntario').checked;
            const doador = document.getElementById('doador').checked;
            const alertaAjuda = document.getElementById('alerta-ajuda');

            if (!voluntario && !doador) {
                e.preventDefault();
                alert('Por favor, selecione pelo menos uma forma de contribuição (Voluntário ou Doador).');
                alertaAjuda.style.border = '2px solid #dc3545'; // Borda vermelha para erro
            } else {
                 alertaAjuda.style.border = 'none';
            }
        });
    }
});
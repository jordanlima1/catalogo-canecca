// URL do WhatsApp para envio da comanda
const WHATSAPP_URL = "https://wa.me/5521971803164?text="; // ⚠️ MUDAR PARA SEU NÚMERO
const ENDERECO_RETIRADA = "Travessa Peloponeso, 38 - Bangu/Vila-Kennedy, RJ (Referência: Próximo à Praça Principal)"; // ⚠️ ENDEREÇO DA SUA LOJA
let carrinho = [];

// --- FUNÇÕES DE INICIALIZAÇÃO ---

document.addEventListener('DOMContentLoaded', () => {
    carregarCarrinho();
    inicializarCarrossel();
    inicializarLightbox();
    // Garante que os campos de entrega sejam escondidos ao carregar a página
    alternarCamposEntrega(); 
});

function carregarCarrinho() {
    const carrinhoSalvo = localStorage.getItem('carrinhoCanecca');
    if (carrinhoSalvo) {
        carrinho = JSON.parse(carrinhoSalvo);
    }
    atualizarCarrinho(); 
}

function salvarCarrinho() {
    localStorage.setItem('carrinhoCanecca', JSON.stringify(carrinho));
}


// --- LÓGICA DO CARRINHO (SEM BUGS) ---

function adicionarAoCarrinho(produtoId) {
    // GARANTE que o ID passado é o ID ÚNICO do produto
    const produtoElement = document.querySelector(`[data-id="${produtoId}"]`);
    if (!produtoElement) {
        console.error("Produto não encontrado com ID:", produtoId);
        return;
    }
    
    const nome = produtoElement.dataset.nome;
    const preco = parseFloat(produtoElement.dataset.preco);

    const itemExistente = carrinho.find(item => item.id === produtoId);

    if (itemExistente) {
        itemExistente.quantidade++;
    } else {
        carrinho.push({
            id: produtoId,
            nome: nome,
            preco: preco,
            quantidade: 1
        });
    }

    salvarCarrinho();
    atualizarCarrinho(); // Garante atualização imediata
}

function alterarQuantidade(produtoId, delta) {
    const item = carrinho.find(item => item.id === produtoId);
    if (!item) return;

    item.quantidade += delta;

    // CORREÇÃO DE BUG CRÍTICO: Remove o item se a quantidade for 0 ou menor
    if (item.quantidade <= 0) {
        carrinho = carrinho.filter(i => i.id !== produtoId);
    }

    salvarCarrinho();
    atualizarCarrinho(); // Garante que a interface atualize após a mudança
}

function removerItem(produtoId) {
    carrinho = carrinho.filter(i => i.id !== produtoId);
    salvarCarrinho();
    atualizarCarrinho();
}

function formatarMoeda(valor) {
    return valor.toFixed(2).replace('.', ',');
}

function atualizarCarrinho() {
    const listaCarrinhoDiv = document.getElementById('listaCarrinho');
    const totalCarrinhoSpan = document.getElementById('totalCarrinho');
    const contadorFlutuanteSpan = document.getElementById('contadorFlutuante');
    const floatingCartButton = document.getElementById('floatingCartButton');
    const abrirCheckoutBtn = document.getElementById('abrirCheckout');
    
    let total = 0;
    let totalItens = 0;

    listaCarrinhoDiv.innerHTML = ''; // Limpa a lista atual

    if (carrinho.length === 0) {
        listaCarrinhoDiv.innerHTML = '<p id="carrinhoVazio" class="texto-vazio">Seu carrinho está vazio.</p>';
        floatingCartButton.style.display = 'none';
        abrirCheckoutBtn.disabled = true;
    } else {
        abrirCheckoutBtn.disabled = false;
        carrinho.forEach(item => {
            const subtotal = item.preco * item.quantidade;
            total += subtotal;
            totalItens += item.quantidade;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'item-carrinho';
            itemDiv.innerHTML = `
                <div>${item.nome}</div>
                <div class="controles-qtd">
                    <button class="btn-qtd" onclick="alterarQuantidade('${item.id}', -1)">-</button>
                    <span>${item.quantidade}</span>
                    <button class="btn-qtd" onclick="alterarQuantidade('${item.id}', 1)">+</button>
                    <strong style="margin-left: 10px;">R$ ${formatarMoeda(subtotal)}</strong>
                    <span class="remover-item" onclick="removerItem('${item.id}')">&times;</span>
                </div>
            `;
            listaCarrinhoDiv.appendChild(itemDiv);
        });

        floatingCartButton.style.display = 'flex';
    }

    totalCarrinhoSpan.textContent = formatarMoeda(total);
    contadorFlutuanteSpan.textContent = totalItens;
}


// --- MODAIS (CARRINHO E CHECKOUT) ---

const modalCarrinho = document.getElementById('modalCarrinho');
const modalCheckout = document.getElementById('modalCheckout');

function abrirModalCarrinho() {
    modalCarrinho.style.display = 'block';
}

function fecharModal(event, modalId) {
    const modal = document.getElementById(modalId);
    // Se o clique foi no elemento que tem a classe 'fechar-modal' (o X)
    if (event.target.className === 'fechar-modal') {
        modal.style.display = 'none';
        return;
    }
    // Se o clique foi no fundo escuro, fora do conteúdo
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

function abrirModalCheckout() {
    // Note: alert() não deve ser usado em produção, mas mantido para debug aqui.
    if (carrinho.length === 0) {
        alert("O carrinho precisa ter itens para finalizar o pedido.");
        return;
    }
    modalCarrinho.style.display = 'none'; // Fecha o carrinho
    modalCheckout.style.display = 'block'; // Abre o checkout
    alternarCamposEntrega();
}

function alternarCamposEntrega() {
    const tipoRecebimento = document.getElementById('tipoRecebimento').value;
    const camposEntrega = document.getElementById('camposEntrega');
    
    if (tipoRecebimento === 'Entrega') {
        camposEntrega.style.display = 'block';
    } else { 
        camposEntrega.style.display = 'none';
    }
}


// --- CHECKOUT E GERAÇÃO DA COMANDA WHATSAPP (Lógica Mantida) ---
function finalizarPedidoWhatsapp() {
    const nome = document.getElementById('nomeCliente').value;
    const contato = document.getElementById('contatoCliente').value;
    const tipoRecebimento = document.getElementById('tipoRecebimento').value;
    const pagamento = document.getElementById('formaPagamento').value;
    const obs = document.getElementById('observacoes').value;
    const totalCarrinhoElement = document.getElementById('totalCarrinho');
    const totalPedidoText = totalCarrinhoElement ? totalCarrinhoElement.textContent.replace(',', '.') : '0.00';
    const totalPedidoNumerico = parseFloat(totalPedidoText);


    // Validação mínima e montagem da mensagem... (Lógica mantida)
    if (!nome || !contato || !tipoRecebimento || !pagamento) {
        alert("Por favor, preencha seu Nome, Contato, Tipo de Recebimento e Pagamento.");
        return;
    }
    
    let enderecoDetalhes = "";
    
    if (tipoRecebimento === 'Entrega') {
        const endereco = document.getElementById('enderecoCliente').value;
        const pontoReferencia = document.getElementById('pontoReferencia').value;
        
        if (!endereco) {
            alert("Por favor, preencha o endereço completo para a entrega.");
            return;
        }

        enderecoDetalhes = `
*Endereço:* ${endereco}
*Referência:* ${pontoReferencia || 'N/A'}
`;
    } else { 
        enderecoDetalhes = `
*Tipo:* Retirada no Local
*Endereço da Loja:* ${ENDERECO_RETIRADA}
`;
    }

    let listaItens = "";
    let descontoPix = 0;
    
    if (pagamento === 'Pix') {
        descontoPix = totalPedidoNumerico * 0.10;
        listaItens += `*⚠️ Desconto de 10% aplicado para PIX no fechamento ⚠️*\n`;
    }

    carrinho.forEach((item, index) => {
        listaItens += `${index + 1}. ${item.nome} x${item.quantidade} (Subtotal: R$ ${formatarMoeda(item.preco * item.quantidade)})\n`;
    });
    
    const totalFinal = (totalPedidoNumerico - descontoPix);

    const mensagem = `
*PEDIDO #CANECCACOMHISTORIA - ONLINE*
--------------------------------------------------------------------------------
👤 *DADOS DO CLIENTE*
Nome: ${nome}
WhatsApp: ${contato}
--------------------------------------------------------------------------------
📦 *RECEBIMENTO*
${enderecoDetalhes}
--------------------------------------------------------------------------------
🛒 *ITENS DA ENCOMENDA*
${listaItens}
--------------------------------------------------------------------------------
💰 *RESUMO DA COMPRA*
Total dos Produtos: R$ ${formatarMoeda(totalPedidoNumerico)}
Desconto PIX: R$ ${formatarMoeda(descontoPix)}
*TOTAL FINAL: R$ ${formatarMoeda(totalFinal)}*
Forma de Pagamento: ${pagamento}
--------------------------------------------------------------------------------
📝 *OBSERVAÇÕES*
${obs || 'Nenhuma observação.'}
--------------------------------------------------------------------------------
Olá Canecca com História! Favor confirmar a encomenda acima.
`;
    const mensagemCodificada = encodeURIComponent(mensagem.trim()); 
    window.open(WHATSAPP_URL + mensagemCodificada, '_blank');

    carrinho = [];
    salvarCarrinho();
    atualizarCarrinho();
    fecharModal(null, 'modalCheckout');
}


// --- LÓGICA LIGHTBOX (ZOOM E NAVEGAÇÃO) RESTAURADA ---
let currentLightboxIndex = 0;
let currentImageSources = [];

const lightbox = document.getElementById("lightbox");
const imgLightbox = document.getElementById("imgLightbox");
const fecharLightboxBtn = document.getElementsByClassName("fechar-lightbox")[0];
const prevLightbox = document.getElementsByClassName("prev-lightbox")[0];
const nextLightbox = document.getElementsByClassName("next-lightbox")[0];


// FUNÇÃO PARA ABRIR O LIGHTBOX
function abrirLightbox(container, event) {
    if (event) { event.stopPropagation(); } // Impede propagação do clique

    // 1. Coleta todas as fontes de imagem DENTRO do container clicado
    const imagesInContainer = container.querySelectorAll("img");
    currentImageSources = []; 

    imagesInContainer.forEach(img => {
        currentImageSources.push(img.src);
    });
    
    // 2. Descobre qual imagem estava visível no momento do clique (para manter o foco)
    let clickedIndex = 0; 
    const visibleImage = Array.from(imagesInContainer).find(img => {
        const style = window.getComputedStyle(img);
        return style.opacity === '1'; 
    });

    if (visibleImage) {
        clickedIndex = Array.from(imagesInContainer).indexOf(visibleImage);
    }

    // 3. Abre o Lightbox
    lightbox.style.display = "flex"; 
    showLightboxImage(clickedIndex); 
}

// FUNÇÃO PARA FECHAR O LIGHTBOX
function fecharLightbox() {
    lightbox.style.display = "none";
    currentImageSources = []; 
}

// CORREÇÃO DE BUG: Nova função com event.stopPropagation()
function showLightboxImage(n, event) {
    if (event) { event.stopPropagation(); } // Impede que o clique nas setas feche o modal

    if (currentImageSources.length === 0) return;
    
    if (n >= currentImageSources.length) {
        currentLightboxIndex = 0; 
    } else if (n < 0) {
        currentLightboxIndex = currentImageSources.length - 1; 
    } else {
        currentLightboxIndex = n;
    }
    
    imgLightbox.src = currentImageSources[currentLightboxIndex];
}

function inicializarLightbox() {
    // Não precisa mais de event listeners aqui, pois foram movidos para o HTML (onclick)
}


// --- OUTRAS FUNÇÕES (Mantidas) ---

function filtrarProdutos() {
    const termoBusca = document.getElementById('campoBusca').value.toUpperCase();
    const produtos = document.querySelectorAll('.catalogo-secao .produto');

    produtos.forEach(produto => {
        const nomeProduto = produto.querySelector('.nome-produto').textContent.toUpperCase();
        if (nomeProduto.indexOf(termoBusca) > -1) {
            produto.style.display = ""; 
        } else {
            produto.style.display = "none"; 
        }
    });
}

let slideIndex = 1;
function inicializarCarrossel() { showSlides(slideIndex); }
function plusSlides(n) { showSlides(slideIndex += n); }
function showSlides(n) { 
    let i;
    let slides = document.getElementsByClassName("carousel-slide")[0].getElementsByTagName("img");
    
    if (slides.length === 0) return; 

    if (n > slides.length) {slideIndex = 1}    
    if (n < 1) {slideIndex = slides.length}
    
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    
    slides[slideIndex-1].style.display = "block";  
} 
const intervalCarrossel = setInterval(() => plusSlides(1), 5000);

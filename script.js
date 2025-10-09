let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

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

setInterval(() => plusSlides(1), 5000);

// Variáveis Globais para o estado do Lightbox
let currentLightboxIndex = 0;
let currentImageSources = [];

// Seleciona os elementos do DOM
const lightbox = document.getElementById("lightbox");
const imgLightbox = document.getElementById("imgLightbox");
const fecharLightbox = document.getElementsByClassName("fechar-lightbox")[0];
const prevLightbox = document.getElementsByClassName("prev-lightbox")[0];
const nextLightbox = document.getElementsByClassName("next-lightbox")[0];

// Função para exibir a imagem no lightbox pelo índice
function showLightboxImage(n) {
    if (currentImageSources.length === 0) return;
    
    // Lógica para loop (volta para o início ou para o fim)
    if (n >= currentImageSources.length) {
        currentLightboxIndex = 0; 
    } else if (n < 0) {
        currentLightboxIndex = currentImageSources.length - 1; 
    } else {
        currentLightboxIndex = n;
    }
    
    imgLightbox.src = currentImageSources[currentLightboxIndex];
}

// Lógica de Próxima/Anterior ao clicar nas setas do Lightbox
prevLightbox.addEventListener("click", () => showLightboxImage(currentLightboxIndex - 1));
nextLightbox.addEventListener("click", () => showLightboxImage(currentLightboxIndex + 1));


// 1. Evento de clique para ABRIR o Lightbox
// Selecionamos todos os containers de imagem para torná-los clicáveis
const imagemContainers = document.querySelectorAll(".container-imagens");

imagemContainers.forEach(container => {
    container.addEventListener("click", function(event) {
        
        // 1.1. Coleta todas as fontes de imagem DENTRO do container clicado
        const imagesInContainer = this.querySelectorAll("img");
        currentImageSources = []; // Limpa o array anterior

        imagesInContainer.forEach(img => {
            currentImageSources.push(img.src);
        });
        
        // 1.2. Descobre qual imagem estava visível no momento do clique (frente ou verso)
        let clickedIndex = 0; // Assume a frente como padrão (índice 0)

        // Itera sobre as imagens para ver qual tem opacidade 1 (está visível)
        const visibleImage = Array.from(imagesInContainer).find(img => {
            const style = window.getComputedStyle(img);
            // Se a imagem de verso está visível (opacity: 1), começamos por ela
            return style.opacity === '1'; 
        });

        if (visibleImage) {
            // Define o índice inicial para a imagem que estava visível
            clickedIndex = Array.from(imagesInContainer).indexOf(visibleImage);
        }

        // 1.3. Abre o Lightbox
        lightbox.style.display = "flex"; 
        showLightboxImage(clickedIndex); // Mostra a imagem visível no momento do clique
    });
});


// 2. Eventos para FECHAR o Lightbox (Mantidos)
fecharLightbox.addEventListener("click", function() {
    lightbox.style.display = "none";
    currentImageSources = []; 
});

lightbox.addEventListener("click", function(event) {
    if (event.target === lightbox) {
        lightbox.style.display = "none";
        currentImageSources = []; 
    }
});
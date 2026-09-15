// Slide Navigation
let currentSlide = 0;
const totalSlides = 2;

function goToSlide(slideIndex) {
    const slidesContainer = document.getElementById('slidesContainer');
    const slideHeight = window.innerHeight;
    
    currentSlide = slideIndex;
    slidesContainer.scrollTo({
        top: slideHeight * slideIndex,
        behavior: 'smooth'
    });
    
    updatePagination();
}

function updatePagination() {
    const dots = document.querySelectorAll('.pagination-dot');
    dots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Detect scroll and update pagination
let isScrolling;
const slidesContainer = document.getElementById('slidesContainer');

slidesContainer.addEventListener('scroll', () => {
    window.clearTimeout(isScrolling);
    
    isScrolling = setTimeout(() => {
        const slideHeight = window.innerHeight;
        const scrollTop = slidesContainer.scrollTop;
        const newSlide = Math.round(scrollTop / slideHeight);
        
        if (newSlide !== currentSlide) {
            currentSlide = newSlide;
            updatePagination();
        }
    }, 100);
});

// Scroll animations for cards
slidesContainer.addEventListener('scroll', () => {
    const cards = document.querySelectorAll('.card-fade-in');
    cards.forEach(card => {
        const cardTop = card.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (cardTop < windowHeight - 100) {
            card.classList.add('visible');
        }
    });
});

// Add entrance animations on load
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
    
    // Trigger initial card animations
    const event = new Event('scroll');
    window.dispatchEvent(event);
});

// Modal functions
function openModal(cvPath, talentName) {
    const modal = document.getElementById('cvModal');
    const iframe = document.getElementById('cvFrame');
    iframe.src = cvPath;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('cvModal');
    const iframe = document.getElementById('cvFrame');
    modal.classList.remove('active');
    iframe.src = '';
    document.body.style.overflow = 'auto';
}

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Close modal when clicking outside
document.getElementById('cvModal').addEventListener('click', (e) => {
    if (e.target.id === 'cvModal') {
        closeModal();
    }
});

// Talent Selection System
let selectedTalents = new Set();

function toggleTalentSelection(checkbox) {
    const talentId = checkbox.dataset.talentId;
    const card = checkbox.closest('.talent-card');
    const talentName = card.dataset.talentName;
    const talentRole = card.dataset.talentRole;
    
    if (checkbox.checked) {
        selectedTalents.add(JSON.stringify({ id: talentId, name: talentName, role: talentRole }));
    } else {
        selectedTalents.forEach(talent => {
            const t = JSON.parse(talent);
            if (t.id === talentId) {
                selectedTalents.delete(talent);
            }
        });
    }
    
    updateFloatingButton();
}

function updateFloatingButton() {
    const floatingBtn = document.getElementById('floatingBtn');
    const talentCount = document.getElementById('talentCount');
    
    talentCount.textContent = selectedTalents.size;
    
    if (selectedTalents.size > 0) {
        floatingBtn.classList.add('show');
    } else {
        floatingBtn.classList.remove('show');
    }
}

function openOrderModal() {
    const modal = document.getElementById('orderModal');
    const talentsList = document.getElementById('selectedTalentsList');
    
    // Clear previous list
    talentsList.innerHTML = '';
    
    // Add selected talents to the list
    selectedTalents.forEach(talentStr => {
        const talent = JSON.parse(talentStr);
        const talentItem = document.createElement('div');
        talentItem.className = 'selected-talent-item';
        talentItem.innerHTML = `
            <div class="flex-1">
                <h4 class="font-semibold text-white">${talent.name}</h4>
                <p class="text-sm text-gray-400">${talent.role}</p>
            </div>
            <button type="button" class="remove-talent-btn" onclick="removeTalent('${talent.id}')">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;
        talentsList.appendChild(talentItem);
    });
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function removeTalent(talentId) {
    // Uncheck the checkbox
    const checkbox = document.querySelector(`.talent-checkbox[data-talent-id="${talentId}"]`);
    if (checkbox) {
        checkbox.checked = false;
        toggleTalentSelection(checkbox);
    }
    
    // Update the modal list
    openOrderModal();
    
    // If no talents left, close modal
    if (selectedTalents.size === 0) {
        closeOrderModal();
    }
}

function submitOrder(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Collect form data
    const orderData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        company: formData.get('company'),
        message: formData.get('message'),
        selectedTalents: Array.from(selectedTalents).map(t => JSON.parse(t))
    };
    
    console.log('Order submitted:', orderData);
    
    // Here you would typically send this data to your backend
    // For now, we'll just show a success message
    alert(`Merci ${orderData.firstName} ! Votre demande pour ${selectedTalents.size} talent(s) a été envoyée avec succès. Nous vous contacterons bientôt à ${orderData.email}.`);
    
    // Reset form and close modal
    form.reset();
    closeOrderModal();
    
    // Clear selections
    document.querySelectorAll('.talent-checkbox:checked').forEach(cb => {
        cb.checked = false;
    });
    selectedTalents.clear();
    updateFloatingButton();
}

// Close order modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
    const orderModal = document.getElementById('orderModal');
    if (orderModal) {
        orderModal.addEventListener('click', (e) => {
            if (e.target.id === 'orderModal') {
                closeOrderModal();
            }
        });
    }
    
    // Initialize hero slider swipe
    initHeroSliderSwipe();
    
    // Start hero slider auto-play
    startHeroSliderAutoPlay();
});

// Hero Slider System
let currentHeroSlide = 0;
const heroSlides = document.querySelectorAll('.hero-slide');
const totalHeroSlides = heroSlides.length;
let heroSliderInterval = null;

function changeHeroSlide(direction) {
    // Remove active class from current slide
    heroSlides[currentHeroSlide].classList.remove('active');
    
    // Calculate new slide index
    currentHeroSlide = (currentHeroSlide + direction + totalHeroSlides) % totalHeroSlides;
    
    // Add active class to new slide
    heroSlides[currentHeroSlide].classList.add('active');
    
    // Reset auto-play timer
    resetHeroSliderAutoPlay();
}

function startHeroSliderAutoPlay() {
    // Clear any existing interval
    if (heroSliderInterval) {
        clearInterval(heroSliderInterval);
    }
    
    // Start auto-play - advance to next slide every 6 seconds
    heroSliderInterval = setInterval(() => {
        changeHeroSlide(1);
    }, 6000);
}

function resetHeroSliderAutoPlay() {
    // Stop current auto-play
    if (heroSliderInterval) {
        clearInterval(heroSliderInterval);
    }
    // Restart auto-play
    startHeroSliderAutoPlay();
}

// Touch/Swipe support for hero slider
function initHeroSliderSwipe() {
    const sliderWrapper = document.getElementById('heroSlider');
    if (!sliderWrapper) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    let isDragging = false;
    
    sliderWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        isDragging = true;
    }, { passive: true });
    
    sliderWrapper.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        touchEndX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    sliderWrapper.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        handleSwipe();
    });
    
    // Mouse support for desktop
    sliderWrapper.addEventListener('mousedown', (e) => {
        touchStartX = e.screenX;
        isDragging = true;
        sliderWrapper.style.cursor = 'grabbing';
    });
    
    sliderWrapper.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        touchEndX = e.screenX;
    });
    
    sliderWrapper.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        sliderWrapper.style.cursor = 'grab';
        handleSwipe();
    });
    
    sliderWrapper.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            sliderWrapper.style.cursor = 'grab';
        }
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                heroSlides[currentHeroSlide].classList.remove('active');
                currentHeroSlide = (currentHeroSlide + 1 + totalHeroSlides) % totalHeroSlides;
                heroSlides[currentHeroSlide].classList.add('active');
            } else {
                // Swipe right - previous slide
                heroSlides[currentHeroSlide].classList.remove('active');
                currentHeroSlide = (currentHeroSlide - 1 + totalHeroSlides) % totalHeroSlides;
                heroSlides[currentHeroSlide].classList.add('active');
            }
            // Reset auto-play after manual swipe
            resetHeroSliderAutoPlay();
        }
        
        touchStartX = 0;
        touchEndX = 0;
    }
    
    // Set cursor style
    sliderWrapper.style.cursor = 'grab';
}

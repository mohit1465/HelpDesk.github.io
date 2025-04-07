const body = document.body;
const themeToggleBtn = document.getElementById('theme-toggle');
const logoimg = document.getElementById('logo');
const footerlogoimg = document.getElementById('footerLogo');

function toggleBox(event) {
    const outerBox = document.querySelector('.outer-box');
    outerBox.style.transform = outerBox.style.transform === 'translateY(0%)' 
                                ? 'translateY(100%)' 
                                : 'translateY(0%)';
}

window.addEventListener('click', function(event) {
    const iconLink = document.querySelector('.menu-icon');
    const outerBox = document.querySelector('.outer-box');

    if (!iconLink.contains(event.target) && !outerBox.contains(event.target)) {
        outerBox.style.transform = 'translateY(100%)';
    }

    window.addEventListener('scroll', function() {
        outerBox.style.transform = 'translateY(100%)';
    });
});

function toggleUserMenu() {
    const userMenu = document.getElementById('user-menu');
    
    // Toggle the visibility of the user menu
    if (userMenu.style.display === 'none' || userMenu.style.display === '') {
        userMenu.style.display = 'block';
    } else {
        userMenu.style.display = 'none';
    }

    // Hide the user menu if clicking outside
    document.addEventListener('click', function(event) {
        const isClickInside = userMenu.contains(event.target);
        const isButtonClick = event.target.closest('.icon-link'); // Check if clicked element is the icon

        if (!isClickInside && !isButtonClick) {
            userMenu.style.display = 'none';
        }
    });
}

function SectionMenu(section, element) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(sec => {
        sec.classList.add('hidden');
    });

    const selectedSection = document.getElementById(section);
    if (selectedSection) {
        selectedSection.classList.remove('hidden');
    }

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });

    let targetElement;
    if (element instanceof HTMLElement) {
        targetElement = element;
    } else {
        targetElement = document.getElementById(element);
    }

    if (targetElement) {
        targetElement.classList.add('active');
    }
}



document.getElementById('whatsNewTriggerBtn').addEventListener('click', function() {
    SectionMenu('whatsNew', document.getElementById('whatsNewLink'));
});

document.getElementById('ContactUsTriggerBtn').addEventListener('click', function() {
    SectionMenu('ContactUs', document.getElementById('ContactUsLink'));
});


function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
}

function setTheme(theme) {
    if (theme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        logoimg.src = 'assets/PrimeX logo dark.gif';
        footerlogoimg.src = 'assets/PrimeX logo dark.gif'
    } else {
        body.removeAttribute('data-theme');
        logoimg.src = 'assets/PrimeX logo light.gif';
        footerlogoimg.src = 'assets/PrimeX logo light.gif'
    }
}

window.onload = () => {
    if (isMobileDevice()) {
        document.body.innerHTML = '<h1>This website is not available on mobile devices. Please use a desktop.</h1>';
    }
    const savedTheme = localStorage.getItem('currentTheme') || 'dark';
    setTheme(savedTheme);
};

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');

    if (currentTheme === 'dark') {
        body.removeAttribute('data-theme');
        logoimg.src = 'assets/PrimeX logo light.gif';
        footerlogoimg.src = 'assets/PrimeX logo light.gif'
        localStorage.setItem('currentTheme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        logoimg.src = 'assets/PrimeX logo dark.gif';
        footerlogoimg.src = 'assets/PrimeX logo dark.gif'
        localStorage.setItem('currentTheme', 'dark');
    }
});











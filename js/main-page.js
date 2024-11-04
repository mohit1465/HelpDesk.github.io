const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;

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

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const logoimg = document.getElementById('logo');
    const footerlogoimg = document.getElementById('footerLogo');
    if (currentTheme === 'dark') {
        body.removeAttribute('data-theme');
        logoimg.src = 'assets/PrimeX logo light.gif';
        footerlogoimg.src = 'assets/PrimeX logo light.gif'
        localStorage.setItem('currentTheme', currentTheme);
    } else {
        body.setAttribute('data-theme', 'dark');
        logoimg.src = 'assets/PrimeX logo dark.gif';
        footerlogoimg.src = 'assets/PrimeX logo dark.gif'
        localStorage.setItem('currentTheme', currentTheme);
    }
});

function SectionMenu(section, element) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(sec => {
        sec.classList.add('hidden');
    });
    
    // Show the selected section
    const selectedSection = document.getElementById(section);
    if (selectedSection) {
        selectedSection.classList.remove('hidden');
    }

    // Remove 'active' class from all nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });

    // Add 'active' class to the clicked nav item
    element.classList.add('active');
}


document.addEventListener(`DOMContentLoaded`, onLoadfun);

function onLoadfun(){
  const body = document.body;
  const logoimg = document.getElementById('logo');
  const Theme = localStorage.getItem('currentTheme');
  if (Theme === 'dark') {
    body.setAttribute('data-theme', 'dark');
    logoimg.src = 'assets/PrimeX logo dark.gif'
  } else {
      body.removeAttribute('data-theme');
      logoimg.src = 'assets/PrimeX logo light.gif'
  }
}
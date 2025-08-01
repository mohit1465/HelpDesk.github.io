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

const feedback = {
    UI: null,
    Apps: null,
    ResponseTime: null,
    Experience: null,
  };
  
  // Function to handle emoji selection
  function handleEmojiSelection(event) {
    const selectedEmoji = event.target;
    const question = selectedEmoji.closest('.emoji-rating').getAttribute('data-question');
    const value = selectedEmoji.getAttribute('data-value');
  
    // Store the selected value in the feedback object
    feedback[question] = value;
  
    // Highlight the selected emoji
    const allEmojis = selectedEmoji.parentElement.querySelectorAll('.emoji');
    allEmojis.forEach(emoji => emoji.classList.remove('selected'));
    selectedEmoji.classList.add('selected');
  }
  
  // Attach click event listener to all emojis
  document.querySelectorAll('.emoji').forEach(emoji => {
    emoji.addEventListener('click', handleEmojiSelection);
  });
  
  // Disable emoji feedback after submission
  function disableEmojiFeedback() {
    const feedbackSections = document.querySelectorAll('.emoji-rating');
    feedbackSections.forEach(section => {
      section.style.opacity = '0.5';
      section.style.pointerEvents = 'none';  // Make emojis non-clickable
    });
  }
  
  
  thankbtn = document.getElementById('thank-you');
  thankmessage = document.getElementById('thank-you-main');

  document.getElementById('feedback-form').addEventListener('submit', function (event) {
    event.preventDefault();
    auth.onAuthStateChanged(user => {
      if (user) {
        db.collection('feedback').doc(user.email).get().then((doc) => {
          const feedbackData = doc.data();
  
          if (feedbackData && feedbackData.emojiSubmitted) {
            handleTextSubmission(user, feedbackData.textSubmissions);
          } else {
            handleFirstSubmission(user);
          }
        }).catch(error => {
          console.error('Error fetching feedback data:', error);
        });
      } else {
        thankmessage.innerHTML = ('Please log in to submit feedback. 🔑');
        thankbtn.classList.remove('hidden');
        setTimeout(() => {
          thankbtn.classList.add('hidden');
        }, 4000);
        
      }
    });
  });
  
  function handleFirstSubmission(user) {
    const userFeedback = {
      UI: feedback.UI,
      Apps: feedback.Apps,
      ResponseTime: feedback.ResponseTime,
      Experience: feedback.Experience,
      feedbackText1: document.getElementById('feedback').value,
      userID: user.uid,
      emojiSubmitted: true,
      textSubmissions: 1,
    };
  
    db.collection('feedback').doc('all').set({
      totalFeedbacks: firebase.firestore.FieldValue.increment(1),
      feedbackUI: firebase.firestore.FieldValue.increment(Number(feedback.UI)),
      feedbackApps: firebase.firestore.FieldValue.increment(Number(feedback.Apps)),
      feedbackResponseTime: firebase.firestore.FieldValue.increment(Number(feedback.ResponseTime)),
      feedbackExperience: firebase.firestore.FieldValue.increment(Number(feedback.Experience)),
    }, { merge: true });
  
    db.collection('feedback').doc(user.email).set(userFeedback).then(() => {
      disableEmojiFeedback();
      thankmessage.innerHTML = ('Thank you for your feedback! 💖');
      setTimeout(() => {
        thankbtn.classList.remove('hidden');
      }, 4000);
      thankbtn.classList.add('hidden');

    }).catch((error) => {
      console.error('Error submitting feedback:', error);
    });
  }
  
  function handleTextSubmission(user, currentTextSubmissions) {
    const comments = document.getElementById('feedback').value;
  
    if (currentTextSubmissions < 5) {
      const feedbackKey = `feedbackText${currentTextSubmissions + 1}`;
  
      db.collection('feedback').doc(user.email).update({
        [feedbackKey]: comments,
        textSubmissions: currentTextSubmissions + 1,
      }).then(() => {
      thankmessage.innerHTML = ('Text feedback submitted successfully! 👏');
      thankbtn.classList.remove('hidden');
      setTimeout(() => {
        thankbtn.classList.add('hidden');
      }, 4000);

      }).catch(error => {
        console.error('Error submitting text feedback:', error);
      });
    } else {
      thankmessage.innerHTML = ('You have reached the maximum of 5 text submissions. 👀');
      setTimeout(() => {
        thankbtn.classList.remove('hidden');
      }, 4000);
      thankbtn.classList.add('hidden');

    }
  }
  
  auth.onAuthStateChanged(user => {
    if (user) {
      db.collection('feedback').doc(user.email).get().then((doc) => {
        if (doc.exists && doc.data().emojiSubmitted) {
          disableEmojiFeedback();
        }
      }).catch(error => {
        console.error('Error fetching feedback data:', error);
      });
    }
  });
  
  function initializeFeedbackCollection() {
    db.collection('feedback').doc('all').get().then((doc) => {
      if (!doc.exists) {
        db.collection('feedback').doc('all').set({
          totalFeedbacks: 0,
          feedbackUI: 0,
          feedbackApps: 0,
          feedbackResponseTime: 0,
          feedbackExperience: 0,
        });
      }
    });
  }
  
  initializeFeedbackCollection();
  

const btn = document.getElementById('button');
const form = document.getElementById('form');

form.addEventListener('submit', function (event) {
  event.preventDefault();

  auth.onAuthStateChanged(user => {
    if (user) {
      btn.value = 'Sending...';

      const serviceID = 'default_service';
      const templateID = 'template_ggudpb1';

      emailjs.send(serviceID, templateID, {
        message: document.getElementById('message').value,
        reply_to: user.email
      }).then(() => {
        btn.value = 'Send Message';
        alert('Message sent successfully!');
      }, (err) => {
        btn.value = 'Send Message';
        alert('Error: ' + JSON.stringify(err));
      });
    } else {
      alert('Please log in to send a message.');
    }
  });
});


// --- What's New feature switcher with animated pill ==================================================================================================


function moveActivePill() {
  const wnHead = document.querySelector('.wn-head');
  const pill = wnHead.querySelector('.wn-active-pill');
  const activeBtn = wnHead.querySelector('.wn-switch-btn.active');
  if (!pill || !activeBtn) return;
  const isMobile = window.innerWidth <= 850 || getComputedStyle(wnHead).flexDirection === 'column';
  if (isMobile) {
    // Vertical tabs: animate pill's top/height
    const headRect = wnHead.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    const top = btnRect.top - headRect.top;
    const height = btnRect.height;
    pill.style.left = '0px';
    pill.style.width = '100%';
    pill.style.top = top + 'px';
    pill.style.height = height + 'px';
  } else {
    // Horizontal tabs: animate pill's left/width
    const headRect = wnHead.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    const left = btnRect.left - headRect.left;
    const width = btnRect.width;
    pill.style.left = left + 'px';
    pill.style.width = width + 'px';
    pill.style.top = '8px';
    pill.style.height = 'calc(100% - 16px)';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const wnBtns = document.querySelectorAll('.wn-switch-btn');
  const wnContents = document.querySelectorAll('.wn-feature-content');
  const previewImg = document.querySelector('.wn-preview-img img');
  
  // Define the image positions for each feature (translateY percentages)
  const imagePositions = {
    'resizer': '24%',
    'text': '12%',
    'image': '0%',
    'krish': '-12%',
    'notes': '-24%'
  };
  
  function updateImagePosition(feature) {
    if (previewImg && imagePositions[feature]) {
      previewImg.style.transform = `translateY(${imagePositions[feature]})`;
    }
  }
  
  wnBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      wnBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      wnContents.forEach(c => c.classList.add('hidden'));
      const feature = btn.getAttribute('data-feature');
      const showContent = document.querySelector('.wn-feature-content[data-feature="' + feature + '"]');
      if (showContent) showContent.classList.remove('hidden');
      updateImagePosition(feature);
      moveActivePill();
    });
  });
  
  // Initialize with the first feature
  const activeBtn = document.querySelector('.wn-switch-btn.active');
  if (activeBtn) {
    const initialFeature = activeBtn.getAttribute('data-feature');
    updateImagePosition(initialFeature);
  }
  
  moveActivePill();
  window.addEventListener('resize', moveActivePill);
});

// --- Cursor fade effect for wn-content ---
(function() {
  const wnContent = document.querySelector('.card-content');
  const cursorFade = wnContent ? wnContent.querySelector('.wn-cursor-fade') : null;
  if (!wnContent || !cursorFade) return;
  let mouseX = 0, mouseY = 0, visible = false, rafId;
  let fadeOpacity = 0, targetOpacity = 0;
  function animate() {
    // Animate opacity
    fadeOpacity += (targetOpacity - fadeOpacity) * 0.18;
    cursorFade.style.opacity = fadeOpacity;
    if (visible) {
      cursorFade.style.transform = `translate(${mouseX - 300}px, ${mouseY - 300}px)`;
    }
    rafId = requestAnimationFrame(animate);
  }
  wnContent.addEventListener('mousemove', e => {
    if (window.innerWidth <= 900) return; // Hide on mobile/tablet
    const rect = wnContent.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    visible = true;
    targetOpacity = 0.22;
  });
  wnContent.addEventListener('mouseleave', () => {
    visible = false;
    targetOpacity = 0;
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 900) {
      targetOpacity = 0;
    }
  });
  animate();
})();

const card = document.querySelector('.card');
const glowEffect = document.querySelector('.glow-effect');
const borderHighlight = document.querySelector('.border-highlight');

let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;
let animationFrame;

card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    if (!animationFrame) {
        animationFrame = requestAnimationFrame(updateGlow);
    }
});

card.addEventListener('mouseleave', () => {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
    glowEffect.style.opacity = '0';
    borderHighlight.style.setProperty('--mouse-x', '0px');
    borderHighlight.style.setProperty('--mouse-y', '0px');
});

function updateGlow() {
    const lerpFactor = 0.1;
    currentX += (mouseX - currentX) * lerpFactor;
    currentY += (mouseY - currentY) * lerpFactor;
    
    const glowElement = glowEffect.querySelector('::before') || glowEffect;
    glowEffect.style.setProperty('--x', `${currentX}px`);
    glowEffect.style.setProperty('--y', `${currentY}px`);
    
    const glowBefore = glowEffect.querySelector('::before');
    if (glowBefore) {
        glowBefore.style.transform = `translate(${currentX}px, ${currentY}px)`;
    } else {
        glowEffect.style.backgroundPosition = `${currentX}px ${currentY}px`;
    }
    
    const glowPseudo = document.createElement('style');
    glowPseudo.textContent = `
        .glow-effect::before {
            transform: translate(${currentX}px, ${currentY}px);
        }
    `;
    document.head.appendChild(glowPseudo);
    
    const borderStyle = document.createElement('style');
    borderStyle.textContent = `
        .border-highlight::before {
            background: conic-gradient(
                from ${Math.atan2(currentY - 200, currentX - 200) * 180 / Math.PI}deg at ${currentX}px ${currentY}px,
                #ff6200be 0deg,
                transparent 60deg,
                transparent 300deg,
                #ff6200be 360deg
            );
        }
    `;
    const existingStyle = document.querySelector('#border-style');
    if (existingStyle) existingStyle.remove();
    borderStyle.id = 'border-style';
    document.head.appendChild(borderStyle);
    
    animationFrame = requestAnimationFrame(updateGlow);
}

const style = document.createElement('style');
style.textContent = `
    .glow-effect::before {
        left: var(--x, 0);
        top: var(--y, 0);
    }
`;
document.head.appendChild(style);


// Card hover effect tags card ===================================================================================================

const tagcard = document.querySelectorAll('.tag-card');
const floatingElements = document.querySelectorAll('.float-1, .float-2, .float-3');

tagcard.forEach(tagcard => {
  tagcard.addEventListener('mousemove', (e) => {
      const rect = tagcard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      tagcard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
  });
  
  tagcard.addEventListener('mouseleave', () => {
      tagcard.style.transform = '';
  });
});

// Floating elements animation
floatingElements.forEach((element, index) => {
    element.style.animationDelay = `${index * 2}s`;
});

// Add ripple effect styles
const styletagcard = document.createElement('styletagcard');
styletagcard.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(styletagcard);


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


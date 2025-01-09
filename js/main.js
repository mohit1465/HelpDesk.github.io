auth.onAuthStateChanged(user => {
    const profileImage = document.querySelector('.profile-header img');
    if (user) {
        db.collection('users').doc(user.uid).get().then(doc => {
            if (doc.exists) {
                const userData = doc.data();

                profileImage.style.display = 'none';

                const firstLetter = userData.name.charAt(0).toUpperCase();
                const nameLetterElement = document.getElementById('profile-initial');
                nameLetterElement.textContent = firstLetter;

                document.getElementById('user-name-email').innerHTML = `
                    <h2 style="margin-bottom:0px;" id='userData'>${userData.name}</h2>
                    <p style="margin-top:5px;" id='userEmail'>Email: ${userData.email}</p>`;

                document.getElementById('auth-check-option').innerHTML = `
                    <button onclick="logoutUser()" class="edit-profile" style="margin: 1px 0;">Logout</button>`;

            

            }
        }).catch(error => {
            console.error('Error fetching user data:', error);
            alert('Error fetching user data.');
        });
    } else {
      profileImage.style.display = 'block';
      document.getElementById('profile-initial').style.display = 'none';
      
        document.getElementById('user-name-email').innerHTML = `
            <h2 id='login-magic' onclick='redirectToLogin()' style='margin-bottom: 0px'>Login to See, <span>Magic</span></h2>`;
        document.getElementById('auth-check-option').innerHTML = `
            <span id="login-signup" onclick="redirectToLogin()" class="edit-profile" style="margin: 8px 0;">Login | signup</span>`;
        document.getElementById('skills-section').style.display = 'none';
    }
});

function logoutUser() {
    auth.signOut().then(() => {
        const currentTheme = body.getAttribute('data-theme');
        localStorage.setItem('currentTheme', currentTheme);
        alert("Logged out successfully!");
        window.location.href = '';
    });
}

function redirectToLogin() {
    const currentTheme = body.getAttribute('data-theme');
    const pageName = window.location.pathname.split("/").pop();
    localStorage.setItem('lastPage', pageName);
    localStorage.setItem('currentTheme', currentTheme);
    window.location.href = 'login-signup.html';
}

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

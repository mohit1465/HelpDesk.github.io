auth.onAuthStateChanged(user => {
    if (user) {
        db.collection('users').doc(user.uid).get().then(doc => {
            if (doc.exists) {
                const userData = doc.data();
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
  
  // Handle form submission for feedback
  document.getElementById('feedback-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission
  
    // Check if the user is logged in
    auth.onAuthStateChanged(user => {
      if (user) {
        // Check if the user has already submitted emoji feedback
        db.collection('feedback').doc(user.email).get().then((doc) => {
          const feedbackData = doc.data();
  
          if (feedbackData && feedbackData.emojiSubmitted) {
            // If emoji feedback has already been submitted, only allow text submission
            handleTextSubmission(user, feedbackData.textSubmissions);
          } else {
            // If this is the first submission, allow both emoji and text feedback
            handleFirstSubmission(user);
          }
        }).catch(error => {
          console.error('Error fetching feedback data:', error);
        });
      } else {
        alert('Please log in to submit feedback.');
      }
    });
  });
  
  // Handle first-time submission of both emoji and text feedback
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
  
    // Update the 'all' section with cumulative scores
    db.collection('feedback').doc('all').set({
      totalFeedbacks: firebase.firestore.FieldValue.increment(1),
      feedbackUI: firebase.firestore.FieldValue.increment(Number(feedback.UI)),
      feedbackApps: firebase.firestore.FieldValue.increment(Number(feedback.Apps)),
      feedbackResponseTime: firebase.firestore.FieldValue.increment(Number(feedback.ResponseTime)),
      feedbackExperience: firebase.firestore.FieldValue.increment(Number(feedback.Experience)),
    }, { merge: true });
  
    // Add feedback to the user's email document
    db.collection('feedback').doc(user.email).set(userFeedback).then(() => {
      // Disable further emoji submissions and allow only text feedback
      disableEmojiFeedback();
      alert('Feedback submitted successfully!');
    }).catch((error) => {
      console.error('Error submitting feedback:', error);
    });
  }
  
  // Handle subsequent text-only submissions
  function handleTextSubmission(user, currentTextSubmissions) {
    const comments = document.getElementById('feedback').value;
  
    // Check if the user has reached the maximum of 5 text submissions
    if (currentTextSubmissions < 5) {
      const feedbackKey = `feedbackText${currentTextSubmissions + 1}`;
  
      // Update the user's feedback with the new text submission
      db.collection('feedback').doc(user.email).update({
        [feedbackKey]: comments,
        textSubmissions: currentTextSubmissions + 1,
      }).then(() => {
        alert('Text feedback submitted successfully!');
      }).catch(error => {
        console.error('Error submitting text feedback:', error);
      });
    } else {
      alert('You have reached the maximum of 5 text submissions.');
    }
  }
  
  // Disable emoji feedback on page load if the user has already submitted
  auth.onAuthStateChanged(user => {
    if (user) {
      db.collection('feedback').doc(user.email).get().then((doc) => {
        if (doc.exists && doc.data().emojiSubmitted) {
          disableEmojiFeedback();  // Disable emoji feedback if already submitted
        }
      }).catch(error => {
        console.error('Error fetching feedback data:', error);
      });
    }
  });
  
  // Initialize feedback collection for the first time if not present
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
  
  // Call this function on page load to ensure feedback collection is initialized
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

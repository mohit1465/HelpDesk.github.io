// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAB-F6Vu8huQ0zUMWO6j5XTHwfka8Eldi8",
    authDomain: "todo-6dfe7.firebaseapp.com",
    projectId: "todo-6dfe7",
    storageBucket: "todo-6dfe7.appspot.com",
    messagingSenderId: "895771140986",
    appId: "1:895771140986:web:3429273093e952dd21ecc3",
    measurementId: "G-2CNJB4X535"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', function () {
    const todoInput = document.getElementById('todo-input');
    const todoDate = document.getElementById('todo-date');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const holidayList = document.getElementById('holiday-list');

    addBtn.addEventListener('click', addTask);

    // Function to add a task
    async function addTask() {
        const taskText = todoInput.value.trim();
        const taskDate = todoDate.value;

        if (taskText !== '' && taskDate !== '') {
            const taskData = {
                text: taskText,
                dueDate: taskDate,
                status: 'Undone',
                createdAt: new Date()
            };

            // Save task to Firestore and get the document reference
            const taskRef = await saveTaskToFirestore(taskData);
            
            // Add the task item to the list
            addTaskToUI(taskText, taskDate, taskRef.id, 'Undone');

            // Clear input fields
            todoInput.value = '';
            todoDate.value = '';

            // Schedule notifications for the task
            scheduleNotifications(taskData.dueDate);

            // Load tasks
            loadTasks();
        } else {
            alert('Please enter both task and due date!');
        }
    }

    // Function to save tasks to Firestore
    async function saveTaskToFirestore(taskData) {
        try {
            const docRef = await addDoc(collection(db, 'tasks'), taskData);
            return docRef;  // Return the reference to the newly created document
        } catch (error) {
            console.error('Error adding document: ', error);
        }
    }

    // Function to toggle the status of the task
    window.toggleStatus = async function (taskId, button) {
        const taskRef = doc(db, 'tasks', taskId);
        const newStatus = button.textContent === 'Done' ? 'Undone' : 'Done';
        
        // Update Firestore with the new status
        await updateDoc(taskRef, { status: newStatus });
        
        // Update button text and UI accordingly
        button.textContent = newStatus === 'Done' ? 'Undone' : 'Done';
    };

    // Function to load tasks from Firestore and display them sorted by due date
    async function loadTasks() {
        todoList.innerHTML = '';  // Clear the existing list
        const tasksRef = collection(db, 'tasks');
        const tasksSnapshot = await getDocs(tasksRef);

        // Sort tasks by due date
        const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        // Add sorted tasks to the list
        tasks.forEach(task => {
            addTaskToUI(task.text, task.dueDate, task.id, task.status);
        });
    }

    // Function to add task item to UI
    function addTaskToUI(taskText, taskDate, taskId, status) {
        const listItem = document.createElement('li');
        listItem.innerHTML = `${taskText} - <em>Due: ${taskDate}</em>
            <button class="status-btn" onclick="toggleStatus('${taskId}', this)">${status}</button>`;
        todoList.appendChild(listItem);
    }

    // Function to load holidays from Firestore
    async function loadHolidays() {
        holidayList.innerHTML = '';  // Clear the existing list
        const holidaysRef = collection(db, 'holidays');
        const holidaysSnapshot = await getDocs(holidaysRef);
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        // Format the date to compare (YYYY-MM-DD)
        const todayString = today.toISOString().split('T')[0];

        // Filter and add holidays within today and the next 30 days
        holidaysSnapshot.forEach(doc => {
            const holidayData = doc.data();
            const holidayDate = new Date(holidayData.date);
            const holidayString = holidayDate.toISOString().split('T')[0];  // Format for comparison

            // Check if the holiday date is today or within the next 30 days
            if (holidayString >= todayString && holidayDate <= thirtyDaysFromNow) {
                const listItem = document.createElement('li');
                listItem.innerHTML = `${holidayData.name} - <em>On: ${holidayData.date}</em>
                    <button class="status-btn" onclick="toggleHolidayStatus('${doc.id}', this)">${holidayData.status || 'Undone'}</button>`;
                holidayList.appendChild(listItem);
            }
        });
    }

    // Function to toggle the status of the holiday
    window.toggleHolidayStatus = async function (holidayId, button) {
        const holidayRef = doc(db, 'holidays', holidayId);
        const newStatus = button.textContent === 'Done' ? 'Undone' : 'Done';
        
        // Update Firestore with the new status
        await updateDoc(holidayRef, { status: newStatus });

        // Update button text and UI accordingly
        button.textContent = newStatus === 'Done' ? 'Undone' : 'Done';

        // Optionally reload holidays if you want to reflect status changes
        loadHolidays(); // Uncomment this line if you want to reload holidays every time
    };

    // Function to schedule notifications for tasks
    function scheduleNotifications(dueDate) {
        const eventDate = new Date(dueDate);
        const notifyStartDate = new Date(eventDate);
        notifyStartDate.setDate(notifyStartDate.getDate() - 48);  // 48 days before the event

        // Set an interval to notify every 5 hours (5 * 60 * 60 * 1000 ms)
        const fiveHours = 5 * 60 * 60 * 1000;

        // Calculate the notification time and set it
        for (let i = 0; i <= 48; i++) {
            const notificationTime = new Date(notifyStartDate.getTime() + i * fiveHours);
            if (notificationTime > new Date()) {
                scheduleNotification(`Upcoming Task Reminder!`, {
                    body: `Don't forget about your task due on ${eventDate.toLocaleDateString()}.`,
                    time: notificationTime
                });
            }
        }
    }

    // Function to schedule a notification
    function scheduleNotification(title, options) {
        if (Notification.permission === 'granted') {
            const notification = new Notification(title, options);
            // Close the notification after a specified duration
            setTimeout(() => {
                notification.close();
            }, 10000);  // Duration in milliseconds (10 seconds)
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    scheduleNotification(title, options);
                }
            });
        }
    }

    // Initial load of tasks and holidays
    loadTasks();
    loadHolidays();
});



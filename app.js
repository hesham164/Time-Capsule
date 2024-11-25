document.addEventListener('DOMContentLoaded', function () {
    const eventForm = document.getElementById('event-form');
    const logoutBtn = document.getElementById('logout-btn');
    let savedPassword = sessionStorage.getItem('password'); // Retrieve the saved password from session storage

    // Ensure user is logged in
    window.auth.onAuthStateChanged((user) => {
        if (!user) {
            alert('You need to log in to access this page.');
            window.location.href = 'login.html';
        }
    });

    // Function to convert file to Base64
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    }

    // Add event
    eventForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const eventDate = document.getElementById('event-date').value;
        const eventDesc = document.getElementById('event-desc').value;

        const imageFiles = document.getElementById('event-images').files;
        const videoFiles = document.getElementById('event-videos').files;

        const images = [];
        const videos = [];

        for (let i = 0; i < imageFiles.length; i++) {
            const base64Image = await fileToBase64(imageFiles[i]);
            images.push(base64Image);
        }

        for (let i = 0; i < videoFiles.length; i++) {
            const base64Video = await fileToBase64(videoFiles[i]);
            videos.push(base64Video);
        }

        const userId = window.auth.currentUser.uid;

        window.push(window.ref(window.db, 'events/' + userId), {
            date: eventDate,
            description: eventDesc,
            images: images,
            videos: videos,
            password: savedPassword // Save the password along with the event details
        }).then(() => {
            alert('Event added successfully!');
            console.log('Event added:', { date: eventDate, description: eventDesc, images: images, videos: videos, password: savedPassword });
        }).catch((error) => {
            console.error('Error adding event:', error);
            alert('Error adding event: ' + error.message);
        });

        eventForm.reset();
    });

    // Log out
    logoutBtn.addEventListener('click', function () {
        window.signOut(window.auth).then(() => {
            alert('Logged out successfully.');
            window.location.href = 'login.html';
        }).catch((error) => {
            console.error('Error logging out:', error);
            alert('Error logging out: ' + error.message);
        });
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const eventForm = document.getElementById('event-form');
    const logoutBtn = document.getElementById('logout-btn');

    // Ensure user is logged in
    window.auth.onAuthStateChanged((user) => {
        if (!user) {
            alert('You need to log in to access this page.');
            window.location.href = 'login.html';
        }
    });

    // Add event
    eventForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const eventDate = document.getElementById('event-date').value;
        const eventDesc = document.getElementById('event-desc').value;

        const userId = window.auth.currentUser.uid;

        window.push(window.ref(window.db, 'events/' + userId), {
            date: eventDate,
            description: eventDesc
        }).then(() => {
            alert('Event added successfully!');
            console.log('Event added:', { date: eventDate, description: eventDesc });
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

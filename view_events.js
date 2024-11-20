document.addEventListener('DOMContentLoaded', function () {
    const eventList = document.getElementById('event-list');
    const eventCount = document.getElementById('event-count');

    // Ensure user is logged in
    window.auth.onAuthStateChanged((user) => {
        if (user) {
            // Display events from database
            window.onValue(window.ref(window.db, 'events/' + user.uid), snapshot => {
                const events = [];
                snapshot.forEach(childSnapshot => {
                    const event = childSnapshot.val();
                    if (event.date && event.description) {
                        events.push(event);
                    } else {
                        console.warn('Event data missing date or description:', event);
                    }
                });

                // Sort events by date
                events.sort((a, b) => new Date(a.date) - new Date(b.date));

                // Display events and event count
                eventList.innerHTML = '';
                events.forEach(event => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `<span class="event-date">${event.date}</span><p class="event-desc">${event.description}</p>`;
                    eventList.appendChild(listItem);
                });

                const eventTotal = events.length;
                const remainingEvents = 66 - eventTotal;
                eventCount.textContent = `Remaining Events: ${remainingEvents}`;

                // Redirect if total number of events is 3 or more
                if (eventTotal == 66) {
                    alert('You have 66 events! Redirecting to another page...');
                    window.location.href = 'congratulations.html';
                }
            });
        } else {
            window.location.href = 'login.html';
        }
    });
});

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
                    const eventId = childSnapshot.key;
                    if (event.date && event.description) {
                        events.push({ ...event, id: eventId });
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
                    listItem.innerHTML = `
                        <span class="event-date">${event.date}</span>
                        <p class="event-desc">${event.description}</p>
                        <button class="edit-btn" data-id="${event.id}">Edit</button>
                        <button class="delete-btn" data-id="${event.id}">Delete</button>
                    `;
                    eventList.appendChild(listItem);
                });

                const eventTotal = events.length;
                const remainingEvents = 66 - eventTotal;
                eventCount.textContent = `Remaining Events: ${remainingEvents}`;

                // Redirect if total number of events is 66
                if (eventTotal === 66) {
                    alert('You have 66 events! Redirecting to another page...');
                    setTimeout(() => {
                        window.location.href = 'congratulations.html';
                    }, 2000); // Give the user some time to see the notification
                }

                // Add event listeners for edit and delete buttons
                document.querySelectorAll('.edit-btn').forEach(button => {
                    button.addEventListener('click', handleEditEvent);
                });
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', handleDeleteEvent);
                });
            });
        } else {
            alert('You need to log in to view events.');
            window.location.href = 'login.html';
        }
    });

    async function handleEditEvent(e) {
        const eventId = e.target.dataset.id;
        const eventRef = window.ref(window.db, 'events/' + window.auth.currentUser.uid + '/' + eventId);

        try {
            // Fetch current event data
            const snapshot = await window.get(eventRef);
            if (!snapshot.exists()) {
                alert('Event not found!');
                return;
            }
            const currentEvent = snapshot.val();

            // Create a form for editing event
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3>Edit Event</h3>
                    <form id="edit-form">
                        <label for="event-date">Date:</label>
                        <input type="date" id="event-date" value="${currentEvent.date}" required />
                        
                        <label for="event-desc">Description:</label>
                        <textarea id="event-desc" rows="3" required>${currentEvent.description}</textarea>
                        
                        <button type="submit">Save</button>
                        <button type="button" id="cancel-btn">Cancel</button>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);

            // Handle form submission
            const form = document.getElementById('edit-form');
            form.addEventListener('submit', async (ev) => {
                ev.preventDefault();
                const eventDate = document.getElementById('event-date').value;
                const eventDesc = document.getElementById('event-desc').value;

                if (eventDate && eventDesc) {
                    try {
                        await window.update(eventRef, { date: eventDate, description: eventDesc });
                        alert('Event updated successfully!');
                        modal.remove();
                    } catch (error) {
                        alert('Error updating event: ' + error.message);
                    }
                }
            });

            // Handle cancel button
            document.getElementById('cancel-btn').addEventListener('click', () => {
                modal.remove();
            });
        } catch (error) {
            alert('Error fetching event: ' + error.message);
        }
    }

    async function handleDeleteEvent(e) {
        const eventId = e.target.dataset.id;
        try {
            await window.remove(window.ref(window.db, 'events/' + window.auth.currentUser.uid + '/' + eventId));
            alert('Event deleted successfully!');
        } catch (error) {
            alert('Error deleting event: ' + error.message);
        }
    }
});

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

                // Display event buttons
                eventList.innerHTML = '';
                events.forEach(event => {
                    const listItem = document.createElement('li');
                    const button = document.createElement('button');
                    button.className = 'event-button';
                    button.dataset.id = event.id;
                    button.textContent = `Event on ${event.date}`;
                    button.addEventListener('click', () => toggleEventDetails(event.id, event));
                    listItem.appendChild(button);
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
            });
        } else {
            alert('You need to log in to view events.');
            window.location.href = 'login.html';
        }
    });
// Function to toggle event details
function toggleEventDetails(eventId, event) {
    const buttons = document.querySelectorAll('.event-button');
    const parentLis = document.querySelectorAll('#event-list li');

    buttons.forEach(button => {
        const parentLi = button.closest('li'); // Get the parent <li> element
        let placeholder = parentLi.querySelector('.event-placeholder'); // Find or create placeholder

        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.className = 'event-placeholder';
            parentLi.insertBefore(placeholder, button);
        }

        if (button.dataset.id === eventId) {
            button.classList.toggle('expanded');
            if (button.classList.contains('expanded')) {
                const imagesHTML = displayMedia(event.images, 'image', event.id);
                const videosHTML = displayMedia(event.videos, 'video', event.id);
                button.innerHTML = `
                    <h3>Event on ${event.date}</h3>
                    <p>${event.description}</p>
                    <div class="media-thumb">${imagesHTML}${videosHTML}</div>
                    <button class="edit-btn" data-id="${event.id}">Edit</button>
                    <button class="delete-btn" data-id="${event.id}">Delete</button>
                    <button class="collapse-btn">Collapse</button>
                `;

                button.querySelector('.collapse-btn').addEventListener('click', () => toggleEventDetails(event.id, event));
                button.querySelector('.edit-btn').addEventListener('click', handleEditEvent);
                button.querySelector('.delete-btn').addEventListener('click', handleDeleteEvent);
                button.querySelectorAll('.delete-image-btn').forEach(deleteButton => deleteButton.addEventListener('click', handleDeleteImage));
                button.querySelectorAll('.delete-video-btn').forEach(deleteButton => deleteButton.addEventListener('click', handleDeleteVideo));

                // Ensure the expanded event remains in its original position
                parentLi.appendChild(button);
                parentLi.classList.add('expanded');
                placeholder.classList.add('expanded');
                placeholder.style.height = `${button.scrollHeight}px`; // Set placeholder height to match expanded content

                // Hide other events
                parentLis.forEach(li => {
                    if (li !== parentLi) {
                        li.classList.add('hidden-container');
                    }
                });

                button.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                button.textContent = `Event on ${event.date}`;
                parentLi.classList.remove('expanded'); // Ensure expanded class is removed from parent <li>
                placeholder.classList.remove('expanded');
                placeholder.style.height = '0'; // Reset placeholder height

                // Show other events
                parentLis.forEach(li => {
                    if (li !== parentLi) {
                        li.classList.remove('hidden-container');
                    }
                });
            }
        } else {
            button.classList.remove('expanded');
            button.textContent = `Event on ${button.textContent.split(' on ')[1]}`;
            parentLi.classList.remove('expanded'); // Ensure expanded class is removed from non-clicked events

            // Remove placeholder
            placeholder.classList.remove('expanded');
            placeholder.style.height = '0'; // Reset placeholder height
        }
    });
}


// Function to display media (images and videos)
function displayMedia(mediaArray, type, eventId = null) {
    if (!mediaArray || mediaArray.length === 0) return '';
    return mediaArray.map((media, index) => {
        if (type === 'image') {
            return `
                <div class="media-thumb">
                    <img src="${media}" alt="Event Image" />
                    <a href="${media}" download>Download</a>
                    ${eventId ? `<button class="delete-image-btn" data-event-id="${eventId}" data-index="${index}">Delete Image</button>` : ''}
                </div>`;
        } else if (type === 'video') {
            return `
                <div class="media-thumb">
                    <video controls><source src="${media}" type="video/mp4">Your browser does not support the video tag.</video>
                    <a href="${media}" download>Download</a>
                    ${eventId ? `<button class="delete-video-btn" data-event-id="${eventId}" data-index="${index}">Delete Video</button>` : ''}
                </div>`;
        }
        return '';
    }).join('');
}




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
            currentEvent.images = currentEvent.images || [];
            currentEvent.videos = currentEvent.videos || [];

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
                        
                        <label for="event-images">Add Images:</label>
                        <input type="file" id="event-images" accept="image/*" multiple>
                        
                        <label for="event-videos">Add Videos:</label>
                        <input type="file" id="event-videos" accept="video/*" multiple>

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
                const imageFiles = document.getElementById('event-images').files;
                const videoFiles = document.getElementById('event-videos').files;

                const newImages = [];
                const newVideos = [];

                for (let i = 0; i < imageFiles.length; i++) {
                    const base64Image = await fileToBase64(imageFiles[i]);
                    newImages.push(base64Image);
                }

                for (let i = 0; i < videoFiles.length; i++) {
                    const base64Video = await fileToBase64(videoFiles[i]);
                    newVideos.push(base64Video);
                }

                if (eventDate && eventDesc) {
                    try {
                        const updatedEvent = {
                            date: eventDate,
                            description: eventDesc,
                            images: currentEvent.images.concat(newImages),
                            videos: currentEvent.videos.concat(newVideos),
                        };
                        await window.update(eventRef, updatedEvent);
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

    async function handleDeleteImage(e) {
        const eventId = e.target.dataset.eventId;
        const imageIndex = e.target.dataset.index;
        const eventRef = window.ref(window.db, 'events/' + window.auth.currentUser.uid + '/' + eventId);

        try {
            // Fetch current event data
            const snapshot = await window.get(eventRef);
            if (!snapshot.exists()) {
                alert('Event not found!');
                return;
            }
            const currentEvent = snapshot.val();

            // Remove image from event
            currentEvent.images.splice(imageIndex, 1);

            // Update event in database
            await window.update(eventRef, { images: currentEvent.images });
            alert('Image deleted successfully!');
        } catch (error) {
            alert('Error deleting image: ' + error.message);
        }
    }

    async function handleDeleteVideo(e) {
    const eventId = e.target.dataset.eventId;
    const videoIndex = e.target.dataset.index;
    const eventRef = window.ref(window.db, 'events/' + window.auth.currentUser.uid + '/' + eventId);

    try {
        // Fetch current event data
        const snapshot = await window.get(eventRef);
        if (!snapshot.exists()) {
            alert('Event not found!');
            return;
        }
        const currentEvent = snapshot.val();

        // Remove video from event
        currentEvent.videos.splice(videoIndex, 1);

        // Update event in database
        await window.update(eventRef, { videos: currentEvent.videos });
        alert('Video deleted successfully!');
    } catch (error) {
        alert('Error deleting video: ' + error.message);
    }
}




// Function to convert file to Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}
});
``
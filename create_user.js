document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('create-user-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Basic email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        window.createUserWithEmailAndPassword(window.auth, email, password)
            .then((userCredential) => {
                alert('User created successfully! Please log in.');
                console.log('User created:', userCredential.user);
                window.location.href = 'login.html';
            })
            .catch((error) => {
                console.error('Error creating user:', error);
                handleAuthError(error);
            });
    });

    function handleAuthError(error) {
        switch (error.code) {
            case 'auth/email-already-in-use':
                alert('This email is already in use. Please use a different email or log in.');
                break;
            case 'auth/invalid-email':
                alert('Invalid email address. Please check the format and try again.');
                break;
            case 'auth/operation-not-allowed':
                alert('Email/password accounts are not enabled. Please contact support.');
                break;
            case 'auth/weak-password':
                alert('The password is too weak. Please choose a stronger password.');
                break;
            default:
                alert('Error creating user: ' + error.message);
        }
    }
});

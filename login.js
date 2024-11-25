document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    let currentUser = null;
    let savedPassword = null; // Variable to store the password

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Basic email validation
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            window.signInWithEmailAndPassword(window.auth, email, password)
                .then((userCredential) => {
                    alert('Logged in successfully!');
                   // console.log('User logged in:', userCredential.user);
                    
                    // Save the username and password in session storage
                    sessionStorage.setItem('username', userCredential.user.email);
                    sessionStorage.setItem('password', password);

                    currentUser = userCredential.user;
                    savedPassword = password; // Save the password in the variable

                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    console.error('Error logging in:', error);
                    handleAuthError(error);
                });
        });

        function handleAuthError(error) {
            switch (error.code) {
                case 'auth/invalid-email':
                    alert('Invalid email address. Please check the format and try again.');
                    break;
                case 'auth/user-disabled':
                    alert('This account has been disabled. Please contact support.');
                    break;
                case 'auth/user-not-found':
                    alert('No user found with this email. Please sign up.');
                    break;
                case 'auth/wrong-password':
                    alert('Incorrect password. Please try again.');
                    break;
                default:
                    alert('Error logging in: Please create an account.');
            }
        }
    } else {
        console.error('Login form not found');
    }
});

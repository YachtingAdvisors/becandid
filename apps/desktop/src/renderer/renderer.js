/**
 * Login window renderer logic.
 */

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signInBtn = document.getElementById('sign-in-btn');
const errorDiv = document.getElementById('error');

signInBtn.addEventListener('click', handleSignIn);
passwordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSignIn();
});

async function handleSignIn() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError('Please enter your email and password.');
    return;
  }

  signInBtn.disabled = true;
  signInBtn.textContent = 'Signing in...';
  hideError();

  try {
    const result = await window.becandid.signIn(email, password);
    if (result.success) {
      window.becandid.onAuthSuccess();
    } else {
      showError(result.error || 'Sign in failed. Check your credentials.');
      signInBtn.disabled = false;
      signInBtn.textContent = 'Sign In';
    }
  } catch (err) {
    showError('Connection failed. Please check your internet.');
    signInBtn.disabled = false;
    signInBtn.textContent = 'Sign In';
  }
}

function showError(msg) {
  errorDiv.textContent = msg;
  errorDiv.style.display = 'block';
}

function hideError() {
  errorDiv.style.display = 'none';
}

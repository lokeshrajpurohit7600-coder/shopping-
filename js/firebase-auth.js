// ====================================================================================
// RAMDEV ENTERPRISE — FIREBASE AUTHENTICATION ENGINE (v10 MODULAR VIA CDN)
// ====================================================================================
// File: js/firebase-auth.js
// Description: Real email verification & authentication controller using Firebase v10
// Features:
// 1. Real email verification with sendEmailVerification()
// 2. Unverified account blocking with signOut() & Resend verification email prompt
// 3. Uniform "Invalid User ID or Password" security error message
// 4. Client-side Disposable/temporary email domain blocklist
// 5. Central route guard via onAuthStateChanged()
// 6. Complete session cleanup on signOut()
// ====================================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Check Firebase configuration
const config = window.FIREBASE_CONFIG;
const isConfigured = config && config.apiKey && config.apiKey !== "YOUR_API_KEY" && config.projectId !== "YOUR_PROJECT_ID";

let auth = null;
if (isConfigured) {
  try {
    const app = initializeApp(config);
    auth = getAuth(app);
    window.firebaseAuth = auth;
    console.log("✔ Firebase initialized successfully.");
  } catch (err) {
    console.error("Firebase Initialization Error:", err);
  }
} else {
  console.warn("⚠️ Firebase configuration is pending in js/firebase-config.js. Please paste your Firebase credentials.");
}

// ====================================================================================
// DISPOSABLE / TEMPORARY EMAIL BLOCKLIST
// ====================================================================================
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com', 'tempmail.com', 'temp-mail.org', 'temp-mail.io',
  '10minutemail.com', '10minutemail.net', 'guerrillamail.com', 'guerrillamailblock.com',
  'sharklasers.com', 'grr.la', 'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.net',
  'throwawaymail.com', 'yopmail.com', 'yopmail.fr', 'yopmail.net',
  'trashmail.com', 'trashmail.me', 'trashmail.net', 'dispostable.com',
  'getairmail.com', 'fakemailgenerator.com', 'maildrop.cc', 'mohmal.com',
  'crazymailing.com', 'mytemp.email', 'emailondeck.com', 'tempail.com',
  'burnermail.io', 'inboxkitten.com', 'nada.ltd', 'getnada.com',
  'generator.email', 'fakeinbox.com', 'throwaway.email'
]);

export function isDisposableEmail(email) {
  if (!email || !email.includes('@')) return false;
  const parts = email.split('@');
  const domain = parts[parts.length - 1].trim().toLowerCase();
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}
window.isDisposableEmail = isDisposableEmail;

// ====================================================================================
// 1. SIGNUP: createUserWithEmailAndPassword + sendEmailVerification
// ====================================================================================
window.submitGateSignup = async function() {
  const name = document.getElementById('gateRegName').value.trim();
  const phone = document.getElementById('gateRegPhone').value.trim();
  const firm = document.getElementById('gateRegFirm').value.trim();
  const emailInput = document.getElementById('gateRegEmail');
  const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
  const pass = document.getElementById('gateRegPass').value;
  const portal = document.getElementById('gateRegPortal').value;

  if (!name || !firm) {
    alert('Please fill in all mandatory fields.');
    return;
  }
  if (!email) {
    alert('Please enter your email address.');
    if (emailInput) emailInput.focus();
    return;
  }

  // Disposable email check
  if (isDisposableEmail(email)) {
    alert('Temporary / disposable emails (jaise mailinator, tempmail) are not allowed. Please enter a valid permanent email address.');
    if (emailInput) {
      emailInput.classList.add('has-error');
      emailInput.focus();
    }
    return;
  }

  if (!pass || pass.length < 6) {
    alert('Password must have at least 6 characters.');
    return;
  }

  if (!auth) {
    alert('⚠️ Firebase Config Missing!\n\nPlease paste your Firebase Web credentials in js/firebase-config.js to enable real email verification.');
    return;
  }

  try {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    // Send real verification email via Google's servers
    await sendEmailVerification(user);

    // Save extra profile attributes keyed by UID in local storage
    const profile = { name, phone, firm, email, portal };
    localStorage.setItem('user_profile_' + user.uid, JSON.stringify(profile));
    localStorage.setItem('last_registered_email', email);

    // Sign out immediately so unverified session is never active
    await signOut(auth);

    // Show Email Verification waiting card
    const emailText = document.getElementById('gateOtpEmailText');
    if (emailText) emailText.textContent = email;

    document.getElementById('gateSignupView').style.display = 'none';
    document.getElementById('gateOtpView').style.display = 'block';

    if (window.showToast) {
      window.showToast('✉️ Verification link aapki email par bheja gaya hai.');
    }
  } catch (err) {
    console.error('Firebase Signup Error:', err);
    if (err.code === 'auth/email-already-in-use') {
      alert('An account with this Email already exists. Please log in.');
      window.showGateLoginView();
    } else if (err.code === 'auth/weak-password') {
      alert('Password must be at least 6 characters.');
    } else if (err.code === 'auth/invalid-email') {
      alert('Invalid email address format.');
    } else {
      alert('Registration error: ' + (err.message || 'Please check your inputs and try again.'));
    }
  }
};

// ====================================================================================
// 2. RESEND VERIFICATION EMAIL
// ====================================================================================
window.resendVerificationEmail = async function() {
  const emailTextEl = document.getElementById('gateOtpEmailText');
  const email = (emailTextEl && emailTextEl.textContent.trim()) || localStorage.getItem('last_registered_email');
  
  if (!email || email === 'user@example.com') {
    alert('No pending registration email found. Please sign up or log in.');
    window.showGateSignupView();
    return;
  }

  if (!auth) {
    alert('⚠️ Firebase Config Missing in js/firebase-config.js');
    return;
  }

  const pass = prompt(`Kripya apna password darj karein (${email}) par naya verification link bhejne ke liye:`);
  if (!pass) return;

  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    if (cred.user.emailVerified) {
      alert('Aapka email pehle hi verify ho chuka hai! Aap direct log in kar sakte hain.');
      await signOut(auth);
      window.showGateLoginView();
      return;
    }

    await sendEmailVerification(cred.user);
    await signOut(auth);
    alert(`✅ Naya verification link bhej diya gaya hai (${email}) par! Kripya inbox ya spam folder check karein.`);
  } catch (err) {
    console.error('Resend error:', err);
    alert('Verification link bhejne me error: ' + (err.message || 'Invalid password'));
  }
};

// Helper to resend directly from login screen error banner
window.resendLoginVerificationEmail = async function(email, pass) {
  if (!auth) {
    alert('⚠️ Firebase Config Missing in js/firebase-config.js');
    return;
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    if (cred.user.emailVerified) {
      alert('Aapka email verify ho chuka hai! Please log in again.');
      return;
    }
    await sendEmailVerification(cred.user);
    await signOut(auth);
    alert(`✅ Verification email dobara bhej diya gaya hai (${email}) par! Kripya inbox check karein.`);
  } catch (err) {
    console.error('Login resend error:', err);
    alert('Verification email bhejne me samasya: ' + (err.message || 'Kripya sahi password enter karein.'));
  }
};

// ====================================================================================
// 3. LOGIN: signInWithEmailAndPassword + emailVerified Check + Uniform Error
// ====================================================================================
window.submitGateLogin = async function() {
  const inputEl = document.getElementById('gateLoginInput');
  const passEl = document.getElementById('gateLoginPass');
  const val = inputEl ? inputEl.value.trim().toLowerCase() : '';
  const pass = passEl ? passEl.value : '';
  const alertBox = document.getElementById('gateLoginAlert');

  if (!val && !pass) {
    if (alertBox) {
      alertBox.textContent = 'Please enter both Email and Password.';
      alertBox.style.display = 'block';
    }
    if (inputEl) inputEl.focus();
    return;
  }
  if (!val) {
    if (alertBox) {
      alertBox.textContent = 'Please enter your registered Email address.';
      alertBox.style.display = 'block';
    }
    if (inputEl) inputEl.focus();
    return;
  }
  if (!pass) {
    if (alertBox) {
      alertBox.textContent = 'Please enter your password.';
      alertBox.style.display = 'block';
    }
    if (passEl) passEl.focus();
    return;
  }

  if (!auth) {
    if (alertBox) {
      alertBox.innerHTML = `⚠️ <strong>Firebase Config Missing:</strong><br><span style="font-size:0.78rem; color:#64748B;">Kripya apne Firebase credentials <code>js/firebase-config.js</code> me paste karein real email authentication activate karne ke liye.</span>`;
      alertBox.style.display = 'block';
    }
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, val, pass);
    const user = userCredential.user;

    // REQUIREMENT 3: Agar user.emailVerified false ho to signOut karke message dikhao
    if (!user.emailVerified) {
      await signOut(auth);
      if (alertBox) {
        alertBox.innerHTML = `⚠️ <strong>Pehle apni email verify karein.</strong><br><span style="font-size:0.78rem; color:#64748B;">Verification link aapki email par bheja gaya tha. Link par click karke verify karein.</span><br><button type="button" class="btn-specs" style="margin-top:6px; font-size:0.75rem; padding:4px 10px;" onclick="resendLoginVerificationEmail('${val}', '${pass}')">🔄 Resend Verification Email</button>`;
        alertBox.style.display = 'block';
      }
      return;
    }

    // SUCCESSFUL VERIFIED LOGIN
    if (alertBox) alertBox.style.display = 'none';

    let profile = null;
    try {
      profile = JSON.parse(localStorage.getItem('user_profile_' + user.uid));
    } catch (e) {}

    const sessionUser = {
      uid: user.uid,
      name: (profile && profile.name) ? profile.name : val.split('@')[0],
      email: user.email,
      mobile: (profile && profile.phone) ? profile.phone : 'Verified User',
      firm: (profile && profile.firm) ? profile.firm : '',
      portal: (profile && profile.portal) ? profile.portal : 'retail',
      verified: true
    };

    localStorage.setItem('currentUser', JSON.stringify(sessionUser));
    sessionStorage.setItem('ramdevSessionActive', 'true');
    localStorage.setItem('ramdevPortalMode', sessionUser.portal);

    if (sessionUser.portal === 'wholesale') {
      localStorage.setItem('isDealerVerified', 'true');
      localStorage.setItem('dealerProfile', JSON.stringify({
        firmName: sessionUser.firm || 'Verified Plastics Dealer',
        category: 'Plastic Ware Retailer',
        gstin: '08AABCR1234F1Z8',
        contactPerson: sessionUser.name,
        phone: sessionUser.mobile,
        city: 'Jodhpur, Rajasthan'
      }));
    }

    window.enterStorefront(sessionUser.portal);

    if (window.showToast) {
      if (sessionUser.portal === 'wholesale') {
        window.showToast(`🏭 Welcome, ${sessionUser.name}! Wholesale Dealer Portal active.`);
      } else {
        window.showToast(`🛍️ Welcome, ${sessionUser.name}! Retail Storefront active.`);
      }
    }
  } catch (err) {
    console.error('Firebase Login Error:', err);
    // REQUIREMENT 4: Galat email ya password dono par ek hi message: "Invalid User ID or Password"
    if (alertBox) {
      alertBox.textContent = '❌ Invalid User ID or Password.';
      alertBox.style.display = 'block';
    }
  }
};

// In-store modal login alias
window.doLogin = async function() {
  const inputEl = document.getElementById('loginInput');
  const passEl = document.getElementById('loginPass');
  const val = inputEl ? inputEl.value.trim().toLowerCase() : '';
  const pass = passEl ? passEl.value : '';
  const alertBox = document.getElementById('loginErrorAlert');

  if (!val || !pass) {
    if (alertBox) {
      alertBox.textContent = 'Please enter both Email and Password.';
      alertBox.style.display = 'block';
    }
    return;
  }

  if (!auth) {
    if (alertBox) {
      alertBox.textContent = 'Firebase Config Missing in js/firebase-config.js';
      alertBox.style.display = 'block';
    }
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, val, pass);
    const user = userCredential.user;

    if (!user.emailVerified) {
      await signOut(auth);
      if (alertBox) {
        alertBox.innerHTML = `⚠️ <strong>Pehle apni email verify karein.</strong><br><button type="button" class="btn-specs" style="margin-top:6px; font-size:0.75rem; padding:4px 8px;" onclick="resendLoginVerificationEmail('${val}', '${pass}')">🔄 Resend Verification Email</button>`;
        alertBox.style.display = 'block';
      }
      return;
    }

    if (alertBox) alertBox.style.display = 'none';

    let profile = null;
    try { profile = JSON.parse(localStorage.getItem('user_profile_' + user.uid)); } catch(e) {}
    const portal = (profile && profile.portal) ? profile.portal : 'retail';

    const sessionUser = {
      uid: user.uid,
      name: (profile && profile.name) ? profile.name : val.split('@')[0],
      email: user.email,
      mobile: (profile && profile.phone) ? profile.phone : 'Verified User',
      firm: (profile && profile.firm) ? profile.firm : '',
      portal,
      verified: true
    };

    localStorage.setItem('currentUser', JSON.stringify(sessionUser));
    sessionStorage.setItem('ramdevSessionActive', 'true');
    localStorage.setItem('ramdevPortalMode', portal);

    if (portal === 'wholesale') window.setPriceMode('wholesale');
    else window.setPriceMode('retail');

    window.applyCurrentUserState();
    window.closeModal('authModal');
    if (window.showToast) window.showToast(`👋 Welcome back, ${sessionUser.name}!`);
  } catch (err) {
    if (alertBox) {
      alertBox.textContent = '❌ Invalid User ID or Password.';
      alertBox.style.display = 'block';
    }
  }
};

// ====================================================================================
// 4. CENTRAL GUARD: onAuthStateChanged + emailVerified Check
// ====================================================================================
if (auth) {
  onAuthStateChanged(auth, (user) => {
    if (user && user.emailVerified) {
      // Verified user: ensure storefront is displayed
      const sessionActive = sessionStorage.getItem('ramdevSessionActive') === 'true';
      if (!sessionActive) {
        let profile = null;
        try { profile = JSON.parse(localStorage.getItem('user_profile_' + user.uid)); } catch(e) {}
        const portal = (profile && profile.portal) ? profile.portal : 'retail';
        window.enterStorefront(portal);
      }
    } else {
      // Unauthenticated or unverified: ensure gated
      const sessionActive = sessionStorage.getItem('ramdevSessionActive') === 'true';
      if (!sessionActive) {
        const storefront = document.getElementById('mainStorefrontApp');
        const authGate = document.getElementById('entryAuthGateScreen');
        if (storefront) storefront.style.display = 'none';
        if (authGate) authGate.style.display = 'flex';
      }
    }
  });
}

// Central enforceAuthGuard
window.enforceAuthGuard = function() {
  const currentUser = window.getCurrentUser();
  const sessionActive = sessionStorage.getItem('ramdevSessionActive') === 'true';

  if (!currentUser || !currentUser.verified || !sessionActive) {
    const storefront = document.getElementById('mainStorefrontApp');
    const authGate = document.getElementById('entryAuthGateScreen');
    if (storefront) storefront.style.display = 'none';
    if (authGate) authGate.style.display = 'flex';
    window.showGateLoginView();
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    return false;
  }
  return true;
};

// ====================================================================================
// 5. LOGOUT: Firebase signOut() + Session Cleanup
// ====================================================================================
window.logoutUser = async function() {
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('SignOut warning:', e);
    }
  }

  localStorage.removeItem('currentUser');
  sessionStorage.removeItem('ramdevSessionActive');
  localStorage.removeItem('isDealerVerified');
  localStorage.removeItem('dealerProfile');
  localStorage.removeItem('ramdevPortalMode');

  if (window.cart) window.cart = [];
  if (window.updateCart) window.updateCart();

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.classList.remove('active');
  });

  const gateInput = document.getElementById('gateLoginInput');
  const gatePass = document.getElementById('gateLoginPass');
  if (gateInput) gateInput.value = '';
  if (gatePass) gatePass.value = '';

  document.getElementById('mainStorefrontApp').style.display = 'none';
  document.getElementById('entryAuthGateScreen').style.display = 'flex';
  window.showGateLoginView();

  if (window.showToast) {
    window.showToast('🔒 Signed out successfully.');
  }
};


import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { setDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+1'); 
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('details'); 
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    // Initialize RecaptchaVerifier only when the component is mounted
    if (!window.recaptchaVerifier) {
      setupRecaptcha();
    }
    return () => {
      // Cleanup RecaptchaVerifier when the component is unmounted
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal',
        callback: (response) => {
          console.log('Recaptcha solved');
        },
        'expired-callback': () => {
          setError('Recaptcha expired, please try again.');
        }
      });

      window.recaptchaVerifier.render().catch((error) => {
        console.error('Error rendering Recaptcha:', error);
        //setError('Failed to render Recaptcha. Please try again later.');
      });
    }
  };

  const isValidPhoneNumber = (phone) => {
    // phone format validation
    const phoneNumberPattern = /^\+[1-9]\d{1,14}$/;
    return phoneNumberPattern.test(phone);
  };

  const checkPhoneNumberExists = async (phoneNumber) => {
    try {
      const q = await query(
        collection(db, 'users'),
        where('phoneNumber', '==', phoneNumber)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.length;
    } catch(error) {
      return false;
    }
  }

  const handleSendOtp = async () => {
    setError('');

    if (!isValidPhoneNumber(phoneNumber)) {
      setError('Invalid phone number format. Make sure it starts with + and includes the country code.');
      return;
    }

    try {

    // Check if the phone number already exists in Firestore
    const phoneExists = await checkPhoneNumberExists(phoneNumber);

    if (phoneExists) {
      setError('Phone number is already registered.');
      return;
    }

      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setStep('otp'); 
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError(`Failed to send OTP: ${error.message}`);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then((widgetId) => {
          window.grecaptcha.reset(widgetId);
        });
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      // Store user details in Firestore after OTP verification
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email,
        phoneNumber,
        createdAt: new Date(),
      });
      navigate('/login')
      setStep('success');

      
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError(`Invalid OTP: ${error.message}`);
    }
  };

  if (step === 'success') {
    return <div>Registration successful! You can now log in with your phone number.</div>;
  }

  return (
    <div>
      <h2>Sign Up</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {step === 'details' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendOtp();
          }}
        >
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Phone Number (with + and country code)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          <div id="recaptcha-container"></div>
          <button type="submit">Send OTP</button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit">Verify OTP</button>
        </form>
      )}
    </div>
  );
};

export default SignUp;

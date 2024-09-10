import React, { useState } from 'react';
import { auth } from '../firebase'; 
import { RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';


const Login = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Function to set up ReCAPTCHA
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
        setError('Failed to render Recaptcha. Please try again later.');
      });
    }
  };

  
  // Function to send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!mobile) {
      alert('Please enter a valid mobile number.');
      return;
    }

    setupRecaptcha(); 

    const appVerifier = window.recaptchaVerifier;
    const phoneNumber = `+${mobile}`; 

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setVerificationId(confirmationResult.verificationId);
      alert('OTP sent, please enter it below to login.');

    } catch (error) {
      console.error('Error sending OTP', error);
      alert('Failed to send OTP. Please try again.');
    }
  };

  // Function to verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp || !verificationId) {
      alert('Please enter the OTP sent to your mobile.');
      return;
    }

    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await signInWithCredential(auth, credential);
      alert('Logged in successfully');
      navigate('/todo')
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('Invalid OTP. Please try again.');
    }
  };

  return (
    <div>
      <h2>Login with OTP</h2>
      <form onSubmit={handleSendOTP}>
        <input
          type="tel"
          placeholder="Mobile Number (with country code)"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          required
        />
        <button type="submit">Send OTP</button>
      </form>

      {/* reCAPTCHA Container */}
      <div id="recaptcha-container"></div>

      {verificationId && (
        <form onSubmit={handleVerifyOTP}>
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

export default Login;

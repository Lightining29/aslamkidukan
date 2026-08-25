import { useEffect, useRef } from 'react';
import './GoogleSignInButton.css';

export default function GoogleSignInButton({ onSuccess, onError, text = 'signin_with' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    let script = document.getElementById('google-gsi-client');
    
    const initializeGoogleSignIn = () => {
      try {
        if (!window.google || !window.google.accounts) return;
        
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '798271672760-6ud5snsd4ga49og0u0jhnqj27hueh209.apps.googleusercontent.com',
          callback: (res) => {
            if (res.credential) {
              onSuccess(res.credential);
            } else {
              onError?.(new Error('No credential returned from Google'));
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(
            containerRef.current,
            { 
              theme: 'outline', 
              size: 'large', 
              width: 320,
              text: text === 'signup_with' ? 'signup_with' : 'signin_with',
              shape: 'pill',
              logo_alignment: 'left'
            }
          );
        }

        // Trigger Google One-Tap prompt for 1-click sign-in if available
        try {
          window.google.accounts.id.prompt();
        } catch {}
      } catch (err) {
        console.warn('Google GSI initialization error:', err);
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = 'google-gsi-client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    } else {
      if (window.google?.accounts) {
        initializeGoogleSignIn();
      } else {
        script.addEventListener('load', initializeGoogleSignIn);
      }
    }

    return () => {
      const activeScript = document.getElementById('google-gsi-client');
      if (activeScript) {
        activeScript.removeEventListener('load', initializeGoogleSignIn);
      }
    };
  }, [onSuccess, onError, text]);

  return (
    <div className="google-btn-wrapper">
      <div ref={containerRef} className="google-official-btn-container" />
    </div>
  );
}

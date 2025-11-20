'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get email from URL params or sessionStorage
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const storedEmail = sessionStorage.getItem('adminEmail');
    
    if (emailParam) {
      setEmail(emailParam);
      sessionStorage.setItem('adminEmail', emailParam);
    } else if (storedEmail) {
      setEmail(storedEmail);
    }
  }, [searchParams]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!password) {
      setError('Inserisci la password');
      return;
    }

    if (!email) {
      setError('Email mancante');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Credenziali non valide');
      }

      // Clear stored email
      sessionStorage.removeItem('adminEmail');
      
      // Redirect to dashboard on success
      router.push('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Errore durante il login');
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.push('/');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="admin-password">
      <img className="vector-3" src="/mobile/search/vector-30.svg" alt="" />
      
      <header className="frame-256">
        <div className="frame-161">
          <div className="frame-253">
            <button className="frame-back" onClick={handleBack} aria-label="Torna indietro">
              <div className="back-arrow-wrapper">
                <Image className="back-arrow" src="/mobile/search/frame-410.svg" alt="" width={20} height={16} />
              </div>
            </button>
            <div className="acquista">ADMIN</div>
            <button className="close-button" onClick={handleClose} aria-label="Chiudi">
              <Image className="close-icon" src="/mobile/search/frame-580.svg" alt="" width={16} height={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="frame-154">
        <form onSubmit={handleLogin} className="login-form">
          <div className="frame-45">
            <div className="frame-49">
              <input
                type="email"
                className="email-input"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                required
                autoComplete="email"
              />
            </div>
          </div>
          <div className="frame-45">
            <div className="frame-49">
              <input
                type="password"
                className="password-input"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                required
                autoComplete="current-password"
              />
            </div>
          </div>
          {error && (
            <div className="error-message">{error}</div>
          )}
          <button 
            type="submit" 
            className="frame-37" 
            disabled={loading || !password || !email}
          >
            <div className="frame-17">
              <div className="frame-35">
                <div className="accedi">Accedi</div>
              </div>
            </div>
          </button>
        </form>
      </div>

      <style jsx>{`
        .admin-password,
        .admin-password * {
          box-sizing: border-box;
        }

        .admin-password {
          background: #ffffff;
          height: 852px;
          position: relative;
          overflow: hidden;
          width: 100%;
          max-width: 393px;
          margin: 0 auto;
        }

        .vector-3 {
          width: 90px;
          height: 0px;
          position: absolute;
          left: 152px;
          top: 844px;
          overflow: visible;
        }

        .frame-256 {
          width: 393px;
          height: 91px;
          position: absolute;
          left: 0;
          top: 0;
          display: flex;
          justify-content: center;
        }
        
        .frame-161 {
          width: 100%;
          height: 100%;
          position: relative;
          border-bottom-right-radius: 20px;
          border-bottom-left-radius: 20px;
          padding: 16px 23px 20px;
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          background: linear-gradient(135deg, rgba(255,169,37,1) 0%, rgba(250,159,19,1) 57%, rgba(244,148,1,1) 75%);
        }
        
        .frame-253 {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 23px;
        }
        
        .frame-back,
        .close-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: auto;
          height: auto;
          cursor: pointer;
          border: none;
          background: transparent;
          padding: 0;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        
        .frame-back:hover,
        .close-button:hover {
          opacity: 0.8;
        }
        
        .frame-back:active,
        .close-button:active {
          transform: scale(0.95);
        }
        
        .back-arrow-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .back-arrow,
        .close-icon {
          display: block;
        }
        
        .back-arrow {
          width: 20px;
          height: 16px;
        }
        
        .close-icon {
          width: 16px;
          height: 16px;
        }
        
        .acquista {
          color: #ffffff;
          font-size: 20px;
          font-family: Inter, sans-serif;
          font-weight: 400;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .frame-154 {
          display: flex;
          flex-direction: column;
          gap: 32px;
          align-items: center;
          justify-content: flex-start;
          width: 339px;
          position: absolute;
          left: 50%;
          top: 219px;
          transform: translateX(-50%);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 32px;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
        }

        .frame-45 {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: flex-start;
          justify-content: flex-start;
          align-self: stretch;
          flex-shrink: 0;
          height: 45px;
          position: relative;
          width: 100%;
        }

        .frame-49 {
          background: #fffefe;
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.17);
          padding: 14px 9px 14px 9px;
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: center;
          justify-content: center;
          align-self: stretch;
          flex-shrink: 0;
          position: relative;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          height: 45px;
        }

        .email-input,
        .password-input {
          color: rgba(0, 0, 0, 0.8);
          text-align: left;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          position: relative;
          background: transparent;
          border: none;
          outline: none;
          width: 100%;
          flex: 1;
          padding: 0;
        }

        .email-input::placeholder,
        .password-input::placeholder {
          color: rgba(0, 0, 0, 0.35);
        }

        .error-message {
          color: #d32f2f;
          font-size: 12px;
          font-family: Inter, sans-serif;
          padding: 4px 8px;
          text-align: center;
          width: 100%;
        }

        .frame-37 {
          background: #f49401;
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.17);
          padding: 15px 27px 15px 27px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 109px;
          height: 47px;
          position: relative;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          transition: background-color 0.2s, transform 0.2s;
          border: none;
        }

        .frame-37:hover:not(:disabled) {
          background: #e68501;
        }

        .frame-37:active:not(:disabled) {
          transform: scale(0.95);
        }

        .frame-37:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .frame-17 {
          display: flex;
          flex-direction: row;
          gap: 1px;
          align-items: center;
          justify-content: flex-start;
          flex-shrink: 0;
          position: relative;
        }

        .frame-35 {
          flex-shrink: 0;
          width: 55px;
          height: 17px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .accedi {
          color: #ffffff;
          text-align: left;
          font-family: "Inter-SemiBold", sans-serif;
          font-size: 14px;
          font-weight: 600;
          position: relative;
        }
      `}</style>
    </div>
  );
}

export default function AdminLoginFormPage() {
  return (
    <Suspense fallback={
      <div className="admin-password">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: '#ffffff'
        }}>
          Loading...
        </div>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}


'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UserData {
  nomeCognome: string;
 // cognome: string;
  email: string;
}

export interface UserDataFormProps {
  initialData?: Partial<UserData>;
  onSubmit?: (data: UserData) => void;
  onDataChange?: (data: UserData, isValid: boolean) => void;
  hideButton?: boolean;
}

interface FieldValidation {
  isValid: boolean;
  error: string;
  touched: boolean;
}

const STORAGE_KEY = 'userDataForm';

// Validation functions
const validateNome = (value: string): string => {
  if (!value.trim()) {
    return 'Il nome è obbligatorio';
  }
  if (value.trim().length < 2) {
    return 'Il nome deve contenere almeno 2 caratteri';
  }
  if (value.trim().length > 50) {
    return 'Il nome non può superare i 50 caratteri';
  }
  if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value.trim())) {
    return 'Il nome può contenere solo lettere e spazi';
  }
  return '';
};

const validateCognome = (value: string): string => {
  if (!value.trim()) {
    return 'Il cognome è obbligatorio';
  }
  if (value.trim().length < 2) {
    return 'Il cognome deve contenere almeno 2 caratteri';
  }
  if (value.trim().length > 50) {
    return 'Il cognome non può superare i 50 caratteri';
  }
  if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value.trim())) {
    return 'Il cognome può contenere solo lettere e spazi';
  }
  return '';
};


const validateEmail = (value: string): string => {
  if (!value.trim()) {
    return 'L\'email è obbligatoria';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) {
    return 'Inserisci un\'email valida';
  }
  return '';
};

export default function UserDataForm({ 
  initialData, 
  onSubmit, 
  onDataChange,
  hideButton = false
}: UserDataFormProps) {
  // Load from sessionStorage on mount
  const loadFromStorage = useCallback((): UserData => {
    if (typeof window === 'undefined') {
      return { nomeCognome: '', email: '' };
    }
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          nomeCognome: parsed.nomeCognome || '',
          //cognome: parsed.cognome || '',
          email: parsed.email || '',
        };
      }
    } catch (e) {
      console.warn('Failed to load from sessionStorage:', e);
    }
    return { nomeCognome: '', email: '' };
  }, []);

  const [formData, setFormData] = useState<UserData>(() => {
    const storageData = loadFromStorage();
    return {
      nomeCognome: initialData?.nomeCognome || storageData.nomeCognome || '',
     // cognome: initialData?.cognome || storageData.cognome || '',
      email: initialData?.email || storageData.email || '',
    };
  });

  const [validation, setValidation] = useState<Record<keyof UserData, FieldValidation>>({
    nomeCognome: { isValid: true, error: '', touched: false },
    //cognome: { isValid: true, error: '', touched: false },
    email: { isValid: true, error: '', touched: false },
  });

  // Save to sessionStorage whenever formData changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      } catch (e) {
        console.warn('Failed to save to sessionStorage:', e);
      }
    }
  }, [formData]);

  // Validate a single field
  const validateField = useCallback((field: keyof UserData, value: string): FieldValidation => {
    let error = '';
    switch (field) {
      case 'nomeCognome':
        error = validateNome(value);
        break;
      //case 'cognome':
      //  error = validateCognome(value);
      //  break;
      case 'email':
        error = validateEmail(value);
        break;
    }
    return {
      isValid: !error,
      error,
      touched: true,
    };
  }, []);

  // Handle input change
  const handleChange = useCallback((field: keyof UserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Only validate if field has been touched
    if (validation[field].touched) {
      const fieldValidation = validateField(field, value);
      setValidation(prev => ({ ...prev, [field]: fieldValidation }));
    }
  }, [validation, validateField]);

  // Handle blur - validate on blur
  const handleBlur = useCallback((field: keyof UserData) => {
    const fieldValidation = validateField(field, formData[field]);
    setValidation(prev => ({ ...prev, [field]: fieldValidation }));
  }, [formData, validateField]);

  // Check if form is valid
  const isFormValid = Object.values(validation).every(
    v => v.touched && v.isValid
  ) && Object.values(formData).every(v => v.trim() !== '');

  // Count filled fields
  const filledFieldsCount = Object.values(formData).filter(v => v.trim() !== '').length;
  const totalFields = 3;

  // Notify parent of data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(formData, isFormValid);
    }
  }, [formData, isFormValid, onDataChange]);

  // Handle form submit
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields before submit
    const newValidation: Record<keyof UserData, FieldValidation> = {
      nomeCognome: validateField('nomeCognome', formData.nomeCognome),
      //cognome: validateField('cognome', formData.cognome),
      email: validateField('email', formData.email),
    };
    setValidation(newValidation);

    const allValid = Object.values(newValidation).every(v => v.isValid);
    
    if (allValid && onSubmit) {
      onSubmit({
        nomeCognome: formData.nomeCognome.trim(),
        // cognome: formData.cognome.trim(),
        email: formData.email.trim(),
      });
    }
  }, [formData, validateField, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="frame-170">
      {/* Nome e Cognome Field */}
      <div className="frame-49-wrapper">
        <div className="frame-49">
          <input
            type="text"
            placeholder="Nome e Cognome"
            value={formData.nomeCognome}
            onChange={(e) => handleChange('nomeCognome', e.target.value)}
            onBlur={() => handleBlur('nomeCognome')}
            className={`nome-cognome ${validation.nomeCognome.touched && !validation.nomeCognome.isValid ? 'error' : ''} ${validation.nomeCognome.touched && validation.nomeCognome.isValid && formData.nomeCognome.trim() ? 'valid' : ''}`}
            autoComplete="name"
          />
          {validation.nomeCognome.touched && (
            <span className={`validation-icon ${validation.nomeCognome.isValid ? 'valid' : 'invalid'}`}>
              {validation.nomeCognome.isValid ? '✓' : '✗'}
            </span>
          )}
        </div>
        {validation.nomeCognome.touched && validation.nomeCognome.error && (
          <p className="error-message" role="alert">{validation.nomeCognome.error}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="frame-49-wrapper">
        <div className="frame-49">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className={`email ${validation.email.touched && !validation.email.isValid ? 'error' : ''} ${validation.email.touched && validation.email.isValid && formData.email.trim() ? 'valid' : ''}`}
            autoComplete="email"
            inputMode="email"
          />
          {validation.email.touched && (
            <span className={`validation-icon ${validation.email.isValid ? 'valid' : 'invalid'}`}>
              {validation.email.isValid ? '✓' : '✗'}
            </span>
          )}
        </div>
        {validation.email.touched && validation.email.error && (
          <p className="error-message" role="alert">{validation.email.error}</p>
        )}
      </div>

      {/* Form Completion Indicator */}
      {!hideButton && (
        <div className="completion-indicator">
          {filledFieldsCount}/{totalFields} campi compilati
        </div>
      )}

      {/* Continue Button */}
      {!hideButton && (
        <div className="frame-37">
          <button 
            type="submit" 
            className={`frame-17 ${!isFormValid ? 'disabled' : ''}`}
            disabled={!isFormValid}
          >
            <div className="frame-35">
              <div className="continua">Continua</div>
            </div>
          </button>
        </div>
      )}

      <style jsx>{`
        .frame-49-wrapper {
          align-self: stretch;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .frame-49 {
          position: relative;
          width: 100%;
          height: 45px;
        }

        .nome-cognome,
        .email {
          width: 100%;
          height: 100%;
          padding: 14px 16px;
          background: #FFFEFE;
          border: 1px solid rgba(0, 0, 0, 0.17);
          border-radius: 16px;
          color: rgba(151, 151, 164, 0.80);
          font-size: 14px;
          font-family: Inter, sans-serif;
          font-weight: 500;
          outline: none;
        }

        .nome-cognome::placeholder,
        .email::placeholder {
          color: rgba(151, 151, 164, 0.80);
        }

        .nome-cognome:focus,
        .email:focus {
          border-color: #F49401;
        }

        .validation-icon {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          font-weight: bold;
          transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
          z-index: 1;
          pointer-events: none;
        }

        .validation-icon.valid {
          color: #16a34a;
        }

        .validation-icon.invalid {
          color: #dc2626;
        }

        .nome-cognome.error,
        .email.error {
          border-color: #dc2626;
          color: #dc2626;
        }

        .nome-cognome.valid,
        .email.valid {
          border-color: #16a34a;
          color: #16a34a;
        }

        .error-message {
          margin-top: 4px;
          margin-left: 16px;
          font-size: 12px;
          color: #dc2626;
          font-family: Inter;
          animation: fadeIn 0.2s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .completion-indicator {
          text-align: center;
          font-size: 14px;
          color: rgba(151, 151, 164, 0.80);
          font-family: Inter;
          margin-top: -8px;
          margin-bottom: 8px;
        }

        .frame-17.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #9ca3af !important;
        }

        .frame-17.disabled:hover {
          background: #9ca3af !important;
        }

        .frame-49 {
          flex-direction: column;
          align-items: stretch;
          gap: 4px;
        }
      `}</style>
    </form>
  );
}


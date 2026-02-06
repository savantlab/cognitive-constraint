'use client';

import { useState, useEffect, useCallback } from 'react';

const NATO_ALPHABET: Record<string, string> = {
  A: 'ALPHA', B: 'BRAVO', C: 'CHARLIE', D: 'DELTA', E: 'ECHO',
  F: 'FOXTROT', G: 'GOLF', H: 'HOTEL', I: 'INDIA', J: 'JULIET',
  K: 'KILO', L: 'LIMA', M: 'MIKE', N: 'NOVEMBER', O: 'OSCAR',
  P: 'PAPA', Q: 'QUEBEC', R: 'ROMEO', S: 'SIERRA', T: 'TANGO',
  U: 'UNIFORM', V: 'VICTOR', W: 'WHISKEY', X: 'XRAY', Y: 'YANKEE',
  Z: 'ZULU',
};

const NUMBER_WORDS: Record<string, string> = {
  '0': 'ZERO', '1': 'ONE', '2': 'TWO', '3': 'THREE', '4': 'FOUR',
  '5': 'FIVE', '6': 'SIX', '7': 'SEVEN', '8': 'EIGHT', '9': 'NINE',
};

// Safe characters (avoiding ambiguous ones like 0/O, 1/I)
const SAFE_LETTERS = 'ABCDEFGHJKLMNPQRTUVWXY';
const SAFE_NUMBERS = '234679';

interface NatoCaptchaProps {
  onSuccess: () => void;
  length?: number;
}

export default function NatoCaptcha({ onSuccess, length = 4 }: NatoCaptchaProps) {
  const [answer, setAnswer] = useState('');
  const [challenge, setChallenge] = useState<{ code: string; display: string[] }>({ code: '', display: [] });
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState(0);

  const generateChallenge = useCallback(() => {
    let code = '';
    const display: string[] = [];
    
    for (let i = 0; i < length; i++) {
      // Mix letters and numbers (70% letters, 30% numbers)
      const useNumber = Math.random() < 0.3;
      
      if (useNumber) {
        const num = SAFE_NUMBERS[Math.floor(Math.random() * SAFE_NUMBERS.length)] as string;
        code += num;
        display.push(NUMBER_WORDS[num] as string);
      } else {
        const letter = SAFE_LETTERS[Math.floor(Math.random() * SAFE_LETTERS.length)] as string;
        code += letter;
        display.push(NATO_ALPHABET[letter] as string);
      }
    }
    
    setChallenge({ code, display });
    setAnswer(code);
    setInput('');
    setError('');
    setStartTime(Date.now());
  }, [length]);

  useEffect(() => {
    generateChallenge();
  }, [generateChallenge]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Anti-bot: reject if solved too fast (under 1.5 seconds)
    const elapsed = Date.now() - startTime;
    if (elapsed < 1500) {
      setError('Please take your time');
      generateChallenge();
      return;
    }
    
    if (input.toUpperCase() === answer) {
      onSuccess();
    } else {
      setError('Incorrect. Try again.');
      generateChallenge();
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ 
        color: 'var(--muted)', 
        marginBottom: '1.5rem',
        fontSize: '0.95rem',
      }}>
        Type the letters and numbers represented below
      </p>
      
      {/* NATO display - rendered as SVG for bot resistance */}
      <svg 
        viewBox="0 0 400 60" 
        style={{ 
          width: '100%', 
          maxWidth: '400px', 
          height: 'auto',
          marginBottom: '1.5rem',
          background: 'var(--surface)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
        }}
      >
        <text
          x="200"
          y="38"
          textAnchor="middle"
          style={{
            fontSize: '18px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 600,
            letterSpacing: '0.05em',
            fill: 'var(--foreground)',
          }}
        >
          {challenge.display.join('   ')}
        </text>
      </svg>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          placeholder={`Enter ${length} characters`}
          maxLength={length}
          autoComplete="off"
          autoFocus
          style={{
            width: '100%',
            padding: '0.875rem 1rem',
            fontSize: '1.25rem',
            fontFamily: 'monospace',
            letterSpacing: '0.25em',
            textAlign: 'center',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            background: 'var(--background)',
            color: 'var(--foreground)',
            marginBottom: '1rem',
            textTransform: 'uppercase',
          }}
        />
        
        {error && (
          <p style={{ 
            color: '#ef4444', 
            fontSize: '0.9rem', 
            marginBottom: '1rem' 
          }}>
            {error}
          </p>
        )}
        
        <button
          type="submit"
          disabled={input.length !== length}
          style={{
            width: '100%',
            padding: '0.875rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 500,
            color: 'var(--background)',
            background: 'var(--foreground)',
            border: 'none',
            borderRadius: '6px',
            cursor: input.length === length ? 'pointer' : 'not-allowed',
            opacity: input.length === length ? 1 : 0.5,
            transition: 'opacity 0.2s',
          }}
        >
          Verify
        </button>
      </form>
      
      <button
        type="button"
        onClick={generateChallenge}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          fontSize: '0.85rem',
          color: 'var(--muted)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Generate new code
      </button>
      
      <p style={{ 
        marginTop: '1.5rem', 
        fontSize: '0.8rem', 
        color: 'var(--muted)',
        lineHeight: 1.5,
      }}>
        <strong>Hint:</strong> ALPHA = A, BRAVO = B, SEVEN = 7, etc.
      </p>
    </div>
  );
}

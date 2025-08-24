import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ShortcutRecorderProps, KeyModifier } from '../types';
import { useKeyboardShortcuts } from '../KeyboardShortcutsProvider';

/**
 * Shortcut Recorder Component
 * Captures keyboard input to record new shortcuts
 */
export const ShortcutRecorder: React.FC<ShortcutRecorderProps> = ({
  value,
  onChange,
  onValidate,
  placeholder = 'Press keys to record shortcut...',
  disabled = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [currentSequence, setCurrentSequence] = useState<string>('');
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; message?: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { manager } = useKeyboardShortcuts();

  // Parse current value to show formatted shortcut
  const formattedValue = value ? manager.formatShortcut(manager.parseShortcut(value) as any) : '';

  const startRecording = useCallback(() => {
    if (disabled) return;
    
    setIsRecording(true);
    setPressedKeys(new Set());
    setCurrentSequence('');
    setValidationResult(null);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setPressedKeys(new Set());
    
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isRecording) return;

    event.preventDefault();
    event.stopPropagation();

    const key = normalizeKey(event.key);
    const modifiers = extractModifiers(event);
    
    // Build the key combination
    const newPressedKeys = new Set([...modifiers, key]);
    setPressedKeys(newPressedKeys);
    
    // Format the shortcut string
    const shortcutString = formatShortcutString(modifiers, key);
    setCurrentSequence(shortcutString);
    
    // Clear any existing timeout
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
    }
    
    // Set timeout to finalize the shortcut
    recordingTimeoutRef.current = setTimeout(() => {
      finializeShortcut(shortcutString);
    }, 300);
  }, [isRecording]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!isRecording) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // If it's just a modifier key release, don't finalize yet
    const key = normalizeKey(event.key);
    if (!isModifierKey(key)) {
      // Clear timeout and finalize immediately for non-modifier keys
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }
      
      if (currentSequence) {
        finializeShortcut(currentSequence);
      }
    }
  }, [isRecording, currentSequence]);

  const finializeShortcut = useCallback((shortcutString: string) => {
    if (!shortcutString) return;
    
    // Validate the shortcut
    const validation = onValidate(shortcutString);
    setValidationResult({
      isValid: validation.isValid,
      message: validation.errors[0] || validation.warnings[0] || (validation.isValid ? 'Valid shortcut' : undefined)
    });
    
    if (validation.isValid) {
      onChange(shortcutString);
      setTimeout(() => {
        stopRecording();
      }, 500); // Brief delay to show success
    } else {
      // Keep recording for invalid shortcuts
      setPressedKeys(new Set());
      setCurrentSequence('');
    }
  }, [onChange, onValidate, stopRecording]);

  // Attach event listeners when recording
  useEffect(() => {
    if (!isRecording) return;

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);
    
    // Prevent default shortcut behavior during recording
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return 'Recording shortcut...';
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRecording, handleKeyDown, handleKeyUp]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
    };
  }, []);

  const clearShortcut = () => {
    onChange('');
    setValidationResult(null);
    stopRecording();
  };

  const handleEscape = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isRecording) {
      event.preventDefault();
      stopRecording();
    }
  };

  return (
    <div className="shortcut-recorder">
      <div className={`shortcut-recorder__input-container ${isRecording ? 'shortcut-recorder__input-container--recording' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          className={`shortcut-recorder__input ${disabled ? 'shortcut-recorder__input--disabled' : ''}`}
          value={isRecording ? (currentSequence || 'Recording...') : formattedValue}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          onClick={startRecording}
          onKeyDown={handleEscape}
        />
        
        {!disabled && (
          <div className="shortcut-recorder__actions">
            {value && !isRecording && (
              <button
                type="button"
                className="shortcut-recorder__clear"
                onClick={clearShortcut}
                title="Clear shortcut"
              >
                ✕
              </button>
            )}
            
            {!isRecording ? (
              <button
                type="button"
                className="shortcut-recorder__record"
                onClick={startRecording}
                title="Record new shortcut"
              >
                🎵
              </button>
            ) : (
              <button
                type="button"
                className="shortcut-recorder__stop"
                onClick={stopRecording}
                title="Stop recording (Esc)"
              >
                ⏹️
              </button>
            )}
          </div>
        )}
      </div>

      {validationResult && (
        <div className={`shortcut-recorder__validation ${validationResult.isValid ? 'shortcut-recorder__validation--valid' : 'shortcut-recorder__validation--invalid'}`}>
          {validationResult.isValid ? '✓' : '⚠'} {validationResult.message}
        </div>
      )}

      {isRecording && (
        <div className="shortcut-recorder__help">
          <p>Press the key combination you want to record.</p>
          <p>Press <kbd>Escape</kbd> to cancel.</p>
        </div>
      )}

      <style>{`
        .shortcut-recorder {
          position: relative;
        }

        .shortcut-recorder__input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .shortcut-recorder__input-container--recording {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .shortcut-recorder__input {
          flex: 1;
          padding: 10px 60px 10px 16px;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          background: white;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
          min-height: 44px;
        }

        .shortcut-recorder__input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .shortcut-recorder__input--disabled {
          background: #f9fafb;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .shortcut-recorder__input-container--recording .shortcut-recorder__input {
          border-color: #ef4444;
          background: #fef2f2;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .shortcut-recorder__actions {
          position: absolute;
          right: 8px;
          display: flex;
          gap: 4px;
        }

        .shortcut-recorder__clear,
        .shortcut-recorder__record,
        .shortcut-recorder__stop {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: #6b7280;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .shortcut-recorder__clear:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        .shortcut-recorder__record:hover {
          background: #dbeafe;
          color: #2563eb;
        }

        .shortcut-recorder__stop {
          background: #fee2e2;
          color: #dc2626;
        }

        .shortcut-recorder__stop:hover {
          background: #fecaca;
        }

        .shortcut-recorder__validation {
          margin-top: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .shortcut-recorder__validation--valid {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .shortcut-recorder__validation--invalid {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .shortcut-recorder__help {
          margin-top: 12px;
          padding: 12px;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 8px;
          font-size: 13px;
          color: #0c4a6e;
        }

        .shortcut-recorder__help p {
          margin: 0;
          line-height: 1.4;
        }

        .shortcut-recorder__help p + p {
          margin-top: 4px;
        }

        .shortcut-recorder__help kbd {
          display: inline-block;
          padding: 2px 6px;
          background: white;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          font-size: 11px;
          font-family: inherit;
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .shortcut-recorder__input {
            background: #374151;
            border-color: #4b5563;
            color: #f9fafb;
          }

          .shortcut-recorder__input--disabled {
            background: #1f2937;
            color: #6b7280;
          }

          .shortcut-recorder__input-container--recording .shortcut-recorder__input {
            background: #422006;
            border-color: #f59e0b;
          }

          .shortcut-recorder__validation--valid {
            background: #064e3b;
            color: #6ee7b7;
            border-color: #047857;
          }

          .shortcut-recorder__validation--invalid {
            background: #7f1d1d;
            color: #fca5a5;
            border-color: #b91c1c;
          }

          .shortcut-recorder__help {
            background: #0c4a6e;
            border-color: #0369a1;
            color: #bae6fd;
          }

          .shortcut-recorder__help kbd {
            background: #374151;
            border-color: #4b5563;
            color: #f9fafb;
          }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .shortcut-recorder__input {
            padding-right: 50px;
          }
          
          .shortcut-recorder__actions {
            right: 6px;
            gap: 2px;
          }
          
          .shortcut-recorder__clear,
          .shortcut-recorder__record,
          .shortcut-recorder__stop {
            width: 24px;
            height: 24px;
            font-size: 12px;
          }
        }

        /* High contrast */
        @media (prefers-contrast: high) {
          .shortcut-recorder__input {
            border-width: 3px;
          }
          
          .shortcut-recorder__validation--valid,
          .shortcut-recorder__validation--invalid {
            border-width: 2px;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .shortcut-recorder__input-container--recording {
            animation: none;
          }
          
          .shortcut-recorder__input,
          .shortcut-recorder__clear,
          .shortcut-recorder__record,
          .shortcut-recorder__stop {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Utility functions
 */
function normalizeKey(key: string): string {
  const keyMap: Record<string, string> = {
    ' ': 'Space',
    'Control': 'Ctrl',
    'Meta': 'Cmd',
    'Alt': 'Alt',
    'Shift': 'Shift',
    'Enter': 'Enter',
    'Escape': 'Escape',
    'Tab': 'Tab',
    'Backspace': 'Backspace',
    'Delete': 'Delete',
    'ArrowUp': 'Up',
    'ArrowDown': 'Down',
    'ArrowLeft': 'Left',
    'ArrowRight': 'Right'
  };

  return keyMap[key] || key.toUpperCase();
}

function extractModifiers(event: KeyboardEvent): KeyModifier[] {
  const modifiers: KeyModifier[] = [];
  
  if (event.ctrlKey) modifiers.push('ctrl');
  if (event.metaKey) modifiers.push('cmd');
  if (event.altKey) modifiers.push('alt');
  if (event.shiftKey) modifiers.push('shift');
  
  return modifiers;
}

function isModifierKey(key: string): boolean {
  return ['Ctrl', 'Cmd', 'Alt', 'Shift', 'Meta', 'Control'].includes(key);
}

function formatShortcutString(modifiers: KeyModifier[], key: string): string {
  if (isModifierKey(key)) return ''; // Don't format modifier-only combinations
  
  const parts = [...modifiers.map(m => m === 'cmd' ? 'cmd' : m), key];
  return parts.join('+');
}

export default ShortcutRecorder;

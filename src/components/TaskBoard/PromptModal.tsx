import React, { useState, useEffect } from 'react';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  inputType?: 'text' | 'number';
  confirmText?: string;
  cancelText?: string;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  placeholder = '',
  defaultValue = '',
  inputType = 'text',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  validation = {}
}) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setError('');
    }
  }, [isOpen, defaultValue]);

  const validateInput = (inputValue: string): string => {
    if (validation.required && !inputValue.trim()) {
      return 'Este campo es obligatorio';
    }

    if (inputType === 'text') {
      if (validation.minLength && inputValue.trim().length < validation.minLength) {
        return `Debe tener al menos ${validation.minLength} caracteres`;
      }
      if (validation.maxLength && inputValue.trim().length > validation.maxLength) {
        return `No puede exceder ${validation.maxLength} caracteres`;
      }
    }

    if (inputType === 'number') {
      const numValue = parseInt(inputValue);
      if (isNaN(numValue)) {
        return 'Debe ser un número válido';
      }
      if (validation.min !== undefined && numValue < validation.min) {
        return `El valor mínimo es ${validation.min}`;
      }
      if (validation.max !== undefined && numValue > validation.max) {
        return `El valor máximo es ${validation.max}`;
      }
    }

    return '';
  };

  const handleConfirm = () => {
    const validationError = validateInput(value);
    if (validationError) {
      setError(validationError);
      return;
    }

    onConfirm(inputType === 'text' ? value.trim() : value);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleConfirm();
  };

  const isValid = !validateInput(value);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
      <div className="rounded-lg shadow-xl max-w-md w-full overflow-hidden flex flex-col" style={{ backgroundColor: '#161718' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: '#2D2D2D' }}>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1">
          <div className="p-6 space-y-4">
            <p className="text-gray-200 whitespace-pre-line">{message}</p>
            
            {error && (
              <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <input
                type={inputType}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                style={{ backgroundColor: '#2D2D2D' }}
                placeholder={placeholder}
                maxLength={validation.maxLength}
                min={validation.min}
                max={validation.max}
                autoFocus
              />
              {inputType === 'text' && validation.maxLength && (
                <p className="text-sm text-gray-400 mt-1">
                  {value.length}/{validation.maxLength} caracteres
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 flex-shrink-0" style={{ borderTopColor: '#2D2D2D', borderTopWidth: '1px', borderTopStyle: 'solid' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-200 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors"
            >
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromptModal; 
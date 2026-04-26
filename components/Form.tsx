"use client";

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface FormFieldProps {
  label: string;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export function FormField({
  label,
  type = 'text',
  value,
  onChange,
  name,
  error,
  required,
  placeholder,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          name={name}
          placeholder={placeholder}
          className={`w-full rounded-lg border px-3 py-2 pr-10 focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          required={required}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface FormProps {
  onSubmit: (data: Record<string, string>) => void;
  children: React.ReactNode;
  submitLabel?: string;
  loading?: boolean;
}

export function Form({ onSubmit, children, submitLabel = 'Submit', loading }: FormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value as string;
    });
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {children}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Loading...' : submitLabel}
      </button>
    </form>
  );
}
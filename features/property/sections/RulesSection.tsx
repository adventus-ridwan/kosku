'use client';

import { useState } from 'react';
import type { PropertyRule } from '@/features/property/types';

interface RulesSectionProps {
  value:    PropertyRule[];
  onChange: (value: PropertyRule[]) => void;
  disabled: boolean;
}

export function RulesSection({ value, onChange, disabled }: RulesSectionProps) {
  const [input, setInput] = useState('');

  function addRule() {
    const text = input.trim();
    if (!text) return;
    onChange([...value, { id: crypto.randomUUID(), text }]);
    setInput('');
  }

  function removeRule(id: string) {
    onChange(value.filter(r => r.id !== id));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRule();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {value.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {value.map(rule => (
            <li key={rule.id} className="flex items-start gap-2">
              <span className="flex-1 text-sm text-gray-700 leading-snug pt-0.5">{rule.text}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeRule(rule.id)}
                  className="shrink-0 text-gray-300 hover:text-red-500 transition-colors mt-0.5"
                  aria-label="Hapus peraturan"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {!disabled && (
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tulis peraturan baru…"
            className="flex-1 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={addRule}
            disabled={!input.trim()}
            className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Tambah
          </button>
        </div>
      )}

      {value.length === 0 && disabled && (
        <p className="text-sm text-gray-400">Belum ada peraturan.</p>
      )}
    </div>
  );
}

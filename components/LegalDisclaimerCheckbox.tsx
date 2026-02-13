'use client';

import React from 'react';
import { LEGAL_DISCLAIMER_TEXT } from '@/types/db';

interface LegalDisclaimerCheckboxProps {
  agreed: boolean;
  onChange: (agreed: boolean) => void;
}

export default function LegalDisclaimerCheckbox({
  agreed,
  onChange,
}: LegalDisclaimerCheckboxProps) {
  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
      <div className="mb-3 max-h-32 overflow-y-auto rounded-lg bg-white p-3 text-xs leading-relaxed text-gray-600">
        {LEGAL_DISCLAIMER_TEXT}
      </div>
      <label className="flex cursor-pointer items-start gap-2">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
        />
        <span className="text-sm font-medium text-gray-700">
          위 내용을 확인했으며, 이에 동의합니다.{' '}
          <span className="text-red-500">*</span>
        </span>
      </label>
    </div>
  );
}

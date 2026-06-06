import React from 'react';
import { Download, CheckCircle2, XCircle } from 'lucide-react';

interface LanguagePillsProps {
  languagePacks: Array<{ code: string; name: string; installed: boolean }>;
  onDownload?: (code: string) => void;
  showActions?: boolean;
}

export const LanguagePills: React.FC<LanguagePillsProps> = ({ 
  languagePacks, 
  onDownload,
  showActions = false 
}) => {
  return (
    <div className="flex flex-wrap gap-1.5">
      {languagePacks.map(pack => (
        <div
          key={pack.code}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-all ${
            pack.installed
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}
        >
          {pack.installed ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <XCircle className="w-3 h-3" />
          )}
          <span>{pack.name}</span>
          {!pack.installed && showActions && onDownload && (
            <button
              onClick={() => onDownload(pack.code)}
              className="ml-1 p-0.5 hover:bg-gray-200 rounded transition-colors"
              title={`下载${pack.name}语种包`}
            >
              <Download className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../components/ui/button';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => Promise<void> | void;
};

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const confirmAction = (opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    if (!options) return;
    setIsLoading(true);
    try {
      await options.onConfirm();
    } catch (e) {
      console.error('Confirmation action failed', e);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
      setOptions(null);
    }
  };

  const handleCancel = () => {
    if (isLoading) return;
    setIsOpen(false);
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm: confirmAction }}>
      {children}
      
      {isOpen && options && createPortal(
        <div style={{ pointerEvents: 'auto' }} className="fixed inset-0 z-[9999] pointer-events-auto flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#18181b] border border-zinc-800 rounded-xl max-w-sm w-full p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-white mb-2">{options.title}</h3>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">{options.message}</p>
            
            <div className="flex gap-3 justify-end mt-4">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading}
                className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                {options.cancelText || 'Cancel'}
              </Button>
              <Button 
                onClick={handleConfirm}
                disabled={isLoading}
                className={options.danger ? 'bg-red-600 hover:bg-red-700 text-white border-0' : 'bg-emerald-600 hover:bg-emerald-700 text-white border-0'}
              >
                {isLoading ? 'Processing...' : (options.confirmText || 'Confirm')}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return context;
}

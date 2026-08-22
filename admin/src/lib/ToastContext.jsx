import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

const STYLES = {
  success: { bg: "bg-emerald-600", icon: "✓" },
  error: { bg: "bg-red-600", icon: "✕" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 items-end">
        {toasts.map((toast) => {
          const style = STYLES[toast.type] || STYLES.success;
          return (
            <div
              key={toast.id}
              className={`${style.bg} text-white text-sm font-medium rounded-lg shadow-lg px-4 py-3 flex items-center gap-2 min-w-[240px] animate-[toast-in_0.2s_ease-out]`}
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs shrink-0">
                {style.icon}
              </span>
              {toast.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

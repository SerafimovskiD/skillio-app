import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
    const [state, setState] = useState(null)
    const resolver = useRef(null)

    const confirm = useCallback(
        (options) =>
            new Promise((resolve) => {
                resolver.current = resolve
                setState(typeof options === 'string' ? { message: options } : options)
            }),
        []
    )

    const close = (result) => {
        resolver.current?.(result)
        resolver.current = null
        setState(null)
    }

    useEffect(() => {
        if (!state) return
        const onKey = (e) => {
            if (e.key === 'Escape') close(false)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state])

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {state && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                     onClick={() => close(false)}>
                    <div role="dialog" aria-modal="true"
                         className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
                         onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-semibold text-slate-800">
                            {state.title ?? 'Потврда'}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">{state.message}</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={() => close(false)}
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                {state.cancelText ?? 'Откажи'}
                            </button>
                            <button type="button" autoFocus onClick={() => close(true)}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                                        state.danger
                                            ? 'bg-red-500 hover:bg-red-400'
                                            : 'bg-indigo-600 hover:bg-indigo-700'
                                    }`}>
                                {state.confirmText ?? 'Потврди'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm() {
    return useContext(ConfirmContext)
}
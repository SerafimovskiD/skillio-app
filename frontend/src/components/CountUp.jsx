import { useEffect, useRef, useState } from 'react'

// Број што се „брои“ од 0 до value, почнувајќи од моментот startAt (Date.now() + ...).
// Ако value се смени подоцна, се брои од тековната вредност до новата, без чекање.
export default function CountUp({ value, duration = 800, startAt = 0 }) {
    const [display, setDisplay] = useState(0)
    const shown = useRef(0)
    const started = useRef(false)

    useEffect(() => {
        const from = shown.current
        let raf
        let timer

        const run = () => {
            started.current = true
            const start = performance.now()
            const tick = (now) => {
                const p = Math.min(1, (now - start) / duration)
                const eased = 1 - Math.pow(1 - p, 3) // забавува кон крајот
                const v = Math.round(from + (value - from) * eased)
                shown.current = v
                setDisplay(v)
                if (p < 1) raf = requestAnimationFrame(tick)
            }
            raf = requestAnimationFrame(tick)
        }

        if (started.current) run()
        else timer = setTimeout(run, Math.max(0, startAt - Date.now()))

        return () => {
            clearTimeout(timer)
            cancelAnimationFrame(raf)
        }
        // startAt се чита само при првото стартување
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, duration])

    return <span className="tabular-nums">{display}</span>
}
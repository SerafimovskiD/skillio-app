import { useEffect, useState } from 'react'

export default function Typewriter({ text, speed = 70, delay = 0, className = '', cursor = false, onDone }) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        setCount(0)
        let interval
        const start = setTimeout(() => {
            interval = setInterval(() => {
                setCount((c) => {
                    if (c >= text.length) {
                        clearInterval(interval)
                        onDone?.()
                        return c
                    }
                    return c + 1
                })
            }, speed)
        }, delay)
        return () => {
            clearTimeout(start)
            clearInterval(interval)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text, speed, delay])

    const done = count >= text.length

    return (
        <span className={className} aria-label={text}>
            {text.slice(0, count)}
            {cursor && !done && <span className="animate-pulse">|</span>}
            {/* ја држи висината на местото за да не скока layout-от */}
            <span className="invisible" aria-hidden="true">{text.slice(count)}</span>
        </span>
    )
}
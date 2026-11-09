export default function RichText({ text }) {
    if (!text) return null

    const blocks = []
    let list = null
    text.split(/\r?\n/).forEach((raw) => {
        const line = raw.trim()
        const bullet = /^[-•*]\s+(.*)$/.exec(line)
        if (bullet) {
            if (!list) {
                list = []
                blocks.push({ type: 'ul', items: list })
            }
            list.push(bullet[1])
        } else {
            list = null
            if (line) blocks.push({ type: 'p', text: line })
        }
    })

    return (
        <div className="space-y-3 text-slate-700">
            {blocks.map((b, i) =>
                b.type === 'ul' ? (
                    <ul key={i} className="list-disc space-y-1 pl-5">
                        {b.items.map((item, j) => (
                            <li key={j}>{item}</li>
                        ))}
                    </ul>
                ) : (
                    <p key={i}>{b.text}</p>
                )
            )}
        </div>
    )
}
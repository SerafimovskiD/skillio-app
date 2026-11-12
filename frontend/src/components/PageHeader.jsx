import Typewriter from './Typewriter'

const TITLE_SPEED = 45
const SUBTITLE_SPEED = 25

// Наслов + (опционален) поднаслов со анимација. Децата се прикажуваат десно (на пр. број на огласи).
export default function PageHeader({ title, subtitle, children }) {
    return (
        <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">
                    <Typewriter text={title} speed={TITLE_SPEED} />
                </h1>
                {subtitle && (
                    <p className="mt-1 text-slate-600">
                        <Typewriter
                            text={subtitle}
                            speed={SUBTITLE_SPEED}
                            delay={title.length * TITLE_SPEED + 200}
                        />
                    </p>
                )}
            </div>
            {children}
        </div>
    )
}
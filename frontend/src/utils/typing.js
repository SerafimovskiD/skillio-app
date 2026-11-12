export const TITLE_SPEED = 45
export const SUBTITLE_SPEED = 25

// Колку милисекунди трае пишувањето на наслов + поднаслов (плус мала пауза на крајот)
export const headerDuration = (title, subtitle = '') =>
    title.length * TITLE_SPEED + (subtitle ? 200 + subtitle.length * SUBTITLE_SPEED : 0) + 150
import { BoardColorsEnum } from '../types/board-colors.enum'

export function getAvailableBoardColors(): string {
    const colors: string[] = []
    for (let color in BoardColorsEnum) {
        colors.push(BoardColorsEnum[color])
    }
    return colors.join(', ')
}


export function useCanvas(width: number, height: number) {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext("2d")
    context!.canvas.width = width
    context!.canvas.height = height

    /**
     * Mirrors image
     */
    context!.translate(canvas.width, 0)
    context!.scale(-1, 1)

    return canvas
}

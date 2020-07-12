// kudos to: https://dev.to/ycmjason/how-to-create-range-in-javascript-539i
function* _range(start: number, end: number) {
    if (start === end) return;
    yield start;
    yield* _range(start + 1, end);
}

export const range = (start: number, end: number): number[] => {
    return Array.from(_range(start, end))
}

export const oneHot = (dimension: number, index: number): (0|1)[] => {
    return range(0, dimension).map((_, i) => i == index ? 1 : 0)
}

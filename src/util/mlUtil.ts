// kudos to: https://dev.to/ycmjason/how-to-create-range-in-javascript-539i
export function* range(start: number, end: number) {
    if (start === end) return;
    yield start;
    yield* range(start + 1, end);
}

export const oneHot = (dimension: number, index: number): (0|1)[] => {
    return Array.from(range(0, dimension)).map((_, i) => i == index ? 1 : 0)
}

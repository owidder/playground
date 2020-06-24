function* range(start, end) {
    if (start === end) return;
    yield start;
    yield* range(start + 1, end);
}

const arr = Array.from(range(0, 5));
console.log(arr.map((_, i) => i == 2 ? 1 : 0))

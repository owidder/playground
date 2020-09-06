export const prefixPath = (path: string) => `DNNC/${path}`;

export const getItem = (path: string): string => {
    return localStorage.getItem(prefixPath(path))
}

export const setItem = (path: string, value: string): void => {
    localStorage.setItem(prefixPath(path), value)
}

export const removeItem = (path: string): void => {
    localStorage.removeItem(prefixPath(path))
}

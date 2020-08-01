export type Bookmark = {
    name: string;
    url: string;
}

const bookmarks: Bookmark[] = [];

export const addBookmark = (bookmark: Bookmark): void => {
    bookmarks.push(bookmark);
}

export const deleteBookmark = (name: string): void => {
    const index = bookmarks.findIndex(bookmark => bookmark.name == name);
    bookmarks.splice(index, 1);
}

export const getBookmarks = (): Bookmark[] => {
    return [...bookmarks]
}

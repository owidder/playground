export type Bookmark = {
    name: string;
    url: string;
}

const bookmarks: Bookmark[] = [];

export const addBookmark = (bookmark: Bookmark): void => {
    const index = bookmarks.findIndex(b => b.url == bookmark.url);
    if(index < 0) {
        bookmarks.push(bookmark);
    } else {
        bookmarks.splice(index, 1, bookmark);
    }
}

export const deleteBookmark = (name: string): void => {
    const index = bookmarks.findIndex(bookmark => bookmark.name == name);
    bookmarks.splice(index, 1);
}

export const getBookmarks = (): Bookmark[] => {
    return [...bookmarks]
}

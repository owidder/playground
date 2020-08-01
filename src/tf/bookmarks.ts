export type Bookmark = {
    name: string;
    url: string;
}

const bookmarks: Bookmark[] = [];
let bookmarksId: string;

export const initBookmarks = (_bookmarksId: string): void => {
    bookmarksId = _bookmarksId;
    const bookmarksString = localStorage.getItem(_bookmarksId);
    if(bookmarksString) {
        const savedBookmarks = JSON.parse(bookmarksString);
        Array.prototype.push.apply(bookmarks, savedBookmarks);
    }
}

export const addBookmark = (bookmark: Bookmark): void => {
    const index = bookmarks.findIndex(b => b.url == bookmark.url);
    if(index < 0) {
        bookmarks.push(bookmark);
    } else {
        bookmarks.splice(index, 1, bookmark);
    }

    localStorage.setItem(bookmarksId, JSON.stringify(bookmarks));
}

export const deleteBookmark = (name: string): void => {
    const index = bookmarks.findIndex(bookmark => bookmark.name == name);
    bookmarks.splice(index, 1);
}

export const getBookmarks = (): Bookmark[] => {
    return [...bookmarks]
}

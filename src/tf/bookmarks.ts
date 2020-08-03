export type Bookmark = {
    name: string;
    url: string;
    networkShape: number[];
    activation: string;
    batchSize: number;
    percTrainData: number;
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

export const deleteBookmark = (url: string): void => {
    const index = bookmarks.findIndex(bookmark => bookmark.url == url);
    bookmarks.splice(index, 1);
    localStorage.setItem(bookmarksId, JSON.stringify(bookmarks));
}

export const getBookmarks = (): Bookmark[] => {
    return [...bookmarks]
}

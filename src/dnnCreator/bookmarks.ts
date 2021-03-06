/*
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

import * as storage from "./storage";

export type Bookmark = {
    name: string;
    url: string;
    networkShape: number[];
    activations: string[];
    batchSize: number;
    percTrainData: number;
    modelId: string;
    epochCount: number;
    datasetUrl: string;
    shuffleseed: number;
}

const bookmarks: Bookmark[] = [];
let bookmarksId: string;

const bookmarksPath = (bookmarksId: string) => `dnn-bookmarks/${bookmarksId}`;

export const initBookmarks = (_bookmarksId: string): void => {
    bookmarksId = _bookmarksId;
    const bookmarksString = storage.getItem(bookmarksPath(_bookmarksId));
    if(bookmarksString) {
        const savedBookmarks = JSON.parse(bookmarksString);
        Array.prototype.push.apply(bookmarks, savedBookmarks);
    }
}

export const addBookmark =  (bookmark: Bookmark): void => {
    const index = bookmarks.findIndex(b => b.modelId == bookmark.modelId);
    if(index < 0) {
        bookmarks.push(bookmark);
    } else {
        bookmarks.splice(index, 1, bookmark);
    }

    storage.setItem(bookmarksPath(bookmarksId), JSON.stringify(bookmarks));
}

export const deleteBookmark = (url: string): void => {
    const index = bookmarks.findIndex(bookmark => bookmark.url == url);
    bookmarks.splice(index, 1);
    storage .setItem(bookmarksPath(bookmarksId), JSON.stringify(bookmarks));
}

export const getBookmarks = (): Bookmark[] => {
    return [...bookmarks]
}

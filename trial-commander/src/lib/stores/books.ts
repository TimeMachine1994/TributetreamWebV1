import { writable } from 'svelte/store';

export interface Page {
  id: string;
  path: string;
  batesNumber: string;
  annotations: any[];
}

export interface Book {
  id: string;
  name: string;
  pages: Page[];
}

export const books = writable<Book[]>([]);

export const loadBooks = () => {
  // This will be implemented when FileSystemManager is ready
};

export const getCurrentBook = (bookId: string) => {
  let currentBook: Book | undefined;
  books.subscribe(allBooks => {
    currentBook = allBooks.find(book => book.id === bookId);
  })();
  return currentBook;
};

export const getPage = (bookId: string, pageId: string) => {
  const book = getCurrentBook(bookId);
  return book?.pages.find(page => page.id === pageId);
};

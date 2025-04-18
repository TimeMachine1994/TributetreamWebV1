import { describe, it, expect } from 'vitest';
import { QueryBuilder, createQuery } from './query-builder';

interface TestEntity {
  id: number;
  title: string;
  author: number;
  date: string;
  status: string;
}

describe('QueryBuilder', () => {
  it('should create an empty query builder', () => {
    const builder = new QueryBuilder<TestEntity>();
    expect(builder.getParams()).toEqual({});
  });
  
  it('should create a query builder with createQuery helper', () => {
    const builder = createQuery<TestEntity>();
    expect(builder.getParams()).toEqual({});
  });
  
  it('should add pagination parameters', () => {
    const builder = createQuery<TestEntity>()
      .page(2)
      .perPage(20);
    
    expect(builder.getParams()).toEqual({
      page: 2,
      per_page: 20
    });
  });
  
  it('should add search parameter', () => {
    const builder = createQuery<TestEntity>()
      .search('test query');
    
    expect(builder.getParams()).toEqual({
      search: 'test query'
    });
  });
  
  it('should add filter parameters', () => {
    const builder = createQuery<TestEntity>()
      .filter('category', 5)
      .filter('tag', 'news');
    
    expect(builder.getParams()).toEqual({
      category: 5,
      tag: 'news'
    });
  });
  
  it('should add orderBy parameters', () => {
    const builder = createQuery<TestEntity>()
      .orderBy('date', 'desc');
    
    expect(builder.getParams()).toEqual({
      orderby: 'date',
      order: 'desc'
    });
  });
  
  it('should add include fields parameter', () => {
    const builder = createQuery<TestEntity>()
      .include(['id', 'title', 'author']);
    
    expect(builder.getParams()).toEqual({
      _fields: 'id,title,author'
    });
  });
  
  it('should add includeIds parameter', () => {
    const builder = createQuery<TestEntity>()
      .includeIds([1, 2, 3]);
    
    expect(builder.getParams()).toEqual({
      include: '1,2,3'
    });
  });
  
  it('should add excludeIds parameter', () => {
    const builder = createQuery<TestEntity>()
      .excludeIds([4, 5, 6]);
    
    expect(builder.getParams()).toEqual({
      exclude: '4,5,6'
    });
  });
  
  it('should add byAuthor parameter', () => {
    const builder = createQuery<TestEntity>()
      .byAuthor(10);
    
    expect(builder.getParams()).toEqual({
      author: 10
    });
  });
  
  it('should add byParent parameter', () => {
    const builder = createQuery<TestEntity>()
      .byParent(5);
    
    expect(builder.getParams()).toEqual({
      parent: 5
    });
  });
  
  it('should add byStatus parameter', () => {
    const builder = createQuery<TestEntity>()
      .byStatus('publish');
    
    expect(builder.getParams()).toEqual({
      status: 'publish'
    });
  });
  
  it('should add byDateRange parameters', () => {
    const builder = createQuery<TestEntity>()
      .byDateRange('2023-01-01T00:00:00Z', '2023-12-31T23:59:59Z');
    
    expect(builder.getParams()).toEqual({
      after: '2023-01-01T00:00:00Z',
      before: '2023-12-31T23:59:59Z'
    });
  });
  
  it('should add byDateRange with only after parameter', () => {
    const builder = createQuery<TestEntity>()
      .byDateRange('2023-01-01T00:00:00Z');
    
    expect(builder.getParams()).toEqual({
      after: '2023-01-01T00:00:00Z'
    });
  });
  
  it('should add byDateRange with only before parameter', () => {
    const builder = createQuery<TestEntity>()
      .byDateRange(undefined, '2023-12-31T23:59:59Z');
    
    expect(builder.getParams()).toEqual({
      before: '2023-12-31T23:59:59Z'
    });
  });
  
  it('should chain multiple methods', () => {
    const builder = createQuery<TestEntity>()
      .page(2)
      .perPage(10)
      .search('test')
      .orderBy('date', 'desc')
      .byAuthor(5)
      .byStatus('publish');
    
    expect(builder.getParams()).toEqual({
      page: 2,
      per_page: 10,
      search: 'test',
      orderby: 'date',
      order: 'desc',
      author: 5,
      status: 'publish'
    });
  });
  
  it('should handle undefined filter values', () => {
    const builder = createQuery<TestEntity>()
      .filter('category', undefined)
      .filter('tag', 'news');
    
    expect(builder.getParams()).toEqual({
      category: undefined,
      tag: 'news'
    });
  });
});
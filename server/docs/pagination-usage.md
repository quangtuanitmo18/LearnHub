// Example Usage Guide for Pagination System
// This file demonstrates how to use the pagination functionality

/\*\*

- API Endpoints with Pagination Support:
-
- 1.  GET /posts
- 2.  GET /posts/my-posts
- 3.  GET /users
- 4.  GET /roles
      \*/

/\*\*

- Query Parameters (all optional):
- - page: number (default: 1) - Page number to retrieve
- - limit: number (default: 10, max: 100) - Number of items per page
- - search: string - Search term for filtering results
- - sortBy: string - Field to sort by (default varies by endpoint)
- - sortOrder: 'asc' | 'desc' - Sort order (default: 'desc')
    \*/

/\*\*

- Example API Requests:
-
- Basic pagination:
- GET /posts?page=1&limit=20
-
- With search:
- GET /posts?search=typescript&page=1&limit=10
-
- With sorting:
- GET /users?sortBy=username&sortOrder=asc&page=2&limit=15
-
- Complex query:
- GET /roles?search=admin&sortBy=name&sortOrder=asc&page=1&limit=5
  \*/

/\*\*

- Response Format:
- {
- "data": [...], // Array of items
- "meta": {
-     "page": 1,
-     "limit": 10,
-     "totalItems": 100,
-     "totalPages": 10,
-     "hasNextPage": true,
-     "hasPreviousPage": false
- }
- }
  \*/

/\*\*

- Search Functionality:
-
- Posts: Searches in title, content, and author username
- Users: Searches in username and email
- Roles: Searches in name and description
  \*/

/\*\*

- Default Sorting:
-
- Posts: createdAt DESC (newest first)
- Users: createdAt DESC (newest first)
- Roles: name ASC (alphabetical)
  \*/

export {};

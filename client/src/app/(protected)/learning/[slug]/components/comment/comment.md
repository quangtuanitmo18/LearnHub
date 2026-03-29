POST {{breakpoint}}/lessons/fad10b92-0d37-4a85-b943-79070a4fff3b/comments
payload : { "content": "Reply to c3", "parentId": "e4a78b34-dd02-4fc1-ac1a-06155cba5dda" }
{ "content": "Reply to c1" }

{
"success": true,
"statusCode": 201,
"message": "Comment created successfully",
"data": {
"id": "2b96e23d-5ad8-4868-8368-623266752c79",
"lessonId": "fad10b92-0d37-4a85-b943-79070a4fff3b",
"userId": "c90098e8-13a7-4b45-ab03-e79f227707e5",
"parentId": "e4a78b34-dd02-4fc1-ac1a-06155cba5dda",
"content": "Reply to c3",
"level": 2,
"createdAt": "2026-01-20T03:37:25.403Z",
"updatedAt": "2026-01-20T03:37:25.403Z",
"user": {
"id": "c90098e8-13a7-4b45-ab03-e79f227707e5",
"username": "superadmin",
"email": "admin@example.com",
"avatar": null
},
"reactions": {},

        "myReaction": null,
        "replyCount": 0
    }

}

enum CommentStatus {
PENDING
APPROVED
REJECTED
}
GET {{breakpoint}}/lessons/fad10b92-0d37-4a85-b943-79070a4fff3b/comments
{
"success": true,
"statusCode": 200,
"message": "Lesson comments retrieved successfully",
"data": {
"result": [
{
"id": "56789139-636f-46b7-883b-201a7c520950",
"lessonId": "fad10b92-0d37-4a85-b943-79070a4fff3b",
"userId": "c90098e8-13a7-4b45-ab03-e79f227707e5",
"parentId": null,
"content": "Reply to c1",
"level": 0,
"status": "APPROVED",
"createdAt": "2026-01-20T03:50:18.545Z",
"updatedAt": "2026-01-20T03:50:18.545Z",
"user": {
"id": "c90098e8-13a7-4b45-ab03-e79f227707e5",
"username": "superadmin",
"email": "admin@example.com",
"avatar": null
},
"reactions": {},
"myReaction": null,
"replyCount": 0
},
{
"id": "eed96f70-6158-4f5d-866a-ec19b067afce",
"lessonId": "fad10b92-0d37-4a85-b943-79070a4fff3b",
"userId": "c90098e8-13a7-4b45-ab03-e79f227707e5",
"parentId": null,
"content": "My first comment!",
"level": 0,
"status": "APPROVED",
"createdAt": "2026-01-20T03:28:57.053Z",
"updatedAt": "2026-01-20T03:28:57.053Z",
"user": {
"id": "c90098e8-13a7-4b45-ab03-e79f227707e5",
"username": "superadmin",
"email": "admin@example.com",
"avatar": null
},
"reactions": {
"SAD": 1
},
"myReaction": null,
"replyCount": 1
}
],
"meta": {
"page": 1,
"limit": 10,
"totalItems": 2,
"totalPages": 1,
"hasNextPage": false,
"hasPreviousPage": false
}
}
}

GET: {{breakpoint}}/comments/eed96f70-6158-4f5d-866a-ec19b067afce/replies

{
"success": true,
"statusCode": 200,
"message": "Comment replies retrieved successfully",
"data": [
{
"id": "e4a78b34-dd02-4fc1-ac1a-06155cba5dda",
"lessonId": "fad10b92-0d37-4a85-b943-79070a4fff3b",
"userId": "c90098e8-13a7-4b45-ab03-e79f227707e5",
"parentId": "eed96f70-6158-4f5d-866a-ec19b067afce",
"content": "Reply to c1",
"level": 1,
"createdAt": "2026-01-20T03:29:27.068Z",
"updatedAt": "2026-01-20T03:29:27.068Z",
"user": {
"id": "c90098e8-13a7-4b45-ab03-e79f227707e5",
"username": "superadmin",
"email": "admin@example.com",
"avatar": null
},
"reactions": {},
"myReaction": null,
"replyCount": 1
}
]
}

PUT: {{breakpoint}}/comments/cf994275-7345-40b7-9e6b-bf5f967eb31a
{
"success": true,
"statusCode": 200,
"message": "Comment updated successfully",
"data": {
"id": "cf994275-7345-40b7-9e6b-bf5f967eb31a",
"lessonId": "fad10b92-0d37-4a85-b943-79070a4fff3b",
"userId": "c90098e8-13a7-4b45-ab03-e79f227707e5",
"parentId": null,
"content": "change comment",
"level": 0,
"createdAt": "2026-01-20T03:32:29.665Z",
"updatedAt": "2026-01-20T03:52:39.171Z"
}
}

DELETE: {{breakpoint}}/comments/cf994275-7345-40b7-9e6b-bf5f967eb31a

{{breakpoint}}/comments/eed96f70-6158-4f5d-866a-ec19b067afce/react
{"type": "SAD"}
{
"success": true,
"statusCode": 201,
"message": "Reaction updated successfully",
"data": {
"id": "eed96f70-6158-4f5d-866a-ec19b067afce",
"lessonId": "fad10b92-0d37-4a85-b943-79070a4fff3b",
"userId": "c90098e8-13a7-4b45-ab03-e79f227707e5",
"parentId": null,
"content": "My first comment!",
"level": 0,
"createdAt": "2026-01-20T03:28:57.053Z",
"updatedAt": "2026-01-20T03:28:57.053Z",
"user": {
"id": "c90098e8-13a7-4b45-ab03-e79f227707e5",
"username": "superadmin",
"email": "admin@example.com",
"avatar": null
},
"reactions": {
"SAD": 1
},
"myReaction": "SAD",
"replyCount": 1
}
}

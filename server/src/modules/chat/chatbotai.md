<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# good, vậy hãy tổng kêt lại giúp tôi một lần nữa follow hoạt động, endpoints, các prompt , intent, using nextjs, nestjs, axios, @google/generative-ai ... để tôi có thể dùng AI agent để vibe coding, hãy làm như bạn đang viết docs thật cụ thể và chi tiết để ai cũng có thể hiểu đc

Dưới đây là “spec / docs” tổng thể cho chatbot tư vấn khóa học dùng **Next.js + NestJS + Axios + @google/generative-ai (Gemini)**. Mục tiêu: đưa cho AI agent/coder là có thể code được ngay.[^1][^2]

---

## Tổng quan kiến trúc \& flow

### Thành phần

- **Frontend**: Next.js (App Router hoặc Pages đều được)
- **Backend**: NestJS (REST API)
- **AI**: Google Gemini qua SDK `@google/generative-ai`
- **Auth**: user đã login, BE lấy được `userId` từ JWT/cookie (middleware)

### Flow request–response

1. User login vào site (giống F8) → có `userId`.
2. User mở trang chat, gõ câu hỏi.
3. FE gọi `POST /api/chat/message` (Next.js route) → proxy sang NestJS `/chat/message` bằng Axios/fetch.
4. NestJS:
   - Lấy `userId` từ `req.user`.
   - Lấy history tạm của user từ **ChatStore** (Map in‑memory, tối đa 50 message).
   - Dùng **IntentService (Gemini)** để phân loại intent: `COURSE_ADVICE | ORDER_STATUS | SMALL_TALK | OUT_OF_SCOPE`. [^3][^4]
   - Theo intent:
     - Nếu `COURSE_ADVICE`: gọi `CoursesService` lấy danh sách khóa học phù hợp.
     - Nếu `ORDER_STATUS`: gọi `OrdersService` lấy đơn hàng gần nhất.
   - Build **context + prompt** cho Gemini (prompt tư vấn).
   - Gọi Gemini sinh câu trả lời JSON: `{ answer, suggestions, courseIds }`.[^5][^6]
   - Lưu message user \& bot vào ChatStore (giữ max 50).
   - Chuẩn hóa response gửi lại FE:

```json
{
  "data": {
    "response": "…answer…",
    "courses": [ ... ],
    "suggestions": [ ... ],
    "intent": "course_search",
    "timestamp": "2026-01-13T02:17:07.832Z"
  }
}
```

5. FE nhận `data`, update UI:
   - Hiển thị `response` trong bubble.
   - Render `courses` dưới dạng card.
   - Render `suggestions` thành các button để user click gửi tiếp.

---

## Backend (NestJS)

### 1. Cài đặt \& cấu trúc

```bash
npm install @google/generative-ai axios
```

Gợi ý module:

- `chat/`
  - `chat.controller.ts`
  - `chat.service.ts`
  - `chat.store.ts`
  - `intent.service.ts`
  - `dto/chat-response.dto.ts`
- `courses/` (đã có sẵn trong hệ thống)
- `orders/` (đã có sẵn)

### 2. DTO response cho FE

```ts
// chat-response.dto.ts
export class ChatCourseDto {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  image?: string;
  level?: string;
  author?: string;
  view?: number;
}

export class ChatReplyDto {
  response: string;
  courses: ChatCourseDto[];
  suggestions: string[];
  intent: string; // "course_search" | "order_status" | "small_talk" | "out_of_scope"
  timestamp: string; // ISO string
}
```

---

### 3. In‑memory ChatStore (history theo userId)

```ts
// chat.store.ts
import { Injectable } from '@nestjs/common';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
};

type SessionData = {
  messages: ChatMessage[];
  updatedAt: number;
};

const MAX_MESSAGES_PER_USER = 50;
const TTL_MS = 2 * 60 * 60 * 1000; // 2 giờ

@Injectable()
export class ChatStore {
  private store = new Map<string, SessionData>(); // key = userId ("guest" nếu chưa login)

  private getOrInit(userId: string): SessionData {
    const now = Date.now();
    const existing = this.store.get(userId);
    if (!existing) {
      const fresh = { messages: [], updatedAt: now };
      this.store.set(userId, fresh);
      return fresh;
    }
    if (now - existing.updatedAt > TTL_MS) {
      const fresh = { messages: [], updatedAt: now };
      this.store.set(userId, fresh);
      return fresh;
    }
    return existing;
  }

  getMessages(userId: string): ChatMessage[] {
    return this.getOrInit(userId).messages;
  }

  append(userId: string, msg: ChatMessage) {
    const session = this.getOrInit(userId);
    const next = [...session.messages, msg];
    session.messages = next.slice(-MAX_MESSAGES_PER_USER);
    session.updatedAt = Date.now();
    this.store.set(userId, session);
  }

  clear(userId: string) {
    this.store.delete(userId);
  }
}
```

---

### 4. IntentService – dùng Gemini để classify intent

```ts
// intent.service.ts
import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type Intent =
  | 'COURSE_ADVICE'
  | 'ORDER_STATUS'
  | 'SMALL_TALK'
  | 'OUT_OF_SCOPE';

@Injectable()
export class IntentService {
  private model;

  constructor() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async classify(message: string): Promise<Intent> {
    const prompt = this.buildIntentPrompt(message);

    const result = await this.model.generateContent(prompt);
    const text = result.response.text();

    try {
      const parsed = JSON.parse(text);
      const intent = parsed.intent as Intent;
      if (
        [
          'COURSE_ADVICE',
          'ORDER_STATUS',
          'SMALL_TALK',
          'OUT_OF_SCOPE',
        ].includes(intent)
      ) {
        return intent;
      }
    } catch (e) {}

    // fallback
    return 'COURSE_ADVICE';
  }

  private buildIntentPrompt(message: string): string {
    return `
[ROLE]
Bạn là bộ phân loại intent cho chatbot tư vấn khóa học lập trình.

[CÁC INTENT HỖ TRỢ]
1. COURSE_ADVICE: Người dùng muốn được tư vấn chọn khóa học, hỏi về nội dung khóa, lộ trình học lập trình.
2. ORDER_STATUS: Người dùng hỏi về thanh toán, trạng thái đơn hàng, bị trừ tiền, chưa học được dù đã mua, hóa đơn.
3. SMALL_TALK: Câu chào hỏi, làm quen, hỏi bạn là ai, cảm ơn, v.v.
4. OUT_OF_SCOPE: Câu hỏi không liên quan tới khóa học lập trình hoặc đơn hàng.

[YÊU CẦU NGƯỜI DÙNG]
"${message}"

[NHIỆM VỤ]
- Chọn 1 intent phù hợp nhất trong 4 intent trên.
- Trả về JSON:
{ "intent": "COURSE_ADVICE" | "ORDER_STATUS" | "SMALL_TALK" | "OUT_OF_SCOPE" }

[ĐỊNH DẠNG OUTPUT]
Chỉ trả về JSON, không giải thích thêm.
`;
  }
}
```

---

### 5. ChatService – gọi Courses/Orders + Gemini, build response

````ts
// chat.service.ts
import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatStore } from './chat.store';
import { Intent, IntentService } from './intent.service';
import { CoursesService } from '../courses/courses.service';
import { OrdersService } from '../orders/orders.service';
import { ChatReplyDto, ChatCourseDto } from './dto/chat-response.dto';

@Injectable()
export class ChatService {
  private model;

  constructor(
    private readonly store: ChatStore,
    private readonly intentService: IntentService,
    private readonly coursesService: CoursesService,
    private readonly ordersService: OrdersService,
  ) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async handleUserMessage(
    userId: string,
    userMessage: string,
  ): Promise<ChatReplyDto> {
    const intent: Intent = await this.intentService.classify(userMessage);

    // 1. history -> Gemini format
    const history = this.store.getMessages(userId);
    const geminiHistory = history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // 2. data domain
    let courses: (ChatCourseDto & { tags?: string[] })[] = [];
    let orderContext = '';

    if (intent === 'COURSE_ADVICE') {
      const list = await this.coursesService.searchByMessage(userMessage);
      courses = list.map((c) => ({
        id: c.id,
        title: c.name,
        price: c.price,
        oldPrice: c.oldPrice,
        image: c.thumbnailUrl,
        level: c.level,
        author: c.authorName,
        view: c.viewCount,
        tags: c.tags, // optional
      }));
    } else if (intent === 'ORDER_STATUS') {
      const order = await this.ordersService.getLatestOrderByUser(userId);
      orderContext = this.buildOrderContext(order);
    }

    const courseContext = this.buildCourseContext(courses);

    // 3. prompt theo intent
    const prompt = this.buildMainPrompt({
      intent,
      message: userMessage,
      courseContext,
      orderContext,
    });

    // 4. call Gemini
    const chat = this.model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(prompt);
    const rawText = (await result.response).text();

    const { answer, suggestions, courseIds } =
      this.safeParseGeminiJson(rawText);

    // 5. lưu history
    this.store.append(userId, {
      role: 'user',
      content: userMessage,
      createdAt: Date.now(),
    });
    this.store.append(userId, {
      role: 'assistant',
      content: answer,
      createdAt: Date.now(),
    });

    // 6. chọn courses trả về
    const matchedCourses =
      intent === 'COURSE_ADVICE'
        ? this.pickCoursesForReply(courses, courseIds)
        : [];

    return {
      response: answer,
      courses: matchedCourses,
      suggestions: this.buildSuggestions(intent, suggestions),
      intent: this.toIntentCode(intent),
      timestamp: new Date().toISOString(),
    };
  }

  // ==== helper ====

  private buildCourseContext(
    courses: (ChatCourseDto & { tags?: string[] })[],
  ): string {
    if (!courses.length)
      return 'Không có khóa học nào phù hợp trong danh sách.';
    return courses
      .map(
        (c) =>
          `- id: "${c.id}", title: "${c.title}", level: "${c.level ?? ''}", tags: "${(c.tags || []).join(',')}", price: ${c.price}`,
      )
      .join('\n');
  }

  private buildOrderContext(order: any): string {
    if (!order) {
      return 'Người dùng chưa có đơn hàng nào trong hệ thống.';
    }
    return `Đơn hàng mới nhất:
- Mã đơn: ${order.code}
- Trạng thái: ${order.status}
- Tổng tiền: ${order.total}
- Các khóa học: ${order.items.map((i) => i.courseName).join(', ')}
- Ngày thanh toán: ${order.paidAt}`;
  }

  private buildMainPrompt(params: {
    intent: Intent;
    message: string;
    courseContext: string;
    orderContext: string;
  }): string {
    const { intent, message, courseContext, orderContext } = params;

    if (intent === 'COURSE_ADVICE') {
      return `
[ROLE]
Bạn là trợ lý tư vấn khóa học lập trình cho nền tảng học online.

[NGỮ CẢNH KHOÁ HỌC]
${courseContext}

[YÊU CẦU NGƯỜI DÙNG]
"${message}"

[NHIỆM VỤ]
1. Hiểu mục tiêu, trình độ và chủ đề mà học viên quan tâm.
2. Chọn tối đa 3 khóa học trong NGỮ CẢNH KHOÁ HỌC phù hợp nhất.
3. Viết câu trả lời thân thiện, dễ hiểu, bằng tiếng Việt.
4. Tạo 3–4 câu hỏi gợi ý (suggestions) để người dùng bấm tiếp tục.

[ĐỊNH DẠNG OUTPUT]
Chỉ trả về JSON:

{
  "answer": "string - câu trả lời cho người dùng",
  "suggestions": ["string", "..."],
  "courseIds": ["id1", "id2"]
}
`;
    }

    if (intent === 'ORDER_STATUS') {
      return `
[ROLE]
Bạn là nhân viên hỗ trợ khách hàng cho nền tảng khóa học online.

[NGỮ CẢNH ĐƠN HÀNG]
${orderContext}

[YÊU CẦU NGƯỜI DÙNG]
"${message}"

[NHIỆM VỤ]
1. Dựa vào NGỮ CẢNH ĐƠN HÀNG để giải thích trạng thái đơn hàng hiện tại.
2. Nói rõ bước tiếp theo mà học viên nên làm.
3. Nếu không thấy đơn hàng trong context, hãy nói rõ và gợi ý kiểm tra lại email/mã đơn.

[ĐỊNH DẠNG OUTPUT]
Chỉ trả về JSON:

{
  "answer": "string",
  "suggestions": ["string", "..."],
  "courseIds": []
}
`;
    }

    if (intent === 'SMALL_TALK') {
      return `
[ROLE]
Bạn là trợ lý thân thiện.

[YÊU CẦU NGƯỜI DÙNG]
"${message}"

[NHIỆM VỤ]
1. Trả lời chào hỏi thân thiện, ngắn gọn.
2. Sau đó gợi ý người dùng hỏi về khóa học hoặc lộ trình học lập trình.

[ĐỊNH DẠNG OUTPUT]
Chỉ JSON:

{
  "answer": "string",
  "suggestions": ["string", "..."],
  "courseIds": []
}
`;
    }

    // OUT_OF_SCOPE
    return `
[ROLE]
Bạn là trợ lý giới hạn phạm vi hỗ trợ trong lĩnh vực khóa học lập trình và đơn hàng.

[YÊU CẦU NGƯỜI DÙNG]
"${message}"

[NHIỆM VỤ]
1. Lịch sự từ chối trả lời vì câu hỏi ngoài phạm vi.
2. Gợi ý họ hỏi về khóa học, lộ trình học lập trình hoặc đơn hàng.

[ĐỊNH DẠNG OUTPUT]
Chỉ JSON:

{
  "answer": "string",
  "suggestions": ["string", "..."],
  "courseIds": []
}
`;
  }

  private safeParseGeminiJson(raw: string) {
    try {
      const trimmed = raw.trim().replace(/```json|```/g, '');
      const parsed = JSON.parse(trimmed);
      return {
        answer: parsed.answer ?? raw,
        suggestions: parsed.suggestions ?? [],
        courseIds: parsed.courseIds ?? [],
      };
    } catch {
      return { answer: raw, suggestions: [], courseIds: [] };
    }
  }

  private pickCoursesForReply(
    courses: (ChatCourseDto & { tags?: string[] })[],
    courseIds: string[],
  ): ChatCourseDto[] {
    if (!courses.length) return [];
    if (courseIds && courseIds.length) {
      const map = new Map(courses.map((c) => [c.id, c]));
      return courseIds
        .map((id) => map.get(id))
        .filter(Boolean) as ChatCourseDto[];
    }
    return courses.slice(0, 3);
  }

  private buildSuggestions(
    intent: Intent,
    modelSuggestions: string[],
  ): string[] {
    if (modelSuggestions?.length) return modelSuggestions;

    if (intent === 'COURSE_ADVICE') {
      return [
        'Bạn muốn học về ngôn ngữ lập trình nào?',
        'Bạn quan tâm đến lập trình front-end, back-end hay fullstack?',
        'Ngân sách của bạn là bao nhiêu cho một khóa học?',
        'Bạn đang ở cấp độ nào (beginner, intermediate, advanced)?',
      ];
    }

    if (intent === 'ORDER_STATUS') {
      return [
        'Kiểm tra trạng thái đơn hàng gần nhất',
        'Tôi bị trừ tiền nhưng chưa vào học được',
        'Tôi muốn xuất hóa đơn cho khóa học',
      ];
    }

    return [
      'Tư vấn giúp mình lộ trình học lập trình từ đầu',
      'Gợi ý khóa học JavaScript cho người mới',
      'Kiểm tra đơn hàng mua khóa học gần đây',
    ];
  }

  private toIntentCode(intent: Intent): string {
    switch (intent) {
      case 'COURSE_ADVICE':
        return 'course_search';
      case 'ORDER_STATUS':
        return 'order_status';
      case 'SMALL_TALK':
        return 'small_talk';
      case 'OUT_OF_SCOPE':
        return 'out_of_scope';
    }
  }
}
````

---

### 6. ChatController – endpoint chính

```ts
// chat.controller.ts
import { Controller, Post, Body, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatReplyDto } from './dto/chat-response.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  async message(@Req() req, @Body() body: any) {
    const userId = req.user?.id ?? 'guest'; // lấy từ middleware auth
    const { message } = body;

    const data: ChatReplyDto = await this.chatService.handleUserMessage(
      userId,
      message,
    );

    return { data };
  }
}
```

---

## Frontend (Next.js + Axios)

### 1. API route proxy tới NestJS

```ts
// app/api/chat/message/route.ts (Next.js App Router)
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const backendUrl = process.env.BACKEND_URL + '/chat/message';

  const res = await fetch(backendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: req.headers.get('cookie') ?? '',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data);
}
```

Nếu muốn dùng Axios ở FE trực tiếp tới NestJS, có thể bỏ route này và gọi thẳng `axios.post(BACKEND_URL + '/chat/message', ...)`.

### 2. Component Chat UI (logic chính)

```tsx
// app/chat/Chat.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';

type ChatCourse = {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  image?: string;
  level?: string;
  author?: string;
  view?: number;
};

type ChatReply = {
  response: string;
  courses: ChatCourse[];
  suggestions: string[];
  intent: string;
  timestamp: string;
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};
```

---

## Tóm tắt nhanh cho AI agent “vibe coding”

- **Stack**:
  - FE: Next.js + Axios, route `POST /api/chat/message`.
  - BE: NestJS, endpoint `POST /chat/message`.
  - AI: Gemini `@google/generative-ai`, model `gemini-pro`.[^1][^2]
- **Endpoints**:
  - `POST /chat/message` (NestJS): input `{ message }`, output `{ data: ChatReplyDto }`.
  - BE tự lấy `userId` từ `req.user`.
- **Intent**:
  - `COURSE_ADVICE`, `ORDER_STATUS`, `SMALL_TALK`, `OUT_OF_SCOPE`.
  - Dùng `IntentService` (Gemini) để classify, trả JSON `{ "intent": "..." }`.[^4][^3]
- **History**:
  - Lưu tạm tại BE, `ChatStore` (Map<userId, {messages, updatedAt}>), tối đa 50 message, TTL 2h.[^7][^8]
- **Prompt chính**:
  - Theo intent, nhưng đều trả về **JSON** `{"answer": "...", "suggestions": [...], "courseIds": [...]}` để dễ parse.[^6][^5]
- **Response format cho FE**:

```json
{
  "data": {
    "response": "…answer…",
    "courses": [ { "id": "...", "title": "...", "price": 1599000, ... } ],
    "suggestions": ["...", "..."],
    "intent": "course_search",
    "timestamp": "2026-01-13T02:17:07.832Z"
  }
}
```

- **UI**: bubble chat + card khóa học + suggestion buttons.

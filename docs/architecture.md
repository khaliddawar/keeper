# Messaging-First Agentic Assistant Fullstack Architecture Document

## Introduction

This document outlines the complete fullstack architecture for the messaging-first agentic assistant, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern fullstack applications where these concerns are increasingly intertwined.

### Starter Template or Existing Project

**Decision:** N/A - Greenfield project with custom architecture

**Rationale:** Given the specialized nature of LLM orchestration, Telegram integration, and vector-based memory systems, we'll build from scratch using proven frameworks rather than constraining ourselves to a starter template. This allows us to optimize for the specific requirements of an AI assistant.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2024-01-XX | 1.0 | Initial architecture design | Architect |

## High Level Architecture

### Technical Summary

The system employs a **microservices-oriented architecture** deployed on **self-hosted infrastructure** with **React frontend** and **Python FastAPI backend**. The core design centers around an **LLM orchestrator service** that processes Telegram messages, coordinates with external APIs (Calendar, Email), and maintains both short-term and long-term memory using **Postgres + pgvector**. The architecture emphasizes **horizontal scalability** through **stateless API services** and **Redis-backed job queues**, while providing **real-time updates** to the web dashboard via **WebSocket connections**. This design achieves the PRD's goal of handling 100k MAU while maintaining sub-5s response times for complex tool chains.

### Platform and Infrastructure Choice

**Platform:** Self-hosted infrastructure
**Key Services:** Docker Swarm/Kubernetes cluster, Postgres with pgvector, Redis cluster, Nginx load balancer
**Deployment Host and Regions:** On-premises or dedicated servers with backup regions

**Rationale:** Self-hosting provides:
- Complete data control for privacy-first memory storage
- Cost predictability at scale (100k MAU target)
- No vendor lock-in for LLM providers
- Custom security implementations
- Direct control over performance optimization

### UI Design Philosophy

**Design Foundation:** Thoughtkeeper-inspired notebook-first interface
**Core Principle:** Interactive notebook organization where tasks are categorized into contextual notebooks (Work, Personal, Hustles, Health, Ideas)
**User Experience:** Professional, clean design with advanced filtering, multiple view modes, and intuitive task management

**Key UI Features:**
- **Notebook-First Navigation:** Homepage displays large notebook cards instead of traditional task lists
- **Visual Hierarchy:** Color-coded notebooks with icons, task counts, and progress indicators
- **Multiple View Modes:** Kanban board, list view, and calendar view for each notebook
- **Advanced Interactions:** Drag-and-drop, bulk operations, real-time updates
- **Professional Design System:** TailwindCSS-based with consistent spacing, typography, and component library

### Repository Structure

**Structure:** Monorepo
**Monorepo Tool:** npm workspaces
**Package Organization:** Apps (web, api) + shared packages (types, utils, memory)

**Rationale:** Monorepo enables:
- Shared TypeScript types between frontend and backend
- Coordinated deployments of related features
- Simplified dependency management
- Better code reuse for memory/AI utilities

### High Level Architecture Diagram

```mermaid
graph TB
    subgraph "External"
        TG[Telegram Bot API]
        GCAL[Google Calendar API]
        GMAIL[Gmail API]
        LLM[OpenAI/Anthropic APIs]
    end
    
    subgraph "Load Balancer"
        LB[Nginx Load Balancer]
    end
    
    subgraph "Frontend"
        WEB[React Dashboard]
        WS[WebSocket Client]
    end
    
    subgraph "API Layer"
        API1[FastAPI Instance 1]
        API2[FastAPI Instance 2]
        API3[FastAPI Instance N]
    end
    
    subgraph "Core Services"
        ORCH[LLM Orchestrator]
        MEMO[Memory Service]
        TOOL[Tool Router]
        NOTIF[Notification Service]
    end
    
    subgraph "Background Workers"
        CELERY[Celery Workers]
        SCHED[Scheduler Workers]
    end
    
    subgraph "Data Layer"
        PG[(Postgres + pgvector)]
        REDIS[(Redis Cluster)]
        OBJ[Object Storage]
    end
    
    TG --> LB
    WEB --> LB
    LB --> API1
    LB --> API2
    LB --> API3
    
    API1 --> ORCH
    API2 --> MEMO
    API3 --> TOOL
    
    ORCH --> LLM
    ORCH --> MEMO
    ORCH --> TOOL
    
    TOOL --> GCAL
    TOOL --> GMAIL
    
    CELERY --> NOTIF
    SCHED --> TG
    
    API1 --> PG
    API2 --> PG
    API3 --> PG
    
    CELERY --> REDIS
    SCHED --> REDIS
    MEMO --> REDIS
    
    WS --> NOTIF
```

### Architectural Patterns

- **Microservices with Shared Database:** Logical service separation with coordinated data access - _Rationale:_ Enables independent scaling while maintaining data consistency for complex AI operations
- **Event-Driven Communication:** Redis pub/sub for service coordination - _Rationale:_ Supports async LLM processing and real-time dashboard updates
- **Repository Pattern:** Abstract data access with vector operations - _Rationale:_ Enables testing and future database optimization for memory retrieval
- **Command Query Responsibility Segregation (CQRS):** Separate read/write operations for memory - _Rationale:_ Optimizes both semantic search (read) and memory storage (write) performance
- **Circuit Breaker Pattern:** For external API integrations - _Rationale:_ Ensures system resilience when Calendar/Email/LLM APIs are unavailable

## Tech Stack

This is the **DEFINITIVE** technology selection for the entire project. All development must use these exact versions.

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| **Frontend Language** | TypeScript | 5.3.3 | Type-safe React development | Strong typing prevents runtime errors in dashboard |
| **Frontend Framework** | React | 18.2.0 | Web dashboard UI | Mature ecosystem, excellent real-time capabilities |
| **UI Framework** | TailwindCSS + Custom Components | 3.4.6 | Thoughtkeeper-inspired design | Professional notebook interface, full customization |
| **Animation Library** | Framer Motion | 10.16.4 | Smooth interactions | Enhanced UX with drag-and-drop, transitions |
| **Form Library** | React Hook Form | 7.55.0 | Form management | Performant forms with validation |
| **Icons** | Lucide React | 0.484.0 | Icon system | Consistent, customizable icon library |
| **State Management** | Zustand | 4.4.7 | Client state management | Lightweight, perfect for dashboard state |
| **Backend Language** | Python | 3.11 | API and worker services | Excellent AI/ML ecosystem, FastAPI compatibility |
| **Backend Framework** | FastAPI | 0.104.0 | REST API framework | High performance, automatic OpenAPI docs |
| **API Style** | REST + WebSocket | OpenAPI 3.0 | API communication | REST for CRUD, WebSocket for real-time updates |
| **Database** | PostgreSQL | 15.0 | Primary data store | ACID compliance, pgvector support |
| **Vector Extension** | pgvector | 0.5.1 | Memory embeddings | Native Postgres vector operations |
| **Cache** | Redis | 7.2 | Queues, locks, sessions | High-performance caching and job queues |
| **Message Queue** | Celery | 5.3.0 | Background task processing | Proven Python async task system |
| **File Storage** | Local Storage + MinIO | Latest | Images/attachments (v2) | S3-compatible object storage for self-hosting |
| **Authentication** | JWT + Sessions | - | User authentication | Stateless tokens + session management |
| **Frontend Testing** | Vitest + Testing Library | 1.0.0 | React component testing | Fast, modern testing framework |
| **Backend Testing** | pytest + pytest-asyncio | 7.4.0 | Python API testing | Comprehensive async testing support |
| **E2E Testing** | Playwright | 1.40.0 | End-to-end testing | Reliable cross-browser testing |
| **Build Tool** | Vite | 5.0.0 | Frontend build system | Fast builds, excellent React support |
| **Bundler** | Vite (integrated) | 5.0.0 | Module bundling | Built into Vite for optimal performance |
| **IaC Tool** | Docker Compose + Ansible | Latest | Infrastructure deployment | Simple self-hosted deployment automation |
| **CI/CD** | GitHub Actions | - | Automated testing/deployment | Free, integrated with repository |
| **Monitoring** | Prometheus + Grafana | Latest | System monitoring | Open-source monitoring stack |
| **Logging** | Python logging + Loki | Latest | Centralized logging | Structured logging with search capabilities |
| **CSS Framework** | Tailwind CSS | 3.3.6 | Utility-first styling | Rapid development, consistent design |

**CRITICAL TECHNOLOGY DECISIONS:**

🔍 **Please review this tech stack carefully. Key decisions I made:**

1. **TailwindCSS + Custom Components** for notebook UI - thoughtkeeper-inspired professional design with full control
2. **Zustand** over Redux - lighter weight, perfect for dashboard state management  
3. **pgvector** extension - native Postgres vector operations for memory system
4. **MinIO** for object storage - S3-compatible but self-hosted
5. **Docker Compose + Ansible** for deployment - simple self-hosted infrastructure
6. **Playwright** for E2E testing - handles Telegram bot interactions better than Cypress

**Questions for you:**
- Do these choices align with your infrastructure preferences?
- Any specific version constraints or technology preferences I should adjust?
- Should I modify any selections based on your team's expertise?

## Data Models

The core data models represent the business entities that will be shared between frontend and backend. These models support the PRD's core functions: user management, task/calendar management, memory storage, and message processing.

### User

**Purpose:** Central user entity with Telegram integration and timezone support

**Key Attributes:**
- id: UUID - Primary identifier
- telegram_id: bigint - Telegram user ID (unique)
- email: string - Optional email for web dashboard
- timezone: string - User's timezone (e.g., "America/New_York")
- locale: string - Language preference (e.g., "en-US")
- created_at: timestamp - Account creation time
- preferences: JSONB - User preferences and settings

```typescript
interface User {
  id: string;
  telegram_id: number;
  email?: string;
  timezone: string;
  locale: string;
  created_at: Date;
  preferences: {
    digest_time?: string;
    quiet_hours?: { start: string; end: string };
    memory_consent?: boolean;
  };
}
```

**Relationships:**
- One-to-many with Tasks, Memories, Integrations
- One-to-many with MessageLogs, Digests

### Task

**Purpose:** Represents user tasks/reminders with due times and Telegram integration

**Key Attributes:**
- id: UUID - Primary identifier
- user_id: UUID - Foreign key to User
- notebook_id: UUID - Foreign key to Notebook
- title: string - Task description
- description: string - Optional detailed task description
- due_at: timestamp - Optional due time
- status: enum - pending, in-progress, done, snoozed
- priority: enum - high, medium, low
- time_estimate: string - Optional time estimate
- progress: integer - Completion percentage (0-100)
- source_msg_id: bigint - Telegram message that created task
- tags: string[] - Task tags for additional categorization
- created_at: timestamp - Creation time
- completed_at: timestamp - Optional completion time
- updated_at: timestamp - Last modification time

```typescript
interface Task {
  id: string;
  user_id: string;
  notebook_id: string;
  title: string;
  description?: string;
  due_at?: Date;
  status: 'pending' | 'in-progress' | 'done' | 'snoozed';
  priority: 'high' | 'medium' | 'low';
  time_estimate?: string;
  progress: number; // 0-100
  source_msg_id?: number;
  tags: string[];
  created_at: Date;
  completed_at?: Date;
  updated_at: Date;
}
```

**Relationships:**
- Many-to-one with User
- Many-to-one with Notebook
- One-to-one with RecurrenceRule (optional)

### Notebook

**Purpose:** Contextual task organization with color coding, icons, and metadata

**Key Attributes:**
- id: UUID - Primary identifier
- user_id: UUID - Foreign key to User
- name: string - Notebook display name
- color: string - HEX color code for visual identification
- icon: string - Lucide icon name
- description: string - Optional notebook description
- sort_order: integer - Display order preference
- created_at: timestamp - Creation time
- updated_at: timestamp - Last modification

```typescript
interface Notebook {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  description?: string;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
  
  // Computed fields
  task_count?: number;
  urgent_count?: number;
  recent_activity?: Date;
  progress_indicator?: number;
}
```

**Default Notebooks:**
- **Work** 💼 (`#3B82F6`) - Professional tasks, meetings, projects
- **Personal** 👤 (`#10B981`) - Life management, appointments, personal goals  
- **Hustles** 💰 (`#F59E0B`) - Trading activities, side projects, investments
- **Health** ❤️ (`#EF4444`) - Fitness, medical, wellness tracking
- **Ideas** 💡 (`#EC4899`) - Creative thoughts, future plans, concepts

**Relationships:**
- Many-to-one with User
- One-to-many with Tasks

### Memory

**Purpose:** Long-term memory storage with vector embeddings for semantic search

**Key Attributes:**
- id: UUID - Primary identifier  
- user_id: UUID - Foreign key to User
- type: enum - preference, contact, fact, recurring_pattern
- text: string - Original memory text
- vector: vector(1536) - OpenAI embedding vector
- source_msg_id: bigint - Telegram message source
- pii_masked: boolean - Whether PII was redacted
- created_at: timestamp - Creation time
- updated_at: timestamp - Last update time

```typescript
interface Memory {
  id: string;
  user_id: string;
  type: 'preference' | 'contact' | 'fact' | 'recurring_pattern';
  text: string;
  vector?: number[]; // Embedding vector
  source_msg_id?: number;
  pii_masked: boolean;
  created_at: Date;
  updated_at: Date;
}
```

**Relationships:**
- Many-to-one with User
- Contains vector index for semantic search

### Integration_Credential

**Purpose:** Encrypted storage for OAuth tokens and API credentials

**Key Attributes:**
- id: UUID - Primary identifier
- user_id: UUID - Foreign key to User  
- provider: enum - google_calendar, gmail
- scopes: string[] - Granted OAuth scopes
- token_encrypted: bytes - Encrypted access token
- refresh_token_encrypted: bytes - Encrypted refresh token  
- expires_at: timestamp - Token expiration
- refreshed_at: timestamp - Last refresh time

```typescript
interface IntegrationCredential {
  id: string;
  user_id: string;
  provider: 'google_calendar' | 'gmail';
  scopes: string[];
  token_encrypted: string;
  refresh_token_encrypted?: string;
  expires_at?: Date;
  refreshed_at: Date;
}
```

**Relationships:**
- Many-to-one with User
- Referenced by EventLink for calendar operations

### EventLink

**Purpose:** Links calendar events with local task management

**Key Attributes:**
- id: UUID - Primary identifier
- user_id: UUID - Foreign key to User
- calendar_provider: enum - google_calendar, outlook
- calendar_event_id: string - External calendar event ID
- title: string - Event title
- start_at: timestamp - Event start time
- end_at: timestamp - Event end time
- attendees: string[] - Email addresses of attendees

```typescript
interface EventLink {
  id: string;
  user_id: string;
  calendar_provider: 'google_calendar' | 'outlook';
  calendar_event_id: string;
  title: string;
  start_at: Date;
  end_at: Date;
  attendees: string[];
}
```

**Relationships:**
- Many-to-one with User
- References IntegrationCredential for calendar access

### MessageLog

**Purpose:** Audit trail of all Telegram interactions for debugging and analytics

**Key Attributes:**
- id: UUID - Primary identifier
- user_id: UUID - Foreign key to User
- chat_id: bigint - Telegram chat ID
- content: string - Message content (may be redacted)
- content_type: enum - text, voice, image
- intent: string - Classified intent (schedule, todo, memory, etc.)
- latency_ms: integer - Processing time
- error: string - Optional error message

```typescript
interface MessageLog {
  id: string;
  user_id: string;
  chat_id: number;
  content: string;
  content_type: 'text' | 'voice' | 'image';
  intent?: string;
  latency_ms?: number;
  error?: string;
  created_at: Date;
}
```

**Relationships:**
- Many-to-one with User
- Referenced by Task and Memory for source tracking

### Digest

**Purpose:** Weekly summary generation and storage

**Key Attributes:**
- id: UUID - Primary identifier
- user_id: UUID - Foreign key to User
- period_start: timestamp - Digest period start
- period_end: timestamp - Digest period end
- text: string - Generated digest content
- created_at: timestamp - Generation time

```typescript
interface Digest {
  id: string;
  user_id: string;
  period_start: Date;
  period_end: Date;
  text: string;
  created_at: Date;
}
```

**Relationships:**
- Many-to-one with User
- Aggregates data from Tasks, Events, and Memories

### RecurrenceRule

**Purpose:** Support for recurring tasks and events (post-MVP)

**Key Attributes:**
- id: UUID - Primary identifier
- user_id: UUID - Foreign key to User
- target_type: enum - task, event
- target_id: UUID - ID of target task or event
- rrule: string - RFC 5545 recurrence rule
- timezone: string - Timezone for recurrence
- created_at: timestamp - Rule creation time
- updated_at: timestamp - Last modification

```typescript
interface RecurrenceRule {
  id: string;
  user_id: string;
  target_type: 'task' | 'event';
  target_id: string;
  rrule: string; // RFC 5545 format
  timezone: string;
  created_at: Date;
  updated_at: Date;
}
```

**Relationships:**
- Many-to-one with User
- References Task or EventLink via target_id

## API Specification

Based on the REST + WebSocket API style, here's the comprehensive API specification:

```yaml
openapi: 3.0.0
info:
  title: Messaging Assistant API
  version: 1.0.0
  description: REST API for messaging-first agentic assistant
servers:
  - url: http://localhost:8000/api/v1
    description: Local development server
  - url: https://assistant.yourdomain.com/api/v1
    description: Production server

paths:
  /auth/telegram:
    post:
      summary: Authenticate via Telegram
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                telegram_data:
                  type: object
                  description: Telegram auth data
      responses:
        '200':
          description: Authentication successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  token: string
                  user: $ref: '#/components/schemas/User'

  /tasks:
    get:
      summary: Get user tasks
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [pending, done, snoozed]
        - name: due_date
          in: query
          schema:
            type: string
            format: date
      responses:
        '200':
          description: List of tasks
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Task'
    post:
      summary: Create new task
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TaskCreate'
      responses:
        '201':
          description: Task created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'

  /memories:
    get:
      summary: Search memories
      parameters:
        - name: q
          in: query
          schema:
            type: string
          description: Semantic search query
        - name: type
          in: query
          schema:
            type: string
            enum: [preference, contact, fact, recurring_pattern]
      responses:
        '200':
          description: Relevant memories
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Memory'
    post:
      summary: Store new memory
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MemoryCreate'
      responses:
        '201':
          description: Memory stored
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Memory'

  /webhook/telegram:
    post:
      summary: Telegram webhook endpoint
      description: Receives Telegram updates for processing
      requestBody:
        content:
          application/json:
            schema:
              type: object
              description: Telegram update object
      responses:
        '200':
          description: Update processed
          
  /notebooks:
    get:
      summary: Get user notebooks
      responses:
        '200':
          description: List of user notebooks with task counts
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Notebook'
    post:
      summary: Create new notebook
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NotebookCreate'
      responses:
        '201':
          description: Notebook created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Notebook'

  /notebooks/{notebook_id}:
    put:
      summary: Update notebook
      parameters:
        - name: notebook_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NotebookUpdate'
      responses:
        '200':
          description: Notebook updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Notebook'
    delete:
      summary: Delete notebook
      parameters:
        - name: notebook_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '204':
          description: Notebook deleted

  /notebooks/{notebook_id}/tasks:
    get:
      summary: Get tasks in notebook
      parameters:
        - name: notebook_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
        - name: status
          in: query
          schema:
            type: string
            enum: [pending, in-progress, done, snoozed]
        - name: priority
          in: query
          schema:
            type: string
            enum: [high, medium, low]
      responses:
        '200':
          description: List of tasks in notebook
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Task'

  /integrations/calendar/events:
    get:
      summary: Get calendar events
      responses:
        '200':
          description: Calendar events
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/EventLink'
    post:
      summary: Create calendar event
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EventCreate'
      responses:
        '201':
          description: Event created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/EventLink'

components:
  schemas:
    User:
      type: object
      properties:
        id: { type: string, format: uuid }
        telegram_id: { type: integer }
        email: { type: string, format: email }
        timezone: { type: string }
        locale: { type: string }
        created_at: { type: string, format: date-time }
        preferences: { type: object }
    
    Task:
      type: object
      properties:
        id: { type: string, format: uuid }
        user_id: { type: string, format: uuid }
        notebook_id: { type: string, format: uuid }
        title: { type: string }
        description: { type: string }
        due_at: { type: string, format: date-time }
        status: { type: string, enum: [pending, in-progress, done, snoozed] }
        priority: { type: string, enum: [high, medium, low] }
        time_estimate: { type: string }
        progress: { type: integer, minimum: 0, maximum: 100 }
        source_msg_id: { type: integer }
        tags: { type: array, items: { type: string } }
        created_at: { type: string, format: date-time }
        completed_at: { type: string, format: date-time }
        updated_at: { type: string, format: date-time }
    
    Notebook:
      type: object
      properties:
        id: { type: string, format: uuid }
        user_id: { type: string, format: uuid }
        name: { type: string }
        color: { type: string, pattern: '^#[0-9A-F]{6}$' }
        icon: { type: string }
        description: { type: string }
        sort_order: { type: integer }
        created_at: { type: string, format: date-time }
        updated_at: { type: string, format: date-time }
        task_count: { type: integer }
        urgent_count: { type: integer }
        recent_activity: { type: string, format: date-time }
        progress_indicator: { type: number, minimum: 0, maximum: 100 }
    
    Memory:
      type: object
      properties:
        id: { type: string, format: uuid }
        user_id: { type: string, format: uuid }
        type: { type: string, enum: [preference, contact, fact, recurring_pattern] }
        text: { type: string }
        source_msg_id: { type: integer }
        pii_masked: { type: boolean }
        created_at: { type: string, format: date-time }
        updated_at: { type: string, format: date-time }

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - BearerAuth: []
```

## Components

Based on the architectural patterns, tech stack, and data models, here are the major logical components across the fullstack:

### API Gateway Service

**Responsibility:** Single entry point for all HTTP requests with rate limiting, authentication, and routing

**Key Interfaces:**
- REST API endpoints (OpenAPI spec above)
- WebSocket connections for real-time updates
- Telegram webhook receiver

**Dependencies:** Redis (rate limiting), Authentication Service
**Technology Stack:** FastAPI with WebSocket support, Redis for rate limiting

### LLM Orchestrator Service

**Responsibility:** Core intelligence - processes user messages, classifies intent, coordinates tool calls

**Key Interfaces:**
- Message processing pipeline
- Tool selection and execution API
- Function calling interface with OpenAI/Anthropic

**Dependencies:** Memory Service, Tool Router, External LLM APIs
**Technology Stack:** Python with OpenAI SDK, Anthropic SDK, async processing

### Memory Service

**Responsibility:** Manages short-term and long-term memory with vector embeddings for semantic search

**Key Interfaces:**
- Memory storage API (create, update, search)
- Vector similarity search
- PII detection and redaction

**Dependencies:** Postgres + pgvector, OpenAI Embeddings API
**Technology Stack:** Python with pgvector, sentence-transformers, PII detection libraries

### Tool Router Service

**Responsibility:** Executes external tool calls (calendar, email, tasks) with error handling and retries

**Key Interfaces:**
- Tool registry and selection
- Calendar operations (Google Calendar API)
- Email operations (Gmail API)
- Task CRUD operations

**Dependencies:** Integration Credentials, External APIs, Circuit Breaker
**Technology Stack:** Python with Google APIs client, OAuth handling, retry logic

### Notification Service

**Responsibility:** Handles scheduled notifications, reminders, and digest generation

**Key Interfaces:**
- Scheduled notification queue
- Telegram message sending
- Digest generation and delivery

**Dependencies:** Telegram Bot API, Redis queues, Celery workers
**Technology Stack:** Celery with Redis broker, Telegram Bot API client

### Authentication Service

**Responsibility:** Telegram-based authentication and JWT token management

**Key Interfaces:**
- Telegram auth verification
- JWT token generation and validation
- Session management

**Dependencies:** Redis (sessions), Telegram API (validation)
**Technology Stack:** FastAPI security, PyJWT, Telegram bot verification

### Web Dashboard (Frontend)

**Responsibility:** React-based web interface for task management, memory browsing, and system monitoring

**Key Interfaces:**
- Task management UI
- Memory search and browsing
- Real-time notification display
- Integration management

**Dependencies:** API Gateway, WebSocket connections
**Technology Stack:** React 18, Ant Design, Zustand state management, Vite build

### Component Diagrams

```mermaid
graph TB
    subgraph "Frontend Layer"
        DASH[Web Dashboard<br/>React + Ant Design]
        WS_CLIENT[WebSocket Client]
    end
    
    subgraph "API Layer"
        GATEWAY[API Gateway<br/>FastAPI + Rate Limiting]
        AUTH[Auth Service<br/>JWT + Telegram Verify]
    end
    
    subgraph "Business Logic Layer"
        ORCHESTRATOR[LLM Orchestrator<br/>Intent + Tool Calling]
        MEMORY[Memory Service<br/>Vector Search + Storage]
        TOOLS[Tool Router<br/>Calendar + Email + Tasks]
        NOTIFICATIONS[Notification Service<br/>Reminders + Digests]
    end
    
    subgraph "Background Processing"
        CELERY_WORKERS[Celery Workers<br/>Async Processing]
        SCHEDULER[Scheduler<br/>Cron + Reminders]
    end
    
    subgraph "Data Layer"
        POSTGRES[(Postgres + pgvector<br/>Memory + Tasks + Users)]
        REDIS[(Redis Cluster<br/>Queues + Cache + Sessions)]
        MINIO[(MinIO<br/>Object Storage)]
    end
    
    subgraph "External APIs"
        TELEGRAM[Telegram Bot API]
        GOOGLE[Google Calendar/Gmail]
        OPENAI[OpenAI/Anthropic]
    end
    
    DASH --> GATEWAY
    WS_CLIENT --> NOTIFICATIONS
    GATEWAY --> AUTH
    GATEWAY --> ORCHESTRATOR
    GATEWAY --> MEMORY
    GATEWAY --> TOOLS
    
    ORCHESTRATOR --> MEMORY
    ORCHESTRATOR --> TOOLS
    ORCHESTRATOR --> OPENAI
    
    TOOLS --> GOOGLE
    NOTIFICATIONS --> TELEGRAM
    
    CELERY_WORKERS --> REDIS
    SCHEDULER --> REDIS
    MEMORY --> REDIS
    
    AUTH --> REDIS
    MEMORY --> POSTGRES
    TOOLS --> POSTGRES
    ORCHESTRATOR --> POSTGRES
    
    NOTIFICATIONS --> MINIO
```

## External APIs

### Google Calendar API

- **Purpose:** Calendar event creation, modification, and synchronization
- **Documentation:** https://developers.google.com/calendar/api
- **Base URL:** https://www.googleapis.com/calendar/v3
- **Authentication:** OAuth 2.0 with stored refresh tokens
- **Rate Limits:** 100 requests/second per user

**Key Endpoints Used:**
- `POST /calendars/primary/events` - Create calendar events
- `GET /calendars/primary/events` - List user's events
- `PATCH /calendars/{calendarId}/events/{eventId}` - Update events
- `DELETE /calendars/{calendarId}/events/{eventId}` - Delete events

**Integration Notes:** Implement exponential backoff for rate limiting, store calendar_event_id for bi-directional sync

### Gmail API

- **Purpose:** Email summarization, sending, and thread management (v1.5)
- **Documentation:** https://developers.google.com/gmail/api
- **Base URL:** https://gmail.googleapis.com/gmail/v1
- **Authentication:** OAuth 2.0 with stored refresh tokens
- **Rate Limits:** 250 quota units/user/second

**Key Endpoints Used:**
- `GET /users/me/messages` - List inbox messages
- `GET /users/me/messages/{id}` - Get message details
- `POST /users/me/messages/send` - Send emails
- `POST /users/me/drafts` - Create draft emails

**Integration Notes:** Implement careful scope management, batch API calls for inbox summarization

### OpenAI API

- **Purpose:** LLM function calling, intent classification, and text embeddings
- **Documentation:** https://platform.openai.com/docs/api-reference
- **Base URL:** https://api.openai.com/v1
- **Authentication:** Bearer token
- **Rate Limits:** 10,000 TPM for GPT-4, 1,000,000 TPM for embeddings

**Key Endpoints Used:**
- `POST /chat/completions` - Function calling and intent classification
- `POST /embeddings` - Generate memory embeddings

**Integration Notes:** Implement token counting, fallback to Anthropic, streaming for long responses

### Anthropic API

- **Purpose:** Fallback LLM provider for redundancy
- **Documentation:** https://docs.anthropic.com/claude/reference
- **Base URL:** https://api.anthropic.com/v1
- **Authentication:** x-api-key header
- **Rate Limits:** Varies by plan

**Key Endpoints Used:**
- `POST /messages` - Claude function calling

**Integration Notes:** Adapter pattern for consistent interface with OpenAI

### Telegram Bot API

- **Purpose:** Receive and send messages, handle inline keyboards
- **Documentation:** https://core.telegram.org/bots/api
- **Base URL:** https://api.telegram.org/bot{token}
- **Authentication:** Bot token in URL
- **Rate Limits:** 30 messages/second

**Key Endpoints Used:**
- `POST /sendMessage` - Send text messages
- `POST /editMessageText` - Update messages with buttons
- `POST /setWebhook` - Configure webhook endpoint

**Integration Notes:** Use webhook mode for real-time processing, implement message deduplication

## Core Workflows

### Workflow 1: Schedule Calendar Event with Notebook Auto-Classification

```mermaid
sequenceDiagram
    participant U as User
    participant T as Telegram
    participant G as API Gateway
    participant O as LLM Orchestrator
    participant M as Memory Service
    participant NB as Notebook Service
    participant TR as Tool Router
    participant GC as Google Calendar
    participant N as Notifications
    participant D as Dashboard

    U->>T: "book my calendar for meeting with Khan J tomorrow 11am"
    T->>G: POST /webhook/telegram
    G->>O: Process message
    O->>M: Search for "Khan J" contacts
    M-->>O: Return contact matches
    
    O->>O: Analyze context: "meeting" + "Khan J" → Work category
    O->>NB: Classify into notebook (likely "Work")
    NB-->>O: Return Work notebook_id
    
    alt Multiple Khans found
        O->>N: Send disambiguation request
        N->>T: "I see 2 Khans: [Khan Jamal][Khan J.]..."
        T->>U: Display options with notebook context
        U->>T: "first"
        T->>G: POST /webhook/telegram
        G->>O: Process selection
    end
    
    O->>TR: create_calendar_event(title, start_iso, end_iso, attendees)
    TR->>GC: POST /calendars/primary/events
    GC-->>TR: Return event details
    TR-->>O: Success with event_id
    
    O->>TR: create_task(title, due_at, notebook_id=work, status=pending)
    TR-->>O: Task created in Work notebook
    
    O->>N: Send confirmation
    N->>T: "✅ Created 'Meeting with Khan Jamal' in Work notebook"
    T->>U: Show confirmation + notebook badge
    
    O->>D: WebSocket update (new event + task in Work notebook)
    D->>D: Update Work notebook card stats
    D->>D: Refresh calendar and notebook views
```

### Workflow 2: Memory Storage and Retrieval

```mermaid
sequenceDiagram
    participant U as User
    participant T as Telegram
    participant G as API Gateway
    participant O as LLM Orchestrator
    participant M as Memory Service
    participant AI as OpenAI Embeddings
    participant DB as Postgres

    U->>T: "remember I prefer vegetarian food"
    T->>G: POST /webhook/telegram
    G->>O: Process message
    O->>O: Detect "remember" keyword
    O->>AI: Generate embedding for "prefer vegetarian food"
    AI-->>O: Return vector[1536]
    O->>M: store_memory(text, type=preference, vector)
    M->>DB: INSERT INTO memory
    DB-->>M: Success
    M-->>O: Memory stored
    O->>T: "✅ I'll remember you prefer vegetarian food"

    Note over U,DB: Later retrieval
    U->>T: "what do I prefer?"
    T->>G: POST /webhook/telegram
    G->>O: Process message
    O->>AI: Generate query embedding
    AI-->>O: Return query vector
    O->>M: semantic_search(vector, type=preference)
    M->>DB: Vector similarity query
    DB-->>M: Return matching memories
    M-->>O: Relevant memories with sources
    O->>T: "You prefer vegetarian food (source: chat #134, updated Aug 22)"
```

### Workflow 3: Notebook-First Dashboard Interaction

```mermaid
sequenceDiagram
    participant U as User (Web)
    participant D as Dashboard
    participant G as API Gateway
    participant NB as Notebook Service
    participant TS as Task Service
    participant W as WebSocket

    U->>D: Access dashboard homepage
    D->>G: GET /notebooks (with stats)
    G->>NB: Fetch notebooks + compute stats
    NB-->>G: Return notebooks with task counts, urgency
    G-->>D: Notebook cards data
    D->>D: Render notebook grid with visual indicators
    
    Note over U,D: User clicks on "Work" notebook (12 tasks, 3 urgent)
    U->>D: Click Work notebook card
    D->>G: GET /notebooks/work-id/tasks
    G->>TS: Fetch work tasks with filters
    TS-->>G: Return work tasks
    G-->>D: Work notebook tasks
    D->>D: Show Work notebook view (Kanban board)
    
    Note over U,D: User switches to Calendar view
    U->>D: Click Calendar view toggle
    D->>D: Switch to calendar layout
    D->>D: Display work tasks in calendar format
    
    Note over U,D: Real-time update from Telegram
    W->>D: WebSocket: new task in Work notebook
    D->>D: Update Work notebook card (13 tasks, 3 urgent)
    D->>D: Add new task to current view if Work active
    D->>D: Show toast notification "New work task added"
```

### Workflow 4: Intelligent Task Classification

```mermaid
sequenceDiagram
    participant U as User
    participant T as Telegram
    participant G as API Gateway
    participant O as LLM Orchestrator
    participant M as Memory Service
    participant NB as Notebook Service
    participant TS as Task Service
    participant D as Dashboard

    U->>T: "buy protein powder and schedule gym session"
    T->>G: POST /webhook/telegram
    G->>O: Process message
    
    O->>M: Search user patterns: gym, protein, fitness
    M-->>O: Return health-related preferences
    
    O->>O: Analyze: "protein powder" + "gym" → Health category
    O->>NB: Get Health notebook details
    NB-->>O: Health notebook metadata
    
    O->>TS: Create task 1: "Buy protein powder" (Health, priority: medium)
    O->>TS: Create task 2: "Schedule gym session" (Health, priority: high)
    TS-->>O: Tasks created successfully
    
    O->>T: "✅ Added 2 tasks to Health notebook:\n• Buy protein powder\n• Schedule gym session"
    
    O->>D: WebSocket: health_notebook_updated
    D->>D: Update Health notebook card (6→8 tasks)
    D->>D: Show notification if Health notebook active
```

## Database Schema

Transform the conceptual data models into concrete PostgreSQL schema with pgvector extension:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    email VARCHAR(255),
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    locale VARCHAR(10) NOT NULL DEFAULT 'en-US',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integration credentials table
CREATE TABLE integration_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('google_calendar', 'gmail')),
    scopes TEXT[] NOT NULL,
    token_encrypted BYTEA NOT NULL,
    refresh_token_encrypted BYTEA,
    expires_at TIMESTAMP WITH TIME ZONE,
    refreshed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- Notebooks table
CREATE TABLE notebooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6', -- HEX color code
    icon VARCHAR(50) NOT NULL DEFAULT 'Book', -- Lucide icon name
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notebook_id UUID NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    due_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'done', 'snoozed')),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    time_estimate VARCHAR(50),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    source_msg_id BIGINT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event links table
CREATE TABLE event_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    calendar_provider VARCHAR(50) NOT NULL CHECK (calendar_provider IN ('google_calendar', 'outlook')),
    calendar_event_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attendees TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, calendar_provider, calendar_event_id)
);

-- Memory table with vector support
CREATE TABLE memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('preference', 'contact', 'fact', 'recurring_pattern')),
    text TEXT NOT NULL,
    vector vector(1536), -- OpenAI embedding dimension
    source_msg_id BIGINT,
    pii_masked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message logs table
CREATE TABLE message_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chat_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'voice', 'image')),
    intent VARCHAR(100),
    latency_ms INTEGER,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Digests table
CREATE TABLE digests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recurrence rules table (post-MVP)
CREATE TABLE recurrence_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('task', 'event')),
    target_id UUID NOT NULL,
    rrule TEXT NOT NULL, -- RFC 5545 recurrence rule
    timezone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_notebooks_user_sort ON notebooks(user_id, sort_order);
CREATE INDEX idx_notebooks_user_name ON notebooks(user_id, name);
CREATE INDEX idx_tasks_user_notebook ON tasks(user_id, notebook_id);
CREATE INDEX idx_tasks_notebook_status ON tasks(notebook_id, status);
CREATE INDEX idx_tasks_user_due ON tasks(user_id, due_at) WHERE due_at IS NOT NULL;
CREATE INDEX idx_tasks_status_priority ON tasks(status, priority) WHERE status != 'done';
CREATE INDEX idx_tasks_tags ON tasks USING gin(tags);
CREATE INDEX idx_memories_user_type ON memories(user_id, type);
CREATE INDEX idx_memories_vector ON memories USING ivfflat (vector vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_message_logs_user_created ON message_logs(user_id, created_at);
CREATE INDEX idx_event_links_user_start ON event_links(user_id, start_at);
CREATE INDEX idx_integration_creds_user_provider ON integration_credentials(user_id, provider);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION search_memories(
    query_vector vector(1536),
    user_uuid UUID,
    memory_type VARCHAR(50) DEFAULT NULL,
    similarity_threshold REAL DEFAULT 0.7,
    result_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    text TEXT,
    type VARCHAR(50),
    similarity REAL,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT m.id, m.text, m.type, 
           (1 - (m.vector <=> query_vector)) as similarity,
           m.created_at
    FROM memories m
    WHERE m.user_id = user_uuid
      AND (memory_type IS NULL OR m.type = memory_type)
      AND (1 - (m.vector <=> query_vector)) > similarity_threshold
    ORDER BY m.vector <=> query_vector
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;
```

## Frontend Architecture

### Component Architecture

**Component Organization** (Thoughtkeeper-Inspired Structure):
```
src/components/
├── layout/                 # Layout components
│   ├── AppLayout.tsx      # Main app shell with notebook navigation
│   ├── Header.tsx         # Top header with user info and quick actions
│   ├── Sidebar.tsx        # Contextual sidebar for filters
│   └── NotebookNavigation.tsx # Horizontal notebook tabs
├── notebooks/             # Notebook management components
│   ├── NotebookGrid.tsx   # Homepage notebook cards grid
│   ├── NotebookCard.tsx   # Individual notebook card with stats
│   ├── NotebookManager.tsx # Create/edit notebook modal
│   ├── NotebookFilters.tsx # Advanced filtering controls
│   └── NotebookStats.tsx  # Progress and analytics
├── tasks/                 # Task management components
│   ├── TaskViews/         # Multiple view modes
│   │   ├── KanbanBoard.tsx # Drag-and-drop board view
│   │   ├── TaskListView.tsx # Traditional list view
│   │   └── TaskCalendarView.tsx # Calendar-based view
│   ├── TaskItem.tsx       # Individual task component
│   ├── TaskCard.tsx       # Card-style task display
│   ├── TaskModal.tsx      # Create/edit task modal
│   ├── TaskFilters.tsx    # Task filtering controls
│   └── BulkOperationsToolbar.tsx # Multi-select actions
├── memories/              # Memory management components
│   ├── MemorySearch.tsx   # Semantic memory search
│   ├── MemoryList.tsx     # Memory display list
│   ├── MemoryItem.tsx     # Individual memory display
│   └── MemoryFilters.tsx  # Memory type filtering
├── integrations/          # Integration management
│   ├── IntegrationList.tsx # Connected services
│   ├── CalendarConnect.tsx # Google Calendar setup
│   ├── EmailConnect.tsx   # Gmail integration
│   └── TelegramStatus.tsx # Bot connection status
├── ui/                    # Thoughtkeeper-style UI components
│   ├── Button.tsx         # Custom button with variants
│   ├── Input.tsx          # Form input with validation
│   ├── Select.tsx         # Dropdown select component
│   ├── Checkbox.tsx       # Styled checkbox
│   ├── ContextualSidebar.tsx # Sliding sidebar
│   ├── SearchOverlay.tsx  # Full-screen search
│   ├── NotificationToast.tsx # Toast notifications
│   ├── QuickCaptureBar.tsx # Floating action input
│   └── LoadingSpinner.tsx # Loading states
├── common/                # Shared utilities
│   ├── ErrorBoundary.tsx  # Error handling
│   ├── ConfirmDialog.tsx  # Confirmation modals
│   ├── ProtectedRoute.tsx # Auth routing
│   └── ScrollToTop.tsx    # Navigation helper
└── hooks/                 # Custom React hooks
    ├── useAuth.ts         # Authentication state
    ├── useNotebooks.ts    # Notebook management
    ├── useTasks.ts        # Task operations
    ├── useMemories.ts     # Memory operations
    ├── useWebSocket.ts    # Real-time updates
    ├── useLocalStorage.ts # Persistent preferences
    └── useKeyboardShortcuts.ts # Productivity shortcuts
```

**Component Template** (Thoughtkeeper-Style):
```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, User, MoreHorizontal } from 'lucide-react';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

interface TaskCardProps {
  task: Task;
  notebook: Notebook;
  onComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  notebook,
  onComplete, 
  onEdit, 
  onDelete,
  isDragging = false
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-error';
      case 'medium': return 'border-l-warning';
      case 'low': return 'border-l-success';
      default: return 'border-l-border';
    }
  };

  const formatDueDate = (dueAt?: Date) => {
    if (!dueAt) return null;
    const now = new Date();
    const due = new Date(dueAt);
    const isOverdue = due < now && task.status !== 'done';
    
    return (
      <div className={cn(
        "flex items-center space-x-1 text-sm",
        isOverdue ? "text-error" : "text-text-secondary"
      )}>
        <Clock size={14} />
        <span>{due.toLocaleDateString()}</span>
      </div>
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "bg-background border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-all",
        "border-l-4", getPriorityColor(task.priority),
        isDragging && "rotate-2 shadow-elevated"
      )}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: notebook.color }}
          />
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            {notebook.name}
          </span>
        </div>
        <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
      </div>

      {/* Task Content */}
      <div className="mb-3">
        <h4 className="font-medium text-foreground mb-1 line-clamp-2">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-sm text-text-secondary line-clamp-2">
            {task.description}
          </p>
        )}
      </div>

      {/* Task Metadata */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-3">
          {formatDueDate(task.due_at)}
          {task.time_estimate && (
            <div className="flex items-center space-x-1 text-text-secondary">
              <User size={14} />
              <span>{task.time_estimate}</span>
            </div>
          )}
        </div>
        
        {/* Progress Bar */}
        {task.progress > 0 && (
          <div className="flex items-center space-x-2">
            <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <span className="text-xs text-text-secondary">{task.progress}%</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div className="flex items-center space-x-2">
          {task.tags.slice(0, 2).map((tag) => (
            <span 
              key={tag}
              className="px-2 py-1 text-xs bg-muted rounded-md text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(task)}
          >
            Edit
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => onComplete(task.id)}
          >
            {task.status === 'done' ? 'Completed' : 'Complete'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
```

### State Management Architecture

**State Structure** (Notebook-First Architecture):
```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (telegramData: any) => Promise<void>;
  logout: () => void;
}

// stores/notebookStore.ts
interface NotebookState {
  notebooks: Notebook[];
  activeNotebook: string | 'all';
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchNotebooks: () => Promise<void>;
  createNotebook: (notebook: Omit<Notebook, 'id' | 'created_at'>) => Promise<void>;
  updateNotebook: (id: string, updates: Partial<Notebook>) => Promise<void>;
  deleteNotebook: (id: string) => Promise<void>;
  setActiveNotebook: (notebookId: string | 'all') => void;
  
  // Computed
  getNotebookById: (id: string) => Notebook | undefined;
  getActiveNotebook: () => Notebook | null;
  getNotebookStats: (id: string) => {
    totalTasks: number;
    completedTasks: number;
    urgentTasks: number;
    overdueCount: number;
    progressPercentage: number;
  };
}

// stores/taskStore.ts
interface TaskState {
  tasks: Task[];
  filteredTasks: Task[];
  loading: boolean;
  error: string | null;
  viewMode: 'board' | 'list' | 'calendar';
  selectedTasks: string[];
  
  filters: {
    status: Task['status'] | 'all';
    priority: Task['priority'] | 'all';
    dueDateRange: [Date | null, Date | null];
    notebook: string | 'all';
    tags: string[];
    searchQuery: string;
  };
  
  // Actions
  fetchTasks: (notebookId?: string) => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'created_at'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  bulkUpdateTasks: (taskIds: string[], updates: Partial<Task>) => Promise<void>;
  
  // View Management
  setViewMode: (mode: 'board' | 'list' | 'calendar') => void;
  setFilters: (filters: Partial<TaskState['filters']>) => void;
  clearFilters: () => void;
  
  // Selection
  toggleTaskSelection: (taskId: string) => void;
  selectAllTasks: (notebookId?: string) => void;
  clearSelection: () => void;
  
  // Computed
  getTasksByNotebook: (notebookId: string) => Task[];
  getTasksByStatus: (status: Task['status']) => Task[];
  getOverdueTasks: () => Task[];
  getUpcomingTasks: (days: number) => Task[];
}

// stores/memoryStore.ts
interface MemoryState {
  memories: Memory[];
  searchQuery: string;
  searchResults: Memory[];
  loading: boolean;
  filters: {
    type: Memory['type'] | 'all';
    dateRange: [Date | null, Date | null];
  };
  
  // Actions
  searchMemories: (query: string) => Promise<void>;
  storeMemory: (memory: Omit<Memory, 'id' | 'created_at'>) => Promise<void>;
  updateMemory: (id: string, updates: Partial<Memory>) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  setFilters: (filters: Partial<MemoryState['filters']>) => void;
  
  // Computed
  getMemoriesByType: (type: Memory['type']) => Memory[];
  getRecentMemories: (limit: number) => Memory[];
}

// stores/notificationStore.ts
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isEnabled: boolean;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  toggleNotifications: () => void;
  
  // Real-time updates
  subscribeToUpdates: () => void;
  unsubscribeFromUpdates: () => void;
}

// stores/integrationStore.ts
interface IntegrationState {
  credentials: IntegrationCredential[];
  connectionStatus: Record<string, 'connected' | 'disconnected' | 'error'>;
  loading: boolean;
  
  // Actions
  connectIntegration: (provider: string, scopes: string[]) => Promise<void>;
  disconnectIntegration: (provider: string) => Promise<void>;
  refreshToken: (provider: string) => Promise<void>;
  checkConnectionStatus: () => Promise<void>;
  
  // Computed
  isConnected: (provider: string) => boolean;
  getCredential: (provider: string) => IntegrationCredential | undefined;
}
```

**State Management Patterns:**
- Separate stores for each domain (auth, tasks, memories, notifications)
- Async actions with loading states and error handling
- Real-time updates via WebSocket integration
- Persistent state in localStorage for user preferences

### Routing Architecture

**Route Organization:**
```
src/pages/
├── index.tsx              # Dashboard home
├── login.tsx              # Telegram login
├── tasks/
│   ├── index.tsx          # Task list view
│   └── [id].tsx           # Task detail view
├── memories/
│   ├── index.tsx          # Memory search/browse
│   └── search.tsx         # Advanced memory search
├── integrations/
│   ├── index.tsx          # Integration management
│   ├── calendar.tsx       # Calendar integration
│   └── email.tsx          # Email integration
└── settings/
    ├── index.tsx          # User settings
    └── privacy.tsx        # Privacy controls
```

**Protected Route Pattern:**
```typescript
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Usage in router
<Route path="/dashboard" element={
  <ProtectedRoute>
    <DashboardLayout />
  </ProtectedRoute>
} />
```

### Frontend Services Layer

**API Client Setup:**
```typescript
// services/api.ts
import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '../stores/authStore';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
      timeout: 10000,
    });

    // Request interceptor for auth token
    this.client.interceptors.request.use((config) => {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().logout();
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response.data;
  }
}

export const apiClient = new ApiClient();
```

**Service Example:**
```typescript
// services/taskService.ts
import { apiClient } from './api';
import { Task } from '../types';

export class TaskService {
  async getTasks(filters?: { status?: string; due_date?: string }): Promise<Task[]> {
    return apiClient.get<Task[]>('/tasks', filters);
  }

  async createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task> {
    return apiClient.post<Task>('/tasks', task);
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    return apiClient.put<Task>(`/tasks/${id}`, updates);
  }

  async deleteTask(id: string): Promise<void> {
    return apiClient.delete(`/tasks/${id}`);
  }
}

export const taskService = new TaskService();
```

## Backend Architecture

### Service Architecture

**FastAPI Service Organization:**
```
src/
├── api/                    # FastAPI applications
│   ├── main.py            # Main FastAPI app
│   ├── gateway.py         # API Gateway routes
│   ├── auth.py            # Authentication routes
│   └── websocket.py       # WebSocket endpoints
├── services/              # Business logic services
│   ├── orchestrator.py    # LLM orchestration
│   ├── memory.py          # Memory management
│   ├── tools.py           # Tool router
│   ├── notifications.py  # Notification service
│   └── integrations/      # External API integrations
│       ├── google_calendar.py
│       ├── gmail.py
│       ├── telegram.py
│       └── llm_providers.py
├── models/                # SQLAlchemy models
│   ├── user.py
│   ├── task.py
│   ├── memory.py
│   ├── integration.py
│   └── base.py
├── workers/               # Celery workers
│   ├── celery_app.py      # Celery configuration
│   ├── reminder_worker.py # Reminder processing
│   ├── digest_worker.py   # Weekly digest generation
│   └── llm_worker.py      # Async LLM processing
└── utils/                 # Shared utilities
    ├── security.py        # Encryption/JWT
    ├── vector_ops.py      # Vector operations
    ├── rate_limit.py      # Rate limiting
    └── error_handlers.py  # Global error handling
```

**FastAPI Service Template:**
```python
# services/orchestrator.py
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
import openai
from .memory import MemoryService
from .tools import ToolRouter
from ..models.user import User
from ..utils.database import get_db
from ..utils.security import get_current_user

class LLMOrchestrator:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
        self.memory_service = MemoryService(db)
        self.tool_router = ToolRouter(db)
        
    async def process_message(
        self, 
        user: User,
        message_content: str,
        message_id: int
    ) -> Dict[str, Any]:
        """Process incoming Telegram message through LLM orchestrator"""
        
        # Retrieve relevant memories
        memories = await self.memory_service.semantic_search(
            user_id=user.id,
            query=message_content,
            limit=5
        )
        
        # Build context for LLM
        context = {
            "user_preferences": memories,
            "message": message_content,
            "available_tools": self.tool_router.get_available_tools(),
            "timezone": user.timezone
        }
        
        # Call LLM with function calling
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": self._build_system_prompt(context)},
                {"role": "user", "content": message_content}
            ],
            functions=self.tool_router.get_function_schemas(),
            function_call="auto"
        )
        
        # Execute function calls if any
        if response.choices[0].message.get("function_call"):
            function_result = await self.tool_router.execute_function(
                function_call=response.choices[0].message["function_call"],
                user=user
            )
            return function_result
            
        return {"reply": response.choices[0].message["content"]}
```

### Database Architecture

**Data Access Layer:**
```python
# models/base.py
from sqlalchemy import create_engine, Column, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import UUID
import uuid

Base = declarative_base()

class BaseModel(Base):
    __abstract__ = True
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Repository Pattern Example
class MemoryRepository:
    def __init__(self, db: Session):
        self.db = db
        
    async def semantic_search(
        self, 
        user_id: str, 
        query_vector: List[float],
        memory_type: str = None,
        limit: int = 10
    ) -> List[Memory]:
        """Perform vector similarity search"""
        query = """
        SELECT * FROM search_memories(%s, %s, %s, 0.7, %s)
        """
        result = self.db.execute(
            query, 
            (query_vector, user_id, memory_type, limit)
        )
        return [Memory.from_row(row) for row in result.fetchall()]
        
    async def store_memory(self, memory_data: Dict) -> Memory:
        """Store new memory with vector embedding"""
        memory = Memory(**memory_data)
        self.db.add(memory)
        self.db.commit()
        self.db.refresh(memory)
        return memory
```

### Authentication and Authorization

**Auth Flow:**
```mermaid
sequenceDiagram
    participant U as User
    participant D as Dashboard
    participant A as Auth Service
    participant T as Telegram API
    participant R as Redis

    U->>D: Access dashboard
    D->>D: Check localStorage for token
    alt No token found
        D->>D: Redirect to /login
        U->>D: Click "Login with Telegram"
        D->>A: POST /auth/telegram/init
        A->>D: Return Telegram Widget URL
        D->>U: Show Telegram login widget
        U->>T: Complete Telegram OAuth
        T->>A: POST /auth/telegram/callback
        A->>T: Verify auth data
        T-->>A: Auth data valid
        A->>R: Store session
        A->>D: Return JWT token + user data
        D->>D: Store token in localStorage
    end
    D->>A: Validate token
    A->>R: Check session validity
    R-->>A: Session valid
    A-->>D: User authenticated
    D->>D: Load dashboard
```

**Auth Middleware:**
```python
# utils/security.py
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from .database import get_db
from ..models.user import User

security = HTTPBearer()

async def get_current_user(
    token: str = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

# Telegram auth verification
async def verify_telegram_auth(auth_data: dict) -> bool:
    """Verify Telegram auth data integrity"""
    import hashlib
    import hmac
    
    bot_token = settings.TELEGRAM_BOT_TOKEN
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    
    # Verify hash signature
    received_hash = auth_data.pop('hash')
    data_check_string = '\n'.join([f"{k}={v}" for k, v in sorted(auth_data.items())])
    
    calculated_hash = hmac.new(
        secret_key, 
        data_check_string.encode(), 
        hashlib.sha256
    ).hexdigest()
    
    return calculated_hash == received_hash
```

## Unified Project Structure

Monorepo structure that accommodates both frontend and backend with shared packages:

```
messaging-assistant/
├── .github/                    # CI/CD workflows
│   └── workflows/
│       ├── ci.yaml            # Test and lint
│       ├── deploy-api.yaml    # Backend deployment
│       └── deploy-web.yaml    # Frontend deployment
├── apps/                      # Application packages
│   ├── web/                   # React dashboard application (Thoughtkeeper-inspired)
│   │   ├── src/
│   │   │   ├── components/    # React components (thoughtkeeper structure)
│   │   │   │   ├── layout/    # AppLayout, Header, NotebookNavigation, Sidebar
│   │   │   │   ├── notebooks/ # NotebookGrid, NotebookCard, NotebookManager, NotebookStats
│   │   │   │   ├── tasks/     # TaskViews/, TaskItem, TaskCard, TaskModal, TaskFilters, BulkOperationsToolbar
│   │   │   │   │   └── TaskViews/ # KanbanBoard, TaskListView, TaskCalendarView
│   │   │   │   ├── memories/  # MemorySearch, MemoryList, MemoryItem, MemoryFilters
│   │   │   │   ├── integrations/ # IntegrationList, CalendarConnect, EmailConnect, TelegramStatus
│   │   │   │   ├── ui/        # Thoughtkeeper-style UI components
│   │   │   │   │   ├── Button.tsx      # Custom button with variants
│   │   │   │   │   ├── Input.tsx       # Form input with validation
│   │   │   │   │   ├── Select.tsx      # Dropdown select
│   │   │   │   │   ├── Checkbox.tsx    # Styled checkbox
│   │   │   │   │   ├── ContextualSidebar.tsx # Sliding sidebar
│   │   │   │   │   ├── SearchOverlay.tsx # Full-screen search
│   │   │   │   │   ├── NotificationToast.tsx # Toast notifications
│   │   │   │   │   ├── QuickCaptureBar.tsx # Floating action input
│   │   │   │   │   └── LoadingSpinner.tsx # Loading states
│   │   │   │   └── common/    # Shared utilities
│   │   │   │       ├── ErrorBoundary.tsx   # Error handling
│   │   │   │       ├── ConfirmDialog.tsx   # Confirmation modals
│   │   │   │       ├── ProtectedRoute.tsx  # Auth routing
│   │   │   │       └── ScrollToTop.tsx     # Navigation helper
│   │   │   ├── pages/         # Page components/routes (notebook-first)
│   │   │   │   ├── index.tsx  # Notebook grid homepage
│   │   │   │   ├── login.tsx  # Telegram login
│   │   │   │   ├── notebook/  # Notebook-specific pages
│   │   │   │   │   ├── [id].tsx         # Individual notebook view
│   │   │   │   │   └── manage.tsx       # Notebook management
│   │   │   │   ├── memories/  # Memory browsing pages
│   │   │   │   │   ├── index.tsx        # Memory search/browse
│   │   │   │   │   └── search.tsx       # Advanced memory search
│   │   │   │   ├── integrations/ # Integration management
│   │   │   │   │   ├── index.tsx        # Integration overview
│   │   │   │   │   ├── calendar.tsx     # Calendar setup
│   │   │   │   │   └── telegram.tsx     # Bot status
│   │   │   │   └── settings/  # User settings pages
│   │   │   │       ├── index.tsx        # General settings
│   │   │   │       ├── privacy.tsx      # Privacy controls
│   │   │   │       └── notifications.tsx # Notification preferences
│   │   │   ├── hooks/         # Custom React hooks (notebook-aware)
│   │   │   │   ├── useAuth.ts           # Authentication state
│   │   │   │   ├── useNotebooks.ts      # Notebook management
│   │   │   │   ├── useTasks.ts          # Task operations
│   │   │   │   ├── useMemories.ts       # Memory operations
│   │   │   │   ├── useWebSocket.ts      # Real-time updates
│   │   │   │   ├── useLocalStorage.ts   # Persistent preferences
│   │   │   │   └── useKeyboardShortcuts.ts # Productivity shortcuts
│   │   │   ├── services/      # API client services (notebook-aware)
│   │   │   │   ├── api.ts     # Base API client with interceptors
│   │   │   │   ├── notebookService.ts   # Notebook CRUD operations
│   │   │   │   ├── taskService.ts       # Task operations
│   │   │   │   ├── memoryService.ts     # Memory operations
│   │   │   │   ├── integrationService.ts # Integration management
│   │   │   │   └── authService.ts       # Authentication
│   │   │   ├── stores/        # Zustand stores (notebook-first)
│   │   │   │   ├── authStore.ts         # User authentication
│   │   │   │   ├── notebookStore.ts     # Notebook state management
│   │   │   │   ├── taskStore.ts         # Task state with notebook awareness
│   │   │   │   ├── memoryStore.ts       # Memory operations
│   │   │   │   ├── integrationStore.ts  # Integration status
│   │   │   │   └── notificationStore.ts # Real-time notifications
│   │   │   ├── styles/        # TailwindCSS styling system
│   │   │   │   ├── globals.css          # Global styles and CSS variables
│   │   │   │   ├── components.css       # Component-specific styles
│   │   │   │   └── tailwind.css         # Tailwind imports
│   │   │   └── utils/         # Frontend utilities
│   │   │       ├── cn.ts                # Class name utility (clsx + tailwind-merge)
│   │   │       ├── dateHelpers.ts       # Date formatting and manipulation
│   │   │       ├── validators.ts        # Form validation helpers
│   │   │       ├── formatters.ts        # Display formatting
│   │   │       ├── constants.ts         # App constants and enums
│   │   │       └── keyboardShortcuts.ts # Keyboard shortcut definitions
│   │   ├── public/            # Static assets
│   │   │   ├── icons/
│   │   │   └── images/
│   │   ├── tests/             # Frontend tests
│   │   │   ├── components/    # Component tests
│   │   │   ├── services/      # Service tests
│   │   │   └── e2e/           # End-to-end tests
│   │   ├── .env.example       # Environment template
│   │   ├── vite.config.ts     # Vite configuration
│   │   ├── tailwind.config.js # Tailwind CSS config
│   │   └── package.json
│   └── api/                   # Python FastAPI backend
│       ├── src/
│       │   ├── api/           # FastAPI route definitions
│       │   │   ├── main.py    # Main FastAPI app
│       │   │   ├── gateway.py # API Gateway routes
│       │   │   ├── auth.py    # Authentication endpoints
│       │   │   ├── notebooks.py # Notebook management endpoints
│       │   │   ├── tasks.py   # Task management endpoints
│       │   │   ├── memories.py # Memory endpoints
│       │   │   ├── integrations.py # Integration endpoints
│       │   │   └── websocket.py # WebSocket handlers
│       │   ├── services/      # Business logic services
│       │   │   ├── orchestrator.py # LLM orchestration with notebook classification
│       │   │   ├── notebook.py # Notebook management and auto-classification
│       │   │   ├── memory.py  # Memory management
│       │   │   ├── tools.py   # Tool router
│       │   │   ├── notifications.py # Notification service
│       │   │   └── integrations/ # External API wrappers
│       │   │       ├── google_calendar.py
│       │   │       ├── gmail.py
│       │   │       ├── telegram.py
│       │   │       └── llm_providers.py
│       │   ├── models/        # SQLAlchemy data models
│       │   │   ├── base.py    # Base model class
│       │   │   ├── user.py    # User model
│       │   │   ├── notebook.py # Notebook model
│       │   │   ├── task.py    # Task model with notebook relationship
│       │   │   ├── memory.py  # Memory model
│       │   │   ├── integration.py # Integration credential model
│       │   │   └── __init__.py
│       │   ├── workers/       # Celery background workers
│       │   │   ├── celery_app.py # Celery configuration
│       │   │   ├── reminder_worker.py # Reminder processing
│       │   │   ├── digest_worker.py # Weekly digest generation
│       │   │   └── llm_worker.py # Async LLM processing
│       │   ├── utils/         # Backend utilities
│       │   │   ├── database.py # Database connection
│       │   │   ├── security.py # JWT/encryption utilities
│       │   │   ├── vector_ops.py # pgvector operations
│       │   │   ├── rate_limit.py # Rate limiting
│       │   │   ├── error_handlers.py # Global error handling
│       │   │   └── settings.py # Configuration management
│       │   └── migrations/    # Alembic database migrations
│       │       ├── versions/
│       │       ├── env.py
│       │       └── script.py.mako
│       ├── tests/             # Backend tests
│       │   ├── api/           # API endpoint tests
│       │   ├── services/      # Service layer tests
│       │   ├── models/        # Model tests
│       │   ├── workers/       # Worker tests
│       │   └── conftest.py    # Pytest configuration
│       ├── .env.example       # Environment template
│       ├── requirements.txt   # Python dependencies
│       ├── Dockerfile         # Container definition
│       └── pyproject.toml     # Python project configuration
├── packages/                  # Shared packages
│   ├── shared/                # Shared types and utilities
│   │   ├── src/
│   │   │   ├── types/         # TypeScript interfaces
│   │   │   │   ├── user.ts    # User type definitions
│   │   │   │   ├── task.ts    # Task type definitions
│   │   │   │   ├── memory.ts  # Memory type definitions
│   │   │   │   ├── api.ts     # API response types
│   │   │   │   └── index.ts   # Type exports
│   │   │   ├── constants/     # Shared constants
│   │   │   │   ├── api.ts     # API endpoints
│   │   │   │   ├── status.ts  # Status enums
│   │   │   │   └── config.ts  # Configuration constants
│   │   │   └── utils/         # Shared utilities
│   │   │       ├── dateHelpers.ts
│   │   │       ├── validators.ts
│   │   │       └── formatters.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── config/                # Shared configuration
│       ├── eslint/            # ESLint configurations
│       │   ├── base.js
│       │   ├── react.js
│       │   └── python.py      # Python linting config
│       ├── typescript/        # TypeScript configurations
│       │   ├── base.json
│       │   ├── react.json
│       │   └── node.json
│       └── jest/              # Jest test configurations
│           ├── base.js
│           └── react.js
├── infrastructure/            # Deployment and infrastructure
│   ├── docker/                # Docker configurations
│   │   ├── docker-compose.yml # Local development
│   │   ├── docker-compose.prod.yml # Production
│   │   ├── nginx.conf         # Nginx configuration
│   │   └── ssl/               # SSL certificates
│   ├── ansible/               # Server provisioning
│   │   ├── playbooks/
│   │   ├── inventory/
│   │   └── roles/
│   └── monitoring/            # Monitoring configuration
│       ├── prometheus.yml
│       ├── grafana/
│       └── loki/
├── scripts/                   # Build and deployment scripts
│   ├── setup-dev.sh          # Development environment setup
│   ├── build.sh              # Build all packages
│   ├── deploy.sh             # Production deployment
│   └── backup.sh             # Database backup
├── docs/                      # Documentation
│   ├── prd.md                 # Product Requirements
│   ├── architecture.md       # This document
│   ├── api/                   # API documentation
│   │   ├── openapi.yaml
│   │   └── postman-collection.json
│   └── deployment/            # Deployment guides
│       ├── self-hosting.md
│       └── monitoring.md
├── .env.example               # Environment template
├── package.json               # Root package.json with workspaces
├── tsconfig.json              # Root TypeScript config
├── .gitignore                 # Git ignore rules
└── README.md                  # Project overview
```

## Development Workflow

### Local Development Setup

**Prerequisites:**
```bash
# Install Node.js 20.x and Python 3.11
node --version  # Should be 20.x
python --version # Should be 3.11.x

# Install Docker and Docker Compose
docker --version
docker-compose --version
```

**Initial Setup:**
```bash
# Clone repository
git clone <repository-url>
cd messaging-assistant

# Install dependencies
npm install
cd apps/api && pip install -r requirements.txt && cd ../..

# Setup environment variables
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# Start development databases
docker-compose -f infrastructure/docker/docker-compose.yml up -d postgres redis

# Run database migrations
cd apps/api && alembic upgrade head && cd ../..

# Start development servers
npm run dev
```

**Development Commands:**
```bash
# Start all services
npm run dev                    # Starts both frontend and backend

# Start frontend only
npm run dev:web               # React dev server on :3000

# Start backend only  
npm run dev:api               # FastAPI dev server on :8000

# Start background workers
npm run dev:workers           # Celery workers for async processing

# Run tests
npm run test                  # All tests
npm run test:web              # Frontend tests only
npm run test:api              # Backend tests only
npm run test:e2e              # End-to-end tests

# Database operations
npm run db:migrate            # Run migrations
npm run db:seed               # Seed test data
npm run db:reset              # Reset database

# Build for production
npm run build                 # Build all packages
npm run build:web             # Build frontend only
npm run build:api             # Build backend Docker image
```

### Environment Configuration

**Required Environment Variables:**

```bash
# Frontend (.env.local)
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_WS_URL=ws://localhost:8000/ws
REACT_APP_TELEGRAM_BOT_NAME=YourBotName

# Backend (.env)  
DATABASE_URL=postgresql://user:pass@localhost:5432/assistant
REDIS_URL=redis://localhost:6379
TELEGRAM_BOT_TOKEN=your_bot_token_here
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
JWT_SECRET_KEY=your_secret_key_here
ENCRYPTION_KEY=your_encryption_key_here

# Google API credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Shared
NODE_ENV=development
PYTHON_ENV=development
LOG_LEVEL=info
```

## Deployment Architecture

### Deployment Strategy

**Frontend Deployment:**
- **Platform:** Nginx static file serving behind load balancer
- **Build Command:** `npm run build:web`
- **Output Directory:** `apps/web/dist`
- **CDN/Edge:** Nginx with gzip compression and static asset caching

**Backend Deployment:**
- **Platform:** Docker containers with Docker Swarm orchestration
- **Build Command:** `docker build -f apps/api/Dockerfile .`
- **Deployment Method:** Blue-green deployment with health checks

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yaml
name: CI Pipeline
on: [push, pull_request]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:web
      - run: npm run build:web

  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: |
          cd apps/api
          pip install -r requirements.txt
          pytest
          
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run security scan
        run: |
          npm audit
          cd apps/api && pip-audit

  deploy-staging:
    if: github.ref == 'refs/heads/main'
    needs: [test-frontend, test-backend, security-scan]
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: ./scripts/deploy.sh staging
```

### Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|--------------|-------------|---------|
| Development | http://localhost:3000 | http://localhost:8000 | Local development |
| Staging | https://staging.assistant.yourdomain.com | https://api-staging.assistant.yourdomain.com | Pre-production testing |
| Production | https://assistant.yourdomain.com | https://api.assistant.yourdomain.com | Live environment |

## Security and Performance

### Security Requirements

**Frontend Security:**
- CSP Headers: `default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' wss: https:`
- XSS Prevention: Input sanitization, Content Security Policy enforcement
- Secure Storage: JWT tokens in httpOnly cookies, sensitive data in secure storage

**Backend Security:**
- Input Validation: Pydantic models for all API inputs with strict validation
- Rate Limiting: 100 requests/minute per user, 1000/minute per IP
- CORS Policy: Restricted to dashboard domain, credentials included

**Authentication Security:**
- Token Storage: JWT in httpOnly cookies with SameSite=Strict
- Session Management: Redis-backed sessions with 24-hour expiry
- Password Policy: N/A (Telegram-only auth)

### Performance Optimization

**Frontend Performance:**
- Bundle Size Target: < 500KB initial bundle
- Loading Strategy: Code splitting by route, lazy loading for non-critical components
- Caching Strategy: Service worker for static assets, React Query for API caching

**Backend Performance:**
- Response Time Target: P95 < 2.5s for simple operations, < 5s for LLM chains
- Database Optimization: Connection pooling (max 20), query optimization, pgvector indexes
- Caching Strategy: Redis for session data, query results, and LLM response caching

## Testing Strategy

### Testing Pyramid

```
      E2E Tests (10%)
     /              \
    Integration Tests (30%)
   /                    \
  Frontend Unit (30%)  Backend Unit (30%)
```

### Test Organization

**Frontend Tests:**
```
apps/web/tests/
├── components/           # Component unit tests
│   ├── TaskList.test.tsx
│   ├── MemorySearch.test.tsx
│   └── TaskForm.test.tsx
├── services/            # Service layer tests
│   ├── taskService.test.ts
│   └── apiClient.test.ts
├── stores/              # State management tests
│   ├── taskStore.test.ts
│   └── authStore.test.ts
└── e2e/                 # End-to-end tests
    ├── auth.spec.ts
    ├── tasks.spec.ts
    └── integrations.spec.ts
```

**Backend Tests:**
```
apps/api/tests/
├── api/                 # API endpoint tests
│   ├── test_auth.py
│   ├── test_tasks.py
│   ├── test_memories.py
│   └── test_integrations.py
├── services/            # Service layer tests
│   ├── test_orchestrator.py
│   ├── test_memory.py
│   └── test_tools.py
├── models/              # Model tests
│   ├── test_user.py
│   └── test_memory.py
├── workers/             # Worker tests
│   ├── test_reminder_worker.py
│   └── test_digest_worker.py
└── conftest.py          # Pytest fixtures
```

**E2E Tests:**
```
tests/e2e/
├── auth/                # Authentication flows
├── telegram/            # Telegram bot interactions
├── calendar/            # Calendar integration tests
├── memory/              # Memory storage/retrieval
└── dashboard/           # Web dashboard functionality
```

### Test Examples

**Frontend Component Test:**
```typescript
// apps/web/tests/components/TaskList.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskList } from '../../src/components/tasks/TaskList';
import { mockTasks } from '../fixtures/tasks';

describe('TaskList', () => {
  it('renders tasks correctly', () => {
    render(<TaskList tasks={mockTasks} onTaskUpdate={jest.fn()} />);
    
    expect(screen.getByText('Call Mom')).toBeInTheDocument();
    expect(screen.getByText('Send slides to Khan')).toBeInTheDocument();
  });

  it('handles task completion', async () => {
    const onTaskUpdate = jest.fn();
    render(<TaskList tasks={mockTasks} onTaskUpdate={onTaskUpdate} />);
    
    const completeButton = screen.getByRole('button', { name: /complete/i });
    fireEvent.click(completeButton);
    
    expect(onTaskUpdate).toHaveBeenCalledWith(mockTasks[0].id, { status: 'done' });
  });
});
```

**Backend API Test:**
```python
# apps/api/tests/api/test_tasks.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from ...src.api.main import app
from ...src.models.user import User
from ...src.models.task import Task

@pytest.fixture
def authenticated_client(test_user: User):
    client = TestClient(app)
    # Mock authentication
    return client

def test_create_task(authenticated_client, test_user):
    task_data = {
        "title": "Test task",
        "due_at": "2024-01-15T16:00:00Z"
    }
    
    response = authenticated_client.post("/api/v1/tasks", json=task_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == task_data["title"]
    assert data["user_id"] == str(test_user.id)

def test_get_tasks_filtered(authenticated_client, test_user):
    response = authenticated_client.get("/api/v1/tasks?status=pending")
    
    assert response.status_code == 200
    tasks = response.json()
    assert all(task["status"] == "pending" for task in tasks)
```

**E2E Test:**
```typescript
// tests/e2e/telegram-integration.spec.ts
import { test, expect } from '@playwright/test';

test('telegram message creates task in dashboard', async ({ page }) => {
  // Setup: Mock Telegram webhook
  await page.route('**/api/v1/webhook/telegram', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'processed' })
    });
  });

  // Login to dashboard
  await page.goto('/login');
  await page.click('[data-testid="telegram-login"]');
  
  // Simulate Telegram message via webhook
  await page.evaluate(() => {
    fetch('/api/v1/webhook/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          text: 'remind me to call mom at 4pm today',
          from: { id: 12345 }
        }
      })
    });
  });

  // Verify task appears in dashboard
  await page.goto('/dashboard/tasks');
  await expect(page.locator('[data-testid="task-item"]')).toContainText('call mom');
  await expect(page.locator('[data-testid="task-due-time"]')).toContainText('4:00 PM');
});
```

## Coding Standards

### Critical Fullstack Rules

- **Type Sharing:** Always define types in packages/shared and import from there
- **API Calls:** Never make direct HTTP calls from components - use the service layer
- **Environment Variables:** Access only through config objects, never process.env directly
- **Error Handling:** All API routes must use the standard error response format
- **State Updates:** Never mutate Zustand state directly - use provided actions
- **Vector Operations:** Use dedicated vector_ops.py utility, never raw SQL in services
- **Authentication:** Always use get_current_user dependency for protected routes
- **Logging:** Use structured logging with correlation IDs for request tracing
- **Database:** Use repository pattern - no direct SQLAlchemy queries in route handlers
- **Memory Storage:** Always generate embeddings before storing memories

### Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `TaskList.tsx` |
| Hooks | camelCase with 'use' | - | `useAuth.ts` |
| API Routes | - | snake_case | `/api/tasks/user-tasks` |
| Database Tables | - | snake_case | `user_tasks` |
| Services | PascalCase | snake_case | `TaskService` / `task_service.py` |
| Environment Vars | UPPER_SNAKE | UPPER_SNAKE | `REACT_APP_API_URL` |

## Error Handling Strategy

### Error Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API Gateway
    participant S as Service
    participant D as Database
    participant E as External API

    C->>A: Request
    A->>S: Process request
    S->>D: Database operation
    D-->>S: Database error
    S->>S: Log error with correlation ID
    S-->>A: Structured error response
    A->>A: Apply rate limiting if needed
    A-->>C: Standard error format

    Note over S,E: External API failure
    S->>E: API call
    E-->>S: API error
    S->>S: Circuit breaker triggers
    S->>S: Log with retry count
    S-->>A: Fallback response
```

### Error Response Format

```typescript
interface ApiError {
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable message
    details?: Record<string, any>; // Additional context
    timestamp: string;      // ISO timestamp
    requestId: string;      // Correlation ID
  };
}

// Example error responses:
{
  "error": {
    "code": "CALENDAR_INTEGRATION_FAILED",
    "message": "Unable to connect to Google Calendar. Please re-authorize the integration.",
    "details": { "provider": "google_calendar", "scope_missing": "calendar.events" },
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_7f3d8a9b"
  }
}
```

### Frontend Error Handling

```typescript
// utils/errorHandler.ts
export class ErrorHandler {
  static handleApiError(error: any): string {
    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      
      // Handle specific error codes
      switch (apiError.code) {
        case 'CALENDAR_INTEGRATION_FAILED':
          return 'Please reconnect your calendar integration';
        case 'MEMORY_SEARCH_FAILED':
          return 'Memory search temporarily unavailable';
        case 'RATE_LIMIT_EXCEEDED':
          return 'Too many requests. Please wait a moment';
        default:
          return apiError.message || 'An unexpected error occurred';
      }
    }
    
    return 'Network error. Please check your connection';
  }
  
  static logError(error: any, context?: Record<string, any>) {
    console.error('Frontend Error:', {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }
}
```

### Backend Error Handling

```python
# utils/error_handlers.py
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import uuid
import logging

class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        try:
            response = await call_next(request)
            return response
        except HTTPException as e:
            return JSONResponse(
                status_code=e.status_code,
                content={
                    "error": {
                        "code": getattr(e, 'code', 'HTTP_ERROR'),
                        "message": e.detail,
                        "timestamp": datetime.utcnow().isoformat(),
                        "requestId": request_id
                    }
                }
            )
        except Exception as e:
            logging.error(f"Unhandled error: {str(e)}", extra={
                "request_id": request_id,
                "path": request.url.path,
                "method": request.method
            })
            return JSONResponse(
                status_code=500,
                content={
                    "error": {
                        "code": "INTERNAL_SERVER_ERROR",
                        "message": "An unexpected error occurred",
                        "timestamp": datetime.utcnow().isoformat(),
                        "requestId": request_id
                    }
                }
            )
```

## Monitoring and Observability

### Monitoring Stack

- **Frontend Monitoring:** Sentry for error tracking, Web Vitals for performance
- **Backend Monitoring:** Prometheus metrics collection, Grafana dashboards
- **Error Tracking:** Centralized logging with correlation IDs
- **Performance Monitoring:** APM with request tracing, database query monitoring

### Key Metrics

**Frontend Metrics:**
- Core Web Vitals (LCP, FID, CLS)
- JavaScript errors and crash rates
- API response times from client perspective
- User interactions and feature adoption

**Backend Metrics:**
- Request rate, error rate, response time (RED metrics)
- Database query performance and connection pool usage
- Celery queue depth and worker processing times
- External API response times and error rates
- Memory usage and vector search performance

**Business Metrics:**
- Daily/weekly active users
- Task completion rates
- Memory storage and retrieval usage
- Integration connection success rates
- LLM token usage and costs

**🎯 THOUGHTKEEPER-INTEGRATED FULLSTACK ARCHITECTURE COMPLETE!**

This enhanced architecture document provides:

✅ **Complete Technology Stack** - TailwindCSS + Framer Motion + thoughtkeeper-inspired components  
✅ **Notebook-First Data Models** - Enhanced with Notebook entity and relationships  
✅ **Thoughtkeeper UI Architecture** - Professional component organization and state management  
✅ **Database Schema** - Production-ready PostgreSQL with notebooks and enhanced task model  
✅ **Notebook-Aware API Spec** - Complete OpenAPI specification with notebook operations  
✅ **Enhanced Workflows** - Intelligent task classification and notebook-first interactions  
✅ **Project Structure** - Monorepo aligned with thoughtkeeper's proven organization  
✅ **Development Workflow** - Local setup optimized for notebook-first development  
✅ **Deployment Strategy** - Self-hosted Docker with comprehensive CI/CD  
✅ **Security & Performance** - Production-ready with notebook-aware optimizations  

**🚀 KEY THOUGHTKEEPER INTEGRATIONS:**

🎨 **UI/UX Excellence:**
- **Notebook-First Navigation** - Homepage displays large notebook cards (Work, Personal, Hustles, Health, Ideas)
- **Professional Design System** - TailwindCSS + custom components with thoughtkeeper's visual hierarchy
- **Multiple View Modes** - Kanban board, list view, calendar view for each notebook
- **Advanced Interactions** - Drag-and-drop, bulk operations, real-time updates with Framer Motion

🧠 **Intelligent Classification:**
- **Auto-Notebook Assignment** - LLM automatically categorizes Telegram tasks into appropriate notebooks
- **Context-Aware Memory** - Notebook-aware memory storage and retrieval
- **Smart Workflows** - Enhanced task creation with notebook context and visual feedback

📊 **Rich Data Models:**
- **Enhanced Task Model** - Priority, progress, tags, time estimates, notebook relationships
- **Notebook Management** - Color coding, icons, sorting, statistics, and metadata
- **Advanced Filtering** - Multi-dimensional task filtering across notebooks, priorities, and dates

**Ready for story creation and development:**

1. ✅ **Architecture Complete** - Thoughtkeeper-integrated design ready for implementation
2. 🎯 **Story Breakdown** - Ready for Epic-to-Story decomposition using this technical foundation
3. 🚀 **Development Start** - Begin with notebook-first foundation stories

**This architecture merges the best of both worlds: comprehensive backend intelligence with thoughtkeeper's exceptional UI/UX patterns.**


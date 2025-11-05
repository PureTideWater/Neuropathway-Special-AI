# PathWise - IEP Copilot & AI Adaptive Learning Partner

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](tsconfig.json)

**PathWise** is a comprehensive platform combining an IEP (Individualized Education Plan) Copilot with an AI-powered Adaptive Learning Partner. Built to streamline special education workflows while delivering personalized learning experiences aligned with each student's unique cognitive and sensory profile.

## 🎯 Key Features

### IEP Copilot
- **AI-Powered Goal Generation**: Automatically draft measurable, compliant IEP goals using GPT-4o/Claude
- **Smart Compliance Checking**: Validate IEPs against state and district regulations
- **Progress Tracking**: Real-time goal monitoring with visual analytics
- **Collaboration Tools**: Multi-user workflow for teachers, specialists, and parents
- **FERPA Compliant**: Full audit trails and encryption for all student data

### Adaptive Learning Partner
- **Personalized Content Delivery**: AI recommendations based on student cognitive profile
- **Dynamic Difficulty Adjustment**: Real-time adaptation to student performance
- **Multi-Modal Learning**: Support for visual, auditory, kinesthetic, and reading/writing learners
- **Engagement Analytics**: Track student interaction and progress metrics
- **Accessibility First**: WCAG 2.2 compliant with voice navigation and high contrast modes

## 🏗️ Architecture

PathWise uses a **micro-services architecture** with domain-driven design:

```
┌─────────────────┐
│  Next.js Frontend │  (SSR, PWA-enabled)
└────────┬─────────┘
         │
    ┌────▼─────────────┐
    │  API Gateway     │  (GraphQL + REST)
    └────┬─────────────┘
         │
    ┌────┴─────────────────────────────────┐
    │                                      │
┌───▼──────────┐  ┌───────────────┐  ┌───▼────────┐
│ Auth Service │  │  IEP Service  │  │ AI Engine  │
└──────────────┘  └───────────────┘  └────────────┘
         │                 │              │
    ┌────▼─────────────────▼──────────────▼────┐
    │  PostgreSQL + Redis + ElasticSearch     │
    └─────────────────────────────────────────┘
```

### Core Services

| Service | Port | Technology | Purpose |
|---------|------|-----------|---------|
| **Frontend** | 3000 | Next.js 14 + React | User interface |
| **API Gateway** | 4000 | Apollo GraphQL | Request routing |
| **Auth Service** | 4001 | Express + Passport | OAuth 2.0, RBAC |
| **IEP Service** | 4002 | Express + Sequelize | IEP CRUD operations |
| **AI Engine** | 4004 | Express + OpenAI/Anthropic | LLM-powered features |
| **Adaptive Learning** | 4003 | Express | Content recommendations |

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **npm** >= 9.0.0

### Environment Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/pathwise.git
cd pathwise
```

2. **Create environment file**
```bash
cp .env.example .env
```

3. **Configure API keys** (edit `.env`)
```env
# Required for AI features
OPENAI_API_KEY=sk-your-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Security
JWT_SECRET=your-secure-32-character-minimum-secret
AUTH_SECRET=your-auth-secret-key
```

### Running with Docker (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access the application:**
- Frontend: http://localhost:3000
- API Gateway: http://localhost:4000
- Auth Service: http://localhost:4001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Running Locally (Development)

```bash
# Install dependencies
npm install

# Start database services
docker-compose up postgres redis elasticsearch

# Run all services in development mode
npm run dev

# Or run individual services
npm run dev:frontend
npm run dev:services
```

## 📁 Project Structure

```
pathwise/
├── frontend/                 # Next.js application
│   ├── app/                 # App router pages
│   ├── components/          # Reusable UI components
│   ├── lib/                # API clients, utilities
│   ├── hooks/              # Custom React hooks
│   └── styles/             # Global styles, Tailwind
│
├── services/
│   ├── auth-service/       # Authentication & authorization
│   ├── api-gateway/        # GraphQL gateway
│   ├── iep-service/        # IEP CRUD operations
│   ├── ai-engine/          # LLM integration
│   └── adaptive-learning-service/
│
├── database/
│   ├── schemas/            # SQL schema definitions
│   ├── migrations/         # Database migrations
│   └── seeds/              # Sample data
│
├── shared/
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Shared utilities
│
├── infrastructure/
│   ├── docker/             # Docker configurations
│   ├── kubernetes/         # K8s manifests
│   └── terraform/          # Infrastructure as Code
│
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/                # End-to-end tests
│
└── docs/                   # Additional documentation
```

## 🗄️ Database Schema

### Core Tables

- **users**: User accounts with role-based access
- **students**: Student profiles with learning preferences
- **ieps**: Versioned IEP documents
- **iep_goals**: Detailed, measurable goals
- **sessions**: Learning session tracking
- **content_library**: Multi-modal learning content
- **ai_audit**: FERPA-compliant AI operation logs

### Relationships

```sql
users 1──→∞ students (as teacher/parent)
students 1──→∞ ieps (versioned)
ieps 1──→∞ iep_goals
students 1──→∞ sessions
sessions ∞──→1 content_library
```

**Initialize database:**
```bash
# Run schema
docker exec -i pathwise-postgres psql -U pathwise_user -d pathwise < database/schemas/001_initial_schema.sql

# Load sample data
docker exec -i pathwise-postgres psql -U pathwise_user -d pathwise < database/seeds/001_sample_data.sql
```

## 🔐 Authentication & Security

### OAuth 2.0 Providers

- Google Workspace
- Microsoft 365

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|------------|
| **Student** | View assigned content |
| **Parent** | Read-only IEP access, view student progress |
| **Teacher** | Full IEP management, content assignment |
| **Specialist** | IEP collaboration, assessments |
| **Admin** | User management, district settings |

### Security Features

- ✅ AES-256 encryption at rest
- ✅ TLS 1.3 in transit
- ✅ JWT-based authentication
- ✅ Rate limiting (100 req/15min)
- ✅ Helmet.js security headers
- ✅ FERPA-compliant audit logs
- ✅ Tenant-based data isolation

## 🤖 AI Features

### IEP Generation

**Endpoint:** `POST /api/iep-generator/generate-goals`

```typescript
{
  "studentId": "uuid",
  "teacherNotes": "Student struggles with reading comprehension...",
  "focusAreas": ["reading", "attention"]
}
```

**Response:**
```typescript
{
  "goals": [
    {
      "domain": "Reading Comprehension",
      "goalText": "Student will improve reading comprehension...",
      "baseline": "Currently reads at 2nd grade level...",
      "target": "80% accuracy on 3rd grade texts",
      "measurementMethod": "Running records, assessments",
      "timeline": "12 months",
      "confidence": 0.88
    }
  ],
  "accommodations": {...},
  "rationale": "Goals align with student profile..."
}
```

### Adaptive Learning

**Endpoint:** `POST /api/adaptive-learning/recommend`

```typescript
{
  "studentId": "uuid",
  "subject": "mathematics",
  "currentPerformance": { "accuracy": 0.72 }
}
```

## 📊 Monitoring & Observability

- **Logs**: Winston structured logging → CloudWatch/ELK
- **Metrics**: Prometheus + Grafana
- **Tracing**: OpenTelemetry
- **Health Checks**: `/health` on all services

## 🧪 Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 🚢 Deployment

### Docker Production Build

```bash
docker-compose -f docker-compose.prod.yml up --build
```

### Kubernetes

```bash
kubectl apply -f infrastructure/kubernetes/
```

### Environment Variables

See `.env.example` for complete list. Key variables:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
REDIS_URL=redis://...
```

## ♿ Accessibility

PathWise is built with accessibility as a core requirement:

- ✅ **WCAG 2.2 Level AA** compliant
- ✅ Keyboard-first navigation
- ✅ Screen reader support (ARIA labels)
- ✅ Voice command integration
- ✅ High contrast themes
- ✅ Adjustable font sizes
- ✅ Reduced motion support
- ✅ Color-blind friendly palettes

## 📈 Roadmap

### Phase 1: MVP (Current)
- [x] Auth service with OAuth
- [x] Database schema
- [x] Basic IEP CRUD
- [x] AI goal generation
- [x] Frontend dashboard

### Phase 2 (3-6 months)
- [ ] Adaptive learning engine
- [ ] Compliance validator
- [ ] Parent portal
- [ ] Mobile app (React Native)

### Phase 3 (6-12 months)
- [ ] Behavioral analytics dashboard
- [ ] Speech-to-text integration
- [ ] District-wide analytics
- [ ] Third-party SIS integrations

### Phase 4 (12-18 months)
- [ ] Fine-tuned district LLMs
- [ ] Predictive goal achievement
- [ ] Multi-language support (10+ languages)

## 📝 API Documentation

Full API documentation available at:
- GraphQL Playground: http://localhost:4000/graphql
- REST API Docs: http://localhost:4000/api-docs (Swagger)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Resources

- **Documentation**: [docs/](docs/)
- **Architecture Diagrams**: [docs/architecture/](docs/architecture/)
- **API Specs**: [docs/api/](docs/api/)
- **User Guides**: [docs/user-guides/](docs/user-guides/)

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/pathwise/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/pathwise/discussions)
- **Email**: support@pathwise.com

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Anthropic for Claude API
- Special education professionals who provided domain expertise
- Open-source community

---

**Built with ❤️ for educators, by educators**

*Empowering every student to reach their full potential through personalized, data-driven education.*

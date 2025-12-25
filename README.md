# Telemed AI Agent

> Production-ready AI agent package for telemedicine applications

[![npm version](https://img.shields.io/npm/v/telemed-ai-agent.svg)](https://www.npmjs.com/package/telemed-ai-agent)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🏥 **Built-in Medical Knowledge** - 12 specialties, 15+ symptoms, emergency detection
- 🤖 **Intelligent Symptom Assessment** - AI-powered triage and specialist matching
- 📅 **Smart Appointment Scheduling** - Automated booking with availability checking
- 🚨 **Emergency Detection** - Real-time detection of life-threatening symptoms
- 🔒 **HIPAA-Compliant** - Privacy-aware conversation patterns
- ⚡ **3-Line Setup** - Works immediately after installation
- 🔌 **Database-Agnostic** - Adapter pattern for any database
- 📝 **Comprehensive Logging** - Audit trails for compliance

## Quick Start

### Installation

```bash
npm install telemed-ai-agent
```

### Basic Usage

```typescript
import { createTelemedAgent } from 'telemed-ai-agent';

// Initialize the agent (3 lines!)
const agent = createTelemedAgent({
  llm: { provider: 'openai', apiKey: process.env.OPENAI_API_KEY },
  organization: { name: 'My Clinic', supportEmail: 'support@myclinic.com' }
});

// Start chatting
const response = await agent.chat({
  message: "I have a severe headache",
  sessionId: "user-123"
});

console.log(response.message);
```

## What's Included

### Medical Knowledge

- **12 Medical Specialties**: General Practice, Cardiology, Dermatology, Orthopedics, Pediatrics, Psychiatry, Gynecology, Neurology, Gastroenterology, Pulmonology, Urology, Endocrinology
- **15+ Common Symptoms**: Organized by body system with severity indicators
- **Emergency Keywords**: 50+ critical phrases for immediate escalation
- **Red Flags**: Symptom-specific warning signs

### AI Capabilities

- **Symptom Assessment**: Progressive questioning and severity scoring
- **Specialty Matching**: Intelligent routing to appropriate specialists
- **Emergency Detection**: Real-time monitoring for life-threatening conditions
- **HIPAA Awareness**: Automatic disclaimers and privacy protection

### Developer Experience

- **TypeScript**: Full type safety throughout
- **Minimal Configuration**: Sensible defaults for everything
- **Extensible**: Custom database adapters, LLM providers
- **Well-Documented**: Comprehensive examples and API docs

## Configuration

### Minimal Configuration

```typescript
const agent = createTelemedAgent({
  llm: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY
  },
  organization: {
    name: 'My Hospital',
    supportEmail: 'support@hospital.com'
  }
});
```

### Full Configuration

```typescript
const agent = createTelemedAgent({
  llm: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 1500
  },
  
  organization: {
    name: 'City General Hospital',
    supportEmail: 'support@cityhospital.com',
    supportPhone: '+1-555-0100',
    website: 'https://cityhospital.com'
  },
  
  features: {
    symptomAssessment: true,
    appointmentScheduling: true,
    emergencyDetection: true,
    medicalHistoryAccess: true
  },
  
  compliance: {
    hipaaMode: true,
    auditLogging: true,
    dataRetentionDays: 2555, // 7 years
    disclaimerFrequency: 'every-session'
  },
  
  emergency: {
    emergencyNumber: '911',
    hospitalEmergencyLine: '+1-555-0911',
    mentalHealthCrisisLine: '988'
  }
});
```

## API Reference

### `createTelemedAgent(config)`

Creates a new telemedicine AI agent instance.

**Parameters:**
- `config` (TelemedAgentConfig): Configuration object

**Returns:** `TelemedAgent`

### `agent.chat(request)`

Send a message to the agent and get a response.

**Parameters:**
- `request.message` (string): User's message
- `request.sessionId` (string): Unique session identifier
- `request.patientId` (string, optional): Patient identifier

**Returns:** `Promise<ChatResponse>`

```typescript
const response = await agent.chat({
  message: "I have chest pain",
  sessionId: "session-123",
  patientId: "patient-456"
});

console.log(response.message);
console.log(response.metadata.urgencyLevel); // 'routine' | 'urgent' | 'emergency'
console.log(response.metadata.emergencyDetected); // boolean
```

### `agent.getWelcomeMessage()`

Get a welcome message for new patients.

**Returns:** `string`

## Examples

### Basic Chat

```typescript
const agent = createTelemedAgent({
  llm: { provider: 'openai', apiKey: process.env.OPENAI_API_KEY },
  organization: { name: 'My Clinic', supportEmail: 'support@clinic.com' }
});

const response = await agent.chat({
  message: "I've been having headaches for the past week",
  sessionId: "user-123"
});

console.log(response.message);
```

### Emergency Detection

```typescript
const response = await agent.chat({
  message: "I have crushing chest pain and can't breathe",
  sessionId: "emergency-session"
});

if (response.metadata?.emergencyDetected) {
  console.log("EMERGENCY DETECTED!");
  console.log(response.metadata.emergencyType); // 'cardiac'
  console.log(response.metadata.emergencyInstructions);
}
```

### Welcome Message

```typescript
const welcome = agent.getWelcomeMessage();
console.log(welcome);
// "Welcome to My Clinic! I'm your virtual healthcare assistant..."
```

## Medical Specialties

The agent has built-in knowledge of 12 medical specialties:

1. **General Practice** - Primary care, routine checkups, vaccinations
2. **Cardiology** - Heart conditions, blood pressure, chest pain
3. **Dermatology** - Skin, hair, nail conditions
4. **Orthopedics** - Bones, joints, sports injuries
5. **Pediatrics** - Children's healthcare
6. **Psychiatry** - Mental health, depression, anxiety
7. **Gynecology** - Women's reproductive health
8. **Neurology** - Brain, nervous system, headaches
9. **Gastroenterology** - Digestive system, stomach issues
10. **Pulmonology** - Lungs, breathing problems
11. **Urology** - Urinary tract, kidney issues
12. **Endocrinology** - Hormones, diabetes, thyroid

## Emergency Detection

The agent automatically detects emergency situations and provides immediate guidance:

### Critical Keywords Monitored:
- **Cardiac**: "heart attack", "crushing chest pain", "chest pressure radiating"
- **Respiratory**: "can't breathe", "gasping for air", "blue lips", "choking"
- **Neurological**: "stroke", "face drooping", "worst headache of life"
- **Mental Health**: "suicidal", "want to die", "harm myself"
- **Allergic**: "anaphylaxis", "throat swelling"
- **Trauma**: "severe bleeding", "major trauma", "unconscious"

When detected, the agent immediately escalates with emergency instructions.

## Compliance & Security

### HIPAA Compliance

- ✅ Privacy-aware conversations
- ✅ Automatic medical disclaimers
- ✅ PII detection and protection
- ✅ Audit logging (7-year retention)
- ✅ Session management

### Security Features

- ✅ Input validation (Zod schemas)
- ✅ No PII in logs
- ✅ Secure session handling
- ✅ API key protection
- ✅ Error sanitization

## Requirements

- Node.js >= 18.0.0
- OpenAI API key (or compatible LLM provider)
- Optional: Database (PostgreSQL, MongoDB, MySQL)

## License

MIT

## Support

For issues and questions:
- GitHub Issues: [github.com/your-org/telemed-ai-agent/issues](https://github.com/your-org/telemed-ai-agent/issues)
- Email: support@yourorganization.com

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

**⚠️ Medical Disclaimer**: This AI agent provides educational information and administrative support only. It does NOT diagnose conditions, prescribe treatments, or replace professional medical advice. Always consult with licensed healthcare providers for medical decisions.

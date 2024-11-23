# PromptLib Technical Documentation

## Architecture Overview

### Tech Stack
- **Frontend**: React 18.2.0 with TypeScript
- **State Management**: React Context
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Package Manager**: npm

## Data Storage Architecture

### Local Storage Implementation

The application uses a sophisticated local storage system implemented through React Context with persistence middleware:

```typescript
interface Store {
  prompts: Prompt[];
  templates: Template[];
  settings: Settings;
}
```

### Data Models

#### Role Storage
```typescript
interface Role {
  id: string;
  name: string;
  description: string;
  templates: string[]; // Template IDs
}

interface RoleStore {
  roles: Role[];
  addRole: (role: Role) => void;
  updateRole: (id: string, role: Role) => void;
  deleteRole: (id: string) => void;
  setSelectedRole: (role: Role | null) => void;
  setModalSelectedRole: (role: Role | null) => void;
}
```

#### Template Storage
```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  roleId: string;
  content: string;
  version: string;
  metadata: {
    created: string;
    modified: string;
    author: string;
  };
}

interface TemplateStore {
  templates: Template[];
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, template: Template) => void;
  deleteTemplate: (id: string) => void;
  getTemplatesByRole: (roleId: string) => Template[];
}
```

#### Prompt Storage
```typescript
interface Prompt {
  id: string;
  content: string;
  roleId: string;
  templateId: string;
  metadata: {
    created: string;
    llmProvider: string;
    enhanced: boolean;
  };
}
```

## Component Architecture

### Core Components

1. **Modal System**
   - Base Modal Component
   - Specialized Modal Types
   - Transition Management
   - Size Variants

2. **Form Components**
   - Input Validation
   - Error Handling
   - Dynamic Form Generation
   - State Management

3. **Preview Components**
   - Content Rendering
   - Syntax Highlighting
   - Copy Functionality
   - Export Options

### State Management

1. **React Context Store**
   ```typescript
   const useStore = create<Store>((set) => ({
     // State and actions
     prompts: [],
     addPrompt: (prompt) => set((state) => ({
       prompts: [...state.prompts, prompt]
     })),
     // ... other actions
   }));
   ```

2. **Store Features**
   - Persistence Layer
   - Action Handlers
   - Selectors
   - Middleware Integration

## Performance Optimizations

1. **Code Splitting**
   - Dynamic Imports
   - Lazy Loading
   - Route-based Splitting

2. **State Management**
   - Selective Updates
   - Memoization
   - Efficient Selectors

3. **Build Optimization**
   - Tree Shaking
   - Code Minification
   - Asset Optimization

## Security Considerations

1. **Data Storage**
   - Secure Local Storage
   - Data Encryption
   - Access Control

2. **API Integration**
   - Secure Key Management
   - Request Validation
   - Error Handling

## Testing Strategy

1. **Unit Tests**
   - Component Testing
   - Store Testing
   - Utility Testing

2. **Integration Tests**
   - Component Integration
   - Store Integration
   - API Integration

## Development Workflow

1. **Setup Development Environment**
   ```bash
   npm install
   npm run dev
   ```

2. **Build Process**
   ```bash
   npm run build
   npm run preview
   ```

3. **Code Quality**
   - TypeScript Strict Mode
   - ESLint Configuration
   - Prettier Formatting

## Deployment

1. **Build Configuration**
   - Environment Variables
   - Build Optimization
   - Asset Management

2. **Deployment Process**
   - Static File Generation
   - Server Configuration
   - Performance Monitoring

## Maintenance

1. **Updates**
   - Dependency Management
   - Version Control
   - Documentation Updates

2. **Monitoring**
   - Error Tracking
   - Performance Metrics
   - Usage Analytics

## Architecture

### Frontend Architecture
- React with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- React Context for state management

### Components

#### PreviewPage
The PreviewPage component handles the preview and LLM integration functionality:

1. Code Snippet Detection
```typescript
// Detects different types of code snippets:
- Regular code
- Test cases
- BDD scenarios
```

2. File Handling
```typescript
// Smart file naming and extension detection:
- Language-based extensions (.js, .py, .java, etc.)
- Test file extensions (.test.js, .spec.py)
- BDD scenario files (.feature)
```

3. LLM Integration
```typescript
// Azure OpenAI integration for prompt enhancement
- Raw content submission
- Response parsing
- Code snippet extraction
```

#### Modal Components
- CreatePromptModal: Handles prompt creation and editing
- PreviewModal: Displays enhanced content from LLM
- ResponseModal: Shows LLM responses with code highlighting

### Services

#### Open API Integration
```typescript
// API endpoint configuration
const Open_API_ENDPOINT = 'https://api.Open.ai/v1/chat/completions';

// Authentication
- Bearer token authentication
- Environment variable configuration
```

### Code Snippet Processing

#### Detection Logic
```typescript
// Snippet type detection based on content patterns:
- Class/Function detection for naming
- Language detection for extensions
- Test/BDD scenario detection
```

#### File Naming Strategy
1. Primary Detection:
   - Class names
   - Function names
   - React component names
   - Test descriptions
   - BDD feature names

2. Fallback Strategy:
   - Language-based naming
   - Timestamp-based unique names

#### Extension Mapping
```typescript
// Language to extension mapping
javascript: 'js'
typescript: 'ts'
python: 'py'
java: 'java'
// ... and more
```

### State Management

#### Context Structure
```typescript
interface AppContext {
  prompts: Prompt[];
  templates: Template[];
  settings: Settings;
}
```

### Type Definitions

#### Code Snippet Types
```typescript
interface CodeSnippet {
  type: 'code' | 'test' | 'bdd';
  content: string;
  language?: string;
}

interface ParsedResponse {
  text: string;
  snippets: CodeSnippet[];
}
```

## Performance Considerations

### Code Snippet Processing
- Efficient regex patterns for detection
- Optimized file handling
- Asynchronous downloads

### LLM Integration
- Response streaming
- Efficient parsing
- Error handling

## Security

### API Security
- Environment-based API key management
- Secure token handling
- Rate limiting

### File Operations
- Safe file downloads
- Sanitized file names
- Controlled extensions

## Testing

### Unit Tests
- Component testing
- Service testing
- Utility function testing

### Integration Tests
- LLM integration testing
- File handling testing
- State management testing

## Future Enhancements

### Planned Features
1. Additional LLM providers
2. Enhanced code detection
3. Custom language support
4. Advanced snippet management

### Technical Debt
1. Refactor snippet detection
2. Optimize file handling
3. Enhance error handling

## Deployment

### Build Process
```bash
npm run build
# or
yarn build
```

### Environment Configuration
```env
Open_API_KEY=your_api_key
```

## Maintenance

### Code Style
- ESLint configuration
- Prettier setup
- TypeScript strict mode

### Documentation
- JSDoc comments
- Component documentation
- API documentation

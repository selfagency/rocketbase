# LLM Instructions: TypeScript/Node.js CLI Development

This document provides comprehensive guidance for AI assistants working on this TypeScript/Node.js CLI application project.

> **Note**: This project uses **pnpm** as the package manager. All commands should use `pnpm` instead of `npm` or `yarn`.

## Project Stack Overview

This is a **CLI application** built with TypeScript and Node.js using the following toolchain:

- **oxlint** - Fast linting (replacement for ESLint)
- **oxfmt** - Code formatting (alternative to Prettier)
- **tsx** - TypeScript execution for development
- **tsup** - TypeScript bundler powered by esbuild for production builds
- **vitest** - Unit testing framework
- **consola** - Beautiful console logging
- **execa** - Process execution and shell commands
- **prompts** - Interactive CLI prompts
- **ora** - Terminal spinners for progress indication

---

## Development Workflow

### Running in Development

Use `tsx` to execute TypeScript files directly without compilation:

```bash
# Run a TypeScript file
tsx src/index.ts

# Watch mode for development
tsx watch src/index.ts

# With Node.js flags
tsx --inspect src/index.ts
```

### Building for Production

Use `tsup` to bundle the CLI application:

```bash
# Basic build (using package.json script)
pnpm build

# Direct tsup usage if needed
pnpm exec tsup src/index.ts

# Output goes to ./dist by default
```

**Key tsup features:**

- Zero config required
- Powered by esbuild (extremely fast)
- Bundles TypeScript to JavaScript
- Supports .js, .json, .mjs, .ts, .tsx
- Can create executable CLI bundles

### Linting

Use `oxlint` for fast linting:

```bash
# Lint your codebase (runs oxlint + oxfmt)
pnpm lint

# Lint with auto-fix
pnpm lint:fix

# Show available rules
pnpm exec oxlint --rules
```

**oxlint characteristics:**

- Written in Rust, extremely fast
- No configuration required by default
- Works with JavaScript and TypeScript
- Much faster than ESLint

### Formatting

Use `oxfmt` for code formatting:

```bash
# Format files (included in lint:fix)
pnpm lint:fix

# Check formatting without modifying (included in lint)
pnpm lint

# Direct oxfmt usage if needed
pnpm exec oxfmt --write src/**/*.ts
```

### Testing

Use `vitest` for unit tests:

```bash
# Run tests once (CI mode)
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test -- --coverage

# Direct vitest usage
pnpm exec vitest
```

**Vitest features:**

- Powered by Vite
- Jest-compatible API
- Fast and modern
- Native TypeScript support
- Watch mode by default

---

## Version Management & Release Process

### Semantic Versioning

This project follows [Semantic Versioning 2.0.0](https://semver.org/):

**Version format: MAJOR.MINOR.PATCH** (e.g., 1.4.2)

- **MAJOR** (1.0.0): Breaking changes - incompatible API changes
- **MINOR** (0.1.0): New features - backward compatible additions
- **PATCH** (0.0.1): Bug fixes - backward compatible fixes

**Pre-release versions:**

- **Alpha**: `1.0.0-alpha.1` - Internal testing, unstable
- **Beta**: `1.0.0-beta.1` - External testing, feature complete
- **RC**: `1.0.0-rc.1` - Release candidate, production-ready candidate

**Examples:**

```bash
# Bug fix release
0.1.0 → 0.1.1

# New feature (backward compatible)
0.1.1 → 0.2.0

# Breaking change
0.2.0 → 1.0.0

# Pre-release versions
1.0.0 → 1.1.0-beta.1 → 1.1.0-beta.2 → 1.1.0
```

**Version bumping rules:**

1. **PATCH** - Fix bugs, update dependencies (non-breaking), improve performance
2. **MINOR** - Add new features, deprecate functionality (but don't remove)
3. **MAJOR** - Remove deprecated features, change APIs, update major dependencies with breaking changes

### Conventional Commits

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for all commit messages.

**Format:**

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat:` - New feature (triggers MINOR version bump)
- `fix:` - Bug fix (triggers PATCH version bump)
- `docs:` - Documentation only changes
- `style:` - Code style changes (formatting, missing semi colons, etc.)
- `refactor:` - Code refactoring (no feature change, no bug fix)
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `build:` - Changes to build system or dependencies
- `ci:` - Changes to CI configuration files and scripts
- `chore:` - Other changes that don't modify src or test files
- `revert:` - Reverts a previous commit

**Breaking changes:**

- Add `!` after the type/scope: `feat!:` or `feat(api)!:`
- OR add `BREAKING CHANGE:` in the footer
- Triggers MAJOR version bump

**Examples:**

```bash
# Feature commits
feat: add user authentication
feat(cli): add interactive prompt for configuration
feat(build)!: change output directory from dist to build

# Fix commits
fix: resolve memory leak in file watcher
fix(deps): update vulnerable dependency

# Other commits
docs: update installation instructions
test: add unit tests for authentication module
refactor: simplify error handling logic
chore: update dependencies
ci: add automated release workflow

# Breaking change examples
feat!: change API response format

feat(api)!: remove deprecated endpoints

BREAKING CHANGE: The `getData()` method now returns a Promise
```

**Scope examples for this project:**

- `cli` - CLI interface changes
- `commands` - Command implementations
- `utils` - Utility functions
- `build` - Build configuration
- `deps` - Dependency updates
- `types` - TypeScript type definitions

### Changelog Management

Maintain a `CHANGELOG.md` file in the root of the project following [Keep a Changelog](https://keepachangelog.com/) format.

**Changelog structure:**

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- New features that are unreleased

### Changed

- Changes in existing functionality

### Deprecated

- Soon-to-be removed features

### Removed

- Removed features

### Fixed

- Bug fixes

### Security

- Security vulnerability fixes

## [1.0.0] - 2026-02-04

### Added

- Initial release
- User authentication
- CLI commands for project scaffolding

### Changed

- Improved error messages

### Fixed

- Fixed memory leak in file watcher
```

**Change categories:**

- `Added` - New features
- `Changed` - Changes in existing functionality
- `Deprecated` - Soon-to-be removed features
- `Removed` - Now removed features
- `Fixed` - Bug fixes
- `Security` - Security fixes

**Guidelines:**

1. **Keep Unreleased section** - Add changes here during development
2. **Update on release** - Move Unreleased items to a new version section
3. **Date format** - Use ISO 8601 format (YYYY-MM-DD)
4. **Link versions** - Link to GitHub releases/tags at bottom of file
5. **User perspective** - Write for users, not developers
6. **Be specific** - Include enough detail to understand the change
7. **Reference issues** - Link to GitHub issues/PRs when relevant

**Example workflow:**

```bash
# 1. Make changes and commit with conventional commit
git add .
git commit -m "feat: add export command"

# 2. Update CHANGELOG.md - add to Unreleased section
## [Unreleased]
### Added
- Export command to export project data

# 3. When ready to release, update version in package.json
# and move Unreleased changes to new version section

## [0.2.0] - 2026-02-04
### Added
- Export command to export project data

# 4. Commit the release
git add .
git commit -m "chore(release): 0.2.0"
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin main --tags
```

### Release Workflow

1. **Ensure all tests pass**: `pnpm test`
2. **Ensure code is linted**: `pnpm lint`
3. **Update CHANGELOG.md**: Move Unreleased items to new version section
4. **Update package.json version**: Follow semantic versioning
5. **Commit changes**: `git commit -m "chore(release): X.Y.Z"`
6. **Create git tag**: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`
7. **Push changes**: `git push origin main --tags`
8. **Build and publish**: `pnpm build && pnpm publish`

---

## CLI Development Patterns

### 1. Console Logging with Consola

**Import and basic usage:**

```typescript
import { consola } from 'consola';

// Log levels
consola.info('Starting application...');
consola.success('Build completed!');
consola.warn('Deprecated API used');
consola.error('Failed to load config');
consola.debug('Debug information');

// Start/stop indicators
consola.start('Building project...');
consola.success('Project built!');

// Box output
consola.box('Important message in a box');
```

**Scoped loggers:**

```typescript
const logger = consola.withTag('my-module');
logger.info('Module loaded'); // [my-module] Module loaded
```

**Prompts with consola:**

```typescript
const answer = await consola.prompt('Deploy to production?', {
  type: 'confirm',
});

if (answer) {
  consola.success('Deploying...');
}
```

**Testing with consola:**

```typescript
import { consola } from 'consola';
import { vi } from 'vitest';

// Mock in tests
consola.mockTypes(() => vi.fn());

// Check calls
expect(consola.info).toHaveBeenCalledWith('Expected message');
```

### 2. Executing Shell Commands with Execa

**Import and basic usage:**

```typescript
import { execa } from 'execa';

// Simple command execution
const { stdout } = await execa`pnpm build`;
console.log(stdout);

// Using $ for script-like syntax
import { $ } from 'execa';

const branch = await $`git branch --show-current`;
await $`git push origin ${branch}`;
```

**Advanced patterns:**

```typescript
// Pipe commands
const { stdout } = await execa`pnpm build`.pipe`sort`.pipe`head -n 10`;

// With options
const result = await execa({
  cwd: '/path/to/project',
  env: { NODE_ENV: 'production' },
  preferLocal: true, // Use local node_modules/.bin
})`pnpm test`;

// Get both stdout and stderr interleaved
const { all } = await execa({ all: true })`pnpm build`;

// Stream to terminal while capturing
const { stdout } = await execa({
  stdout: ['pipe', 'inherit'],
})`pnpm build`;
```

**Error handling:**

```typescript
import { execa, ExecaError } from 'execa';

try {
  await execa`some-command`;
} catch (error) {
  if (error instanceof ExecaError) {
    console.log(error.command); // Command that failed
    console.log(error.exitCode); // Exit code
    console.log(error.stdout); // Standard output
    console.log(error.stderr); // Error output
  }
}
```

### 3. Interactive Prompts with Prompts

**Import and basic usage:**

```typescript
import prompts from 'prompts';

// Single prompt
const response = await prompts({
  type: 'text',
  name: 'name',
  message: 'What is your name?',
});
console.log(response.name);

// Multiple prompts
const answers = await prompts([
  {
    type: 'text',
    name: 'username',
    message: 'GitHub username?',
  },
  {
    type: 'number',
    name: 'age',
    message: 'How old are you?',
  },
]);
```

**Prompt types:**

```typescript
// Text input
{ type: 'text', name: 'name', message: 'Your name?' }

// Password (hidden input)
{ type: 'password', name: 'token', message: 'API token?' }

// Number input
{
  type: 'number',
  name: 'count',
  message: 'How many?',
  min: 1,
  max: 10
}

// Confirmation
{ type: 'confirm', name: 'proceed', message: 'Continue?', initial: true }

// Select (single choice)
{
  type: 'select',
  name: 'env',
  message: 'Choose environment',
  choices: [
    { title: 'Development', value: 'dev' },
    { title: 'Production', value: 'prod' }
  ]
}

// Multi-select (multiple choices)
{
  type: 'multiselect',
  name: 'features',
  message: 'Select features',
  choices: [
    { title: 'TypeScript', value: 'ts', selected: true },
    { title: 'ESLint', value: 'eslint' }
  ]
}

// Autocomplete
{
  type: 'autocomplete',
  name: 'color',
  message: 'Pick a color',
  choices: [
    { title: 'Red', value: '#ff0000' },
    { title: 'Green', value: '#00ff00' }
  ]
}
```

**Dynamic/conditional prompts:**

```typescript
const questions = [
  {
    type: 'confirm',
    name: 'usesTypeScript',
    message: 'Use TypeScript?',
  },
  {
    // Only ask if previous answer was true
    type: prev => (prev ? 'text' : null),
    name: 'tsconfig',
    message: 'Path to tsconfig.json?',
  },
];
```

**Validation:**

```typescript
{
  type: 'text',
  name: 'email',
  message: 'Email address?',
  validate: (value) =>
    value.includes('@') ? true : 'Invalid email address'
}
```

### 4. Progress Spinners with Ora

**Import and basic usage:**

```typescript
import ora from 'ora';

// Basic spinner
const spinner = ora('Loading...').start();
await someLongTask();
spinner.succeed('Done!');

// Update text while spinning
const spinner = ora('Step 1').start();
await step1();
spinner.text = 'Step 2';
await step2();
spinner.succeed('All steps completed');
```

**Different completion states:**

```typescript
const spinner = ora('Processing').start();

try {
  await task();
  spinner.succeed('Success!'); // Green checkmark
} catch (error) {
  spinner.fail('Failed!'); // Red X
}

// Other states
spinner.warn('Warning message'); // Yellow warning symbol
spinner.info('Info message'); // Blue info symbol
```

**Custom symbols and text:**

```typescript
spinner.stopAndPersist({
  symbol: '🎉',
  text: 'Custom completion message',
});
```

**Spinner options:**

```typescript
const spinner = ora({
  text: 'Loading',
  color: 'yellow', // Color of spinner
  spinner: 'dots', // Spinner style (dots, line, etc.)
  indent: 2, // Indent level
  prefixText: '[BUILD]', // Text before spinner
  suffixText: '(1/10)', // Text after spinner
}).start();
```

**With promises:**

```typescript
import { oraPromise } from 'ora';

// Spinner automatically succeeds or fails based on promise
await oraPromise(fetch('https://api.example.com'), 'Fetching data...');

// With custom success/fail text
await oraPromise(buildProject(), {
  text: 'Building project',
  successText: 'Build complete!',
  failText: error => `Build failed: ${error.message}`,
});
```

**Logging while spinner runs:**

```typescript
const spinner = ora('Processing...').start();

// You can still log - spinner handles it gracefully
console.log('Step 1 complete');
console.log('Step 2 complete');

spinner.succeed('All done!');
// Output will be clean with logs appearing above spinner
```

---

## Project Structure Best Practices

### Recommended Structure

```
project-root/
├── src/
│   ├── index.ts          # Main CLI entry point
│   ├── commands/         # CLI commands
│   │   ├── build.ts
│   │   └── deploy.ts
│   ├── utils/            # Utility functions
│   │   ├── logger.ts     # Consola setup
│   │   ├── exec.ts       # Execa wrappers
│   │   └── prompts.ts    # Common prompts
│   └── types/            # TypeScript types
├── tests/                # Vitest tests
│   ├── commands/
│   └── utils/
├── package.json
├── tsconfig.json
├── tsup.config.ts        # Optional tsup config
└── vitest.config.ts      # Optional vitest config
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsup src/index.ts --format esm --dts",
    "start": "node dist/index.js",
    "lint": "oxlint && oxfmt",
    "lint:fix": "oxlint --fix && oxfmt --write",
    "test": "vitest",
    "test:watch": "vitest watch"
  },
  "packageManager": "pnpm@10.28.2+sha512.41872f037ad22f7348e3b1debbaf7e867cfd448f2726d9cf74c08f19507c31d2c8e7a11525b983febc2df640b5438dee6023ebb1f84ed43cc2d654d2bc326264"
}
```

### tsconfig.json for CLI

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### tsup.config.ts Example

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true, // Generate .d.ts files
  splitting: false,
  sourcemap: true,
  clean: true,
  shims: true, // Add shims for __dirname, etc.
  minify: false,
});
```

---

## Common Patterns and Examples

### Complete CLI Command Pattern

```typescript
import { consola } from 'consola';
import { $ } from 'execa';
import prompts from 'prompts';
import ora from 'ora';

async function buildCommand() {
  // 1. Gather user input
  const { environment } = await prompts({
    type: 'select',
    name: 'environment',
    message: 'Select build environment',
    choices: [
      { title: 'Development', value: 'dev' },
      { title: 'Production', value: 'prod' },
    ],
  });

  // 2. Show progress
  const spinner = ora('Building application').start();

  try {
    // 3. Execute build
    await $`pnpm build`;

    // 4. Success feedback
    spinner.succeed('Build completed successfully');
    consola.success(`Built for ${environment}`);
  } catch (error) {
    // 5. Error handling
    spinner.fail('Build failed');
    consola.error(error.message);
    process.exit(1);
  }
}
```

### Testing Pattern

```typescript
// src/utils/logger.ts
import { consola } from 'consola';
export const logger = consola.withTag('app');

// tests/utils/logger.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logger } from '../src/utils/logger';

describe('Logger', () => {
  beforeEach(() => {
    logger.mockTypes(() => vi.fn());
  });

  it('logs info messages', () => {
    logger.info('Test message');
    expect(logger.info).toHaveBeenCalledWith('Test message');
  });
});
```

### Error Handling Pattern

```typescript
import { consola } from 'consola';
import { ExecaError } from 'execa';

async function handleCommand() {
  try {
    await executeTask();
  } catch (error) {
    if (error instanceof ExecaError) {
      consola.error(`Command failed: ${error.command}`);
      consola.error(`Exit code: ${error.exitCode}`);
      if (error.stderr) {
        consola.error('Error output:', error.stderr);
      }
    } else {
      consola.error('Unexpected error:', error);
    }
    process.exit(1);
  }
}
```

---

## Key Differences from Other Tools

### oxlint vs ESLint

- **oxlint**: Rust-based, extremely fast, minimal config, focused on core rules
- **ESLint**: JavaScript-based, slower, highly configurable, extensive plugin ecosystem
- **When to use oxlint**: Fast feedback during development, CI/CD pipelines
- **Note**: No plugin system yet, covers most common linting needs

### tsx vs ts-node

- **tsx**: Modern, faster, better ESM support, actively maintained
- **ts-node**: Older, slower, CommonJS-focused
- **Use tsx** for all new projects

### tsup vs tsc

- **tsup**: Fast bundler using esbuild, includes everything needed
- **tsc**: TypeScript compiler, type checking only
- **Pattern**: Use `tsc --noEmit` for type checking, tsup for building

### Vitest vs Jest

- **Vitest**: Vite-powered, faster, native ESM, better TypeScript support
- **Jest**: Older, more ecosystem packages, CommonJS-focused
- **API compatibility**: Vitest is largely Jest-compatible

### consola vs console

- **consola**: Beautiful output, log levels, tagging, mocking support
- **console**: Basic, no colors, no structure
- **Always use consola** in CLI applications

---

## Testing Guidelines

### Test Structure

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Feature', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

### Mocking Shell Commands

```typescript
import { vi } from 'vitest';
import { execa } from 'execa';

// Mock execa
vi.mock('execa', () => ({
  execa: vi.fn(() => Promise.resolve({ stdout: 'mocked output' })),
  $: vi.fn(() => Promise.resolve({ stdout: 'mocked output' })),
}));
```

### Mocking Prompts

```typescript
import prompts from 'prompts';

// Inject answers for testing
prompts.inject(['answer1', 'answer2']);

const response = await prompts({
  type: 'text',
  name: 'test',
  message: 'Question?',
});
// response.test === 'answer1'
```

---

## Performance Considerations

1. **Use tsx for development** - Much faster than ts-node
2. **Use oxlint over ESLint** - 50-100x faster for linting
3. **Prefer execa over child_process** - Better API, error handling
4. **Use tsup for production builds** - Powered by esbuild (extremely fast)
5. **Vitest watch mode** - Near-instant test feedback

---

## Debugging

### Enable verbose output

```typescript
// In development
if (process.env.DEBUG) {
  consola.level = 5; // Verbose logging
}
```

### Debug execa commands

```typescript
const result = await execa({
  verbose: 'full', // Log command and output
})`command`;
```

---

## Environment Variables

```typescript
// Check for CI environment
import { isCI } from 'std-env';

if (isCI) {
  // Disable interactive prompts
}

// Use dotenv for local development
import 'dotenv/config';
```

---

## Summary Checklist

When building CLI features, always:

- ✅ Use **consola** for all logging (not console.log)
- ✅ Use **execa** or **$** for shell commands (not child_process)
- ✅ Use **prompts** for user input (not readline)
- ✅ Use **ora** for long-running operations
- ✅ Use **tsx** for development
- ✅ Use **tsup** for production builds
- ✅ Use **vitest** for testing
- ✅ Use **oxlint** for linting
- ✅ Use **oxfmt** for formatting
- ✅ Handle errors gracefully with proper exit codes
- ✅ Mock console output in tests
- ✅ Test both success and failure paths

**Version management and commits:**

- ✅ Follow **Semantic Versioning** (MAJOR.MINOR.PATCH)
- ✅ Use **Conventional Commits** for all commit messages
- ✅ Update **CHANGELOG.md** for all notable changes
- ✅ Add changes to Unreleased section during development
- ✅ Move to versioned section before release
- ✅ Include breaking changes with `!` or `BREAKING CHANGE:`
- ✅ Use appropriate commit types (feat, fix, docs, etc.)
- ✅ Test and lint before creating releases

---

## Additional Resources

- **oxlint**: <https://oxc.rs/docs/guide/usage/linter>
- **tsx**: <https://tsx.is/>
- **tsup**: <https://tsup.egoist.dev/>
- **consola**: <https://github.com/unjs/consola>
- **execa**: <https://github.com/sindresorhus/execa>
- **prompts**: <https://github.com/terkelg/prompts>
- **ora**: <https://github.com/sindresorhus/ora>
- **vitest**: <https://vitest.dev/>
- **Semantic Versioning**: <https://semver.org/>
- **Conventional Commits**: <https://www.conventionalcommits.org/>
- **Keep a Changelog**: <https://keepachangelog.com/>

---

_This document should be referenced when implementing CLI features, reviewing code, or troubleshooting issues in this project._

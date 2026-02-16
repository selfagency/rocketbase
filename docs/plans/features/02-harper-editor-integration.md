# Harper.js Editor Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate Harper.js grammar and spell checking into the tipex WYSIWYG editor for real-time writing assistance.

**Architecture:** Client-side Harper.js integration with tipex using TipTap extension pattern. Real-time grammar/spell checking with visual indicators (underlines) and suggestion popups.

**Tech Stack:** Harper.js (`@writewithharper/harperjs`), tipex (TipTap-based editor), Svelte 5, shadcn-svelte (Popover for suggestions)

---

## Overview

### User Stories

**As a content editor, I want to:**

- See grammar and spelling errors highlighted in real-time as I write
- Click on errors to see suggestions and corrections
- Accept or dismiss suggestions with one click
- Configure Harper.js settings (disable spell check, etc.)
- Have grammar checking work seamlessly with existing editor features

### Current State

**Tipex Editor:**

- Location: `/Users/daniel/Developer/rocketbase/app/src/lib/components/ui/tipex-editor.svelte`
- Used in: Post form, Page form
- Based on: `@friendofsvelte/tipex` (TipTap wrapper)
- Features: Rich text editing, media insertion, HTML editing, floating toolbar

**No Grammar Checking:**

- Currently no spell/grammar checking
- Users rely on browser's built-in spell check only
- No intelligent grammar suggestions

**Files to Reference:**

- Tipex component: `/Users/daniel/Developer/rocketbase/app/src/lib/components/ui/tipex-editor.svelte`
- Post form: `/Users/daniel/Developer/rocketbase/app/src/lib/components/admin/posts/post-form.svelte`
- Page form: `/Users/daniel/Developer/rocketbase/app/src/lib/components/admin/pages/page-form.svelte`

### Success Criteria

- ✅ Harper.js installed and configured
- ✅ Real-time grammar/spell checking in editor
- ✅ Visual error indicators (underlines)
- ✅ Suggestion popups on click/hover
- ✅ Accept/dismiss functionality
- ✅ Performance: No lag on 5000+ word documents
- ✅ Works with existing editor features (media, HTML, etc.)
- ✅ Tests: Unit tests for Harper integration, E2E tests for user workflow
- ✅ Documentation: User guide for using grammar checking

---

## Research Phase

### Task 1: Study Harper.js Documentation

**Step 1: Fetch Harper.js introduction**

Web fetch: `https://writewithharper.com/docs/harperjs/introduction`
Note: What Harper.js does, browser vs Node.js usage

**Step 2: Fetch Harper.js installation guide**

Web fetch: `https://writewithharper.com/docs/harperjs/installation`
Note: NPM package name, peer dependencies, setup instructions

**Step 3: Fetch Harper.js API reference**

Web fetch: `https://writewithharper.com/docs/harperjs/api`
Note: Core functions, configuration options, return types

**Step 4: Fetch TipTap integration examples**

Web search: "harper.js tiptap integration"
Note: Any existing TipTap extensions or integration patterns

**Step 5: Document findings**

Create: `docs/research/harper-js-integration.md`

Expected findings:

- Harper.js is a lightweight grammar checker
- Works in browser (WASM) or Node.js
- Returns array of `Lint` objects with suggestions
- Can be configured (enable/disable spell check, etc.)

---

### Task 2: Explore Tipex/TipTap Extension System

**Step 1: Read tipex component**

Read: `/Users/daniel/Developer/rocketbase/app/src/lib/components/ui/tipex-editor.svelte`
Note: How editor instance is accessed, how content is managed, event handling

**Step 2: Check TipTap extension docs**

Web fetch: `https://tiptap.dev/docs/editor/extensions/custom-extensions`
Note: Extension API, Mark vs Node extensions, decoration patterns

**Step 3: Identify integration point**

Options:

1. **TipTap Extension** - Create custom extension for Harper.js
2. **External decorator** - Run Harper.js separately and apply decorations
3. **Plugin approach** - Use ProseMirror plugin API

Decision: Use **TipTap Extension** for tight integration

**Step 4: Document architecture**

Create architecture diagram:

```
TipexEditor
├── TipTap Editor Instance
│   ├── Existing Extensions (Bold, Italic, etc.)
│   └── HarperExtension (new)
│       ├── Decoration updates on content change
│       ├── Click handler for suggestions
│       └── Command for accept/dismiss
└── HarperSuggestionPopover (new component)
    ├── Shows suggestions for clicked error
    └── Accept/Dismiss buttons
```

---

### Task 3: Prototype Harper.js in Isolation

**Step 1: Install Harper.js**

Run: `cd app && pnpm add @writewithharper/harperjs`

**Step 2: Create test file**

Create: `app/src/lib/utils/harper-test.ts`

```typescript
import { lint } from "@writewithharper/harperjs";

const text = "This are a test sentence with errors.";
const lints = lint(text);

console.log(lints);
// Expected: Array of lint objects with positions and suggestions
```

**Step 3: Run test**

Run: `node --loader ts-node/esm app/src/lib/utils/harper-test.ts`
Expected: See lint results in console

**Step 4: Test with HTML content**

Harper.js works with plain text. Need to:

1. Extract text from HTML
2. Map positions back to HTML
3. Apply decorations

Create: `app/src/lib/utils/harper-html-mapper.ts`

```typescript
export function extractTextFromHTML(html: string): {
  text: string;
  map: number[];
} {
  // Strip HTML tags, preserve positions
  // Return plain text + position map
}

export function mapLintToHTML(
  lint: Lint,
  map: number[]
): { start: number; end: number } {
  // Convert plain text position to HTML position
}
```

**Step 5: Test HTML mapper**

Write tests for HTML extraction and position mapping

**Step 6: Clean up test files**

Run: `rm app/src/lib/utils/harper-test.ts`

---

## Development Phase

### Task 4: Create TipTap Harper Extension

**Files:**

- Create: `app/src/lib/components/ui/tipex-extensions/harper-extension.ts`

**Step 1: Write failing test**

Create: `app/src/lib/components/ui/tipex-extensions/harper-extension.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { createEditor } from "@tiptap/core";
import { HarperExtension } from "./harper-extension";

describe("HarperExtension", () => {
  it("creates extension with config", () => {
    const extension = HarperExtension.configure({
      spellCheck: true,
    });

    expect(extension.name).toBe("harper");
  });

  it("lints content on editor update", async () => {
    const editor = createEditor({
      extensions: [HarperExtension],
      content: "<p>This are wrong.</p>",
    });

    // Wait for linting
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should have decorations
    const decorations = editor.view.decorations;
    expect(decorations).toBeDefined();
  });
});
```

**Step 2: Run test (should fail)**

Run: `cd app && pnpm test harper-extension.test.ts`
Expected: FAIL - HarperExtension not defined

**Step 3: Implement Harper Extension**

Create: `app/src/lib/components/ui/tipex-extensions/harper-extension.ts`

```typescript
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { lint, type Lint } from "@writewithharper/harperjs";

export interface HarperOptions {
  spellCheck?: boolean;
  grammarCheck?: boolean;
  debounceMs?: number;
}

export const HarperExtension = Extension.create<HarperOptions>({
  name: "harper",

  addOptions() {
    return {
      spellCheck: true,
      grammarCheck: true,
      debounceMs: 500,
    };
  },

  addProseMirrorPlugins() {
    const { spellCheck, grammarCheck, debounceMs } = this.options;

    return [
      new Plugin({
        key: new PluginKey("harper"),
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldSet) {
            if (!tr.docChanged) return oldSet;

            // Extract text from document
            const text = tr.doc.textContent;

            // Lint with Harper.js
            const lints = lint(text, {
              // TODO: Map Harper config from extension options
            });

            // Create decorations
            const decorations = lints.map((lint: Lint) => {
              const from = lint.start;
              const to = lint.end;

              return Decoration.inline(from, to, {
                class: getDecorationClass(lint.type),
                "data-harper-lint": JSON.stringify(lint),
              });
            });

            return DecorationSet.create(tr.doc, decorations);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

function getDecorationClass(type: string): string {
  switch (type) {
    case "spelling":
      return "harper-spelling-error";
    case "grammar":
      return "harper-grammar-error";
    default:
      return "harper-error";
  }
}
```

**Step 4: Add CSS for decorations**

Create: `app/src/lib/components/ui/tipex-extensions/harper-extension.css`

```css
.harper-spelling-error {
  text-decoration: underline wavy red;
  cursor: pointer;
}

.harper-grammar-error {
  text-decoration: underline wavy blue;
  cursor: pointer;
}

.harper-error {
  text-decoration: underline wavy orange;
  cursor: pointer;
}
```

**Step 5: Run test (should pass)**

Run: `cd app && pnpm test harper-extension.test.ts`
Expected: PASS

**Step 6: Commit Harper extension**

Run:

```bash
git add app/src/lib/components/ui/tipex-extensions/
git commit -m "feat: add Harper.js TipTap extension (bean-<id>)"
```

---

### Task 5: Create Suggestion Popover Component

**Files:**

- Create: `app/src/lib/components/ui/harper-suggestion-popover.svelte`

**Step 1: Write component**

```svelte
<script lang="ts">
  import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
  import { Button } from '$lib/components/ui/button';
  import type { Lint } from '@writewithharper/harperjs';

  export let lint: Lint;
  export let onAccept: (suggestion: string) => void;
  export let onDismiss: () => void;
  export let open = false;

  $: suggestion = lint.suggestions?.[0]; // Use first suggestion
</script>

<Popover bind:open>
  <PopoverTrigger />
  <PopoverContent class="w-80">
    <div class="space-y-2">
      <p class="text-sm font-medium">
        {lint.message}
      </p>

      {#if suggestion}
        <div class="bg-muted p-2 rounded">
          <p class="text-sm font-mono">{suggestion}</p>
        </div>

        <div class="flex gap-2">
          <Button size="sm" on:click={() => onAccept(suggestion)}>
            Accept
          </Button>
          <Button size="sm" variant="outline" on:click={onDismiss}>
            Dismiss
          </Button>
        </div>
      {:else}
        <Button size="sm" variant="outline" on:click={onDismiss}>
          Dismiss
        </Button>
      {/if}
    </div>
  </PopoverContent>
</Popover>
```

**Step 2: Write component tests**

Create: `app/src/lib/components/ui/harper-suggestion-popover.test.ts`

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import HarperSuggestionPopover from "./harper-suggestion-popover.svelte";

describe("HarperSuggestionPopover", () => {
  it("renders lint message", () => {
    render(HarperSuggestionPopover, {
      props: {
        lint: {
          message: "Grammar error detected",
          suggestions: ["Correct version"],
          start: 0,
          end: 5,
        },
        onAccept: vi.fn(),
        onDismiss: vi.fn(),
        open: true,
      },
    });

    expect(screen.getByText("Grammar error detected")).toBeInTheDocument();
  });

  it("calls onAccept when Accept button clicked", async () => {
    const onAccept = vi.fn();

    render(HarperSuggestionPopover, {
      props: {
        lint: {
          message: "Error",
          suggestions: ["Fix"],
          start: 0,
          end: 5,
        },
        onAccept,
        onDismiss: vi.fn(),
        open: true,
      },
    });

    await fireEvent.click(screen.getByText("Accept"));
    expect(onAccept).toHaveBeenCalledWith("Fix");
  });
});
```

**Step 3: Run tests**

Run: `cd app && pnpm test harper-suggestion-popover.test.ts`
Expected: All tests pass

**Step 4: Commit popover component**

Run:

```bash
git add app/src/lib/components/ui/harper-suggestion-popover.svelte
git add app/src/lib/components/ui/harper-suggestion-popover.test.ts
git commit -m "feat: add Harper suggestion popover (bean-<id>)"
```

---

### Task 6: Integrate Harper into Tipex Editor

**Files:**

- Modify: `app/src/lib/components/ui/tipex-editor.svelte`

**Step 1: Add Harper extension to editor**

```svelte
<script lang="ts">
  import { HarperExtension } from './tipex-extensions/harper-extension';
  import HarperSuggestionPopover from './harper-suggestion-popover.svelte';
  import type { Lint } from '@writewithharper/harperjs';

  // ... existing props

  let selectedLint: Lint | null = null;
  let popoverOpen = false;

  // Add Harper to extensions
  const extensions = [
    // ... existing extensions
    HarperExtension.configure({
      spellCheck: true,
      grammarCheck: true,
    }),
  ];

  // Handle click on Harper decoration
  function handleEditorClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const lintData = target.getAttribute('data-harper-lint');

    if (lintData) {
      selectedLint = JSON.parse(lintData);
      popoverOpen = true;
    }
  }

  function acceptSuggestion(suggestion: string) {
    if (!editor || !selectedLint) return;

    // Replace text in editor
    editor.commands.insertContentAt(
      { from: selectedLint.start, to: selectedLint.end },
      suggestion
    );

    popoverOpen = false;
    selectedLint = null;
  }

  function dismissSuggestion() {
    popoverOpen = false;
    selectedLint = null;
  }
</script>

<div on:click={handleEditorClick} role="presentation">
  <!-- existing editor markup -->
</div>

{#if selectedLint}
  <HarperSuggestionPopover
    lint={selectedLint}
    onAccept={acceptSuggestion}
    onDismiss={dismissSuggestion}
    bind:open={popoverOpen}
  />
{/if}
```

**Step 2: Import Harper CSS**

Add to `tipex-editor.svelte`:

```svelte
<style>
  @import './tipex-extensions/harper-extension.css';
</style>
```

**Step 3: Test in browser**

Run: `cd app && pnpm dev`
Navigate: `/admin/posts/new`
Action: Type "This are wrong" in editor
Expected: "are" underlined, click shows suggestions

**Step 4: Commit integration**

Run:

```bash
git add app/src/lib/components/ui/tipex-editor.svelte
git commit -m "feat: integrate Harper.js into tipex editor (bean-<id>)"
```

---

### Task 7: Add Harper Settings (Optional)

**Files:**

- Create: `app/src/lib/components/ui/harper-settings-dialog.svelte`

**Step 1: Create settings dialog**

```svelte
<script lang="ts">
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
  import { Switch } from '$lib/components/ui/switch';
  import { Label } from '$lib/components/ui/label';

  export let open = false;
  export let spellCheck = true;
  export let grammarCheck = true;

  export let onSave: (config: { spellCheck: boolean; grammarCheck: boolean }) => void;
</script>

<Dialog bind:open>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Grammar Checker Settings</DialogTitle>
    </DialogHeader>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <Label for="spell-check">Enable Spell Check</Label>
        <Switch id="spell-check" bind:checked={spellCheck} />
      </div>

      <div class="flex items-center justify-between">
        <Label for="grammar-check">Enable Grammar Check</Label>
        <Switch id="grammar-check" bind:checked={grammarCheck} />
      </div>

      <Button on:click={() => onSave({ spellCheck, grammarCheck })}>
        Save Settings
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

**Step 2: Add settings button to editor**

In `tipex-editor.svelte`, add button to trigger settings dialog

**Step 3: Persist settings to localStorage**

```typescript
function saveHarperSettings(config: {
  spellCheck: boolean;
  grammarCheck: boolean;
}) {
  localStorage.setItem("harper-settings", JSON.stringify(config));
  // Reconfigure editor extension
}

function loadHarperSettings() {
  const saved = localStorage.getItem("harper-settings");
  return saved ? JSON.parse(saved) : { spellCheck: true, grammarCheck: true };
}
```

**Step 4: Commit settings**

Run:

```bash
git add app/src/lib/components/ui/harper-settings-dialog.svelte
git commit -m "feat: add Harper settings dialog (bean-<id>)"
```

---

## Testing Phase

### Task 8: Write E2E Tests

**Files:**

- Create: `app/tests/e2e/harper-integration.spec.ts`

**Step 1: Write E2E test**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Harper.js Integration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');
  });

  test("highlights grammar errors in editor", async ({ page }) => {
    await page.goto("/admin/posts/new");

    // Type text with error
    const editor = page.locator(".ProseMirror");
    await editor.fill("This are wrong.");

    // Wait for Harper to process
    await page.waitForTimeout(600); // Debounce time

    // Should see underline decoration
    const error = page.locator(".harper-grammar-error");
    await expect(error).toBeVisible();
  });

  test("shows suggestions on error click", async ({ page }) => {
    await page.goto("/admin/posts/new");

    const editor = page.locator(".ProseMirror");
    await editor.fill("This are wrong.");
    await page.waitForTimeout(600);

    // Click on error
    await page.click(".harper-grammar-error");

    // Should see popover with suggestion
    await expect(page.locator("text=is")).toBeVisible(); // Suggested correction
    await expect(page.locator('button:has-text("Accept")')).toBeVisible();
  });

  test("accepts suggestion and updates text", async ({ page }) => {
    await page.goto("/admin/posts/new");

    const editor = page.locator(".ProseMirror");
    await editor.fill("This are wrong.");
    await page.waitForTimeout(600);

    await page.click(".harper-grammar-error");
    await page.click('button:has-text("Accept")');

    // Text should be corrected
    const content = await editor.textContent();
    expect(content).toBe("This is wrong.");
  });
});
```

**Step 2: Run E2E tests**

Run: `cd app && pnpm test:e2e harper-integration.spec.ts`
Expected: All tests pass

**Step 3: Commit E2E tests**

Run:

```bash
git add app/tests/e2e/harper-integration.spec.ts
git commit -m "test: add Harper integration E2E tests (bean-<id>)"
```

---

### Task 9: Performance Testing

**Step 1: Create large document test**

```typescript
test("handles large documents without lag", async ({ page }) => {
  await page.goto("/admin/posts/new");

  // Generate 5000 word document
  const largeText = "Lorem ipsum dolor sit amet. ".repeat(700); // ~5000 words

  const editor = page.locator(".ProseMirror");
  await editor.fill(largeText);

  // Measure typing performance
  const start = Date.now();
  await editor.type("Additional text");
  const end = Date.now();

  // Should type within 100ms
  expect(end - start).toBeLessThan(100);
});
```

**Step 2: Run performance test**

Run: `cd app && pnpm test:e2e harper-integration.spec.ts`

**Step 3: Optimize if needed**

If performance issues:

- Increase debounce time
- Add memoization for lint results
- Only lint visible text (viewport)

---

## Documentation Phase

### Task 10: Write User Documentation

**Files:**

- Create: `docs/user-guide/grammar-checking.md`

**Step 1: Write user guide**

```markdown
# Grammar Checking in the Editor

The editor includes built-in grammar and spell checking powered by Harper.js.

## Using Grammar Checking

As you write, the editor automatically checks your content for:

- **Spelling errors** (red wavy underline)
- **Grammar errors** (blue wavy underline)

### Viewing Suggestions

Click on any underlined error to see suggestions:

1. Click the underlined word or phrase
2. A popup appears with:
   - Error description
   - Suggested correction(s)
   - Accept or Dismiss buttons

### Accepting Suggestions

- Click **Accept** to replace the error with the suggestion
- Click **Dismiss** to ignore the error

### Settings

You can configure grammar checking:

1. Click the settings icon in the editor
2. Toggle **Spell Check** and **Grammar Check** on/off
3. Click **Save Settings**

Settings are saved locally in your browser.

## Limitations

- Grammar checking works with English text only
- Some complex sentences may not be analyzed correctly
- Technical terms may be flagged as spelling errors

## Tips

- Grammar checking updates in real-time (with a short delay)
- Errors are highlighted as you type
- You can continue editing while errors are highlighted
- Dismissing an error only affects the current editing session
```

**Step 2: Commit user docs**

Run:

```bash
git add docs/user-guide/grammar-checking.md
git commit -m "docs: add grammar checking user guide (bean-<id>)"
```

---

## Completion Checklist

- [ ] Harper.js documentation reviewed
- [ ] TipTap extension system understood
- [ ] Harper.js installed and tested in isolation
- [ ] TipTap Harper extension created and tested
- [ ] Suggestion popover component created
- [ ] Harper integrated into tipex editor
- [ ] Settings dialog created (optional)
- [ ] E2E tests written and passing
- [ ] Performance tested with large documents
- [ ] User documentation written
- [ ] All commits include bean ID
- [ ] Quality gates passed (lint, test, build)

---

## Follow-Up Tasks

**Future Enhancements:**

- Custom dictionary support (add technical terms)
- Language detection and multi-language support
- Server-side grammar checking for non-browser environments
- Advanced Harper.js configuration (style guides, formality level)
- Grammar checking statistics/insights

**Integration with Other Features:**

- Add grammar checking to comment editor
- Add to email composer (newsletters)
- Add to metadata description fields

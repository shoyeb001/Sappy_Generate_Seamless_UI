# AI UI Generator — Project Context

## 1. Project Overview

This project is an AI-powered UI generation platform inspired by tools such as Google Stitch.

The application allows users to describe an application or UI using natural language. The AI analyzes the request, creates a design system, determines which screens are required, and generates complete HTML + Tailwind CSS interfaces.

The generated screens are displayed visually on an infinite React Flow canvas.

The goal of the hackathon MVP is to provide a fast prompt-to-UI experience where users can:

1. Enter a natural-language UI prompt.
2. Let AI determine the required application screens.
3. Automatically generate a consistent design system.
4. Generate multiple UI screens in parallel.
5. Watch generated screens appear progressively on a React Flow canvas.
6. Select and preview individual screens.
7. View the generated HTML + Tailwind code.
8. Export individual screens as PNG or JPG.

The application does NOT generate React application code for the generated UI.

The AI-generated UI output is primarily self-contained HTML styled with Tailwind CSS.

---

# 2. Example User Experience

A user opens the application and sees a large prompt input.

Example prompt:

> Create a modern online teaching platform for students where they can discover courses, track their learning progress, watch lessons, and manage their profile.

The user clicks:

> Generate UI

The frontend sends the prompt to the FastAPI backend.

The LangGraph AI workflow analyzes the prompt and determines that the application may require:

* Login
* Student Dashboard
* Course Discovery
* Course Details
* Learning / Lesson Screen
* Student Profile

The AI also generates a shared design system.

Example:

* Primary color: Indigo
* Secondary color: Violet
* Background: Light gray
* Heading font: Hanken Grotesk
* Body font: Inter
* Border radius: 12px
* Design direction: Modern educational SaaS

Once planning is complete, the system generates each screen.

Screen generation should happen in parallel when possible.

As individual screens finish generating, they are sent to the frontend and progressively appear on the React Flow canvas.

The final canvas may visually look like:

```
Login
  │
  ▼
Dashboard
  │
  ├─────────────┐
  ▼             ▼
Courses       Profile
  │
  ▼
Course Details
  │
  ▼
Lesson Player
```

Each node contains a scaled preview of the actual generated HTML interface.

The user can move around the canvas, zoom, pan, and select screens.

When a screen is selected, the user can:

* Preview the screen
* View generated HTML
* Export as PNG
* Export as JPG

---

# 3. Hackathon MVP Scope

The MVP should focus only on the core AI UI generation experience.

## Required Features

### Prompt Input

The user can enter a natural-language description of the application or screen they want.

Example:

> Create a dashboard for an AI recruitment platform.

Or:

> Create screens for a food delivery mobile application.

The AI determines whether the request requires one screen or multiple screens.

---

### AI Application Planning

The AI analyzes the prompt and determines:

* Application name
* Application type
* Application description
* Target users
* Device type
* Required screens
* Purpose of each screen
* Relationship between screens

The AI should limit the number of generated screens for the hackathon MVP.

Recommended maximum:

5 screens.

This prevents excessive generation time and API cost.

---

### AI Design System Generation

The AI creates a shared design system before individual screens are generated.

The design system may contain:

* Primary color
* Secondary color
* Accent color
* Background color
* Surface colors
* Text colors
* Heading font
* Body font
* Font sizes
* Border radius
* Spacing rules
* Shadow style
* General visual direction

All generated screens MUST use the same design system.

This is necessary to maintain visual consistency.

---

### Parallel Screen Generation

After the application plan and design system are ready, individual screens should be generated in parallel.

Example:

```
                Design System
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼

     Dashboard      Courses      Profile

         │            │            │
         ▼            ▼            ▼

       HTML          HTML          HTML
```

Each screen generator receives:

* Original user prompt
* Project information
* Shared design system
* Screen name
* Screen description
* Screen-specific requirements
* Relevant application context

Each screen generator returns:

* Screen ID
* Screen name
* Complete HTML
* Width
* Height

---

# 4. Generated UI Format

Generated interfaces should primarily use:

* HTML
* Tailwind CSS
* Optional Google Fonts
* Optional icon libraries supported through CDN

The generated screen should be a self-contained HTML document whenever possible.

Example structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>

    <meta charset="UTF-8" />

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    />

    <script src="https://cdn.tailwindcss.com"></script>

</head>

<body>

    <!-- Generated UI -->

</body>

</html>
```

The generated HTML may include a Tailwind configuration containing design tokens.

Example:

```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: "#6366F1",
                secondary: "#8B5CF6",
                background: "#F8FAFC",
                surface: "#FFFFFF"
            }
        }
    }
}
```

Generated screens should use semantic design tokens where possible.

For example:

```html
<body class="bg-background text-gray-900">
```

instead of repeatedly hardcoding colors throughout the HTML.

---

# 5. Technology Stack

## Frontend

React

Main frontend technologies:

* React
* TypeScript
* React Flow
* Tailwind CSS
* Zustand or React Context for state management
* Server-Sent Events client
* iframe-based HTML rendering

Optional:

* Monaco Editor for viewing generated code
* html-to-image for client-side image export

---

## Backend

FastAPI

Main backend technologies:

* Python
* FastAPI
* LangGraph
* LangChain where useful
* Pydantic
* LLM API
* Server-Sent Events

The backend is responsible for:

* Receiving generation requests
* Running the LangGraph workflow
* Managing AI generation state
* Planning applications
* Generating design systems
* Generating screen definitions
* Generating HTML
* Running parallel screen generation
* Streaming generation events to the frontend

---

# 6. High-Level Architecture

The application follows this architecture:

```
React Frontend
      │
      │
      │ POST generation request
      ▼
FastAPI Backend
      │
      ▼
LangGraph Workflow
      │
      ├── Analyze Prompt
      │
      ├── Plan Application
      │
      ├── Generate Colors
      │
      ├── Generate Typography
      │
      ├── Generate Visual Style
      │
      ├── Build Design System
      │
      ├── Plan Screens
      │
      └── Generate Screens
                │
                │ Parallel
                │
       ┌────────┼────────┐
       ▼        ▼        ▼

    Screen 1 Screen 2 Screen 3

       │        │        │
       └────────┼────────┘
                │
                ▼
             FastAPI
                │
                │ SSE
                ▼
          React Frontend
                │
                ▼
        React Flow Canvas
```

---

# 7. LangGraph Architecture

LangGraph manages the AI generation workflow.

Not every LangGraph node needs to be an autonomous AI agent.

Some nodes may:

* Call an LLM
* Transform state
* Validate structured output
* Combine results
* Dispatch parallel jobs

Recommended graph:

```
START
  │
  ▼
analyze_prompt
  │
  ▼
plan_project
  │
  ├──────────────────────────┐
  │                          │
  ▼                          ▼
generate_colors      generate_typography
  │                          │
  └─────────────┬────────────┘
                │
                ▼
       generate_ui_style
                │
                ▼
      build_design_system
                │
                ▼
         plan_screens
                │
                ▼
       generate_screens
          in parallel
                │
      ┌─────────┼─────────┐
      ▼         ▼         ▼

   Screen 1  Screen 2  Screen 3

      │         │         │
      └─────────┼─────────┘
                │
                ▼
               END
```

The exact graph structure can be adjusted during implementation.

For the hackathon, simplicity and reliability are more important than creating unnecessary autonomous agents.

---

# 8. LangGraph State

The graph should maintain a central state representing the generation process.

Conceptually:

```python
class GenerationState:
    user_prompt: str

    project: ProjectPlan | None

    colors: ColorSystem | None

    typography: TypographySystem | None

    ui_style: UIStyle | None

    design_system: DesignSystem | None

    screens: list[ScreenPlan]

    generated_screens: list[GeneratedScreen]

    errors: list[str]
```

The exact implementation may use TypedDict or Pydantic models depending on LangGraph requirements.

---

# 9. Project Planning Output

The project planning stage should return structured output.

Example:

```json
{
    "name": "LearnFlow",
    "type": "Education Platform",
    "description": "Online learning platform for students",
    "targetUsers": [
        "Students"
    ],
    "deviceType": "desktop"
}
```

Structured output should be validated using Pydantic.

Avoid depending on unstructured LLM text for application logic.

---

# 10. Screen Planning

The screen planner determines which screens are required.

Example:

```json
{
    "screens": [
        {
            "id": "dashboard",
            "name": "Dashboard",
            "description": "Main student dashboard",
            "purpose": "Show learning progress and active courses"
        },
        {
            "id": "courses",
            "name": "Course Discovery",
            "description": "Browse available courses",
            "purpose": "Allow students to discover new courses"
        }
    ]
}
```

Maximum recommended screens:

5.

If the user explicitly requests one page, generate one page.

If the request clearly represents a multi-screen application, the AI may generate multiple screens.

---

# 11. Design System

A shared design system must be generated before screen generation.

Conceptual structure:

```json
{
    "colors": {
        "primary": "#6366F1",
        "secondary": "#8B5CF6",
        "accent": "#F59E0B",
        "background": "#F8FAFC",
        "surface": "#FFFFFF",
        "textPrimary": "#0F172A",
        "textSecondary": "#64748B"
    },

    "typography": {
        "headingFont": "Hanken Grotesk",
        "bodyFont": "Inter",
        "headingLarge": "48px",
        "headingMedium": "32px",
        "body": "16px",
        "small": "14px"
    },

    "style": {
        "borderRadius": "12px",
        "shadowStyle": "soft",
        "visualDirection": "Modern educational SaaS"
    }
}
```

The same design system must be passed to every screen generation node.

---

# 12. Screen Generation

Each screen generation task receives a context containing:

```text
Original User Prompt

+

Project Plan

+

Design System

+

Screen Information
```

Example:

```text
Project:
LearnFlow

Application:
Online learning platform

Design System:
Primary: #6366F1
Secondary: #8B5CF6
Heading Font: Hanken Grotesk
Body Font: Inter

Screen:
Student Dashboard

Purpose:
Display active courses, learning progress,
recommendations and upcoming lessons.
```

The LLM then generates a complete HTML document.

The result should be structured as:

```json
{
    "id": "dashboard",
    "name": "Student Dashboard",
    "html": "<!DOCTYPE html>...",
    "width": 1440,
    "height": 900
}
```

---

# 13. Parallel Screen Generation

Screens should be generated concurrently whenever possible.

Do NOT generate screens sequentially like:

```
Dashboard
    ↓
Courses
    ↓
Profile
    ↓
Settings
```

Instead:

```
                Screen Planner
                      │
      ┌───────────────┼───────────────┐
      │               │               │
      ▼               ▼               ▼

   Dashboard        Courses         Profile

      │               │               │
      ▼               ▼               ▼

     HTML            HTML            HTML
```

This significantly reduces total generation time.

Each completed screen should be streamed to the frontend as soon as it becomes available.

The frontend should not wait for every screen to finish before displaying results.

---

# 14. Backend to Frontend Streaming

Use Server-Sent Events for generation updates.

WebSockets are unnecessary for the MVP because generation communication is primarily server-to-client.

Possible events:

```text
generation_started

project_planned

design_system_started

design_system_completed

screens_planned

screen_generation_started

screen_completed

generation_completed

generation_failed
```

Example `screen_completed` event:

```json
{
    "type": "screen_completed",

    "data": {
        "id": "dashboard",
        "name": "Dashboard",
        "html": "<!DOCTYPE html>...",
        "width": 1440,
        "height": 900
    }
}
```

When React receives this event:

```
SSE Event
    │
    ▼
Update Application State
    │
    ▼
Create React Flow Node
    │
    ▼
Render Screen Preview
```

This allows screens to visually appear one by one while generation is happening.

---

# 15. React Frontend Architecture

The frontend has three major areas.

## Prompt Interface

Responsible for:

* Accepting user prompts
* Starting generation
* Displaying generation status

Example:

```
┌────────────────────────────────────────────┐
│ What would you like to design?             │
│                                            │
│ Create a modern teaching platform...       │
│                                            │
│                           [ Generate ]      │
└────────────────────────────────────────────┘
```

---

## React Flow Canvas

After generation starts, the primary interface becomes an infinite canvas.

React Flow handles:

* Zooming
* Panning
* Node positioning
* Screen selection
* Screen relationships

Each generated screen becomes a custom React Flow node.

Example:

```
┌───────────────────────────────────────────────┐
│                                               │
│   ┌───────────┐        ┌───────────┐          │
│   │           │        │           │          │
│   │ Dashboard │───────►│  Courses  │          │
│   │           │        │           │          │
│   └───────────┘        └───────────┘          │
│                              │                │
│                              ▼                │
│                       ┌──────────────┐        │
│                       │Course Detail │        │
│                       └──────────────┘        │
│                                               │
└───────────────────────────────────────────────┘
```

---

# 16. Screen Node

Create a custom React Flow node called:

`ScreenNode`

The node should contain:

* Screen name
* Screen preview
* Optional dimensions
* Selection state

Conceptual UI:

```
┌───────────────────────────────┐
│ Dashboard                 ••• │
├───────────────────────────────┤
│                               │
│                               │
│      Rendered UI Preview      │
│                               │
│                               │
├───────────────────────────────┤
│ 1440 × 900                    │
└───────────────────────────────┘
```

The generated HTML should be rendered using an iframe.

Example:

```jsx
<iframe
    srcDoc={screen.html}
    sandbox="allow-scripts"
    title={screen.name}
/>
```

The iframe represents the actual generated webpage.

The iframe should be scaled down using CSS so that a full desktop interface can fit inside a React Flow node.

Example:

Actual UI:

1440 × 900

Canvas Preview:

480 × 300

The iframe may use:

```css
transform: scale(0.333);
transform-origin: top left;
```

The exact scale should be calculated based on the node preview size.

---

# 17. Screen Selection

When the user clicks a screen node, the application should mark it as selected.

A side panel or modal can display:

* Screen name
* Full preview
* Generated code
* Export PNG
* Export JPG

Example:

```
Dashboard

[ Preview ] [ Code ]

1440 × 900

[ Export PNG ]

[ Export JPG ]
```

---

# 18. Code Viewer

The user should be able to inspect the generated HTML.

For the MVP, the code viewer only needs to display the generated HTML.

Optional:

Use Monaco Editor.

The code does not need to be editable for the hackathon MVP.

---

# 19. Image Export

Users can export individual screens.

Supported formats:

* PNG
* JPG

Two possible implementations exist.

## Client-Side

Use an HTML-to-image library.

This is simpler but may have issues with iframe content.

## Backend Screenshot

A more reliable future implementation can use:

* Playwright
* Headless Chromium

Flow:

```
Generated HTML
      │
      ▼
  Playwright
      │
      ▼
Headless Chromium
      │
      ▼
   Screenshot
      │
   ┌──┴──┐
   ▼     ▼
  PNG   JPG
```

For the hackathon, use whichever solution is fastest and most reliable to deploy.

---

# 20. Frontend State

Frontend state should conceptually contain:

```typescript
interface ProjectState {

    prompt: string;

    status:
        | "idle"
        | "planning"
        | "designing"
        | "generating"
        | "completed"
        | "failed";

    project: ProjectPlan | null;

    designSystem: DesignSystem | null;

    screens: GeneratedScreen[];

    selectedScreenId: string | null;

    nodes: Node[];

    edges: Edge[];
}
```

Zustand is recommended for managing this state.

---

# 21. Generation Status UX

The frontend should clearly show what the AI is doing.

Possible messages:

```text
Understanding your idea...

Planning your application...

Creating your design system...

Planning your screens...

Generating Dashboard...

Generating Courses...

Generating Profile...
```

As screens complete, they should appear immediately on the canvas.

This progressive generation experience is an important part of the product demo.

---

# 22. Error Handling

The system should gracefully handle:

* LLM API failure
* Invalid structured output
* Individual screen generation failure
* SSE connection failure
* HTML rendering failure

If one screen fails, the entire generation should ideally not fail.

Example:

```
Dashboard     ✓

Courses       ✓

Profile       Generation failed
```

The user should still be able to interact with successfully generated screens.

---



# 24. Important AI Generation Principles

## Consistency

All screens belonging to the same project must share the same:

* Colors
* Typography
* Spacing philosophy
* Border radius
* Component styling
* Navigation patterns
* Visual direction

---

## High-Quality UI

Generated interfaces should:

* Have strong visual hierarchy
* Use consistent spacing
* Use modern typography
* Have accessible color contrast
* Use realistic content
* Avoid excessive gradients
* Avoid excessive rounded cards
* Avoid generic AI-generated visual patterns
* Use appropriate icons
* Maintain consistency across screens

The goal is to generate interfaces that look intentionally designed rather than random HTML generated by an LLM.

---

## Realistic Content

Avoid excessive placeholder content such as:

```text
Lorem ipsum
```

Instead, generate realistic content appropriate to the application.

For an education application:

```text
Continue Learning

Advanced React Patterns
68% Complete

Next Lesson:
State Management Architecture
```

This makes generated interfaces visually more convincing.

---

# 25. Non-Goals for Hackathon MVP

Do NOT prioritize the following unless all required features are already complete:

* Authentication
* User accounts
* Database persistence
* Project history
* Version history
* Collaborative editing
* Figma export
* React code generation
* Next.js code generation
* Component-level visual editing
* Drag-and-drop UI editing
* AI element selection
* Production-ready deployment architecture
* Billing
* Teams
* Real-time collaboration

These features are outside the hackathon MVP scope.

---

# 26. Optional Stretch Feature

If the core application is completed early, implement:

## Regenerate Selected Screen

The user selects a screen.

Example:

> Dashboard

The user provides a modification prompt:

> Make this dashboard dark mode and move navigation to a left sidebar.

Only the selected screen is regenerated.

The rest of the project remains unchanged.

Flow:

```
Select Screen
     │
     ▼
Enter Modification
     │
     ▼
Existing Screen HTML
     +
Design System
     +
Modification Prompt
     │
     ▼
LLM
     │
     ▼
Updated HTML
     │
     ▼
Replace React Flow Node
```

This should only be implemented after the primary generation workflow works reliably.

---

# 27. Development Priorities

The implementation should follow this priority order.

## Priority 1

Prompt → LangGraph → Screen HTML

The AI generation pipeline must work first.

## Priority 2

Render generated HTML correctly.

## Priority 3

Display screens as React Flow nodes.

## Priority 4

Generate multiple screens concurrently.

## Priority 5

Stream completed screens progressively to React.

## Priority 6

Screen selection and full preview.

## Priority 7

Code viewer.

## Priority 8

PNG/JPG export.

## Priority 9

UI polish and animations.

Do not spend significant time polishing the frontend until the complete generation pipeline works.

---

# 28. Core Product Principle

The core experience of the application is:

```
IDEA
  │
  ▼
PROMPT
  │
  ▼
AI UNDERSTANDS PRODUCT
  │
  ▼
AI CREATES DESIGN SYSTEM
  │
  ▼
AI PLANS SCREENS
  │
  ▼
AI GENERATES SCREENS IN PARALLEL
  │
  ▼
SCREENS APPEAR PROGRESSIVELY
  │
  ▼
REACT FLOW CANVAS
  │
  ▼
SELECT SCREEN
  │
  ├───────────┬───────────┐
  ▼           ▼           ▼

PREVIEW      CODE       EXPORT
                       PNG / JPG
```

The most important hackathon demo moment is when a user enters a simple application idea and watches multiple visually consistent, high-quality interfaces automatically appear one by one on the infinite canvas.

Codex should prioritize achieving this end-to-end experience over implementing additional features.

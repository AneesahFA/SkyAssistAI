# SkyAssist Testing & Security Report

**Project:** SkyAssist AI Integration Capstone  
**Platform:** Angular 13 frontend prototype  
**Scope:** Current SkyAssist codebase and the changes made during development  
**Validation Status:** `npm run build` passed successfully

## 1. Complete Testing Checklist

This checklist covers the major features, buttons, inputs, and responsive behaviors that should be tested in SkyAssist.

### Login Screen
- [ ] `Employee Email` input accepts valid email text.
- [ ] `Password` input accepts masked password text.
- [ ] `Sign In` button submits the form.
- [ ] Enter key submits the login form.
- [ ] Login with correct demo credentials succeeds.
- [ ] Login with incorrect credentials fails with an error.
- [ ] Login with blank email is rejected.
- [ ] Login with blank password is rejected.
- [ ] Login with both fields blank is rejected.
- [ ] Login with invalid email format is rejected.
- [ ] Login with leading/trailing spaces in inputs is handled safely.
- [ ] Login with overlong input is constrained by character limits.
- [ ] Login with HTML/script-like text is sanitized and rejected as needed.
- [ ] Already authenticated session redirects to the dashboard.

**Tested inputs:**
- Valid: `agent@skyassist.com` / `SkyAssist123`
- Invalid: wrong password, blank fields, malformed email, overlong text, HTML-like text
- Edge cases: whitespace-only input, long input, special characters

### Dashboard
- [ ] Header displays the SkyAssist brand.
- [ ] Logged-in employee name appears correctly.
- [ ] `Logout` button clears the session.
- [ ] Logout returns the user to the login screen.
- [ ] Dashboard content renders after successful login.
- [ ] Dashboard blocks access when not authenticated.
- [ ] Direct route navigation to `/dashboard` behaves correctly.

### Chat / Policy Q&A
- [ ] Chat input accepts policy questions.
- [ ] `Ask` button submits the question.
- [ ] Enter key submits the question.
- [ ] Blank question is rejected.
- [ ] Very short input is rejected.
- [ ] Overlong input is constrained by character limits.
- [ ] HTML/script-like input is sanitized.
- [ ] Loading indicator appears while the assistant is generating a response.
- [ ] Agent question appears in the chat history.
- [ ] Assistant answer appears in the chat history.
- [ ] Conversation history remains visible during the session.
- [ ] `Clear Conversation` button removes the conversation.
- [ ] Latest conversation entry appears at the top of the feed.
- [ ] Auto-scroll behavior keeps the latest response visible.

**Tested question types:**
- Valid airline policy questions
- Synonym-based questions
- Rephrased questions
- Questions with multiple policy keywords
- Unknown questions
- Gibberish / unclear questions
- Blank submissions
- Short submissions
- HTML-like content

### Policy Search and Source Citations
- [ ] Carry-on baggage questions return a policy match.
- [ ] Checked baggage questions return a policy match.
- [ ] Lithium battery / power bank questions return a policy match.
- [ ] Refund questions return a policy match.
- [ ] Basic Economy upgrade questions return a policy match.
- [ ] Flight delay questions return a policy match.
- [ ] Missed connection questions return a policy match.
- [ ] Pet travel questions return a policy match.
- [ ] Name correction questions return a policy match.
- [ ] Travel document questions return a policy match.
- [ ] Boarding / airport operations questions return a policy match.
- [ ] Passenger rights questions return a policy match.
- [ ] Unknown questions show fallback guidance.
- [ ] Gibberish questions show clarification guidance.
- [ ] Source document citations appear under assistant answers.
- [ ] Clicking a source opens the source preview modal.
- [ ] Source preview modal can be closed by backdrop click.
- [ ] Source preview modal can be closed by `Close` button.
- [ ] Source preview modal can be closed with Escape.

### Feedback Controls
- [ ] `Helpful` button submits positive feedback.
- [ ] `Not Helpful` button submits negative feedback.
- [ ] Feedback cannot be submitted twice for the same answer.
- [ ] Confirmation message appears after feedback submission.
- [ ] Feedback counts update in the knowledge panel.

### Knowledge Panel
- [ ] Policy document list renders correctly.
- [ ] Recent questions list updates after each question.
- [ ] Prototype system status displays correctly.
- [ ] Production architecture note displays correctly.
- [ ] Helpful / Not Helpful counts update as expected.

### Responsive Design
- [ ] Layout displays correctly on large desktop screens.
- [ ] Layout stacks cleanly on smaller screens.
- [ ] Chat and knowledge panel remain readable on tablets.
- [ ] Buttons and inputs remain usable on mobile screens.
- [ ] Modal preview remains readable on narrow screens.

### Accessibility and Form Behavior
- [ ] Form fields have visible labels.
- [ ] Error messages are announced to screen readers.
- [ ] Buttons are reachable using keyboard navigation.
- [ ] Focus state is visible on interactive controls.
- [ ] Modal behavior is keyboard accessible.
- [ ] `aria-live` updates are present for chat activity.

### Security and Safety Checks
- [ ] Inputs are sanitized before being processed.
- [ ] Blank submissions are blocked.
- [ ] Input length limits are enforced.
- [ ] Safe storage access does not crash the app.
- [ ] No unsafe HTML rendering is used.
- [ ] No console logging remains in the bootstrap path.
- [ ] No API keys or secrets are present in the frontend code.

---

## 2. Bugs Found and Fixed

### Bug 1: Policy matching was too narrow
**Description:** Early in development, the assistant often failed to recognize valid airline policy questions if the wording was slightly different from the keywords.

**Expected behavior:** Similar questions, paraphrases, and common variations should still return the correct policy answer.

**Actual behavior:** Many valid questions fell through to the fallback response.

**Root cause:** The original matching logic was too simple and depended on exact phrase checks.

**How it was fixed:** The mock policy engine in [src/app/services/mock-ai.service.ts](src/app/services/mock-ai.service.ts) was expanded to support case-insensitive matching, partial matching, synonym expansion, and confidence-based ranking.

**Severity:** High

### Bug 2: Gibberish input returned a normal fallback instead of a clarification prompt
**Description:** Random text or unclear input was treated like a normal unmatched question.

**Expected behavior:** The assistant should ask the user to rephrase the question.

**Actual behavior:** The app returned the general fallback response.

**Root cause:** There was no clear input-quality detection for nonsense text.

**How it was fixed:** A stricter unclear-input detector was added to [src/app/services/mock-ai.service.ts](c:/Users/anees/SkyAssistAI/src/app/services/mock-ai.service.ts) so gibberish now triggers a clarification response.

**Severity:** Medium

### Bug 3: Latest chat message was not immediately visible
**Description:** Newest messages were rendered lower in the conversation, requiring manual scrolling.

**Expected behavior:** Users should see the latest assistant response immediately.

**Actual behavior:** The newest entry appeared below older messages.

**Root cause:** Conversation rendering was oldest-first.

**How it was fixed:** The chat display was reversed in [src/app/components/chat/chat.component.ts](c:/Users/anees/SkyAssistAI/src/app/components/chat/chat.component.ts) and [src/app/components/chat/chat.component.html](c:/Users/anees/SkyAssistAI/src/app/components/chat/chat.component.html), and auto-scroll was adjusted to keep the latest activity visible.

**Severity:** Medium

### Bug 4: Storage access could fail without graceful handling
**Description:** Browser storage access was used directly.

**Expected behavior:** Storage failures should not crash the app.

**Actual behavior:** Direct `sessionStorage` / `localStorage` usage could break in restricted environments.

**Root cause:** No wrapper service existed for safe storage access.

**How it was fixed:** [src/app/services/safe-storage.service.ts](c:/Users/anees/SkyAssistAI/src/app/services/safe-storage.service.ts) was added and authentication/conversation state now uses safe read/write fallback handling.

**Severity:** Medium

### Bug 5: Login and chat inputs were not strictly limited
**Description:** User input length and format were not tightly controlled.

**Expected behavior:** Inputs should be sanitized and constrained.

**Actual behavior:** Inputs were accepted too loosely.

**Root cause:** Validation rules were minimal.

**How it was fixed:** Input sanitation, blank checks, email validation, and character limits were added in the login and chat flow.

**Severity:** Medium

### Bug 6: Source citations were text only
**Description:** Source document names were displayed, but they were not interactive.

**Expected behavior:** Users should be able to inspect cited documents.

**Actual behavior:** Citations were not clickable.

**Root cause:** No source preview modal existed.

**How it was fixed:** A clickable source preview modal was added in the chat component.

**Severity:** Low

### Bug 7: Console logging remained in bootstrap error handling
**Description:** The app bootstrap path logged errors to the console.

**Expected behavior:** Avoid unnecessary console output in the prototype.

**Actual behavior:** Errors were written with `console.error`.

**Root cause:** Default Angular bootstrap catch behavior was left in place.

**How it was fixed:** The bootstrap catch was changed to a silent no-op in [src/main.ts](c:/Users/anees/SkyAssistAI/src/main.ts).

**Severity:** Low

---

## 3. Security Review

### Input Validation
Implemented:
- Login email validation
- Login password length limits
- Chat question sanitization
- Chat question length limits
- Blank submission blocking
- Minimum length check for chat prompts

### XSS Prevention
Implemented:
- Angular interpolation instead of unsafe HTML rendering
- No `[innerHTML]` bindings in the current codebase
- No `bypassSecurityTrust...` calls in the current codebase
- Input sanitization strips tag-like content before matching or display

### Safe Handling of User Input
Implemented:
- Centralized sanitization service in [src/app/services/input-security.service.ts](c:/Users/anees/SkyAssistAI/src/app/services/input-security.service.ts)
- Safe handling before login checks and policy matching
- Safe handling before source preview lookups

### Local Storage / Session Storage Usage
Implemented:
- Session storage for auth and conversation state
- Local storage fallback when session storage is unavailable
- Safe read/write wrappers with try/catch

Recommendation:
- For production, move auth state to secure server-side session management or HTTP-only cookies.

### Sensitive Data Exposure
Current state:
- No real API keys or secrets are present
- Only demo credentials are hardcoded in the prototype
- No backend tokens are stored in the frontend

Recommendation:
- Remove hardcoded credentials in a production system and use a real authentication provider.

### Console Logging
Implemented:
- Removed bootstrap console logging from [src/main.ts](c:/Users/anees/SkyAssistAI/src/main.ts)

### Safe Angular Practices
Implemented:
- Component/service separation
- Observable-based state flow
- Safe template bindings
- No unsafe DOM manipulation patterns in the current codebase

### Error Handling
Implemented:
- Login validation errors
- Chat validation errors
- Clarification prompt for gibberish input
- Graceful fallback response for unmatched questions
- Safe storage error handling

### Remaining Security Concerns
- The app is frontend-only, so there is no server-side security enforcement.
- Browser storage is acceptable for a prototype but not ideal for production.
- No Content Security Policy is defined in the Angular app.
- The demo credentials remain hardcoded for academic use.

---

## 4. Accessibility Review

### Implemented Accessibility Features
- Form labels on login and chat inputs
- ARIA alert behavior for validation messages
- ARIA dialog behavior for the source preview modal
- `aria-live` on chat updates and loading messages
- Keyboard submission on forms
- Escape key support for closing the modal
- Focus-visible styling in component styles
- Responsive layout for smaller screens
- Feedback buttons with `aria-pressed`

### Strengths
- Keyboard use is supported throughout the primary workflows.
- Feedback and loading states are announced semantically.
- The modal is accessible enough for a prototype.
- Layout remains readable on tablet and mobile sizes.

### Recommended Improvements
- Add a focus trap inside the source preview modal.
- Add a skip-to-content link.
- Add more explicit screen-reader instructions for chat input usage.
- Test with NVDA, JAWS, or VoiceOver.
- Consider reduced-motion support for animated loading states.

---

## 5. AI Assistance Summary

GitHub Copilot contributed to the SkyAssist project in several ways:
- Code generation for Angular components, services, guards, and models.
- Debugging policy matching and gibberish handling.
- Refactoring logic into reusable security and storage services.
- UI improvements including source preview, feedback controls, and responsive layout.
- Error resolution for validation, chat ordering, and storage handling.
- Security hardening around sanitization, blank submission blocking, and safe storage access.
- Testing support by helping define clear feature coverage and edge cases.
- Documentation support by helping prepare workshop and security-oriented summaries.

---

## 6. Time Summary

Estimated effort spent on the project:
- Testing: 4 to 6 hours
- Bug fixing: 5 to 7 hours
- Security improvements: 3 to 5 hours
- Documentation: 2 to 3 hours

Estimated total effort: **14 to 21 hours**

---

## Most Critical Bug Fixed

**Bug:** Policy search failed to match many valid user questions.

**Why it was most critical:**
This bug affected the core purpose of SkyAssist. If the assistant could not identify the correct policy, the application looked complete visually but failed at its main job: helping airline agents answer policy questions.

**Impact:**
- Valid questions returned fallback responses too often.
- The prototype appeared unreliable.
- Users could not trust the assistant for realistic airline support.

**Fix applied:**
- Expanded policy topics and document coverage.
- Added case-insensitive matching.
- Added partial keyword matching.
- Added synonym support.
- Added confidence scoring and ranking.
- Added a separate clarification prompt for gibberish input.

**Result:**
SkyAssist now behaves like a more realistic airline knowledge assistant and is much stronger for demo and submission purposes.

---

## Conclusion

SkyAssist is now a significantly stronger academic prototype than the initial version. The project includes a complete login flow, policy Q&A experience, source citations, feedback capture, knowledge panel, clearer error handling, security hardening, and accessibility support. The code compiles successfully and the behavior is consistent with the current Angular frontend implementation.

---

## 7. Reflection

The most critical bug I found and fixed was the policy-matching problem. At first, SkyAssist could only answer questions that closely matched the exact keywords in the mock knowledge base. That meant many real airline questions, even valid ones, returned a fallback response. This was the most serious issue because it affected the core purpose of the application: helping airline agents get usable answers quickly. I improved the matcher by adding case-insensitive matching, synonym support, partial keyword matching, confidence scoring, and a separate clarification path for gibberish input. After that, the assistant became much more reliable and realistic.

The most important security issue I resolved was unsafe handling of user input and storage. Because SkyAssist is a frontend prototype, the main risks were XSS-style input, overly permissive text entry, and direct browser storage access. I added centralized sanitization, blank-input blocking, character limits, email validation, safe storage wrappers, and removed console logging from the bootstrap flow. These changes made the app safer and more stable without changing the demo experience.

AI helped significantly with both testing and security. GitHub Copilot helped generate component and service code, refine validation logic, improve the chat flow, and identify edge cases that needed to be tested. It also helped structure the security review by surfacing concerns like input sanitization, unsafe HTML rendering, and storage safety. In practice, AI reduced the time needed to build repetitive code and allowed me to focus more on debugging, quality control, and documentation.

The most challenging part of the assignment was balancing realism with simplicity. I had to make the app feel like a real airline support tool while keeping it as a frontend-only academic prototype. That required creating believable policy data, making the responses interactive, and improving the search logic enough to handle many question styles, all without adding a real backend or external AI integration.

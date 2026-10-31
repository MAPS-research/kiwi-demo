# Kiwi interactive demo

A lightweight, browser-only illustration of [Kiwi](https://github.com/MAPS-research/kiwi). One original Texas Hold’em probability lesson connects the student experience with teacher controls. No backend, account, API key, or live AI service is required.

## Run locally

Use Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To inspect the production output:

```sh
npm run build
npm run preview
```

## Host on your website

1. Run `npm ci` and `npm run build`.
2. Copy **the contents of `dist/`** to the directory your website serves as `/demo/` (or any other static directory).
3. Link “Try the demo” to `/demo/`.

The Vite base is relative (`./`). The root page, scripts, font, and branding assets work both at the site root and beneath a path. Use the trailing slash on the demo directory. Hash routing does not need SPA fallback rewrites:

| URL fragment | Experience |
| --- | --- |
| `#/` | Student / Teacher chooser |
| `#/student/materials` | Lesson and optional practice sheet |
| `#/student/draw-lab` | Interactive card exercise |
| `#/teacher/materials` | Add the prepared practice sheet |
| `#/teacher/edit-class` | Save a sample teaching approach |
| `#/teacher/apps` | Enable or disable Draw Lab |
| `#/teacher/analytics` | Explore a fixed synthetic activity snapshot |

Serve the emitted files over HTTP(S); opening `index.html` directly with `file://` is not supported. Hashed assets can use long-lived immutable caching; let `index.html` revalidate. The production page makes only same-origin asset requests. Further-reading and GitHub links navigate externally only when a visitor follows them.

## Deploy to GitHub Pages

The included `.github/workflows/pages.yml` installs dependencies, runs type checking and tests, builds the demo, and publishes only `dist/`. It runs on pushes to `main` and can also be started manually. It uses GitHub's built-in workflow token; no application secrets or API keys are needed.

1. Create an empty GitHub repository without an initial README, license, or `.gitignore`.
2. Add that repository as `origin` and push the local `main` branch:

   ```sh
   git remote add origin https://github.com/YOUR-OWNER/YOUR-REPO.git
   git push -u origin main
   ```

3. In the repository, choose **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Open **Actions → Deploy demo to GitHub Pages → Run workflow**, choosing `main`. If the initial push ran before Pages was enabled, rerun it after changing the setting.
5. Open the site URL shown by the deployment. Later pushes to `main` update it automatically.

The relative Vite base and hash routes work at `https://YOUR-OWNER.github.io/YOUR-REPO/` without changing the app configuration. Build output, local archives, and dependencies are ignored by Git. See [GitHub's custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## What works

- Read three lesson pages, choose and send prepared contextual questions, stop a reply while keeping the partial answer, and follow citations.
- Switch between Light, Dark, and Match device; control Kiwi animation with reduced-motion support.
- Resize side chat with the mouse or keyboard, copy answers, and keep helpful/not-helpful feedback locally.
- Select helpful cards, check the count, and draw a random turn and river without replacement.
- Add a practice sheet, save a guidance preset, and enable an app in Teacher; see the changes in Student.
- Follow either role’s four-step tour, pause, resume, restart, or switch perspectives.
- Filter sample analytics and inspect individual fictional questions.

Class settings, draws, chat history, answer feedback, and tour progress are stored in session storage, scoped to the current browser tab. Refresh preserves them; an interrupted reply is restored as a stopped partial answer. Display settings are stored separately in local storage, so the theme and animation choice survive a new visit. If storage is unavailable, the demo works in memory. “Reset demo” clears the class experience and returns to the chooser, keeping display preferences. No user data is transmitted or tracked.

AI replies are scripted examples. Presets deliberately support two prepared instruction styles. Practice-sheet chat provides hints under either style. Analytics are a fixed fictional snapshot, including practice questions; they do not reflect visitor activity or the current material list. Draw Lab is a demo-created example of a custom Kiwi App, not a bundled framework feature.

## Relationship to Kiwi’s UI

The product shell adapts Nagi’s **Ruled Folio** UI from the Kiwi [`Nagi-ui` branch at `1b3f288`](https://github.com/MAPS-research/kiwi/tree/1b3f2881053f00385fb8035a282be2ee368a890a). It uses the branch’s warm neutral/green light and dark palettes, self-hosted Source Sans 3 with Chinese fallbacks, thin rules, flat surfaces, and shared focus states. Montserrat is reserved for the wordmark.

The demo retains its lightweight React/CSS implementation and existing routes rather than importing MUI, PDF, authentication, or service dependencies. The lesson remains white paper in dark mode. Unlike the framework’s deployment-gated settings, both dark mode and Kiwi animation are available immediately here; device reduced motion always takes precedence. The framework repository is unchanged.

Source references below are relative to `kiwi-ui/src/` in the supplied framework repository:

| Demo interface | Kiwi source reference |
| --- | --- |
| 52 px product header and 44 px student tabs | `components/TopNav/TopNav.tsx`, `pages/ClassLayout.tsx` |
| Folder rail, Lecture/Recitation drawer, and document toolbar | `components/Chat/PDFComponent.tsx`, `components/PDFViewer/PDFViewerForStudent.tsx` |
| Round Kiwi launcher; non-blocking floating, resizable side, and fullscreen chat | `components/GlobalChat/GlobalChatButton.tsx`, `components/GlobalChat/GlobalChatModal.tsx` |
| Theme, display preferences, type, and focus treatments | `Theme.ts`, `theme/generated/kiwi-ui.tokens.css`, `components/TopNav/DisplayMenu.tsx` |
| Kiwi status line, question bubbles, answer actions, and Send/Stop | `components/Chat/statusLine/`, `components/Chat/ChatMessages.tsx`, `components/Chat/ChatField.tsx` |
| 220 px collapsible teacher navigation and page spacing | `components/NavigationSidebar/NavigationSidebar.tsx`, `components/AdminPage/AdminPage.tsx`, `components/AdminPage/AdminPageHeader.tsx` |
| Material lists, class instruction form, and app table | `pages/admin/Materials.tsx`, `pages/admin/ClassEdit.tsx`, `pages/admin/ClassKiwiAppsSettings.tsx` |
| Analytics cards, topics, and question details | `components/ClassAnalytics/` |

The Student/Teacher chooser, separate demo toolbar, optional tours, prepared lesson, Draw Lab, and sample prompts are demo additions. Lesson pages use responsive HTML inside the document viewer. Uploads and arbitrary instruction editing are replaced by prepared examples. Chat’s read-only composer holds a selected prepared question. Send (or Enter) progressively reveals its scripted reply; Stop (or Escape while answering) keeps the text already shown. The status words explicitly describe a sample answer, not a live search or AI request. Feedback and copying work locally; there is no backend flagging, sharing, or regeneration endpoint. The panel has no backdrop or focus trap, so materials and menus remain usable, and closing it returns focus to the launcher. Unsupported product features are omitted; this is a working subset, not a complete replica.

## Verify and maintain

```sh
npm run typecheck
npm test
npm run build
```

- `src/content.ts`: course metadata, sources, instruction presets, assistant prompts, and tours.
- `src/lesson-content.ts`: original lesson blocks, worked examples, and practice-sheet prompts.
- `src/cards.ts`: deck, draw logic, and conditional flush probabilities.
- `src/replies.ts`: scripted worked examples and guidance.
- `src/analytics.ts`: original fictional learner questions and answers.
- `src/state.tsx`: shared state, session persistence, and reset behavior.
- `src/components/`: role chooser, student views, assistant, and lazy-loaded teacher views; `DemoChrome.tsx` keeps demo controls separate from the product header.
- `src/styles.css`: base styles, original lesson illustrations, role chooser, Draw Lab, and tours.
- `src/kiwi-interface.css`: source-aligned product layouts and responsive controls.
- `src/theme/tokens.css`: the resolved subset of Nagi’s light/dark tokens used by the demo.
- `src/theme/ruled-folio.css`: shared components, reading rules, paper exceptions, chart treatment, and chat layouts.
- `src/theme/DisplayPreferences.tsx`: persisted display choices and device preference listeners.
- `src/components/KiwiStatusLine.tsx`: the small companion’s walk/flight sequence, paused when hidden and disabled for reduced motion.
- `src/ui-refresh.test.tsx`: display persistence, blocked storage, device preferences, Stop/reload behavior, keyboard resizing, and feedback coverage.

The reference hand is A♥ 7♥ with K♥ 2♥ 9♣ on the flop. With only these five known cards, next-card flush probability is `9/47`; completion by the river is `1 - (38/47 × 37/46)`. These values measure completing a heart flush, not winning the hand.

## Attribution

Kiwi branding, selected design tokens, and the six companion WebP assets are copied/adapted from the MIT-licensed Kiwi `Nagi-ui` branch (`1b3f288`). Its license is retained in `public/KIWI-LICENSE.txt` and shipped with the static build. The companion assets come from `kiwi-ui/src/components/Chat/statusLine/assets/`; the source records their artwork provenance in `.design-foundations/mocks/assets/mascot/provenance.md`.

Source Sans 3 is self-hosted from the branch’s `.design-foundations/mocks/assets/fonts/`, with its SIL Open Font License shipped as `SOURCE-SANS-LICENSE.txt`. Montserrat is self-hosted from `@fontsource-variable/montserrat`, with its license in `FONT-LICENSE.txt`. All fonts and artwork load from the demo’s own origin.

The lesson, card examples, and fictional activity records are original demo content. Further-reading references:

- [PokerStars Learn: The basics](https://www.pokerstars.com/poker/learn/course/the-basics/)
- [MIT OpenCourseWare: How to Win at Texas Hold’em Poker — study materials](https://ocw.mit.edu/courses/15-s50-how-to-win-at-texas-holdem-poker-january-iap-2016/pages/study-materials/)

No source PDFs, third-party lesson text, or course branding are bundled. These links do not imply affiliation or endorsement.

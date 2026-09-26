# V4 next implementation slice

`feat/v4-1-simulation-archive` is done. See `docs/V4_1_SIMULATION_ARCHIVE.md`.

## Shipped in V4.1

1. V3 preserved as archive-only.
2. V4 is the clean default Electron renderer/shell.
3. Six owner-supplied lecture visuals under `src/assets/lecture/v4/`.
4. Each visual wired to its matching chapter.
5. Legacy course-management complexity hidden from the learner flow.
6. Instructor tools kept small and useful.
7. Lecture content moved out of code into `curriculum.json` + `scenes/*.json`,
   with `one-shot.js` reduced to visual renderers.
8. Seven data-driven lecture simulations with a shared engine, full transport
   controls, keyboard arbitration and `prefers-reduced-motion` support.
9. JuCoding Archive: external material inbox, local LectureOrganizerProvider, and
   a preview → human approval → backup → apply flow that never writes into the
   installed app.

## Next candidates

1. **`.pdf` ingestion.** V1 lists PDFs as `PDF 지원 예정`. Text extraction would
   let a syllabus PDF become change candidates. Keep it behind the same
   provider/proposal contract so approval behaviour does not change.
2. **An AI LectureOrganizerProvider.** `LectureOrganizerProvider` is an adapter
   with no registered AI implementation. OpenAI / OpenRouter / a local model can
   be added without touching the archive flow, the UI, or the approval rules.
   `npm run check` currently fails if a credential, socket, or AI dependency
   appears, so that guard has to be relaxed deliberately.
3. **Proposal quality feedback.** The local provider is rule-based, so its
   `confidence` is a similarity score, not a calibrated probability. Recording
   accept/reject decisions per candidate would let those scores be tuned.
4. **Archive image placement.** Approved images currently attach to the
   best-matching scene. A drag-to-place UI in the preview would be more direct.
5. **Installer QA on a Windows host.** `npm run release:build` needs Windows or
   wine for `electron-builder --win nsis`. Running it on a Windows machine and
   exercising the installed build closes the last verification gap.

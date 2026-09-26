# JuCoding V4 Visual Asset Plan

JuCoding V4 uses the new friendly visual language as the default teaching experience.

## Product direction

- V3 is legacy and should be preserved as an archive reference, not maintained as the default product surface.
- V4 is the current product direction.
- The default app should feel like a beginner-friendly visual teaching tool, not an internal course-management console.
- Core lecture screens should prefer diagrams, large cards, visual metaphors, and short Korean explanations over long prose.

## Supplied visual references

The following six owner-supplied visuals should be stored under `src/assets/lecture/v4/` and used as curated teaching assets rather than decorative images.

1. `safety-boundary.png`
   - Topic: AI coding safety boundary
   - Use: Safety / human approval section
   - Core message: local/research/test work vs actions that affect real people/services

2. `automation-deploy-mcp.png`
   - Topic: automation, deployment, MCP, ChatGPT vs terminal Agent, Git/GitHub
   - Use: Chapter 6 hero/reference visual

3. `chat-ai-vs-computer-agent.png`
   - Topic: Chat AI vs Computer Agent
   - Use: Chapter 2 supporting handout/reference
   - Note: plan/pricing details can age quickly; treat them as supplementary, not the canonical core lesson.

4. `ai-agent-vibecoding.png`
   - Topic: AI, Agent, vibe coding
   - Use: Chapter 1 hero/reference visual

5. `beginner-dev-terms.png`
   - Topic: frontend, backend, API, database, GUI/TUI/CLI
   - Use: Chapter 3 hero/reference visual

6. `project-planning-terms.png`
   - Topic: PRD, WBS, wireframe, prototype, ERD, DBML, SSOT
   - Use: Chapter 4 hero/reference visual

## Content rules

### Keep in the core 3-hour lecture

- Why vibe coding
- AI vs Agent
- Frontend / Backend / API / Database
- GUI / TUI / CLI
- PRD / WBS / Wireframe / Prototype / ERD / SSOT
- Development server / deployment
- Git / GitHub
- Chat AI vs terminal/computer Agent
- MCP / Worker / automation examples
- Safety boundary and human approval

### Mention-only / secondary

- DBML syntax: explain the concept only; do not teach detailed syntax in the beginner session.
- Specific subscription tiers and limits: keep in supplementary material because they change frequently.
- Specific provider/model rankings: not part of the canonical beginner curriculum.

## Important wording

- AI is the broader category.
- An AI Agent is a form of AI that can pursue a goal using tools and actions.
- Vibe coding is developing software through natural-language collaboration with AI; the "space for agents to work" is a useful teaching metaphor, not the formal definition.
- API = a way for software to communicate with software.
- MCP = a protocol/standard that can connect AI applications to tools and context; it is not automation itself.
- Worker = a role/process that performs bounded work; it is not synonymous with MCP.
- Remotion = one concrete video-generation/rendering tool, not a required component of AI automation.

## Safety section

The safety visual should be taught near the end as a practical rule:

- Inside my screen: research, fake/sample data, local execution are lower-risk by default.
- Outside my screen: payments, production database writes, public/SNS publishing, external account changes require stronger controls.
- High-impact actions should include an explicit human approval step.

## Target information architecture

- Home
- Lecture
- Practice examples
- Projects
- AI helper (later)
- Materials
- Instructor tools (secondary/hidden)

The public/default shell should not expose legacy course-management complexity first.

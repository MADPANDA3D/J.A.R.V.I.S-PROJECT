# Task: Capture Idea

## Task Overview
Interactive workflow to capture, analyze, and log new product ideas systematically without disrupting current development workflows.

## Task Instructions

### Step 1: Idea Discovery
**Elicit from user:**
- What is your idea? (brief description)
- What context/situation inspired this idea? (during which story, feature, or activity)
- What specific problem does this solve or opportunity does it address?

### Step 2: Initial Categorization
**Determine category based on user input:**
- UI/UX Enhancement
- Feature Addition  
- Technical Improvement
- Analytics & Data
- Process Improvement
- Other (specify)

### Step 3: Value Assessment
**Guided questions to assess business value:**
- Who would benefit from this idea? (end users, developers, business)
- How does this align with our current MVP goals?
- What makes this valuable or differentiated from competitors?
- Do you see this as a "nice to have" or "game changer"?

### Step 4: Complexity Estimation
**Technical assessment questions:**
- Does this require new technologies or frameworks?
- Would this impact existing functionality?
- Any dependencies on other features or systems?
- Your gut feeling: Simple (1-3 days), Medium (1 week), or Complex (2+ weeks)?

### Step 5: Idea Documentation
**Format the captured information using the ideas template:**
```markdown
### [Idea Name]
**Category:** [Determined category]
**Discovered During:** [Current context/story/phase]
**Description:** [Full description from user]
**User Value:** [Benefit analysis]
**Complexity:** [Simple | Medium | Complex]
**Dependencies:** [Technical or feature dependencies]
**Notes:** [Additional context or inspiration]
**Date Added:** [Current date]
```

### Step 6: Idea Logging
**Action steps:**
1. Read current ideas-backlog.md file
2. Add the formatted idea to appropriate category section
3. Update the ideas backlog file
4. Confirm successful logging to user
5. Remind user that idea will be reviewed at end of current phase

### Step 7: Process Completion
**Final steps:**
- Thank user for the idea contribution
- Remind them to continue with current development work
- Note that this idea is now safely captured for systematic review
- Ask if they have any other ideas to capture (optional loop)

## Elicitation Requirements
- Use conversational tone to make idea capture feel collaborative
- Ask follow-up questions to fully understand the idea's value and scope
- Don't judge ideas - capture everything with enthusiasm
- Keep the process efficient but thorough
- Maintain focus on capturing, not immediately implementing

## Success Criteria
- Idea is completely documented with all required fields
- Idea is properly categorized for future review
- User feels heard and valued for their contribution
- Current development workflow remains uninterrupted
- Idea is logged in ideas-backlog.md file successfully

## Error Handling
- If ideas-backlog.md file doesn't exist, create it using the template structure
- If user idea is unclear, ask clarifying questions rather than making assumptions
- If technical complexity is uncertain, mark as "Medium" and note uncertainty
- If category is ambiguous, use "Other" and include explanation

## Template Output Location
File: `docs/ideas-backlog.md`
Section: Appropriate category under "Current Ideas Inventory"
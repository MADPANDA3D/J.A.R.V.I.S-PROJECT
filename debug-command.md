# *debug Command

**The Complete Test Fixing and System Debugging Protocol**

**Purpose:** Systematically identify, fix, and commit test failures and linting errors using the proven methodical approach. This command implements the complete debugging workflow that ensures 100% test success and code quality compliance.

**Enhanced Debugging Process:**
1. 🔍 **Discovery Phase:** Run comprehensive test suite to identify all failures
2. 🧠 **Analysis Phase:** Categorize errors by type and priority (linting, test failures, compilation errors)
3. 🎯 **Prioritization Phase:** Target high-impact fixes first (bulk replacements, unused variables, parsing errors)
4. ⚡ **Execution Phase:** Apply systematic fixes using proven strategies
5. ✅ **Validation Phase:** Verify fixes resolve issues without introducing new ones
6. 📝 **Documentation Phase:** Commit changes with detailed metrics and progress tracking

**Usage Examples:**
```
*debug
*debug --focus=lint
*debug --focus=tests
*debug --commit-threshold=5
```

**Smart Debugging Features:**
- ✅ **Automated Error Detection:** Identifies linting errors, test failures, and compilation issues
- ✅ **Priority-Based Fixing:** Targets highest-impact errors first (unused variables, parsing errors, explicit any types)
- ✅ **Progress Tracking:** Shows before/after error counts and reduction metrics
- ✅ **Safe Commit Strategy:** Only commits when error count decreases (user-mandated requirement)
- ✅ **Rollback Protection:** Maintains clean git history with atomic commits
- ✅ **Comprehensive Validation:** Runs full test suite and lint checks before committing

**Enhanced Implementation Flow:**
```
1. npm test -- --reporter=basic > test-output.log 2>&1
2. npm run lint > lint-output.log 2>&1
3. Parse and categorize all errors by type and impact
4. Apply priority-based fixing strategy:
   - Phase 1: Bulk any type replacements (highest impact)
   - Phase 2: Unused variable removal (consistent wins)
   - Phase 3: Parsing error fixes (reveals hidden issues)
   - Phase 4: Import/require fixes (easy wins)
5. Validate fixes with npm test && npm run lint
6. Commit ONLY when error count decreases
7. Repeat until 100% success achieved
```

**Proven Success Strategies:**

**🏆 BULK ANY TYPE REPLACEMENT (HIGHEST SUCCESS RATE)**
*Breakthrough strategy: 110→13 problems (88% reduction) proven success*
```typescript
// Target files with concentrated @typescript-eslint/no-explicit-any errors
// PowerShell bulk replacement commands:
(Get-Content src/lib/file.ts) -replace ': any', ': unknown' | Set-Content src/lib/file.ts
(Get-Content src/lib/file.ts) -replace '=> any', '=> unknown' | Set-Content src/lib/file.ts  
(Get-Content src/lib/file.ts) -replace 'as any', 'as unknown' | Set-Content src/lib/file.ts
```

**🥇 UNUSED VARIABLES STRATEGY (CONSISTENT SUCCESS)**
*Each unused variable error = guaranteed -1 problem, no side effects*
```typescript
// High-Impact Patterns:
// 1. Unused catch parameters (super common)
try { /* code */ } catch (error) { /* don't use error */ }
→ try { /* code */ } catch { /* remove parameter */ }

// 2. Unused imports
import { useState, useEffect, UNUSED } from 'react';
→ import { useState, useEffect } from 'react';

// 3. Unused function parameters  
const handler = (event: Event) => { /* event not used */ }
→ const handler = (_event: Event) => { /* prefix with _ */ }
```

**🥈 PARSING ERRORS (COMPLEX BUT ESSENTIAL)**
*Often reveal hidden errors when syntax is fixed*
```typescript
// Common Parsing Patterns:
// 1. Method signature mixing class/arrow syntax  
private method(): Promise<void>  => {  // WRONG
private method(): Promise<void> {     // CORRECT

// 2. Missing arrow in arrow functions
const func = (params) { return value; }  // WRONG  
const func = (params) => { return value; } // CORRECT

// 3. Double braces and bracket issues
const obj = { { key: value } }  // WRONG
const obj = { key: value }      // CORRECT
```

**Error Priority Order:**
1. **Parsing Errors** → Reveals hidden any/unused-var issues (fix first)
2. **Concentrated any Types** → Bulk PowerShell replacement for maximum impact
3. **Unused Variables** → Consistent -1 problem reduction per fix
4. **Import/Require Issues** → Easy wins with minimal risk

**Success Metrics Tracking:**
```
📊 SESSION PROGRESS TRACKING:
• Starting Point: X problems (Y errors + Z warnings)
• Method: Systematic priority-based approach
• Phase 1: Bulk any type replacement → X→Y problems (-N reduction)
• Phase 2: Unused variables cleanup → Y→Z problems (-M reduction)  
• Phase 3: Parsing error resolution → Z→W problems (-L reduction)
• Final Result: 0 problems (0 errors + 0 warnings) = SUCCESS ✅

🎯 FILES SYSTEMATICALLY CLEANED:
• filename1.ts: All parsing errors eliminated
• filename2.ts: All any types replaced with proper interfaces
• filename3.ts: All unused variables removed
• filename4.tsx: All import issues resolved

💪 PRODUCTION IMPACT:
• Code compiles flawlessly without errors
• Zero development friction from linting issues  
• Professional-grade TypeScript/React codebase
• Ready for production deployment
```

**Critical Success Rules:**
- ✅ **NEVER commit unless error count decreases** - User-mandated strict requirement
- ✅ **Use systematic manual approach** - Proven superior to automation
- ✅ **Follow revealed error pattern** - Each fix exposes deeper issues
- ✅ **Complete file cleanup systematically** - Don't leave files partially fixed
- ✅ **Document progress with metrics** - Show dramatic before/after counts

**Command Options:**
- `--focus=lint` - Target only ESLint errors
- `--focus=tests` - Target only test failures
- `--focus=parsing` - Target only parsing/syntax errors
- `--commit-threshold=N` - Set minimum error reduction for commits
- `--dry-run` - Show what would be fixed without making changes
- `--file=path` - Target specific file for debugging

**Expected Results:** 
- **Immediate Impact**: 5-25 error reduction per iteration
- **Systematic Progress**: Methodical elimination of all issues
- **Production Ready**: 100% clean codebase with zero lint/test failures
- **User Satisfaction**: Visible progress with guaranteed error count reduction
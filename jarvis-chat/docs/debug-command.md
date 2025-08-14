# *debug Command Protocol & Reference Guide

**Command:** `*debug`  
**Purpose:** Systematic debugging workflow for JARVIS Chat deployment issues  
**Last Updated:** 2025-01-14

---

## 🎯 PRIMARY REFERENCE DOCUMENTS

When executing `*debug`, **ALWAYS** reference these documents in priority order:

### **1. Deployment Handoff Guide** (PRIMARY)
**Location:** `docs/deployment-handoff-guide.md`  
**Purpose:** Complete troubleshooting history and proven solutions  
**When to use:** All debugging scenarios - start here first

### **2. GitHub Deployment Log** (CURRENT STATUS)  
**Location:** `docs/github_deployment_log.md`  
**Purpose:** Real-time CI status and latest deployment attempts  
**When to use:** Check current hanging issue and latest logs

### **3. CLAUDE.md ESLint Protocol** (SPECIFIC ERRORS)
**Location:** `CLAUDE.md` (ESLint Error Fixing section)  
**Purpose:** Systematic lint/syntax error resolution  
**When to use:** When encountering linting or code quality issues

### **4. Commit History** (CONTEXT)
**Command:** `git log --oneline -20`  
**Purpose:** Recent change context and regression analysis  
**When to use:** Understand what changed before issues started

---

## 🚨 CRITICAL CURRENT STATE (2025-01-14)

### **Status:** 
- ✅ **ALL TESTS PASSING** (507/507)
- ✅ **Code Quality:** Production ready
- 🔧 **CI Issue:** Process hangs for ~1 hour after test completion

### **Current Issue Location:**
- **Log Reference:** Lines 687-689 in `docs/github_deployment_log.md`
- **Behavior:** Tests complete successfully, process never exits
- **Impact:** GitHub Actions timeout cancellation (non-blocking for production)

---

## 📋 DEBUG EXECUTION WORKFLOW

### **Step 1: Situation Assessment**
```bash
# Check current deployment status
cat docs/github_deployment_log.md | tail -20

# Verify working configuration is intact
grep -A 5 -B 5 "test:ci" package.json

# Check for recent changes that might have caused regressions
git log --oneline -10
```

### **Step 2: Issue Classification**
Based on symptoms, classify the issue:

#### **A. Test Failures** → Reference: `docs/deployment-handoff-guide.md` Phase Analysis
- **SessionTracker issues** → Phase 2 solutions (dependency injection)
- **React DOM pollution** → Phase 3 solutions (cleanup hooks)  
- **Memory crashes** → Phase 4 solutions (50GB allocation)
- **Config conflicts** → Phase 5 solutions (merge resolution)

#### **B. Process Hanging** → Reference: Critical Issue Investigation
- **Current primary issue** → See "Current Hanging Issue Analysis"
- **All tests pass but process won't exit**
- **Focus on async resource cleanup**

#### **C. New/Unknown Issues** → Reference: Emergency Checklist
- **Follow systematic investigation protocol**
- **Document findings for future reference**

### **Step 3: Apply Proven Solutions**
Based on classification, apply historical solutions:

```bash
# For test failures - run specific test suite
npm run test [specific-test-file]

# For memory issues - verify configuration
echo $NODE_OPTIONS
npm run test:ci 2>&1 | grep -i memory

# For hanging issues - investigate async resources
npm run test:ci 2>&1 | tail -50
```

### **Step 4: Systematic Testing**
```bash
# Test incrementally using proven configuration
# Current working config from deployment-handoff-guide.md:
npm run test:ci
# Expected: 507/507 tests pass, process may hang (known issue)

# If tests fail, identify specific failure pattern
npm run test:ci 2>&1 | grep "FAIL\|❌\|✗"
```

### **Step 5: Documentation Update**
After resolving any new issues:
1. Update `docs/deployment-handoff-guide.md` with new solutions
2. Update `docs/github_deployment_log.md` with latest status
3. Commit changes with descriptive messages
4. Update this debug command protocol if needed

---

## ⚡ QUICK REFERENCE COMMANDS

### **Immediate Status Check:**
```bash
# Test status
npm run test:ci 2>&1 | tail -10

# Configuration verification  
grep "test:ci" package.json

# Recent changes
git log --oneline -5
```

### **Memory Issue Check:**
```bash
# Current memory configuration
grep "max-old-space-size" package.json

# Should show: 51200 (50GB allocation)
# If different, reference Phase 4 in deployment-handoff-guide.md
```

### **Test Isolation:**
```bash
# Run specific failing test suites
npm run test src/lib/__tests__/sessionTracking.test.ts
npm run test src/components/pwa/__tests__/InstallPrompt.test.tsx  
npm run test src/components/pwa/__tests__/PWAStatus.test.tsx
npm run test src/components/bug-report/__tests__/BugReportForm.test.tsx
```

---

## 🔍 PROVEN TROUBLESHOOTING PATTERNS

### **Pattern 1: SessionTracker-Style Architecture Issues**
**Symptoms:** Browser API failures in test environment  
**Solution:** Dependency injection with MockImplementation  
**Reference:** Phase 2 in deployment-handoff-guide.md

### **Pattern 2: React Component DOM Pollution**  
**Symptoms:** "Found multiple elements" errors  
**Solution:** `cleanup()` hooks + specific selectors  
**Reference:** Phase 3 in deployment-handoff-guide.md

### **Pattern 3: Memory Exhaustion**
**Symptoms:** "JavaScript heap out of memory"  
**Solution:** 50GB allocation + single-thread execution  
**Reference:** Phase 4 in deployment-handoff-guide.md

### **Pattern 4: Configuration Conflicts**
**Symptoms:** Unsupported NODE_OPTIONS flags  
**Solution:** Remove unsupported flags, test incrementally  
**Reference:** Phase 5 in deployment-handoff-guide.md

### **Pattern 5: Process Hanging (CURRENT)**
**Symptoms:** Tests pass but process won't exit  
**Solution:** Under investigation - async resource cleanup  
**Reference:** Critical Issue section in deployment-handoff-guide.md

---

## 📚 DOCUMENT HIERARCHY

### **When to use each document:**

1. **START HERE:** `docs/deployment-handoff-guide.md`
   - All debugging scenarios
   - Historical solutions  
   - Proven troubleshooting protocols

2. **Current Status:** `docs/github_deployment_log.md`  
   - Latest CI attempts
   - Current hanging issue evidence
   - Real-time deployment status

3. **Code Quality:** `CLAUDE.md` (ESLint section)
   - Lint/syntax errors specifically
   - Systematic error resolution methodology
   - Code quality improvements

4. **Change Context:** `git log --oneline -20`
   - What changed recently
   - Potential regression sources  
   - Commit message patterns

---

## 🎯 SUCCESS CRITERIA

### **Complete Resolution Checklist:**
- [ ] All 507 tests passing ✅ (ACHIEVED)
- [ ] No test failures ✅ (ACHIEVED)  
- [ ] No memory crashes ✅ (ACHIEVED)
- [ ] No configuration conflicts ✅ (ACHIEVED)
- [ ] Process exits cleanly after tests ❌ (IN PROGRESS)
- [ ] GitHub Actions deployment succeeds ❌ (BLOCKED BY HANGING)

### **Current Focus:**
**PRIORITY 1:** Resolve process hanging issue  
**PRIORITY 2:** Ensure clean CI environment execution  
**PRIORITY 3:** Maintain all current test successes  

---

## 🚀 ESCALATION PROTOCOL

### **If standard solutions don't work:**

1. **Review ALL phases** in deployment-handoff-guide.md
2. **Check for configuration drift** - ensure exact working config
3. **Isolate the change** that caused regression
4. **Document new pattern** for future reference
5. **Consider environment-specific issues** (CI vs local)

### **Remember:**
- **The application code is production-ready**
- **Focus on CI environment and process management**  
- **All test failures have been resolved systematically**
- **Current issue is process cleanup, not functionality**

---

**Document Status:** Active troubleshooting reference  
**Next Update:** After hanging issue resolution
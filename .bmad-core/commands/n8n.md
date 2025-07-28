# 🤖 JARVIS N8N COMMAND SYSTEM
*Intelligent Layer-by-Layer Workflow Management*

## 🎯 **Command Philosophy**
This command system builds JARVIS's intelligence layer by layer. Each command adds cognitive capability, making JARVIS more autonomous and powerful in managing n8n workflows.

**Webhook Endpoint:** `https://n8n.madpanda3d.com/webhook/n8n-management`

---

## 🔥 **SMART COMMANDS**

### `*listworkflows`
**Workflow Discovery & Selection Command**

**Purpose:** Lists all available workflows with their IDs and names for easy selection and execution.

**Usage Examples:**
```
*listworkflows
```

**Returns:** Clean formatted list showing:
- ✅ **Workflow ID** - For direct execution
- ✅ **Workflow Name** - For easy identification
- ✅ **Active Status** - Shows if workflow is currently enabled
- ✅ **Last Execution** - When it was last triggered

**Implementation:**
```
POST {"action": "generate_audit", "data": {}}
Parse response for workflow data and format as numbered list
```

### `*runworkflow [workflow_id] [workflow_id2,workflow_id3]`
**Direct Workflow Execution Command**

**Purpose:** Executes one or multiple workflows by their exact IDs in sequence.

**Usage Examples:**
```
*runworkflow PMB7GfBWQa0DA5rF
*runworkflow nQD2DfOoHx4NqR9z,fgrwSDyD5DLrU6lL,7Kr2aQ20S1RXssBS
```

**Execution Features:**
- ✅ **Single Execution:** Run one workflow instantly
- ✅ **Sequential Execution:** Run multiple workflows in order (comma-separated)
- ✅ **Real-time Status:** Shows execution progress for each workflow
- ✅ **Error Handling:** Continues sequence even if one workflow fails
- ✅ **Execution Tracking:** Returns execution IDs for monitoring

**Implementation Flow:**
```
1. Parse workflow IDs (split by comma if multiple)
2. For each workflow ID:
   POST {"action": "trigger_workflow", "data": {"workflowId": "id"}}
3. Monitor execution status and report results
4. Continue to next workflow in sequence
```

---

## ⚡ **DIRECT COMMANDS**
*For when you know exactly what you want*

### `*audit`
**Security & System Analysis**
```
POST {"action": "generate_audit", "data": {}}
```
**Returns:** Complete security audit, credential risks, node risks, instance settings
**Use Case:** System health checks, security reviews, compliance reporting

### `*getworkflow [workflow_id]`
**Retrieve Complete Workflow**
```
POST {"action": "get_workflow", "data": {"workflowId": "PMB7GfBWQa0DA5rF"}}
```
**Returns:** Full workflow JSON, nodes, connections, settings, metadata
**Use Case:** Backup workflows, analyze structure, debugging

### `*createworkflow [workflow_json]`
**Deploy New Workflow**
```
POST {"action": "create_workflow", "data": {"workflow": {complete_workflow_json}}}
```
**Returns:** Created workflow with new ID
**Use Case:** Deploy JARVIS Enhanced, import workflows, system expansion

### `*updateworkflow [workflow_id] [workflow_json]`
**Update Existing Workflow**
```
POST {"action": "update_workflow", "data": {"workflowId": "id", "workflow": {updated_json}}}
```
**Returns:** Updated workflow confirmation
**Use Case:** Modify workflows, add nodes, update configurations

### `*activate [workflow_id]`
**Enable Workflow Execution**
```
POST {"action": "activate_workflow", "data": {"workflowId": "PMB7GfBWQa0DA5rF"}}
```
**Returns:** Activation confirmation with trigger count
**Use Case:** Go live with workflows, enable automation

### `*deactivate [workflow_id]`
**Disable Workflow Execution**
```
POST {"action": "deactivate_workflow", "data": {"workflowId": "PMB7GfBWQa0DA5rF"}}
```
**Returns:** Deactivation confirmation
**Use Case:** Maintenance mode, testing, emergency stops

### `*deleteworkflow [workflow_id]`
**Permanently Remove Workflow**
```
POST {"action": "delete_workflow", "data": {"workflowId": "PMB7GfBWQa0DA5rF"}}
```
**Returns:** Deletion confirmation
**Use Case:** Cleanup old workflows, remove failed experiments
**⚠️ WARNING:** This action is irreversible

### `*executions [workflow_id] [limit]`
**Get Execution History**
```
POST {"action": "get_executions", "data": {"workflowId": "PMB7GfBWQa0DA5rF", "limit": 50}}
```
**Returns:** Execution list with status, timestamps, data
**Use Case:** Performance monitoring, debugging, success rate analysis

### `*deleteexecution [execution_id]`
**Remove Execution Record**
```
POST {"action": "delete_execution", "data": {"executionId": "exec-id-here"}}
```
**Returns:** Deletion confirmation
**Use Case:** Cleanup execution history, remove sensitive data

### `*createcredential [name] [type] [data]`
**Add New Credential**
```
POST {"action": "create_credential", "data": {"name": "My API", "credentialTypeName": "httpHeaderAuth", "credentialData": {...}}}
```
**Returns:** Created credential with ID
**Use Case:** Add API keys, OAuth tokens, database connections

### `*deletecredential [credential_id]`
**Remove Credential**
```
POST {"action": "delete_credential", "data": {"credentialId": "cred-id-here"}}
```
**Returns:** Deletion confirmation
**Use Case:** Security cleanup, revoke access, credential rotation

---

## 🧠 **INTELLIGENT WORKFLOWS**

### **Best Practice: Layer-by-Layer Approach**

#### **Layer 1: Discovery**
```
*audit → Understand current system state
*listworkflows → See all available workflows with IDs
```

#### **Layer 2: Analysis** 
```
*executions [id] → Check performance history
*getworkflow [id] → Analyze structure
```

#### **Layer 3: Action**
```
*runworkflow [id] → Execute workflow directly
*activate [id] → Enable workflow for triggers
*updateworkflow [id] → Modify as needed
```

### **Smart Execution Sequence**
```
1. *listworkflows (see available workflows)
2. *runworkflow [id] (execute selected workflow)
3. *executions [id] 10 (monitor execution results)
4. *audit (system health check if needed)
```

### **Maintenance Workflow**
```
1. *audit (security scan)
2. *getworkflow [id] (backup before changes)
3. *deactivate [id] (safe maintenance)
4. *activate [id] (re-enable)
```

---

## 🎯 **SUCCESS STRATEGIES**

### **Workflow Discovery Strategy**
1. **Always start with `*listworkflows`** - See all available workflows with IDs
2. **Use `*runworkflow` for direct execution** - Execute by exact workflow ID
3. **Verify with `*getworkflow`** - Analyze workflow structure when needed

### **Error Recovery Strategy**
1. **Check recent executions first** - `*executions [id] 5`
2. **Analyze workflow structure** - `*getworkflow [id]`
3. **Use audit for system-wide issues** - `*audit`

### **Deployment Strategy**
1. **Test in development** - Create → Test → Validate
2. **Backup before changes** - `*getworkflow` before `*updateworkflow`
3. **Monitor after deployment** - `*executions` to verify success

---

## 🔧 **TECHNICAL IMPLEMENTATION**

### **Command Processing Logic**
```javascript
// *runworkflow command processing
1. Parse user input: workflow_id(s) separated by commas
2. For each workflow_id in sequence:
   - POST trigger_workflow action with workflowId
   - Monitor execution status
   - Report results before continuing
3. Handle errors gracefully, continue sequence
4. Return execution summary for all workflows
```

### **Error Handling**
- **Invalid workflow names:** Show available options
- **Multiple matches:** Present selection menu
- **API failures:** Retry with exponential backoff
- **Missing IDs:** Auto-discover via audit

### **Response Formatting**
```json
{
  "success": true/false,
  "action": "command_executed",
  "timestamp": "ISO_timestamp",
  "data": {...},
  "message": "Human readable result"
}
```

---

## 🚀 **JARVIS EVOLUTION PATH**

Each command layer builds JARVIS's cognitive abilities:

**🧠 Layer 1: Discovery Intelligence**
- System awareness via audit
- Workflow identification by name
- Smart matching algorithms

**⚡ Layer 2: Execution Intelligence** 
- Autonomous workflow management
- Error detection and recovery
- Performance monitoring

**🎯 Layer 3: Strategic Intelligence**
- Predictive maintenance
- Optimization recommendations
- Self-improving workflows

**🔮 Layer 4: Creative Intelligence**
- Auto-generate workflows from descriptions
- Learn from usage patterns
- Suggest system improvements

---

**🎖️ Remember: Each command makes JARVIS more powerful. Use them to build an ever-expanding automation empire, one layer at a time.**
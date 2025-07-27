# Analyze README Requirements Task

## Purpose

To comprehensively analyze a project and determine the specific README requirements, update scope, and documentation needs. This task identifies what type of README work is needed and gathers all necessary information for effective documentation.

## SEQUENTIAL Task Execution (Do not proceed until current task is complete)

### 0. Load Core Configuration and Project Context

- Load `.bmad-core/core-config.yaml` if available for project standards
- Identify project type (frontend, backend, full-stack, library, tool)
- Determine current README status (new creation, major update, minor update, VPS deployment addition)
- Load existing README.md if present for analysis
- Identify project root directory and key configuration files

### 1. Project Discovery and Analysis

- **Technology Stack Detection**: Analyze package.json, requirements.txt, Cargo.toml, etc. to identify:
  - Primary programming languages and versions
  - Frameworks and libraries used
  - Build tools and dependencies
  - Development and production dependencies
- **Project Structure Analysis**: Examine directory structure to understand:
  - Frontend/backend separation
  - Component organization
  - Configuration file locations
  - Documentation structure
- **Feature Identification**: Identify key project features by examining:
  - Source code structure
  - Configuration files
  - Existing documentation
  - API endpoints or routes

### 2. Current README Assessment (if exists)

- **Content Audit**: Analyze existing README for:
  - Completeness of required sections
  - Accuracy of technical information
  - Currency of version numbers and dependencies
  - Quality of installation instructions
  - Effectiveness of usage examples
- **MADPANDA3D Brand Compliance**: Check for:
  - Proper emoji usage (🐼🔥)
  - Brand consistency
  - Professional tone and presentation
  - Logo and badge placement
- **Gap Analysis**: Identify missing or inadequate sections:
  - Installation instructions
  - Configuration documentation
  - Usage examples
  - Troubleshooting guidance
  - VPS deployment instructions

### 3. Deployment Requirements Analysis

- **VPS Deployment Needs**: Determine if project requires:
  - Docker containerization documentation
  - Nginx Proxy Manager setup
  - Domain and SSL configuration
  - Webhook automation setup
  - Environment variable configuration
- **Platform Requirements**: Identify deployment platforms:
  - Preferred deployment method (Docker, direct install, etc.)
  - Port requirements and networking
  - Database or external service dependencies
  - Security considerations

### 4. Target Audience Identification

- **Primary Users**: Identify who will use this README:
  - Developers (internal team, open source contributors)
  - End users (business stakeholders, customers)
  - System administrators (deployment, maintenance)
  - Technical evaluators (potential adopters)
- **Use Case Analysis**: Determine primary README use cases:
  - Quick start and evaluation
  - Development environment setup
  - Production deployment
  - Troubleshooting and support
  - Feature exploration and usage

### 5. Content Requirements Specification

- **Required Sections**: Based on project type and audience, specify:
  - Essential sections (overview, installation, usage)
  - Technical sections (architecture, API documentation)
  - Operational sections (deployment, monitoring, troubleshooting)
  - Community sections (contributing, support, licensing)
- **Image Requirements**: Identify needed visual content:
  - Hero/demo images or screenshots
  - Feature demonstration images
  - Architecture diagrams
  - Installation step screenshots
- **Code Example Needs**: Specify required code examples:
  - Basic usage examples
  - Advanced feature demonstrations
  - Configuration examples
  - API usage examples

### 6. Update Scope Determination

Based on analysis, categorize the README work:

#### New README Creation
- Complete README from scratch
- Full template implementation
- Comprehensive content development
- All sections and visual elements

#### Major Update
- Significant restructuring required
- Multiple sections need rewriting
- Technology stack changes
- Feature additions or major changes

#### Minor Update
- Version number updates
- Small content corrections
- Link updates
- Minor feature additions

#### VPS Deployment Addition
- Add comprehensive VPS deployment section
- Docker and Nginx Proxy Manager setup
- Domain configuration and SSL
- Webhook automation if applicable

### 7. Resource and Asset Inventory

- **Existing Assets**: Catalog available resources:
  - Project logos and branding materials
  - Existing screenshots or demos
  - Architecture diagrams
  - Documentation fragments
- **Required Assets**: Identify needed resources:
  - Missing images or screenshots
  - Required diagrams or flowcharts
  - Demo videos or GIFs
  - Brand assets or logos
- **Content Sources**: Identify information sources:
  - Existing documentation
  - Code comments and inline docs
  - Team knowledge and expertise
  - External documentation or references

### 8. Technical Validation Requirements

- **Installation Testing**: Determine testing needs:
  - Clean environment testing requirements
  - Platform-specific testing (Windows, macOS, Linux)
  - Dependency version compatibility
  - Common installation issues
- **Documentation Accuracy**: Specify validation requirements:
  - Command verification
  - Link checking
  - Code example testing
  - Configuration validation

### 9. Generate Requirements Report

Provide a comprehensive requirements analysis including:

#### Project Analysis Summary
- Project type and primary technology stack
- Current README status and quality assessment
- Target audience and primary use cases
- Deployment requirements and complexity

#### Update Scope Classification
- **Scope Type**: New Creation / Major Update / Minor Update / VPS Deployment Addition
- **Estimated Effort**: High / Medium / Low
- **Priority Level**: Critical / High / Medium / Low
- **Timeline Recommendation**: Immediate / This Sprint / Next Sprint

#### Required Sections and Content
- **Essential Sections**: List of required README sections
- **Technical Content**: Specific technical documentation needs
- **Visual Content**: Required images, diagrams, and demonstrations
- **Code Examples**: Needed usage examples and snippets

#### Asset and Resource Requirements
- **Existing Assets**: Available resources for use
- **Required Assets**: Missing resources that need creation
- **Content Sources**: Where to obtain required information
- **Technical Validation**: Testing and verification requirements

#### MADPANDA3D Brand Requirements
- **Branding Elements**: Required brand consistency elements
- **Style Guidelines**: Specific style and tone requirements
- **Template Selection**: Recommended template (comprehensive/simplified)
- **Quality Standards**: Expected quality and professionalism level

#### Implementation Recommendations
- **Approach**: Recommended implementation strategy
- **Dependencies**: Required resources or prerequisites
- **Risk Factors**: Potential challenges or blockers
- **Success Criteria**: How to measure completion and quality

### 10. Handoff Preparation

- **Context Package**: Prepare complete context for README update task:
  - Project analysis summary
  - Requirements specification
  - Asset inventory
  - Technical validation needs
- **Priority Guidance**: Provide clear priorities for content development
- **Quality Expectations**: Set clear quality and completeness standards
- **Timeline Considerations**: Identify any time-sensitive requirements

## Validation Checklist

Before completing this task, ensure:

- [ ] Project type and technology stack clearly identified
- [ ] Current README status accurately assessed
- [ ] Update scope properly classified
- [ ] Target audience and use cases defined
- [ ] Required sections and content specified
- [ ] Asset and resource requirements identified
- [ ] MADPANDA3D brand requirements documented
- [ ] Implementation approach recommended
- [ ] Complete requirements report generated
- [ ] Handoff package prepared for next task

## Output Deliverables

1. **Project Analysis Report**: Comprehensive project assessment
2. **Requirements Specification**: Detailed content and asset requirements
3. **Update Scope Classification**: Clear categorization of work needed
4. **Implementation Recommendations**: Strategic approach and priorities
5. **Asset Inventory**: Available and required resources
6. **Quality Standards**: Expected outcomes and success criteria


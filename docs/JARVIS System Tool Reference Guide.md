# **JARVIS System Tool Reference Guide**

## **System Architecture Overview**

### **Layer 1: J.A.R.V.I.S (Conversational Interface)**

* **Role**: Primary conversational AI with Tony Stark personality  
* **Function**: Discerns user needs and routes to appropriate tools  
* **Direct Tools**: Tool Reference access, Brainstorm workflow  
* **Routing Method**: Uses \*command system to activate OPERATOR tools  
* **Decision Logic**: Conversation mode vs Tool activation mode

### **Layer 2: OPERATOR (Execution Engine)**

* **Role**: Tool execution and task completion agent  
* **Function**: Receives \*command instructions from J.A.R.V.I.S and executes appropriate tools  
* **Capability**: One tool at a time processing with interactive clarification  
* **Connected Tools**: 11 specialized tools and workflows

## **⭐ Star Command Matrix \- Quick Reference**

| Command | Tool | Purpose |
| ----- | ----- | ----- |
| **\*email** | Email Agent | Send, receive, and manage emails |
| **\*calendar** | Calendar Agent | Schedule meetings, check availability, manage events |
| **\*research** | Research Agent | Search academic, news, economic, and specialized databases |
| **\*projects** | Projects Agent | Track project status, update progress, manage tasks |
| **\*travel** | Travel Agent | Complete travel planning with flights, hotels, activities |
| **\*marketing** | Marketing Team | Blog posts, LinkedIn content, images, videos |
| **\*contacts** | Contacts Data | Look up contact information, email addresses, phone numbers |
| **\*whatsapp** | WhatsApp Business | Send messages via WhatsApp Business |
| **\*calculate** | Calculator | Perform mathematical calculations and computations |
| **\*knowledge** | Knowledge Base | Access company information and reference materials |
| **\*develop** | N8N Developer | Create custom n8n automations and workflows |

  **\*glassfruit**       Glass Fruit ASMR operates on automated schedule and does not use star            commands.                                                        

## **OPERATOR Tool Inventory**

### **Core Data Tools**

**Knowledge Base** (\*knowledge)

* **Type**: Vector store tool  
* **Purpose**: Access company information and reference materials  
* **Usage**: \[Detailed breakdown pending\]

**Contacts Data** (\*contacts)

* **Type**: Google Sheets integration  
* **Purpose**: Look up contact information, email addresses, phone numbers  
* **Usage**: \[Detailed breakdown pending\]

### **Communication Tools**

**Email Agent** (\*email)

* **Type**: Workflow tool (Execute Workflow Trigger)  
* **Purpose**: Handle all email-related actions, sending, receiving, managing  
* **AI Model**: OpenAI GPT-4o with email-specific instructions  
* **Authentication**: Gmail OAuth2 integration

**Capabilities:**

* **Send Emails**: Compose and send emails to specified recipients  
* **Retrieve Emails**: Get emails from specific senders with customizable limits  
* **Smart Parameter Extraction**: Uses $fromAI() to extract email details from conversation context

**Required Information for Sending:**

* Recipient email address  
* Subject line  
* Email body/message content  
* Automatically signs emails as "Nate"

**Required Information for Retrieving:**

* Sender email address (optional filter)  
* Number of emails to retrieve (defaults to 5 if not specified)

**Input Processing:**

* Receives query from JARVIS via Execute Workflow Trigger  
* AI agent analyzes request and determines send vs retrieve action  
* Extracts necessary parameters using $fromAI() functions  
* Routes to appropriate Gmail tool (Send Email or Get Messages)

**Output:**

* Success: Returns agent's response with confirmation or email content  
* Error: Returns "Unable to perform task. Please try again."

**Error Handling:**

* Built-in error flow for failed operations  
* Graceful failure messaging back to user

**Usage Scenarios:**

* "Send an email to John about the meeting"  
* "Get my last 10 emails from Sarah"  
* "Email the team about project updates"  
* "Check if I received any emails from the client today"

**WhatsApp Business** (\*whatsapp)

* **Type**: WhatsApp Business Cloud integration  
* **Purpose**: Send messages via WhatsApp Business  
* **Usage**: \[Detailed breakdown pending\]

### **Productivity Tools**

**Calendar Agent** (\*calendar)

* **Type**: Workflow tool (Execute Workflow Trigger)  
* **Purpose**: Schedule meetings, check availability, manage events  
* **AI Model**: OpenAI GPT-4o with calendar-specific instructions  
* **Authentication**: Google Calendar OAuth2 integration  
* **Target Calendar**: leolara@madpanda3d.com

**Capabilities:**

* **Create Solo Events**: Schedule personal events without attendees  
* **Create Events with Attendees**: Schedule meetings and send invitations  
* **Retrieve Events**: Get events from specific date ranges for availability checking  
* **Smart Duration**: Defaults to 60-minute duration if end time not specified

**Required Information for Creating Events:**

* Event name/title  
* Start time (date and time)  
* End time (optional \- defaults to 60 minutes after start)  
* Attendee email address (if scheduling with others)

**Required Information for Retrieving Events:**

* Target date or date range  
* Automatically queries one day before and after requested date for context

**Input Processing:**

* Receives query from JARVIS via Execute Workflow Trigger  
* AI agent determines create vs retrieve action  
* Intelligently chooses between solo event vs attendee event tools  
* Extracts timing, names, and attendee information using $fromAI() functions  
* Provides current date/time context for scheduling accuracy

**Output:**

* Success: Returns confirmation with event details or retrieved event summaries  
* Error: Returns "Unable to perform task. Please try again."

**Smart Features:**

* **Context Awareness**: Knows current date/time for relative scheduling  
* **Attendee Detection**: Automatically uses attendee tool when others are mentioned  
* **Flexible Time Parsing**: Handles various time formats and relative references  
* **Availability Checking**: Can retrieve events to check conflicts

**Usage Scenarios:**

* "Schedule a meeting with John tomorrow at 2 PM"  
* "Create a 30-minute call with Sarah next Friday"  
* "What do I have scheduled for Thursday?"  
* "Block out 2 hours for project work this afternoon"  
* "Set up a team meeting for next Tuesday at 10 AM"

**Projects Agent** (\*projects)

* **Type**: Workflow tool (Execute Workflow Trigger)  
* **Purpose**: Track project status, update progress, manage tasks with intelligent project management  
* **AI Model**: OpenAI GPT-4o with comprehensive project management instructions  
* **Data Source**: Google Sheets integration (PROJECTS spreadsheet)  
* **Authentication**: Google Sheets OAuth2 integration

**Capabilities:**

* **Project Retrieval**: Get all projects or search for specific ones with summaries  
* **Intelligent Updates**: Update any project field while preserving unchanged information  
* **Worklog Management**: Append new entries to existing worklog without replacing content  
* **Gap Analysis**: Proactively identify missing critical information  
* **Status Tracking**: Handle project lifecycle and status transitions intelligently  
* **Partial Updates**: Modify only specified fields, keeping all other data intact

**Project Data Fields:**

* **Project**: Name/title of the project  
* **Status**: Current status ("In Progress", "Completed", "On Hold", "Planning", etc.)  
* **Date Started**: Project initiation date  
* **Category**: Project type ("Tool Development", "Config", "Integration", etc.)  
* **Milestones**: Key project goals and checkpoints  
* **Notes**: General descriptions and project information  
* **Worklog**: Detailed work entries and progress updates  
* **Completion Date**: Project finish date (for completed projects)  
* **GitHub Link**: Repository URL if applicable

**Smart Features:**

* **Partial Update Intelligence**: Updates only specified fields, preserves all others  
* **Worklog Append Logic**: Adds new entries as "\[Date\]: New work entry" to existing content  
* **Status Transition Awareness**: Suggests completion dates when status changes to "Completed"  
* **Missing Information Detection**: Identifies projects lacking essential details  
* **Proactive Management**: Asks about gaps like missing start dates, categories, recent worklog entries

**Input Processing:**

* Receives natural language queries about project management  
* Determines whether to retrieve project information or perform updates  
* Intelligently routes between Get Projects and Update Projects tools  
* Handles complex update scenarios with context preservation

**Output:**

* **Retrieval**: Project summaries, status reports, progress overviews  
* **Updates**: Confirmation of changes with updated project details  
* **Gap Identification**: Suggestions for missing information and improvements  
* **Error Handling**: Graceful failure messaging for unsuccessful operations

**Update Guidelines:**

* **Preserve Data**: Never overwrite existing information unless explicitly specified  
* **Worklog Format**: "Previous entries... | \[Date\]: New work entry"  
* **Status Intelligence**: Automatically suggests related updates (completion dates, etc.)  
* **Context Awareness**: Understands project relationships and dependencies

**Usage Scenarios:**

* "Update JARVIS project status to 'Testing'"  
* "Add worklog entry for LEAD-GEN-PRO: Fixed authentication bug"  
* "Show me all projects that are currently in progress"  
* "What projects haven't been updated recently?"  
* "Add completion date for the EMAIL-AGENT project"  
* "Create new project entry for CHATBOT-INTEGRATION"  
* "Which projects are missing categories or descriptions?"

**Proactive Management Examples:**

* Identifies projects without start dates  
* Flags "In Progress" projects without recent worklog entries  
* Suggests adding completion dates for finished projects  
* Asks for missing categories or milestone information

**Data Integrity Features:**

* **Matching Logic**: Uses Project name to identify records for updates  
* **Field Preservation**: Maintains all existing data during partial updates  
* **Append Operations**: Safely adds to worklog without data loss  
* **Validation**: Ensures updates are applied correctly and completely

**Calculator** (\*calculate)

* **Type**: Mathematical computation tool  
* **Purpose**: Perform calculations and mathematical operations  
* **Usage**: \[Detailed breakdown pending\]

### **Research and Information Tools**

**Research Agent** (\*research)

* **Type**: Advanced workflow tool (Execute Workflow Trigger)  
* **Purpose**: Comprehensive research across academic, news, social, economic, government, and specialized databases  
* **AI Model**: OpenAI GPT-4o with sophisticated research methodology instructions  
* **Tool Arsenal**: 25+ specialized research APIs across 6 major categories  
* **Research Philosophy**: Multi-source validation with authoritative source prioritization

**Research Categories & Tools:**

**Academic Research (6 APIs):**

* **OpenAlex Academic API**: 200M+ papers, citations, research metrics  
* **Semantic Scholar API**: AI-powered search, paper recommendations  
* **CrossRef API**: 75M+ scholarly works, citation metadata  
* **arXiv API**: Latest preprints in STEM fields  
* **PubMed API**: Biomedical and life science literature  
* **CORE API**: World's largest open access paper collection

**News & Media (4 APIs):**

* **News API**: 75,000+ global news sources  
* **New York Times API**: Premium journalism and archives  
* **Guardian API**: International news coverage  
* **Chronicling America API**: Historical US newspapers (Library of Congress)

**Social Media & Community (3 APIs):**

* **Reddit API**: Community discussions and social sentiment  
* **YouTube Data API**: Video content and trends  
* **Hacker News**: Tech community insights and discussions

**Economic & Financial (5 APIs):**

* **FRED Economic Data**: 827,000+ US economic indicators  
* **IMF Data API**: International economic statistics  
* **World Bank API**: Global development indicators  
* **Alpha Vantage API**: Real-time stock market data  
* **IEX Cloud API**: Financial fundamentals and market data

**Government Data (3 APIs):**

* **Data.gov API**: US government datasets  
* **US Census API**: Demographics and population statistics  
* **BLS API**: Labor statistics, employment, inflation

**Specialized Research (4 APIs):**

* **GitHub API**: Code repositories, development trends  
* **Internet Archive API**: Historical digital content  
* **Open Library API**: Books and literary information  
* **Wikidata API**: Structured knowledge relationships

**General Knowledge (3 APIs):**

* **Wikipedia**: Encyclopedia and general knowledge  
* **SerpAPI**: Comprehensive web search  
* **Hacker News Tool**: Technology discussions

**Intelligent Tool Selection:**

* **Query Analysis**: Categorizes requests by type (academic, news, economic, social, etc.)  
* **Primary Source Priority**: Authoritative \> General, Specialized \> Broad, Recent \> Historical  
* **3-Tool Maximum Rule**: Uses 1-2 primary tools \+ 1 validation tool maximum per query  
* **Fallback Strategy**: Category tools → Wikipedia \+ SerpAPI → Manual research suggestions

**Research Methodologies:**

* **Cross-Validation Patterns**: Academic \+ News, Government \+ Private, Social \+ Official  
* **Research Depth Levels**: Quick (1 tool), Standard (2 tools), Deep (3 tools)  
* **Smart Combinations**: Multi-source analysis for complex topics

**Quality Control Features:**

* **Source Credibility**: Prioritizes government, academic, and primary sources  
* **Contradiction Detection**: Identifies conflicting information across sources  
* **Data Limitations**: Notes gaps and suggests additional research directions  
* **Citation Requirements**: Explains tool selection rationale and source quality

**Advanced Capabilities:**

* **Trend Analysis**: Historical \+ Current data for pattern identification  
* **Sentiment Analysis**: Economic indicators \+ Social media for comprehensive views  
* **Impact Assessment**: Research findings \+ Media coverage for real-world implications  
* **Technology Research**: GitHub trends \+ Academic papers for development insights

**Input Processing:**

* **Query Classification**: Automatically categorizes research needs  
* **Tool Selection Logic**: Intelligent routing based on query type and complexity  
* **Multi-Source Synthesis**: Combines findings from different tool categories  
* **Professional Analysis**: Provides context, interpretation, and synthesis

**Output Structure:**

* **Research Methodology**: Explains tool selection reasoning  
* **Key Findings**: Direct answers with source-specific breakdowns  
* **Source Analysis**: Academic, News, Economic data presented separately  
* **Synthesis**: Professional interpretation and analysis  
* **Follow-up Suggestions**: Additional research directions and deeper dive options

**Usage Scenarios:**

* **Academic Research**: "Latest studies on artificial intelligence safety"  
* **Market Analysis**: "Impact of Federal Reserve rate changes on tech stocks"  
* **Current Events**: "Global response to recent climate summit agreements"  
* **Historical Research**: "Economic data during the 2008 financial crisis"  
* **Technology Trends**: "Open source adoption rates in enterprise software"  
* **Social Analysis**: "Public sentiment on remote work policies"  
* **Competitive Intelligence**: "Market positioning of major cloud providers"

**Professional Standards:**

* **Copyright Compliance**: Never reproduces large content blocks, uses brief quotes only  
* **Source Attribution**: Clear citation of all information sources  
* **Quality Validation**: Cross-references findings across multiple authoritative sources  
* **Objective Analysis**: Presents balanced perspectives from multiple viewpoints  
* **Professional Synthesis**: Combines raw data into actionable insights

**Error Handling:**

* **API Failures**: Intelligent fallback to alternative sources in same category  
* **Data Conflicts**: Identifies and reports contradictory information  
* **Limited Results**: Suggests alternative research approaches and manual methods  
* **Access Issues**: Routes around paywalls using open access alternatives

### **Creative and Marketing Tools**

**Marketing Team** (\*marketing)

* **Type**: Complex multi-tool workflow (Execute Workflow Trigger)  
* **Purpose**: Comprehensive marketing and creative content production suite  
* **AI Model**: OpenAI GPT-4.1-mini with marketing specialization  
* **Memory**: Simple Buffer Window Memory for conversation context  
* **Sub-Workflows**: 6 specialized creative tools \+ decision support

**Core Capabilities:**

**Image Creation & Management:**

* **Create Image**: Generate new images from text descriptions with titles  
* **Edit Image**: Modify existing images from database with specific requests  
* **Search Images**: Query image database with "Get" or "Edit" intent options

**Content Creation:**

* **Blog Post**: Generate professional blog posts with topic and target audience  
* **LinkedIn Post**: Create LinkedIn-specific content with topic and audience targeting  
* **Video**: Produce faceless videos on specified topics

**Decision Support:**

* **Think**: Internal reasoning tool for complex decision-making  
* **Memory Integration**: Maintains conversation context for iterative improvements

## **Sub-Workflow Detailed Analysis**

### **CREATE IMAGE Sub-Workflow**

* **Purpose**: Generate new images from text descriptions with automatic prompt enhancement  
* **AI Model**: OpenAI GPT-4.1 with image prompt engineering specialization  
* **Image Generation**: OpenAI GPT-Image-1 model (1024x1024 resolution)  
* **Storage**: Automatic Google Drive upload to AI Image Generation folder  
* **Database**: Auto-logs to Marketing Team Log spreadsheet

**Process Flow:**

1. **Prompt Enhancement**: AI expands simple concepts into detailed image prompts  
2. **Style Integration**: Adds visual style, mood, lighting, and technical details  
3. **Image Generation**: Creates high-quality 1024x1024 images via OpenAI API  
4. **File Processing**: Converts base64 to binary file format  
5. **Storage & Logging**: Uploads to Drive, logs metadata to spreadsheet  
6. **Delivery**: Sends image via Telegram with immediate preview

**Required Inputs:**

* **Image Title**: 2-4 word creative title for the image  
* **Image Prompt**: Description or concept for image generation  
* **Chat ID**: Session identifier for delivery

**Advanced Features:**

* **Prompt Engineering Intelligence**: Transforms simple requests into detailed visual prompts  
* **Professional Quality**: Generates publication-ready images  
* **Automatic Organization**: Systematic file naming and folder structure  
* **Metadata Tracking**: Complete audit trail of all generated images

### **EDIT IMAGE Sub-Workflow**

* **Purpose**: Modify existing images from database with specific edit requests  
* **AI Model**: None (direct API integration)  
* **Image Editing**: OpenAI GPT-Image-1 edit functionality  
* **Source**: Downloads from Google Drive using Picture ID  
* **Storage**: Creates new "(Edited)" versions in Drive

**Process Flow:**

1. **Image Retrieval**: Downloads original image from Google Drive via Picture ID  
2. **Edit Processing**: Applies requested modifications using OpenAI image editing  
3. **File Generation**: Creates edited version with "(Edited)" filename suffix  
4. **Storage & Logging**: Uploads new version, logs edit details to spreadsheet  
5. **Delivery**: Sends edited image via Telegram with immediate preview

**Required Inputs:**

* **Image**: Title/name of image to edit  
* **Request**: Specific edit instructions  
* **Picture ID**: Google Drive file ID of source image  
* **Chat ID**: Session identifier for delivery

**Advanced Features:**

* **Non-Destructive Editing**: Preserves original images, creates new edited versions  
* **Edit Tracking**: Logs all edit requests and results for audit trail  
* **Direct Integration**: Seamless Google Drive to OpenAI editing pipeline  
* **Quality Preservation**: Maintains image quality through edit process

### **SEARCH IMAGES Sub-Workflow**

* **Purpose**: Query image database with intelligent search and retrieval capabilities  
* **AI Model**: OpenRouter GPT-4.1-mini with database search specialization  
* **Database**: Google Sheets image log with structured search  
* **Intent Processing**: Distinguishes between "Get" (view) and "Edit" (modify) requests

**Process Flow:**

1. **Query Analysis**: AI analyzes search request and intent  
2. **Database Search**: Queries Google Sheets image database using keywords  
3. **Result Processing**: Finds matching images with metadata  
4. **Intent Routing**: Routes to appropriate action based on Get/Edit intent  
5. **Content Delivery**: Downloads and sends image or prepares edit parameters

**Required Inputs:**

* **Intent**: "Get" (retrieve/view) or "Edit" (prepare for modification)  
* **Image**: Search term or image title  
* **Chat ID**: Session identifier for delivery

**Advanced Features:**

* **Intelligent Search**: AI-powered keyword matching and relevance ranking  
* **Dual Intent Processing**: Seamlessly handles view vs edit workflows  
* **Metadata Integration**: Provides image details, IDs, and links  
* **Context Awareness**: Understands references like "that image" or "the logo"

### **BLOG POST Sub-Workflow**

* **Purpose**: Generate professional blog articles with research integration and visual accompaniment  
* **AI Models**: OpenAI GPT-4.1 for content creation and image prompt generation  
* **Research**: Tavily API for real-time topic research and fact-checking  
* **Visual Integration**: Automatic blog image generation with themed visuals  
* **Delivery**: Combined text \+ image delivery via Telegram

**Process Flow:**

1. **Research Phase**: Tavily API searches for current information on blog topic  
2. **Content Creation**: AI generates professional blog post targeting specified audience  
3. **Image Prompt Generation**: Creates visual prompt based on blog content themes  
4. **Image Generation**: OpenAI creates accompanying blog image (1024x1024)  
5. **Storage & Logging**: Uploads image to Drive, logs blog post and metadata  
6. **Delivery**: Sends image preview followed by complete blog text

**Required Inputs:**

* **Blog Topic**: Subject matter for the article  
* **Target Audience**: Intended readership demographic  
* **Chat ID**: Session identifier for delivery

**Advanced Features:**

* **Real-Time Research**: Live fact-checking and current information integration  
* **Audience Adaptation**: Tailors writing style, tone, and complexity to target demographic  
* **Visual Coordination**: Creates thematically relevant images to accompany articles  
* **Professional Standards**: Maintains blog quality with proper structure, citations, and flow  
* **SEO Awareness**: Incorporates relevant keywords and optimization techniques

### **LINKEDIN POST Sub-Workflow**

* **Purpose**: Create LinkedIn-optimized content with professional visual accompaniment  
* **AI Models**: OpenAI GPT-4.1 for content and image prompt generation  
* **Research**: Tavily API for current industry information and trends  
* **Visual Style**: Professional graphics optimized for LinkedIn feed presentation  
* **Platform Optimization**: Content specifically formatted for LinkedIn engagement

**Process Flow:**

1. **Industry Research**: Tavily searches for current trends and information  
2. **LinkedIn Content Creation**: AI generates platform-specific post content  
3. **Professional Image Prompt**: Creates business-appropriate visual prompts  
4. **Image Generation**: OpenAI creates LinkedIn-optimized graphics (1024x1024)  
5. **Storage & Logging**: Archives post content and image with metadata  
6. **Delivery**: Sends professional image followed by LinkedIn post text

**Required Inputs:**

* **Post Topic**: Subject matter for LinkedIn content  
* **Target Audience**: Professional demographic targeting  
* **Chat ID**: Session identifier for delivery

**Advanced Features:**

* **Platform Optimization**: Content formatted specifically for LinkedIn algorithm and audience  
* **Professional Visual Style**: Business-appropriate graphics with modern design elements  
* **Trend Integration**: Incorporates current industry trends and discussions  
* **Engagement Focus**: Structured for maximum professional network engagement  
* **Brand Consistency**: Maintains professional tone and visual standards

### **FACELESS VIDEO Sub-Workflow**

* **Purpose**: Create comprehensive video content from concept to final production  
* **AI Models**: Multiple GPT models for script, visuals, and audio coordination  
* **Video Generation**: Runway ML Gen3a\_turbo for image-to-video conversion  
* **Audio Creation**: ElevenLabs sound generation for background audio  
* **Production**: Creatomate for final video assembly and rendering

**Process Flow:**

1. **Story Structure**: AI creates 4-part visual narrative from video topic  
2. **Image Generation**: Creates 4 themed images using Flux1-dev model (540x960 portrait)  
3. **Video Production**: Runway ML converts images to 5-second video segments  
4. **Audio Design**: AI creates ambient soundscapes using ElevenLabs  
5. **Post-Production**: Creatomate assembles videos with synchronized audio  
6. **Delivery & Logging**: Sends final video via Telegram, logs to database

**Required Inputs:**

* **Video Topic**: Subject matter and narrative concept  
* **Chat ID**: Session identifier for delivery

**Advanced Features:**

* **Narrative Intelligence**: Breaks complex topics into 4-part visual stories  
* **Multi-Modal Production**: Coordinates visuals, motion, and audio seamlessly  
* **Portrait Optimization**: 540x960 format optimized for mobile and social platforms  
* **Professional Quality**: Broadcast-ready video production with synchronized audio  
* **Automated Pipeline**: Complete video production from concept to delivery  
* **Brand Consistency**: Maintains visual and audio style across productions

## **Integration Architecture**

**Database Management:**

* **Centralized Logging**: All creative outputs logged to Marketing Team Log spreadsheet  
* **File Organization**: Systematic Google Drive folder structure for all assets  
* **Metadata Tracking**: Complete audit trail with timestamps, requests, and outputs  
* **Cross-Reference**: Image database enables editing and retrieval workflows

**Quality Control:**

* **Professional Standards**: Each sub-workflow maintains publication-ready output quality  
* **Brand Consistency**: Unified creative direction across all content types  
* **Technical Excellence**: High-resolution outputs optimized for respective platforms  
* **Error Handling**: Graceful failure management with user-friendly messaging

**Workflow Coordination:**

* **Session Management**: ChatID tracking enables multi-turn creative sessions  
* **Memory Integration**: Context preservation for iterative creative development  
* **Intelligent Routing**: AI determines appropriate sub-workflow based on request type  
* **Scalable Design**: Modular architecture supports easy addition of new creative tools

### **Planning and Development Tools**

**Travel Agent** (\*travel)

* **Type**: Complex workflow tool (Execute Workflow Trigger)  
* **Purpose**: Complete travel planning including flights, hotels, activities with email delivery  
* **AI Models**: GPT-4o (location processing), Claude 3.5 (email composition)  
* **External APIs**: SerpAPI (flights/hotels), Tavily (activities), Gmail (delivery)  
* **Authentication**: Multiple OAuth2 integrations

**Capabilities:**

* **Flight Research**: Searches Google Flights via SerpAPI for best options with pricing  
* **Hotel Research**: Searches Google Hotels for accommodations with images, pricing, amenities  
* **Activity Planning**: Uses Tavily API to find relevant activities based on preferences  
* **Location Intelligence**: Converts city names to airport codes automatically  
* **Date Validation**: Ensures travel dates are in the future, not past  
* **Email Delivery**: Creates comprehensive HTML travel itinerary and emails directly

**Required Information (All Mandatory):**

* **Origin**: Departure city/location  
* **Destination**: Arrival city/location  
* **Departure Date**: When to leave  
* **Return Date**: When to return  
* **Number of Travelers**: How many people  
* **Preferred Activities**: Type of experiences desired (e.g., "sightseeing", "adventure", "relaxation")  
* **Email Address**: Where to send the complete travel plan

**Workflow Process:**

1. **Data Processing**: Organizes and validates all input parameters  
2. **Location Conversion**: AI converts cities to airport codes for flight searches  
3. **Date Validation**: Ensures dates are future-focused using current timestamp  
4. **Multi-API Research**: Parallel searches for activities, hotels, and flights  
5. **Email Composition**: Claude 3.5 creates structured HTML email with clickable links  
6. **Email Delivery**: Gmail sends comprehensive travel plan to specified address  
7. **Verification**: Confirms successful completion and email delivery

**Output Structure:**

* **Subject**: Travel dates and destination  
* **Introduction**: Excitement-building opener  
* **Flights Section**: Multiple flight options with airlines, times, prices, features  
* **Hotels Section**: 3+ hotel recommendations with images, pricing, amenities, nearby attractions  
* **Activities Section**: Curated activities with descriptions and clickable links  
* **Professional Signoff**: From "TrueHorizon Travel Team"

**Advanced Features:**

* **Smart Defaults**: Handles missing information intelligently  
* **Visual Content**: Includes hotel images in HTML format  
* **Interactive Elements**: All recommendations include clickable links  
* **Comprehensive Research**: Pulls from multiple data sources for complete planning  
* **Professional Presentation**: Email formatted for easy reading and action

**Error Handling:**

* **Validation Agent**: Verifies successful completion before confirmation  
* **Graceful Failure**: Returns helpful error messages if APIs fail  
* **Required Field Checking**: Ensures all mandatory information is provided

**Usage Scenarios:**

* "Plan a 5-day trip to Tokyo for 2 people, leaving March 15th, interested in culture and food"  
* "Book flights and hotels for business trip to New York, departing next Monday"  
* "Research vacation options for family of 4 to Hawaii, adventure activities preferred"  
* "Create travel itinerary for romantic getaway to Paris, departing Valentine's Day"

**Important Notes:**

* **Email Delivery Only**: Does not make actual bookings, provides research and links  
* **Comprehensive Output**: Single execution creates complete travel plan  
* **Multiple Data Sources**: Combines flights, hotels, and activities in one workflow  
* **Professional Quality**: Output suitable for client-level travel planning

**N8N Developer** (\*develop)

* **Type**: Workflow tool  
* **Purpose**: Create custom n8n automations and workflows  
* **Usage**: \[Detailed breakdown pending\]

## **Command Execution Flow**

1. **J.A.R.V.I.S receives user request**  
2. **J.A.R.V.I.S determines if tools needed**  
3. **If tools needed**: J.A.R.V.I.S creates \*command prompt for OPERATOR  
4. **OPERATOR receives command prompt**  
5. **OPERATOR executes appropriate tools**  
6. **OPERATOR handles interactive clarifications if needed**  
7. **OPERATOR returns results to user**

## **Tool Selection Guidelines**

### **When to use each tool category:**

* **Data Access**: Use Knowledge Base or Contacts Data  
* **Communication**: Use Email Agent or WhatsApp Business  
* **Scheduling**: Use Calendar Agent  
* **Information Gathering**: Use Research Agent  
* **Task Management**: Use Projects Agent  
* **Content Creation**: Use Marketing Team  
* **Trip Planning**: Use Travel Agent  
* **Automation Building**: Use N8N Developer  
* **Calculations**: Use Calculator

## **Specialized Content Systems**

**Glass Fruit ASMR** (\*glassfruit \- Automated System)

* **Type**: Automated content generation workflow (Schedule Trigger)  
* **Purpose**: Automated ASMR video creation and social media distribution  
* **AI Models**: OpenRouter GPT-4.1-mini for idea generation and prompt engineering  
* **Video Generation**: Fal AI Veo3 with 9:16 aspect ratio and audio generation  
* **Social Distribution**: Blotato integration for YouTube, Instagram, and TikTok  
* **Automation**: Runs every 8 hours independently

**System Architecture:**

**Phase 1: Idea Generation**

* **Object Database Management**: Maintains rotating list of 7 recently used glass objects  
* **Idea Agent**: AI selects new unique fruit not in recent history  
* **Novelty Assurance**: Prevents repetition and maintains content freshness  
* **Structured Output**: Generates object name and ASMR caption automatically

**Phase 2: Video Generation**

* **Prompt Agent**: Creates hyper-realistic ASMR video prompts for glass cutting scenes  
* **Cinematic Specifications**: Close-up, photorealistic glass cutting with knife on wooden board  
* **Audio Design**: 4-layer ASMR sound design (knife-glass contact, slicing, thud, clink)  
* **Visual Quality**: 9:16 aspect ratio optimized for mobile and social platforms  
* **Generation Pipeline**: Fal AI Veo3 with 5-minute processing time

**Phase 3: Social Media Distribution**

* **Multi-Platform Publishing**: Simultaneous posting to YouTube, Instagram, TikTok  
* **Blotato Integration**: Professional social media management with platform optimization  
* **Automated Posting**: No manual intervention required for publication  
* **Content Optimization**: Platform-specific formatting and metadata

**Technical Specifications:**

* **Video Format**: 9:16 aspect ratio for mobile optimization  
* **Audio Integration**: Embedded ASMR soundscape generation  
* **Processing Time**: 5-minute video generation with 30-second retry logic  
* **Database Rotation**: Maintains 7-object history to prevent content repetition

**Content Quality Standards:**

* **Hyper-Realistic Visuals**: Photorealistic glass objects with realistic cutting physics  
* **Professional ASMR**: 4-layer sound design with crisp knife-glass contact emphasis  
* **Cinematic Production**: Fixed camera, soft lighting, minimal background aesthetics  
* **Brand Consistency**: Maintains visual and audio standards across all generated content

**Automation Features:**

* **Schedule-Driven**: Operates on 8-hour automated cycles  
* **Self-Managing**: Handles object selection, video creation, and social posting independently  
* **Error Recovery**: Built-in retry logic for failed video generation  
* **Database Maintenance**: Automatically updates object history and prevents duplicates

**Social Media Integration:**

* **YouTube**: Public posting with ASMR-optimized titles and descriptions  
* **Instagram**: Visual-first posting with hashtag optimization  
* **TikTok**: Mobile-optimized vertical video with trend-aware posting  
* **Cross-Platform**: Simultaneous distribution with platform-specific optimization

**Content Strategy:**

* **ASMR Focus**: Specialized in satisfying glass-cutting content for relaxation  
* **Viral Potential**: Designed for high engagement on social media platforms  
* **Consistent Quality**: Maintains professional production standards automatically  
* **Trend Awareness**: Adapts to current ASMR and social media trends

**Usage Context:**

* **Automated Operation**: Runs independently without user intervention  
* **Content Pipeline**: Generates steady stream of ASMR content for social media  
* **Brand Building**: Maintains consistent presence across multiple platforms  
* **Passive Income**: Potential monetization through automated content creation

**Integration Notes:**

* **Independent System**: Operates separately from user-requested tools  
* **Social Media Dependent**: Requires Blotato account and social media connections  
* **Content Database**: Maintains own object rotation system for variety  
* **No User Input**: Fully automated with no manual intervention required

**Advanced Features:**

* **Intelligent Variety**: AI ensures content freshness and prevents repetition  
* **Production Quality**: Broadcast-ready ASMR content with professional audio design  
* **Multi-Platform Strategy**: Optimized distribution across major social platforms  
* **Scalable Content**: Can expand to other object categories beyond glass fruit


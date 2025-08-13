/**
 * Internal Communication Service
 * System for team collaboration, internal comments, mentions, and audit trails
 */

import { centralizedLogging } from './centralizedLogging';
import { bugReportOperations } from './supabase';
import { trackBugReportEvent } from './monitoring';

// Communication types and interfaces
export type CommentType = 'note' | 'status_change' | 'assignment' | 'resolution' | 'escalation' | 'system';
export type CommentVisibility = 'internal' | 'public' | 'team_only';
export type MentionType = 'user' | 'team' | 'role';

// Main comment interface
export interface InternalComment {
  id: string;
  bugReportId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  commentType: CommentType;
  visibility: CommentVisibility;
  isPrivate: boolean;
  isPinned: boolean;
  
  // Rich content
  mentions: CommentMention[];
  attachments: CommentAttachment[];
  formatting: {
    isBold?: boolean;
    isItalic?: boolean;
    hasCodeBlocks?: boolean;
    hasLinks?: boolean;
  };
  
  // Metadata
  createdAt: string;
  updatedAt?: string;
  editHistory: CommentEdit[];
  reactions: CommentReaction[];
  
  // Thread support
  parentCommentId?: string;
  hasReplies: boolean;
  replyCount: number;
  
  // Status and flags
  isEdited: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
  
  metadata?: Record<string, unknown>;
}

// Mention interface
export interface CommentMention {
  id: string;
  type: MentionType;
  targetId: string;
  targetName: string;
  position: { start: number; end: number };
  resolved: boolean;
  notifiedAt?: string;
}

// Attachment interface
export interface CommentAttachment {
  id: string;
  filename: string;
  fileSize: number;
  fileType: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
}

// Edit history
export interface CommentEdit {
  id: string;
  editedBy: string;
  editedAt: string;
  previousContent: string;
  reason?: string;
}

// Reactions
export interface CommentReaction {
  id: string;
  userId: string;
  userName: string;
  emoji: string;
  createdAt: string;
}

// Comment thread
export interface CommentThread {
  id: string;
  bugReportId: string;
  rootCommentId: string;
  participants: ThreadParticipant[];
  comments: InternalComment[];
  lastActivity: string;
  isActive: boolean;
  tags: string[];
  priority: 'low' | 'normal' | 'high';
}

export interface ThreadParticipant {
  userId: string;
  userName: string;
  role: string;
  joinedAt: string;
  isActive: boolean;
  lastReadAt?: string;
}

// Collaboration session
export interface CollaborationSession {
  id: string;
  bugReportId: string;
  sessionType: 'debugging' | 'code_review' | 'discussion' | 'pair_programming';
  participants: SessionParticipant[];
  startedAt: string;
  endedAt?: string;
  isActive: boolean;
  sharedResources: SharedResource[];
  notes: string[];
  outcome?: string;
}

export interface SessionParticipant {
  userId: string;
  userName: string;
  role: string;
  isHost: boolean;
  joinedAt: string;
  leftAt?: string;
  contributionLevel: 'observer' | 'participant' | 'leader';
}

export interface SharedResource {
  id: string;
  type: 'code_snippet' | 'screenshot' | 'document' | 'link';
  title: string;
  content: string;
  url?: string;
  sharedBy: string;
  sharedAt: string;
}

// Audit trail entry
export interface AuditTrailEntry {
  id: string;
  bugReportId: string;
  action: string;
  performedBy: string;
  performedAt: string;
  entityType: 'comment' | 'attachment' | 'mention' | 'thread' | 'session';
  entityId: string;
  changes: Record<string, { from: unknown; to: unknown }>;
  context: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// Search and filter interfaces
export interface CommentSearchCriteria {
  bugId?: string;
  authorId?: string;
  commentType?: CommentType;
  visibility?: CommentVisibility;
  hasAttachments?: boolean;
  hasMentions?: boolean;
  dateRange?: { start: string; end: string };
  textSearch?: string;
  tags?: string[];
  isDeleted?: boolean;
}

export interface CommentSearchResult {
  comments: InternalComment[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
  facets: {
    commentTypes: Record<CommentType, number>;
    authors: Record<string, number>;
    dateDistribution: Record<string, number>;
  };
}

class InternalCommunicationService {
  private static instance: InternalCommunicationService;
  private commentsStorage: Map<string, InternalComment> = new Map();
  private commentsIndex: Map<string, string[]> = new Map(); // bugId -> commentIds
  private threadsStorage: Map<string, CommentThread> = new Map();
  private collaborationSessions: Map<string, CollaborationSession> = new Map();
  private auditTrail: Map<string, AuditTrailEntry[]> = new Map();
  private mentionNotificationQueue: Set<string> = new Set();

  private constructor() {
    this.initializeSystemComments();
  }

  static getInstance(): InternalCommunicationService {
    if (!InternalCommunicationService.instance) {
      InternalCommunicationService.instance = new InternalCommunicationService();
    }
    return InternalCommunicationService.instance;
  }

  /**
   * Add internal comment to bug report
   */
  async addComment(
    bugId: string,
    authorId: string,
    content: string,
    options: {
      commentType?: CommentType;
      visibility?: CommentVisibility;
      isPrivate?: boolean;
      parentCommentId?: string;
      mentions?: Omit<CommentMention, 'id' | 'resolved' | 'notifiedAt'>[];
      attachments?: File[];
      isPinned?: boolean;
    } = {}
  ): Promise<{ success: boolean; commentId?: string; error?: string }> {
    const correlationId = this.generateCorrelationId();

    try {
      centralizedLogging.info(
        'internal-communication',
        'system',
        'Adding internal comment',
        { 
          correlationId, 
          bugId, 
          authorId, 
          commentType: options.commentType,
          contentLength: content.length
        }
      );

      // Validate bug exists
      const { data: bugReport, error: fetchError } = await bugReportOperations.getBugReportById(bugId);
      if (fetchError || !bugReport) {
        throw new Error(`Failed to fetch bug report: ${fetchError?.message || 'Bug not found'}`);
      }

      // Process mentions
      const processedMentions = await this.processMentions(content, options.mentions || []);

      // Process attachments
      const processedAttachments = await this.processAttachments(options.attachments || [], authorId);

      // Create comment
      const comment: InternalComment = {
        id: this.generateCommentId(),
        bugReportId: bugId,
        authorId,
        authorName: await this.getUserName(authorId),
        authorRole: await this.getUserRole(authorId),
        content,
        commentType: options.commentType || 'note',
        visibility: options.visibility || 'internal',
        isPrivate: options.isPrivate || false,
        isPinned: options.isPinned || false,
        mentions: processedMentions,
        attachments: processedAttachments,
        formatting: this.analyzeFormatting(content),
        createdAt: new Date().toISOString(),
        editHistory: [],
        reactions: [],
        parentCommentId: options.parentCommentId,
        hasReplies: false,
        replyCount: 0,
        isEdited: false,
        isDeleted: false,
        metadata: {
          correlationId,
          ipAddress: 'system', // In real implementation, get from request
          userAgent: 'system'
        }
      };

      // Store comment
      this.commentsStorage.set(comment.id, comment);

      // Update bug comments index
      const bugComments = this.commentsIndex.get(bugId) || [];
      bugComments.push(comment.id);
      this.commentsIndex.set(bugId, bugComments);

      // Update parent comment if this is a reply
      if (options.parentCommentId) {
        await this.updateParentCommentReplies(options.parentCommentId);
      }

      // Create or update thread
      await this.updateCommentThread(bugId, comment);

      // Process mentions for notifications
      await this.processMentionNotifications(comment);

      // Record in audit trail
      this.addAuditEntry({
        bugReportId: bugId,
        action: 'comment_added',
        performedBy: authorId,
        entityType: 'comment',
        entityId: comment.id,
        changes: {},
        context: {
          commentType: comment.commentType,
          visibility: comment.visibility,
          mentionCount: processedMentions.length,
          attachmentCount: processedAttachments.length
        }
      });

      // Track event
      trackBugReportEvent('internal_comment_added', {
        bugId,
        commentId: comment.id,
        authorId,
        commentType: comment.commentType,
        visibility: comment.visibility,
        mentionCount: processedMentions.length,
        attachmentCount: processedAttachments.length
      });

      centralizedLogging.info(
        'internal-communication',
        'system',
        'Internal comment added successfully',
        {
          correlationId,
          bugId,
          commentId: comment.id,
          authorId
        }
      );

      return {
        success: true,
        commentId: comment.id
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      centralizedLogging.error(
        'internal-communication',
        'system',
        'Failed to add internal comment',
        { correlationId, bugId, authorId, error: errorMessage }
      );

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Edit existing comment
   */
  async editComment(
    commentId: string,
    editorId: string,
    newContent: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    const correlationId = this.generateCorrelationId();

    try {
      const comment = this.commentsStorage.get(commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }

      if (comment.isDeleted) {
        throw new Error('Cannot edit deleted comment');
      }

      // Check permissions (in real implementation, this would check user permissions)
      if (comment.authorId !== editorId && !await this.canEditComment(editorId, comment)) {
        throw new Error('Insufficient permissions to edit comment');
      }

      // Store edit history
      const editEntry: CommentEdit = {
        id: this.generateEditId(),
        editedBy: editorId,
        editedAt: new Date().toISOString(),
        previousContent: comment.content,
        reason
      };

      // Update comment
      const updatedComment: InternalComment = {
        ...comment,
        content: newContent,
        updatedAt: new Date().toISOString(),
        isEdited: true,
        editHistory: [...comment.editHistory, editEntry],
        mentions: await this.processMentions(newContent, []),
        formatting: this.analyzeFormatting(newContent)
      };

      this.commentsStorage.set(commentId, updatedComment);

      // Record in audit trail
      this.addAuditEntry({
        bugReportId: comment.bugReportId,
        action: 'comment_edited',
        performedBy: editorId,
        entityType: 'comment',
        entityId: commentId,
        changes: {
          content: { from: comment.content, to: newContent }
        },
        context: { reason, editNumber: comment.editHistory.length + 1 }
      });

      centralizedLogging.info(
        'internal-communication',
        'system',
        'Comment edited successfully',
        { correlationId, commentId, editorId }
      );

      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      centralizedLogging.error(
        'internal-communication',
        'system',
        'Failed to edit comment',
        { correlationId, commentId, editorId, error: errorMessage }
      );

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Delete comment (soft delete)
   */
  async deleteComment(
    commentId: string,
    deleterId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    const correlationId = this.generateCorrelationId();

    try {
      const comment = this.commentsStorage.get(commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }

      if (comment.isDeleted) {
        throw new Error('Comment already deleted');
      }

      // Check permissions
      if (comment.authorId !== deleterId && !await this.canDeleteComment(deleterId, comment)) {
        throw new Error('Insufficient permissions to delete comment');
      }

      // Soft delete
      const deletedComment: InternalComment = {
        ...comment,
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: deleterId,
        content: '[Comment deleted]',
        attachments: [], // Remove attachments on deletion
        metadata: {
          ...comment.metadata,
          deletionReason: reason
        }
      };

      this.commentsStorage.set(commentId, deletedComment);

      // Record in audit trail
      this.addAuditEntry({
        bugReportId: comment.bugReportId,
        action: 'comment_deleted',
        performedBy: deleterId,
        entityType: 'comment',
        entityId: commentId,
        changes: {
          isDeleted: { from: false, to: true }
        },
        context: { reason }
      });

      centralizedLogging.info(
        'internal-communication',
        'system',
        'Comment deleted successfully',
        { correlationId, commentId, deleterId }
      );

      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      centralizedLogging.error(
        'internal-communication',
        'system',
        'Failed to delete comment',
        { correlationId, commentId, deleterId, error: errorMessage }
      );

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Add reaction to comment
   */
  async addReaction(
    commentId: string,
    userId: string,
    emoji: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const comment = this.commentsStorage.get(commentId);
      if (!comment || comment.isDeleted) {
        throw new Error('Comment not found');
      }

      // Check if user already reacted with this emoji
      const existingReaction = comment.reactions.find(
        r => r.userId === userId && r.emoji === emoji
      );

      if (existingReaction) {
        // Remove existing reaction
        comment.reactions = comment.reactions.filter(r => r.id !== existingReaction.id);
      } else {
        // Add new reaction
        const reaction: CommentReaction = {
          id: this.generateReactionId(),
          userId,
          userName: await this.getUserName(userId),
          emoji,
          createdAt: new Date().toISOString()
        };
        comment.reactions.push(reaction);
      }

      this.commentsStorage.set(commentId, comment);

      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get comments for a bug report
   */
  getBugComments(
    bugId: string,
    options: {
      includeDeleted?: boolean;
      includeSystem?: boolean;
      visibility?: CommentVisibility;
      sortBy?: 'date_asc' | 'date_desc' | 'type';
      limit?: number;
      offset?: number;
    } = {}
  ): InternalComment[] {
    const commentIds = this.commentsIndex.get(bugId) || [];
    let comments = commentIds
      .map(id => this.commentsStorage.get(id))
      .filter(Boolean) as InternalComment[];

    // Apply filters
    if (!options.includeDeleted) {
      comments = comments.filter(c => !c.isDeleted);
    }

    // Exclude system comments by default
    if (!options.includeSystem) {
      comments = comments.filter(c => c.commentType !== 'system');
    }

    if (options.visibility) {
      comments = comments.filter(c => c.visibility === options.visibility);
    }

    // Sort comments
    switch (options.sortBy) {
      case 'date_asc':
        comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'date_desc':
        comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'type':
        comments.sort((a, b) => a.commentType.localeCompare(b.commentType));
        break;
      default:
        comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    // Apply pagination
    if (options.offset) {
      comments = comments.slice(options.offset);
    }
    if (options.limit) {
      comments = comments.slice(0, options.limit);
    }

    return comments;
  }

  /**
   * Search comments
   */
  searchComments(criteria: CommentSearchCriteria): CommentSearchResult {
    let allComments = Array.from(this.commentsStorage.values());

    // Apply filters
    if (criteria.bugId) {
      const commentIds = this.commentsIndex.get(criteria.bugId) || [];
      allComments = allComments.filter(c => commentIds.includes(c.id));
    }

    if (criteria.authorId) {
      allComments = allComments.filter(c => c.authorId === criteria.authorId);
    }

    if (criteria.commentType) {
      allComments = allComments.filter(c => c.commentType === criteria.commentType);
    }

    if (criteria.visibility) {
      allComments = allComments.filter(c => c.visibility === criteria.visibility);
    }

    if (criteria.hasAttachments !== undefined) {
      allComments = allComments.filter(c => 
        criteria.hasAttachments ? c.attachments.length > 0 : c.attachments.length === 0
      );
    }

    if (criteria.hasMentions !== undefined) {
      allComments = allComments.filter(c => 
        criteria.hasMentions ? c.mentions.length > 0 : c.mentions.length === 0
      );
    }

    if (criteria.isDeleted !== undefined) {
      allComments = allComments.filter(c => c.isDeleted === criteria.isDeleted);
    }

    if (criteria.dateRange) {
      const start = new Date(criteria.dateRange.start);
      const end = new Date(criteria.dateRange.end);
      allComments = allComments.filter(c => {
        const date = new Date(c.createdAt);
        return date >= start && date <= end;
      });
    }

    if (criteria.textSearch) {
      const searchTerm = criteria.textSearch.toLowerCase();
      allComments = allComments.filter(c => 
        c.content.toLowerCase().includes(searchTerm)
      );
    }

    // Calculate facets
    const facets = {
      commentTypes: {} as Record<CommentType, number>,
      authors: {} as Record<string, number>,
      dateDistribution: {} as Record<string, number>
    };

    allComments.forEach(comment => {
      // Comment types
      facets.commentTypes[comment.commentType] = 
        (facets.commentTypes[comment.commentType] || 0) + 1;

      // Authors
      facets.authors[comment.authorName] = 
        (facets.authors[comment.authorName] || 0) + 1;

      // Date distribution (by day)
      const date = comment.createdAt.split('T')[0];
      facets.dateDistribution[date] = 
        (facets.dateDistribution[date] || 0) + 1;
    });

    return {
      comments: allComments,
      totalCount: allComments.length,
      hasMore: false, // In real implementation, this would handle pagination
      facets
    };
  }

  /**
   * Start collaboration session
   */
  async startCollaborationSession(
    bugId: string,
    hostId: string,
    sessionType: CollaborationSession['sessionType'],
    participantIds: string[] = []
  ): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    try {
      const sessionId = this.generateSessionId();
      
      const participants: SessionParticipant[] = [
        {
          userId: hostId,
          userName: await this.getUserName(hostId),
          role: await this.getUserRole(hostId),
          isHost: true,
          joinedAt: new Date().toISOString(),
          contributionLevel: 'leader'
        }
      ];

      // Add other participants
      for (const participantId of participantIds) {
        participants.push({
          userId: participantId,
          userName: await this.getUserName(participantId),
          role: await this.getUserRole(participantId),
          isHost: false,
          joinedAt: new Date().toISOString(),
          contributionLevel: 'participant'
        });
      }

      const session: CollaborationSession = {
        id: sessionId,
        bugReportId: bugId,
        sessionType,
        participants,
        startedAt: new Date().toISOString(),
        isActive: true,
        sharedResources: [],
        notes: []
      };

      this.collaborationSessions.set(sessionId, session);

      // Notify participants
      for (const participant of participants) {
        if (!participant.isHost) {
          // In real implementation, send notification
        }
      }

      trackBugReportEvent('collaboration_session_started', {
        bugId,
        sessionId,
        sessionType,
        hostId,
        participantCount: participants.length
      });

      return {
        success: true,
        sessionId
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get audit trail for bug report
   */
  getAuditTrail(
    bugId: string,
    options: {
      actionTypes?: string[];
      performedBy?: string;
      dateRange?: { start: string; end: string };
      limit?: number;
    } = {}
  ): AuditTrailEntry[] {
    let entries = this.auditTrail.get(bugId) || [];

    // Apply filters
    if (options.actionTypes) {
      entries = entries.filter(e => options.actionTypes!.includes(e.action));
    }

    if (options.performedBy) {
      entries = entries.filter(e => e.performedBy === options.performedBy);
    }

    if (options.dateRange) {
      const start = new Date(options.dateRange.start);
      const end = new Date(options.dateRange.end);
      entries = entries.filter(e => {
        const date = new Date(e.performedAt);
        return date >= start && date <= end;
      });
    }

    // Sort by date (newest first)
    entries.sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());

    // Apply limit
    if (options.limit) {
      entries = entries.slice(0, options.limit);
    }

    return entries;
  }

  // Private helper methods
  private async processMentions(
    content: string,
    explicitMentions: Omit<CommentMention, 'id' | 'resolved' | 'notifiedAt'>[]
  ): Promise<CommentMention[]> {
    const mentions: CommentMention[] = [];
    
    // Process explicit mentions
    explicitMentions.forEach(mention => {
      mentions.push({
        ...mention,
        id: this.generateMentionId(),
        resolved: false
      });
    });

    // Process @mentions in content
    const mentionRegex = /@(\w+)/g;
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      const username = match[1];
      const userId = await this.getUserIdByUsername(username);
      
      if (userId && !mentions.some(m => m.targetId === userId)) {
        mentions.push({
          id: this.generateMentionId(),
          type: 'user',
          targetId: userId,
          targetName: username,
          position: { start: match.index, end: match.index + match[0].length },
          resolved: false
        });
      }
    }

    return mentions;
  }

  private async processAttachments(
    files: File[],
    uploaderId: string
  ): Promise<CommentAttachment[]> {
    const attachments: CommentAttachment[] = [];

    for (const file of files) {
      // In real implementation, this would upload to storage service
      const attachment: CommentAttachment = {
        id: this.generateAttachmentId(),
        filename: file.name,
        fileSize: file.size,
        fileType: file.type,
        url: `uploads/${file.name}`, // Placeholder URL
        uploadedAt: new Date().toISOString(),
        uploadedBy: uploaderId
      };

      attachments.push(attachment);
    }

    return attachments;
  }

  private analyzeFormatting(content: string): InternalComment['formatting'] {
    return {
      isBold: /\*\*.*\*\*/.test(content),
      isItalic: /\*.*\*/.test(content),
      hasCodeBlocks: /```.*```/s.test(content),
      hasLinks: /(https?:\/\/[^\s]+)/.test(content)
    };
  }

  private async updateParentCommentReplies(parentCommentId: string): Promise<void>  {
    const parentComment = this.commentsStorage.get(parentCommentId);
    if (parentComment) {
      const replies = Array.from(this.commentsStorage.values())
        .filter(c => c.parentCommentId === parentCommentId && !c.isDeleted);
      
      parentComment.hasReplies = replies.length > 0;
      parentComment.replyCount = replies.length;
      
      this.commentsStorage.set(parentCommentId, parentComment);
    }
  }

  private async updateCommentThread(bugId: string, comment: InternalComment): Promise<void>  {
    const threadId = comment.parentCommentId ? 
      this.findThreadByComment(comment.parentCommentId) : 
      this.generateThreadId();

    let thread = this.threadsStorage.get(threadId);
    
    if (!thread) {
      thread = {
        id: threadId,
        bugReportId: bugId,
        rootCommentId: comment.parentCommentId || comment.id,
        participants: [],
        comments: [],
        lastActivity: comment.createdAt,
        isActive: true,
        tags: [],
        priority: 'normal'
      };
    }

    // Add participant if not exists
    if (!thread.participants.some(p => p.userId === comment.authorId)) {
      thread.participants.push({
        userId: comment.authorId,
        userName: comment.authorName,
        role: comment.authorRole,
        joinedAt: comment.createdAt,
        isActive: true
      });
    }

    thread.comments.push(comment);
    thread.lastActivity = comment.createdAt;
    
    this.threadsStorage.set(threadId, thread);
  }

  private async processMentionNotifications(comment: InternalComment): Promise<void>  {
    for (const mention of comment.mentions) {
      if (!mention.resolved) {
        // In real implementation, send notification
        mention.notifiedAt = new Date().toISOString();
        mention.resolved = true;
        
        this.mentionNotificationQueue.add(mention.targetId);
      }
    }
  }

  private addAuditEntry(entry: Omit<AuditTrailEntry, 'id' | 'performedAt'>): void {
    const auditEntry: AuditTrailEntry = {
      ...entry,
      id: this.generateAuditId(),
      performedAt: new Date().toISOString()
    };

    const bugAuditTrail = this.auditTrail.get(entry.bugReportId) || [];
    bugAuditTrail.push(auditEntry);
    this.auditTrail.set(entry.bugReportId, bugAuditTrail);

    // Keep only last 1000 entries per bug
    if (bugAuditTrail.length > 1000) {
      bugAuditTrail.splice(0, bugAuditTrail.length - 1000);
    }
  }

  private findThreadByComment(commentId: string): string {
    for (const [threadId, thread] of this.threadsStorage.entries()) {
      if (thread.comments.some(c => c.id === commentId)) {
        return threadId;
      }
    }
    return this.generateThreadId();
  }

  private async canEditComment(userId: string): Promise<boolean>  {
    // In real implementation, check user roles and permissions
    const userRole = await this.getUserRole(userId);
    return ['admin', 'senior_dev'].includes(userRole);
  }

  private async canDeleteComment(userId: string): Promise<boolean>  {
    // In real implementation, check user roles and permissions
    const userRole = await this.getUserRole(userId);
    return ['admin', 'senior_dev'].includes(userRole);
  }

  private async getUserName(userId: string): Promise<string>  {
    // In real implementation, fetch from user service
    const userNames: Record<string, string> = {
      'user_1': 'Alice Johnson',
      'user_2': 'Bob Smith',
      'user_3': 'Carol Davis',
      'system': 'System'
    };
    return userNames[userId] || 'Unknown User';
  }

  private async getUserRole(userId: string): Promise<string>  {
    // In real implementation, fetch from user service
    const userRoles: Record<string, string> = {
      'user_1': 'senior_dev',
      'user_2': 'developer',
      'user_3': 'qa',
      'system': 'system'
    };
    return userRoles[userId] || 'user';
  }

  private async getUserIdByUsername(username: string): Promise<string | null>  {
    // In real implementation, lookup user by username
    const usernameMap: Record<string, string> = {
      'alice': 'user_1',
      'bob': 'user_2',
      'carol': 'user_3'
    };
    return usernameMap[username.toLowerCase()] || null;
  }

  private initializeSystemComments(): void {
    // Initialize any system-level comment templates or configurations
  }

  private generateCorrelationId(): string {
    return `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCommentId(): string {
    return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMentionId(): string {
    return `mention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAttachmentId(): string {
    return `attachment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReactionId(): string {
    return `reaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEditId(): string {
    return `edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateThreadId(): string {
    return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup method
  destroy(): void {
    this.commentsStorage.clear();
    this.commentsIndex.clear();
    this.threadsStorage.clear();
    this.collaborationSessions.clear();
    this.auditTrail.clear();
    this.mentionNotificationQueue.clear();
  }
}

// Export singleton instance
export const internalCommunicationService = InternalCommunicationService.getInstance();

// Export convenience functions
export const addComment = (
  bugId: string,
  authorId: string,
  content: string,
  options?: Parameters<typeof internalCommunicationService.addComment>[3]
) => internalCommunicationService.addComment(bugId, authorId, content, options);

export const editComment = (commentId: string, editorId: string, newContent: string, reason?: string) =>
  internalCommunicationService.editComment(commentId, editorId, newContent, reason);

export const deleteComment = (commentId: string, deleterId: string, reason?: string) =>
  internalCommunicationService.deleteComment(commentId, deleterId, reason);

export const addReaction = (commentId: string, userId: string, emoji: string) =>
  internalCommunicationService.addReaction(commentId, userId, emoji);

export const getBugComments = (bugId: string, options?: Parameters<typeof internalCommunicationService.getBugComments>[1]) =>
  internalCommunicationService.getBugComments(bugId, options);

export const searchComments = (criteria: CommentSearchCriteria) =>
  internalCommunicationService.searchComments(criteria);

export const getAuditTrail = (bugId: string, options?: Parameters<typeof internalCommunicationService.getAuditTrail>[1]) =>
  internalCommunicationService.getAuditTrail(bugId, options);

export default internalCommunicationService;
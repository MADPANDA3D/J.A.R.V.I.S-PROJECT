/**
 * Internal Comments Component
 * Team collaboration interface with threaded discussions, mentions, and rich text support
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, 
  Send, 
  Edit3,
  Trash2,
  Reply,
  Pin,
  PinOff,
  MoreHorizontal,
  Paperclip,
  AtSign,
  Smile,
  Eye,
  EyeOff,
  Clock,
  User,
  Users,
  AlertTriangle,
  CheckCircle,
  History,
  Filter,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  internalCommunicationService,
  type InternalComment,
  type CommentType,
  type CommentVisibility,
  type CommentSearchCriteria
} from '@/lib/internalCommunication';

interface InternalCommentsProps {
  bugId: string;
  currentUserId: string;
  showPrivateComments?: boolean;
  onCommentAdded?: (comment: InternalComment) => void;
}

interface CommentEditorProps {
  bugId: string;
  authorId: string;
  parentCommentId?: string;
  placeholder?: string;
  onSubmit?: (comment: InternalComment) => void;
  onCancel?: () => void;
}

function CommentEditor({
  bugId,
  authorId,
  parentCommentId,
  placeholder = "Add a comment...",
  onSubmit,
  onCancel
}: CommentEditorProps) {
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [commentType, setCommentType] = useState<CommentType>('note');
  const [visibility, setVisibility] = useState<CommentVisibility>('internal');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await internalCommunicationService.addComment(
        bugId,
        authorId,
        content,
        {
          commentType,
          visibility,
          isPrivate,
          parentCommentId,
          attachments
        }
      );

      if (result.success && result.commentId) {
        // Get the created comment for callback
        const comments = internalCommunicationService.getBugComments(bugId);
        const newComment = comments.find(c => c.id === result.commentId);
        
        if (newComment && onSubmit) {
          onSubmit(newComment);
        }

        // Reset form
        setContent('');
        setAttachments([]);
        
        toast({
          title: "Success",
          description: "Comment added successfully"
        });
      } else {
        throw new Error(result.error || 'Failed to add comment');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add comment",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const insertMention = (username: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + `@${username} ` + content.substring(end);
      setContent(newContent);
      
      // Move cursor after mention
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + username.length + 2;
        textarea.focus();
      }, 0);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Comment Type and Visibility Controls */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="comment-type" className="text-sm">Type</Label>
              <Select value={commentType} onValueChange={(value) => setCommentType(value as CommentType)}>
                <SelectTrigger id="comment-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">📝 Note</SelectItem>
                  <SelectItem value="status_change">🔄 Status Change</SelectItem>
                  <SelectItem value="resolution">✅ Resolution</SelectItem>
                  <SelectItem value="escalation">⚠️ Escalation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="visibility" className="text-sm">Visibility</Label>
              <Select value={visibility} onValueChange={(value) => setVisibility(value as CommentVisibility)}>
                <SelectTrigger id="visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">🔒 Internal Only</SelectItem>
                  <SelectItem value="team_only">👥 Team Only</SelectItem>
                  <SelectItem value="public">🌐 Public</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPrivate(!isPrivate)}
                className={isPrivate ? "bg-red-50 border-red-200" : ""}
              >
                {isPrivate ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Comment Content */}
          <div className="space-y-2">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder={placeholder}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="min-h-[100px] resize-y"
              />
              
              {/* Toolbar */}
              <div className="absolute bottom-2 left-2 flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertMention('alice')}
                  className="h-6 w-6 p-0"
                >
                  <AtSign className="h-3 w-3" />
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <Smile className="h-3 w-3" />
                </Button>
                
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileAttachment}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    as="span"
                  >
                    <Paperclip className="h-3 w-3" />
                  </Button>
                </label>
              </div>
            </div>

            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {file.name}
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Supports @mentions and file attachments
            </div>
            
            <div className="flex gap-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting || !content.trim()}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

interface CommentItemProps {
  comment: InternalComment;
  currentUserId: string;
  onReply?: (comment: InternalComment) => void;
  onEdit?: (comment: InternalComment) => void;
  onDelete?: (comment: InternalComment) => void;
  onReaction?: (comment: InternalComment, emoji: string) => void;
  showReplies?: boolean;
}

function CommentItem({
  comment,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  showReplies = true
}: CommentItemProps) => {
  const { toast } = useToast();
  const [showReplyEditor, setShowReplyEditor] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const getCommentTypeIcon = (type: CommentType) => {
    switch (type) => {
      case 'note': return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'status_change': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'resolution': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'escalation': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'assignment': return <User className="h-4 w-4 text-purple-600" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getVisibilityIcon = (visibility: CommentVisibility) => {
    switch (visibility) => {
      case 'internal': return <Eye className="h-3 w-3 text-red-500" />;
      case 'team_only': return <Users className="h-3 w-3 text-yellow-500" />;
      case 'public': return <Eye className="h-3 w-3 text-green-500" />;
    }
  };

  const formatContent = (content: string) => {
    // Simple formatting for mentions
    return content.replace(/@(\w+)/g, '<span class="text-blue-600 font-medium">@$1</span>');
  };

  const handleReaction = async (emoji: string) => {
    try {
      await internalCommunicationService.addReaction(comment.id, currentUserId, emoji);
      if (onReaction) {
        onReaction(comment, emoji);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive"
      });
    }
  };

  const handleEdit = async () => {
    try {
      const result = await internalCommunicationService.editComment(
        comment.id,
        currentUserId,
        editContent
      );
      
      if (result.success) {
        setShowEditDialog(false);
        if (onEdit) {
          onEdit({ ...comment, content: editContent, isEdited: true });
        }
        toast({
          title: "Success",
          description: "Comment updated successfully"
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to edit comment",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    try {
      const result = await internalCommunicationService.deleteComment(
        comment.id,
        currentUserId,
        'Deleted by user'
      );
      
      if (result.success) {
        if (onDelete) {
          onDelete(comment);
        }
        toast({
          title: "Success",
          description: "Comment deleted successfully"
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete comment",
        variant: "destructive"
      });
    }
  };

  if (comment.isDeleted) {
    return (
      <div className="flex gap-3 py-3 opacity-50">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">DEL</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground italic">[Comment deleted]</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-8 w-8">
          <AvatarImage src={`/avatars/${comment.authorId}.jpg`} />
          <AvatarFallback className="text-xs">
            {comment.authorName.charAt(0)}
          </AvatarFallback>
        </Avatar>

        {/* Comment Content */}
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{comment.authorName}</span>
            <Badge variant="outline" className="text-xs px-1">
              {comment.authorRole}
            </Badge>
            {getCommentTypeIcon(comment.commentType)}
            {getVisibilityIcon(comment.visibility)}
            {comment.isPrivate && <EyeOff className="h-3 w-3 text-red-500" />}
            {comment.isPinned && <Pin className="h-3 w-3 text-yellow-500" />}
            <span className="text-muted-foreground">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
            {comment.isEdited && (
              <Badge variant="secondary" className="text-xs">
                <Edit3 className="h-2 w-2 mr-1" />
                edited
              </Badge>
            )}
          </div>

          {/* Content */}
          <div 
            className="text-sm whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: formatContent(comment.content) }}
          />

          {/* Attachments */}
          {comment.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {comment.attachments.map((attachment) => (
                <Badge key={attachment.id} variant="outline" className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  {attachment.filename}
                </Badge>
              ))}
            </div>
          )}

          {/* Reactions */}
          {comment.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {comment.reactions.reduce((acc, reaction) => {
                const existing = acc.find(r => r.emoji === reaction.emoji);
                if (existing) {
                  existing.count++;
                  existing.users.push(reaction.userName);
                } else {
                  acc.push({
                    emoji: reaction.emoji,
                    count: 1,
                    users: [reaction.userName]
                  });
                }
                return acc;
              }, [] as Array<{ emoji: string; count: number; users: string[] }>).map((reactionGroup) => (
                <Button
                  key={reactionGroup.emoji}
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleReaction(reactionGroup.emoji)}
                  title={reactionGroup.users.join(', ')}
                >
                  {reactionGroup.emoji} {reactionGroup.count}
                </Button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 text-xs">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => setShowReplyEditor(!showReplyEditor)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => handleReaction('👍')}
            >
              👍
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => handleReaction('❤️')}
            >
              ❤️
            </Button>

            {(comment.authorId === currentUserId || currentUserId === 'admin') && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    <Edit3 className="h-3 w-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Reply Editor */}
      {showReplyEditor && (
        <div className="ml-11">
          <CommentEditor
            bugId={comment.bugReportId}
            authorId={currentUserId}
            parentCommentId={comment.id}
            placeholder="Reply to this comment..."
            onSubmit={(newComment) => {
              setShowReplyEditor(false);
              if (onReply) {
                onReply(newComment);
              }
            }}
            onCancel={() => setShowReplyEditor(false)}
          />
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Comment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Replies */}
      {showReplies && comment.hasReplies && (
        <div className="ml-11 space-y-3 border-l pl-3">
          {/* In a real implementation, this would load and display replies */}
          <p className="text-xs text-muted-foreground">
            {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
          </p>
        </div>
      )}
    </div>
  );
}

export function InternalComments({
  bugId,
  currentUserId,
  showPrivateComments = false,
  onCommentAdded
}: InternalCommentsProps) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<InternalComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<CommentType | 'all'>('all');
  const [filterVisibility, setFilterVisibility] = useState<CommentVisibility | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadComments();
  }, [bugId, showPrivateComments]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const loadedComments = internalCommunicationService.getBugComments(bugId, {
        includeDeleted: false,
        sortBy: 'date_asc'
      });
      
      // Filter out private comments if user doesn't have access
      const filteredComments = showPrivateComments 
        ? loadedComments 
        : loadedComments.filter(c => !c.isPrivate);
      
      setComments(filteredComments);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = (newComment: InternalComment) => {
    setComments(prev => [...prev, newComment]);
    if (onCommentAdded) {
      onCommentAdded(newComment);
    }
  };

  const handleCommentUpdated = (updatedComment: InternalComment) => {
    setComments(prev =>
      prev.map(c => c.id === updatedComment.id ? updatedComment : c)
    );
  };

  const handleCommentDeleted = (deletedComment: InternalComment) => {
    setComments(prev =>
      prev.map(c => c.id === deletedComment.id ? { ...c, isDeleted: true } : c)
    );
  };

  const filteredComments = comments.filter(comment => {
    // Text search
    if (searchTerm && !comment.content.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Type filter
    if (filterType !== 'all' && comment.commentType !== filterType) {
      return false;
    }

    // Visibility filter
    if (filterVisibility !== 'all' && comment.visibility !== filterVisibility) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
            Loading comments...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Internal Discussion ({comments.length})
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search" className="text-sm">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search comments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="type-filter" className="text-sm">Type</Label>
                  <Select value={filterType} onValueChange={(value) => setFilterType(value as CommentType | 'all')}>
                    <SelectTrigger id="type-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="note">Notes</SelectItem>
                      <SelectItem value="status_change">Status Changes</SelectItem>
                      <SelectItem value="resolution">Resolutions</SelectItem>
                      <SelectItem value="escalation">Escalations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="visibility-filter" className="text-sm">Visibility</Label>
                  <Select value={filterVisibility} onValueChange={(value) => setFilterVisibility(value as CommentVisibility | 'all')}>
                    <SelectTrigger id="visibility-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Visibility</SelectItem>
                      <SelectItem value="internal">Internal Only</SelectItem>
                      <SelectItem value="team_only">Team Only</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Comment Editor */}
      <CommentEditor
        bugId={bugId}
        authorId={currentUserId}
        onSubmit={handleCommentAdded}
      />

      {/* Comments List */}
      <Card>
        <CardContent className="p-0">
          {filteredComments.length > 0 ? (
            <ScrollArea className="h-[600px]">
              <div className="p-4 space-y-4">
                {filteredComments.map((comment, index) => (
                  <div key={comment.id}>
                    <CommentItem
                      comment={comment}
                      currentUserId={currentUserId}
                      onReply={handleCommentAdded}
                      onEdit={handleCommentUpdated}
                      onDelete={handleCommentDeleted}
                    />
                    {index < filteredComments.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No comments yet</h3>
              <p className="text-muted-foreground mb-4">
                Start a discussion about this bug report with your team.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default InternalComments;
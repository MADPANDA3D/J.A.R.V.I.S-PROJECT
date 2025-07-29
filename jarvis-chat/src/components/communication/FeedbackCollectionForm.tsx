/**
 * Feedback Collection Form Component
 * Interactive form for collecting user feedback on bug resolution and satisfaction
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock,
  Send,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  feedbackCollectionService,
  type BugFeedback,
  type FeedbackType,
  type FeedbackFormTemplate,
  type SatisfactionRating
} from '@/lib/feedbackCollection';

interface FeedbackCollectionFormProps {
  feedbackId: string;
  onSubmissionComplete?: (success: boolean) => void;
  onCancel?: () => void;
}

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  readonly?: boolean;
  label?: string;
}

function StarRating({ rating, onRatingChange, readonly = false, label }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex flex-col gap-2">
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            onClick={() => !readonly && onRatingChange(star)}
          >
            <Star
              className={`h-6 w-6 ${
                star <= (hoverRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">
        {rating > 0 && (
          <span>
            {rating === 1 && 'Very Dissatisfied'}
            {rating === 2 && 'Dissatisfied'}
            {rating === 3 && 'Neutral'}
            {rating === 4 && 'Satisfied'}
            {rating === 5 && 'Very Satisfied'}
          </span>
        )}
      </div>
    </div>
  );
}

export function FeedbackCollectionForm({
  feedbackId,
  onSubmissionComplete,
  onCancel
}: FeedbackCollectionFormProps) => {
  const { toast } = useToast();
  
  const [feedback, setFeedback] = useState<BugFeedback | null>(null);
  const [template, setTemplate] = useState<FeedbackFormTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeedbackData();
  }, [feedbackId]);

  const loadFeedbackData = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, this would fetch from an API
      // For now, we'll get it from the service directly
      const allFeedback = Array.from((feedbackCollectionService as any).feedbackStorage.values());
      const feedbackData = allFeedback.find((f: BugFeedback) => f.id === feedbackId);
      
      if (!feedbackData) => {
        throw new Error('Feedback request not found');
      }

      if (feedbackData.status !== 'pending') => {
        throw new Error(`Feedback request is ${feedbackData.status}`);
      }

      const templateData = feedbackCollectionService.getFormTemplate(feedbackData.feedbackType);
      if (!templateData) => {
        throw new Error('Form template not found');
      }

      setFeedback(feedbackData);
      setTemplate(templateData);
      
      // Initialize form data with default values
      const initialData: Record<string, unknown> = {};
      templateData.fields.forEach(field => {
        if (field.type === 'rating') => {
          initialData[field.id] = 0;
        } else if (field.type === 'boolean') => {
          initialData[field.id] = false;
        } else {
          initialData[field.id] = '';
        }
      });
      setFormData(initialData);

    } catch (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load feedback form",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!template) return false;

    const errors: Record<string, string> = {};
    
    template.fields.forEach(field => {
      const value = formData[field.id];
      
      // Check required fields
      if (field.required) => {
        if (value === undefined || value === null || value === '' || 
            (field.type === 'rating' && value === 0)) => {
          errors[field.id] = `${field.label} is required`;
          return;
        }
      }

      // Check field validation
      if (value && field.validation) => {
        const validation = field.validation;
        
        if (typeof value === 'string') => {
          if (validation.minLength && value.length < validation.minLength) => {
            errors[field.id] = `${field.label} must be at least ${validation.minLength} characters`;
          }
          if (validation.maxLength && value.length > validation.maxLength) => {
            errors[field.id] = `${field.label} must not exceed ${validation.maxLength} characters`;
          }
          if (validation.pattern && !new RegExp(validation.pattern).test(value)) => {
            errors[field.id] = `${field.label} format is invalid`;
          }
        }
      }

      // Check conditional visibility
      if (field.conditional) => {
        const dependentValue = formData[field.conditional.dependsOn];
        if (dependentValue !== field.conditional.showWhen) => {
          // Field is hidden, remove any validation errors
          delete errors[field.id];
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) => {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert form data to feedback format
      const feedbackData: Partial<BugFeedback> = {};
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') => {
          (feedbackData as any)[key] = value;
        }
      });

      const result = await feedbackCollectionService.submitFeedback(feedbackId, feedbackData);
      
      if (result.success) => {
        toast({
          title: "Thank you!",
          description: template?.thankyouMessage || "Your feedback has been submitted successfully",
        });
        
        if (onSubmissionComplete) => {
          onSubmissionComplete(true);
        }
      } else {
        throw new Error(result.error || 'Submission failed');
      }
      
    } catch (error) => {
      toast({
        title: "Submission Error",
        description: error instanceof Error ? error.message : "Failed to submit feedback",
        variant: "destructive"
      });
      
      if (onSubmissionComplete) => {
        onSubmissionComplete(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) => {
      onCancel();
    }
  };

  const updateFormData = (fieldId: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[fieldId]) => {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const renderField = (field: FeedbackFormTemplate['fields'][0]) => {
    const value = formData[field.id];
    const error = validationErrors[field.id];
    const isVisible = !field.conditional || 
      formData[field.conditional.dependsOn] === field.conditional.showWhen;

    if (!isVisible) return null;

    switch (field.type) => {
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className={field.required ? "required" : ""}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              placeholder={field.placeholder}
              value={value as string || ''}
              onChange={(e) => updateFormData(field.id, e.target.value)}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className={field.required ? "required" : ""}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={value as string || ''}
              onChange={(e) => updateFormData(field.id, e.target.value)}
              className={error ? "border-red-500" : ""}
              rows={4}
            />
            {field.validation?.maxLength && (
              <p className="text-xs text-muted-foreground text-right">
                {(value as string || '').length} / {field.validation.maxLength}
              </p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'rating':
        return (
          <div key={field.id} className="space-y-2">
            <StarRating
              label={`${field.label}${field.required ? ' *' : ''}`}
              rating={value as number || 0}
              onRatingChange={(rating) => updateFormData(field.id, rating)}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'boolean':
        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.id}
                checked={value as boolean || false}
                onCheckedChange={(checked) => updateFormData(field.id, checked)}
              />
              <Label htmlFor={field.id} className="flex items-center gap-2">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value as string || ''}
              onValueChange={(selectedValue) => updateFormData(field.id, selectedValue)}
            >
              <SelectTrigger id={field.id} className={error ? "border-red-500" : ""}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  const getFeedbackTypeIcon = (type: FeedbackType) => {
    switch (type) => {
      case 'resolution_verification':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'satisfaction_rating':
        return <Star className="h-5 w-5 text-yellow-600" />;
      case 'additional_info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-600" />;
    }
  };

  const getFeedbackTypeColor = (type: FeedbackType) => {
    switch (type) => {
      case 'resolution_verification':
        return 'bg-green-100 text-green-800';
      case 'satisfaction_rating':
        return 'bg-yellow-100 text-yellow-800';
      case 'additional_info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) => {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
            Loading feedback form...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!feedback || !template) => {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Unable to load feedback form. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Check if feedback has expired
  const isExpired = new Date() > new Date(feedback.expiresAt);
  if (isExpired) => {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              This feedback request has expired. Please contact support if you still need to provide feedback.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            {getFeedbackTypeIcon(feedback.feedbackType)}
            {template.title}
          </CardTitle>
          <Badge className={getFeedbackTypeColor(feedback.feedbackType)}>
            {feedback.feedbackType.replace('_', ' ')}
          </Badge>
        </div>
        {template.description && (
          <p className="text-muted-foreground">{template.description}</p>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Progress indicator for multi-step forms */}
          {template.fields.length > 3 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round((Object.keys(formData).filter(key => formData[key]).length / template.fields.length) * 100)}%</span>
              </div>
              <Progress value={(Object.keys(formData).filter(key => formData[key]).length / template.fields.length) * 100} />
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {template.fields.map(renderField)}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-32"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {template.submitButtonText}
                </>
              )}
            </Button>
          </div>

          {/* Expiration Notice */}
          <div className="text-xs text-muted-foreground text-center">
            This feedback request expires on {new Date(feedback.expiresAt).toLocaleDateString()} at {new Date(feedback.expiresAt).toLocaleTimeString()}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Feedback Preview Component (for displaying submitted feedback)
interface FeedbackPreviewProps {
  feedback: BugFeedback;
  showMetadata?: boolean;
}

export function FeedbackPreview({ feedback, showMetadata = false }: FeedbackPreviewProps) => {
  const getStatusIcon = (status: BugFeedback['status']) => {
    switch (status) => {
      case 'submitted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: BugFeedback['status']) => {
    switch (status) => {
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getFeedbackTypeIcon(feedback.feedbackType)}
            {feedback.feedbackType.replace('_', ' ')}
          </CardTitle>
          <Badge className={getStatusColor(feedback.status)}>
            {getStatusIcon(feedback.status)}
            {feedback.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Resolution Verification */}
        {feedback.feedbackType === 'resolution_verification' && feedback.status === 'submitted' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {feedback.isResolved ? (
                <ThumbsUp className="h-4 w-4 text-green-600" />
              ) : (
                <ThumbsDown className="h-4 w-4 text-red-600" />
              )}
              <span className="font-medium">
                {feedback.isResolved ? 'Issue resolved' : 'Issue not resolved'}
              </span>
            </div>
            {feedback.verificationNotes && (
              <div>
                <Label className="text-sm font-medium">Notes:</Label>
                <p className="text-sm text-muted-foreground mt-1">{feedback.verificationNotes}</p>
              </div>
            )}
            {feedback.additionalIssues && (
              <div>
                <Label className="text-sm font-medium">Additional Issues:</Label>
                <p className="text-sm text-muted-foreground mt-1">{feedback.additionalIssues}</p>
              </div>
            )}
          </div>
        )}

        {/* Satisfaction Rating */}
        {feedback.feedbackType === 'satisfaction_rating' && feedback.status === 'submitted' && (
          <div className="space-y-3">
            {feedback.satisfactionRating && (
              <div>
                <Label className="text-sm font-medium">Overall Satisfaction:</Label>
                <StarRating rating={feedback.satisfactionRating} onRatingChange={() {}} readonly />
              </div>
            )}
            {feedback.resolutionQuality && (
              <div>
                <Label className="text-sm font-medium">Resolution Quality:</Label>
                <StarRating rating={feedback.resolutionQuality} onRatingChange={() {}} readonly />
              </div>
            )}
            {feedback.responseTime && (
              <div>
                <Label className="text-sm font-medium">Response Time:</Label>
                <StarRating rating={feedback.responseTime} onRatingChange={() {}} readonly />
              </div>
            )}
            {feedback.improvementSuggestions && (
              <div>
                <Label className="text-sm font-medium">Suggestions for Improvement:</Label>
                <p className="text-sm text-muted-foreground mt-1">{feedback.improvementSuggestions}</p>
              </div>
            )}
          </div>
        )}

        {/* Additional Information */}
        {feedback.feedbackType === 'additional_info' && feedback.status === 'submitted' && (
          <div className="space-y-2">
            {feedback.additionalDescription && (
              <div>
                <Label className="text-sm font-medium">Additional Description:</Label>
                <p className="text-sm text-muted-foreground mt-1">{feedback.additionalDescription}</p>
              </div>
            )}
            {feedback.newReproductionSteps && (
              <div>
                <Label className="text-sm font-medium">Updated Reproduction Steps:</Label>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{feedback.newReproductionSteps}</p>
              </div>
            )}
            {feedback.environmentChanges && (
              <div>
                <Label className="text-sm font-medium">Environment Changes:</Label>
                <p className="text-sm text-muted-foreground mt-1">{feedback.environmentChanges}</p>
              </div>
            )}
          </div>
        )}

        {/* Metadata */}
        {showMetadata && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <Label className="text-xs font-medium">Requested:</Label>
                <p>{new Date(feedback.requestedAt).toLocaleString()}</p>
              </div>
              {feedback.submittedAt && (
                <div>
                  <Label className="text-xs font-medium">Submitted:</Label>
                  <p>{new Date(feedback.submittedAt).toLocaleString()}</p>
                </div>
              )}
              <div>
                <Label className="text-xs font-medium">Expires:</Label>
                <p>{new Date(feedback.expiresAt).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-xs font-medium">Reminders Sent:</Label>
                <p>{feedback.remindersSent}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FeedbackCollectionForm;
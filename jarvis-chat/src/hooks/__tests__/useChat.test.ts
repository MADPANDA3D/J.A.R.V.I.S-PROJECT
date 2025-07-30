import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from '../useChat';
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/lib/chatService';
import type { AuthContextType } from '@/types/auth';

// Mock dependencies
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/chatService', () => ({
  chatService: {
    loadMessageHistory: vi.fn(),
    subscribeToMessages: vi.fn(),
    processChatMessage: vi.fn(),
  },
}));

const mockUseAuth = vi.mocked(useAuth);
const mockChatService = vi.mocked(chatService);

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
};

describe('useChat', () {
  beforeEach(() {
    vi.clearAllMocks();

    // Default auth state
    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      loading: false,
      initialized: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
    } as AuthContextType);
  });

  it('should initialize with empty state', () {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      initialized: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
    } as AuthContextType);

    const { result } = renderHook(() => useChat());

    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isLoadingHistory).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should load message history when user logs in', async () {
    const mockHistory = [
      {
        id: '1',
        content: 'Hello',
        role: 'user' as const,
        timestamp: new Date(),
        status: 'sent' as const,
        user_id: mockUser.id,
      },
    ];

    mockChatService.loadMessageHistory.mockResolvedValue(mockHistory);
    mockChatService.subscribeToMessages.mockReturnValue(() {});

    const { result } = renderHook(() => useChat());

    await waitFor(() {
      expect(result.current.isLoadingHistory).toBe(false);
    });

    expect(mockChatService.loadMessageHistory).toHaveBeenCalledWith(
      mockUser.id
    );
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('Hello');
  });

  it('should handle send message successfully', async () {
    const mockUserMsg = {
      id: '1',
      content: 'Hello',
      role: 'user' as const,
      timestamp: new Date(),
      status: 'sent' as const,
      user_id: mockUser.id,
    };

    const mockAiMsg = {
      id: '2',
      content: 'Hi there!',
      role: 'assistant' as const,
      timestamp: new Date(),
      status: 'sent' as const,
      user_id: mockUser.id,
    };

    mockChatService.loadMessageHistory.mockResolvedValue([]);
    mockChatService.subscribeToMessages.mockReturnValue(() {});
    mockChatService.processChatMessage.mockResolvedValue({
      userMsg: mockUserMsg,
      aiMsg: mockAiMsg,
    });

    const { result } = renderHook(() => useChat());

    await act(async () {
      await result.current.sendMessage('Hello');
    });

    expect(mockChatService.processChatMessage).toHaveBeenCalledWith(
      'Hello',
      mockUser.id
    );
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].content).toBe('Hello');
    expect(result.current.messages[1].content).toBe('Hi there!');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle send message error', async () {
    mockChatService.loadMessageHistory.mockResolvedValue([]);
    mockChatService.subscribeToMessages.mockReturnValue(() {});
    mockChatService.processChatMessage.mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useChat());

    await act(async () {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.isLoading).toBe(false);

    // Should have temp user message with error status and error AI message
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].status).toBe('error');
    expect(result.current.messages[1].role).toBe('assistant');
    expect(result.current.messages[1].status).toBe('error');
  });

  it('should not send empty messages', async () {
    mockChatService.loadMessageHistory.mockResolvedValue([]);
    mockChatService.subscribeToMessages.mockReturnValue(() {});

    const { result } = renderHook(() => useChat());

    await act(async () {
      await result.current.sendMessage('   ');
    });

    expect(mockChatService.processChatMessage).not.toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(0);
  });

  it('should clear messages', () {
    mockChatService.loadMessageHistory.mockResolvedValue([]);
    mockChatService.subscribeToMessages.mockReturnValue(() {});

    const { result } = renderHook(() => useChat());

    act(() {
      result.current.clearMessages();
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should clear error', () {
    mockChatService.loadMessageHistory.mockResolvedValue([]);
    mockChatService.subscribeToMessages.mockReturnValue(() {});

    const { result } = renderHook(() => useChat());

    act(() {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});

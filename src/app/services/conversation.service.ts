import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AiResponse, ChatMessage, FeedbackType } from '../models/chat.models';
import { SafeStorageService } from './safe-storage.service';

interface FeedbackCounts {
  helpful: number;
  notHelpful: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private readonly messagesKey = 'skyassist.messages';
  private readonly feedbackCountsKey = 'skyassist.feedback-counts';

  constructor(private readonly safeStorageService: SafeStorageService) {}

  private readonly messagesSubject = new BehaviorSubject<ChatMessage[]>(
    this.readMessagesFromStorage()
  );

  private readonly feedbackCountsSubject = new BehaviorSubject<FeedbackCounts>(
    this.readFeedbackCountsFromStorage()
  );

  get messages$(): Observable<ChatMessage[]> {
    return this.messagesSubject.asObservable();
  }

  get feedbackCounts$(): Observable<FeedbackCounts> {
    return this.feedbackCountsSubject.asObservable();
  }

  addQuestionAndAnswer(question: string, response: AiResponse): void {
    const now = new Date().toISOString();
    const questionMessage: ChatMessage = {
      id: this.createId('q'),
      role: 'agent',
      text: question.trim(),
      timestamp: now
    };

    const answerMessage: ChatMessage = {
      id: this.createId('a'),
      role: 'assistant',
      text: response.answer,
      response,
      timestamp: now
    };

    const updated = [...this.messagesSubject.value, questionMessage, answerMessage];
    this.messagesSubject.next(updated);
    this.persistMessages(updated);
  }

  clearConversation(): void {
    this.messagesSubject.next([]);
    this.safeStorageService.removeItem(this.messagesKey, 'session');
    this.safeStorageService.removeItem(this.messagesKey, 'local');
  }

  submitFeedback(messageId: string, feedback: FeedbackType): boolean {
    const currentMessages = this.messagesSubject.value;
    const index = currentMessages.findIndex(
      (message) => message.id === messageId && message.role === 'assistant'
    );

    if (index < 0 || currentMessages[index].feedback) {
      return false;
    }

    const updatedMessages = [...currentMessages];
    updatedMessages[index] = {
      ...updatedMessages[index],
      feedback
    };

    this.messagesSubject.next(updatedMessages);
    this.persistMessages(updatedMessages);

    const currentCounts = this.feedbackCountsSubject.value;
    const updatedCounts: FeedbackCounts = {
      helpful: currentCounts.helpful + (feedback === 'helpful' ? 1 : 0),
      notHelpful: currentCounts.notHelpful + (feedback === 'not-helpful' ? 1 : 0)
    };

    this.feedbackCountsSubject.next(updatedCounts);
    const serializedCounts = JSON.stringify(updatedCounts);
    const savedInSession = this.safeStorageService.setItem(
      this.feedbackCountsKey,
      serializedCounts,
      'session'
    );

    if (!savedInSession) {
      this.safeStorageService.setItem(this.feedbackCountsKey, serializedCounts, 'local');
    }

    return true;
  }

  getRecentQuestions(limit = 5): string[] {
    return this.messagesSubject.value
      .filter((message) => message.role === 'agent')
      .map((message) => message.text)
      .slice(-limit)
      .reverse();
  }

  private createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  private readMessagesFromStorage(): ChatMessage[] {
    const raw = this.readWithFallback(this.messagesKey);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as ChatMessage[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private persistMessages(messages: ChatMessage[]): void {
    const serialized = JSON.stringify(messages);
    const savedInSession = this.safeStorageService.setItem(this.messagesKey, serialized, 'session');
    if (!savedInSession) {
      this.safeStorageService.setItem(this.messagesKey, serialized, 'local');
    }
  }

  private readFeedbackCountsFromStorage(): FeedbackCounts {
    const raw = this.readWithFallback(this.feedbackCountsKey);
    if (!raw) {
      return { helpful: 0, notHelpful: 0 };
    }

    try {
      const parsed = JSON.parse(raw) as FeedbackCounts;
      return {
        helpful: Number(parsed.helpful) || 0,
        notHelpful: Number(parsed.notHelpful) || 0
      };
    } catch {
      return { helpful: 0, notHelpful: 0 };
    }
  }

  private readWithFallback(key: string): string | null {
    const sessionValue = this.safeStorageService.getItem(key, 'session');
    if (sessionValue) {
      return sessionValue;
    }

    return this.safeStorageService.getItem(key, 'local');
  }
}

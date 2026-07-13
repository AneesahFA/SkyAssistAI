import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatMessage, FeedbackType } from '../../models/chat.models';
import { ConversationService } from '../../services/conversation.service';
import { MockAiService } from '../../services/mock-ai.service';

interface SourcePreview {
  title: string;
  summary: string;
  highlights: string[];
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  question = '';
  isLoading = false;
  errorMessage = '';
  messages: ChatMessage[] = [];
  confirmationByMessageId: Record<string, string> = {};
  activeSourceName = '';
  activeSourcePreview: SourcePreview | null = null;

  // Replace this static map with backend document chunk retrieval in production (Azure AI Search + Blob).
  private readonly sourcePreviews: Record<string, SourcePreview> = {
    'Baggage Policy.pdf': {
      title: 'Baggage Policy.pdf',
      summary:
        'Defines standard carry-on and checked baggage rules, including personal item limits and gate-check guidance.',
      highlights: [
        'One carry-on and one personal item are generally allowed per passenger.',
        'Carry-on items must meet overhead bin and size requirements.',
        'Oversized cabin bags can be checked at the gate when needed.'
      ]
    },
    'Dangerous Goods Manual.pdf': {
      title: 'Dangerous Goods Manual.pdf',
      summary:
        'Lists restricted and approved battery transport conditions for cabin and checked baggage.',
      highlights: [
        'Spare lithium batteries and power banks must remain in carry-on baggage.',
        'Damaged batteries are prohibited from transport.',
        'Battery watt-hour limits apply by airline policy.'
      ]
    },
    'Refund Guidelines.pdf': {
      title: 'Refund Guidelines.pdf',
      summary:
        'Explains eligibility checks, verification steps, and expected payment reversal timelines.',
      highlights: [
        'Eligible card refunds are typically completed within 7 business days.',
        'Ticket validation is required before processing begins.',
        'Payment providers can introduce additional delays.'
      ]
    },
    'Fare Rules.pdf': {
      title: 'Fare Rules.pdf',
      summary:
        'Describes fare family restrictions and upgrade eligibility across booking classes.',
      highlights: [
        'Basic Economy upgrade restrictions depend on fare conditions.',
        'Eligible upgrades may be offered before check-in if inventory is available.',
        'Post check-in restrictions are stricter for discounted fares.'
      ]
    },
    'Irregular Operations Manual.pdf': {
      title: 'Irregular Operations Manual.pdf',
      summary:
        'Outlines operational handling for delays, disruptions, and rebooking workflows.',
      highlights: [
        'Passengers should monitor official flight status channels for updates.',
        'Rebooking may be offered based on delay duration and root cause.',
        'Agents should follow disruption escalation playbooks.'
      ]
    },
    'Customer Service Manual.pdf': {
      title: 'Customer Service Manual.pdf',
      summary:
        'Defines re-accommodation standards for missed connections and customer recovery steps.',
      highlights: [
        'Airline-controlled missed connections require rebooking support.',
        'Accommodations vary by disruption type and policy rules.',
        'Customer communication should include itinerary and entitlement details.'
      ]
    },
    'Pet Travel Policy.pdf': {
      title: 'Pet Travel Policy.pdf',
      summary:
        'Covers in-cabin pet eligibility, service animal acceptance, and documentation requirements.',
      highlights: [
        'Small pets may travel in-cabin in approved carriers.',
        'Service animals are handled under accessibility regulations.',
        'Fees and route restrictions may apply.'
      ]
    },
    'Ticketing Policy.pdf': {
      title: 'Ticketing Policy.pdf',
      summary:
        'Clarifies permissible name corrections and non-transferability boundaries.',
      highlights: [
        'Minor spelling corrections can be processed after identity checks.',
        'Ownership-transfer name changes are typically not allowed.',
        'Correction windows close near departure time.'
      ]
    },
    'International Travel Guide.pdf': {
      title: 'International Travel Guide.pdf',
      summary:
        'Summarizes passenger obligations for passports, visas, and destination entry rules.',
      highlights: [
        'Travelers are responsible for valid passports and visas.',
        'Entry requirements differ by destination and nationality.',
        'Pre-travel verification is required to avoid denied boarding.'
      ]
    },
    'Supervisor Escalation SOP.pdf': {
      title: 'Supervisor Escalation SOP.pdf',
      summary:
        'Provides fallback escalation steps when no policy match is available.',
      highlights: [
        'Escalate unresolved policy questions to an operations supervisor.',
        'Capture customer context before escalation.',
        'Document final disposition for quality review.'
      ]
    }
  };

  private readonly subscription = new Subscription();

  constructor(
    private readonly mockAiService: MockAiService,
    private readonly conversationService: ConversationService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.conversationService.messages$.subscribe((messages) => {
        this.messages = messages;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  submitQuestion(): void {
    this.errorMessage = '';
    const trimmedQuestion = this.question.trim();

    if (!trimmedQuestion) {
      this.errorMessage = 'Please enter a question before submitting.';
      return;
    }

    this.isLoading = true;

    // In production, this call would be replaced by a backend API (Spring Boot) orchestrating Azure OpenAI.
    this.subscription.add(
      this.mockAiService.askQuestion(trimmedQuestion).subscribe({
        next: (response) => {
          this.conversationService.addQuestionAndAnswer(trimmedQuestion, response);
          this.question = '';
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage =
            'The simulated assistant is temporarily unavailable. Please try again.';
          this.isLoading = false;
        }
      })
    );
  }

  onEnterSubmit(event: Event): void {
    event.preventDefault();
    if (!this.isLoading) {
      this.submitQuestion();
    }
  }

  clearConversation(): void {
    this.conversationService.clearConversation();
    this.confirmationByMessageId = {};
    this.errorMessage = '';
    this.closeSourcePreview();
  }

  openSourcePreview(sourceName: string): void {
    this.activeSourceName = sourceName;
    this.activeSourcePreview =
      this.sourcePreviews[sourceName] || {
        title: sourceName,
        summary:
          'No preview snippet is configured for this document in the academic prototype.',
        highlights: ['Add a preview snippet map entry to enrich this source.']
      };
  }

  closeSourcePreview(): void {
    this.activeSourceName = '';
    this.activeSourcePreview = null;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.activeSourcePreview) {
      this.closeSourcePreview();
    }
  }

  submitFeedback(message: ChatMessage, feedback: FeedbackType): void {
    if (message.role !== 'assistant') {
      return;
    }

    const wasAccepted = this.conversationService.submitFeedback(message.id, feedback);
    if (!wasAccepted) {
      this.confirmationByMessageId[message.id] = 'Feedback already submitted for this response.';
      return;
    }

    this.confirmationByMessageId[message.id] =
      feedback === 'helpful'
        ? 'Thank you. Marked as helpful.'
        : 'Thank you. Marked as not helpful.';
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }
}

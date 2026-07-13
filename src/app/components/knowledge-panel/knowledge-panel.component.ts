import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConversationService } from '../../services/conversation.service';

@Component({
  selector: 'app-knowledge-panel',
  templateUrl: './knowledge-panel.component.html',
  styleUrls: ['./knowledge-panel.component.scss']
})
export class KnowledgePanelComponent implements OnInit, OnDestroy {
  policyDocuments = [
    'Baggage Policy.pdf',
    'Refund Guidelines.pdf',
    'Fare Rules.pdf',
    'Irregular Operations Manual.pdf',
    'Pet Travel Policy.pdf',
    'Dangerous Goods Manual.pdf',
    'Customer Service Manual.pdf',
    'Ticketing Policy.pdf',
    'International Travel Guide.pdf',
    'Airport Operations Bulletin.pdf',
    'Passenger Rights Handbook.pdf'
  ];

  recentQuestions: string[] = [];
  helpfulCount = 0;
  notHelpfulCount = 0;

  private readonly subscription = new Subscription();

  constructor(private readonly conversationService: ConversationService) {}

  ngOnInit(): void {
    this.refreshRecentQuestions();

    this.subscription.add(
      this.conversationService.messages$.subscribe(() => {
        this.refreshRecentQuestions();
      })
    );

    this.subscription.add(
      this.conversationService.feedbackCounts$.subscribe((counts) => {
        this.helpfulCount = counts.helpful;
        this.notHelpfulCount = counts.notHelpful;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private refreshRecentQuestions(): void {
    this.recentQuestions = this.conversationService.getRecentQuestions(5);
  }
}

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AiResponse } from '../models/chat.models';

interface KnowledgeEntry {
  keywords: string[];
  answer: string;
  sources: string[];
  confidence: number;
}

@Injectable({
  providedIn: 'root'
})
export class MockAiService {
  private readonly simulatedDelayMs = 1100;

  private readonly disclaimer =
    'Prototype disclaimer: this response is generated from simulated policy data for academic demonstration only.';

  // Replace this static knowledge array with Azure AI Search + indexed policy documents in production.
  private readonly knowledgeBase: KnowledgeEntry[] = [
    {
      keywords: ['carry on', 'carry-on', 'cabin bag', 'hand luggage', 'personal item'],
      answer:
        'Passengers may bring one carry-on bag and one personal item onboard. Carry-on baggage must fit in the overhead bin and meet airline size requirements. Oversized bags may need to be checked at the gate.',
      sources: ['Baggage Policy.pdf'],
      confidence: 0.97
    },
    {
      keywords: ['checked bag', 'baggage allowance', 'luggage', 'checked luggage'],
      answer:
        'Checked baggage allowances vary depending on fare type and destination. Additional fees may apply for extra bags or oversized luggage. Customers should verify their allowance before traveling.',
      sources: ['Baggage Policy.pdf'],
      confidence: 0.96
    },
    {
      keywords: ['lithium battery', 'power bank', 'battery pack', 'electronics'],
      answer:
        'Spare lithium batteries and power banks must be packed in carry-on baggage only. Damaged batteries or those exceeding airline limits may not be transported. Always follow airline safety guidelines before travel.',
      sources: ['Dangerous Goods Manual.pdf'],
      confidence: 0.98
    },
    {
      keywords: ['refund', 'money back', 'canceled ticket', 'reimbursement'],
      answer:
        'Eligible refunds are processed after ticket validation and are typically completed within 7 business days for credit card purchases. Processing times may vary depending on the payment provider.',
      sources: ['Refund Guidelines.pdf'],
      confidence: 0.95
    },
    {
      keywords: ['basic economy', 'seat upgrade', 'cabin upgrade', 'premium seat'],
      answer:
        'Basic Economy tickets cannot be upgraded after check-in. Customers may purchase eligible upgrades before check-in if permitted by the fare rules and seat availability.',
      sources: ['Fare Rules.pdf'],
      confidence: 0.93
    },
    {
      keywords: ['delayed flight', 'delay', 'late flight', 'flight status'],
      answer:
        'Customers affected by flight delays should monitor the airline app or airport displays for the latest updates. Rebooking options may become available depending on the length and cause of the delay.',
      sources: ['Irregular Operations Manual.pdf'],
      confidence: 0.94
    },
    {
      keywords: ['missed connection', 'connecting flight', 'connection', 'rebooking'],
      answer:
        'If a passenger misses a connecting flight due to an airline-controlled delay, the airline will assist with rebooking on the next available flight. Additional accommodations may apply based on company policy.',
      sources: ['Customer Service Manual.pdf'],
      confidence: 0.94
    },
    {
      keywords: ['pet', 'dog', 'cat', 'service animal', 'emotional support animal'],
      answer:
        'Small pets may travel in the cabin if they meet carrier size requirements and applicable fees are paid. Service animals are accepted according to current accessibility regulations and airline policy.',
      sources: ['Pet Travel Policy.pdf'],
      confidence: 0.96
    },
    {
      keywords: ['wrong name', 'name correction', 'spelling mistake', 'ticket name'],
      answer:
        'Minor name corrections may be completed before departure after identity verification. Name changes that transfer ownership of a ticket are generally not permitted.',
      sources: ['Ticketing Policy.pdf'],
      confidence: 0.91
    },
    {
      keywords: ['passport', 'visa', 'travel documents', 'international travel'],
      answer:
        'Passengers are responsible for carrying valid passports, visas, and any required travel documentation before departure. Requirements vary by destination and nationality, so travelers should verify entry requirements before flying.',
      sources: ['International Travel Guide.pdf'],
      confidence: 0.95
    }
  ];

  askQuestion(question: string): Observable<AiResponse> {
    const normalized = question.trim().toLowerCase();

    const matched = this.knowledgeBase
      .map((entry) => ({
        entry,
        matchedKeywordCount: entry.keywords.reduce(
          (total, keyword) => total + (normalized.includes(keyword) ? 1 : 0),
          0
        )
      }))
      .filter((item) => item.matchedKeywordCount > 0)
      .sort((a, b) => b.entry.confidence - a.entry.confidence);

    if (!matched.length) {
      return of(this.createFallbackResponse()).pipe(delay(this.simulatedDelayMs));
    }

    const bestMatch = matched[0].entry;
    return of({
      answer: bestMatch.answer,
      sources: bestMatch.sources.map((name) => ({ name })),
      confidence: bestMatch.confidence,
      disclaimer: this.disclaimer
    }).pipe(delay(this.simulatedDelayMs));
  }

  private createFallbackResponse(): AiResponse {
    return {
      answer:
        "I couldn't find a matching policy. Please contact a supervisor or consult the airline knowledge base.",
      sources: [{ name: 'Supervisor Escalation SOP.pdf' }],
      confidence: 0.42,
      disclaimer: this.disclaimer
    };
  }
}

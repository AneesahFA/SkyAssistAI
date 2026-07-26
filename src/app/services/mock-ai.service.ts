import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AiResponse } from '../models/chat.models';

interface KnowledgeEntry {
  topic: string;
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

  private readonly synonymMap: Record<string, string[]> = {
    carry: ['bring', 'take', 'board', 'onboard'],
    baggage: ['bag', 'bags', 'luggage', 'suitcase', 'suitcases'],
    checked: ['check', 'check-in', 'checkin'],
    delayed: ['late', 'postponed'],
    canceled: ['cancelled', 'cancellation'],
    refund: ['reimbursement', 'moneyback', 'money-back'],
    connection: ['connecting', 'transfer'],
    flight: ['trip', 'itinerary'],
    pet: ['dog', 'cat', 'animal'],
    passport: ['travel-document', 'travel-documents', 'documents'],
    boarding: ['gate', 'board'],
    rights: ['entitlement', 'entitlements'],
    compensation: ['voucher', 'payment']
  };

  private readonly intentTokens = new Set<string>([
    'carry', 'baggage', 'checked', 'refund', 'upgrade', 'flight', 'delay', 'connection',
    'pet', 'passport', 'visa', 'ticket', 'boarding', 'gate', 'rights', 'compensation',
    'battery', 'power', 'lithium', 'name', 'change', 'hotel', 'meal', 'security'
  ]);

  // Replace this static knowledge array with Azure AI Search + indexed policy documents in production.
  private readonly knowledgeBase: KnowledgeEntry[] = [
    {
      topic: 'Carry-on baggage allowance',
      keywords: ['carry on', 'carry-on', 'cabin bag', 'hand luggage', 'personal item', 'bring bag'],
      answer:
        'Most passengers may bring one carry-on bag and one personal item onboard. Carry-on items must meet airline size limits and fit in overhead bins or under-seat space. Additional carry-on items may require gate check based on cabin space and fare rules.',
      sources: ['Baggage Policy.pdf'],
      confidence: 0.97
    },
    {
      topic: 'Checked baggage allowance',
      keywords: ['checked bag', 'checked baggage', 'baggage allowance', 'how much luggage', 'checked luggage'],
      answer:
        'Checked baggage allowances vary by fare type, cabin, and destination. Additional fees may apply for extra pieces, oversized items, or overweight baggage. Customers should verify their route-specific allowance before departure.',
      sources: ['Baggage Policy.pdf'],
      confidence: 0.96
    },
    {
      topic: 'Oversized and overweight baggage',
      keywords: ['oversized baggage', 'overweight baggage', 'extra bag fee', 'large suitcase', 'heavy bag'],
      answer:
        'Bags exceeding standard size or weight limits may be accepted with additional charges, subject to operational constraints. Maximum dimensions and weight thresholds vary by route and aircraft. Agents should verify exact limits before confirming acceptance.',
      sources: ['Baggage Policy.pdf'],
      confidence: 0.95
    },
    {
      topic: 'Delayed or lost baggage support',
      keywords: ['delayed baggage', 'lost baggage', 'missing luggage', 'bag did not arrive', 'file baggage report'],
      answer:
        'If checked baggage is delayed or missing, passengers should report it at the baggage service office before leaving the airport. A property irregularity report is created for tracing and updates. Interim assistance and compensation depend on applicable policy and regulations.',
      sources: ['Baggage Policy.pdf', 'Customer Service Manual.pdf'],
      confidence: 0.94
    },
    {
      topic: 'Lithium batteries and power banks',
      keywords: ['lithium battery', 'power bank', 'battery pack', 'electronics', 'charger battery'],
      answer:
        'Spare lithium batteries and power banks should be carried in cabin baggage only and are generally prohibited in checked baggage due to fire risk. Damaged batteries or units above airline watt-hour limits may be refused. Safety labeling and terminal protection requirements apply.',
      sources: ['Dangerous Goods Manual.pdf'],
      confidence: 0.98
    },
    {
      topic: 'Dangerous goods restrictions',
      keywords: ['firearms', 'alcohol limit', 'dry ice', 'camping fuel', 'electronic cigarette', 'vape'],
      answer:
        'Certain dangerous goods such as camping fuel and some ignition sources are prohibited from transport. Items like dry ice, alcohol, or sporting firearms may have strict quantity and declaration rules. Agents should follow dangerous goods acceptance procedures before approval.',
      sources: ['Dangerous Goods Manual.pdf'],
      confidence: 0.93
    },
    {
      topic: 'Refund eligibility',
      keywords: ['refund', 'money back', 'canceled ticket', 'reimbursement', 'can i get a refund'],
      answer:
        'Refund eligibility depends on fare conditions and disruption type. Refundable fares are generally eligible for full refund, while non-refundable fares are usually limited to qualifying exceptions such as airline-initiated cancellation or significant schedule changes.',
      sources: ['Refund Guidelines.pdf'],
      confidence: 0.95
    },
    {
      topic: 'Refund processing timeline',
      keywords: ['how long do refunds take', 'refund timeline', 'refund processing', 'duplicate ticket refund'],
      answer:
        'Approved refunds are typically processed in about 7 business days for card payments, while some methods can take up to 20 business days depending on provider settlement cycles. Ticket validation and fraud checks may affect final processing time.',
      sources: ['Refund Guidelines.pdf'],
      confidence: 0.94
    },
    {
      topic: 'Basic Economy and upgrades',
      keywords: ['basic economy', 'seat upgrade', 'cabin upgrade', 'premium seat', 'fare upgrade'],
      answer:
        'Basic Economy tickets cannot be upgraded after check-in. Customers may purchase eligible upgrades before check-in if permitted by the fare rules and seat availability.',
      sources: ['Fare Rules.pdf'],
      confidence: 0.93
    },
    {
      topic: 'Ticket changes and no-show policy',
      keywords: ['ticket change', 'change fee', 'no show', 'missed my flight no show', 'flexible fare'],
      answer:
        'Change rules depend on fare brand and route. Flexible fares may allow lower-fee or no-fee changes, while restrictive fares may incur penalties. No-show conditions can void segments and reduce residual ticket value.',
      sources: ['Fare Rules.pdf'],
      confidence: 0.91
    },
    {
      topic: 'Flight delays and disruptions',
      keywords: ['delayed flight', 'delay', 'late flight', 'flight status', 'weather delay', 'diversion'],
      answer:
        'During irregular operations, agents should prioritize rebooking on the next available itinerary. Depending on disruption cause and policy, eligible customers may receive meal or hotel accommodations. Customers should monitor official channels for gate, schedule, and reaccommodation updates.',
      sources: ['Irregular Operations Manual.pdf'],
      confidence: 0.94
    },
    {
      topic: 'Missed connections and rebooking',
      keywords: ['missed connection', 'connecting flight', 'connection', 'rebooking', 'misconnect'],
      answer:
        'If a passenger misses a connecting flight due to an airline-controlled delay, the airline will assist with rebooking on the next available flight. Additional accommodations may apply based on company policy.',
      sources: ['Irregular Operations Manual.pdf', 'Customer Service Manual.pdf'],
      confidence: 0.94
    },
    {
      topic: 'Pet travel and service animals',
      keywords: ['pet', 'dog', 'cat', 'service animal', 'emotional support animal', 'carrier size'],
      answer:
        'Small cats and dogs may travel in cabin when they remain inside an airline-approved carrier that fits under the seat. Service animals are processed under current accessibility rules. Fees, breed restrictions, and destination requirements may apply.',
      sources: ['Pet Travel Policy.pdf'],
      confidence: 0.96
    },
    {
      topic: 'Complaint handling and escalations',
      keywords: ['complaint', 'escalation', 'manager', 'supervisor', 'special assistance', 'medical emergency'],
      answer:
        'Customer concerns should be acknowledged promptly and resolved during first contact whenever possible. Cases requiring policy exceptions or specialist support should be escalated to a supervisor. Accessibility and medical-assistance requests must follow dedicated handling procedures.',
      sources: ['Customer Service Manual.pdf'],
      confidence: 0.92
    },
    {
      topic: 'Ticketing changes and standby',
      keywords: ['date change', 'seat change', 'same day standby', 'duplicate reservation', 'ticket policy'],
      answer:
        'Ticketing actions such as date or seat changes depend on fare conditions and inventory controls. Same-day standby may be available on selected itineraries. Duplicate reservations should be reviewed and resolved to avoid automated cancellations.',
      sources: ['Ticketing Policy.pdf'],
      confidence: 0.91
    },
    {
      topic: 'Name corrections',
      keywords: ['wrong name', 'name correction', 'spelling mistake', 'ticket name', 'name change'],
      answer:
        'Minor name corrections may be completed before departure after identity verification. Name changes that transfer ownership of a ticket are generally not permitted.',
      sources: ['Ticketing Policy.pdf'],
      confidence: 0.91
    },
    {
      topic: 'International travel documents',
      keywords: ['passport', 'visa', 'travel documents', 'international travel', 'vaccination', 'customs'],
      answer:
        'Passengers are responsible for carrying valid passports, visas, and any required travel documentation before departure. Requirements vary by destination and nationality, so travelers should verify entry requirements before flying.',
      sources: ['International Travel Guide.pdf'],
      confidence: 0.95
    },
    {
      topic: 'Airport operations and boarding',
      keywords: ['boarding', 'gate change', 'security line', 'check in deadline', 'airport delay'],
      answer:
        'Boarding gates and timings may change due to operational conditions. Passengers should monitor airport displays and airline notifications throughout travel. Check-in and baggage drop deadlines must be met to avoid denied boarding due to late arrival.',
      sources: ['Airport Operations Bulletin.pdf'],
      confidence: 0.9
    },
    {
      topic: 'Passenger rights and compensation',
      keywords: ['passenger rights', 'compensation', 'denied boarding', 'delay compensation', 'complaint rights'],
      answer:
        'Passenger rights vary by country and governing regulation. Eligible passengers may receive compensation for involuntary denied boarding or qualifying disruptions. Accessibility rights and complaint channels must be communicated clearly at time of service.',
      sources: ['Passenger Rights Handbook.pdf'],
      confidence: 0.9
    }
  ];

  askQuestion(question: string): Observable<AiResponse> {
    const normalized = this.normalizeText(question);
    const tokens = this.tokenize(normalized);
    const expandedTokens = this.expandTokensWithSynonyms(tokens);

    if (this.isLikelyUnclearInput(normalized, expandedTokens)) {
      return of(this.createClarificationResponse()).pipe(delay(this.simulatedDelayMs));
    }

    const matched = this.knowledgeBase
      .map((entry) => ({
        entry,
        score: this.scoreEntry(normalized, expandedTokens, entry)
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return b.entry.confidence - a.entry.confidence;
      });

    if (!matched.length) {
      return of(this.createFallbackResponse()).pipe(delay(this.simulatedDelayMs));
    }

    const bestMatch = matched[0];
    const dynamicConfidence = this.computeConfidence(bestMatch.entry.confidence, bestMatch.score);
    const interactiveAnswer = this.buildInteractiveAnswer(question, bestMatch.entry.answer);

    return of({
      answer: interactiveAnswer,
      sources: bestMatch.entry.sources.map((name) => ({ name })),
      confidence: dynamicConfidence,
      disclaimer: this.disclaimer
    }).pipe(delay(this.simulatedDelayMs));
  }

  private buildInteractiveAnswer(question: string, baseAnswer: string): string {
    const normalized = this.normalizeText(question);

    let lead = 'Great question.';
    if (normalized.startsWith('can i') || normalized.startsWith('can we')) {
      lead = 'Yes, in many cases you can do that, with policy conditions.';
    } else if (normalized.startsWith('is it') || normalized.startsWith('are we')) {
      lead = 'It depends on the policy details for the route and fare.';
    } else if (normalized.startsWith('what') || normalized.startsWith('how')) {
      lead = 'Here is the policy guidance.';
    }

    return `${lead} ${baseAnswer}\n\nWhat to do next:\n1. Confirm the passenger route and fare type.\n2. Verify exceptions, fees, or restrictions before finalizing.`;
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private tokenize(value: string): string[] {
    if (!value) {
      return [];
    }

    return value.split(' ').filter((token) => token.length > 1);
  }

  private expandTokensWithSynonyms(tokens: string[]): Set<string> {
    const expanded = new Set<string>(tokens);

    for (const [canonical, synonyms] of Object.entries(this.synonymMap)) {
      if (expanded.has(canonical) || synonyms.some((syn) => expanded.has(syn))) {
        expanded.add(canonical);
        synonyms.forEach((syn) => expanded.add(syn));
      }
    }

    return expanded;
  }

  private scoreEntry(normalizedQuestion: string, expandedTokens: Set<string>, entry: KnowledgeEntry): number {
    let exactPhraseMatches = 0;
    let tokenMatches = 0;
    let partialMatches = 0;

    for (const rawKeyword of entry.keywords) {
      const keyword = this.normalizeText(rawKeyword);

      if (!keyword) {
        continue;
      }

      if (normalizedQuestion.includes(keyword)) {
        exactPhraseMatches += 1;
        continue;
      }

      const keywordTokens = this.tokenize(keyword);
      const matchedKeywordTokens = keywordTokens.filter((token) => expandedTokens.has(token));

      tokenMatches += matchedKeywordTokens.length;

      if (matchedKeywordTokens.length === 0) {
        const hasPartial = keywordTokens.some((token) =>
          Array.from(expandedTokens).some((questionToken) =>
            questionToken.length >= 4 && token.length >= 4 &&
            (questionToken.startsWith(token) || token.startsWith(questionToken))
          )
        );

        if (hasPartial) {
          partialMatches += 1;
        }
      }
    }

    return exactPhraseMatches * 5 + tokenMatches * 2 + partialMatches;
  }

  private computeConfidence(baseConfidence: number, score: number): number {
    const boost = Math.min(score * 0.005, 0.04);
    return Math.min(0.99, baseConfidence + boost);
  }

  private isLikelyUnclearInput(normalizedQuestion: string, expandedTokens: Set<string>): boolean {
    if (!normalizedQuestion) {
      return true;
    }

    const alphaOnly = normalizedQuestion.replace(/[^a-z]/g, '');
    if (alphaOnly.length < 3) {
      return true;
    }

    const tokenList = Array.from(expandedTokens).filter((token) => /^[a-z-]+$/.test(token));
    const meaningfulTokens = tokenList.filter((token) => token.length >= 3);

    const recognizedIntentCount = meaningfulTokens.filter((token) => this.intentTokens.has(token)).length;

    return recognizedIntentCount === 0;
  }

  private createClarificationResponse(): AiResponse {
    return {
      answer:
        'I could not understand that request clearly. Please rephrase with a policy topic such as baggage, refund, upgrade, delay, pet travel, or travel documents.',
      sources: [
        { name: 'Supervisor Escalation SOP.pdf' },
        { name: 'Customer Service Manual.pdf' }
      ],
      confidence: 0.4,
      disclaimer: this.disclaimer
    };
  }

  private createFallbackResponse(): AiResponse {
    return {
      answer:
        "I couldn't find a direct policy match yet, but I can still help. Please share the route, fare type, and travel date, or contact a supervisor and consult the airline knowledge base for a verified decision.",
      sources: [
        { name: 'Supervisor Escalation SOP.pdf' },
        { name: 'Customer Service Manual.pdf' }
      ],
      confidence: 0.46,
      disclaimer: this.disclaimer
    };
  }
}

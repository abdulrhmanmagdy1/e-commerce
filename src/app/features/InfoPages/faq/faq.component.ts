import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-faq',
  imports: [],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FAQComponent {
  public readonly faqs = [
    { q: 'How does delivery work?', a: 'Choose a slot at checkout. We deliver to your door within the selected window.' },
    { q: 'What is your return policy?', a: 'Report issues within 24 hours of delivery for a prompt resolution.' },
    { q: 'Do you have a subscription?', a: 'Yes, subscribe for free delivery and exclusive deals.' },
  ];
}

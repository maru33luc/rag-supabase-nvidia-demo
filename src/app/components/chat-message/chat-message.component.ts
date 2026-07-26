import { Component, Input } from '@angular/core';

export type MessageRole = 'user' | 'assistant';

export interface ChatMessageData {
  role: MessageRole;
  content: string;
}

@Component({
  selector: 'app-chat-message',
  imports: [],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss',
})
export class ChatMessageComponent {
  @Input({ required: true }) message!: ChatMessageData;

  get isUser(): boolean {
    return this.message.role === 'user';
  }

  get avatarLabel(): string {
    return this.isUser ? 'Tú' : 'AI';
  }
}

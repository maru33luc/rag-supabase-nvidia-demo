import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentMatch } from '../../services/rag.service';

export type MessageRole = 'user' | 'assistant';

export interface ChatMessageData {
  id?: string;
  role: MessageRole;
  content: string;
  thinking?: string | null;
  matches?: DocumentMatch[];
  timestamp?: string;
}

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss',
})
export class ChatMessageComponent implements OnInit {
  @Input({ required: true }) message!: ChatMessageData;

  parsedThinking: string | null = null;
  parsedAnswer = '';
  showThinking = false;
  showSources = false;
  copied = false;

  ngOnInit(): void {
    this.processContent();
  }

  private processContent(): void {
    if (!this.message || !this.message.content) {
      this.parsedAnswer = '';
      this.parsedThinking = null;
      return;
    }

    // Check if thinking was passed or extract <think> tags from content
    if (this.message.thinking) {
      this.parsedThinking = this.message.thinking;
      this.parsedAnswer = this.message.content;
    } else {
      const thinkRegex = /<think>([\s\S]*?)<\/think>/i;
      const match = this.message.content.match(thinkRegex);
      if (match) {
        this.parsedThinking = match[1].trim();
        this.parsedAnswer = this.message.content.replace(thinkRegex, '').trim();
      } else {
        this.parsedThinking = null;
        this.parsedAnswer = this.message.content;
      }
    }
  }

  get isUser(): boolean {
    return this.message.role === 'user';
  }

  get avatarLabel(): string {
    return this.isUser ? 'Tú' : 'NVIDIA RAG Agent';
  }

  get formattedTime(): string {
    if (this.message.timestamp) return this.message.timestamp;
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  calculateSimilarity(distance?: number): number | null {
    if (distance === undefined || distance === null) return null;
    // Cosine distance <=> range is typically [0, 2], where 0 is identical
    const similarity = Math.max(0, Math.min(100, Math.round((1 - distance) * 100)));
    return similarity;
  }

  copyToClipboard(): void {
    const textToCopy = this.parsedAnswer || this.message.content;
    navigator.clipboard.writeText(textToCopy).then(() => {
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    });
  }

  formatMarkdown(text: string): string {
    if (!text) return '';

    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, (_match, p1) => {
      return `<pre class="code-block"><code>${p1.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Bold text
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic text
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Bullet list items
    html = html.replace(/^[•\-*]\s+(.*)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Paragraphs
    const paragraphs = html.split(/\n\n+/);
    return paragraphs.map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('');
  }
}

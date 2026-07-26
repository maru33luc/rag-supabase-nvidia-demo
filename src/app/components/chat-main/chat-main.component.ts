import { Component, EventEmitter, Output } from '@angular/core';
import { ChatMessageComponent, ChatMessageData } from '../chat-message/chat-message.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';

@Component({
  selector: 'app-chat-main',
  imports: [ChatMessageComponent, ChatInputComponent],
  templateUrl: './chat-main.component.html',
  styleUrl: './chat-main.component.scss',
})
export class ChatMainComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  messages: ChatMessageData[] = [
    {
      role: 'user',
      content: '¿Cómo funciona un sistema RAG con InsForge?',
    },
    {
      role: 'assistant',
      content:
        'Un sistema RAG (Retrieval-Augmented Generation) combina búsqueda en documentos con generación de respuestas. InsForge te permite indexar tus fuentes, generar embeddings con Nemotron-3-Embed-1B y recuperar el contexto más relevante antes de consultar al modelo NVIDIA poolside/laguna-xs-2.1.',
    },
    {
      role: 'user',
      content: '¿Qué tipos de documentos puedo indexar?',
    },
    {
      role: 'assistant',
      content:
        'Puedes indexar PDFs, archivos de texto, markdown, páginas web y otros formatos estructurados. El pipeline los divide en chunks, genera vectores y los almacena para búsqueda semántica antes de responder con el modelo NVIDIA.',
    },
  ];

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }
}

/**
 * Anthropic Claude Provider
 * Implementation of LLM provider interface for Anthropic Claude models
 */

import {
  LLMProvider,
  ChatMessage,
  AIResponse,
  ChatOptions,
} from '../ai-service';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-3-sonnet-20240229';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 4096;

export class AnthropicProvider implements LLMProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';

    if (!this.apiKey) {
      console.warn('Anthropic API key not configured');
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  getName(): string {
    return 'Anthropic Claude';
  }

  async chat(
    messages: ChatMessage[],
    options: ChatOptions = {}
  ): Promise<AIResponse> {
    if (!this.isConfigured()) {
      throw new Error('Anthropic API key not configured');
    }

    const model = options.model || DEFAULT_MODEL;
    const temperature = options.temperature ?? DEFAULT_TEMPERATURE;
    const maxTokens = options.maxTokens || DEFAULT_MAX_TOKENS;

    // Convert messages to Anthropic format
    // Anthropic requires system prompt separately
    const systemPrompt = options.systemPrompt || '';
    const anthropicMessages = messages.filter((m) => m.role !== 'system');

    try {
      const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature,
          system: systemPrompt,
          messages: anthropicMessages,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `Anthropic API error: ${error.error?.message || response.statusText}`
        );
      }

      const data = await response.json();

      return {
        content: data.content[0]?.text || '',
        model: data.model,
        usage: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens:
            (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        },
      };
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw error;
    }
  }

  async chatStream(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    options: ChatOptions = {}
  ): Promise<AIResponse> {
    if (!this.isConfigured()) {
      throw new Error('Anthropic API key not configured');
    }

    const model = options.model || DEFAULT_MODEL;
    const temperature = options.temperature ?? DEFAULT_TEMPERATURE;
    const maxTokens = options.maxTokens || DEFAULT_MAX_TOKENS;

    // Convert messages to Anthropic format
    const systemPrompt = options.systemPrompt || '';
    const anthropicMessages = messages.filter((m) => m.role !== 'system');

    try {
      const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature,
          system: systemPrompt,
          messages: anthropicMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `Anthropic API error: ${error.error?.message || response.statusText}`
        );
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'content_block_delta') {
                const content = parsed.delta?.text || '';
                if (content) {
                  fullContent += content;
                  onChunk(content);
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      return {
        content: fullContent,
        model,
      };
    } catch (error) {
      console.error('Anthropic streaming error:', error);
      throw error;
    }
  }
}

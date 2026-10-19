# Activepieces Piece: Jeffy

Text classification piece for [Activepieces](https://www.activepieces.com) powered by [Jeffy](https://jeffyclassify.com).

Classify text in your workflows using frozen embeddings + logistic regression. 70 pretrained tasks, 15ms inference, CPU only, no LLM needed.

## Actions

| Action | Description |
|--------|-------------|
| **Classify Text** | Classify a single text input using a pretrained task |
| **Batch Classify** | Classify multiple texts in one request |
| **List Classifiers** | List all available classification tasks on the server |
| **Health Check** | Check if the Jeffy server is running |

## Setup

1. Install the piece in your Activepieces instance
2. Add a Jeffy connection with your server URL (defaults to the public playground)
3. Use the Classify Text action in your flows

## Connection

- **Server URL**: Your Jeffy server (default: `https://playground.jeffyclassify.com`)
- **API Key**: Optional, only if your server requires authentication

## Example: customer support routing

1. Trigger: new email/message arrives
2. **Classify Text** with task `banking77` (77 banking intent categories)
3. Route to the right team based on the predicted label

## Links

- [Jeffy](https://jeffyclassify.com)
- [Playground](https://playground.jeffyclassify.com)
- [GitHub](https://github.com/nicobrenner/jeffy)
- [n8n node](https://github.com/nicobrenner/n8n-nodes-jeffy)

## License

MIT

# Aegis — AI Document Intelligence Platform

Aegis is a full-stack AI application that lets users upload PDF documents, ask questions about their content, and receive AI-generated answers grounded in retrieved document passages with source-page references. It also supports general AI conversations without document context.

## Features

- **PDF ingestion:** Upload PDF files and extract their text using PyMuPDF.
- **Document processing:** Clean and split extracted text into document-agnostic chunks while preserving page numbers.
- **Semantic search:** Generate text embeddings and retrieve relevant document chunks using PostgreSQL and pgvector.
- **Retrieval-Augmented Generation (RAG):** Ground AI answers in retrieved document content.
- **Source attribution:** Display source documents, page numbers, and relevance scores.
- **Local LLM inference:** Run a local language model through Ollama.
- **Streaming responses:** Display generated answers progressively in the chat interface.
- **Conversation management:** Create new conversations and revisit saved conversation history.
- **Document management:** Upload, list, select, and delete indexed documents.
- **General AI mode:** Chat without selecting a document.
- **Responsive interface:** A modern web workspace built with Next.js and Tailwind CSS.

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Python
- FastAPI
- SQLAlchemy
- AsyncPG
  
### Screenshots
(./Aegis-ss-1.png)

### AI and Retrieval
- Ollama
- Qwen3
- Sentence Transformers
- Text embeddings
- Retrieval-Augmented Generation (RAG)
- Semantic similarity search

### Database and Storage
- PostgreSQL
- pgvector
- Docker

### Document Processing
- PyMuPDF
- Python-based text cleaning and chunking

## Architecture

```text
Next.js Frontend
       |
       | HTTP / REST API
       v
FastAPI Backend
       |
       +---- PDF Text Extraction
       |
       +---- Document Chunking
       |
       +---- Embedding Generation
       |
       v
PostgreSQL + pgvector
       |
       | Semantic Retrieval
       v
Relevant Document Chunks
       |
       v
Ollama / Qwen3
       |
       v
Grounded Answer + Sources
       |
       v
Streaming Chat Interface
```

## How RAG Works

1. A user uploads a PDF document.
2. Aegis extracts the text and splits it into manageable chunks.
3. A local embedding model converts the chunks into numerical vectors.
4. PostgreSQL stores document metadata, chunks, and their embeddings.
5. When a user asks a question, Aegis searches for semantically relevant chunks.
6. The retrieved context is provided to the language model.
7. The model generates an answer, and Aegis displays the answer with source references.

## Future Improvements

- Automated RAG evaluation and regression testing
- Retrieval relevance and answer faithfulness metrics
- Improved PDF layout and heading detection
- Tool calling and agent workflows
- Model and retrieval latency monitoring
- Redis caching and background processing
- Automated testing and CI/CD
- Production deployment and observability

## Author

**Azka Shahid**

- GitHub: https://github.com/AzkaShahid
- LinkedIn: https://www.linkedin.com/in/azka-shahid-4708592b7/

---

Aegis is an evolving AI engineering project focused on document-grounded question answering, semantic retrieval, and practical full-stack AI system design.

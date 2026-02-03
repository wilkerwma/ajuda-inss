# CID-10 Processing Command

This Laravel command processes the CID-10 CSV file, splits codes by delimiter, generates embeddings for RAG (Retrieval-Augmented Generation), and saves the data to both MongoDB and a JSON file.

## Features

- **Code Splitting**: Automatically splits multiple CID codes separated by `-` into individual entries
  - Example: `A02- A04-A05- A07-A08` → 5 separate entries (A02, A04, A05, A07, A08)
- **Embedding Generation**: Creates vector embeddings using Ollama's `nomic-embed-text` model for RAG implementation
- **Dual Output**: Saves data to both MongoDB (`cid10_codes` collection) and JSON file
- **Progress Tracking**: Shows real-time progress bar during processing
- **Error Handling**: Logs errors and continues processing

## Prerequisites

1. **MongoDB**: Ensure MongoDB connection is configured
2. **Ollama**: Install and run Ollama with the embedding model:
   ```bash
   # Install Ollama (if not already installed)
   # Visit: https://ollama.ai
   
   # Pull the embedding model
   ollama pull nomic-embed-text
   
   # Start Ollama (it runs on localhost:11434 by default)
   ollama serve
   ```

## Usage

### Basic Usage
```bash
php artisan cid10:process
```

### Fresh Start (Clear existing data)
```bash
php artisan cid10:process --fresh
```

## Command Details

### Input
- **CSV File**: `database/seeders/cid-10.csv`
- **Format**: Two columns - `DESC` (description) and `CODE` (CID codes)

### Output
1. **MongoDB Collection**: `cid10_codes`
   - Fields:
     - `cid_code`: Individual CID code (unique)
     - `description`: Disease/condition description
     - `bpc_eligibility`: Boolean flag (default: false)
     - `legal_notes`: Optional legal notes (nullable)
     - `embedding`: Vector embedding array for RAG
     - `created_at`, `updated_at`: Timestamps

2. **JSON File**: `database/seeders/cid10_completo.json`
   - Contains all processed entries with embeddings
   - UTF-8 encoded with pretty print formatting

### Example Processing

**Input CSV Row:**
```csv
Outras doenças infecciosas intestinais,A02- A04-A05- A07-A08
```

**Output (5 separate entries):**
```json
[
  {
    "cid_code": "A02",
    "description": "Outras doenças infecciosas intestinais",
    "bpc_eligibility": false,
    "embedding": [0.123, -0.456, ...]
  },
  {
    "cid_code": "A04",
    "description": "Outras doenças infecciosas intestinais",
    "bpc_eligibility": true,
    "embedding": [0.234, -0.567, ...]
  },
  {
    "cid_code": "A05",
    "description": "Outras doenças infecciosas intestinais",
    "bpc_eligibility": false,
    "embedding": [0.345, -0.678, ...]
  },
  {
    "cid_code": "A07",
    "description": "Outras doenças infecciosas intestinais",
    "bpc_eligibility": false,
    "embedding": [0.456, -0.789, ...]
  },
  {
    "cid_code": "A08",
    "description": "Outras doenças infecciosas intestinais",
    "bpc_eligibility": false,
    "embedding": [0.567, -0.890, ...]
  }
]
```

## Code Structure

### Model
**`app/Models/Cid10Code.php`**
- MongoDB Eloquent model
- Manages `cid10_codes` collection
- Handles embedding array casting

### Command
**`app/Console/Commands/ProcessCid10Command.php`**
- Main processing logic
- CSV parsing and code splitting
- Embedding generation via Ollama API
- Database and JSON output

## Error Handling

- **Missing CSV**: Command fails with error message
- **Invalid CSV Format**: Validates required columns (DESC, CODE)
- **Embedding Failures**: Logs warning and continues with `null` embedding
- **Database Errors**: Logs error and continues processing remaining entries
- **HTTP Timeouts**: 30-second timeout for embedding API calls

## Performance Notes

- Processing time depends on:
  - Number of entries in CSV
  - Ollama API response time
  - Network latency to MongoDB
- Approximate: 2-5 entries per second with embeddings
- Use `--fresh` option cautiously in production

## RAG Implementation

The generated embeddings enable semantic search capabilities:

1. **Vector Storage**: Each CID code has an embedding vector
2. **Similarity Search**: Query embeddings to find similar conditions
3. **Context Retrieval**: Retrieve relevant CID codes for AI responses

### Example RAG Query Flow
```php
// 1. Generate query embedding
$queryEmbedding = generateEmbedding("dor de cabeça");

// 2. Find similar CID codes (cosine similarity)
$similarCodes = Cid10Code::where(/* vector similarity search */)
    ->limit(5)
    ->get();

// 3. Use as context for AI model
$context = $similarCodes->pluck('description')->implode(', ');
```

## Troubleshooting

### Ollama Not Running
```
Error: Connection refused to localhost:11434
Solution: Start Ollama with `ollama serve`
```

### Model Not Found
```
Error: Model 'nomic-embed-text' not found
Solution: Pull model with `ollama pull nomic-embed-text`
```

### MongoDB Connection Failed
```
Error: Connection to MongoDB failed
Solution: Check .env file for correct MONGODB_URI
```

## Migration

Run the migration to create the collection schema:
```bash
php artisan migrate
```

Migration file: `database/migrations/2026_01_11_175026_create_cid10_collection.php`
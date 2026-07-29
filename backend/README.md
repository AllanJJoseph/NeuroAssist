# NeuroAssist Backend

FastAPI backend for the NeuroAssist hackathon project.

## Run

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Endpoints

- `GET /` - Health check
- `POST /predict` - Mock stroke risk prediction
- `POST /upload-scan` - Save a CT or MRI upload
- `POST /analyze-scan` - Mock scan interpretation
- `POST /generate-report` - Structured clinical report

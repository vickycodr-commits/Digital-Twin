import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.app.database.db import init_db
from backend.app.api.routes import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database on startup
    init_db()
    print("=" * 60)
    print("TWIN-RAG AI: Industrial Predictive Maintenance Backend Started")
    print("Research Mode: Uncertainty Aware Hybrid Graph Vector RAG")
    print("=" * 60)
    yield
    print("TWIN-RAG AI Backend Shutting Down...")

app = FastAPI(
    title="TWIN-RAG AI - Research Predictive Maintenance Platform",
    description="Uncertainty Aware Hybrid Graph Vector RAG for Explainable Predictive Maintenance in Digital Twin Enabled Industrial Systems",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local Vite development and deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API endpoints
app.include_router(router)

@app.get("/")
def read_root():
    return {
        "project": "TWIN-RAG AI",
        "title": "Uncertainty Aware Hybrid Graph Vector RAG for Explainable Predictive Maintenance in Digital Twin Enabled Industrial Systems",
        "status": "ONLINE",
        "docs_url": "/docs",
        "api_prefix": "/api"
    }

if __name__ == "__main__":
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)

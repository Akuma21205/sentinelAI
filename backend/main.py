from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.scan import router as scan_router
from routes.ai import router as ai_router

app = FastAPI(
    title="Attack Surface Intelligence",
    description="AI-powered Attack Surface Reconnaissance & Risk Analysis Platform",
    version="1.0.0",
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(scan_router, tags=["Scan"])
app.include_router(ai_router, tags=["AI"])


@app.get("/")
def root():
    return {
        "name": "Attack Surface Intelligence API",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}

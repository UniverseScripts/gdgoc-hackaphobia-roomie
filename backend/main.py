import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import (
    matches, 
    landlord, 
    market, 
    sponsor, 
    admin, 
    reviews, 
    media,
    chat,          
    onboarding,    
    test,          
    auth,          
    listings
)

# OpenTelemetry imports
try:
    from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
    from opentelemetry import trace
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor
    from opentelemetry.exporter.cloud_trace import CloudTraceSpanExporter
    OTEL_AVAILABLE = True
except ImportError:
    OTEL_AVAILABLE = False

# 1. Initialize FastAPI Application
app = FastAPI(title="Roomie Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. OpenTelemetry Tracing Initialization
# Configure GCP Cloud Trace if running in GCP, else setup a fallback
try:
    provider = trace.get_tracer_provider()
    # Check if provider is already initialized by checking its type
    if not isinstance(provider, TracerProvider):
        provider = TracerProvider()
        cloud_trace_exporter = CloudTraceSpanExporter()
        provider.add_span_processor(BatchSpanProcessor(cloud_trace_exporter))
        trace.set_tracer_provider(provider)
except Exception as e:
    print(f"OTEL initialization skipped or failed: {e}")

if OTEL_AVAILABLE:
    FastAPIInstrumentor.instrument_app(app)

# 3. Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(listings.router, prefix="/api")
app.include_router(onboarding.router, prefix="/api")
app.include_router(test.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(matches.router, prefix="/api")
app.include_router(landlord.router, prefix="/api")
app.include_router(market.router, prefix="/api")
app.include_router(sponsor.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")
app.include_router(media.router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
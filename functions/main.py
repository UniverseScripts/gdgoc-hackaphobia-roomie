import os
import vertexai
from vertexai.language_models import TextEmbeddingModel
from firebase_functions import firestore_fn
from firebase_admin import initialize_app, firestore
from google.cloud.firestore_v1.vector import Vector

# OpenTelemetry imports for Phase 3
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.cloud_trace import CloudTraceSpanExporter

initialize_app()

# Phase 3: Instrument Cloud Function with Google Cloud Trace SDK
try:
    provider = trace.get_tracer_provider()
    if not isinstance(provider, TracerProvider):
        provider = TracerProvider()
        provider.add_span_processor(BatchSpanProcessor(CloudTraceSpanExporter()))
        trace.set_tracer_provider(provider)
except Exception as e:
    print(f"OTEL configuration skipped/failed: {e}")

tracer = trace.get_tracer(__name__)

# Phase 4: Initialization with dynamic project ID
gcp_project_id = os.environ.get("GCP_PROJECT_ID")
if gcp_project_id:
    vertexai.init(project=gcp_project_id)
else:
    vertexai.init() # Fallbacks to application default credentials

model = TextEmbeddingModel.from_pretrained("text-embedding-005")

@firestore_fn.on_document_written(document="properties/{propertyId}")
def generate_property_embedding(event: firestore_fn.Event[firestore_fn.Change[firestore_fn.DocumentSnapshot | None]]) -> None:
    """Intercepts property writes and updates embedding fields using Vertex AI."""
    
    if event.data is None or event.data.after is None or not event.data.after.exists:
        return
        
    doc_data = event.data.after.to_dict()
    if doc_data is None:
        return
        
    desc = doc_data.get("description")
    if not desc:
        return
        
    # Prevent infinite loop by checking if embedding is already up-to-date
    if doc_data.get("embedded_description") == desc:
        return
        
    # Telemetry: trace the exact token generation latency
    with tracer.start_as_current_span("vertex_ai_embedding_generation") as span:
        try:
            embeddings_response = model.get_embeddings([desc])
            if not embeddings_response:
                return
            vector_array = embeddings_response[0].values
            
            # Store array as `FieldValue.vector()` (Vector in python client)
            event.data.after.reference.update({
                "embedding": Vector(vector_array),
                "embedded_description": desc
            })
            span.set_attribute("vector.size", len(vector_array))
        except Exception as e:
            span.record_exception(e)
            raise e

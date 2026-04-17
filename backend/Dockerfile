# Use a slim Python base image
FROM python:3.11-slim

# Prevent Python from writing pyc files and buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install pure Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application matrix
COPY . .

# ENFORCE ZERO-TRUST: Create and switch to a non-root user
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# Expose the internal port expected by Cloud Run
EXPOSE 8080

# STRICT EXEC ARRAY: Required for SIGTERM propagation
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
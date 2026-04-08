# 1. Use an official Python runtime as a parent image
FROM python:3.10-slim

# 2. Set the working directory in the container
WORKDIR /app

# 3. Install system dependencies (needed for PostgreSQL)
RUN apt-get update && apt-get install -y libpq-dev gcc

# 4. Copy requirements file and install dependencies
# (Make sure you have generated a requirements.txt with: pip freeze > requirements.txt)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of the backend code
COPY . .

# 6. Expose the port the app runs on
EXPOSE 8000

# 7. Command to run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
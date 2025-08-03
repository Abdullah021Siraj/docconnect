# ---- Stage 1: Build ----
FROM python:3.10-slim-bullseye AS builder

# Set environment variables for optimization
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install build dependencies in single layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libjpeg-dev \
    zlib1g-dev \
    libpng-dev \
    libfreetype6-dev \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create virtual environment
ENV VENV_PATH=/opt/venv
RUN python -m venv $VENV_PATH
ENV PATH="$VENV_PATH/bin:$PATH"

# Upgrade pip and install wheel for better compatibility
RUN pip install --upgrade pip setuptools wheel

# Copy requirements and install packages with cache mount
WORKDIR /app
COPY requirements.txt .

# Install with wheel preference and cache mounting for faster rebuilds
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --prefer-binary --no-cache-dir -r requirements.txt

# ---- Stage 2: Runtime ----
FROM python:3.10-slim-bullseye

# Set runtime environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/opt/venv/bin:$PATH"

# Install only runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    poppler-utils \
    libjpeg62-turbo \
    zlib1g \
    libpng16-16 \
    libfreetype6 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user for security
RUN groupadd -r appgroup && useradd -r -g appgroup -d /home/appuser -m appuser

# Switch to non-root user
USER appuser
WORKDIR /home/appuser/app

# Copy virtual environment from builder
COPY --from=builder --chown=appuser:appgroup /opt/venv /opt/venv

# Copy application code
COPY --chown=appuser:appgroup . .

EXPOSE 5000
CMD ["python", "app1/app.py"]
FROM python:3.10-alpine

WORKDIR /app

RUN apk add --no-cache \
    tesseract-ocr \
    poppler-utils \
    jpeg-dev \
    zlib-dev \
    gcc \
    musl-dev \
    python3-dev \
    py3-pillow

COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000
CMD ["python", "app1/app.py"]

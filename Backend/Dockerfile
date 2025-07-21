FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy Backend contents into /app
COPY ./Backend/ /app

# Install dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Set environment variable to indicate Docker environment
ENV DOCKER_ENV=true

# Expose all necessary ports
EXPOSE 5001 5002 5003 5004

# Run all Flask apps in background
CMD ["sh", "-c", "python app1/Assist.py & python app1/prescription.py & python app1/medic_report.py & python app1/pred_bot.py && wait"]

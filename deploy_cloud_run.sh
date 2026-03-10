#!/bin/bash

# Configuration
PROJECT_ID="minhtuan"
APP_NAME="engo-app"
REGION="asia-southeast1" # Adjust as needed (e.g., us-central1)

echo "🚀 Starting Deployment to Google Cloud Run..."
echo "Project ID: $PROJECT_ID"
echo "App Name: $APP_NAME"

# 1. Build the image locally (using Google Cloud Build is also an option, but this is simple)
echo "📦 Building Docker Image..."
docker build -t gcr.io/$PROJECT_ID/$APP_NAME:latest .

# 2. Push to Google Container Registry (GCR)
echo "⬆️ Pushing Image to GCR..."
docker push gcr.io/$PROJECT_ID/$APP_NAME:latest

# 3. Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $APP_NAME \
  --image gcr.io/$PROJECT_ID/$APP_NAME:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --project $PROJECT_ID

echo "✅ Deployment Complete!"

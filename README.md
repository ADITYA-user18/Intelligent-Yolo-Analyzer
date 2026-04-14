# 👁️ AutoYOLO - Neural Intelligence Platform

Welcome to **AutoYOLO**, a production-grade AI optimization and Dataset Intelligence platform. AutoYOLO replaces manual hyperparameter tuning and dataset verification with a deeply integrated Neural Workflow Agent.

## 🚀 Live Interfaces

Here is a glimpse of the AutoYOLO workflow in action:

### 1. Landing & Authentication
The gateway to the platform featuring optimized `Three.js` background shaders, glassmorphism UI, and dark/light mode neural adaptability.
![Landing Page]<img width="1920" height="1020" alt="Screenshot 2026-04-14 234103" src="https://github.com/user-attachments/assets/402df2bb-0b61-46e5-a149-bb1d1b34e11c" />


### 2. Neural Audit & Quality Scoring
Our agent deep-scans your YOLO annotations, instantly identifying flaws, missing labels, and outputting an overall Dataset Quality Score for tracking production readiness.
![Neural Audit]<img width="1920" height="1020" alt="Screenshot 2026-04-14 234131" src="https://github.com/user-attachments/assets/c5c37ac9-acb8-4a35-9983-5650206b014c" />


### 3. Dataset Repair & Standardization
Automated structural alignment. The platform converts raw folders into a standardized `Train/Val/Test` architecture required by `Ultralytics YOLO` models with a single click.
![Dataset Repair]<img width="1920" height="1020" alt="Screenshot 2026-04-14 234149" src="https://github.com/user-attachments/assets/181c91b6-ab2a-4ce4-b8e1-a190468a293d" />


### 4. Smart HPO (Hyperparameter Optimization)
Based on dynamic heuristics (class imbalance, bounding box density, and image size), AutoYOLO's inference engine crafts the exact optimal setup for training (e.g., YOLOv11s, 300 Epochs, AdamW Optimizer).
![Model Optimization]<img width="1920" height="1020" alt="Screenshot 2026-04-14 234201" src="https://github.com/user-attachments/assets/471d0771-4444-47af-b663-e2c715256532" />


### 5. Automated Code Generation & Recursive Feedback
The workflow wraps up by autonomously writing your `production_train.py` wrapper, tailored specifically to your data schema. Post-training, you can upload `results.csv` back into the portal for continuous Recursive Evaluation.
![Code Generator]<img width="1920" height="1020" alt="Screenshot 2026-04-14 234215" src="https://github.com/user-attachments/assets/b858f3e0-9d4f-44f2-b639-e9fef73e6edf" />


## 🛠️ Zero-Cost Deployment Architecture

AutoYOLO is structured for seamless 100% free hosting using modern serverless platforms.

### Frontend: Vercel (Free Tier)
We deploy our Vite + React dashboard directly to Vercel. Vercel perfectly supports SPA routing and provides zero-configuration GitHub CI/CD out-of-the-box.

### Backend: Render.com or Railway (Free Tiers)
Our FastAPI intelligence engine, driven by `Gemini` models natively, runs beautifully on zero-cost Web Service tiers. A `render.yaml` or basic Python deployment command handles the `uvicorn` runner dynamically.

## 📦 Local Quickstart
```bash
# 1. Start the FastAPI Engine
cd server
pip install -r requirements.txt
python analyzer.py

# 2. Launch the Web Platform
cd frontend
npm install
npm run dev
```

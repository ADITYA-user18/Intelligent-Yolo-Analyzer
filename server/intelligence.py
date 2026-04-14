# server/intelligence.py

from dotenv import load_dotenv
import os
from google import genai
from groq import Groq
import json
import time

load_dotenv()

# --- PROVIDER INITIALIZATION ---

# 1. Primary: Gemini (NEW SDK)
gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
GEMINI_MODEL_ID = "gemini-2.5-flash"

# 2. Secondary: Groq
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def get_ai_response(messages, response_format={"type": "json_object"}):
    """
    🔄 MULTI-PROVIDER CASCADE (Production Ready)
    """

    system_msg = next((m['content'] for m in messages if m['role'] == 'system'), "")
    user_msg = next((m['content'] for m in messages if m['role'] == 'user'), "")

    # ---------------- GEMINI ----------------
    try:
        print(f"AI ENGINE: Requesting Gemini ({GEMINI_MODEL_ID})...")

        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL_ID,
            contents=user_msg,
            config={
                "system_instruction": system_msg,
                "response_mime_type": "application/json",
                "temperature": 0
            }
        )

        return response.text

    except Exception as e:
        print(f"Gemini Fail: {str(e)}")

        # Retry once if rate limited
        if "429" in str(e):
            print("⏳ Retrying Gemini after delay...")
            time.sleep(15)
            try:
                response = gemini_client.models.generate_content(
                    model=GEMINI_MODEL_ID,
                    contents=user_msg,
                    config={
                        "system_instruction": system_msg,
                        "response_mime_type": "application/json",
                        "temperature": 0
                    }
                )
                return response.text
            except Exception as retry_error:
                print(f"Gemini Retry Failed: {str(retry_error)}")

    # ---------------- GROQ FALLBACK ----------------
    try:
        print("AI ENGINE: Falling back to GROQ (llama-3.3-70b-versatile)...")

        response = groq_client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            temperature=0,
            response_format=response_format
        )

        return response.choices[0].message.content

    except Exception as ge:
        print(f"CRITICAL AI FAILURE: {str(ge)}")
        return None


class IntelligenceAgent:

    @staticmethod
    def generate_strategy(stats):
        total_images = stats.get('total_images', 0)
        category = "SMALL" if total_images < 1500 else ("PRODUCTION" if total_images > 10000 else "MEDIUM")

        dataset_context = f"""
        DATASET PROFILE:
        - Category: {category}
        - Total Images: {total_images}
        - Total Labels: {stats.get('total_labels')}
        - Classes: {stats.get('classes')}
        - Distribution: {stats.get('class_distribution')}
        - Resolution: {stats.get('avg_resolution')}
        - Quality Score: {stats.get('score')}/100
        """

        parameter_knowledge = """
        YOLO EXPERT HEURISTICS:
        1. SMALL DATASETS (<1500 imgs): SGD optimizer, batch <= 8, low Mixup.
        2. LARGE DATASETS (>10k imgs): AdamW optimizer, high Mixup (0.3+), Mosaic (1.0).
        3. ARCHITECTURES: YOLOv11N (Nano), YOLOv11S/M (Balanced), YOLOv11X (Heavy).
        """

        system_prompt = f"""
        You are a PRO YOLO Vision Architect. Engineer a Production Strategy.
        KNOWLEDGE: {parameter_knowledge}

        You MUST provide comments/explanations for EVERY SINGLE parameter you define. Make it clear to users what it does.
        If a user has a GPU, they use it otherwise fallback to cpu. (The generated code automatically handles device checking, so don't output a device parameter unless strictly needed, but if you do, explain it).

        RETURN STRICT JSON:
        {{
            "recommended_model": "yolov8n.pt",
            "reasoning": "Expert justification...",
            "train_params": {{ "epochs": 100, "batch": 16 }},
            "aug_params": {{ "mosaic": 1.0 }},
            "val_params": {{ "conf": 0.25 }},
            "explanations": {{ "epochs": "Number of full training cycles for the network.", "batch": "Number of images processed before model weights are updated.", "mosaic": "Combines 4 images into 1 to improve small object detection." }}
        }}
        """

        try:
            raw_content = get_ai_response([
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": dataset_context}
            ])

            if raw_content is None:
                raise Exception("All providers offline")

            result = json.loads(raw_content)

            train = result.get("train_params", {})
            aug = result.get("aug_params", {})
            val = result.get("val_params", {})

            return {
                "recommended_model": result.get("recommended_model", "yolov11n.pt"),
                "reasoning": result.get("reasoning", "Agent failed."),
                "train_params": train,
                "aug_params": aug,
                "val_params": val,
                "hyperparameters": {**train, **aug, **val},
                "explanations": result.get("explanations", {})
            }

        except Exception as e:
            print("STRATEGY GENERATION ERROR:", str(e))

            return {
                "recommended_model": "yolovxx.pt",
                "reasoning": "Fallback defaults used.",
                "train_params": {"epochs": 100, "batch": 16, "patience": 50, "imgsz": 640},
                "aug_params": {"mosaic": 1.0, "mixup": 0.0, "copy_paste": 0.0},
                "val_params": {"conf": 0.25, "iou": 0.7},
                "hyperparameters": {"epochs": 100, "batch": 16, "patience": 50, "imgsz": 640},
                "explanations": {}
            }

    @staticmethod
    def analyze_results(stats, logs_content, prev_strategy=None):
        strategy_context = f"PREVIOUS STRATEGY: {json.dumps(prev_strategy)}" if prev_strategy else ""

        system_prompt = f"""
        You are an ELITE ML Training Analyst evaluating recent YOLO training metrics from a CSV log.
        Assess if the model converged well or if it needs improvements. Let the user know if they are good to go, or if they need to regenerate.

        {strategy_context}

        RETURN STRICT JSON:
        {{
            "verdict": "Production Ready", // or "Needs Improvement", "Overfitting Detect", etc.
            "feedback": "Clear explanation of whether it converged successfully or what failed.",
            "suggested_changes": {{"epochs": 200, "lr0": 0.005}}, // Empty if Production Ready
            "change_explanations": {{"epochs": "Increased because box_loss was still decreasing quickly.", "lr0": "Lowered learning rate to stabilize the late-stage loss curves."}}
        }}
        """

        try:
            raw_content = get_ai_response([
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"DATASET: {stats}\nLOGS:\n{logs_content}"}
            ])

            if raw_content is None:
                raise Exception("Providers offline")

            return json.loads(raw_content)

        except Exception as e:
            print("AI FEEDBACK ERROR:", str(e))

            return {
                "verdict": "Audit Required",
                "feedback": "AI providers unavailable.",
                "suggested_changes": {}
            }
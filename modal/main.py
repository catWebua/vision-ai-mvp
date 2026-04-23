import modal
import io
import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Function to ONLY download files to cache
def download_model():
    from huggingface_hub import snapshot_download
    os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
    print("Downloading model to cache...")
    snapshot_download("vikhyatk/moondream2", revision="2024-08-26", max_workers=8)
    snapshot_download("moondream/starmie-v1", max_workers=8)

# 1. Define image with the most stable versions for moondream
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "transformers==4.44.2",
        "tokenizers==0.19.1",
        "accelerate",     
        "torch", 
        "torchvision",
        "pillow", 
        "fastapi", 
        "uvicorn", 
        "python-multipart", 
        "einops",
        "requests",
        "httpx",
        "huggingface_hub",
        "deep-translator"
    )
    .run_function(download_model) 
)

app = modal.App("vision-mvp-v2") # Changed name to force fresh start
web_app = FastAPI()

# Add CORS
web_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VisionRequest(BaseModel):
    image_url: str
    prompt: str = "Describe this image in detail."
    language: str = "en"

@app.cls(
    image=image,
    gpu="A10G",
    scaledown_window=300,
)
class Model:
    @modal.enter()
    def setup(self):
        from transformers import AutoModelForCausalLM, AutoTokenizer
        import torch
        
        print("🚀 Инициализация модели из кеша HuggingFace...")
        import time
        start_load = time.time()
        
        model_id = "vikhyatk/moondream2"
        # Load from cache
        self.model = AutoModelForCausalLM.from_pretrained(
            model_id, 
            trust_remote_code=True, 
            torch_dtype=torch.float16,
            revision="2024-08-26",
        ).to("cuda")
            
        self.tokenizer = AutoTokenizer.from_pretrained(model_id, revision="2024-08-26")
        self.model.eval()
        print(f"✅ Модель готова за {time.time() - start_load:.2f}с.")

    @modal.method()
    async def predict(self, image_url: str, prompt: str):
        from PIL import Image
        import httpx
        import io
        import torch
        import time
        
        start_inf = time.time()
        print(f"Analyzing image: {image_url}")
        try:
            async with httpx.AsyncClient(follow_redirects=True) as client:
                headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
                response = await client.get(image_url, headers=headers, timeout=20)
                response.raise_for_status()
            img = Image.open(io.BytesIO(response.content))
        except Exception as e:
            return f"Error loading image: {str(e)}"

        with torch.no_grad():
            image_embeds = self.model.encode_image(img)
            answer = self.model.answer_question(image_embeds, prompt, self.tokenizer)
        
        print(f"Inference completed in {time.time() - start_inf:.2f}s.")
        return answer

@web_app.get("/")
def health():
    return {"status": "running", "model": "moondream2"}

@web_app.post("/analyze")
async def analyze_endpoint(request: VisionRequest):
    print(f"Received request: lang={request.language}, prompt={request.prompt}")
    model = Model()
    try:
        answer = await model.predict.remote.aio(request.image_url, request.prompt)
        
        # Localize answer if requested
        if request.language == "uk":
            try:
                print("Translating response to Ukrainian...")
                from deep_translator import GoogleTranslator
                answer = GoogleTranslator(source='auto', target='uk').translate(answer)
                print("Translation successful")
            except Exception as e:
                print(f"Translation error: {e}")
                # Fallback to English if translation fails
        
        return {"answer": answer}
    except Exception as e:
        print(f"Inference error: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

@app.function(image=image)
@modal.asgi_app(label="analyze-v2")
def vision_server():
    return web_app

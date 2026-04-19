import modal
from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
import io
import requests

# Define the Modal App
app = modal.App("vision-mvp")

# Define the container image with necessary dependencies
image = (
    modal.Image.debian_slim()
    .pip_install(
        "transformers",
        "pillow",
        "torch",
        "einops",
        "accelerate",
        "fastapi",
        "pydantic"
    )
)

# Persistent volume for model weights
volume = modal.Volume.from_name("vision-model-cache", create_if_missing=True)

class VisionRequest(BaseModel):
    image_url: str
    prompt: str = "Describe this image in detail."

@app.cls(
    image=image,
    gpu="A10G",
    volumes={"/root/.cache/huggingface": volume},
    timeout=600,
)
class Model:
    @modal.enter()
    def setup(self):
        from transformers import AutoModelForCausalLM, AutoTokenizer
        
        model_id = "vikhyatk/moondream2"
        revision = "2024-08-05"  # Pin revision for stability
        
        print("Loading model...")
        self.model = AutoModelForCausalLM.from_pretrained(
            model_id, 
            trust_remote_code=True, 
            revision=revision,
            device_map="auto"
        )
        self.tokenizer = AutoTokenizer.from_pretrained(model_id, revision=revision)
        print("Model loaded.")

    @modal.method()
    def predict(self, image_url: str, prompt: str):
        from PIL import Image
        
        print(f"Processing image: {image_url}")
        try:
            response = requests.get(image_url, timeout=10)
            img = Image.open(io.BytesIO(response.content))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to load image: {str(e)}")

        enc_image = self.model.encode_image(img)
        answer = self.model.answer_question(enc_image, prompt, self.tokenizer)
        return {"answer": answer}

@app.function(image=image)
@modal.web_endpoint(method="POST")
def analyze(request: VisionRequest):
    model = Model()
    return model.predict.remote(request.image_url, request.prompt)

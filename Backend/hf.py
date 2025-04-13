from transformers import AutoProcessor
from huggingface_hub import login

# Explicitly login inside the script (only needed if CLI login doesn’t work)
login(token="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")

# Load processor with authentication and trust_remote_code=True
processor = AutoProcessor.from_pretrained(
    "Muizzzz8/phi3-prescription-reader",
    slow_image_processor_class="Phi3VImageProcessor",
    token="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",
    trust_remote_code=True
)
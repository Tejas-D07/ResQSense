"""
detect_sound.py — YAMNet-based sound classifier for Predictive Emergency AI

HOW IT WORKS:
  - Uses YAMNet via TensorFlow Hub (auto-downloads ~25MB compressed model once)
  - Class names are bundled inside the model — no separate dataset needed
  - Records 2s of microphone audio at 16kHz (YAMNet's native sample rate)
  - Outputs JSON: { sound, confidence, danger }

STORAGE:
  - Model cached at ~/.cache/tfhub_modules/ after first download
  - No AudioSet dataset download ever required
"""

import base64
import io
import json
import os
import sys
import wave

# Suppress TF info/warning logs — only errors to stderr
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

# Use certifi's trusted CA bundle for secure TensorFlow Hub downloads.
try:
    import certifi
    os.environ["SSL_CERT_FILE"] = certifi.where()
    os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()
except ImportError:
    certifi = None

import numpy as np

# ─── Lazy-load heavy libs to keep startup fast ────────────────────────────────
try:
    import sounddevice as sd
except ImportError:
    print(json.dumps({
        "sound": "unknown", "confidence": 0.0, "danger": False,
        "error": "sounddevice not installed. Run: pip install sounddevice"
    }))
    sys.exit(1)

try:
    import tensorflow as tf
    import tensorflow_hub as hub
except ImportError:
    print(json.dumps({
        "sound": "unknown", "confidence": 0.0, "danger": False,
        "error": "TensorFlow not installed. Run: pip install tensorflow tensorflow-hub"
    }))
    sys.exit(1)

# ─── Silence TF warnings ──────────────────────────────────────────────────────
tf.get_logger().setLevel("ERROR")

# ─── Load YAMNet (cached after first download — ~25MB compressed tar.gz) ──────
YAMNET_URL = "https://tfhub.dev/google/yamnet/1"

try:
    model = hub.load(YAMNET_URL)
except Exception as e:
    print(json.dumps({
        "sound": "unknown", "confidence": 0.0, "danger": False,
        "error": f"Failed to load YAMNet model: {str(e)}"
    }))
    sys.exit(1)

# ─── Load class names from the model bundle (no separate file needed) ─────────
try:
    class_map_path = model.class_map_path().numpy().decode("utf-8")
    class_names = []
    with tf.io.gfile.GFile(class_map_path) as f:
        next(f)  # skip header
        for line in f:
            parts = line.strip().split(",")
            if len(parts) >= 3:
                # Format: index,mid,display_name
                class_names.append(parts[2].strip().strip('"'))
except Exception as e:
    print(json.dumps({
        "sound": "unknown", "confidence": 0.0, "danger": False,
        "error": f"Failed to load class names: {str(e)}"
    }))
    sys.exit(1)

# ─── Danger keyword map (maps to YAMNet AudioSet class names) ─────────────────
# Tuned to YAMNet's actual class vocabulary for best accuracy
DANGER_KEYWORDS = [
    # Human distress
    "scream", "shout", "yell", "crying", "sobbing", "whimpering",
    "screaming", "wail", "shriek",
    # Weapons / violence
    "gunshot", "gunfire", "explosion", "blast", "bomb",
    "artillery fire", "burst",
    # Breaking / impact
    "glass", "shatter", "breaking", "smash", "crash",
    # Emergency services
    "siren", "emergency vehicle", "police", "ambulance", "fire engine",
    # Alarms
    "alarm", "smoke detector", "fire alarm", "burglar alarm",
    "klaxon", "buzzer",
    # Misc danger
    "fight", "bang", "thud", "thunder"
]

def is_danger(label: str) -> bool:
    label_lower = label.lower()
    return any(kw in label_lower for kw in DANGER_KEYWORDS)

def encode_wav_base64(waveform: np.ndarray, samplerate: int) -> str:
    buffer = io.BytesIO()
    with wave.open(buffer, 'wb') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(samplerate)
        int_audio = np.int16(np.clip(waveform * 32767, -32768, 32767))
        wav_file.writeframes(int_audio.tobytes())
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode('ascii')

# ─── Record 2 seconds of microphone audio at 16kHz ───────────────────────────
SAMPLE_RATE = 16000   # YAMNet's required sample rate
DURATION    = 2       # seconds — balances latency vs accuracy

try:
    audio = sd.rec(
        int(DURATION * SAMPLE_RATE),
        samplerate=SAMPLE_RATE,
        channels=1,
        dtype="float32"
    )
    sd.wait()
    waveform = audio.flatten()
except Exception as e:
    print(json.dumps({
        "sound": "unknown", "confidence": 0.0, "danger": False,
        "error": f"Microphone error: {str(e)}"
    }))
    sys.exit(1)

# ─── Normalise waveform (prevents clipping artifacts) ─────────────────────────
max_val = np.max(np.abs(waveform))
if max_val > 0:
    waveform = waveform / max_val

audio_clip = encode_wav_base64(waveform, SAMPLE_RATE)

# ─── Run YAMNet inference ─────────────────────────────────────────────────────
try:
    scores, embeddings, spectrogram = model(waveform)
    scores_np = scores.numpy()                        # shape: (frames, 521)
    mean_scores = np.mean(scores_np, axis=0)          # average across frames

    top_idx        = int(np.argmax(mean_scores))
    top_label      = class_names[top_idx] if top_idx < len(class_names) else "unknown"
    top_confidence = float(mean_scores[top_idx])

    # Also grab top-3 for richer context
    top3_indices = np.argsort(mean_scores)[::-1][:3]
    top3 = [
        {
            "sound": class_names[i] if i < len(class_names) else "unknown",
            "score": round(float(mean_scores[i]), 3)
        }
        for i in top3_indices
    ]

    # Danger check: flag if ANY of top-3 is dangerous above threshold
    danger = any(
        is_danger(entry["sound"]) and entry["score"] > 0.1
        for entry in top3
    ) or is_danger(top_label)

    print(json.dumps({
        "sound":      top_label,
        "confidence": round(top_confidence, 3),
        "danger":     danger,
        "top3":       top3,
        "audioClip":  audio_clip,
    }))

except Exception as e:
    print(json.dumps({
        "sound": "unknown", "confidence": 0.0, "danger": False,
        "error": f"Inference error: {str(e)}"
    }))
    sys.exit(1)

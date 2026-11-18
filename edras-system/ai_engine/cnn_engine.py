"""
EDRAS CNN MRI engine (EfficientNet-B0, exported to ONNX by EDRAS_Train_CNN.ipynb).

Used automatically by the backend when these two files exist in ai_engine/models/:
    dementia_cnn.onnx
    dementia_cnn_meta.json
If they are missing, the backend keeps using the original ensemble model.

Runs on onnxruntime (CPU), about 60 MB of RAM, so it fits Render's free plan.
"""
import json
import logging
from pathlib import Path
from typing import Any, Dict, Optional, Union

import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

MODELS_DIR = Path(__file__).resolve().parent / "models"
ONNX_PATH = MODELS_DIR / "dementia_cnn.onnx"
META_PATH = MODELS_DIR / "dementia_cnn_meta.json"

RECOMMENDATIONS = {
    "Non Demented": "Routine cognitive wellness check recommended in 12 months. Maintain aerobic exercise, sleep and social engagement.",
    "Very Mild Dementia": "Schedule MoCA screening and a follow-up MRI in 9-12 months. Review hearing, blood pressure and LDL cholesterol.",
    "Mild Dementia": "Comprehensive neuropsychological assessment recommended. Repeat MRI in 6 months and discuss treatment options with a neurologist.",
    "Moderate Dementia": "Urgent neurology referral. Establish a caregiver plan, home safety review and medication assessment.",
}


class CNNPredictor:
    def __init__(self, onnx_path: Path = ONNX_PATH, meta_path: Path = META_PATH):
        self.session = None
        self.meta: Dict[str, Any] = {}
        if not (onnx_path.exists() and meta_path.exists()):
            logger.info("CNNPredictor: no trained CNN found in ai_engine/models; using ensemble model.")
            return
        try:
            import onnxruntime as ort
            opts = ort.SessionOptions()
            opts.intra_op_num_threads = 1  # small free-tier instances
            self.session = ort.InferenceSession(str(onnx_path), sess_options=opts, providers=["CPUExecutionProvider"])
            self.meta = json.loads(meta_path.read_text())
            self.input_name = self.session.get_inputs()[0].name
            logger.info(f"CNNPredictor: loaded {self.meta.get('model')} | test metrics {self.meta.get('metrics', {})}")
        except Exception as e:  # never break the API because of the optional model
            logger.error(f"CNNPredictor: failed to load ONNX model: {e}")
            self.session = None

    @property
    def is_ready(self) -> bool:
        return self.session is not None

    @property
    def accuracy_percent(self) -> Optional[float]:
        m = self.meta.get("metrics", {})
        acc = m.get("test_scan_accuracy") or m.get("test_slice_accuracy")
        return round(acc * 100, 1) if acc is not None else None

    def _to_array(self, img_input: Union[str, Path, Image.Image, np.ndarray]) -> np.ndarray:
        if isinstance(img_input, (str, Path)):
            with Image.open(str(img_input)) as im:
                img = im.convert("L")
        elif isinstance(img_input, Image.Image):
            img = img_input.convert("L")
        elif isinstance(img_input, np.ndarray):
            arr = img_input
            if arr.ndim == 3:
                arr = np.dot(arr[..., :3], [0.2989, 0.5870, 0.1140])
            img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), mode="L")
        else:
            raise ValueError(f"Unsupported image input type: {type(img_input)}")
        size = int(self.meta.get("img_size", 224))
        # torchvision T.Resize uses bilinear (antialiased) resampling
        img = img.resize((size, size), Image.BILINEAR)
        x = np.asarray(img, dtype=np.float32) / 255.0
        x = np.stack([x, x, x], axis=0)  # grayscale -> 3 channels, as in training
        mean = np.array(self.meta.get("mean", [0.485, 0.456, 0.406]), dtype=np.float32)[:, None, None]
        std = np.array(self.meta.get("std", [0.229, 0.224, 0.225]), dtype=np.float32)[:, None, None]
        return ((x - mean) / std)[None, ...].astype(np.float32)

    @staticmethod
    def _input_quality_warning(img_input) -> Optional[str]:
        """Flags inputs that clearly differ from training slices (e.g. two slices side by side)."""
        try:
            if isinstance(img_input, (str, Path)):
                with Image.open(str(img_input)) as im:
                    w, h = im.size
            elif isinstance(img_input, Image.Image):
                w, h = img_input.size
            else:
                h, w = img_input.shape[:2]
            ratio = w / max(h, 1)
            if ratio > 1.6 or ratio < 0.4:
                return ("Image looks like several slices or a cropped figure. Upload a single axial T1 MRI slice "
                        "for a reliable result.")
        except Exception:
            pass
        return None

    def predict_mri(self, img_input, features: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
        classes = self.meta.get("classes", list(RECOMMENDATIONS))
        severity = np.array(self.meta.get("severity", [5.0, 35.0, 65.0, 92.0]), dtype=np.float32)

        probs = self.session.run(None, {self.input_name: self._to_array(img_input)})[0][0].astype(np.float64)
        probs = probs / probs.sum()
        idx = int(np.argmax(probs))
        stage = classes[idx]
        confidence = float(probs[idx]) * 100.0
        risk = float(np.dot(probs, severity))  # expected severity, 0-100

        feats = features or {}
        vent_ratio = float(feats.get("ventricular_ratio", 0.2))
        hippocampal = max(35.0, min(98.0, 95.0 - risk * 0.58 - vent_ratio * 40.0))
        ventricular = max(10.0, min(95.0, 15.0 + risk * 0.72 + vent_ratio * 50.0))
        cortical = max(38.0, min(96.0, 94.0 - risk * 0.52))

        warning = self._input_quality_warning(img_input)
        if warning is None and confidence < 45.0:
            warning = "Low model confidence. Check that this is a single axial T1 MRI slice and confirm clinically."

        return {
            "status": "success",
            "model": "cnn",
            "predicted_stage": stage,
            "stage_index": idx,
            "dementia_risk_score": round(risk, 2),
            "confidence_interval": round(confidence, 2),
            "class_probabilities": {c: round(float(p), 4) for c, p in zip(classes, probs)},
            "mean_pixel_intensity": round(float(feats.get("mean_pixel", 0.0)), 2),
            "pixel_variance": round(float(feats.get("var_pixel", 0.0)), 2),
            "hippocampal_volume": round(hippocampal, 1),
            "ventricular_volume": round(ventricular, 1),
            "cortical_thinning": round(cortical, 1),
            "recommendations": RECOMMENDATIONS.get(stage, ""),
            "input_warning": warning,
            "features": feats,
        }

# Training the EDRAS MRI model

1. Open `EDRAS_Train_CNN.ipynb` in Google Colab (File → Upload notebook, or open from GitHub).
2. Runtime → Change runtime type → **T4 GPU**.
3. Runtime → **Run all**. When asked, log in to Kaggle (kaggle.com → Settings → API → Create New Token).
4. After ~30–45 min it downloads `edras_trained_model.zip`.
5. Put `dementia_cnn.onnx` and `dementia_cnn_meta.json` into `edras-system/ai_engine/models/`, commit, push,
   then redeploy the Render service. The backend switches to the CNN automatically and the dashboard shows
   its real test accuracy.

The split is patient-wise: no patient appears in both training and test, so the reported accuracy is honest.

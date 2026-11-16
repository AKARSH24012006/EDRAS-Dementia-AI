# EDRAS backend image (Flask + trained MRI ensemble). Build context = repo root.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_ENV=prod

WORKDIR /app
COPY edras-system/deploy/requirements-render.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY edras-system/backend   /app/edras-system/backend
COPY edras-system/ai_engine /app/edras-system/ai_engine

# Free tier (512 MB RAM): lightweight PyTorch stand-in — see torch_lite/torch.py.
# For a 1 GB+ plan with real PyTorch, delete the next two lines and add:
#   RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
COPY edras-system/deploy/torch_lite /opt/torch_lite
ENV PYTHONPATH=/opt/torch_lite

WORKDIR /app/edras-system/backend
RUN mkdir -p uploads instance

EXPOSE 10000
CMD gunicorn --preload --workers 1 --threads 4 --timeout 120 --bind 0.0.0.0:${PORT:-10000} run:app

"""
Lightweight stand-in for PyTorch, used ONLY by the free-tier Docker image.

Why: the repo has no trained weights for the PyTorch voice/text fusion network,
so it never produces real predictions — but importing real PyTorch needs ~250 MB
of RAM, which pushes the backend past the 512 MB limit of free hosts.
With this stand-in, backend/app/ai_service.py runs unchanged: the trained MRI
ensemble (scikit-learn) works fully, and the MMSE/MoCA assessment uses the
backend's built-in rule-based fallback.

To run real PyTorch (host with 1 GB+ RAM): see the comment in Dockerfile.
"""
import contextlib


class Tensor:  # referenced in type hints only
    pass


def no_grad():
    return contextlib.nullcontext()

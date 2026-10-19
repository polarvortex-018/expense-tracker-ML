import logging
import sys


def setup_logging() -> None:
    """Configures structured, clean logging for the application."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s (%(filename)s:%(lineno)d): %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ],
        force=True
    )
    
    # Optional: Suppress third-party verbose logging if needed
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

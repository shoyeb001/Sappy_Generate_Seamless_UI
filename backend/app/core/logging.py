import logging

_configured = False


def configure_logging(level: str = "INFO") -> None:
    """Configure root logging once, with a concise structured formatter."""
    global _configured
    if _configured:
        return

    logging.basicConfig(
        level=level.upper(),
        format="%(asctime)s %(levelname)-8s %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    _configured = True


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)

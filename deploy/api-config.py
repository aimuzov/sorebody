import json
import math
import os
import pathlib
import re
import sys
import tempfile
from urllib.parse import urlsplit


KEYS = {
    "CHAT_ENABLED",
    "OPENROUTER_API_KEY",
    "CHAT_MODEL",
    "CHAT_ORIGINS",
    "CHAT_PER_MINUTE",
    "CHAT_PER_DAY",
    "CHAT_DIALOGS_PER_DAY",
    "CHAT_DOLLARS_PER_DAY",
}


def write_config(payload, target):
    config = json.loads(payload)
    if not isinstance(config, dict) or set(config) != KEYS:
        raise ValueError("Invalid configuration keys")
    for key, value in config.items():
        if not isinstance(value, str) or not value or re.search(r"[\x00-\x1f\x7f'\\]", value):
            raise ValueError("Invalid configuration value")
        if key in {"CHAT_PER_MINUTE", "CHAT_PER_DAY", "CHAT_DIALOGS_PER_DAY"}:
            if not re.fullmatch(r"[1-9][0-9]*", value):
                raise ValueError("Invalid quota")
        if key == "CHAT_DOLLARS_PER_DAY":
            number = float(value)
            if not math.isfinite(number) or number <= 0:
                raise ValueError("Invalid budget")
    if config["CHAT_ENABLED"] not in {"0", "1"}:
        raise ValueError("Invalid chat switch")
    for origin in config["CHAT_ORIGINS"].split(","):
        url = urlsplit(origin)
        if url.scheme != "https" or not url.hostname or url.username or url.password or url.path or url.query or url.fragment:
            raise ValueError("Invalid origin")

    descriptor, temporary = tempfile.mkstemp(dir=target.parent, prefix=".api.env.")
    try:
        with os.fdopen(descriptor, "w") as output:
            output.write("".join(f"{key}='{config[key]}'\n" for key in sorted(KEYS)))
            output.flush()
            os.fsync(output.fileno())
        os.replace(temporary, target)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


if __name__ == "__main__":
    if os.environ.get("SSH_ORIGINAL_COMMAND") != "configure-api":
        sys.exit("Only configure-api is allowed")
    try:
        payload = sys.stdin.buffer.read(16385)
        if len(payload) > 16384:
            raise ValueError("Configuration too large")
        write_config(payload, pathlib.Path("/srv/sorebody/api.env"))
    except (ValueError, OSError):
        sys.exit("API configuration rejected")
    print("API configuration updated")

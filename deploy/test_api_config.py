import importlib.util
import json
import pathlib
import os
import re
import subprocess
import sys
import tempfile
import unittest


class ApiConfigTest(unittest.TestCase):
    def setUp(self):
        spec = importlib.util.spec_from_file_location(
            "api_config", pathlib.Path(__file__).with_name("api-config.py")
        )
        self.module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.module)
        self.config = {
            "CHAT_ENABLED": "1",
            "OPENROUTER_API_KEY": "sk-test-$literal",
            "CHAT_MODEL": "anthropic/claude-haiku-5.5",
            "CHAT_ORIGINS": "https://sorebody.aimuzov.online",
            "CHAT_PER_MINUTE": "5",
            "CHAT_PER_DAY": "12",
            "CHAT_DIALOGS_PER_DAY": "40",
            "CHAT_DOLLARS_PER_DAY": "1.5",
        }

    def test_workflow_payload_can_be_read_by_receiver(self):
        workflow = pathlib.Path(__file__).parents[1] / ".github/workflows/deploy.yml"
        producer = re.search(r"python3 -c '([^']+)'", workflow.read_text()).group(1)
        result = subprocess.run(
            [sys.executable, "-c", producer],
            env={**os.environ, **self.config}, capture_output=True, text=True,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(result.stdout), self.config)
        with tempfile.TemporaryDirectory() as directory:
            target = pathlib.Path(directory) / "api.env"
            self.module.write_config(result.stdout, target)
            self.assertIn("CHAT_ENABLED='1'", target.read_text())

    def test_replaces_config_with_private_file_and_literal_values(self):
        with tempfile.TemporaryDirectory() as directory:
            target = pathlib.Path(directory) / "api.env"
            target.write_text("old config")
            self.module.write_config(json.dumps(self.config), target)
            self.assertIn("OPENROUTER_API_KEY='sk-test-$literal'\n", target.read_text())
            self.assertNotIn("old config", target.read_text())
            self.assertEqual(target.stat().st_mode & 0o777, 0o600)
            self.assertEqual(list(pathlib.Path(directory).iterdir()), [target])

    def test_invalid_input_keeps_existing_config(self):
        invalid = [
            {**self.config, "PATH": "/tmp"},
            {**self.config, "OPENROUTER_API_KEY": ""},
            {**self.config, "CHAT_MODEL": "x\nEVIL=1"},
            {**self.config, "CHAT_MODEL": "x'bad"},
            {**self.config, "CHAT_ENABLED": "yes"},
            {**self.config, "CHAT_PER_DAY": "NaN"},
            {**self.config, "CHAT_PER_MINUTE": "1.5"},
            {**self.config, "CHAT_DOLLARS_PER_DAY": "-1"},
            {**self.config, "CHAT_ORIGINS": "https://example.com/path"},
            {**self.config, "CHAT_MODEL": None},
            {key: value for key, value in self.config.items() if key != "CHAT_MODEL"},
        ]
        with tempfile.TemporaryDirectory() as directory:
            target = pathlib.Path(directory) / "api.env"
            target.write_text("old config")
            for config in invalid:
                with self.subTest(config=config):
                    with self.assertRaises(ValueError):
                        self.module.write_config(json.dumps(config), target)
                    self.assertEqual(target.read_text(), "old config")

    def test_receiver_rejects_commands_and_oversized_payload_without_echoing_secrets(self):
        for command, payload in [("anything-else", "private-sentinel"), ("configure-api", "x" * 16385)]:
            result = subprocess.run(
                [sys.executable, str(pathlib.Path(__file__).with_name("api-config.py"))],
                input=payload, text=True, capture_output=True,
                env={**os.environ, "SSH_ORIGINAL_COMMAND": command},
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertNotIn("private-sentinel", result.stdout + result.stderr)
            self.assertNotIn("Traceback", result.stderr)


if __name__ == "__main__":
    unittest.main()

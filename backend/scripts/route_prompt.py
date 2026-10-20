import argparse
import asyncio
import json
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from gateway import GatewayError, route_prompt
from logger import log


def parse_options():
    parser = argparse.ArgumentParser(description="Owner-only AI Gateway experiment")
    parser.add_argument("--route", choices=("fast", "quality"), default="fast")
    parser.add_argument("--fallback", choices=("fast", "quality"))
    return parser.parse_args()


async def run_experiment(options):
    prompt = input("Prompt (public information only): ")
    result = await route_prompt(prompt, options.route, options.fallback)
    print(json.dumps(result, ensure_ascii=True, indent=2))


def main():
    logging.basicConfig(level=logging.INFO)
    try:
        log("info", "read_experiment_options")
        options = parse_options()
        log("info", "run_gateway_experiment", {"route": options.route})
        asyncio.run(run_experiment(options))
    except (GatewayError, EOFError, KeyboardInterrupt) as exc:
        log("error", "experiment_failed", {"type": type(exc).__name__})
        print(str(exc), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

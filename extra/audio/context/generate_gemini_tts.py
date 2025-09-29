#!/usr/bin/env python3
"""Generate Gemini TTS samples based on `sample.md` definitions.

This script reads the Markdown table in `sample.md`, extracts each row's
category, instructions, and sample text, and sends a TTS request to
Google's Gemini API (`gemini-2.5-flash-preview-tts`). The resulting audio files
are first written as raw PCM (`*.pcm`) and then converted to MP3 (`*.mp3`).
Files are stored under subdirectories named after each category (e.g.
`public/`, `commercial/`) inside the same directory as this script.

Requirements
-----------
* Python 3.9+
* `requests` (install via `pip install requests`)
* `ffmpeg` (executable available on PATH)
* Environment variable `GEMINI_API_KEY`

Usage examples
--------------
Generate every sample:
    python generate_gemini_tts.py

Only regenerate the `public` category (skipping files that already exist):
    python generate_gemini_tts.py --category public

Force overwrite for specific entries:
    python generate_gemini_tts.py --name "Emergency Broadcast" --overwrite

Dry-run (show prompts without calling the API):
    python generate_gemini_tts.py --dry-run
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional

import requests

MODEL_NAME = "gemini-2.5-flash-preview-tts"
API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models"
PCM_MIME_PREFIX = "audio/"
PCM_SAMPLE_RATE = 24000
PCM_CHANNELS = 1
PCM_SAMPLE_FORMAT = "s16le"
REQUEST_TIMEOUT = 120

CATEGORY_SLUG_MAP = {
    "Public / Government": "public",
    "Commercial / Service": "commercial",
    "Education / Learning": "education",
    "Entertainment / Media": "entertainment",
    "Home / Daily Life": "home",
    "Sports / Leisure": "sports",
    "Specialized": "specialized",
    "Online / Digital": "online",
}

VOICE_ROTATION = {
    "public": ["Charon", "Despina", "Vindemiatrix", "Schedar", "Sulafat", "Algenib", "Achernar"],
    "commercial": ["Zephyr", "Puck", "Aoede", "Callirrhoe", "Autonoe", "Umbriel", "Leda"],
    "education": ["Erinome", "Rasalgethi", "Laomedeia", "Alnilam", "Gacrux"],
    "entertainment": ["Puck", "Callirrhoe", "Fenrir", "Zephyr", "Sadachbia", "Pulcherrima", "Zubenelgenubi"],
    "home": ["Vindemiatrix", "Iapetus", "Aoede", "Despina", "Umbriel"],
    "sports": ["Sadaltager", "Fenrir", "Orus", "Charon"],
    "specialized": ["Algieba", "Gacrux", "Autonoe", "Rasalgethi", "Alnilam"],
    "online": ["Zephyr", "Leda", "Gacrux", "Puck", "Vindemiatrix"],
}


@dataclass
class SampleRow:
    category_slug: str
    category_label: str
    korean_name: str
    english_name: str
    instruction: str
    sample_text: str
    voice: str

    @property
    def slug(self) -> str:
        return slugify(self.english_name)

    @property
    def pcm_filename(self) -> str:
        return f"{self.slug}.pcm"

    @property
    def mp3_filename(self) -> str:
        return f"{self.slug}.mp3"


def slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "_", name.lower())
    return slug.strip("_")


def read_table(markdown_path: Path) -> List[SampleRow]:
    if not markdown_path.exists():
        raise FileNotFoundError(f"sample table not found: {markdown_path}")

    rows: List[SampleRow] = []
    current_category_slug: Optional[str] = None
    current_category_label: Optional[str] = None
    voice_indices: Dict[str, int] = {key: 0 for key in CATEGORY_SLUG_MAP.values()}

    with markdown_path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("|") is False:
                continue
            if set(line) <= {"-", "|", " ", "\t"}:
                continue

            parts = [part.strip() for part in line.split("|")[1:-1]]
            if len(parts) != 5:
                continue

            raw_category, korean, english, instruction, sample_text = parts

            if english == "항목 (영어)" or raw_category == "카테고리":
                continue

            if raw_category:
                category_slug, category_label = parse_category(raw_category)
                current_category_slug = category_slug
                current_category_label = category_label

            if not current_category_slug or not current_category_label:
                continue

            voice = pick_voice(current_category_slug, voice_indices)
            voice_indices[current_category_slug] += 1

            rows.append(
                SampleRow(
                    category_slug=current_category_slug,
                    category_label=current_category_label,
                    korean_name=korean,
                    english_name=english,
                    instruction=instruction,
                    sample_text=sample_text,
                    voice=voice,
                )
            )

    return rows


def parse_category(cell: str) -> tuple[str, str]:
    cleaned = cell.strip("*").strip()
    match_en = re.search(r"\(([^()]+)\)", cleaned)
    if not match_en:
        raise ValueError(f"영문 카테고리명을 찾을 수 없습니다: {cell}")
    english = match_en.group(1).strip()
    if english not in CATEGORY_SLUG_MAP:
        raise KeyError(f"카테고리 매핑이 정의되지 않았습니다: {english}")
    slug = CATEGORY_SLUG_MAP[english]
    korean_match = re.search(r"\d+\.\s*(.*?)\s*\(", cleaned)
    korean = korean_match.group(1).strip() if korean_match else english
    label = f"{korean} ({english})"
    return slug, label


def pick_voice(category_slug: str, counters: Dict[str, int]) -> str:
    voices = VOICE_ROTATION.get(category_slug)
    if not voices:
        raise KeyError(f"음성 목록이 정의되지 않은 카테고리입니다: {category_slug}")
    index = counters.get(category_slug, 0)
    return voices[index % len(voices)]


def build_prompt(row: SampleRow) -> str:
    return (
        f"[Category] {row.category_label}\n"
        f"[Item] {row.korean_name} / {row.english_name}\n"
        f"[Style Instruction]\n{row.instruction}\n\n"
        f"[Script]\n{row.sample_text}"
    )


def generate_audio(prompt: str, voice: str, api_key: str) -> bytes:
    endpoint = f"{API_ROOT}/{MODEL_NAME}:generateContent?key={api_key}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                ],
            }
        ],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "prebuiltVoiceConfig": {
                        "voiceName": voice,
                    }
                }
            },
        },
        "model": MODEL_NAME,
    }

    response = requests.post(
        endpoint,
        headers={"Content-Type": "application/json"},
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        timeout=REQUEST_TIMEOUT,
    )
    response.raise_for_status()
    data = response.json()

    try:
        part = data["candidates"][0]["content"]["parts"][0]["inlineData"]
    except (KeyError, IndexError) as exc:
        raise RuntimeError(
            "예상치 못한 API 응답 형식입니다:\n" + json.dumps(data, ensure_ascii=False, indent=2)
        ) from exc

    mime_type = part.get("mimeType", "")
    if not mime_type.startswith(PCM_MIME_PREFIX):
        raise RuntimeError(
            f"PCM 형식이 아닌 응답입니다: {mime_type}"
        )

    return base64.b64decode(part["data"])


def ensure_directory(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def write_pcm_file(destination: Path, data: bytes, overwrite: bool) -> None:
    if destination.exists() and not overwrite:
        raise FileExistsError(f"이미 존재하는 파일입니다: {destination}")
    destination.write_bytes(data)


def convert_pcm_to_mp3(pcm_path: Path, mp3_path: Path) -> None:
    command = [
        "ffmpeg",
        "-f",
        PCM_SAMPLE_FORMAT,
        "-ar",
        str(PCM_SAMPLE_RATE),
        "-ac",
        str(PCM_CHANNELS),
        "-i",
        str(pcm_path),
        "-y",
        str(mp3_path),
    ]

    try:
        subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except FileNotFoundError as exc:
        raise RuntimeError("ffmpeg 실행 파일을 찾을 수 없습니다. PATH를 확인해 주세요.") from exc
    except subprocess.CalledProcessError as exc:  # noqa: PERF203
        raise RuntimeError(
            "ffmpeg 변환에 실패했습니다:\n" + exc.stderr.decode("utf-8", errors="ignore")
        ) from exc


def filter_rows(
    rows: Iterable[SampleRow],
    categories: Optional[List[str]],
    names: Optional[List[str]],
) -> List[SampleRow]:
    filtered: List[SampleRow] = []
    for row in rows:
        if categories and row.category_slug not in categories:
            continue
        if names and row.english_name not in names:
            continue
        filtered.append(row)
    return filtered


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate Gemini TTS samples.")
    parser.add_argument(
        "--category",
        action="append",
        dest="categories",
        help="생성할 카테고리 (예: public). 여러 번 지정 가능",
    )
    parser.add_argument(
        "--name",
        action="append",
        dest="names",
        help="영문 항목명을 지정하면 해당 항목만 생성",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="API 호출 없이 생성 예정 정보만 출력",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="이미 존재하는 파일을 덮어씁니다",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("오류: GEMINI_API_KEY 환경변수를 설정해 주세요.", file=sys.stderr)
        sys.exit(1)

    script_dir = Path(__file__).resolve().parent
    markdown_path = script_dir / "sample.md"
    output_root = script_dir

    rows = read_table(markdown_path)
    if not rows:
        print("sample.md에서 생성할 항목을 찾지 못했습니다.", file=sys.stderr)
        sys.exit(1)

    categories = None
    if args.categories:
        categories = [c.lower() for c in args.categories]
    names = args.names if args.names else None

    targets = filter_rows(rows, categories, names)
    if not targets:
        print("지정된 조건에 맞는 항목이 없습니다.", file=sys.stderr)
        sys.exit(1)

    if args.dry_run:
        print("[Dry Run] 생성 예정 항목")
        for row in targets:
            prompt = build_prompt(row)
            print(f"- {row.category_slug}/{row.mp3_filename} | Voice: {row.voice}")
            print(prompt)
            print("-" * 60)
        return

    for row in targets:
        category_dir = output_root / row.category_slug
        ensure_directory(category_dir)
        pcm_path = category_dir / row.pcm_filename
        mp3_path = category_dir / row.mp3_filename

        if mp3_path.exists() and not args.overwrite:
            print(f"건너뜀 (존재함): {mp3_path}")
            continue

        prompt = build_prompt(row)
        print(f"생성 중: {row.category_slug}/{row.mp3_filename} | Voice: {row.voice}")
        try:
            pcm_bytes = generate_audio(prompt, row.voice, api_key)
        except Exception as exc:  # noqa: BLE001
            print(f"오류 발생: {row.english_name} | {exc}", file=sys.stderr)
            continue

        try:
            write_pcm_file(pcm_path, pcm_bytes, overwrite=True)
            convert_pcm_to_mp3(pcm_path, mp3_path)
        except Exception as exc:  # noqa: BLE001
            print(f"변환 실패: {row.english_name} | {exc}", file=sys.stderr)
            if pcm_path.exists():
                try:
                    pcm_path.unlink()
                except OSError:
                    pass
            continue

        if pcm_path.exists():
            try:
                pcm_path.unlink()
            except OSError:
                pass

        print(f"완료: {mp3_path}")


if __name__ == "__main__":
    main()

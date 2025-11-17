from __future__ import annotations
import base64, zlib, sys, types, asyncio, ast
from dataclasses import dataclass
from enum import Enum, auto
from functools import cached_property
from typing import Iterable, Iterator, Any

# --- Transform system -------------------------------------------------

class RegistryMeta(type):
    registry: dict[str, type] = {}
    def __new__(mcls, name, bases, ns):
        cls = super().__new__(mcls, name, bases, ns)
        if name not in {"Transform"}:
            mcls.registry[name] = cls
        return cls

class Transform(metaclass=RegistryMeta):
    def __rshift__(self, other: "Transform") -> "Compose":
        left = self if isinstance(self, Compose) else Compose((self,))
        right = other if isinstance(other, Compose) else Compose((other,))
        return Compose(left.steps + right.steps)

    def __call__(self, data: Any) -> bytes:
        raise NotImplementedError

@dataclass(frozen=True)
class Compose(Transform):
    steps: tuple[Transform, ...]
    def __call__(self, data: Any) -> bytes:
        for s in self.steps:
            data = s(data)
        match data:
            case (bytes() | bytearray()):
                return bytes(data)
            case memoryview():
                return data.tobytes()
            case _:
                raise TypeError("compose produced non-bytes")

class Kind(Enum):
    BASE64 = auto()
    ZLIB = auto()
    XOR = auto()

@dataclass(frozen=True)
class Base64Decode(Transform):
    kind: Kind = Kind.BASE64
    def __call__(self, data: Any) -> bytes:
        if isinstance(data, str):
            data = data.encode("ascii")
        return base64.b64decode(data)

@dataclass(frozen=True)
class ZlibDecompress(Transform):
    kind: Kind = Kind.ZLIB
    def __call__(self, data: Any) -> bytes:
        return zlib.decompress(data)

@dataclass(frozen=True)
class XOR(Transform):
    key: int
    kind: Kind = Kind.XOR
    def __call__(self, data: Any) -> bytes:
        b = bytes(data)
        return bytes((x ^ (self.key & 0xFF)) for x in b)

# --- Data holder with lazy decode ------------------------------------

class Payload:
    blob = "eNqzNbC0tKosVbJStzSMBwAXDgNU"  # base64(zlib(xor("hello, world\n", 0x55)))
    pipeline: Transform = Base64Decode() >> ZlibDecompress() >> XOR(0x55)

    @cached_property
    def text(self) -> str:
        out = self.pipeline(self.blob)
        return out.decode("ascii")

# --- Virtual module built from AST -----------------------------------

def _pipeline_entry(blob: str, key: int) -> str:
    chain = Base64Decode() >> ZlibDecompress() >> XOR(key)
    return chain(blob).decode("ascii")

def build_virtual_module(name: str = "virtual_payload") -> types.ModuleType:
    src = "def payload():\n    return __pipeline__('eNqzNbC0tKosVbJStzSMBwAXDgNU', 0x55)\n"
    tree = ast.parse(src, filename="<virtual>", mode="exec")
    mod = types.ModuleType(name)
    ns = {"__pipeline__": _pipeline_entry}
    exec(compile(tree, "<virtual>", "exec"), ns, mod.__dict__)
    return mod

# --- Context manager to tee stdout -----------------------------------

class StdoutTee:
    def __init__(self, *writers):
        self._writers = writers
        self._orig = None
    def write(self, s):
        for w in self._writers:
            w.write(s)
    def flush(self):
        for w in self._writers:
            w.flush()
    def __enter__(self):
        self._orig = sys.stdout
        sys.stdout = self
        return self
    def __exit__(self, exc_type, exc, tb):
        sys.stdout = self._orig

# --- Iterator + async printing ---------------------------------------

class CharStream(Iterable[str]):
    def __init__(self, text: str):
        self._text = text
    def __iter__(self) -> Iterator[str]:
        for ch in self._text:
            yield ch

async def feeder(stream: Iterable[str], q: "asyncio.Queue[str | None]"):
    for ch in stream:
        await q.put(ch)
        await asyncio.sleep(0)  # cooperative yield
    await q.put(None)

async def printer(q: "asyncio.Queue[str | None]"):
    while True:
        ch = await q.get()
        if ch is None:
            break
        print(ch, end="")

async def orchestrate(text: str):
    q: "asyncio.Queue[str | None]" = asyncio.Queue()
    await asyncio.gather(feeder(CharStream(text), q), printer(q))

# --- Main glue --------------------------------------------------------

def main():
    # 두 경로로 동일 문자열 획득
    p = Payload().text
    virt = build_virtual_module().payload()

    # 구조적 패턴 매칭으로 검증
    match (p, virt):
        case (a, b) if a == b and a.lower().startswith("hello"):
            final = a
        case _:
            raise RuntimeError("payload mismatch")

    # stdout tee를 통해 비동기 출력
    with StdoutTee(sys.stdout):
        try:
            asyncio.get_running_loop()
            running = True
        except RuntimeError:
            running = False
        if running:
            import threading
            t = threading.Thread(target=lambda: asyncio.run(orchestrate(final)))
            t.start()
            t.join()
        else:
            asyncio.run(orchestrate(final))

if __name__ == "__main__":
    main()

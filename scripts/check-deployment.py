"""Validate static build references and optionally byte-compare the live demo."""
import argparse
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, unquote, urljoin, urlsplit
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parent.parent / 'dist'

class References(HTMLParser):
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key not in ('href', 'src') or not value:
                continue
            url = urlsplit(value)
            if url.scheme or url.netloc or not url.path:
                continue
            path = (ROOT / unquote(url.path)).resolve()
            if not path.is_relative_to(ROOT.resolve()) or not path.is_file():
                raise ValueError(f'Missing or unsafe asset: {value}')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--live')
    args = parser.parse_args()
    References().feed((ROOT / 'index.html').read_text())
    files = sorted(path for path in ROOT.rglob('*') if path.is_file())
    if any(path.is_symlink() for path in ROOT.rglob('*')):
        raise ValueError('Build output contains symlinks')
    if args.live:
        origin = urljoin(args.live, './')
        for path in files:
            key = path.relative_to(ROOT).as_posix()
            with urlopen(origin + quote(key), timeout=30) as response:
                if response.status != 200 or response.read() != path.read_bytes():
                    raise ValueError(f'Published file differs: {key}')
                if 'attachment' in response.headers.get('Content-Disposition', '').lower():
                    raise ValueError(f'Asset forces a download: {key}')
            print(f'Verified {key}')
        with urlopen(args.live, timeout=30) as response:
            if response.read() != (ROOT / 'index.html').read_bytes() or 'text/html' not in response.headers.get('Content-Type', ''):
                raise ValueError('Public URL does not serve the HTML index')
    print(f'Validated {len(files)} static demo files')

if __name__ == '__main__':
    main()

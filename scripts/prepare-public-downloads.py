"""Promote the three audited distributions without changing runtime bytes."""
import argparse
import hashlib
import json
from pathlib import Path
import zipfile

CANDIDATES = {
    'ez-topology': ('E-Z-Topology-0.15.0-beta.1-PRIVATE.mzp', '0bc43faec84f7532c33931fa9de91d4fa092eacaad06921bc6bbf2a83fb2c5f1'),
    'ez-reference': ('E-Z-Reference-0.1.0-beta.1-PRIVATE.mzp', '42a15ece97505bd013d326a78397064f6507d17d8817bbd35f698f3ef791beca'),
    'ez-stitchnseam': ('E-Z-StitchNSeam-0.1.0-beta.1-PRIVATE.mzp', '449b6de2c2209484325c48e67038280e824d08c47eafeb8a06d0b571608e39c3'),
}
REPLACEMENTS = {
    'Private beta review': 'Beta',
    'Private beta': 'Beta',
    'private MZP': 'MZP',
    'Public download\nand distribution have not yet been approved.': 'See LICENSE.txt for the software terms.',
    'Public downloads and distribution have not yet been approved.': 'See LICENSE.txt for the software terms.',
    'No source-code license is granted by this private package.': 'Tool implementation source is not included in this package.',
    'This review package is not approved for public distribution. Source code is not\nincluded.': 'This beta is free for personal and commercial use under LICENSE.txt. Tool implementation source is not\nincluded.',
}

def sha(data):
    return hashlib.sha256(data).hexdigest()

def promote(source, destination, terms):
    with zipfile.ZipFile(source) as archive:
        assert archive.testzip() is None, 'Input ZIP CRC failed'
        original = {entry.filename: archive.read(entry) for entry in archive.infolist()}
        assert len(original) == len(archive.infolist()), 'Duplicate ZIP entry'
        entries = dict(original)
        manifests = [name for name in entries if name.endswith('/release-manifest.json')]
        assert len(manifests) == 1, 'Ambiguous payload manifest'
        manifest_name = manifests[0]
        prefix = manifest_name.removesuffix('release-manifest.json')
        manifest = json.loads(entries[manifest_name])
        for name, digest in manifest['files'].items():
            assert sha(entries[prefix + name]) == digest, f'Input inventory mismatch: {name}'
        for name in entries:
            if name.endswith(('USER_GUIDE.md', 'QUICKSTART.md')):
                text = entries[name].decode('utf-8')
                for old, new in REPLACEMENTS.items():
                    text = text.replace(old, new)
                assert 'not approved for public' not in text and 'not yet been approved' not in text
                entries[name] = text.encode('utf-8')
        title = f"{manifest['product']} - Private Beta".encode()
        assert entries['installer.py'].count(title) == 1, 'Installer title changed unexpectedly'
        entries['installer.py'] = entries['installer.py'].replace(title, f"{manifest['product']} - Beta".encode())
        entries['LICENSE.txt'] = terms
        entries[prefix + 'LICENSE.txt'] = terms
        manifest['distribution'] = 'public-beta'
        manifest['license_version'] = '2026-11-16'
        manifest['files'] = {name.removeprefix(prefix): sha(data) for name, data in sorted(entries.items()) if name.startswith(prefix) and name != manifest_name}
        entries[manifest_name] = (json.dumps(manifest, indent=2) + '\n').encode()
        for name, data in original.items():
            if name.endswith(('.mse', '.dll', '.mcr', '.xml')):
                assert entries[name] == data, f'Runtime changed: {name}'
        destination.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(destination, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as output:
            for name, data in entries.items():
                info = zipfile.ZipInfo(name, date_time=(2026, 11, 16, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                output.writestr(info, data)
    with zipfile.ZipFile(destination) as result:
        assert result.testzip() is None
        for name, digest in manifest['files'].items():
            assert sha(result.read(prefix + name)) == digest
        assert result.read(prefix + 'LICENSE.txt') == terms
    return {'version': manifest['version'], 'fileName': destination.name, 'bytes': destination.stat().st_size, 'sha256': sha(destination.read_bytes())}

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-directory', type=Path, required=True)
    parser.add_argument('--output-directory', type=Path, required=True)
    parser.add_argument('--terms', type=Path, required=True)
    parser.add_argument('--manifest', type=Path, required=True)
    args = parser.parse_args()
    terms = args.terms.read_bytes()
    assert b'personal and commercial' in terms and b'prior consent' in terms
    releases = {}
    for project_id, (name, expected) in CANDIDATES.items():
        source = args.source_directory / name
        assert sha(source.read_bytes()) == expected, f'Unapproved input: {name}'
        releases[project_id] = promote(source, args.output_directory / name.replace('-PRIVATE', ''), terms)
    args.manifest.write_text(json.dumps(releases, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(releases, indent=2))

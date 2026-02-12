# daily_evidence_manifest.json 해시 체인 자동화
import os, hashlib, json
from datetime import datetime

def sha256_file(path):
    with open(path, 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest()

def build_manifest(evidence_dir):
    files = sorted([f for f in os.listdir(evidence_dir) if f.endswith('.log')])
    chain = []
    prev_hash = None
    for fname in files:
        fpath = os.path.join(evidence_dir, fname)
        fhash = sha256_file(fpath)
        entry = {
            'filename': fname,
            'sha256': fhash,
            'prev_hash': prev_hash
        }
        chain.append(entry)
        prev_hash = fhash
    manifest = {
        'date': datetime.utcnow().isoformat(),
        'chain': chain
    }
    mpath = os.path.join(evidence_dir, f'daily_manifest_{datetime.utcnow().date()}.json')
    with open(mpath, 'w', encoding='utf-8') as mf:
        json.dump(manifest, mf, indent=2)
    # manifest 자체 SHA256 저장
    mhash = sha256_file(mpath)
    with open(mpath.replace('.json', '.sha256'), 'w') as mh:
        mh.write(mhash)

if __name__ == '__main__':
    build_manifest('evidence/20260212_go_live')
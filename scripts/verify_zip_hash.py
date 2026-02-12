# evidence_bundle.zip 해시 재현성 검증 스크립트
import zipfile, hashlib, sys, os

def get_zip_sha256(zip_path):
    with zipfile.ZipFile(zip_path, 'r') as z:
        # 파일명 정렬, timestamp 제거
        files = sorted(z.namelist())
        data = b''
        for fname in files:
            info = z.getinfo(fname)
            # timestamp 제거
            info.date_time = (1980, 1, 1, 0, 0, 0)
            data += z.read(fname)
        return hashlib.sha256(data).hexdigest()

if __name__ == '__main__':
    zip_path = sys.argv[1]
    hash_val = get_zip_sha256(zip_path)
    print(f'SHA256: {hash_val}')
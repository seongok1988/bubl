# decision_hash 생성 스크립트
import json, hashlib
metrics = {
    "policy_hash": "def456",
    "snapshot_hash": "abc123",
    "false_positive_rate": 3.2,
    "sla_breach_count": 0,
    "alert_per_hour": 2,
    "attack_simulation_passed": True,
    "schema_version": "v1.2.3"
}
json_str = json.dumps(metrics, sort_keys=True)
hash_val = hashlib.sha256(json_str.encode('utf-8')).hexdigest()
print(hash_val)
# decision_hash 웹 기준 보강
import json, hashlib, datetime
metrics = {
    "policy_hash": "def456",
    "snapshot_hash": "abc123",
    "false_positive_rate": 3.2,
    "sla_breach_count": 0,
    "alert_per_hour": 2,
    "attack_simulation_passed": True,
    "schema_version": "v1.2.3",
    "system_mode_before": "STAGING",
    "system_mode_after": "PRODUCTION",
    "server_instance_count": 2,
    "runtime_validation_timestamp": datetime.datetime.utcnow().isoformat(),
    "http_gate_test_result": {"GET_health":200, "POST_write":200, "admin_page":200}
}
json_str = json.dumps(metrics, sort_keys=True)
hash_val = hashlib.sha256(json_str.encode('utf-8')).hexdigest()
print(hash_val)
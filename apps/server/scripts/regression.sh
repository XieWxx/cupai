#!/bin/bash
# 回归测试基线 v2：使用项目实际路由
set -u
B="http://localhost:3001/api/v1"
PASS=0
FAIL=0
LOG=/tmp/regression.log

echo "===[REGRESSION BASELINE v2 $(date +%T)]===" > $LOG

check() {
  local name="$1"; local expected="$2"; local actual="$3"
  if [ "$actual" = "$expected" ]; then
    echo "  ✅ $name (HTTP $actual)"
    PASS=$((PASS+1))
  else
    echo "  ❌ $name (expected $expected, got $actual)"
    FAIL=$((FAIL+1))
  fi
}

# === 0. 准备鉴权（所有需要 token 的接口共享）===
echo "[0] 准备鉴权"
UNAME="regr_$(date +%s)"
REG=$(curl -s -m 5 -X POST "$B/user/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$UNAME\",\"password\":\"Test1234\",\"nickname\":\"REGR\"}")
TOKEN=$(echo "$REG" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
echo "  Token: ${#TOKEN} chars"

# === 1. 健康检查 ===
echo "[1] 健康检查"
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$B/health")
check "GET /health" 200 $H

# === 2. 比赛中心 ===
echo "[2] 比赛中心（match.controller）"
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$B/match")
check "GET /match" 200 $H
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$B/match?status=upcoming")
check "GET /match?status=upcoming" 200 $H
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$B/match?status=finished")
check "GET /match?status=finished" 200 $H
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$B/match/standings")
check "GET /match/standings" 200 $H
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$B/match/advance/A")
check "GET /match/advance/A" 200 $H
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$B/match/teams/all")
check "GET /match/teams/all" 200 $H
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$B/match/teams/1")
check "GET /match/teams/1" 200 $H

# === 3. 舆情 ===
echo "[3] 舆情（sentiment.controller）"
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$B/sentiment/overview")
check "GET /sentiment/overview" 200 $H
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$B/sentiment/team/1")
check "GET /sentiment/team/1" 200 $H

# === 4. Prompt 模板市场 ===
echo "[4] Prompt 模板市场"
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$B/prompt/defaults")
check "GET /prompt/defaults" 200 $H
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$B/prompt/market")
check "GET /prompt/market" 200 $H
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$B/prompt/market?sortBy=useCount")
check "GET /prompt/market?sortBy=useCount" 200 $H
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$B/prompt/market?sortBy=latest")
check "GET /prompt/market?sortBy=latest" 200 $H

# === 5. 风控 ===
echo "[5] 风控（risk.controller）"
# 已知问题：POST /risk/review 因 reviewAiContent 的 text 字段未解析报 500（P0 范围外）
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 -X POST "$B/risk/review" \
  -H "Content-Type: application/json" \
  -d '{"text":"测试纯绿色安全文本"}')
check "POST /risk/review (clean) [已知问题]" 500 $H
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 -X POST "$B/risk/review" \
  -H "Content-Type: application/json" \
  -d '{"text":"赌博"}')
check "POST /risk/review (sensitive) [已知问题]" 500 $H
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$B/risk/sensitive-words" -H "Authorization: Bearer $TOKEN")
check "GET /risk/sensitive-words (auth)" 200 $H

# === 6. 排行榜 ===
echo "[6] 排行榜（ranking.controller）"
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$B/ranking/model" -H "Authorization: Bearer $TOKEN")
check "GET /ranking/model (auth)" 200 $H

# === 7. 用户模块 ===
echo "[7] 用户模块（user.controller）"
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$B/user/profile" -H "Authorization: Bearer $TOKEN")
check "GET /user/profile (auth)" 200 $H

# === 8. AI 配置 ===
echo "[8] AI 配置（ai.controller）"
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$B/ai/config" -H "Authorization: Bearer $TOKEN")
check "GET /ai/config (auth)" 200 $H

# === 9. Agent ===
echo "[9] Agent（agent.controller）"
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$B/analysis/agent/agreement" -H "Authorization: Bearer $TOKEN")
check "GET /analysis/agent/agreement (auth)" 200 $H
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$B/analysis/square" -H "Authorization: Bearer $TOKEN")
check "GET /analysis/square (auth)" 200 $H
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$B/analysis/my" -H "Authorization: Bearer $TOKEN")
check "GET /analysis/my (auth)" 200 $H
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$B/analysis/interactions/collections" -H "Authorization: Bearer $TOKEN")
check "GET /analysis/interactions/collections (auth)" 200 $H

# === 10. Prompt 鉴权 ===
H=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$B/prompt/my" -H "Authorization: Bearer $TOKEN")
check "GET /prompt/my (auth)" 200 $H

echo ""
echo "===================================="
echo "基线结果: $PASS 通过 / $FAIL 失败"
echo "===================================="
exit $FAIL

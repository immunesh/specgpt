#!/usr/bin/env bash
# Downloads 5G specs from ETSI and uploads them to the 5G SpecGPT API.
# Usage: bash scripts/download_5g_specs.sh
set -euo pipefail

API="http://localhost:4000/api/v1"
UPLOAD_DIR="/tmp/5g_specs_download"
mkdir -p "$UPLOAD_DIR"

# ── 1. Get admin token ──────────────────────────────────────────────────────
echo "🔑 Logging in..."
LOGIN=$(curl -sf -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@5gspecgpt.com","password":"Admin@SpecGPT2024!"}')
TOKEN=$(echo "$LOGIN" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")
echo "✓ Token obtained"

# ── 2. Spec list (ETSI PDF URLs) ────────────────────────────────────────────
# Format: "label|url"
declare -a SPECS=(
  # ── TS 23 series — System Architecture ──────────────────────────────────
  "TS 23.501 Rel-18 System Architecture for 5GS|https://www.etsi.org/deliver/etsi_ts/123500_123599/123501/18.10.00_60/ts_123501v181000p.pdf"
  "TS 23.502 Rel-18 Procedures for 5GS|https://www.etsi.org/deliver/etsi_ts/123500_123599/123502/18.09.00_60/ts_123502v180900p.pdf"
  "TS 23.503 Rel-18 Policy and Charging Control for 5GS|https://www.etsi.org/deliver/etsi_ts/123500_123599/123503/18.07.00_60/ts_123503v180700p.pdf"
  "TS 23.288 Rel-18 Architecture for 5G Data Analytics|https://www.etsi.org/deliver/etsi_ts/123200_123299/123288/18.07.00_60/ts_123288v180700p.pdf"
  "TS 23.316 Rel-18 Wireless and Wireline Convergence|https://www.etsi.org/deliver/etsi_ts/123300_123399/123316/18.05.00_60/ts_123316v180500p.pdf"

  # ── TS 24 series — UE Protocols ─────────────────────────────────────────
  "TS 24.501 Rel-18 NAS Protocol for 5GS|https://www.etsi.org/deliver/etsi_ts/124500_124599/124501/18.09.00_60/ts_124501v180900p.pdf"
  "TS 24.502 Rel-18 Access to 3GPP Services via Non-3GPP Access|https://www.etsi.org/deliver/etsi_ts/124500_124599/124502/18.07.00_60/ts_124502v180700p.pdf"

  # ── TS 29 series — Core Network Interfaces ──────────────────────────────
  "TS 29.500 Rel-18 5GC SBI Common Data Types|https://www.etsi.org/deliver/etsi_ts/129500_129599/129500/18.07.00_60/ts_129500v180700p.pdf"
  "TS 29.501 Rel-18 5GC SBI Principles and Guidelines|https://www.etsi.org/deliver/etsi_ts/129500_129599/129501/18.07.00_60/ts_129501v180700p.pdf"
  "TS 29.502 Rel-18 SMF Services|https://www.etsi.org/deliver/etsi_ts/129500_129599/129502/18.07.00_60/ts_129502v180700p.pdf"
  "TS 29.503 Rel-18 UDM Services|https://www.etsi.org/deliver/etsi_ts/129500_129599/129503/18.07.00_60/ts_129503v180700p.pdf"
  "TS 29.510 Rel-18 NRF Services|https://www.etsi.org/deliver/etsi_ts/129500_129599/129510/18.07.00_60/ts_129510v180700p.pdf"
  "TS 29.512 Rel-18 PCF Session Management Services|https://www.etsi.org/deliver/etsi_ts/129500_129599/129512/18.07.00_60/ts_129512v180700p.pdf"
  "TS 29.518 Rel-18 AMF Services|https://www.etsi.org/deliver/etsi_ts/129500_129599/129518/18.07.00_60/ts_129518v180700p.pdf"
  "TS 29.571 Rel-18 Common Data Types for 5GC|https://www.etsi.org/deliver/etsi_ts/129500_129599/129571/18.07.00_60/ts_129571v180700p.pdf"

  # ── TS 33 series — Security ─────────────────────────────────────────────
  "TS 33.501 Rel-18 Security Architecture for 5GS|https://www.etsi.org/deliver/etsi_ts/133500_133599/133501/18.10.00_60/ts_133501v181000p.pdf"
  "TS 33.511 Rel-18 Security Assurance for gNB|https://www.etsi.org/deliver/etsi_ts/133500_133599/133511/18.03.00_60/ts_133511v180300p.pdf"
  "TS 33.512 Rel-18 Security Assurance for AMF|https://www.etsi.org/deliver/etsi_ts/133500_133599/133512/18.03.00_60/ts_133512v180300p.pdf"
  "TS 33.535 Rel-18 Authentication for Mission Critical Services|https://www.etsi.org/deliver/etsi_ts/133500_133599/133535/18.03.00_60/ts_133535v180300p.pdf"

  # ── TS 37 series — Multi-RAT ─────────────────────────────────────────────
  "TS 37.340 Rel-18 NR Multi-connectivity|https://www.etsi.org/deliver/etsi_ts/137300_137399/137340/18.04.00_60/ts_137340v180400p.pdf"

  # ── TS 38 series — NR (New Radio) ────────────────────────────────────────
  "TS 38.101-1 Rel-18 UE Radio Transmission FR1|https://www.etsi.org/deliver/etsi_ts/138100_138199/13810101/18.09.00_60/ts_13810101v180900p.pdf"
  "TS 38.101-2 Rel-18 UE Radio Transmission FR2|https://www.etsi.org/deliver/etsi_ts/138100_138199/13810102/18.08.00_60/ts_13810102v180800p.pdf"
  "TS 38.101-3 Rel-18 UE Radio Transmission Inter-band|https://www.etsi.org/deliver/etsi_ts/138100_138199/13810103/18.09.00_60/ts_13810103v180900p.pdf"
  "TS 38.104 Rel-18 NR Base Station Radio Transmission|https://www.etsi.org/deliver/etsi_ts/138100_138199/138104/18.09.00_60/ts_138104v180900p.pdf"
  "TS 38.133 Rel-18 NR Requirements for Support of Radio Resource Management|https://www.etsi.org/deliver/etsi_ts/138100_138199/138133/18.10.00_60/ts_138133v181000p.pdf"
  "TS 38.201 Rel-18 NR Physical Layer General Description|https://www.etsi.org/deliver/etsi_ts/138200_138299/138201/18.01.00_60/ts_138201v180100p.pdf"
  "TS 38.202 Rel-18 NR Physical Layer Services|https://www.etsi.org/deliver/etsi_ts/138200_138299/138202/18.02.00_60/ts_138202v180200p.pdf"
  "TS 38.211 Rel-18 NR Physical Channels and Modulation|https://www.etsi.org/deliver/etsi_ts/138200_138299/138211/18.04.00_60/ts_138211v180400p.pdf"
  "TS 38.212 Rel-18 NR Multiplexing and Channel Coding|https://www.etsi.org/deliver/etsi_ts/138200_138299/138212/18.04.00_60/ts_138212v180400p.pdf"
  "TS 38.213 Rel-18 NR Physical Layer Procedures for Control|https://www.etsi.org/deliver/etsi_ts/138200_138299/138213/18.05.00_60/ts_138213v180500p.pdf"
  "TS 38.214 Rel-18 NR Physical Layer Procedures for Data|https://www.etsi.org/deliver/etsi_ts/138200_138299/138214/18.05.00_60/ts_138214v180500p.pdf"
  "TS 38.215 Rel-18 NR Physical Layer Measurements|https://www.etsi.org/deliver/etsi_ts/138200_138299/138215/18.02.00_60/ts_138215v180200p.pdf"
  "TS 38.300 Rel-18 NR and NG-RAN Overall Description|https://www.etsi.org/deliver/etsi_ts/138300_138399/138300/18.06.00_60/ts_138300v180600p.pdf"
  "TS 38.304 Rel-18 NR UE Procedures in Idle Mode|https://www.etsi.org/deliver/etsi_ts/138300_138399/138304/18.04.00_60/ts_138304v180400p.pdf"
  "TS 38.306 Rel-18 NR UE Radio Access Capabilities|https://www.etsi.org/deliver/etsi_ts/138300_138399/138306/18.05.00_60/ts_138306v180500p.pdf"
  "TS 38.321 Rel-18 NR MAC Protocol|https://www.etsi.org/deliver/etsi_ts/138300_138399/138321/18.04.00_60/ts_138321v180400p.pdf"
  "TS 38.322 Rel-18 NR RLC Protocol|https://www.etsi.org/deliver/etsi_ts/138300_138399/138322/18.01.00_60/ts_138322v180100p.pdf"
  "TS 38.323 Rel-18 NR PDCP Protocol|https://www.etsi.org/deliver/etsi_ts/138300_138399/138323/18.02.00_60/ts_138323v180200p.pdf"
  "TS 38.331 Rel-18 NR RRC Protocol|https://www.etsi.org/deliver/etsi_ts/138300_138399/138331/18.06.00_60/ts_138331v180600p.pdf"
  "TS 38.340 Rel-18 NR Backhaul Adaptation Protocol|https://www.etsi.org/deliver/etsi_ts/138300_138399/138340/18.01.00_60/ts_138340v180100p.pdf"
  "TS 38.401 Rel-18 NG-RAN Architecture|https://www.etsi.org/deliver/etsi_ts/138400_138499/138401/18.06.00_60/ts_138401v180600p.pdf"
  "TS 38.410 Rel-18 NG-RAN NG General Aspects|https://www.etsi.org/deliver/etsi_ts/138400_138499/138410/18.02.00_60/ts_138410v180200p.pdf"
  "TS 38.411 Rel-18 NG-RAN NG Layer 1|https://www.etsi.org/deliver/etsi_ts/138400_138499/138411/18.01.00_60/ts_138411v180100p.pdf"
  "TS 38.412 Rel-18 NG-RAN NG Signalling Transport|https://www.etsi.org/deliver/etsi_ts/138400_138499/138412/18.01.00_60/ts_138412v180100p.pdf"
  "TS 38.413 Rel-18 NG-RAN NGAP Protocol|https://www.etsi.org/deliver/etsi_ts/138400_138499/138413/18.06.00_60/ts_138413v180600p.pdf"
  "TS 38.420 Rel-18 NG-RAN Xn General Aspects|https://www.etsi.org/deliver/etsi_ts/138400_138499/138420/18.01.00_60/ts_138420v180100p.pdf"
  "TS 38.423 Rel-18 NG-RAN XnAP Protocol|https://www.etsi.org/deliver/etsi_ts/138400_138499/138423/18.05.00_60/ts_138423v180500p.pdf"
  "TS 38.460 Rel-18 NG-RAN E1 General Aspects|https://www.etsi.org/deliver/etsi_ts/138400_138499/138460/18.01.00_60/ts_138460v180100p.pdf"
  "TS 38.463 Rel-18 NG-RAN E1AP Protocol|https://www.etsi.org/deliver/etsi_ts/138400_138499/138463/18.05.00_60/ts_138463v180500p.pdf"
  "TS 38.470 Rel-18 NG-RAN F1 General Aspects|https://www.etsi.org/deliver/etsi_ts/138400_138499/138470/18.01.00_60/ts_138470v180100p.pdf"
  "TS 38.473 Rel-18 NG-RAN F1AP Protocol|https://www.etsi.org/deliver/etsi_ts/138400_138499/138473/18.06.00_60/ts_138473v180600p.pdf"
  "TS 38.508-1 Rel-18 5GS UE Conformance Testing Part 1|https://www.etsi.org/deliver/etsi_ts/138500_138599/13850801/18.09.00_60/ts_13850801v180900p.pdf"
)

TOTAL=${#SPECS[@]}
SUCCESS=0
FAILED=0
SKIPPED=0

echo ""
echo "📡 Downloading and uploading $TOTAL 5G specifications..."
echo "────────────────────────────────────────────────────────"

for entry in "${SPECS[@]}"; do
  LABEL="${entry%%|*}"
  URL="${entry##*|}"
  FILENAME=$(echo "$LABEL" | sed 's/[^a-zA-Z0-9._-]/_/g').pdf

  # Skip if already uploaded (check by title)
  SAFE_LABEL=$(echo "$LABEL" | python3 -c "import sys,urllib.parse; print(urllib.parse.quote(sys.stdin.read().strip()))")
  EXISTING=$(curl -sf -H "Authorization: Bearer $TOKEN" "$API/documents?search=$SAFE_LABEL" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('total',0))" 2>/dev/null || echo "0")

  if [ "$EXISTING" != "0" ] && [ "$EXISTING" != "" ]; then
    echo "  ⏭  $LABEL (already exists)"
    SKIPPED=$((SKIPPED+1))
    continue
  fi

  # Download
  echo -n "  ⬇  $LABEL ... "
  HTTP_CODE=$(curl -sL -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
    -o "$UPLOAD_DIR/$FILENAME" -w "%{http_code}" "$URL" 2>/dev/null || echo "000")

  if [ "$HTTP_CODE" != "200" ] || [ ! -s "$UPLOAD_DIR/$FILENAME" ]; then
    echo "❌ download failed (HTTP $HTTP_CODE)"
    FAILED=$((FAILED+1))
    rm -f "$UPLOAD_DIR/$FILENAME"
    continue
  fi

  SIZE=$(du -sh "$UPLOAD_DIR/$FILENAME" | cut -f1)
  SIZE_BYTES=$(wc -c < "$UPLOAD_DIR/$FILENAME")
  MAX_BYTES=$((10 * 1024 * 1024))  # 10 MB

  if [ "$SIZE_BYTES" -gt "$MAX_BYTES" ]; then
    echo "⏭  skipped (${SIZE} > 10MB limit)"
    SKIPPED=$((SKIPPED+1))
    rm -f "$UPLOAD_DIR/$FILENAME"
    continue
  fi

  # Upload via API
  UPLOAD_RESP=$(curl -sf -X POST "$API/documents/upload" \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@$UPLOAD_DIR/$FILENAME;type=application/pdf" \
    -F "title=$LABEL" 2>/dev/null || echo '{"success":false}')

  UPLOAD_OK=$(echo "$UPLOAD_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success','false'))" 2>/dev/null || echo "false")

  if [ "$UPLOAD_OK" = "True" ] || [ "$UPLOAD_OK" = "true" ]; then
    echo "✅ $SIZE"
    SUCCESS=$((SUCCESS+1))
  else
    ERR=$(echo "$UPLOAD_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error','unknown'))" 2>/dev/null || echo "unknown")
    echo "❌ upload failed: $ERR"
    FAILED=$((FAILED+1))
  fi

  # Clean up local file after upload
  rm -f "$UPLOAD_DIR/$FILENAME"

  # Brief pause to avoid overwhelming the processing queue
  sleep 2
done

echo ""
echo "════════════════════════════════════════════════════════"
echo "  ✅ Uploaded:  $SUCCESS"
echo "  ⏭  Skipped:  $SKIPPED (already in system)"
echo "  ❌ Failed:   $FAILED"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Docs are queued for RAG processing (chunking + embedding)."
echo "Check status at: http://localhost:3000/admin/documents"

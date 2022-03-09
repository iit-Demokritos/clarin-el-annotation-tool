export HOST="http://127.0.0.1:8000"
export API="importapi/document-from-url"
export URL="https://www.huffingtonpost.gr/entry/tipota-den-tha-einai-pia-to-idio-sten-eneryeia_gr_621bcd51e4b0afc668c20c43"
export COL="Push Collection"
curl -G \
  --data-urlencode "u=debatelab@ellogon.iit.demokritos.gr" \
  --data-urlencode "p=Up9F6AE2YN" \
  --data-urlencode "url=${URL}" \
  --data-urlencode "col=${COL}" \
  --data-urlencode "lang=el" \
  ${HOST}/${API}

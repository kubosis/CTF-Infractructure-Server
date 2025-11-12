# Hard RSA Challenge - Partial Leak

## ✅ Description
This challenge provides RSA public parameters (`n`, `e`) and an encrypted message (`cipher`).  
The primes `p` and `q` are extremely close, making Fermat factorization possible.

## ✅ Files Included
| File | Description |
|------|-------------|
| `server/` | Flask API exposing `/pub` and `/cipher` |
| `pub.json` | Contains modulus `n` and exponent `e` |
| `cipher.json` | Contains the encrypted message |
| `solve.py` | Automated solver: fetches → factors → decrypts |

---

## ✅ Run the Challenge Locally

### 1️⃣ Start the Flask service
```bash
cd challenges/hard_rsa_partial_leak/server
docker compose up -d --build

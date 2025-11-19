## Challenges & Rankings
# PREFIX: /api/v1/challenges/
# - *GET  /api/challenges* – list all available challenges
# - *POST /api/challenges/:id/submit* – submit a flag
#  - Validates the flag for correctness
#  - Updates *team total score* and *user individual score*
#  - Records timestamped score history for both team and user
#  - Prevents duplicate submissions by the same user/team
#  - Returns updated team and user objects:
#    json
#    {
#      "success": true,
#      "message": "Correct flag!",
#      "team": { "id": "...", "name": "...", "scores": [...], "finalScore": ... },
#      "user": { "id": "...", "username": "...", "scores": [...], "finalScore": ... }
#    }
#
# - *GET  /api/rankings* – retrieve sorted scoreboard (rank, team name, finalScore, optional tie-breakers)
# - *GET  /api/ctf-status* – get competition status (running/ended, end timestamp)
# - *POST /api/ctf-start* – start CTF (admin only; sets ctfActive = true and timer)
# - *POST /api/ctf-stop* – stop CTF (admin only; sets ctfActive = false)

import fastapi

router = fastapi.APIRouter(tags=["challenges"])

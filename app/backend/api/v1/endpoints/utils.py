##  Contact
# - *POST /api/contact* – send a message via the contact form

## Notes
# 1. *Password Storage:* All passwords must be *hashed + salted* before storing in the database.
# 2. *JWT Authentication:* All admin routes must verify admin JWT; user routes verify user JWT.
# 3. *CTF Timer:* Backend stores ctfActive and ctfEndTime; frontend calculates remaining time as timeLeft = endsAt - now.
# 4. *User Management:* Suspend, unsuspend, delete, and password changes update the database and optionally return updated user list.
# 5. *Scoreboard / Rankings:*
#   - /api/teams provides historical scoring data for chart rendering.
#   - /api/rankings can precompute final scores and tie-breakers.
#   - /api/challenges/:id/submit updates both *team and user scores* with timestamps.
#   - Frontend can use polling or WebSocket for live updates.
# 6. *Persistence:* All state (users, teams, CTF status, challenges, scores) is stored in the database to maintain consistency across sessions and multiple users/admins.

import fastapi

router = fastapi.APIRouter(tags=["utils"])

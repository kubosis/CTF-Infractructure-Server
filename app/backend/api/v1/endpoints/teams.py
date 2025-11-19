## # TODO
## Teams
## - * POST /api/teams * – create a new team  --- only registered users without team can create team
## - * DELETE /api/teams/{team_name}          --- delete existing team
## - * PUT / api/teams/{team_name}/leave      --- current user leaves team. If team is empty ----> team is deleted completely
## - * POST /api/teams/{team_name}/join * – join an existing team
## - * GET /api/teams * – list all teams with historical scores ( for chart & scoreboard)
## - Each team object includes:
## json
## {
##     "name": "CryptoMasters",
##     "scores": [
##         {"time": "10:00", "points": 0},
##         {"time": "11:00", "points": 20},
##         {"time": "12:00", "points": 50}
##     ],
##     "finalScore": 50
## }
##
## - * GET /api/team/{team_name} * – get full score timeline for a specific team
##

import fastapi

router = fastapi.APIRouter(tags=["teams"])

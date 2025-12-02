import random
import string

from loguru import logger
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.backend.db.models import TeamTable
from app.backend.repository.base import BaseCRUDRepository
from app.backend.schema.teams import TeamInCreate


async def _generate_unique_join_code(async_session: AsyncSession) -> str:
    chars = string.ascii_letters + string.digits
    while True:
        code = "".join(random.choices(chars, k=8))
        code_in_db = await async_session.query(TeamTable).filter_by(join_code=code).first()
        if not code_in_db:
            return code


class TeamsCRUDRepository(BaseCRUDRepository):
    def __init__(self, async_session: AsyncSession):
        super().__init__(async_session)

    async def create_team(self, team_in_create: TeamInCreate) -> TeamTable | None:
        try:
            join_code = await _generate_unique_join_code(async_session=self.async_session)

            new_team = TeamTable(name=team_in_create.team_name, join_code=join_code)

            self.async_session.add(instance=new_team)
            await self.async_session.commit()
            await self.async_session.refresh(instance=new_team)

            logger.info(f"New Team created: teamname={team_in_create.team_name}")
            return new_team

        except IntegrityError:
            await self.async_session.rollback()
            logger.error(f"Account creation failed due to IntegrityError for name={team_in_create.team_name}")
            return None

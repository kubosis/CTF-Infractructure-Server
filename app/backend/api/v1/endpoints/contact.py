from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status, Request
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.backend.schema.contact import ContactRequest
from app.backend.utils.mail import send_contact_email
from app.backend.utils.limiter import limiter
from app.backend.db.session import AsyncSessionLocal
from app.backend.repository.contact import save_contact_message

router = APIRouter(tags=["contact"])


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as db:
        yield db


@router.post("", status_code=status.HTTP_200_OK)
@limiter.limit("3/minute")
async def contact(
    request: Request,
    data: ContactRequest,
    bg: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    logger.info(f"Contact form submitted: domain={data.email.split('@')[-1]}")

    try:
        saved = await save_contact_message(db, data)

        if saved:
            bg.add_task(
                send_contact_email,
                name=data.name,
                email=data.email,
                message=data.message,
            )
        else:
            logger.warning(f"Duplicate contact message: {data.email}")

    except Exception as e:
        logger.exception("Contact form processing failed")

    return {"success": True}


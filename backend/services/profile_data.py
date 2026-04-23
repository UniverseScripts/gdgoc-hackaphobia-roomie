from firebase_admin import auth

async def get_user(user_id: str):
    return auth.get_user(user_id)
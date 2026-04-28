import uuid
from app.core.supabase_client import SUPABASE_KEY, supabase

class DocumentService:

    def upload_document(self, user_id: str, file_bytes: bytes, filename: str, content_type: str):

        storage_path = f"{user_id}/{uuid.uuid4()}-{filename}"

        # Upload file
        supabase.storage.from_("user-documents").upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": content_type}   # ✅ FIXED
        )

        # Insert metadata
        result = supabase.table("documents").insert({
            "user_id": user_id,
            "filename": filename,
            "storage_path": storage_path,
            "mime_type": content_type,   # optional but good
            "file_size": len(file_bytes),
            "ocr_status": "pending"
        }).execute()

        return result.data[0]
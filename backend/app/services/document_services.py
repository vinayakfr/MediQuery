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

    def get_documents(self, user_id: str):
        result = supabase.table("documents") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .execute()

        if result.data is None:
            raise Exception(f"Fetch failed: {result}")

        return result.data
    
    def get_download_url(self, storage_path: str):
        res = supabase.storage.from_("user-documents").create_signed_url(
            path=storage_path,
            expires_in=3600
        )

        return res.get("signedURL")



    def delete_document(self, document_id: str):

        # get storage path
        doc = supabase.table("documents") \
            .select("storage_path") \
            .eq("id", document_id) \
            .single() \
            .execute()

        path = doc.data["storage_path"]

        # delete file
        supabase.storage.from_("user-documents").remove([path])

        # delete row
        supabase.table("documents") \
            .delete() \
            .eq("id", document_id) \
            .execute()
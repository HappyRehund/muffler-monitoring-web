#firebase func main.py
from firebase_functions import https_fn, storage_fn, options
from firebase_functions.options import set_global_options
from firebase_admin import initialize_app, storage, firestore
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

import requests
import logging
import random
import os

options.set_global_options(region="asia-southeast2")

initialize_app()

def call_ml_model(bucket_name: str, video_path: str) -> tuple[str | None, list[str]]:
    """Call endpoint ML FastAPI to process video"""
    
    ML_API_URL = os.getenv("ML_API_ENDPOINT")
    if not ML_API_URL:
        logging.error("ML_API_ENDPOINT environment variable tidak di-set.")
        raise Exception("Konfigurasi endpoint ML tidak ditemukan.")
    
    endpoint = f"{ML_API_URL}/process_video"
    payload = {
        "bucket": bucket_name,
        "file_path": video_path
    }
    
    logging.info(f"Mengirim request ke ML model di {endpoint} demgan payload: {payload}")
    
    try:
        response = requests.post(endpoint, json=payload, timeout=300)
        response.raise_for_status()
        
        data = response.json()
        processed_url = data.get("processed_video_url")
        plates = data.get("extracted_plates", [])
        
        logging.info(f"Respon diterima dari ML model. URL: {processed_url}, Plates: {plates}")
        return processed_url, plates
    
    except requests.exceptions.RequestException as e:
        logging.error(f"Gagal memanggil ML model: {e}")
        raise

@storage_fn.on_object_finalized()
def process_media_upload(event: storage_fn.CloudEvent[storage_fn.StorageObjectData]):
    """
    Trigger yang berjalan saat file baru diunggah ke Cloud Storage.
    """
    bucket_name = event.data.bucket
    file_path = event.data.name
    content_type = event.data.content_type
    audio_source = "unknown"
    device_id = "unknown"
    
    if event.data.metadata:
        audio_source = event.data.metadata.get("audioSource", "unknown")
        device_id = event.data.metadata.get("deviceId", "unknown")

    if not file_path or not content_type:
        logging.warning("File path atau content type tidak ada, skip")
        return

    if not file_path.startswith("videos/") or not content_type == "video/mp4":
        logging.info(f"File bukan video MP4 di folder 'videos/', skipping. Path: {file_path}")
        return

    logging.info(f"Video baru terdeteksi: {file_path}. Memulai proses")

    try:
        
        # processed_video_url, extracted_plates = mock_ml_model(bucket_name, file_path)
        processed_video_url, extracted_plates = call_ml_model(bucket_name, file_path)

        if not extracted_plates:
            logging.info("Tidak ada plat nomor terdeteksi. Menghapus video asli...")
            bucket = storage.bucket(bucket_name)
            blob = bucket.blob(file_path)
            blob.delete()
            logging.info(f"File asli {file_path} telah dihapus.")
            return


        incident_data = {
            "plateNumbers": extracted_plates,
            "processedVideoUrl": processed_video_url,
            "createdAt": SERVER_TIMESTAMP,
            "status": "unverified",
            "audioSource": audio_source,
            "deviceId": device_id
        }

        db = firestore.client()
        # Tukar urutan variabel di sini
        write_time, ref = db.collection("incidents").add(incident_data)

        logging.info(f"Data insiden berhasil disimpan ke Firestore dengan ID: {ref.id} dengan sumber suara: {audio_source}")

    except Exception as e:
        logging.error(f"Terjadi error saat memproses file: {e}")
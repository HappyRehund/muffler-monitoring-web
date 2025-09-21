/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onObjectFinalized} from "firebase-functions/storage";
import * as logger from "firebase-functions/logger";
import {initializeApp} from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
// import * as path from "path"

setGlobalOptions({ maxInstances: 10 });

initializeApp();

/**
 * Fungsi tiruan (mock) untuk model Machine Learning.
 * @param {string} videoPath Path file video di Storage.
 * @returns {Promise<string[]>} Sebuah array berisi plat nomor random.
 */
const mockMLModel = async (videoPath: string): Promise<string[]> => {
    logger.info(`Model menganalisis video dari path: ${videoPath}`)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const randomPlates = ["B 1234 BRG", "D 5678 XYZ"];

    const result = randomPlates.slice(0, Math.floor(Math.random() * 4));
    if(result.length > 0){
        logger.info(`Model hasil ekstraksi: ${result.join(", ")}`);
    } else {
        logger.info("Tidak ada plat nomor yang terdeteksi");
    }
    return result;
}

export const processMediaUpload = onObjectFinalized(async (event) => {
    const fileBucket = event.data.bucket;
    const filePath = event.data.name;
    const contentType = event.data.contentType;

    if (!filePath || !contentType){
        logger.warn("File path atau content type tidak ada, skip");
        return;
    }

    if(!filePath.startsWith("videos/")){
        logger.info(`File bukan di folder 'videos/', skipping. Path: ${filePath}`);
        return;
    }

    logger.info(`Video baru terdeteksi: ${filePath}. Memulai proses`);

    const bucket = getStorage().bucket(fileBucket);
    
    // const fileName = path.basename(filePath);

    // format audio masih .wav
    // const audioFilePath = `audio/${fileName.replace(path.extname(fileName), ".wav")}`;

    try {
        const extractedPlates = await mockMLModel(filePath);

        if(extractedPlates.length === 0){
            logger.info("Model ML tidak menemukan plat nomor. Hapus file video dan audio terkait...")

            await bucket.file(filePath).delete();

            // await bucket.file(audioFilePath).delete().catch((err) => {
            //     logger.warn(`Gagal menghapus file audio ${audioFilePath}, mungkin tidak ada`)
            // });

            logger.info(`File ${filePath} dan $audioFilePath telah dihapus.`);
            return;
        }

        const incidentData = {
            plateNumbers: extractedPlates,
            videoUrl: `gs://${fileBucket}/${filePath}`,
            audioUrl: `audio/mockaudiopath`,
            createdAt: Timestamp.now(),
            status: "unverified"
        }

        const firestore = getFirestore();
        const writeResult = await firestore.collection("incidents").add(incidentData);

        logger.info(`Data insiden berhasil disimpan ke Firestore dengan ID: ${writeResult.id}`);
    } catch (error) {
        logger.error("Terjadi error saat memproses file:", error)
    }
})
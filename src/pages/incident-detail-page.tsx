import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import type { Incident } from "../types/collection";
import { db, storage } from "../firebase";


export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [videoDownloadUrl, setVideoDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchIncident = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'incidents', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const incidentData = { id: docSnap.id, ...docSnap.data() } as Incident;
          setIncident(incidentData);

          const gsUrl = incidentData.videoUrl;
          const path = gsUrl.substring(gsUrl.indexOf('/', 5) + 1);
          
          const videoRef = ref(storage, path);
          const url = await getDownloadURL(videoRef);
          setVideoDownloadUrl(url);

        } else {
          setError('Insiden tidak ditemukan.');
        }
      } catch (err) {
        setError('Gagal memuat data insiden.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIncident();
  }, [id]);

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
  if (!incident) return null;

  return (
    <div className="p-8">
      <Link to="/incidents" className="text-blue-500 hover:underline mb-4 inline-block">
        &larr; Kembali ke Daftar
      </Link>
      <h1 className="text-3xl font-bold mb-4">Detail Insiden</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {videoDownloadUrl && (
          <video controls className="w-full max-w-2xl mx-auto rounded-lg mb-4">
            <source src={videoDownloadUrl} type="video/mp4" />
            Browser Anda tidak mendukung tag video.
          </video>
        )}
        <p><strong>ID Insiden:</strong> {incident.id}</p>
        <p><strong>Plat Nomor:</strong> {incident.plateNumbers.join(', ')}</p>
        <p><strong>Status:</strong> {incident.status}</p>
        <p><strong>Waktu:</strong> {new Date(incident.createdAt.seconds * 1000).toLocaleString()}</p>
      </div>
    </div>
  );
}
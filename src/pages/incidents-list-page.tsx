import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot, query } from "firebase/firestore";
import type { Incident } from "../types/collection";
import { db } from "../firebase";
import { useAuthContext } from "../hooks/use-auth-context";


export default function IncidentsListPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const { user } = useAuthContext();

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "incidents"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const incidentsData: Incident[] = [];
        querySnapshot.forEach((doc) => {
          incidentsData.push({ id: doc.id, ...doc.data() } as Incident);
        });
        setIncidents(incidentsData);
        console.log("Fetched incidents:", incidentsData);
      }, (err) => {
        console.error("Error fetching incidents:", err);
      });
      return () => unsubscribe();
    }
  }, [user]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4">Daftar Insiden</h2>
      <div className="bg-white p-4 rounded shadow">
        {incidents.length > 0 ? (
          <ul>
            {incidents.map(incident => (
              <li key={incident.id} className="border-b p-2 hover:bg-gray-100">
                <Link to={`/incidents/${incident.id}`} className="block">
                  <p><strong>Plat Nomor:</strong> {incident.plateNumbers.join(', ')}</p>
                  <p><strong>Status:</strong> {incident.status}</p>
                  <p><strong>Waktu:</strong> {incident.createdAt ? new Date(incident.createdAt.seconds * 1000).toLocaleString() : 'N/A'}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>Belum ada data insiden. Coba unggah file video di Storage Emulator.</p>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext"; // o dove hai il tuo hook
import { db } from "../../lib/firebase";

export default function UserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: "", email: "", role: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) {
        setProfile({ name: "", email: "", role: "" });
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile({
            name: docSnap.data().name,
            email: docSnap.data().email,
            role: docSnap.data().role,
          });
        } else {
          setProfile({ name: "", email: user.email, role: "" });
        }
      } catch (err) {
        console.error("Errore fetching user profile:", err);
        setProfile({ name: "", email: user.email, role: "" });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return { profile, loading };
}

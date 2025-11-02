import { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { collection, onSnapshot, query, where, orderBy, doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import Coin from "./assets/imgi_1_coin-removebg-preview.png";
import { HelpCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { FaDollarSign } from "react-icons/fa";
import { TbGiftFilled } from "react-icons/tb";
import { CgArrowsExchange } from "react-icons/cg";
import { LiaDollarSignSolid } from "react-icons/lia";


function App() {
  const [coinPacks, setCoinPacks] = useState([]);
  const [latestPackage, setLatestPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (authError) {
        console.error("Auth error:", authError);
        setError("Unable to load packages. Authentication required.");
      } finally {
        setAuthLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthLoading(false);
      if (!user) setError("Authentication required to view packages.");
    });

    initializeAuth();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (authLoading) return;

    const packagesQuery = query(
      collection(db, "packages"),
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      packagesQuery,
      async (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            id: doc.id,
            ...docData,
            createdAt: docData.createdAt?.toDate?.() || docData.createdAt,
            updatedAt: docData.updatedAt?.toDate?.() || docData.updatedAt,
          };
        });

        setCoinPacks(data);
        setLatestPackage(data.length > 0 ? data[0] : null);

        // Calculate total coins
        const calculatedTotal = data.reduce((sum, pack) => sum + (pack.price || 0), 0);

        // Save total coins to Firebase
        if (data.length > 0 && auth.currentUser) {
          try {
            const totalCoinsRef = doc(db, "totalCoins", auth.currentUser.uid);
            await setDoc(totalCoinsRef, {
              totalCoins: calculatedTotal,
              username: data[0].username || "User",
              updatedAt: new Date()
            }, { merge: true });
          } catch (error) {
            console.error("Error saving total coins:", error);
          }
        }

        setLoading(false);
        setError("");
      },
      (error) => {
        console.error("Firestore error:", error);
        setError("Failed to load packages. Please refresh.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [authLoading]);

  // Calculate total coins - sum all packages
  const totalCoins = coinPacks.reduce((sum, pack) => sum + (pack.price || 0), 0);

  // Display coins - show latest package price (most recent)
  const displayCoins = latestPackage?.price || 0;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">
            {authLoading ? "Authenticating..." : "Loading packages..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex justify-center items-center">
      <div className="h-screen w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white">
          <button className="p-1">
            <ChevronLeft size={24} className="text-gray-900" />
          </button>
          <div className="flex items-center gap-1 text-gray-900">
            <CgArrowsExchange size={24} />
            <span className="text-sm font-medium"> USD</span>
          </div>
        </div>

        {/* Title */}
        <div className="px-5 pb-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            {latestPackage?.username || "Mrkhan"}'s balance
          </h1>
        </div>
        {/* <div className="mx-5 mb-5 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-5 shadow-lg tiktok"> */}

        {/* Balance Card */}
        {latestPackage && (
          <div className="mx-5 mb-5 rounded-2xl px-5 py-8 shadow-lg tiktok">
            <div className="flex items-center justify-between mb-2 ">
              <span className="text-gray-400 text-sm font-medium">Coins</span>
            </div>

            <div className="flex justify-between items-center w-full mb-4 border-b-[1px] border-gray-500 pb-4">
              <div className="flex items-center gap-2">
                <img className="h-8 w-8" src={Coin} alt="coins" />
                <span className="text-white text-4xl font-bold">
                  {totalCoins}
                </span>
              </div>
              <button className="text-gray-400 text-sm font-medium">
                Get Coins ›
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Estimated balance</p>
                <h4 className="text-white text-xl font-semibold flex items-end">
                  <p className="text-[15px]">USD</p> {(totalCoins / 100).toFixed(2)}
                </h4>
              </div>
              <button className="text-gray-400 text-sm font-medium">
                View ›
              </button>
            </div>
          </div>
        )}

        {/* Transactions Section */}
        <div className="px-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
            <button className="text-gray-500 text-sm font-medium">
              View all ›
            </button>
          </div>

          {/* First Coin Purchase Offer */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-gray-900 font-semibold mb-1">
                First Coin purchase offer
              </h3>
              <p className="text-gray-500 text-sm mb-2">
                Bonus Coins and animated Gift
              </p>
              <button className="text-[#F6506A] text-sm font-semibold">
                Get →
              </button>
            </div>
            <div className="ml-4">
              <div className="bg-[#F6506A] rounded-full p-3">
                <TbGiftFilled size={24} className="text-white" />
              </div>
            </div>
          </div>

          
        </div>

        {/* Monetisation Section */}
        <div className="px-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Monetisation</h2>
            <button className="text-gray-500 text-sm font-medium">
              View more ›
            </button>
          </div>

          <button className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 rounded-lg p-2">
                {/* <div className="w-6 h-6 bg-gray-300 rounded"> */}
                <LiaDollarSignSolid size={24} className="text-gray-400" />
                {/* </div> */}
              </div>
              <span className="text-gray-900 font-medium">LIVE rewards</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Services Section */}
        <div className="px-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Services</h2>

          <button className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 rounded-lg p-2">
                <HelpCircle size={24} className="text-gray-400" />
              </div>
              <span className="text-gray-900 font-medium">Help & feedback</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
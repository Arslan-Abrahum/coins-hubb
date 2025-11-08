import { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { collection, onSnapshot, query, where, orderBy, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import Coin from "./assets/imgi_1_coin-removebg-preview.png";
import { HelpCircle, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Gift from './assets/gift-removebg-preview.png'
import { CgArrowsExchange } from "react-icons/cg";
import { LiaDollarSignSolid } from "react-icons/lia";


function App() {
  const [currentPackage, setCurrentPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState("");

  console.log(currentPackage);
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          await signInAnonymously(auth);
        } catch (authError) {
          console.error("❌ Auth error:", authError);
        }
      } else {
        console.log("✅ User authenticated:");
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    
    const packagesQuery = query(
      collection(db, "packages"),
      where("status", "==", "active")
    );

    const unsub = onSnapshot(
      packagesQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
              updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
            }))
            .sort((a, b) => {
              const aTime = a.updatedAt?.getTime?.() || 0;
              const bTime = b.updatedAt?.getTime?.() || 0;
              return bTime - aTime; 
            });
          
          const packageData = docs[0]; 
          
          setCurrentPackage(packageData);
        } else {
          setCurrentPackage(null);
        }
        setLoading(false);
        setError("");
      },
      (error) => {
        console.error("❌ Firestore error:", error);
        console.error("Error details:", error.message);
        setError("Failed to load packages. Please check Firestore rules.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [authLoading]);

  const displayTotalCoins = currentPackage?.price || 0;
  const displayUsername = currentPackage?.username || "User";

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">
            {authLoading ? "Authenticating..." : "Loading package..."}
          </p>
        </div>
      </div>
    );
  }

  if (!currentPackage) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="text-center px-5">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Package Found</h2>
          <p className="text-gray-500 text-sm">
            Please create a profile and purchase a package first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex justify-center items-center">
      <div className="h-screen w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between px-5 py-2 bg-white">
          <button className="p-1">
            <ChevronLeft size={24} className="text-gray-900" />
          </button>
          <div className="flex items-center gap-1 text-gray-900">
            <CgArrowsExchange size={24} />
            <span className="text-sm font-medium"> USD</span>
          </div>
        </div>

        <div className="px-5 pb-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            {displayUsername}'s balance
          </h1>
        </div>
        
        <div className="mx-5 mb-5 rounded-2xl px-5 py-8 shadow-lg tiktok">
          <div className="flex items-center justify-between mb-2 ">
            <span className="text-gray-400 text-sm font-medium">Coins</span>
          </div>

          <div className="flex justify-between items-center w-full mb-4 border-b-[1px] border-gray-700 pb-4">
            <div className="flex items-center gap-1">
              <img className="h-7 w-7" src={Coin} alt="coins" />
              <span className="text-white text-3xl font-bold">
                {displayTotalCoins}
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
                <p className="text-[15px]">USD</p>0.00
                {/* {(displayTotalCoins / 100).toFixed(2)} */}
              </h4>
            </div>
            <button className="text-gray-400 text-sm font-medium">
              View ›
            </button>
          </div>
        </div>

        <div className="px-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
            <button className="text-gray-500 text-sm font-medium">
              View all ›
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-gray-900 font-semibold mb-1">
                First Coin purchase offer
              </h3>
              <p className="text-gray-500 text-sm mb-2">
                Bonus Coins and animated Gift
              </p>
              <button className="text-[#F6506A] text-sm font-semibold flex items-center gap-1">
                Get <ArrowRight size={18} />
              </button>
            </div>

            <div className="flex items-center justify-center bg-white">
              <img className="h-20 w-20" src={Gift} alt="Icon" />
            </div>
          </div>
        </div>

        <div className="px-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Monetisation</h2>
            <button className="text-gray-500 text-sm font-medium">
              View more ›
            </button>
          </div>

          <button className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 rounded-lg p-2">
                <LiaDollarSignSolid size={24} className="text-gray-400" />
              </div>
              <span className="text-gray-900 font-medium">LIVE rewards</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="px-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Services</h2>
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
import { useState } from "react";
import ProfileMenu from "./ProfileMenu";
import { FaDumbbell, FaChartBar, FaUser, FaTools } from "react-icons/fa"; // Usiamo Fa per le icone della bottom bar


// --- Componente per la Navigazione Fissa Mobile ---
function MobileBottomNav({ menuItems, currentView, setView }) {
    // Funzione per mappare le icone (se la chiave non corrisponde all'icona del menuItems)
    const getIcon = (key) => {
        switch (key) {
            case "myWorkouts": return <FaDumbbell className="text-xl" />;
            case "profile": return <FaUser className="text-xl" />;
            case "stats": return <FaChartBar className="text-xl" />;
            case "admin": return <FaTools className="text-xl" />;
            default: return null;
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-brand shadow-xl md:hidden z-30"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
            <div className="flex justify-around h-full">
                {menuItems.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => setView(item.key)}
                        className={`flex flex-col items-center justify-center w-full transition-colors 
                            ${currentView === item.key 
                                ? 'text-brand-accent border-t-2 border-brand-accent font-semibold -mt-1 pt-1' // Active state
                                : 'text-gray-500 hover:text-brand-accent' // Inactive state
                            }`}
                    >
                        {getIcon(item.key)}
                        <span className="text-xs mt-1 truncate">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}


export default function MobileBar({ menuItems, currentView, setView }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Handler personalizzato per intercettare il click su "profile"
  const handleNavClick = (key) => {
   
      setView(key);
    
  };

  return (
    <>
      {/* La tua bottom nav originale */}
      <MobileBottomNav
        menuItems={menuItems}
        currentView={currentView}
        setView={handleNavClick}
      />
      
    </>
  );
}

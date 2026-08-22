import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimationControls, PanInfo } from 'framer-motion';
import { collection, query, limit, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface Contact {
  id: string;
  name: string;
  abbr: string;
  img: string;
}

export const ContactsTicker = ({ onNavigate }: { onNavigate?: (view: string) => void }) => {
  const controls = useAnimationControls();
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeContacts, setActiveContacts] = useState<Contact[]>([]);
  
  useEffect(() => {
    const q = query(collection(db, 'user_profiles'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => {
        const data = doc.data();
        const name = data.fullName || 'User';
        return {
          id: doc.id,
          name: name,
          abbr: name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
          img: data.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`
        };
      }).filter(u => u.id !== auth.currentUser?.uid);
      
      setActiveContacts(users);
    });
    return () => unsubscribe();
  }, []);

  const startAnimation = () => {
    controls.set({ x: "-50%" });
    controls.start({
      x: "0%",
      transition: {
        repeat: Infinity,
        ease: "linear",
        duration: 20
      }
    });
  };

  useEffect(() => {
    if (!isDragging) {
      startAnimation();
    } else {
      controls.stop();
    }
  }, [isDragging, controls]);

  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
  };

  const handleContactClick = (id: string) => {
    // Only navigate if we aren't dragging
    if (!isDragging && onNavigate) {
      // Redirect to private messaging
      onNavigate(`private-chat:${id}`);
    }
  };

  // Duplicate for infinite scroll
  const displayContacts = [...activeContacts, ...activeContacts];

  return (
    <div 
      className="flex flex-1 overflow-hidden w-full relative h-14 items-center"
      style={{ WebkitMaskImage: 'linear-gradient(to right, black 80%, transparent 100%)', maskImage: 'linear-gradient(to right, black 80%, transparent 100%)' }}
      ref={containerRef}
    >
      <motion.div
        className="flex items-start cursor-grab active:cursor-grabbing pl-1 gap-3"
        initial={{ x: "-50%" }}
        animate={controls}
        drag="x"
        dragConstraints={containerRef}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {displayContacts.map((contact, index) => (
          <div 
            key={`${contact.id}-${index}`} 
            onClick={() => handleContactClick(contact.id)}
            className="flex flex-col items-center shrink-0 group transition-transform hover:-translate-y-1 hover:z-30 relative"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[1.5px] border-white shadow-sm overflow-hidden bg-slate-200">
              <img src={contact.img} alt={contact.name} className="w-full h-full object-cover pointer-events-none" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-700 bg-white/80 backdrop-blur-xs px-1 rounded shadow-2xs mt-0.5 whitespace-nowrap pointer-events-none">
              {contact.abbr}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

import React, { createContext, useState, useContext, useEffect } from 'react';

const RegionContext = createContext();

export const useRegion = () => useContext(RegionContext);

export const RegionProvider = ({ children }) => {
  const [selectedRegionId, setSelectedRegionId] = useState(() => {
    return localStorage.getItem('flashsim_region_id') || '1';
  });

  // Sauvegarder lors des changements
  useEffect(() => {
    if (selectedRegionId) {
      localStorage.setItem('flashsim_region_id', selectedRegionId);
    }
  }, [selectedRegionId]);

  // Détection automatique de la région (seulement si non définie manuellement par le passé)
  useEffect(() => {
    if (!localStorage.getItem('flashsim_region_id')) {
      const detectRegion = async () => {
        try {
          const res = await fetch('https://ipapi.co/json/');
          const data = await res.json();
          if (data.country_code === 'FR') {
            setSelectedRegionId('2');
          } else if (data.country_code === 'TN') {
            setSelectedRegionId('1');
          }
        } catch (error) {
          console.warn("Impossible de détecter la région automatiquement.");
        }
      };
      detectRegion();
    }
  }, []);

  return (
    <RegionContext.Provider value={{ selectedRegionId, setSelectedRegionId }}>
      {children}
    </RegionContext.Provider>
  );
};

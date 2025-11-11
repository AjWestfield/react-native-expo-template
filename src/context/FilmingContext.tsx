import React, { createContext, useContext, useState, ReactNode } from 'react';

export type FilmingType = 'ring-security' | 'house-security' | 'smartphone' | 'high-quality' | null;

interface FilmingTypeData {
  id: FilmingType;
  name: string;
  description: string;
  icon: string;
}

interface FilmingContextType {
  selectedFilmingType: FilmingType;
  setSelectedFilmingType: (type: FilmingType) => void;
  filmingTypes: FilmingTypeData[];
}

const filmingTypesData: FilmingTypeData[] = [
  {
    id: 'ring-security',
    name: 'Ring Security Camera',
    description: 'Simulate Ring doorbell or security camera footage',
    icon: 'home',
  },
  {
    id: 'house-security',
    name: 'House Security Camera',
    description: 'Generic home security camera perspective',
    icon: 'videocam',
  },
  {
    id: 'smartphone',
    name: 'Smartphone',
    description: 'Standard mobile phone camera recording',
    icon: 'phone-portrait',
  },
  {
    id: 'high-quality',
    name: 'High-Quality Camera',
    description: 'Professional camera with high resolution',
    icon: 'camera',
  },
];

const FilmingContext = createContext<FilmingContextType | undefined>(undefined);

export const FilmingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedFilmingType, setSelectedFilmingType] = useState<FilmingType>(null);

  return (
    <FilmingContext.Provider
      value={{
        selectedFilmingType,
        setSelectedFilmingType,
        filmingTypes: filmingTypesData,
      }}
    >
      {children}
    </FilmingContext.Provider>
  );
};

export const useFilming = () => {
  const context = useContext(FilmingContext);
  if (context === undefined) {
    throw new Error('useFilming must be used within a FilmingProvider');
  }
  return context;
};

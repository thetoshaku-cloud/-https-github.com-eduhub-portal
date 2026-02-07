
import React from 'react';
import { Institution } from '../types';
import { MapPin, BookOpen, Building2, Phone, Mail, Globe, ChevronRight } from 'lucide-react';

interface InstitutionCardProps {
  institution: Institution;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

export const InstitutionCard: React.FC<InstitutionCardProps> = ({ institution, onSelect, isSelected }) => {
  return (
    <div 
      className={`transition-all duration-300 flex flex-col h-full bg-white relative ${
        isSelected ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-200' : ''
      }`}
    >
      <div className="h-36 bg-gradient-to-br from-purple-100 to-pink-100 relative">
        <img 
          src={institution.logoPlaceholder} 
          alt={institution.name} 
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-purple-700 shadow-sm uppercase tracking-wide border border-purple-200">
          {institution.type}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{institution.name}</h3>
        
        <div className="flex items-center text-gray-600 text-xs mb-4 font-medium">
          <MapPin size={12} className="mr-1 text-purple-500" />
          <span>{institution.location}</span>
        </div>
        
        <div className="mb-6 flex-1">
          <div className="flex flex-wrap gap-2">
            {institution.courses.slice(0, 2).map((course, idx) => (
              <span key={idx} className="bg-purple-50 text-purple-700 text-xs px-3 py-1.5 rounded-lg border border-purple-200">
                {course.name}
              </span>
            ))}
            {institution.courses.length > 2 && (
              <span className="text-purple-400 text-xs px-2 py-1.5">
                +{institution.courses.length - 2} more
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onSelect(institution.id)}
          className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-95 ${
            isSelected 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-200' 
              : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
          }`}
        >
          {isSelected ? (
            <>Selected</>
          ) : (
            <>
              Add to Basket <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { ApplicationRecord, UploadedDocument } from '../types';
import { X, FileText, Building2, User, Phone, Mail, MapPin, GraduationCap } from 'lucide-react';
import { INSTITUTIONS } from '../constants';

interface ApplicationDetailsProps {
    application: ApplicationRecord;
    onClose: () => void;
}

export const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({ application, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-slideUp">
                <div className="sticky top-0 bg-white/95 backdrop-blur-md p-5 border-b border-stone-100 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center">
                        <FileText className="mr-2 text-orange-500" size={20}/>
                        Application Details
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 bg-stone-100 hover:bg-stone-200 rounded-full transition text-stone-500 hover:text-stone-800"
                    >
                        <X size={20}/>
                    </button>
                </div>
                
                <div className="p-6 space-y-8">
                    {/* Applicant Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <User size={18} className="text-stone-400" />
                            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider">Applicant Profile</h3>
                        </div>
                        <div className="bg-stone-50 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 border border-stone-100">
                            <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Full Name</p>
                                <p className="font-bold text-stone-900 text-sm">{application.firstName} {application.lastName}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">ID Number</p>
                                <p className="font-bold text-stone-900 text-sm font-mono tracking-wide">{application.idNumber}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Email</p>
                                <p className="font-medium text-stone-800 text-sm truncate">{application.email}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Phone</p>
                                <p className="font-medium text-stone-800 text-sm">{application.phone}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Gender / Ethnicity</p>
                                <p className="font-medium text-stone-800 text-sm">{application.gender} • {application.ethnicity}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Location</p>
                                <p className="font-medium text-stone-800 text-sm">{application.province}</p>
                            </div>
                        </div>
                    </div>

                    {/* Academic Transcript */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <GraduationCap size={18} className="text-stone-400" />
                            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider">Academic Results</h3>
                        </div>
                        <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-stone-100 text-stone-500 font-bold text-xs uppercase">
                                    <tr>
                                        <th className="px-5 py-3">Subject</th>
                                        <th className="px-5 py-3 text-right">Percentage</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {application.subjects.map((sub, idx) => (
                                        <tr key={idx} className="bg-white hover:bg-stone-50 transition">
                                            <td className="px-5 py-3 text-stone-800 font-medium">{sub.name}</td>
                                            <td className="px-5 py-3 text-right font-bold text-stone-900">{sub.percentage}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Institutions */}
                    <div className="space-y-4">
                         <div className="flex items-center gap-2">
                            <Building2 size={18} className="text-stone-400" />
                            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider">Applications</h3>
                        </div>
                        <div className="grid gap-3">
                            {application.selectedInstitutions.map(instId => {
                                const inst = INSTITUTIONS.find(i => i.id === instId);
                                const course = application.selectedCourses[instId];
                                return (
                                    <div key={instId} className="flex items-start sm:items-center p-4 border border-stone-200 rounded-xl bg-white shadow-sm">
                                        <div className="h-10 w-10 bg-stone-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                                            {inst?.logoPlaceholder ? (
                                                <img src={inst.logoPlaceholder} className="w-8 h-8 opacity-80 mix-blend-multiply" alt="logo" />
                                            ) : (
                                                <Building2 size={20} className="text-stone-400"/>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-stone-900 text-sm">{inst?.name || instId}</p>
                                            <p className="text-xs text-stone-500 font-medium mt-0.5">{course}</p>
                                        </div>
                                        <span className="ml-2 bg-stone-100 text-stone-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-stone-200 uppercase tracking-wide">
                                            Applied
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Documents */}
                     <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <FileText size={18} className="text-stone-400" />
                            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider">Documents Attached</h3>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            {Object.entries(application.documents).map(([key, doc]) => {
                                const document = doc as UploadedDocument;
                                if (!document) return null;
                                return (
                                    <div key={key} className="flex items-center gap-2 bg-stone-50 text-stone-700 pl-3 pr-4 py-2.5 rounded-xl text-xs font-medium border border-stone-200">
                                        <div className="bg-white p-1 rounded-md border border-stone-100 shadow-sm">
                                            <FileText size={14} className="text-stone-400"/>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-stone-800">{document.name}</span>
                                            <span className="text-[10px] text-stone-400">{(document.size / 1024).toFixed(0)} KB</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    
                    <div className="pt-6 border-t border-stone-100">
                        <p className="text-center text-xs text-stone-400">
                            Application submitted on {new Date(application.submittedAt).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
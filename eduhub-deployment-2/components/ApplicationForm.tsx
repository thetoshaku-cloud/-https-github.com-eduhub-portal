import React, { useState, useEffect } from 'react';
import { INSTITUTIONS, PROVINCES, GENDERS, ETHNICITIES, MATRIC_SUBJECTS } from '../constants';
import { ApplicationFormData, Course, User, UploadedDocument, SubjectMark } from '../types';
import { getEduAdvice } from '../services/geminiService';
import { databaseService } from '../services/database';
import { CheckCircle, AlertCircle, Loader2, Save, UploadCloud, FileText, Trash2, User as UserIcon, Camera, Wand2, Sparkles, ArrowRight, Check, Info, Banknote, Mail, Paperclip, ExternalLink, Send, X, Plus, AlertTriangle } from 'lucide-react';

interface ApplicationFormProps {
  onSubmit: (data: ApplicationFormData) => void;
  selectedInstitutions: string[];
  initialData?: Partial<ApplicationFormData>;
  currentUser: User | null;
}

// Helper to compress images
const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_DIMENSION = 1600; // Resize large images to reasonable dimensions

                if (width > height) {
                    if (width > MAX_DIMENSION) {
                        height *= MAX_DIMENSION / width;
                        width = MAX_DIMENSION;
                    }
                } else {
                    if (height > MAX_DIMENSION) {
                        width *= MAX_DIMENSION / height;
                        height = MAX_DIMENSION;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);

                // Compress to JPEG at 70% quality
                canvas.toBlob((blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        reject(new Error('Compression failed'));
                    }
                }, 'image/jpeg', 0.7);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

export const ApplicationForm: React.FC<ApplicationFormProps> = ({ onSubmit, selectedInstitutions, initialData, currentUser }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Application Completed State (for Emailing)
  const [isApplicationComplete, setIsApplicationComplete] = useState(false);
  
  // Upload State
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Profile Pic State
  const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
  const [profilePicProgress, setProfilePicProgress] = useState(0);

  // AI & Data State
  const [aiRecommendations, setAiRecommendations] = useState<string | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [dynamicCourses, setDynamicCourses] = useState<Record<string, Course[]>>({});

  // Dynamic Subject Entry State
  const [currentSubject, setCurrentSubject] = useState('');
  const [currentMark, setCurrentMark] = useState('');

  const totalSteps = 6;
  const inputClass = "w-full p-4 rounded-xl bg-stone-100 border-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-sm text-stone-800 font-medium placeholder-stone-400";
  const labelClass = "block text-xs font-bold text-stone-400 uppercase mb-2 ml-1";

  const [formData, setFormData] = useState<ApplicationFormData>({
    profilePicture: initialData?.profilePicture,
    firstName: currentUser?.firstName || initialData?.firstName || '',
    lastName: currentUser?.lastName || initialData?.lastName || '',
    pronouns: initialData?.pronouns || '',
    gender: currentUser?.gender || initialData?.gender || '',
    ethnicity: currentUser?.ethnicity || initialData?.ethnicity || '',
    idNumber: currentUser?.idNumber || initialData?.idNumber || '',
    email: currentUser?.email || initialData?.email || '',
    phone: currentUser?.phone || initialData?.phone || '',
    province: currentUser?.province || initialData?.province || '',
    subjects: initialData?.subjects || [],
    nsfasRequired: true,
    householdIncome: 0,
    sassaBeneficiary: false,
    selectedInstitutions: selectedInstitutions,
    selectedCourses: initialData?.selectedCourses || {},
    documents: initialData?.documents || {},
  });

  useEffect(() => {
    // Load Draft
    const savedDraft = localStorage.getItem('centralEdu_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.formData) {
          setFormData(prev => ({ 
            ...prev, 
            ...parsed.formData,
            firstName: currentUser?.firstName || parsed.formData.firstName || prev.firstName,
            lastName: currentUser?.lastName || parsed.formData.lastName || prev.lastName,
            email: currentUser?.email || parsed.formData.email || prev.email,
            idNumber: currentUser?.idNumber || parsed.formData.idNumber || prev.idNumber,
            gender: currentUser?.gender || parsed.formData.gender || prev.gender,
            ethnicity: currentUser?.ethnicity || parsed.formData.ethnicity || prev.ethnicity,
          }));
        }
        if (parsed.step) {
          setStep(parsed.step);
        }
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    }

    // Load Dynamic Courses
    const fetchedCourses: Record<string, Course[]> = {};
    selectedInstitutions.forEach(instId => {
        const courses = databaseService.getDynamicCourses(instId);
        if (courses.length > 0) {
            fetchedCourses[instId] = courses;
        }
    });
    setDynamicCourses(fetchedCourses);
  }, [currentUser, selectedInstitutions]);

  // NEW: Handle Navigation Away / Tab Close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        // Only trigger if we are actively editing (not submitting or finished)
        if (!isSubmitting && !isApplicationComplete) {
            // Auto-save: Synchronously save to local storage to ensure data persistence
            localStorage.setItem('centralEdu_draft', JSON.stringify({ formData, step }));
            
            // Prompt: Trigger browser's native confirmation dialog
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Your progress has been drafted.';
            return e.returnValue;
        }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function handles internal React navigation (Unmount)
    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        
        // Auto-save on component unmount (e.g., clicking 'Home' or 'Explore' in the app menu)
        if (!isSubmitting && !isApplicationComplete) {
             localStorage.setItem('centralEdu_draft', JSON.stringify({ formData, step }));
        }
    };
  }, [formData, step, isSubmitting, isApplicationComplete]);

  const validateField = (name: string, value: any): string | null => {
    if (name === 'phone') {
        const strVal = String(value || '');
        if (!strVal.trim()) return 'Required';
        const validChars = /^[\d\s\-\+\(\)]*$/.test(strVal);
        const digits = strVal.replace(/\D/g, '');
        if (!validChars) return 'Invalid characters';
        if (digits.length < 10) return 'Too short';
        if (digits.length > 15) return 'Too long';
        return null;
    }
    if (name === 'firstName' || name === 'lastName') return (!value || !value.trim()) ? 'Required' : null;
    if (name === 'idNumber') return !/^\d{13}$/.test(value) ? '13 digits' : null;
    if (name === 'email') return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email' : null;
    if (name === 'province') return !value ? 'Select' : null;
    if (name === 'gender') return !value ? 'Select' : null;
    if (name === 'ethnicity') return !value ? 'Select' : null;
    if (name === 'pronouns') return !value ? 'Select' : null;
    if (name === 'householdIncome') return (value === '' || value === undefined || value < 0) ? 'Required' : null;
    return null;
  };

  const validateStep = (currentStep: number): boolean => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      ['firstName', 'lastName', 'idNumber', 'email', 'phone', 'province', 'gender', 'ethnicity', 'pronouns'].forEach(f => {
        const err = validateField(f, (formData as any)[f]);
        if (err) { newErrors[f] = err; isValid = false; }
      });
    } else if (currentStep === 2) {
      if (formData.subjects.length === 0) {
          newErrors['subjects'] = "Please add at least one subject.";
          isValid = false;
      } else if (formData.subjects.length < 4) {
          // Warning but allow? Generally Matric has 7 subjects. Let's enforce 4 minimum for valid application.
          newErrors['subjects'] = "Please add at least 4 subjects.";
          isValid = false;
      }
    } else if (currentStep === 3) {
      formData.selectedInstitutions.forEach(id => {
          if (!formData.selectedCourses[id]) { newErrors[`course_${id}`] = "Required"; isValid = false; }
      });
    } else if (currentStep === 4 && formData.nsfasRequired && !formData.sassaBeneficiary && (formData.householdIncome === undefined || formData.householdIncome < 0)) {
        newErrors['householdIncome'] = "Required"; isValid = false;
    } else if (currentStep === 5) {
        if (!formData.documents.idDocument) { newErrors['documents.idDocument'] = "Required"; isValid = false; }
        if (!formData.documents.academicRecord) { newErrors['documents.academicRecord'] = "Required"; isValid = false; }
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = value;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      newValue = checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (newValue || errors[name]) {
        // Debounce slightly to allow user to type
        const error = validateField(name, newValue);
        if (error) setErrors(prev => ({ ...prev, [name]: error }));
        else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }
  };

  const handleAddSubject = () => {
      if (!currentSubject) return;
      if (!currentMark || isNaN(parseInt(currentMark))) return;
      const mark = parseInt(currentMark);
      if (mark < 0 || mark > 100) return;

      // Check duplicate
      if (formData.subjects.some(s => s.name === currentSubject)) {
          setErrors(prev => ({ ...prev, subjects: `${currentSubject} is already added.` }));
          return;
      }

      setFormData(prev => ({
          ...prev,
          subjects: [...prev.subjects, { name: currentSubject, percentage: mark }]
      }));
      setCurrentSubject('');
      setCurrentMark('');
      setErrors(prev => { const e = {...prev}; delete e['subjects']; return e; });
  };

  const handleRemoveSubject = (index: number) => {
      setFormData(prev => ({
          ...prev,
          subjects: prev.subjects.filter((_, i) => i !== index)
      }));
  };

  const handleSaveDraft = () => {
    setSaveStatus('saving');
    try {
        localStorage.setItem('centralEdu_draft', JSON.stringify({ formData, step }));
        setTimeout(() => {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 3000);
        }, 600);
    } catch (e) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 4000);
    }
  };

  const handleDemoFill = () => {
    const demoData = {
      firstName: 'Thabo',
      lastName: 'Nkosi',
      pronouns: 'He/Him',
      gender: 'Male',
      ethnicity: 'Black African',
      idNumber: '0502125678089',
      email: 'thabo.demo@nkgo.edu.za',
      phone: '0721234567',
      province: 'Gauteng',
      subjects: [
          { name: 'Mathematics', percentage: 78 },
          { name: 'English Home Language', percentage: 82 },
          { name: 'Physical Sciences', percentage: 75 },
          { name: 'Life Orientation', percentage: 88 },
          { name: 'Geography', percentage: 70 },
          { name: 'Life Sciences', percentage: 85 }
      ],
      nsfasRequired: true,
      householdIncome: 125000,
      sassaBeneficiary: false
    };

    const demoCourses: Record<string, string> = {};
    selectedInstitutions.forEach(instId => {
      const inst = INSTITUTIONS.find(i => i.id === instId);
      if (inst && inst.courses.length > 0) {
        demoCourses[instId] = inst.courses[0].name;
      }
    });

    const mockDoc = (name: string) => ({ name, size: 450000, type: 'application/pdf', uploadDate: new Date().toISOString() });

    setFormData(prev => ({
      ...prev,
      ...demoData,
      selectedCourses: demoCourses,
      documents: {
        idDocument: mockDoc('id_copy.pdf'),
        academicRecord: mockDoc('results.pdf'),
        proofOfIncome: mockDoc('payslip.pdf')
      }
    }));
    setErrors({});
  };

  const handleGetAIRecommendations = async () => {
    setLoadingRecommendations(true);
    const institutionNames = formData.selectedInstitutions.map(id => INSTITUTIONS.find(i => i.id === id)?.name).filter(Boolean).join(', ');
    const marksContext = formData.subjects.map(s => `${s.name}: ${s.percentage}%`).join(', ');
    const prompt = `I am applying to: ${institutionNames}. Marks: ${marksContext}. Recommend courses concisely.`;

    try {
        const advice = await getEduAdvice(prompt, `Marks: ${marksContext}`);
        setAiRecommendations(advice);
    } catch (e) {
        setAiRecommendations("Could not generate recommendations.");
    } finally {
        setLoadingRecommendations(false);
    }
  };

  const handleCourseChange = (institutionId: string, course: string) => {
    setFormData(prev => ({ ...prev, selectedCourses: { ...prev.selectedCourses, [institutionId]: course } }));
    setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`course_${institutionId}`];
        return newErrors;
    });
  };

  const handleFileUpload = async (docType: keyof ApplicationFormData['documents'], file: File) => {
    setUploadingDoc(docType);
    setUploadProgress(0);
    
    // Start progress simulation immediately for UX
    const interval = setInterval(() => setUploadProgress(p => Math.min(p + 20, 90)), 200);

    let processedFile = file;
    let errorMsg = null;

    // Check size > 5MB
    if (file.size > 5 * 1024 * 1024) {
        if (file.type.startsWith('image/')) {
             try {
                 // Attempt compression for images
                 processedFile = await compressImage(file);
                 // Double check result
                 if (processedFile.size > 5 * 1024 * 1024) {
                     errorMsg = "Image too large (even after compression)";
                 }
             } catch(e) {
                 errorMsg = "Compression failed";
             }
        } else {
             // For PDF, we cannot easily compress client-side without large libs
             errorMsg = "PDF too large (max 5MB)";
        }
    }

    if (errorMsg) {
        clearInterval(interval);
        setUploadingDoc(null);
        setUploadProgress(0);
        setErrors(prev => ({ ...prev, [`documents.${docType}`]: errorMsg! }));
        return;
    }

    const finish = (dataUrl?: string) => {
        clearInterval(interval);
        setUploadProgress(100);
        setTimeout(() => {
            setFormData(prev => ({ ...prev, documents: { ...prev.documents, [docType]: { name: processedFile.name, size: processedFile.size, type: processedFile.type, uploadDate: new Date().toISOString(), dataUrl } } }));
            setUploadingDoc(null);
            setUploadProgress(0);
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`documents.${docType}`];
                return newErrors;
            });
        }, 500);
    };

    if (processedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => finish(reader.result as string);
        reader.readAsDataURL(processedFile);
    } else {
        finish();
    }
  };

  const handleProfilePicUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profilePicture: "Invalid file type. Please upload an image." }));
        return;
    }
    
    let fileToProcess = file;
    setIsUploadingProfilePic(true);
    setProfilePicProgress(0);
    
    // Progress simulation for better UX
    const interval = setInterval(() => setProfilePicProgress(p => Math.min(p + 15, 90)), 200);

    // Validate file size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
        try {
            fileToProcess = await compressImage(file);
            if (fileToProcess.size > 5 * 1024 * 1024) {
                 setErrors(prev => ({ ...prev, profilePicture: "Image too large even after compression." }));
                 setIsUploadingProfilePic(false);
                 clearInterval(interval);
                 return;
            }
        } catch (e) {
             setErrors(prev => ({ ...prev, profilePicture: "Failed to compress image." }));
             setIsUploadingProfilePic(false);
             clearInterval(interval);
             return;
        }
    }

    // Clear error
    setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.profilePicture;
        return newErrors;
    });

    const reader = new FileReader();
    reader.onloadend = () => {
      clearInterval(interval);
      setProfilePicProgress(100);
      
      setTimeout(() => {
        setFormData(prev => ({ ...prev, profilePicture: { name: fileToProcess.name, size: fileToProcess.size, type: fileToProcess.type, uploadDate: new Date().toISOString(), dataUrl: reader.result as string } }));
        setIsUploadingProfilePic(false);
        setProfilePicProgress(0);
      }, 500);
    };
    reader.readAsDataURL(fileToProcess);
  };

  const handleDeleteProfilePic = () => {
      setFormData(prev => ({ ...prev, profilePicture: undefined }));
      setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.profilePicture;
          return newErrors;
      });
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(s => s + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // We do NOT call onSubmit yet. We first transition to the Email Packaging view.
    setIsSubmitting(false);
    setIsApplicationComplete(true);
    window.scrollTo(0, 0);
  };

  const handleFinish = () => {
      localStorage.removeItem('centralEdu_draft');
      onSubmit(formData);
  };

  // --- Prerequisite Logic ---

  const evaluateSinglePrereq = (reqString: string) => {
      // Regex to parse "Subject > Value%"
      const match = reqString.match(/^(.+?)\s*>\s*(\d+)%?$/); 
      
      if (!match) {
          return { status: 'unknown', label: reqString };
      }

      const subjectNameReq = match[1].trim();
      const requiredScore = parseInt(match[2], 10);
      
      // Fuzzy Search logic for subjects (e.g., "Math" matches "Mathematics")
      const studentSubject = formData.subjects.find(s => 
          s.name.toLowerCase().includes(subjectNameReq.toLowerCase()) || 
          (subjectNameReq.toLowerCase().includes('math') && s.name.toLowerCase().includes('math'))
      );

      if (studentSubject) {
           return { 
              status: studentSubject.percentage >= requiredScore ? 'met' : 'unmet',
              label: reqString
          };
      }

      return { status: 'unknown', label: reqString };
  };

  const analyzePrerequisite = (prereq: string) => {
      if (prereq.toLowerCase().includes(' or ')) {
          const parts = prereq.split(/ or /i);
          const results = parts.map(p => evaluateSinglePrereq(p.trim()));
          
          if (results.some(r => r.status === 'met')) return { status: 'met', label: prereq };
          if (results.some(r => r.status === 'unknown')) return { status: 'unknown', label: prereq };
          return { status: 'unmet', label: prereq };
      }
      return evaluateSinglePrereq(prereq);
  };

  // Helper to check overall course eligibility based on *all* prerequisites
  const checkCourseEligibility = (course: Course) => {
      // If any prerequisite is strictly 'unmet', the course is not eligible.
      // We treat 'unknown' as potentially eligible (to not block users if they named subjects differently)
      return !course.prerequisites.some(req => analyzePrerequisite(req).status === 'unmet');
  };

  // --- NSFAS Eligibility Logic ---
  const getNsfasEligibility = () => {
    if (!formData.nsfasRequired) return null;
    
    if (formData.sassaBeneficiary) {
        return {
            eligible: true,
            title: "Likely Eligible",
            description: "SASSA beneficiaries are immediately considered for funding.",
            style: "bg-emerald-50 border-emerald-200 text-emerald-800"
        };
    }

    // Treat 0 as a valid input for "unemployed/no income" which is eligible
    if (formData.householdIncome !== undefined && formData.householdIncome !== null) {
        if (formData.householdIncome <= 350000) {
            return {
                eligible: true,
                title: "Likely Eligible",
                description: `Annual household income is within the R350,000 threshold.`,
                style: "bg-emerald-50 border-emerald-200 text-emerald-800"
            };
        } else {
             return {
                eligible: false,
                title: "May Not Be Eligible",
                description: "Annual household income exceeds the standard R350,000 threshold.",
                style: "bg-amber-50 border-amber-200 text-amber-800"
            };
        }
    }
    return null;
  };
  
  const nsfasStatus = getNsfasEligibility();

  // --- Email Generation Logic ---
  const generateMailtoLink = (institutionId: string) => {
      const institution = INSTITUTIONS.find(i => i.id === institutionId);
      const course = formData.selectedCourses[institutionId] || 'Course Application';
      const email = institution?.contact.email || 'admissions@university.ac.za';
      
      const subject = encodeURIComponent(`Application: ${course} - ${formData.lastName} ${formData.firstName} (${formData.idNumber})`);
      
      // Generate marks list for body
      const marksList = formData.subjects.map(s => `- ${s.name}: ${s.percentage}%`).join('\n');

      const bodyText = `Dear Admissions Team at ${institution?.name},

I would like to submit my application for the ${course} for the upcoming academic year.

APPLICANT DETAILS:
Name: ${formData.firstName} ${formData.lastName}
ID Number: ${formData.idNumber}
Phone: ${formData.phone}
Email: ${formData.email}
Pronouns: ${formData.pronouns}
Gender: ${formData.gender}
NSFAS Status: ${formData.nsfasRequired ? 'Applying for Funding' : 'Self-Funded'}

ACADEMIC SUMMARY (Grade 11/12):
${marksList}

ATTACHMENTS:
Please find my certified ID Copy, Academic Results, and other supporting documents attached to this email.

Kind regards,
${formData.firstName} ${formData.lastName}`;

      return `mailto:${email}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
  };

  const renderUploadZone = (key: keyof ApplicationFormData['documents'], label: string) => {
    const doc = formData.documents[key] as UploadedDocument | undefined;
    const isUploading = uploadingDoc === key;
    return (
        <div className={`p-4 rounded-xl border-2 border-dashed transition-all bg-white ${errors[`documents.${key}`] ? 'border-red-300 bg-red-50' : 'border-stone-200 hover:border-orange-300'}`}>
            <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-stone-700">{label}</span>
                {doc && !isUploading && <CheckCircle size={16} className="text-green-500" />}
            </div>
            {!doc ? (
                <label className="flex flex-col items-center justify-center h-24 cursor-pointer">
                    {isUploading ? (
                        <div className="w-full px-4"><div className="h-1 bg-stone-200 rounded-full overflow-hidden"><div className="h-full bg-orange-500 transition-all" style={{width: `${uploadProgress}%`}}></div></div></div>
                    ) : (
                        <>
                            <UploadCloud size={24} className="text-stone-300 mb-1" />
                            <span className="text-xs text-stone-400 font-medium">Tap to upload PDF/IMG</span>
                            <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => e.target.files && handleFileUpload(key, e.target.files[0])} />
                        </>
                    )}
                </label>
            ) : (
                <div className="flex items-center justify-between bg-stone-50 p-3 rounded-lg border border-stone-100">
                    <div className="flex items-center overflow-hidden">
                        <FileText size={20} className="text-stone-400 mr-3 flex-shrink-0" />
                        <span className="text-xs font-medium text-stone-700 truncate">{doc.name}</span>
                    </div>
                    <button onClick={() => setFormData(p => { const d = {...p.documents}; delete d[key]; return {...p, documents: d}; })}><Trash2 size={16} className="text-stone-400 hover:text-red-500" /></button>
                </div>
            )}
            {errors[`documents.${key}`] && <p className="text-xs text-red-500 mt-2 font-bold">Required</p>}
        </div>
    );
  };

  // --- Render "Email Action Center" if submitted ---
  if (isApplicationComplete) {
      return (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm overflow-hidden animate-fadeIn">
              <div className="bg-green-50 p-8 text-center border-b border-green-100">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 shadow-sm">
                      <Mail size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-green-900">Application Packaged!</h2>
                  <p className="text-green-700 mt-2 text-sm max-w-md mx-auto">
                      Your details are formatted and ready. Please send the emails below to complete your application.
                  </p>
              </div>

              <div className="p-6 space-y-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                      <Paperclip className="text-amber-600 flex-shrink-0 mt-1" size={20} />
                      <div>
                          <h4 className="font-bold text-amber-900 text-sm">Action Required: Attach Documents</h4>
                          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                              Due to browser security, we cannot attach your files automatically. 
                              When the email opens, please attach the following files from your device:
                          </p>
                          <div className="flex gap-2 mt-2">
                              {Object.values(formData.documents).filter((doc): doc is UploadedDocument => !!doc).map((doc, idx) => (
                                  <span key={idx} className="bg-white px-2 py-1 rounded border border-amber-200 text-[10px] font-bold text-amber-700">
                                      {doc.name}
                                  </span>
                              ))}
                          </div>
                      </div>
                  </div>

                  <div className="space-y-4">
                      <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider">Your Draft Emails</h3>
                      {formData.selectedInstitutions.map((instId, idx) => {
                          const inst = INSTITUTIONS.find(i => i.id === instId);
                          return (
                              <a 
                                key={instId}
                                href={generateMailtoLink(instId)}
                                className="block group"
                              >
                                  <div className="border border-stone-200 rounded-2xl p-5 hover:border-orange-300 hover:shadow-md transition-all bg-white relative overflow-hidden">
                                      <div className="flex justify-between items-center relative z-10">
                                          <div className="flex items-center gap-4">
                                              <div className="bg-stone-100 p-3 rounded-xl text-stone-600 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                                                  <Send size={24} />
                                              </div>
                                              <div>
                                                  <h4 className="font-bold text-stone-800 text-lg">{inst?.name}</h4>
                                                  <p className="text-xs text-stone-500">To: {inst?.contact.email}</p>
                                              </div>
                                          </div>
                                          <ExternalLink className="text-stone-300 group-hover:text-orange-500" size={20} />
                                      </div>
                                      
                                      <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                                           <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                               Applying for: {formData.selectedCourses[instId]}
                                           </span>
                                           <span className="text-xs text-stone-400 font-medium">Click to open email app</span>
                                      </div>
                                  </div>
                              </a>
                          );
                      })}
                  </div>

                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 text-center">
                       <p className="text-xs text-stone-500 mb-1">
                           <Info size={12} className="inline mr-1" />
                           The university will reply with an automated acknowledgement email.
                       </p>
                       <p className="text-xs text-stone-500">
                           Keep that email safe as proof of application.
                       </p>
                  </div>

                  <button 
                      onClick={handleFinish}
                      className="w-full bg-stone-900 text-white py-4 rounded-full font-bold shadow-xl hover:bg-black transition-transform active:scale-95 flex items-center justify-center gap-2"
                  >
                      I've Sent the Emails <CheckCircle size={20} />
                  </button>
              </div>
          </div>
      );
  }

  // --- Standard Form Render (Steps 1-6) ---
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-stone-100 p-5 flex items-center justify-between sticky top-0 z-20">
         <div className="flex items-center gap-2">
             <div className="flex items-center">
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <div key={i} className={`h-1.5 w-6 rounded-full mx-0.5 transition-all ${i + 1 <= step ? 'bg-orange-500' : 'bg-stone-200'}`} />
                ))}
             </div>
             <span className="text-xs font-bold text-stone-400 ml-2">Step {step}</span>
         </div>
         <div className="flex gap-2">
            <button type="button" onClick={handleDemoFill} className="text-purple-600 bg-purple-50 p-2 rounded-full hover:bg-purple-100 transition"><Wand2 size={16}/></button>
            <button type="button" onClick={handleSaveDraft} disabled={saveStatus === 'saving'} className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold border transition ${saveStatus === 'saved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-stone-600 border-stone-200'}`}>
                {saveStatus === 'saving' ? <Loader2 size={14} className="animate-spin" /> : saveStatus === 'saved' ? <CheckCircle size={14} /> : <Save size={14} />}
                <span className="ml-1">{saveStatus === 'saving' ? 'Saving' : 'Save'}</span>
            </button>
         </div>
      </div>

      <div className="p-6 pb-8">
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center justify-center mb-6">
               <div className="relative group">
                 <div className={`w-28 h-28 rounded-full overflow-hidden bg-stone-100 border-4 shadow-sm flex items-center justify-center transition-all ${errors.profilePicture ? 'border-red-300' : 'border-white'}`}>
                   {formData.profilePicture?.dataUrl ? (
                       <img src={formData.profilePicture.dataUrl} className="w-full h-full object-cover" alt="Profile" />
                   ) : (
                       <UserIcon size={40} className="text-stone-300" />
                   )}
                   {isUploadingProfilePic && (
                       <div className="absolute inset-0 bg-stone-900/60 flex flex-col items-center justify-center backdrop-blur-sm z-20">
                           <div className="w-12 h-12 relative flex items-center justify-center">
                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                    <path
                                        className="text-white/20"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="text-orange-500 drop-shadow-sm transition-all duration-200 ease-out"
                                        strokeDasharray={`${profilePicProgress}, 100`}
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                </svg>
                                <span className="absolute text-[9px] font-bold text-white">{profilePicProgress}%</span>
                           </div>
                       </div>
                   )}
                 </div>
                 
                 {/* Upload Button */}
                 <label className={`absolute bottom-0 right-0 bg-stone-900 text-white p-2.5 rounded-full cursor-pointer shadow-md hover:bg-stone-800 transition-transform hover:scale-105 active:scale-95 z-10 ${isUploadingProfilePic ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Camera size={16} />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleProfilePicUpload(e.target.files[0])} />
                 </label>

                 {/* Delete Button - Only show if image exists and not uploading */}
                 {formData.profilePicture && !isUploadingProfilePic && (
                     <button 
                        onClick={handleDeleteProfilePic}
                        className="absolute top-0 right-0 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-transform hover:scale-105 active:scale-95 z-10"
                        title="Remove photo"
                     >
                         <X size={14} />
                     </button>
                 )}
               </div>
               
               {/* Error Message */}
               {errors.profilePicture && (
                   <p className="text-xs text-red-500 font-bold mt-2 flex items-center animate-fadeIn">
                       <AlertCircle size={12} className="mr-1" /> {errors.profilePicture}
                   </p>
               )}
               
               {!errors.profilePicture && !formData.profilePicture && (
                   <p className="text-xs text-stone-400 mt-2 font-medium">Tap camera to upload photo</p>
               )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className={labelClass}>First Name</label>
                  <input name="firstName" value={formData.firstName} onChange={handleChange} className={`${inputClass} ${errors.firstName ? 'bg-red-50 text-red-900 focus:ring-red-500' : ''}`} />
              </div>
              <div>
                  <label className={labelClass}>Last Name</label>
                  <input name="lastName" value={formData.lastName} onChange={handleChange} className={`${inputClass} ${errors.lastName ? 'bg-red-50 text-red-900 focus:ring-red-500' : ''}`} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Pronouns</label>
                <select name="pronouns" value={formData.pronouns} onChange={handleChange} className={`${inputClass} ${errors.pronouns ? 'bg-red-50 text-red-900 focus:ring-red-500' : ''}`}>
                    <option value="">Select</option>
                    <option value="He/Him">He/Him</option>
                    <option value="She/Her">She/Her</option>
                    <option value="They/Them">They/Them</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>ID Number</label>
                <input name="idNumber" value={formData.idNumber} onChange={handleChange} maxLength={13} className={`${inputClass} ${errors.idNumber ? 'bg-red-50 text-red-900 focus:ring-red-500' : ''}`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className={`${inputClass} ${errors.gender ? 'bg-red-50 text-red-900 focus:ring-red-500' : ''}`}>
                    <option value="">Select</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Ethnicity</label>
                <select name="ethnicity" value={formData.ethnicity} onChange={handleChange} className={`${inputClass} ${errors.ethnicity ? 'bg-red-50 text-red-900 focus:ring-red-500' : ''}`}>
                    <option value="">Select</option>
                    {ETHNICITIES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Phone</label>
                    <div className="relative">
                        <input 
                            name="phone" 
                            value={formData.phone} 
                            onChange={handleChange} 
                            className={`w-full p-4 rounded-xl border-none focus:ring-2 focus:bg-white transition-all text-sm font-medium placeholder-stone-400 pr-10 ${
                                errors.phone 
                                ? 'bg-red-50 focus:ring-red-500 text-red-900' 
                                : formData.phone && !errors.phone && formData.phone.length > 3
                                    ? 'bg-green-50 focus:ring-green-500 text-green-900' 
                                    : 'bg-stone-100 focus:ring-orange-500 text-stone-800'
                            }`}
                            placeholder="+27 72 123 4567"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            {errors.phone && <AlertCircle size={18} className="text-red-500" />}
                            {!errors.phone && formData.phone && formData.phone.length > 3 && !validateField('phone', formData.phone) && (
                                <Check size={18} className="text-green-600" />
                            )}
                        </div>
                    </div>
                    {errors.phone && <p className="text-xs text-red-500 mt-1 ml-1 font-bold">{errors.phone}</p>}
                </div>
                <div>
                    <label className={labelClass}>Province</label>
                    <select name="province" value={formData.province} onChange={handleChange} className={`${inputClass} ${errors.province ? 'bg-red-50 text-red-900 focus:ring-red-500' : ''}`}>
                        <option value="">Select</option>{PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className={labelClass}>Email</label>
                <input name="email" value={formData.email} onChange={handleChange} className={`${inputClass} ${errors.email ? 'bg-red-50 text-red-900 focus:ring-red-500' : ''}`} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fadeIn space-y-4">
            <h3 className="text-lg font-bold text-stone-800 mb-2">School Transcript</h3>
            <p className="text-xs text-stone-500 mb-4">Please add your high school subjects and marks.</p>

            {/* Input Area */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm mb-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1">
                        <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">Subject</label>
                        <select 
                            value={currentSubject}
                            onChange={(e) => setCurrentSubject(e.target.value)}
                            className="w-full p-3 bg-stone-50 rounded-lg border-none text-sm focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">Select Subject</option>
                            {MATRIC_SUBJECTS.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-24">
                        <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">Mark %</label>
                        <input 
                            type="number"
                            value={currentMark}
                            onChange={(e) => setCurrentMark(e.target.value)}
                            className="w-full p-3 bg-stone-50 rounded-lg border-none text-sm focus:ring-2 focus:ring-orange-500 text-center font-bold"
                            placeholder="0"
                            min="0"
                            max="100"
                        />
                    </div>
                    <div className="flex items-end">
                        <button 
                            onClick={handleAddSubject}
                            disabled={!currentSubject || !currentMark}
                            className="w-full md:w-auto px-6 py-3 bg-stone-900 text-white rounded-lg font-bold text-sm hover:bg-black disabled:opacity-50 transition flex items-center justify-center"
                        >
                            <Plus size={18} className="mr-1"/> Add
                        </button>
                    </div>
                </div>
            </div>

            {errors.subjects && <p className="text-xs text-red-500 font-bold ml-1 mb-2 flex items-center"><AlertCircle size={14} className="mr-1"/>{errors.subjects}</p>}

            {/* List of Added Subjects */}
            <div className="space-y-2">
                {formData.subjects.length === 0 && (
                    <div className="text-center py-8 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                        <p className="text-stone-400 text-sm">No subjects added yet.</p>
                    </div>
                )}
                {formData.subjects.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white border border-stone-100 p-3 rounded-xl shadow-sm">
                        <span className="font-medium text-stone-800 text-sm">{item.name}</span>
                        <div className="flex items-center">
                            <span className="font-bold text-stone-900 bg-stone-100 px-3 py-1 rounded-lg text-sm mr-3">{item.percentage}%</span>
                            <button 
                                onClick={() => handleRemoveSubject(idx)}
                                className="text-stone-400 hover:text-red-500 transition p-1"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 mt-4">
                 <p className="text-xs text-orange-800 flex items-center">
                     <Info size={14} className="mr-2 flex-shrink-0"/>
                     Ensure you add Mathematics (or Math Lit) and English.
                 </p>
            </div>
          </div>
        )}

        {step === 3 && (
            <div className="animate-fadeIn space-y-4">
                 <button onClick={handleGetAIRecommendations} disabled={loadingRecommendations} className="w-full bg-indigo-50 text-indigo-700 py-3 rounded-xl text-sm font-bold flex items-center justify-center mb-4">
                    {loadingRecommendations ? <Loader2 size={16} className="animate-spin mr-2" /> : <Sparkles size={16} className="mr-2" />} AI Course Advisor
                 </button>
                 {aiRecommendations && <div className="bg-indigo-50 p-4 rounded-xl text-xs text-indigo-800 mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: aiRecommendations }} />}
                 
                 {formData.selectedInstitutions.map(instId => {
                     const inst = INSTITUTIONS.find(i => i.id === instId);
                     if (!inst) return null;
                     const error = errors[`course_${instId}`];
                     return (
                         <div key={instId} className={`bg-white border rounded-2xl p-4 shadow-sm ${error ? 'border-red-300 bg-red-50' : 'border-stone-200'}`}>
                             <div className="flex items-center mb-3">
                                 <img src={inst.logoPlaceholder} className="w-8 h-8 rounded bg-stone-100 mr-3" />
                                 <span className="font-bold text-sm text-stone-800">{inst.name}</span>
                                 {error && <span className="ml-auto text-xs font-bold text-red-500">Select a course</span>}
                             </div>
                             <div className="space-y-2 max-h-fit overflow-y-auto pr-1">
                                 {inst.courses.map((c, idx) => {
                                     const isSelected = formData.selectedCourses[instId] === c.name;
                                     const eligibleStatus = checkCourseEligibility(c);
                                     
                                     return (
                                     <div key={idx} className={`mb-2 rounded-xl border transition-all ${isSelected ? 'bg-orange-50 border-orange-500' : 'bg-stone-50 border-transparent'}`}>
                                         <label className="flex items-center p-3 cursor-pointer">
                                             <input type="radio" name={`course_${instId}`} value={c.name} checked={isSelected} onChange={() => handleCourseChange(instId, c.name)} className="mr-3 text-orange-600 focus:ring-orange-500" />
                                             <div className="flex-1 flex justify-between items-center">
                                                 <span className="text-xs font-medium text-stone-700">{c.name}</span>
                                                 {eligibleStatus ? (
                                                     <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">Qualified</span>
                                                 ) : (
                                                     <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">Requirements Unmet</span>
                                                 )}
                                             </div>
                                         </label>
                                         
                                         {/* Prereq Analysis Section - Only show if selected */}
                                         {isSelected && (
                                             <div className="px-3 pb-3 pt-0 ml-7 space-y-1">
                                                 <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Entry Requirements</p>
                                                 {c.prerequisites.map((req, rIdx) => {
                                                     const analysis = analyzePrerequisite(req);
                                                     return (
                                                         <div key={rIdx} className="flex items-center text-xs">
                                                             {analysis.status === 'met' && <CheckCircle size={12} className="text-green-500 mr-1.5 flex-shrink-0" />}
                                                             {analysis.status === 'unmet' && <X size={12} className="text-red-500 mr-1.5 flex-shrink-0" />}
                                                             {analysis.status === 'unknown' && <AlertCircle size={12} className="text-stone-400 mr-1.5 flex-shrink-0" />}
                                                             
                                                             <span className={`${
                                                                 analysis.status === 'met' ? 'text-green-700' : 
                                                                 analysis.status === 'unmet' ? 'text-red-700 font-bold' : 
                                                                 'text-stone-500'
                                                             }`}>
                                                                 {req}
                                                             </span>
                                                         </div>
                                                     );
                                                 })}
                                                 
                                                 {!eligibleStatus && (
                                                     <div className="mt-3 bg-red-50 border border-red-100 p-3 rounded-lg flex items-start">
                                                         <AlertTriangle size={16} className="text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                                                         <p className="text-xs text-red-800 leading-tight">
                                                             You do not meet the minimum requirements for this course based on your entered marks. Your application may be rejected.
                                                         </p>
                                                     </div>
                                                 )}
                                             </div>
                                         )}
                                     </div>
                                     );
                                 })}
                             </div>
                         </div>
                     );
                 })}
            </div>
        )}

        {step === 4 && (
             <div className="animate-fadeIn space-y-6">
                 <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
                     <label className="flex items-center cursor-pointer mb-2">
                         <input type="checkbox" name="nsfasRequired" checked={formData.nsfasRequired} onChange={handleChange} className="w-5 h-5 text-orange-600 rounded mr-3" />
                         <span className="font-bold text-stone-800 text-lg">Apply for NSFAS Funding</span>
                     </label>
                     <p className="text-xs text-stone-500 mb-4 ml-8">
                        The National Student Financial Aid Scheme provides financial relief for eligible students.
                     </p>
                     
                     {formData.nsfasRequired && (
                         <div className="space-y-6 pl-2 sm:pl-8 border-l-2 border-orange-100 ml-2">
                             
                             {/* Informational Section */}
                             <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm space-y-3 animate-fadeIn">
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 p-2 rounded-full text-blue-600 flex-shrink-0">
                                        <Info size={16} />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-blue-900">Eligibility & Benefits</h4>
                                        <ul className="list-disc list-inside text-blue-800 space-y-1 text-xs">
                                            <li><strong>Threshold:</strong> Combined household income must be under <strong>R350,000</strong> per year (R600,000 for students with disabilities).</li>
                                            <li><strong>Calculation:</strong> Includes gross income from all working family members before tax and deductions. Social grants are excluded.</li>
                                            <li><strong>What is covered:</strong> Registration, Tuition, Accommodation, Transport, Books, and a monthly Living Allowance.</li>
                                        </ul>
                                    </div>
                                </div>
                             </div>

                             <label className="flex items-center cursor-pointer bg-stone-50 p-4 rounded-xl border border-stone-200 transition-colors hover:bg-stone-100">
                                 <input type="checkbox" name="sassaBeneficiary" checked={formData.sassaBeneficiary} onChange={handleChange} className="w-4 h-4 text-orange-600 rounded mr-3" />
                                 <div className="flex flex-col">
                                    <span className="font-bold text-stone-800 text-sm">I am a SASSA Beneficiary</span>
                                    <span className="text-xs text-stone-500">Beneficiaries automatically qualify for funding (no income proof needed).</span>
                                 </div>
                             </label>

                             {!formData.sassaBeneficiary && (
                                 <div className="animate-fadeIn">
                                     <label className={labelClass}>Annual Household Income (R)</label>
                                     <div className="relative">
                                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold">R</span>
                                         <input 
                                             type="number" 
                                             name="householdIncome" 
                                             value={formData.householdIncome} 
                                             onChange={handleChange} 
                                             className={`${inputClass} pl-8 ${errors.householdIncome ? 'bg-red-50 text-red-900' : ''}`} 
                                             placeholder="0.00" 
                                         />
                                     </div>
                                     <p className="text-xs text-stone-400 mt-2">
                                         * Sum of salaries, wages, business profit, and other income for both parents/guardians.
                                     </p>
                                     {errors.householdIncome && <p className="text-xs text-red-500 mt-1">Required for non-SASSA applicants</p>}
                                 </div>
                             )}

                             {/* Real-time Eligibility Feedback */}
                             {nsfasStatus && (
                                 <div className={`p-4 rounded-xl border flex items-start animate-fadeIn ${nsfasStatus.style}`}>
                                     {nsfasStatus.eligible ? <CheckCircle className="mr-3 mt-0.5 flex-shrink-0" size={20} /> : <AlertCircle className="mr-3 mt-0.5 flex-shrink-0" size={20} />}
                                     <div>
                                         <h4 className="font-bold text-sm">{nsfasStatus.title}</h4>
                                         <p className="text-xs opacity-90 mt-1 leading-relaxed">{nsfasStatus.description}</p>
                                     </div>
                                 </div>
                             )}
                         </div>
                     )}
                 </div>
             </div>
        )}

        {step === 5 && (
            <div className="animate-fadeIn space-y-4">
                {renderUploadZone('idDocument', 'Certified ID Copy')}
                {renderUploadZone('academicRecord', 'Results (Grade 11/12)')}
                {formData.nsfasRequired && !formData.sassaBeneficiary && renderUploadZone('proofOfIncome', 'Proof of Income')}
            </div>
        )}

        {step === 6 && (
            <div className="animate-fadeIn bg-stone-50 rounded-2xl p-6 border border-stone-200">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircle size={32} /></div>
                    <h3 className="font-bold text-stone-800 text-lg">Ready to Submit?</h3>
                    <p className="text-xs text-stone-500">Please review your details carefully.</p>
                </div>
                <div className="space-y-3 text-sm text-stone-600">
                    <div className="flex justify-between border-b border-stone-200 pb-2"><span>Name:</span> <span className="font-bold text-stone-800">{formData.firstName} {formData.lastName}</span></div>
                    <div className="flex justify-between border-b border-stone-200 pb-2"><span>Gender/Ethnicity:</span> <span className="font-bold text-stone-800">{formData.gender}, {formData.ethnicity}</span></div>
                    <div className="flex justify-between border-b border-stone-200 pb-2"><span>Institutions:</span> <span className="font-bold text-stone-800">{formData.selectedInstitutions.length}</span></div>
                    <div className="flex justify-between border-b border-stone-200 pb-2"><span>Funding:</span> <span className="font-bold text-stone-800">{formData.nsfasRequired ? 'NSFAS' : 'Self'}</span></div>
                </div>
            </div>
        )}
      </div>

      <div className="p-5 border-t border-stone-100 flex gap-3">
         <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1 || isSubmitting} className="px-6 py-3 rounded-full font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 disabled:opacity-50">Back</button>
         <button onClick={step < totalSteps ? handleNext : handleSubmit} disabled={isSubmitting} className="flex-1 py-3 rounded-full font-bold text-white bg-stone-900 hover:bg-black shadow-lg flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="animate-spin" /> : step < totalSteps ? <>Next <ArrowRight size={18} /></> : 'Submit Application'}
         </button>
      </div>
    </div>
  );
};
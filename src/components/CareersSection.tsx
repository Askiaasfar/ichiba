import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { JobListing, JobApplication, WorkGigRequest, ApplicationStatus } from '../types/marketplace';
import { NIGERIAN_STATES } from '../data/initialData';

const CAREER_CATEGORIES = [
  'All Categories',
  'Software & IT Engineering',
  'Sales, Marketing & Commerce',
  'Customer Support & Client Care',
  'Operations, Logistics & Supply Chain',
  'Finance, Accounting & Audit',
  'Healthcare & Medical Services',
  'Education & Training',
  'Design, Creative & Media',
  'Trades, Engineering & Construction',
  'Administration & Human Resources',
  'Hospitality, Travel & Events',
  'Security & Facility Management'
];

const GIG_CATEGORIES = [
  'All Gigs',
  'Delivery & Dispatch Riders',
  'Artisans & Handyman (Plumbing, Electrical, Carpentry)',
  'Moving & Logistics Loaders',
  'Cleaning & Facility Upkeep',
  'Event Ushers & Staff',
  'Auto Repair & Mechanics',
  'Personal Services & Care',
  'Graphic & Digital Quick Tasks'
];

export const CareersSection: React.FC = () => {
  const {
    currentUser,
    jobListings,
    myApplications,
    workGigs,
    isLoadingJobs,
    isLoadingGigs,
    fetchJobs,
    fetchJobById,
    postJobVacancy,
    applyForJob,
    fetchMyApplications,
    updateApplicationStatus,
    fetchWorkGigs,
    postWorkGig,
    respondToWorkGig
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'find-jobs' | 'post-job' | 'quick-gigs' | 'my-applications'>('find-jobs');

  // Search & Filters for Jobs
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedWorkplace, setSelectedWorkplace] = useState('All');

  // Modal states
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<JobListing | null>(null);
  const [jobToApply, setJobToApply] = useState<JobListing | null>(null);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [showPostGigModal, setShowPostGigModal] = useState(false);
  const [selectedGigForResponse, setSelectedGigForResponse] = useState<WorkGigRequest | null>(null);
  const [selectedAppForReview, setSelectedAppForReview] = useState<JobApplication | null>(null);

  // Form states: Apply for Job
  const [applyForm, setApplyForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    headline: '',
    location: '',
    coverLetter: '',
    cvFileName: '',
    portfolioUrl: ''
  });
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [appSuccessMessage, setAppSuccessMessage] = useState('');
  const [appErrorMessage, setAppErrorMessage] = useState('');

  // Form states: Post Vacancy
  const [vacancyForm, setVacancyForm] = useState({
    title: '',
    companyName: currentUser?.name || '',
    category: CAREER_CATEGORIES[1],
    employmentType: 'Full-time' as const,
    workplaceType: 'On-site' as const,
    experienceLevel: 'Mid Level' as const,
    locationState: 'Lagos',
    locationCity: 'Ikeja',
    salaryMin: '',
    salaryMax: '',
    salaryFrequency: 'Monthly' as const,
    salaryDisclosed: true,
    applicationDeadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    vacanciesCount: 1,
    description: '',
    responsibilities: '',
    requirements: '',
    requiredSkills: ''
  });
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [jobPostSuccess, setJobPostSuccess] = useState('');
  const [jobPostError, setJobPostError] = useState('');

  // Form states: Post Gig
  const [gigForm, setGigForm] = useState({
    title: '',
    category: GIG_CATEGORIES[1],
    workersNeeded: 1,
    state: 'Lagos',
    city: 'Lagos Island',
    address: '',
    workDate: new Date().toISOString().split('T')[0],
    expectedDuration: '1 Day',
    compensationAmountNgn: 15000,
    paymentFrequency: 'Daily' as const,
    description: '',
    skills: '',
    posterName: currentUser?.name || '',
    posterPhone: currentUser?.phone || '',
    posterEmail: currentUser?.email || ''
  });
  const [isSubmittingGig, setIsSubmittingGig] = useState(false);
  const [gigPostSuccess, setGigPostSuccess] = useState('');
  const [gigPostError, setGigPostError] = useState('');

  // Form states: Respond to Gig
  const [gigResponseForm, setGigResponseForm] = useState({
    workerName: currentUser?.name || '',
    workerPhone: currentUser?.phone || '',
    skills: '',
    proposedRateNgn: '',
    message: ''
  });
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [gigRespSuccess, setGigRespSuccess] = useState('');
  const [gigRespError, setGigRespError] = useState('');

  // Application Review Status Update
  const [reviewStatus, setReviewStatus] = useState<ApplicationStatus>('Shortlisted');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewInterviewDate, setReviewInterviewDate] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Load applications if user navigates to my-applications
  useEffect(() => {
    if (activeTab === 'my-applications') {
      fetchMyApplications();
    }
  }, [activeTab]);

  const handleSearchFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs({
      search: searchQuery,
      category: selectedCategory === 'All Categories' ? undefined : selectedCategory,
      state: selectedState === 'All' ? undefined : selectedState,
      workplaceType: selectedWorkplace === 'All' ? undefined : selectedWorkplace
    });
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobToApply) return;
    setIsSubmittingApp(true);
    setAppErrorMessage('');
    setAppSuccessMessage('');

    const res = await applyForJob(jobToApply.id, {
      applicantName: applyForm.name,
      applicantEmail: applyForm.email,
      applicantPhone: applyForm.phone,
      applicantHeadline: applyForm.headline,
      applicantLocation: applyForm.location,
      coverLetter: applyForm.coverLetter,
      cvFileName: applyForm.cvFileName || 'Submitted via Askia Careers Profile',
      portfolioUrl: applyForm.portfolioUrl
    });

    setIsSubmittingApp(false);
    if (res.success) {
      setAppSuccessMessage(`Application submitted for ${jobToApply.title} at ${jobToApply.companyName}!`);
      setTimeout(() => {
        setJobToApply(null);
        setAppSuccessMessage('');
      }, 2000);
    } else {
      setAppErrorMessage(res.error || 'Failed to submit application. Please check your details.');
    }
  };

  const handlePostJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingJob(true);
    setJobPostError('');
    setJobPostSuccess('');

    const res = await postJobVacancy({
      title: vacancyForm.title,
      companyName: vacancyForm.companyName,
      category: vacancyForm.category,
      employmentType: vacancyForm.employmentType,
      workplaceType: vacancyForm.workplaceType,
      experienceLevel: vacancyForm.experienceLevel,
      locationState: vacancyForm.locationState,
      locationCity: vacancyForm.locationCity,
      salaryMin: vacancyForm.salaryMin ? Number(vacancyForm.salaryMin) : undefined,
      salaryMax: vacancyForm.salaryMax ? Number(vacancyForm.salaryMax) : undefined,
      salaryFrequency: vacancyForm.salaryFrequency,
      salaryDisclosed: vacancyForm.salaryDisclosed,
      applicationDeadline: vacancyForm.applicationDeadline,
      vacanciesCount: Number(vacancyForm.vacanciesCount) || 1,
      description: vacancyForm.description,
      responsibilities: vacancyForm.responsibilities.split('\n').filter((l) => l.trim()),
      requirements: vacancyForm.requirements.split('\n').filter((l) => l.trim()),
      requiredSkills: vacancyForm.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
    });

    setIsSubmittingJob(false);
    if (res.success) {
      setJobPostSuccess('Job vacancy published successfully on Askia Careers!');
      setTimeout(() => {
        setShowPostJobModal(false);
        setJobPostSuccess('');
        setActiveTab('find-jobs');
        fetchJobs();
      }, 1800);
    } else {
      setJobPostError(res.error || 'Failed to publish vacancy.');
    }
  };

  const handlePostGigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingGig(true);
    setGigPostError('');
    setGigPostSuccess('');

    const res = await postWorkGig({
      title: gigForm.title,
      category: gigForm.category,
      workersNeeded: Number(gigForm.workersNeeded) || 1,
      state: gigForm.state,
      city: gigForm.city,
      address: gigForm.address,
      workDate: gigForm.workDate,
      expectedDuration: gigForm.expectedDuration,
      compensationAmountNgn: Number(gigForm.compensationAmountNgn) || 0,
      paymentFrequency: gigForm.paymentFrequency,
      description: gigForm.description,
      requiredSkills: gigForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
      posterName: gigForm.posterName,
      posterPhone: gigForm.posterPhone,
      posterEmail: gigForm.posterEmail
    });

    setIsSubmittingGig(false);
    if (res.success) {
      setGigPostSuccess('Work request published! Workers will be notified.');
      setTimeout(() => {
        setShowPostGigModal(false);
        setGigPostSuccess('');
        fetchWorkGigs();
      }, 1800);
    } else {
      setGigPostError(res.error || 'Failed to publish work request.');
    }
  };

  const handleGigResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGigForResponse) return;
    setIsSubmittingResponse(true);
    setGigRespError('');
    setGigRespSuccess('');

    const res = await respondToWorkGig(selectedGigForResponse.id, {
      workerName: gigResponseForm.workerName,
      workerPhone: gigResponseForm.workerPhone,
      workerSkills: gigResponseForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
      proposedRateNgn: gigResponseForm.proposedRateNgn ? Number(gigResponseForm.proposedRateNgn) : undefined,
      message: gigResponseForm.message
    });

    setIsSubmittingResponse(false);
    if (res.success) {
      setGigRespSuccess('Your interest has been submitted to the poster!');
      setTimeout(() => {
        setSelectedGigForResponse(null);
        setGigRespSuccess('');
      }, 1800);
    } else {
      setGigRespError(res.error || 'Failed to submit response.');
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedAppForReview) return;
    setIsUpdatingStatus(true);
    const res = await updateApplicationStatus(
      selectedAppForReview.id,
      reviewStatus,
      reviewNotes,
      reviewInterviewDate
    );
    setIsUpdatingStatus(false);
    if (res.success) {
      setSelectedAppForReview(null);
      fetchMyApplications();
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] pb-24">
      {/* Top Banner Header */}
      <section className="border-b border-[#222222] bg-[#000000] px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
                Official Nigerian Employment & Gig Network
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#F5F5F5] tracking-tight">
                ASKIA <span className="text-[#D4AF37]">CAREERS & WORK</span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-400 max-w-2xl">
                Browse verified employment opportunities, hire vetted Nigerian professionals, or request immediate daily artisan and delivery workers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowPostJobModal(true)}
                className="btn-gold flex items-center gap-2 text-sm px-4 py-2.5 font-bold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Post Job Vacancy
              </button>
              <button
                onClick={() => setShowPostGigModal(true)}
                className="btn-outline flex items-center gap-2 text-sm px-4 py-2.5 font-bold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Request Worker / Gig
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex overflow-x-auto no-scrollbar gap-2 border-b border-[#222222] pb-px">
            <button
              onClick={() => setActiveTab('find-jobs')}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                activeTab === 'find-jobs'
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Jobs ({jobListings.length})
            </button>

            <button
              onClick={() => setActiveTab('quick-gigs')}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                activeTab === 'quick-gigs'
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Gigs & Daily Work ({workGigs.length})
            </button>

            <button
              onClick={() => setActiveTab('my-applications')}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                activeTab === 'my-applications'
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Applications ({myApplications.length})
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        {/* TAB 1: FIND JOBS */}
        {activeTab === 'find-jobs' && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <form onSubmit={handleSearchFilter} className="card-marketplace p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Job title, keywords, or company..."
                    className="input-marketplace pl-9 text-sm w-full"
                  />
                </div>

                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input-marketplace text-sm w-full"
                  >
                    {CAREER_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="input-marketplace text-sm w-full"
                  >
                    <option value="All">All Nigerian States</option>
                    {NIGERIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#222222]">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Workplace:</span>
                  {(['All', 'On-site', 'Remote', 'Hybrid'] as const).map((wp) => (
                    <button
                      key={wp}
                      type="button"
                      onClick={() => setSelectedWorkplace(wp)}
                      className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${
                        selectedWorkplace === wp
                          ? 'bg-[#D4AF37] text-black font-bold'
                          : 'bg-[#181818] text-gray-300 hover:bg-[#252525]'
                      }`}
                    >
                      {wp}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All Categories');
                      setSelectedState('All');
                      setSelectedWorkplace('All');
                      fetchJobs();
                    }}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Reset
                  </button>
                  <button type="submit" className="btn-gold text-xs px-4 py-1.5 font-bold">
                    Filter Vacancies
                  </button>
                </div>
              </div>
            </form>

            {/* Job Listings Grid */}
            {isLoadingJobs ? (
              <div className="py-20 text-center text-gray-400">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#D4AF37] border-r-transparent"></div>
                <p className="mt-3 text-sm">Loading active job vacancies...</p>
              </div>
            ) : jobListings.length === 0 ? (
              <div className="card-marketplace p-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-[#1A1A1A] flex items-center justify-center text-gray-500 mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white">No job vacancies found</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Try adjusting your search criteria or be the first company to post a vacancy in this category.
                </p>
                <button
                  onClick={() => setShowPostJobModal(true)}
                  className="mt-4 btn-gold text-xs px-4 py-2 font-bold"
                >
                  Post a Vacancy
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobListings.map((job) => (
                  <div
                    key={job.id}
                    className="card-marketplace p-5 flex flex-col justify-between hover:border-[#D4AF37]/50 transition-all group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="inline-block text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wider mb-1">
                            {job.category}
                          </span>
                          <h3 className="text-base font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-gray-300">{job.companyName}</span>
                            {job.isVerifiedEmployer && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Verified Employer
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="shrink-0 text-xs px-2.5 py-1 rounded bg-[#1A1A1A] border border-[#2A2A2A] text-gray-300 font-medium">
                          {job.employmentType}
                        </span>
                      </div>

                      {/* Location & Compensation */}
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {job.locationCity}, {job.locationState} ({job.workplaceType})
                        </span>

                        <span className="flex items-center gap-1 text-[#D4AF37] font-semibold">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {job.salaryDisclosed && job.salaryMin
                            ? `₦${Number(job.salaryMin).toLocaleString()} ${job.salaryMax ? `- ₦${Number(job.salaryMax).toLocaleString()}` : ''} / ${job.salaryFrequency}`
                            : 'Salary Negotiable'}
                        </span>
                      </div>

                      <p className="mt-3 text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>

                      {/* Skills Tags */}
                      {job.requiredSkills && job.requiredSkills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {job.requiredSkills.slice(0, 4).map((skill, idx) => (
                            <span key={idx} className="text-[10px] bg-[#161616] border border-[#262626] text-gray-300 px-2 py-0.5 rounded">
                              {skill}
                            </span>
                          ))}
                          {job.requiredSkills.length > 4 && (
                            <span className="text-[10px] text-gray-500 self-center">
                              +{job.requiredSkills.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-5 pt-3 border-t border-[#1C1C1C] flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedJobForDetails(job)}
                          className="px-3 py-1.5 text-xs text-gray-300 hover:text-white bg-[#1A1A1A] hover:bg-[#252525] rounded transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            setJobToApply(job);
                            setApplyForm((prev) => ({
                              ...prev,
                              name: currentUser?.name || '',
                              email: currentUser?.email || '',
                              phone: currentUser?.phone || ''
                            }));
                          }}
                          className="btn-gold px-3.5 py-1.5 text-xs font-bold"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: QUICK GIGS & WORK REQUESTS */}
        {activeTab === 'quick-gigs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-marketplace p-5">
              <div>
                <h2 className="text-lg font-bold text-white">Daily Gigs & Instant Work</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Direct jobs for dispatch riders, technicians, artisans, caterers, loaders, and urgent tasks.
                </p>
              </div>
              <button
                onClick={() => setShowPostGigModal(true)}
                className="btn-gold text-xs px-4 py-2 font-bold whitespace-nowrap self-start sm:self-auto"
              >
                + Post a Gig Request
              </button>
            </div>

            {isLoadingGigs ? (
              <div className="py-20 text-center text-gray-400">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#D4AF37] border-r-transparent"></div>
                <p className="mt-3 text-sm">Loading available gigs...</p>
              </div>
            ) : workGigs.length === 0 ? (
              <div className="card-marketplace p-12 text-center">
                <h3 className="text-base font-bold text-white">No active gig requests at the moment</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Be the first to request workers or check back shortly.
                </p>
                <button
                  onClick={() => setShowPostGigModal(true)}
                  className="mt-4 btn-gold text-xs px-4 py-2 font-bold"
                >
                  Request Workers Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workGigs.map((gig) => (
                  <div
                    key={gig.id}
                    className="card-marketplace p-5 flex flex-col justify-between hover:border-[#D4AF37]/50 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-semibold text-[#D4AF37] uppercase">
                          {gig.category}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 text-amber-300 font-medium">
                          {gig.workersNeeded} Worker{gig.workersNeeded > 1 ? 's' : ''} Needed
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white mt-1.5">{gig.title}</h3>
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                        {gig.description}
                      </p>

                      <div className="mt-3 space-y-1.5 text-xs text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span>{gig.city}, {gig.state}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Date: {gig.workDate} ({gig.expectedDuration})</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[#D4AF37] font-bold">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>₦{Number(gig.compensationAmountNgn).toLocaleString()} ({gig.paymentFrequency})</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#1C1C1C] flex items-center justify-between">
                      <span className="text-[11px] text-gray-500">
                        Posted by {gig.posterName}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedGigForResponse(gig);
                          setGigResponseForm((prev) => ({
                            ...prev,
                            workerName: currentUser?.name || '',
                            workerPhone: currentUser?.phone || ''
                          }));
                        }}
                        className="btn-gold px-3 py-1.5 text-xs font-bold"
                      >
                        Express Interest
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY APPLICATIONS */}
        {activeTab === 'my-applications' && (
          <div className="space-y-6">
            <div className="card-marketplace p-5">
              <h2 className="text-lg font-bold text-white">Application Status Tracker</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Monitor your submitted job applications, interview invitations, and employer reviews.
              </p>
            </div>

            {myApplications.length === 0 ? (
              <div className="card-marketplace p-12 text-center">
                <p className="text-sm text-gray-400">You haven't applied to any job vacancies yet.</p>
                <button
                  onClick={() => setActiveTab('find-jobs')}
                  className="mt-4 btn-gold text-xs px-4 py-2 font-bold"
                >
                  Browse Open Vacancies
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myApplications.map((app) => (
                  <div key={app.id} className="card-marketplace p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{app.jobTitle}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          app.status === 'Hired'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : app.status === 'Interview Scheduled'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : app.status === 'Shortlisted'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : app.status === 'Rejected'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Company: <strong className="text-gray-300">{app.companyName}</strong> • Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                      </p>

                      {app.interviewDate && (
                        <div className="mt-2 text-xs bg-amber-950/40 border border-amber-800/40 text-amber-300 p-2 rounded">
                          <strong>Interview Scheduled:</strong> {app.interviewDate} {app.interviewNotes ? `— ${app.interviewNotes}` : ''}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                      <button
                        onClick={() => setSelectedAppForReview(app)}
                        className="btn-outline text-xs px-3 py-1.5"
                      >
                        View Submission
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: JOB DETAILS */}
      {selectedJobForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
          <div className="card-marketplace max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-[#333333]">
            <div className="flex items-start justify-between border-b border-[#222222] pb-3">
              <div>
                <span className="text-xs font-semibold text-[#D4AF37] uppercase">{selectedJobForDetails.category}</span>
                <h2 className="text-xl font-bold text-white mt-1">{selectedJobForDetails.title}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{selectedJobForDetails.companyName} • {selectedJobForDetails.locationCity}, {selectedJobForDetails.locationState}</p>
              </div>
              <button
                onClick={() => setSelectedJobForDetails(null)}
                className="text-gray-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-[#141414] p-3 rounded border border-[#222222]">
              <div>
                <span className="text-gray-500 block">Type</span>
                <span className="text-gray-200 font-semibold">{selectedJobForDetails.employmentType}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Experience</span>
                <span className="text-gray-200 font-semibold">{selectedJobForDetails.experienceLevel}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Workplace</span>
                <span className="text-gray-200 font-semibold">{selectedJobForDetails.workplaceType}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Salary</span>
                <span className="text-[#D4AF37] font-semibold">
                  {selectedJobForDetails.salaryDisclosed && selectedJobForDetails.salaryMin
                    ? `₦${Number(selectedJobForDetails.salaryMin).toLocaleString()}`
                    : 'Negotiable'}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Role Description</h4>
              <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">{selectedJobForDetails.description}</p>
            </div>

            {selectedJobForDetails.responsibilities && selectedJobForDetails.responsibilities.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Key Responsibilities</h4>
                <ul className="list-disc list-inside text-xs text-gray-400 space-y-1">
                  {selectedJobForDetails.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedJobForDetails.requirements && selectedJobForDetails.requirements.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Candidate Requirements</h4>
                <ul className="list-disc list-inside text-xs text-gray-400 space-y-1">
                  {selectedJobForDetails.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-[#222222] flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedJobForDetails(null)}
                className="btn-outline text-xs px-4 py-2"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setJobToApply(selectedJobForDetails);
                  setSelectedJobForDetails(null);
                }}
                className="btn-gold text-xs px-5 py-2 font-bold"
              >
                Apply for this Position
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPLY FOR JOB */}
      {jobToApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 overflow-y-auto">
          <div className="card-marketplace max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-[#333333]">
            <div className="flex items-start justify-between border-b border-[#222222] pb-3">
              <div>
                <h2 className="text-lg font-bold text-white">Apply: {jobToApply.title}</h2>
                <p className="text-xs text-gray-400">{jobToApply.companyName} • {jobToApply.locationCity}, {jobToApply.locationState}</p>
              </div>
              <button
                onClick={() => setJobToApply(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {appSuccessMessage ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded text-center text-sm font-semibold">
                {appSuccessMessage}
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-3">
                {appErrorMessage && (
                  <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded text-xs">
                    {appErrorMessage}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={applyForm.name}
                    onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                    className="input-marketplace text-xs w-full"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={applyForm.email}
                      onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                      className="input-marketplace text-xs w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 08012345678"
                      value={applyForm.phone}
                      onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                      className="input-marketplace text-xs w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Professional Headline</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Frontend Engineer"
                      value={applyForm.headline}
                      onChange={(e) => setApplyForm({ ...applyForm, headline: e.target.value })}
                      className="input-marketplace text-xs w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Current City / State</label>
                    <input
                      type="text"
                      placeholder="e.g. Ikeja, Lagos"
                      value={applyForm.location}
                      onChange={(e) => setApplyForm({ ...applyForm, location: e.target.value })}
                      className="input-marketplace text-xs w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">CV / Resume Document Name or Link *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Adebayo_CV_2026.pdf or Google Drive / LinkedIn Link"
                    value={applyForm.cvFileName}
                    onChange={(e) => setApplyForm({ ...applyForm, cvFileName: e.target.value })}
                    className="input-marketplace text-xs w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Portfolio or GitHub Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={applyForm.portfolioUrl}
                    onChange={(e) => setApplyForm({ ...applyForm, portfolioUrl: e.target.value })}
                    className="input-marketplace text-xs w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Short Cover Note</label>
                  <textarea
                    rows={3}
                    placeholder="Briefly state why you are a great match for this role..."
                    value={applyForm.coverLetter}
                    onChange={(e) => setApplyForm({ ...applyForm, coverLetter: e.target.value })}
                    className="input-marketplace text-xs w-full"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setJobToApply(null)}
                    className="btn-outline text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingApp}
                    className="btn-gold text-xs px-5 py-2 font-bold disabled:opacity-50"
                  >
                    {isSubmittingApp ? 'Submitting...' : 'Send Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: POST JOB VACANCY */}
      {showPostJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 overflow-y-auto">
          <div className="card-marketplace max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-[#333333]">
            <div className="flex items-start justify-between border-b border-[#222222] pb-3">
              <div>
                <h2 className="text-lg font-bold text-white">Post an Employment Vacancy</h2>
                <p className="text-xs text-gray-400">Reach thousands of qualified Nigerian job seekers.</p>
              </div>
              <button
                onClick={() => setShowPostJobModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {jobPostSuccess ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded text-center text-sm font-semibold">
                {jobPostSuccess}
              </div>
            ) : (
              <form onSubmit={handlePostJobSubmit} className="space-y-3">
                {jobPostError && (
                  <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded text-xs">
                    {jobPostError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Logistics Coordinator"
                    value={vacancyForm.title}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, title: e.target.value })}
                    className="input-marketplace text-xs w-full"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Hiring Company *</label>
                    <input
                      type="text"
                      required
                      value={vacancyForm.companyName}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, companyName: e.target.value })}
                      className="input-marketplace text-xs w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Category *</label>
                    <select
                      value={vacancyForm.category}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, category: e.target.value })}
                      className="input-marketplace text-xs w-full"
                    >
                      {CAREER_CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Employment Type</label>
                    <select
                      value={vacancyForm.employmentType}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, employmentType: e.target.value as any })}
                      className="input-marketplace text-xs w-full"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Workplace</label>
                    <select
                      value={vacancyForm.workplaceType}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, workplaceType: e.target.value as any })}
                      className="input-marketplace text-xs w-full"
                    >
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Experience Level</label>
                    <select
                      value={vacancyForm.experienceLevel}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, experienceLevel: e.target.value as any })}
                      className="input-marketplace text-xs w-full"
                    >
                      <option value="Entry Level">Entry Level</option>
                      <option value="Mid Level">Mid Level</option>
                      <option value="Senior Level">Senior Level</option>
                      <option value="Executive / Lead">Executive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">State *</label>
                    <select
                      value={vacancyForm.locationState}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, locationState: e.target.value })}
                      className="input-marketplace text-xs w-full"
                    >
                      {NIGERIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">City / Area *</label>
                    <input
                      type="text"
                      required
                      value={vacancyForm.locationCity}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, locationCity: e.target.value })}
                      className="input-marketplace text-xs w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Monthly Salary Min (₦)</label>
                    <input
                      type="number"
                      placeholder="e.g. 150000"
                      value={vacancyForm.salaryMin}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, salaryMin: e.target.value })}
                      className="input-marketplace text-xs w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Monthly Salary Max (₦)</label>
                    <input
                      type="number"
                      placeholder="e.g. 250000"
                      value={vacancyForm.salaryMax}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, salaryMax: e.target.value })}
                      className="input-marketplace text-xs w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Application Deadline</label>
                    <input
                      type="date"
                      required
                      value={vacancyForm.applicationDeadline}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, applicationDeadline: e.target.value })}
                      className="input-marketplace text-xs w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Job Description *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Overview of the position, scope, and objectives..."
                    value={vacancyForm.description}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, description: e.target.value })}
                    className="input-marketplace text-xs w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Required Skills (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. React, Node.js, TypeScript, SQL"
                    value={vacancyForm.requiredSkills}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, requiredSkills: e.target.value })}
                    className="input-marketplace text-xs w-full"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPostJobModal(false)}
                    className="btn-outline text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingJob}
                    className="btn-gold text-xs px-5 py-2 font-bold disabled:opacity-50"
                  >
                    {isSubmittingJob ? 'Publishing...' : 'Publish Vacancy'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: POST QUICK GIG */}
      {showPostGigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 overflow-y-auto">
          <div className="card-marketplace max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-[#333333]">
            <div className="flex items-start justify-between border-b border-[#222222] pb-3">
              <div>
                <h2 className="text-lg font-bold text-white">Request Urgent Worker or Gig</h2>
                <p className="text-xs text-gray-400">Post immediate tasks for artisans, delivery drivers, or helpers.</p>
              </div>
              <button
                onClick={() => setShowPostGigModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {gigPostSuccess ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded text-center text-sm font-semibold">
                {gigPostSuccess}
              </div>
            ) : (
              <form onSubmit={handlePostGigSubmit} className="space-y-3">
                {gigPostError && (
                  <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded text-xs">
                    {gigPostError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Gig Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2 Dispatch Riders with Bikes Needed for Weekend"
                    value={gigForm.title}
                    onChange={(e) => setGigForm({ ...gigForm, title: e.target.value })}
                    className="input-marketplace text-xs w-full"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Category *</label>
                    <select
                      value={gigForm.category}
                      onChange={(e) => setGigForm({ ...gigForm, category: e.target.value })}
                      className="input-marketplace text-xs w-full"
                    >
                      {GIG_CATEGORIES.filter((c) => c !== 'All Gigs').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Workers Needed</label>
                    <input
                      type="number"
                      min={1}
                      value={gigForm.workersNeeded}
                      onChange={(e) => setGigForm({ ...gigForm, workersNeeded: Number(e.target.value) })}
                      className="input-marketplace text-xs w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">State *</label>
                    <select
                      value={gigForm.state}
                      onChange={(e) => setGigForm({ ...gigForm, state: e.target.value })}
                      className="input-marketplace text-xs w-full"
                    >
                      {NIGERIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">City / Area *</label>
                    <input
                      type="text"
                      required
                      value={gigForm.city}
                      onChange={(e) => setGigForm({ ...gigForm, city: e.target.value })}
                      className="input-marketplace text-xs w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Pay Amount (₦) *</label>
                    <input
                      type="number"
                      required
                      value={gigForm.compensationAmountNgn}
                      onChange={(e) => setGigForm({ ...gigForm, compensationAmountNgn: Number(e.target.value) })}
                      className="input-marketplace text-xs w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Payment Frequency</label>
                    <select
                      value={gigForm.paymentFrequency}
                      onChange={(e) => setGigForm({ ...gigForm, paymentFrequency: e.target.value as any })}
                      className="input-marketplace text-xs w-full"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Hourly">Hourly</option>
                      <option value="Upon Completion">Upon Completion</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      value={gigForm.posterPhone}
                      onChange={(e) => setGigForm({ ...gigForm, posterPhone: e.target.value })}
                      className="input-marketplace text-xs w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Expected Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 1 Day, 4 Hours, 1 Week"
                      value={gigForm.expectedDuration}
                      onChange={(e) => setGigForm({ ...gigForm, expectedDuration: e.target.value })}
                      className="input-marketplace text-xs w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Description & Requirements *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe exact tasks, tools needed, meeting point..."
                    value={gigForm.description}
                    onChange={(e) => setGigForm({ ...gigForm, description: e.target.value })}
                    className="input-marketplace text-xs w-full"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPostGigModal(false)}
                    className="btn-outline text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingGig}
                    className="btn-gold text-xs px-5 py-2 font-bold disabled:opacity-50"
                  >
                    {isSubmittingGig ? 'Posting...' : 'Post Gig Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: RESPOND TO GIG */}
      {selectedGigForResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 overflow-y-auto">
          <div className="card-marketplace max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-[#333333]">
            <div className="flex items-start justify-between border-b border-[#222222] pb-3">
              <div>
                <h2 className="text-base font-bold text-white">Express Interest in Gig</h2>
                <p className="text-xs text-gray-400">{selectedGigForResponse.title}</p>
              </div>
              <button
                onClick={() => setSelectedGigForResponse(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {gigRespSuccess ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded text-center text-sm font-semibold">
                {gigRespSuccess}
              </div>
            ) : (
              <form onSubmit={handleGigResponseSubmit} className="space-y-3">
                {gigRespError && (
                  <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded text-xs">
                    {gigRespError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={gigResponseForm.workerName}
                    onChange={(e) => setGigResponseForm({ ...gigResponseForm, workerName: e.target.value })}
                    className="input-marketplace text-xs w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 08012345678"
                    value={gigResponseForm.workerPhone}
                    onChange={(e) => setGigResponseForm({ ...gigResponseForm, workerPhone: e.target.value })}
                    className="input-marketplace text-xs w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Proposed Rate (₦, optional if matching poster rate)</label>
                  <input
                    type="number"
                    placeholder={`Offered: ₦${Number(selectedGigForResponse.compensationAmountNgn).toLocaleString()}`}
                    value={gigResponseForm.proposedRateNgn}
                    onChange={(e) => setGigResponseForm({ ...gigResponseForm, proposedRateNgn: e.target.value })}
                    className="input-marketplace text-xs w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Relevant Skills or Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 years dispatch experience, have valid riders permit"
                    value={gigResponseForm.skills}
                    onChange={(e) => setGigResponseForm({ ...gigResponseForm, skills: e.target.value })}
                    className="input-marketplace text-xs w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Short Message to Poster</label>
                  <textarea
                    rows={2}
                    placeholder="When can you start? Any tools you will bring?"
                    value={gigResponseForm.message}
                    onChange={(e) => setGigResponseForm({ ...gigResponseForm, message: e.target.value })}
                    className="input-marketplace text-xs w-full"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedGigForResponse(null)}
                    className="btn-outline text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingResponse}
                    className="btn-gold text-xs px-5 py-2 font-bold disabled:opacity-50"
                  >
                    {isSubmittingResponse ? 'Submitting...' : 'Send Interest'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: VIEW / REVIEW APPLICATION */}
      {selectedAppForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 overflow-y-auto">
          <div className="card-marketplace max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-[#333333]">
            <div className="flex items-start justify-between border-b border-[#222222] pb-3">
              <div>
                <h2 className="text-base font-bold text-white">Application: {selectedAppForReview.jobTitle}</h2>
                <p className="text-xs text-gray-400">Applicant: {selectedAppForReview.applicantName}</p>
              </div>
              <button
                onClick={() => setSelectedAppForReview(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#141414] p-3 rounded border border-[#222222] space-y-1">
                <div><span className="text-gray-500">Email:</span> <span className="text-gray-200">{selectedAppForReview.applicantEmail}</span></div>
                <div><span className="text-gray-500">Phone:</span> <span className="text-gray-200">{selectedAppForReview.applicantPhone}</span></div>
                {selectedAppForReview.applicantLocation && (
                  <div><span className="text-gray-500">Location:</span> <span className="text-gray-200">{selectedAppForReview.applicantLocation}</span></div>
                )}
                {selectedAppForReview.cvFileName && (
                  <div><span className="text-gray-500">Resume/CV:</span> <span className="text-[#D4AF37] font-semibold">{selectedAppForReview.cvFileName}</span></div>
                )}
                {selectedAppForReview.portfolioUrl && (
                  <div><span className="text-gray-500">Portfolio:</span> <a href={selectedAppForReview.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{selectedAppForReview.portfolioUrl}</a></div>
                )}
              </div>

              {selectedAppForReview.coverLetter && (
                <div>
                  <h4 className="font-bold text-gray-300 mb-1">Cover Note:</h4>
                  <p className="text-gray-400 bg-[#141414] p-3 rounded border border-[#222222] whitespace-pre-line">
                    {selectedAppForReview.coverLetter}
                  </p>
                </div>
              )}

              {/* Status Update Form (if user is employer or reviewer) */}
              <div className="pt-3 border-t border-[#222222] space-y-3">
                <h4 className="font-bold text-white">Update Candidate Status:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {(['Under Review', 'Shortlisted', 'Interview Scheduled', 'Hired', 'Rejected'] as ApplicationStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setReviewStatus(st)}
                      className={`text-xs p-2 rounded text-center font-semibold border transition-all ${
                        reviewStatus === st
                          ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]'
                          : 'border-[#262626] bg-[#161616] text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {reviewStatus === 'Interview Scheduled' && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Interview Date & Time</label>
                      <input
                        type="datetime-local"
                        value={reviewInterviewDate}
                        onChange={(e) => setReviewInterviewDate(e.target.value)}
                        className="input-marketplace text-xs w-full"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Internal Notes or Feedback</label>
                  <input
                    type="text"
                    placeholder="Notes on candidate..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="input-marketplace text-xs w-full"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAppForReview(null)}
                    className="btn-outline text-xs px-3 py-1.5"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={handleStatusUpdate}
                    className="btn-gold text-xs px-4 py-1.5 font-bold disabled:opacity-50"
                  >
                    {isUpdatingStatus ? 'Updating...' : 'Save Status'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

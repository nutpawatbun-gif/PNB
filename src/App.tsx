/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DynamicHomepage from './components/DynamicHomepage';
import HeroSlider from './components/HeroSlider';

import DirectorMessage from './components/DirectorMessage';
import NewsSection from './components/NewsSection';
import CourseGrid from './components/CourseGrid';
import AdmissionSection from './components/AdmissionSection';
import EventsSection from './components/EventsSection';
import StatsCounter from './components/StatsCounter';
import ServicesSection from './components/ServicesSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

// Pages
import AboutPage from './components/Pages/AboutPage';
import CoursesPage from './components/Pages/CoursesPage';
import NewsPage from './components/Pages/NewsPage';
import AdmissionPage from './components/Pages/AdmissionPage';
import DownloadsPage from './components/Pages/DownloadsPage';
import ContactPage from './components/Pages/ContactPage';
import ServicesPage from './components/Pages/ServicesPage';
import AdminPage from './components/Pages/AdminPage';
import AcademicPage from './components/Pages/AcademicPage';
import AnnouncementsPage from './components/Pages/AnnouncementsPage';
import CalendarPage from './components/Pages/CalendarPage';
import PersonnelPage from './components/Pages/PersonnelPage';
import EServicesPage from './components/Pages/EServicesPage';

import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [lang, setLang] = useState<'th' | 'en'>('th');
  
  // Compute initial page directly from window.location.pathname to prevent mount URL reset
  const [currentPage, setCurrentPage] = useState<string>(() => {
    if (typeof window === 'undefined') return 'home';
    const path = window.location.pathname;
    if (path.startsWith('/about')) return 'about';
    if (path.startsWith('/courses')) return 'courses';
    if (path.startsWith('/admission')) return 'admission';
    if (path.startsWith('/downloads')) return 'downloads';
    if (path.startsWith('/contact')) return 'contact';
    if (path.startsWith('/services')) return 'services';
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/news')) return 'news';
    if (path.startsWith('/announcements')) return 'announcements';
    if (path.startsWith('/calendar') || path.startsWith('/events')) return 'calendar';
    if (path.startsWith('/personnel')) return 'personnel';
    if (path.startsWith('/academic')) return 'academic';
    return 'home';
  });

  const [admissionSubPage, setAdmissionSubPage] = useState<string>('landing');
  const [academicCategory, setAcademicCategory] = useState<string>('all');
  const [newsCategory, setNewsCategory] = useState<string>('all');
  const [coursesLevel, setCoursesLevel] = useState<string>('all');
  const [downloadsCategory, setDownloadsCategory] = useState<string>('all');
  const [eservicesCategory, setEservicesCategory] = useState<string>('all');
  const [personnelSlug, setPersonnelSlug] = useState<string>('');

  // Parse current URL and set initial state
  const parseUrl = () => {
    const path = window.location.pathname;
    
    if (path.startsWith('/about')) {
      setCurrentPage('about');
    } else if (path.startsWith('/courses')) {
      setCurrentPage('courses');
      const params = new URLSearchParams(window.location.search);
      const lvl = params.get('level');
      setCoursesLevel(lvl && lvl !== 'landing' ? lvl : 'all');
    } else if (path.startsWith('/admission')) {
      setCurrentPage('admission');
      const sub = path.replace('/admission', '').replace('/', '');
      if (sub) {
        const cleanedSub = sub.split('?')[0].split('/')[0];
        setAdmissionSubPage(cleanedSub || 'landing');
      } else {
        setAdmissionSubPage('landing');
      }
    } else if (path.startsWith('/downloads')) {
      setCurrentPage('downloads');
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('cat');
      setDownloadsCategory(cat && cat !== 'landing' ? cat : 'all');
    } else if (path.startsWith('/contact')) {
      setCurrentPage('contact');
    } else if (path.startsWith('/services') || path.startsWith('/eservices')) {
      setCurrentPage('eservices');
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('cat');
      setEservicesCategory(cat && cat !== 'landing' ? cat : 'all');
    } else if (path.startsWith('/admin')) {
      setCurrentPage('admin');
    } else if (path.startsWith('/news')) {
      setCurrentPage('news');
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('cat');
      setNewsCategory(cat && cat !== 'landing' ? cat : 'all');
    } else if (path.startsWith('/announcements')) {
      setCurrentPage('announcements');
    } else if (path.startsWith('/calendar') || path.startsWith('/events')) {
      setCurrentPage('calendar');
    } else if (path.startsWith('/personnel')) {
      setCurrentPage('personnel');
      const slug = path.replace('/personnel', '').replace('/', '').split('?')[0];
      setPersonnelSlug(slug && slug !== 'all' && slug !== 'landing' && slug !== 'personnel' ? slug : '');
    } else if (path.startsWith('/academic')) {
      setCurrentPage('academic');
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('cat');
      setAcademicCategory(cat && cat !== 'landing' ? cat : 'all');
    } else {
      setCurrentPage('home');
    }
  };

  // Listen to popstate for browser back/forward buttons
  useEffect(() => {
    parseUrl();
    const handlePopState = () => {
      parseUrl();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Enhanced navigateTo supporting deep filter subPages
  const navigateTo = (page: string, subPage: string = 'landing', search: string = '') => {
    let targetPage = page;
    if (!targetPage || targetPage === '/' || targetPage === 'index' || targetPage === 'landing') {
      targetPage = 'home';
    }
    setCurrentPage(targetPage);

    const categoryValue = (!subPage || subPage === 'landing' || subPage === 'all' || subPage === page) ? 'all' : subPage;

    if (page === 'admission') {
      setAdmissionSubPage(subPage);
    }
    if (page === 'academic') {
      setAcademicCategory(categoryValue);
    }
    if (page === 'news') {
      setNewsCategory(categoryValue);
    }
    if (page === 'courses') {
      setCoursesLevel(categoryValue);
    }
    if (page === 'downloads') {
      setDownloadsCategory(categoryValue);
    }
    if (page === 'eservices' || page === 'services') {
      setEservicesCategory(categoryValue);
    }
    if (page === 'personnel') {
      setPersonnelSlug(subPage && subPage !== 'landing' && subPage !== 'personnel' && subPage !== 'all' ? subPage : '');
    }

    // Determine target URL path
    let path = '/';
    if (page === 'about') path = '/about';
    else if (page === 'courses') path = '/courses';
    else if (page === 'admission') {
      path = '/admission';
      if (subPage && subPage !== 'landing') {
        path = `/admission/${subPage}`;
      }
    }
    else if (page === 'downloads') path = '/downloads';
    else if (page === 'contact') path = '/contact';
    else if (page === 'services' || page === 'eservices') path = '/eservices';
    else if (page === 'admin') path = '/admin';
    else if (page === 'news') path = '/news';
    else if (page === 'announcements') path = '/announcements';
    else if (page === 'calendar' || page === 'events') path = '/calendar';
    else if (page === 'personnel') {
      path = '/personnel';
      if (subPage && subPage !== 'landing' && subPage !== 'personnel' && subPage !== 'all') {
        path = `/personnel/${subPage}`;
      }
    }
    else if (page === 'academic') {
      path = '/academic';
      if (subPage && subPage !== 'all' && subPage !== 'landing') {
        search = `?cat=${subPage}`;
      }
    }

    // Construct full URL including search params
    const fullUrl = path + search;
    
    if (window.location.pathname !== path || (search && window.location.search !== search)) {
      window.history.pushState(null, '', fullUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (currentPage) {
      case '':
      case '/':
      case 'home':
      case 'landing':
      case 'index':
        return <DynamicHomepage lang={lang} navigateTo={navigateTo} />;
      case 'about':
        return <AboutPage lang={lang} />;
      case 'courses':
        return (
          <CoursesPage 
            lang={lang} 
            selectedLevel={coursesLevel}
            onApplyCourse={(courseId) => navigateTo('admission', 'apply', `?program=${courseId}`)} 
          />
        );
      case 'news':
        return <NewsPage lang={lang} activeCategory={newsCategory} />;
      case 'announcements':
        return <AnnouncementsPage lang={lang} />;
      case 'calendar':
      case 'events':
        return <CalendarPage lang={lang} />;
      case 'admission':
        return (
          <AdmissionPage 
            lang={lang} 
            activeTab={admissionSubPage} 
            setActiveTab={setAdmissionSubPage} 
            navigateTo={navigateTo}
          />
        );
      case 'downloads':
        return <DownloadsPage lang={lang} activeCategory={downloadsCategory} />;
      case 'contact':
        return <ContactPage lang={lang} />;
      case 'services':
      case 'eservices':
        return <EServicesPage lang={lang} activeCategory={eservicesCategory} navigateTo={navigateTo} />;
      case 'personnel':
        return <PersonnelPage initialSlug={personnelSlug} navigateTo={navigateTo} />;
      case 'academic':
        return (
          <AcademicPage 
            lang={lang} 
            selectedCategory={academicCategory} 
            setSelectedCategory={setAcademicCategory} 
          />
        );
      case 'admin':
        return (
          <ErrorBoundary fallbackTitle="เกิดข้อผิดพลาดในระบบผู้ดูแลระบบ (CMS Admin)">
            <AdminPage lang={lang} onBackToHome={() => navigateTo('home')} />
          </ErrorBoundary>
        );
      default:
        return <div className="py-20 text-center text-muted-text-mcu font-light">Page not found.</div>;
    }
  };

  if (currentPage === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans selection:bg-mcu-pink/30 selection:text-mcu-pink-deep">
        <ErrorBoundary fallbackTitle="เกิดข้อผิดพลาดในระบบผู้ดูแลระบบ (CMS Admin)">
          <AdminPage lang={lang} onBackToHome={() => navigateTo('home')} />
        </ErrorBoundary>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between font-sans selection:bg-mcu-pink/30 selection:text-mcu-pink-deep">
      {/* Dynamic Navigation Bar */}
      <Navbar 
        lang={lang} 
        setLang={setLang} 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        onOpenLoginModal={() => navigateTo('services')}
        navigateTo={navigateTo}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        <ErrorBoundary>
          {renderContent()}
        </ErrorBoundary>
      </main>

      {/* Full-Fidelity Footer */}
      <Footer 
        lang={lang} 
        setCurrentPage={(page) => navigateTo(page)} 
      />
    </div>
  );
}


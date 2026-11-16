/**
 * TemuTalenta - Initial Curated Talent Dataset (Offline-first)
 * Sesuai skema data pada docs/core.md
 */

const INITIAL_TALENTS = [
  {
    id: "TLT-001",
    fullName: "Dian Pratama",
    title: "Senior Backend Engineer",
    category: "TECH-ENG",
    categoryName: "Software Engineering",
    bio: "Spesialis arsitektur microservices terdistribusi dan high-concurrency payment gateway. 6+ tahun pengalaman menangani backend transaksi keuangan.",
    location: "Bandung",
    workPreference: "remote",
    experienceYears: 6.5,
    expectedRate: {
      amount: 22000000,
      period: "monthly",
      currency: "IDR"
    },
    availability: "Available Now",
    skills: ["Go", "PostgreSQL", "Kafka", "Docker", "Kubernetes", "Redis", "gRPC"],
    portfolios: [
      {
        title: "Microservices Payment Engine",
        clientOrOrg: "FinTech Nasional",
        year: "2024",
        description: "Merancang core gateway pemrosesan 8.000 transaksi per detik dengan latency < 45ms.",
        technologies: ["Go", "Kafka", "PostgreSQL", "Redis"],
        url: "#"
      },
      {
        title: "Settlement Batch Automation",
        clientOrOrg: "Ekosistem E-Commerce",
        year: "2023",
        description: "Optimasi waktu rekonsiliasi harian dari 4 jam menjadi 18 menit dengan query tuning.",
        technologies: ["Go", "PostgreSQL", "Docker"],
        url: "#"
      }
    ],
    contact: {
      email: "dian.pratama@example.com",
      github: "https://github.com/dianpratama",
      linkedin: "https://linkedin.com/in/dianpratama"
    },
    rating: 4.9,
    completedProjects: 14
  },
  {
    id: "TLT-002",
    fullName: "Siti Rahmawati",
    title: "Lead UI/UX & Product Designer",
    category: "PROD-DES",
    categoryName: "Product & Design",
    bio: "Product designer dengan fokus pada user-centric enterprise SaaS dan mobile banking. Berpengalaman membangun Design System skala korporat.",
    location: "Jakarta",
    workPreference: "hybrid",
    experienceYears: 7,
    expectedRate: {
      amount: 20000000,
      period: "monthly",
      currency: "IDR"
    },
    availability: "Available Now",
    skills: ["Figma", "Design System", "UX Research", "Prototyping", "Design Token", "Wireframing"],
    portfolios: [
      {
        title: "Enterprise B2B Banking Portal Redesign",
        clientOrOrg: "Bank Domestik",
        year: "2024",
        description: "Menurunkan customer support ticket hingga 38% melalui alur otorisasi transaksi yang lebih intuitif.",
        technologies: ["Figma", "Design System", "Miro"],
        url: "#"
      },
      {
        title: "Mobile POS Merchant Experience",
        clientOrOrg: "Retail Tech",
        year: "2023",
        description: "Desain sistem kasir tablet untuk 15.000+ merchant UMKM dengan usability score 89/100.",
        technologies: ["Figma", "Prototyping"],
        url: "#"
      }
    ],
    contact: {
      email: "siti.rahma@example.com",
      github: "https://github.com/sitirahma",
      linkedin: "https://linkedin.com/in/sitirahmawati"
    },
    rating: 5.0,
    completedProjects: 22
  },
  {
    id: "TLT-003",
    fullName: "Budi Santoso",
    title: "Senior Data & ML Engineer",
    category: "DATA-AI",
    categoryName: "Data & AI",
    bio: "Praktisi data pipeline skala besar dan machine learning productionizer. Ahli dalam streaming ETL, feature store, dan fraud detection model.",
    location: "Yogyakarta",
    workPreference: "remote",
    experienceYears: 5.5,
    expectedRate: {
      amount: 21000000,
      period: "monthly",
      currency: "IDR"
    },
    availability: "Open to Offers",
    skills: ["Python", "PyTorch", "Apache Spark", "Airflow", "BigQuery", "SQL", "Docker"],
    portfolios: [
      {
        title: "Real-time Credit Card Fraud Detection",
        clientOrOrg: "Institusi Finansial",
        year: "2024",
        description: "Pipeline deteksi anomali real-time dengan model XGBoost dan Kafka streaming.",
        technologies: ["Python", "Kafka", "Airflow", "Docker"],
        url: "#"
      },
      {
        title: "Automated Data Lake ETL Pipelines",
        clientOrOrg: "HealthTech Platform",
        year: "2023",
        description: "Konsolidasi 12 database operasional ke dalam BigQuery Data Warehouse dengan otomatisasi Airflow.",
        technologies: ["Python", "BigQuery", "Apache Spark"],
        url: "#"
      }
    ],
    contact: {
      email: "budi.santoso@example.com",
      github: "https://github.com/budisantoso-data",
      linkedin: "https://linkedin.com/in/budisantoso"
    },
    rating: 4.8,
    completedProjects: 11
  },
  {
    id: "TLT-004",
    fullName: "Reza Kurniawan",
    title: "Senior Fullstack JavaScript Engineer",
    category: "TECH-ENG",
    categoryName: "Software Engineering",
    bio: "Pengembang fullstack modern dengan keahlian mendalam pada ekosistem Next.js, Node.js (NestJS), dan PostgreSQL. Fokus pada performa web dan DX.",
    location: "Surabaya",
    workPreference: "remote",
    experienceYears: 5,
    expectedRate: {
      amount: 17500000,
      period: "monthly",
      currency: "IDR"
    },
    availability: "Available Now",
    skills: ["React", "Next.js", "TypeScript", "Node.js", "NestJS", "PostgreSQL", "Tailwind CSS"],
    portfolios: [
      {
        title: "SaaS HR & Talent Onboarding",
        clientOrOrg: "HR Enterprise",
        year: "2024",
        description: "Membangun sistem portal multi-tenant dengan performa Google Lighthouse 98/100.",
        technologies: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
        url: "#"
      }
    ],
    contact: {
      email: "reza.kurniawan@example.com",
      github: "https://github.com/rezakurnia",
      linkedin: "https://linkedin.com/in/rezakurniawan"
    },
    rating: 4.9,
    completedProjects: 19
  },
  {
    id: "TLT-005",
    fullName: "Alya Putri",
    title: "Mobile Application Developer",
    category: "TECH-ENG",
    categoryName: "Software Engineering",
    bio: "Spesialis Flutter cross-platform untuk aplikasi Android & iOS dengan arsitektur BLoC/Clean Architecture dan offline-first synchronization.",
    location: "Jakarta",
    workPreference: "hybrid",
    experienceYears: 4,
    expectedRate: {
      amount: 15000000,
      period: "monthly",
      currency: "IDR"
    },
    availability: "Available Now",
    skills: ["Flutter", "Dart", "Firebase", "REST API", "SQLite", "Bloc", "CI/CD Mobile"],
    portfolios: [
      {
        title: "Field Officer Logistics & Tracking App",
        clientOrOrg: "Logistics Corp",
        year: "2024",
        description: "Aplikasi mobile offline-first dengan auto background GPS sync dan tanda tangan digital kurir.",
        technologies: ["Flutter", "Dart", "SQLite", "REST API"],
        url: "#"
      }
    ],
    contact: {
      email: "alya.putri@example.com",
      github: "https://github.com/alyaputri-dev",
      linkedin: "https://linkedin.com/in/alyaputri"
    },
    rating: 4.8,
    completedProjects: 9
  },
  {
    id: "TLT-006",
    fullName: "Farhan Ramadhan",
    title: "Cybersecurity & DevSecOps Engineer",
    category: "CYBER-SEC",
    categoryName: "Cybersecurity & Infra",
    bio: "Spesialis proteksi infrastruktur cloud, audit kepatuhan keamanan web/API (OWASP Top 10), dan hardening CI/CD pipeline.",
    location: "Jakarta",
    workPreference: "hybrid",
    experienceYears: 6,
    expectedRate: {
      amount: 23000000,
      period: "monthly",
      currency: "IDR"
    },
    availability: "Open to Offers",
    skills: ["Penetration Testing", "AWS Security", "Terraform", "Docker", "Linux Hardening", "Kubernetes", "OWASP"],
    portfolios: [
      {
        title: "Cloud Infrastructure Security Audit",
        clientOrOrg: "Perusahaan Publik",
        year: "2024",
        description: "Melakukan vulnerability assessment menyeluruh dan remediasi 14 celah keamanan kritis.",
        technologies: ["Terraform", "AWS Security", "Linux Hardening"],
        url: "#"
      }
    ],
    contact: {
      email: "farhan.ramadhan@example.com",
      github: "https://github.com/farhansec",
      linkedin: "https://linkedin.com/in/farhanramadhan"
    },
    rating: 5.0,
    completedProjects: 13
  },
  {
    id: "TLT-007",
    fullName: "Nadia Kusuma",
    title: "Senior Technical Product Manager",
    category: "PROD-DES",
    categoryName: "Product & Design",
    bio: "Pengalaman 6+ tahun memimpin tim lintas fungsi (engineering, UI/UX, QA) dalam peluncuran produk digital consumer finance dan B2B SaaS.",
    location: "Tangerang",
    workPreference: "remote",
    experienceYears: 6,
    expectedRate: {
      amount: 21000000,
      period: "monthly",
      currency: "IDR"
    },
    availability: "Available Now",
    skills: ["Product Strategy", "Agile/Scrum", "User Story Mapping", "Jira", "Data Analysis", "Roadmapping"],
    portfolios: [
      {
        title: "Digital Loan Origination System",
        clientOrOrg: "FinTech Lending",
        year: "2023",
        description: "Memangkas waktu approval kredit dari 2 hari menjadi 15 menit melalui otomatisasi verifikasi data.",
        technologies: ["Product Strategy", "Agile/Scrum", "Data Analysis"],
        url: "#"
      }
    ],
    contact: {
      email: "nadia.kusuma@example.com",
      github: "https://github.com/nadiakusuma",
      linkedin: "https://linkedin.com/in/nadiakusuma"
    },
    rating: 4.9,
    completedProjects: 17
  },
  {
    id: "TLT-008",
    fullName: "Arif Hidayat",
    title: "Enterprise Java & Integration Engineer",
    category: "TECH-ENG",
    categoryName: "Software Engineering",
    bio: "Spesialis core banking backend, integrasi sistem legacy via ISO 8583 / REST API, dan database relasional enterprise berkapasitas tinggi.",
    location: "Jakarta",
    workPreference: "hybrid",
    experienceYears: 8,
    expectedRate: {
      amount: 25000000,
      period: "monthly",
      currency: "IDR"
    },
    availability: "Available Now",
    skills: ["Java", "Spring Boot", "Oracle DB", "Microservices", "Kafka", "Docker", "REST API"],
    portfolios: [
      {
        title: "ATM & EDC Switching Gateway Integration",
        clientOrOrg: "Bank Nasional",
        year: "2024",
        description: "Modernisasi gateway switching antar bank dengan standar ketahanan tinggi (99.99% SLA).",
        technologies: ["Java", "Spring Boot", "Oracle DB", "Microservices"],
        url: "#"
      }
    ],
    contact: {
      email: "arif.hidayat@example.com",
      github: "https://github.com/arifhidayat-code",
      linkedin: "https://linkedin.com/in/arifhidayat"
    },
    rating: 5.0,
    completedProjects: 25
  }
];

const STORAGE_KEYS = {
  TALENTS: "temutalenta_talents_v1",
  BOOKMARKS: "temutalenta_bookmarks_v1",
  THEME: "temutalenta_theme_v1"
};

/**
 * Mengambil data talenta dari localStorage atau inisialisasi default
 */
function getStoredTalents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TALENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TALENTS, JSON.stringify(INITIAL_TALENTS));
      return INITIAL_TALENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Gagal membaca dari localStorage, menggunakan in-memory default:", err);
    return INITIAL_TALENTS;
  }
}

/**
 * Menyimpan data talenta ke localStorage
 */
function saveTalents(talents) {
  try {
    localStorage.setItem(STORAGE_KEYS.TALENTS, JSON.stringify(talents));
  } catch (err) {
    console.error("Gagal menyimpan ke localStorage:", err);
  }
}

/**
 * Mengambil daftar ID talenta yang di-bookmark
 */
function getStoredBookmarks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

/**
 * Toggle bookmark talenta
 */
function toggleBookmarkStorage(talentId) {
  const current = getStoredBookmarks();
  let updated;
  if (current.includes(talentId)) {
    updated = current.filter(id => id !== talentId);
  } else {
    updated = [...current, talentId];
  }
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
  } catch (e) {}
  return updated;
}

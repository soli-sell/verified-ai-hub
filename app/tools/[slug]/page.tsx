import Link from "next/link";
import { notFound } from "next/navigation";

interface Tool {
  slug: string;
  name: string;
  category: string;
  description: string;
  compliance: string[];
  website_url: string;
  useCases: string[];
  verificationStatus: string;
}

const TOOLS_DATA: Record<string, Tool> = {
  "biogpt-clinical": {
    slug: "biogpt-clinical",
    name: "BioGPT Clinical",
    category: "Healthcare",
    description: "Domain-specific generative transformer model trained on biomedical literature for clinical decision support and research summary generation.",
    compliance: ["HIPAA", "SOC2", "GDPR", "IEEE"],
    website_url: "https://github.com/microsoft/BioGPT",
    useCases: ["Clinical Decision Support", "Biomedical Literature Analysis", "Medical Record Summarization"],
    verificationStatus: "Verified & Audit Compliant"
  },
  "claude-35-sonnet": {
    slug: "claude-35-sonnet",
    name: "Claude 3.5 Sonnet",
    category: "Life Sciences",
    description: "Advanced reasoning AI engine optimized for protocol analysis, regulatory documentation, and biochemical data modeling.",
    compliance: ["SOC2", "GDPR", "ISO 27001", "EU AI Act"],
    website_url: "https://anthropic.com",
    useCases: ["Protocol Analysis", "Regulatory Submission Drafting", "Biochemical Data Processing"],
    verificationStatus: "Verified & Audit Compliant"
  },
  "viz-ai-vascular": {
    slug: "viz-ai-vascular",
    name: "Viz.ai Vascular",
    category: "Diagnostics",
    description: "AI-powered stroke and vascular disease triage platform analyzing CT neuroimaging to accelerate clinical care intervention.",
    compliance: ["FDA Cleared", "HIPAA", "SOC2", "CLIA"],
    website_url: "https://viz.ai",
    useCases: ["CT Neuroimaging Triage", "Vascular Disease Detection", "Emergency Care Workflow Acceleration"],
    verificationStatus: "Verified & Audit Compliant"
  },
  "alphafold-3": {
    slug: "alphafold-3",
    name: "AlphaFold 3",
    category: "Biotech",
    description: "Deep learning system predicting structure and interactions of proteins, DNA, RNA, and small molecules with high atomic accuracy.",
    compliance: ["IEEE", "ISO 27001", "EU AI Act", "GDPR"],
    website_url: "https://deepmind.google/technologies/alphafold/",
    useCases: ["Protein Interaction Prediction", "Molecular Target Discovery", "RNA/DNA Structural Modeling"],
    verificationStatus: "Verified & Audit Compliant"
  },
  "atomwise-atomnet": {
    slug: "atomwise-atomnet",
    name: "Atomwise AtomNet",
    category: "Pharma",
    description: "Structure-based neural network framework predicting small molecule binding affinity for rapid drug discovery screening.",
    compliance: ["SOC2", "ISO 27001", "FDA Cleared", "HIPAA"],
    website_url: "https://atomwise.com",
    useCases: ["Small Molecule Binding Affinity Prediction", "High-Throughput Virtual Screening", "Hit-to-Lead Optimization"],
    verificationStatus: "Verified & Audit Compliant"
  },
  "fina-ai-health": {
    slug: "fina-ai-health",
    name: "Fina Financial Health AI",
    category: "Financial Health",
    description: "Compliant predictive analytics engine tracking clinical trial budgets, operational expenditure, and healthcare revenue cycles.",
    compliance: ["SOC2", "ISO 27001", "GDPR"],
    website_url: "https://fina.ai",
    useCases: ["Clinical Trial Budget Forecasting", "Healthcare Revenue Cycle Analytics", "Operational Spend Optimization"],
    verificationStatus: "Verified & Audit Compliant"
  },
  "medlm-google-cloud": {
    slug: "medlm-google-cloud",
    name: "MedLM (Google Cloud)",
    category: "Healthcare",
    description: "Family of medically tuned foundational models designed for complex clinical workflows, documentation summarization, and task automation.",
    compliance: ["HIPAA", "SOC2", "ISO 27001", "GDPR"],
    website_url: "https://cloud.google.com/solutions/healthcare-life-sciences",
    useCases: ["Medical Data Summarization", "Clinical Notes Generation", "Research Data Processing"],
    verificationStatus: "Verified & Audit Compliant"
  },
  "pathai-aisight": {
    slug: "pathai-aisight",
    name: "PathAI (AISight)",
    category: "Diagnostics",
    description: "Digital pathology image analysis platform utilizing deep learning to enhance diagnostic accuracy and biomarker quantification.",
    compliance: ["CLIA", "CAP Certified", "HIPAA", "SOC2"],
    website_url: "https://pathai.com",
    useCases: ["Digital Pathology Triage", "Biomarker Quantification", "Oncology Diagnostic Support"],
    verificationStatus: "Verified & Audit Compliant"
  },
  "nuance-dax-express": {
    slug: "nuance-dax-express",
    name: "Nuance DAX Express",
    category: "Healthcare",
    description: "Ambient clinical intelligence solution automatically generating draft clinical notes at the point of care within seconds.",
    compliance: ["HIPAA", "HITRUST", "SOC2", "GDPR"],
    website_url: "https://nuance.com",
    useCases: ["Automated Clinical Documentation", "EHR Note Generation", "Physician Administrative Relief"],
    verificationStatus: "Verified & Audit Compliant"
  },
  "aidoc": {
    slug: "aidoc",
    name: "Aidoc",
    category: "Diagnostics",
    description: "Enterprise clinical AI platform providing rapid radiologic triage and alerting for acute cardiovascular, vascular, and neurological conditions.",
    compliance: ["FDA Cleared", "CE Mark", "HIPAA", "ISO 27001"],
    website_url: "https://aidoc.com",
    useCases: ["Radiology Scan Triage", "Acute Pulmonary Embolism Detection", "Intracranial Hemorrhage Alerting"],
    verificationStatus: "Verified & Audit Compliant"
  },
  "tempus-one": {
    slug: "tempus-one",
    name: "Tempus One",
    category: "Life Sciences",
    description: "Voice- and chat-driven clinical AI assistant granting oncologists real-time access to patient genomic profiling and clinical trial matching.",
    compliance: ["HIPAA", "CLIA", "CAP Certified", "SOC2"],
    website_url: "https://tempus.com",
    useCases: ["Oncology Genomic Insights", "Clinical Trial Matching", "Precision Medicine Workflow"],
    verificationStatus: "Verified & Audit Compliant"
  },
  "lunit-insight": {
    slug: "lunit-insight",
    name: "Lunit INSIGHT",
    category: "Diagnostics",
    description: "Advanced AI software for chest radiography and mammography screening, detecting early-stage pulmonary nodules and breast abnormalities.",
    compliance: ["FDA Cleared", "CE Mark", "ISO 13485", "HIPAA"],
    website_url: "https://lunit.io",
    useCases: ["Mammography Abnormality Detection", "Chest X-Ray Screening", "Early-Stage Cancer Triage"],
    verificationStatus: "Verified & Audit Compliant"
  },
  "deephealth-ai": {
    slug: "deephealth-ai",
    name: "DeepHealth AI",
    category: "Diagnostics",
    description: "Clinical AI workflow software leveraging deep learning to maximize detection sensitivity and diagnostic efficiency in medical imaging.",
    compliance: ["FDA Cleared", "HIPAA", "ISO 27001", "SOC2"],
    website_url: "https://deephealth.com",
    useCases: ["Breast Imaging Analytics", "Prostate MRI Screening", "Diagnostic Workflow Speed Optimization"],
    verificationStatus: "Verified & Audit Compliant"
  }
};

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = TOOLS_DATA[slug];

  if (!tool) {
    notFound();
  }

  return (
    <div style={{ backgroundColor: "#f0f9ff", minHeight: "100vh", color: "#0f172a", fontFamily: "sans-serif" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #bae6fd", padding: "16px 24px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ fontSize: "20px", fontWeight: "900", color: "#0284c7", textDecoration: "none" }}>
            ← Back to Directory
          </Link>
          <span style={{ backgroundColor: "#ecfdf5", color: "#047857", fontSize: "12px", fontWeight: "bold", padding: "4px 12px", borderRadius: "20px", border: "1px solid #a7f3d0" }}>
            ✓ {tool.verificationStatus}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #bae6fd", borderRadius: "16px", padding: "32px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", fontSize: "12px", fontWeight: "bold", padding: "4px 12px", borderRadius: "6px" }}>
                {tool.category}
              </span>
              <h1 style={{ fontSize: "32px", fontWeight: "800", margin: "12px 0 8px 0", color: "#0f172a" }}>{tool.name}</h1>
            </div>
            <a
              href={tool.website_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: "#0284c7", color: "#ffffff", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", fontSize: "14px", textDecoration: "none" }}
            >
              Visit Official Tool Site ↗
            </a>
          </div>

          <p style={{ fontSize: "16px", color: "#334155", lineHeight: "1.7", marginBottom: "32px" }}>
            {tool.description}
          </p>

          {/* Compliance */}
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "24px", marginBottom: "28px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
              Verified Compliance Frameworks & Standards
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {tool.compliance.map((std) => (
                <span key={std} style={{ backgroundColor: "#f0f9ff", color: "#0284c7", fontSize: "13px", fontWeight: "bold", padding: "6px 14px", borderRadius: "6px", border: "1px solid #bae6fd" }}>
                  ✓ {std}
                </span>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "24px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
              Primary Enterprise Use Cases
            </h3>
            <ul style={{ paddingLeft: "20px", margin: "0", color: "#334155", lineHeight: "1.8", fontSize: "15px" }}>
              {tool.useCases.map((useCase) => (
                <li key={useCase}>{useCase}</li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

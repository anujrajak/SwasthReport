export const testsData = {
  cbc: {
    name: "Complete Blood Count (CBC)",
    category: "Hematology",
    parameters: [
      {
        name: "Hemoglobin",
        unit: "g/dL",
        range: { male: "13.5 - 17.5", female: "12.0 - 15.5" },
      },
      {
        name: "RBC Count",
        unit: "million/µL",
        range: { male: "4.5 - 5.9", female: "4.0 - 5.1" },
      },
      { name: "WBC Count", unit: "cells/µL", range: "4000 - 11000" },
      { name: "Platelet Count", unit: "10^3/µL", range: "150 - 450" },
      {
        name: "Hematocrit (PCV)",
        unit: "%",
        range: { male: "41 - 53", female: "36 - 46" },
      },
      { name: "MCV", unit: "fL", range: "80 - 100" },
      {
        name: "MCH",
        unit: "pg",
        range: "27 - 33",
        formula: "Hemoglobin * 10 / RBC Count",
      },
      {
        name: "MCHC",
        unit: "g/dL",
        range: "31 - 36",
        formula: "Hemoglobin * 100 / Hematocrit (PCV)",
      },
      { name: "RDW-CV", unit: "%", range: "11.5 - 14.5" },
      { name: "Neutrophils", unit: "%", range: "40 - 60" },
      { name: "Lymphocytes", unit: "%", range: "20 - 40" },
      { name: "Monocytes", unit: "%", range: "2 - 8" },
      { name: "Eosinophils", unit: "%", range: "1 - 4" },
      { name: "Basophils", unit: "%", range: "0 - 1" },
    ],
  },

  lft: {
    name: "Liver Function Test (LFT)",
    category: "Biochemistry",
    parameters: [
      { name: "Bilirubin Total", unit: "mg/dL", range: "0.3 - 1.2" },
      { name: "Bilirubin Direct", unit: "mg/dL", range: "0.0 - 0.3" },
      {
        name: "Bilirubin Indirect",
        unit: "mg/dL",
        range: "0.2 - 0.8",
        formula: "Bilirubin Total - Bilirubin Direct",
      },
      { name: "SGPT (ALT)", unit: "U/L", range: "7 - 56" },
      { name: "SGOT (AST)", unit: "U/L", range: "5 - 40" },
      { name: "Alkaline Phosphatase (ALP)", unit: "U/L", range: "44 - 147" },
      { name: "Total Protein", unit: "g/dL", range: "6.0 - 8.3" },
      { name: "Albumin", unit: "g/dL", range: "3.4 - 5.4" },
      { name: "Globulin", unit: "g/dL", range: "2.0 - 3.5" },
      { name: "A/G Ratio", unit: "", range: "1.0 - 2.1" },
    ],
  },

  kft: {
    name: "Kidney Function Test (KFT/RFT)",
    category: "Biochemistry",
    parameters: [
      { name: "Urea (BUN)", unit: "mg/dL", range: "15 - 40" },
      {
        name: "Creatinine",
        unit: "mg/dL",
        range: { male: "0.74 - 1.35", female: "0.59 - 1.04" },
      },
      {
        name: "Uric Acid",
        unit: "mg/dL",
        range: { male: "3.5 - 7.2", female: "2.6 - 6.0" },
      },
      { name: "Sodium (Na+)", unit: "mmol/L", range: "135 - 145" },
      { name: "Potassium (K+)", unit: "mmol/L", range: "3.5 - 5.0" },
      { name: "Chloride (Cl-)", unit: "mmol/L", range: "98 - 106" },
      { name: "Calcium (Total)", unit: "mg/dL", range: "8.5 - 10.5" },
      { name: "Phosphorus", unit: "mg/dL", range: "2.5 - 4.5" },
    ],
  },

  lipid_profile: {
    name: "Lipid Profile",
    category: "Biochemistry",
    parameters: [
      { name: "Total Cholesterol", unit: "mg/dL", range: "< 200" },
      { name: "HDL Cholesterol", unit: "mg/dL", range: "> 40" },
      { name: "LDL Cholesterol", unit: "mg/dL", range: "< 100" },
      { name: "VLDL", unit: "mg/dL", range: "2 - 30" },
      { name: "Triglycerides", unit: "mg/dL", range: "< 150" },
      { name: "Cholesterol/HDL Ratio", unit: "", range: "< 5" },
    ],
  },

  thyroid_profile: {
    name: "Thyroid Profile",
    category: "Hormones",
    parameters: [
      { name: "TSH", unit: "µIU/mL", range: "0.4 - 4.0" },
      { name: "Free T4 (FT4)", unit: "ng/dL", range: "0.8 - 1.8" },
      { name: "Free T3 (FT3)", unit: "pg/mL", range: "2.0 - 4.4" },
      { name: "Total T3", unit: "ng/dL", range: "80 - 200" },
      { name: "Total T4", unit: "µg/dL", range: "5.0 - 12.0" },
    ],
  },

  blood_sugar: {
    name: "Blood Sugar Tests",
    category: "Endocrine / Biochemistry",
    parameters: [
      { name: "Fasting Glucose", unit: "mg/dL", range: "70 - 100" },
      { name: "Postprandial (2-hr) Glucose", unit: "mg/dL", range: "< 140" },
      { name: "Random Glucose", unit: "mg/dL", range: "70 - 140" },
      { name: "HbA1c", unit: "%", range: "< 5.7" },
    ],
  },

  crp: {
    name: "C-Reactive Protein (CRP)",
    category: "Inflammation",
    parameters: [{ name: "CRP (quantitative)", unit: "mg/dL", range: "< 0.3" }],
  },

  esr: {
    name: "Erythrocyte Sedimentation Rate (ESR)",
    category: "Hematology",
    parameters: [
      {
        name: "ESR (Westergren)",
        unit: "mm/hr",
        range: { male: "0 - 15", female: "0 - 20" },
      },
    ],
  },

  vitamin_d: {
    name: "Vitamin D (25-OH)",
    category: "Vitamins",
    parameters: [
      {
        name: "25-Hydroxy Vitamin D",
        unit: "ng/mL",
        range: {
          deficient: "< 20",
          insufficient: "20 - 30",
          sufficient: "30 - 50",
        },
      },
    ],
  },

  vitamin_b12: {
    name: "Vitamin B12",
    category: "Vitamins",
    parameters: [{ name: "Vitamin B12", unit: "pg/mL", range: "200 - 900" }],
  },

  iron_profile: {
    name: "Iron Profile",
    category: "Biochemistry",
    parameters: [
      { name: "Serum Iron", unit: "µg/dL", range: "60 - 170" },
      { name: "TIBC", unit: "µg/dL", range: "240 - 450" },
      { name: "Transferrin Saturation", unit: "%", range: "15 - 50" },
    ],
  },

  ferritin: {
    name: "Ferritin",
    category: "Biochemistry",
    parameters: [
      {
        name: "Serum Ferritin",
        unit: "ng/mL",
        range: { male: "24 - 336", female: "11 - 307" },
      },
    ],
  },

  pt_inr: {
    name: "Prothrombin Time / INR (PT/INR)",
    category: "Coagulation",
    parameters: [
      { name: "Prothrombin Time (PT)", unit: "seconds", range: "11 - 15" },
      { name: "INR", unit: "", range: "0.8 - 1.2" },
    ],
  },

  aptt: {
    name: "Activated Partial Thromboplastin Time (APTT)",
    category: "Coagulation",
    parameters: [{ name: "APTT", unit: "seconds", range: "25 - 40" }],
  },

  electrolytes: {
    name: "Electrolyte Panel",
    category: "Biochemistry",
    parameters: [
      { name: "Sodium (Na+)", unit: "mmol/L", range: "135 - 145" },
      { name: "Potassium (K+)", unit: "mmol/L", range: "3.5 - 5.0" },
      { name: "Chloride (Cl-)", unit: "mmol/L", range: "98 - 106" },
      { name: "Bicarbonate (HCO3-)", unit: "mmol/L", range: "22 - 28" },
    ],
  },

  urine_routine: {
    name: "Urine Routine (Urinalysis)",
    category: "Microbiology / Chemistry",
    parameters: [
      { name: "Color", unit: "", range: "Pale yellow" },
      { name: "Appearance", unit: "", range: "Clear" },
      { name: "pH", unit: "", range: "4.5 - 8.0" },
      { name: "Specific Gravity", unit: "", range: "1.005 - 1.030" },
      { name: "Protein", unit: "", range: "Negative" },
      { name: "Glucose", unit: "", range: "Negative" },
      { name: "Ketones", unit: "", range: "Negative" },
      { name: "Blood (RBC)", unit: "/HPF", range: "0 - 2" },
      { name: "WBC", unit: "/HPF", range: "0 - 5" },
      { name: "Nitrite", unit: "", range: "Negative" },
      { name: "Leukocyte Esterase", unit: "", range: "Negative" },
    ],
  },

  urine_micro: {
    name: "Urine Microscopy (Sediment)",
    category: "Microbiology",
    parameters: [
      { name: "RBC", unit: "/HPF", range: "0 - 2" },
      { name: "WBC", unit: "/HPF", range: "0 - 5" },
      { name: "Epithelial Cells", unit: "/HPF", range: "0 - 5" },
      { name: "Casts", unit: "", range: "None" },
      { name: "Crystals", unit: "", range: "None" },
    ],
  },

  stool_routine: {
    name: "Stool Routine",
    category: "Microbiology / Parasitology",
    parameters: [
      { name: "Color", unit: "", range: "Brown" },
      { name: "Consistency", unit: "", range: "Formed" },
      { name: "Occult Blood (FOBT)", unit: "", range: "Negative" },
      { name: "Pus Cells", unit: "/HPF", range: "0 - 5" },
      { name: "Macrophages", unit: "/HPF", range: "0 - 5" },
      { name: "Ova/Cysts", unit: "", range: "None" },
    ],
  },

  hcg: {
    name: "Pregnancy Test (hCG)",
    category: "Immunoassay",
    parameters: [
      { name: "hCG (qualitative)", unit: "", range: "Negative/Positive" },
      {
        name: "hCG (quantitative)",
        unit: "mIU/mL",
        range: { nonPregnant: "< 5", pregnancy: "> 25" },
      },
    ],
  },

  dengue_ns1: {
    name: "Dengue NS1 / IgM / IgG",
    category: "Infectious Disease",
    parameters: [
      { name: "NS1 Antigen", unit: "", range: "Negative/Positive" },
      { name: "Dengue IgM", unit: "", range: "Negative/Positive" },
      { name: "Dengue IgG", unit: "", range: "Negative/Positive" },
    ],
  },

  malaria: {
    name: "Malaria Parasite",
    category: "Parasitology",
    parameters: [
      { name: "Malaria Antigen / Smear", unit: "", range: "Negative/Positive" },
    ],
  },

  hiv: {
    name: "HIV (Screening)",
    category: "Serology",
    parameters: [
      { name: "HIV Antibody/Ag (Combo)", unit: "", range: "Negative/Positive" },
    ],
  },

  hbsag: {
    name: "Hepatitis B Surface Antigen (HBsAg)",
    category: "Serology",
    parameters: [{ name: "HBsAg", unit: "", range: "Negative/Positive" }],
  },

  hcv: {
    name: "Hepatitis C Antibody (HCV)",
    category: "Serology",
    parameters: [
      { name: "HCV Antibody", unit: "", range: "Negative/Positive" },
    ],
  },

  lipase: {
    name: "Lipase",
    category: "Biochemistry",
    parameters: [{ name: "Serum Lipase", unit: "U/L", range: "10 - 140" }],
  },

  amylase: {
    name: "Amylase",
    category: "Biochemistry",
    parameters: [{ name: "Serum Amylase", unit: "U/L", range: "30 - 110" }],
  },

  troponin_i: {
    name: "Cardiac Markers - Troponin I",
    category: "Cardiac",
    parameters: [{ name: "Troponin I", unit: "ng/mL", range: "< 0.04" }],
  },

  ck_mb: {
    name: "CK-MB",
    category: "Cardiac",
    parameters: [{ name: "CK-MB", unit: "ng/mL", range: "0 - 5" }],
  },

  psa: {
    name: "Prostate Specific Antigen (PSA)",
    category: "Tumor Marker",
    parameters: [
      { name: "Total PSA", unit: "ng/mL", range: "< 4.0" },
      {
        name: "Free PSA",
        unit: "ng/mL",
        range: "Variable (interpret with total PSA)",
      },
    ],
  },

  ca_125: {
    name: "CA-125",
    category: "Tumor Marker",
    parameters: [{ name: "CA-125", unit: "U/mL", range: "< 35" }],
  },

  cea: {
    name: "Carcinoembryonic Antigen (CEA)",
    category: "Tumor Marker",
    parameters: [{ name: "CEA", unit: "ng/mL", range: "< 3.0 (non-smoker)" }],
  },

  ca19_9: {
    name: "CA 19-9",
    category: "Tumor Marker",
    parameters: [{ name: "CA 19-9", unit: "U/mL", range: "< 37" }],
  },

  "fs h_l": {
    name: "Female Reproductive Hormone Panel",
    category: "Hormones",
    parameters: [
      {
        name: "FSH",
        unit: "mIU/mL",
        range: {
          follicular: "3.5 - 12.5",
          midcycle: "4.7 - 21.5",
          luteal: "1.7 - 7.7",
          postmenopausal: "25.8 - 134.8",
        },
      },
      {
        name: "LH",
        unit: "mIU/mL",
        range: {
          follicular: "2.4 - 12.6",
          midcycle: "14.0 - 95.6",
          luteal: "1.0 - 11.4",
          postmenopausal: "7.7 - 58.5",
        },
      },
      {
        name: "Prolactin",
        unit: "ng/mL",
        range: { female: "4.8 - 23.3", male: "4.0 - 15.2" },
      },
      {
        name: "Estradiol (E2)",
        unit: "pg/mL",
        range: {
          follicular: "20 - 150",
          ovulatory: "150 - 750",
          luteal: "30 - 450",
          postmenopausal: "< 20",
        },
      },
    ],
  },

  testosterone: {
    name: "Testosterone",
    category: "Hormones",
    parameters: [
      {
        name: "Total Testosterone",
        unit: "ng/dL",
        range: { male: "300 - 1000", female: "15 - 70" },
      },
      {
        name: "Free Testosterone",
        unit: "pg/mL",
        range: { male: "5 - 21", female: "0.3 - 1.9" },
      },
    ],
  },

  insulin_fasting: {
    name: "Insulin (Fasting)",
    category: "Endocrine",
    parameters: [{ name: "Fasting Insulin", unit: "µIU/mL", range: "2 - 25" }],
  },

  cortisol: {
    name: "Cortisol (Serum)",
    category: "Endocrine",
    parameters: [
      { name: "Serum Cortisol (8 AM)", unit: "µg/dL", range: "5 - 23" },
      { name: "Serum Cortisol (4 PM)", unit: "µg/dL", range: "3 - 16" },
    ],
  },

  vitamin_a: {
    name: "Vitamin A (Retinol)",
    category: "Vitamins",
    parameters: [{ name: "Retinol", unit: "µg/dL", range: "20 - 60" }],
  },

  crp_hs: {
    name: "High-sensitivity CRP (hs-CRP)",
    category: "Cardiac / Inflammation",
    parameters: [
      {
        name: "hs-CRP",
        unit: "mg/L",
        range: { low: "< 1.0", average: "1.0 - 3.0", high: "> 3.0" },
      },
    ],
  },

  ana: {
    name: "Antinuclear Antibody (ANA)",
    category: "Autoimmune",
    parameters: [
      {
        name: "ANA (IFA / Screen)",
        unit: "",
        range: "Negative/Positive (titer/pattern reported)",
      },
    ],
  },

  rheumatoid_factor: {
    name: "Rheumatoid Factor (RF)",
    category: "Autoimmune",
    parameters: [{ name: "RF", unit: "IU/mL", range: "< 14" }],
  },

  hba1c_ext: {
    name: "HbA1c (alternate)",
    category: "Diabetes",
    parameters: [{ name: "HbA1c", unit: "%", range: "< 5.7" }],
  },

  strep_test: {
    name: "Streptococcal Antigen / Rapid Strep",
    category: "Infectious Disease",
    parameters: [
      { name: "Rapid Strep Antigen", unit: "", range: "Negative/Positive" },
    ],
  },

  covid_antibody: {
    name: "SARS-CoV-2 Antibodies",
    category: "Serology",
    parameters: [
      {
        name: "IgG (Spike/Nucleocapsid)",
        unit: "",
        range: "Negative/Positive (titer if quantitative)",
      },
    ],
  },

  tb_igg_igm: {
    name: "Tuberculosis (IGRA / PPD alternate)",
    category: "Infectious Disease",
    parameters: [
      { name: "IGRA (Quantiferon)", unit: "", range: "Negative/Positive" },
    ],
  },

  tsh_only: {
    name: "TSH Only (screen)",
    category: "Hormones",
    parameters: [{ name: "TSH", unit: "µIU/mL", range: "0.4 - 4.0" }],
  },

  procalcitonin: {
    name: "Procalcitonin (PCT)",
    category: "Infection / Sepsis",
    parameters: [{ name: "Procalcitonin", unit: "ng/mL", range: "< 0.1" }],
  },

  anti_tpo: {
    name: "Anti-TPO Antibody",
    category: "Autoimmune / Thyroid",
    parameters: [{ name: "Anti-TPO", unit: "IU/mL", range: "< 35" }],
  },

  anti_tg: {
    name: "Anti-Thyroglobulin (Anti-Tg)",
    category: "Autoimmune / Thyroid",
    parameters: [{ name: "Anti-Tg", unit: "IU/mL", range: "< 115" }],
  },

  stool_culture: {
    name: "Stool Culture",
    category: "Microbiology",
    parameters: [
      {
        name: "Pathogenic Bacteria",
        unit: "",
        range: "No pathogens / report species if positive",
      },
    ],
  },

  hb_electrophoresis: {
    name: "Hemoglobin Electrophoresis",
    category: "Hematology",
    parameters: [
      { name: "HbA", unit: "%", range: "Depends on age/condition" },
      { name: "HbA2", unit: "%", range: "1.5 - 3.5" },
      { name: "HbF", unit: "%", range: "< 2" },
    ],
  },

  blood_culture: {
    name: "Blood Culture",
    category: "Microbiology",
    parameters: [
      {
        name: "Bacterial Growth",
        unit: "",
        range: "No growth / report organism & sensitivity",
      },
    ],
  },

  coag_profile: {
    name: "Complete Coagulation Profile",
    category: "Coagulation",
    parameters: [
      { name: "PT", unit: "seconds", range: "11 - 15" },
      { name: "INR", unit: "", range: "0.8 - 1.2" },
      { name: "APTT", unit: "seconds", range: "25 - 40" },
      { name: "Fibrinogen", unit: "mg/dL", range: "200 - 400" },
    ],
  },

  ana_profile: {
    name: "ANA Profile (ENAs)",
    category: "Autoimmune",
    parameters: [
      { name: "ANA", unit: "", range: "Negative/Positive (titer/pattern)" },
      {
        name: "ENA panel (Ro/La/Sm/RNP)",
        unit: "",
        range: "Negative/Positive",
      },
    ],
  },

  tb_markers: {
    name: "TB Markers (Mantoux/IGRA)",
    category: "Infectious Disease",
    parameters: [
      {
        name: "Mantoux (PPD) mm induration",
        unit: "mm",
        range: "Variable by risk",
      },
      { name: "IGRA", unit: "", range: "Negative/Positive" },
    ],
  },

  vitamin_k: {
    name: "Vitamin K (if measured)",
    category: "Vitamins / Coagulation",
    parameters: [
      { name: "Vitamin K (Phytonadione)", unit: "ng/mL", range: "Variable" },
    ],
  },

  helicobacter_antigen: {
    name: "H. pylori Stool Antigen",
    category: "Microbiology",
    parameters: [
      { name: "H. pylori antigen", unit: "", range: "Negative/Positive" },
    ],
  },

  infectious_panel: {
    name: "Common Infectious Serology Panel",
    category: "Infectious Disease",
    parameters: [
      { name: "Rubella IgM/IgG", unit: "", range: "Negative/Positive" },
      { name: "Toxoplasma IgM/IgG", unit: "", range: "Negative/Positive" },
      { name: "CMV IgM/IgG", unit: "", range: "Negative/Positive" },
    ],
  },

  comprehensive_metabolic_panel: {
    name: "Comprehensive Metabolic Panel (CMP)",
    category: "Biochemistry",
    parameters: [
      { name: "Glucose (fasting)", unit: "mg/dL", range: "70 - 100" },
      { name: "Calcium (total)", unit: "mg/dL", range: "8.5 - 10.5" },
      { name: "Albumin", unit: "g/dL", range: "3.4 - 5.4" },
      { name: "Total Protein", unit: "g/dL", range: "6.0 - 8.3" },
      { name: "Sodium", unit: "mmol/L", range: "135 - 145" },
      { name: "Potassium", unit: "mmol/L", range: "3.5 - 5.0" },
      { name: "Chloride", unit: "mmol/L", range: "98 - 106" },

      { name: "Bilirubin Total", unit: "mg/dL", range: "0.3 - 1.2" },
      { name: "Bilirubin Direct", unit: "mg/dL", range: "0.0 - 0.3" },
      {
        name: "Bilirubin Indirect",
        unit: "mg/dL",
        range: "0.2 - 0.9",
        formula: "Bilirubin Total - Bilirubin Direct",
      },

      { name: "AST (SGOT)", unit: "U/L", range: "5 - 40" },
      { name: "ALT (SGPT)", unit: "U/L", range: "7 - 56" },
    ],
  },
};

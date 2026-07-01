"use client";
import React, { useEffect, useRef, useState } from "react";
import ImageGallery from "react-image-gallery";
import { toast } from "react-toastify";
import { findInspection, findInspectionV2 } from "../service/inspection";
import axiosInstance from "../service/api";
import { Check, File, X, ChevronDown, ChevronUp, Info } from "lucide-react";
import { useParams } from "react-router-dom";
import CarBodySvgView from "../components/CarBodyView";
import LanguageSelectionModal from "../components/LanguageSelectionModal";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";

const isEmpty = (obj: any) => Object.keys(obj).length === 0;

interface ExtraDataItem {
  comment: string;
  image: string | null;
}

interface InspectionData {
  extraData?: Record<string, ExtraDataItem>;
  overview?: any;
  [key: string]: any;
}

// Helper to render value with appropriate styling
const renderFieldValue = (fieldName: string, displayValue: any) => {
  console.log('renderFieldValue',fieldName);
  if (displayValue === false) {
    return <span className="text-gray-300">N/A</span>;
  } else if (displayValue === true || displayValue === "Yes" || displayValue === "yes" || (fieldName == 'Airbag Deployed' && displayValue == 'No')) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <Check size={16} className="text-green-600" />
        {typeof displayValue === "string" && <span>{displayValue}</span>}
      </span>
    );
  } else if (displayValue === "No" || displayValue === "no" || (fieldName == 'Airbag Deployed' && displayValue == 'Yes')) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <Info size={16} className="text-red-600" />
        <span className="text-red-500">{displayValue}</span>
      </span>
    );
  } else if (displayValue === "Pass" || displayValue === "pass") {
    return (
      <span className="inline-flex items-center gap-1.5">
        <Check size={16} className="text-green-600 bg-green-100 rounded-full p-0.5" />
        <span>{displayValue}</span>
      </span>
    );
  }
  else if(displayValue === 'Damaged') {
 return (
      <span className="inline-flex items-center gap-1.5">
        <Info size={16} className="text-orange-600 rounded-full p-0.5" />
        <span className="text-orange-500">{displayValue}</span>
      </span>
    )
  }
  else if (displayValue === "Leak" || displayValue === "leak" || displayValue === "Fail" || displayValue === "fail") {
    return (
      <span className="inline-flex items-center gap-1.5">
        <Info size={16} className="text-red-600  rounded-full p-0.5" />
        <span className="text-red-500">{displayValue}</span>
      </span>
    );
  } else if (displayValue === "" || displayValue === null || displayValue === undefined) {
    return "N/A";
  } else {
    return displayValue;
  }
};

// V1 Format Section Block
const SectionBlock = ({ title, items }: { title: string; items: [string, any][] }) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="mb-4 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100 text-left"
      >
        <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">{title}</span>
        {collapsed ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronUp size={16} className="text-gray-400" />}
      </button>
      {!collapsed && (
        <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-y divide-gray-50">
          {items.map(([key, val]) => {
            const displayValue = typeof val === "object" && val?.length ? val[0].value
              : typeof val === "object" && !val?.length ? val?.value
              : val;

            return (
              <div key={key} className="px-4 py-3 bg-white">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{key.replace(/_/g, " ")}</p>
                <p className="text-sm font-medium text-gray-800 break-words">
                  {renderFieldValue(key.replace(/_/g, " "),displayValue)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// V2 Format Section Block - for new inspection format with label/fields structure
const SectionBlockV2 = ({ title, fields }: { title: string; fields: { label: string; value: any }[] }) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="mb-4 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100 text-left"
      >
        <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">{title}</span>
        {collapsed ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronUp size={16} className="text-gray-400" />}
      </button>
      {!collapsed && (
        <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-y divide-gray-50">
          {fields.map((field, idx) => (
            <div key={idx} className="px-4 py-3 bg-white">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{field.label}</p>
              <p className="text-sm font-medium text-gray-800 break-words">
                {renderFieldValue(field.label,field.value)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Detect if inspection data is v2 format (has label and fields structure)
const isV2Format = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  const keys = Object.keys(data).filter(k => k !== 'extraData');
  if (keys.length === 0) return false;
  const firstSection = data[keys[0]];
  return firstSection && typeof firstSection === 'object' && 'label' in firstSection && 'fields' in firstSection;
};

const ViewInspectionPage = () => {
  const [data, setData] = useState<any>(null);
  const params = useParams();
  const { user } = useAuth();
  const imageGalleryRef = useRef<any>(null);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [incompleteReason, setIncompleteReason] = useState("");
  const [incompleteLoading, setIncompleteLoading] = useState(false);
  const [showDisqualifyModal, setShowDisqualifyModal] = useState(false);
  const [disqualifyReason, setDisqualifyReason] = useState("");
  const [disqualifyLoading, setDisqualifyLoading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [itemIndex, setStartIndex] = useState(0);
  const [reportLoader, setReportLoader] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    if (params?.id) {
      findInspectionV2(params.id, language)
        .then((res) => setData(res))
        .catch(() => toast.error("Failed to load inspection details"));
    }
  }, [params?.id, language]);

  const handleGenerateReport = async (reportLanguage: string) => {
    if (!params?.id) return;
    try {
      setReportLoader(true);
      const response = await axiosInstance.get(`/1.0/reports/inspection/v1/html/${params.id}`, {
        params: { lang: reportLanguage },
      });
      const htmlContent: string = response.data;
      const serverOrigin = new URL(axiosInstance.defaults.baseURL || "http://localhost:3000/").origin;
      const baseTag = `<base href="${serverOrigin}/">`;
      const printScript = `<script>document.fonts.ready.then(function(){setTimeout(function(){window.print();},800);});<\/script>`;
      let modifiedHtml = htmlContent.includes("<head>")
        ? htmlContent.replace("<head>", "<head>" + baseTag)
        : htmlContent;
      modifiedHtml = modifiedHtml.includes("</body>")
        ? modifiedHtml.replace("</body>", printScript + "</body>")
        : modifiedHtml + printScript;
      const blob = new Blob([modifiedHtml], { type: "text/html" });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setReportLoader(false);
      setShowLanguageModal(false);
    }
  };

  const markAsCompleted = async (inspectionId: string) => {
    try {
      await axiosInstance.get("/1.0/inspection/mark-as-completed/" + inspectionId);
      alert("Successfully updated your status");
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  const markAsIncomplete = async () => {
    if (!incompleteReason.trim()) return;
    setIncompleteLoading(true);
    try {
      await axiosInstance.post(`/1.0/inspection/mark-as-incomplete/${params.id}`, { comment: incompleteReason });
      toast.success("Inspection marked as incomplete");
      setShowIncompleteModal(false);
      setIncompleteReason("");
      if (params.id) findInspectionV2(params.id).then((res) => setData(res));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIncompleteLoading(false);
    }
  };

  const markCarAsInspected = async (carId: string) => {
    try {
      await axiosInstance.put("/1.0/car/update/" + carId, {
        carStatus: "inspected",
        inspectionId: params?.id,
      });
      alert("Successfully updated your status");
      if (params.id) findInspectionV2(params.id, language).then((res) => setData(res));
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  const markAsDisqualified = async () => {
    if (!disqualifyReason.trim()) return;
    setDisqualifyLoading(true);
    try {
      await axiosInstance.post(`/1.0/inspection/mark-as-disqualified/${params.id}`, { comment: disqualifyReason });
      toast.success("Inspection marked as disqualified");
      setShowDisqualifyModal(false);
      setDisqualifyReason("");
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setDisqualifyLoading(false);
    }
  };

  let inspection: InspectionData | null = null;
  if (data?.inspection?.inspectionJson && !isEmpty(data.inspection.inspectionJson)) {
    inspection = data.inspection.inspectionJson;
  }

  const statusColor: Record<string, string> = {
    Submit: "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
    Incomplete: "bg-red-100 text-red-700",
    Pending: "bg-yellow-100 text-yellow-700",
  };
  const status = data?.inspection?.inspectionStatus ?? "";
  const badgeClass = statusColor[status] ?? "bg-gray-100 text-gray-600";

  // Detect format version
  const isV2 = inspection ? isV2Format(inspection) : false;

  // V2 format: sections with label and fields
  const v2Sections = isV2 && inspection
    ? Object.entries(inspection).filter(([k]) => k !== 'extraData').map(([key, section]: [string, any]) => ({
        key,
        label: section.label || key,
        fields: section.fields || []
      }))
    : [];

  // V1 format: Group inspection fields into the non-overview, non-extraData keys
  const inspectionEntries = !isV2 && inspection
    ? Object.entries(inspection).filter(([k]) => k !== "overview" && k !== "extraData")
    : [];

  // Split into chunks of 9 for section blocks (V1 only)
  const chunkSize = 9;
  const sections: [string, any][][] = [];
  for (let i = 0; i < inspectionEntries.length; i += chunkSize) {
    sections.push(inspectionEntries.slice(i, i + chunkSize));
  }

  const images = data?.images ?? [];

  // Primary car photos - specific angles only
  const primaryCaptions = ["front", "left", "right", "back", "engine","dashboard","interior"];
  const documentCaptions = ["seller", "id", "license", "document", "registration", "insurance"];

  const primaryImages = images.filter((img: any) =>
    img.caption && primaryCaptions.includes(img.caption.toLowerCase())
  );

  const documentImages = images.filter((img: any) => {
    if (!img.caption) return false;
    const captionLower = img.caption.toLowerCase();
    const isPrimary = primaryCaptions.includes(captionLower);
    // Match document captions as complete words (bounded by start/end, underscore, or space)
    const isDocument = documentCaptions.some(doc => {
      const regex = new RegExp(`(^|[_\\s])${doc}([_\\s]|$)`, 'i');
      return regex.test(captionLower);
    });
    return !isPrimary && isDocument;
  });

  const findingsImages = images.filter((img: any) => {
    if (!img.caption) return false;
    const captionLower = img.caption.toLowerCase();
    const isPrimary = primaryCaptions.includes(captionLower);
    // Match document captions as complete words (bounded by start/end, underscore, or space)
    const isDocument = documentCaptions.some(doc => {
      const regex = new RegExp(`(^|[_\\s])${doc}([_\\s]|$)`, 'i');
      return regex.test(captionLower);
    });
    return !isPrimary && !isDocument;
  });

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* ── Action Bar ── */}
      <div className="flex flex-wrap items-center justify-end gap-3 mb-5">
        {/* Language Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              language === 'en' ? 'bg-white text-[#003B7E] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('ar')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              language === 'ar' ? 'bg-white text-[#003B7E] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            عربي
          </button>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#003B7E] text-[#003B7E] bg-white hover:bg-[#f0f4ff] text-sm font-medium transition-colors"
          onClick={() => setShowLanguageModal(true)}
          disabled={reportLoader}
        >
          <File size={15} />
          {reportLoader
            ? language === "en" ? "Generating..." : "جاري الإنشاء..."
            : language === "en" ? "Generate Report" : "إنشاء تقرير"}
        </button>

        {status === "Submit" && (
          <>
            {user?.role?.toLowerCase() === "qa" && (
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-sm font-medium transition-colors"
                onClick={() => setShowIncompleteModal(true)}
              >
                ⚠️ Request Justification
              </button>
            )}
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#003B7E] text-white hover:bg-[#002d61] text-sm font-medium transition-colors"
              onClick={() => {
                if (confirm("Are you sure you want to mark as completed")) {
                  if (params.id) markAsCompleted(params.id);
                  markCarAsInspected(data?.inspection?.carId);
                }
              }}
            >
              <Check size={15} />
              Mark as Completed
            </button>
          </>
        )}

        {status !== "Completed" && (
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 text-sm font-medium transition-colors"
            onClick={() => setShowDisqualifyModal(true)}
          >
            <X size={15} />
            Disqualify
          </button>
        )}
      </div>

      {data?.error && (
        <div className="text-red-600 mb-4 text-sm">{JSON.stringify(data.error)}</div>
      )}

      {/* ── Full-screen Gallery ── */}
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex justify-end p-4">
            <button onClick={() => setShowGallery(false)} className="text-white font-bold text-xl">
              <X size={28} />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <ImageGallery
              ref={imageGalleryRef}
              showPlayButton={false}
              startIndex={itemIndex}
              onErrorImageURL="/images/loader.webp"
              showFullscreenButton={false}
              lazyLoad={false}
              items={images.map((item: any) => ({
                ...item,
                original: item.url,
                thumbnail: item.url,
              }))}
            />
          </div>
        </div>
      )}

      {!showGallery && (
        <div className="space-y-6">
          {/* ── Header Card ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#003B7E] to-[#0055b3] px-6 py-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-blue-200 text-xs uppercase tracking-widest mb-1">Inspection Report</p>
                <h1 className="text-white text-2xl font-bold">
                  {data?.inspection?.car?.year} {data?.inspection?.car?.make} {data?.inspection?.car?.model}
                </h1>
                <p className="text-blue-100 text-sm mt-1">ID: {params?.id}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${badgeClass}`}>
                {status || "—"}
              </span>
            </div>

            {/* Key stats row */}
            {data?.inspection && (
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
                {[
                  { label: "Inspector", value: data.inspection.inspectorName ?? data.inspection.inspectorName ?? "—" },
                  { label: "Branch", value: data.inspection.BookAppointments?.[0]?.Branch?.enName ?? "—" },
                  { label: "Date", value: data.inspection.createdAt ? new Date(data.inspection.createdAt).toLocaleDateString() : "—" },
                  { label: "Display Id", value: data.inspection?.displayId ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="px-5 py-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Primary Car Photos ── */}
          {primaryImages.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Car Photos</h2>
              <div className="grid grid-cols-5 gap-2">
                {primaryImages.map((img: any, idx: number) => {
                  const actualIndex = images.findIndex((i: any) => i.url === img.url);
                  return (
                    <div
                      key={idx}
                      className="relative cursor-pointer rounded-lg overflow-hidden group aspect-video bg-gray-100"
                      onClick={() => { setStartIndex(actualIndex); setShowGallery(true); }}
                    >
                      <img
                        src={img.url}
                        alt={img.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {img.caption && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-xs px-2 py-1 truncate text-center">
                          {img.caption}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Document Images ── */}
          {documentImages.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Document Images</h2>
              <div className="grid grid-cols-4 gap-2">
                {documentImages.map((img: any, idx: number) => {
                  const actualIndex = images.findIndex((i: any) => i.url === img.url);
                  return (
                    <div
                      key={idx}
                      className="relative cursor-pointer rounded-lg overflow-hidden group aspect-square bg-gray-100"
                      onClick={() => { setStartIndex(actualIndex); setShowGallery(true); }}
                    >
                      <img
                        src={img.url}
                        alt={img.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {img.caption && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-xs px-2 py-1 truncate text-center">
                          {img.caption}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* ── Inspection Data ── */}
            <div className="xl:col-span-2 space-y-2">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Inspection Details</h2>

              {isV2 ? (
                // V2 Format rendering
                v2Sections.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400 text-sm">
                    Loading Inspection Preview Soon…
                  </div>
                ) : (
                  v2Sections.map((section) => (
                    <SectionBlockV2
                      key={section.key}
                      title={section.label}
                      fields={section.fields}
                    />
                  ))
                )
              ) : (
                // V1 Format rendering
                inspectionEntries.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400 text-sm">
                    Loading Inspection Preview Soon…
                  </div>
                ) : (
                  sections.map((chunk, si) => (
                    <SectionBlock
                      key={si}
                      title={`Section ${si + 1}`}
                      items={chunk}
                    />
                  ))
                )
              )}

              {/* Extra Data */}
              {inspection?.extraData && Object.keys(inspection.extraData).length > 0 && (
                <div className="mt-4">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Additional Field Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(inspection.extraData).map(([key, extraItem]) => {
                      const item = extraItem as ExtraDataItem;
                      return (
                        <div key={key} className="border border-gray-100 rounded-xl bg-white shadow-sm overflow-hidden">
                          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{key.replace(/_/g, " ")}</h3>
                          </div>
                          <div className="p-4 space-y-3">
                            {item.comment && (
                              <div>
                                <p className="text-xs text-gray-400 mb-0.5">Comment</p>
                                <p className="text-sm text-gray-800">{item.comment}</p>
                              </div>
                            )}
                            {item.image && (
                              <div className="relative cursor-pointer rounded-lg overflow-hidden" onClick={() => window.open(item.image!, "_blank")}>
                                <img src={item.image} alt={key} className="w-full h-36 object-cover rounded-lg" />
                                <div className="absolute bottom-2 right-2 bg-[#003B7E] text-white text-xs px-2 py-0.5 rounded-md">
                                  View Full
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Sidebar ── */}
            <div className="space-y-6">
              {/* Car Body */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Car Body Condition</h2>
                {data?.inspection?.carBodyConditionJson ? (
                  <CarBodySvgView data={data.inspection.carBodyConditionJson} />
                ) : (
                  <p className="text-sm text-gray-400 text-center py-6">No body condition data</p>
                )}
              </div>

              {/* Findings images */}
              {findingsImages.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Findings</h2>
                  <div className="grid grid-cols-3 gap-2">
                    {findingsImages.map((img: any, idx: number) => {
                      const actualIndex = images.findIndex((i: any) => i.url === img.url);
                      return (
                        <div
                          key={idx}
                          className="relative cursor-pointer rounded-lg overflow-hidden aspect-square bg-gray-100 group"
                          onClick={() => { setStartIndex(actualIndex); setShowGallery(true); }}
                        >
                          <img src={img.url} alt={img.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                          {img.caption && (
                            <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] px-1.5 py-1 truncate text-center">
                              {img.caption.replace(/_/g, ' ')}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <LanguageSelectionModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        onSelectLanguage={handleGenerateReport}
        isLoading={reportLoader}
      />

      {showIncompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowIncompleteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Mark as Incomplete</h2>
              <button
                onClick={() => setShowIncompleteModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-500">Provide a reason for marking this inspection as incomplete.</p>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Reason</label>
                <textarea
                  rows={4}
                  value={incompleteReason}
                  onChange={(e) => setIncompleteReason(e.target.value)}
                  placeholder="Describe the issue..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 resize-none text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button
                  onClick={() => setShowIncompleteModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={markAsIncomplete}
                  disabled={incompleteLoading || !incompleteReason.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {incompleteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDisqualifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDisqualifyModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Disqualify Inspection</h2>
              <button
                onClick={() => setShowDisqualifyModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-500">Provide a reason for disqualifying this inspection.</p>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Reason</label>
                <textarea
                  rows={4}
                  value={disqualifyReason}
                  onChange={(e) => setDisqualifyReason(e.target.value)}
                  placeholder="Enter disqualification reason..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button
                  onClick={() => setShowDisqualifyModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={markAsDisqualified}
                  disabled={disqualifyLoading || !disqualifyReason.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-orange-600 text-white text-sm font-medium rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {disqualifyLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewInspectionPage;

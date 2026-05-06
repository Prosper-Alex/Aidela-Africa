// Key feature: Collects role-specific onboarding profile data before routing users into the app.
import {
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Globe2,
  ImagePlus,
  Link2,
  Save,
  Search,
  Trash2,
  Upload,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";
import AppShell from "../../components/AppShell";
import { ErrorPanel } from "../../components/Feedback";
import TechStackInput from "../../components/TechStackInput";
import { useAuth } from "../../context/AuthContext";
import {
  completeOnboarding,
  uploadProfileImage,
} from "../../services/authService";
import { getErrorMessage } from "../../utils/getErrorMessage";

const COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "Rwanda",
  "Egypt",
  "Morocco",
  "Uganda",
  "Tanzania",
  "Ethiopia",
  "France",
  "Netherlands",
  "United Arab Emirates",
  "India",
  "Brazil",
  "Australia",
];

const EXPERIENCE_OPTIONS = [
  { label: "0-1 years", value: "1" },
  { label: "1-2 years", value: "2" },
  { label: "3-5 years", value: "5" },
  { label: "5+ years", value: "6" },
];

const EMPLOYEE_COUNT_OPTIONS = [
  { label: "1-10 employees", value: "10" },
  { label: "11-50 employees", value: "50" },
  { label: "51-200 employees", value: "200" },
  { label: "201-500 employees", value: "500" },
  { label: "500+ employees", value: "501" },
];

const currentYear = new Date().getFullYear();
const FOUNDED_YEAR_OPTIONS = Array.from(
  { length: currentYear - 1949 },
  (_, index) => `${currentYear - index}`,
);

const HEADLINE_MAX_LENGTH = 80;
const BIO_MAX_LENGTH = 480;

const isValidUrl = (value) => {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const normalizeUrl = (value) => {
  const trimmedValue = `${value || ""}`.trim();

  if (!trimmedValue || /^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
};

const getInitialForm = (user) => {
  if (user?.role === "recruiter") {
    return {
      companyName: user?.companyProfile?.companyName || "",
      companyLogo: user?.companyProfile?.companyLogo || "",
      bio: user?.companyProfile?.bio || "",
      employeeCount: user?.companyProfile?.employeeCount ?? "",
      foundedYear: user?.companyProfile?.foundedYear ?? "",
      foundedBy: user?.companyProfile?.foundedBy || "",
    };
  }

  return {
    headline: user?.candidateProfile?.headline || "",
    bio: user?.candidateProfile?.bio || "",
    techStack: Array.isArray(user?.candidateProfile?.techStack)
      ? user.candidateProfile.techStack
      : [],
    yearsOfExperience: user?.candidateProfile?.yearsOfExperience ?? "",
    portfolioUrl: user?.candidateProfile?.portfolioUrl || "",
    location: user?.candidateProfile?.location || "",
  };
};

const getCompletedCount = (form, role, hasSelectedUpload = false) => {
  const fields =
    role === "recruiter"
      ? ["companyName", "companyLogo", "bio", "employeeCount", "foundedYear", "foundedBy"]
      : ["headline", "bio", "techStack", "yearsOfExperience", "portfolioUrl", "location"];

  return fields.filter((field) => {
    const value =
      field === "companyLogo" && hasSelectedUpload ? "selected-image" : form[field];

    if (field === "yearsOfExperience") {
      return value !== "" && Number(value) >= 0;
    }

    if (field === "employeeCount" || field === "foundedYear") {
      return Number(value) > 0;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return `${value || ""}`.trim().length > 0;
  }).length;
};

export const Onboarding = () => {
  const { user, updateUser, isRecruiter } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => getInitialForm(user));
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(getInitialForm(user));
  }, [user]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const completedCount = useMemo(
    () => getCompletedCount(form, user?.role, Boolean(selectedFile)),
    [form, selectedFile, user?.role],
  );
  const totalCount = 6;
  const isPortfolioValid = !isRecruiter && isValidUrl(normalizeUrl(form.portfolioUrl));
  const canSubmit =
    completedCount === totalCount &&
    (isRecruiter || isPortfolioValid) &&
    !isSaving;

  if (user?.isOnboarded) {
    return (
      <Navigate
        to={isRecruiter ? "/employer-dashboard" : "/find-jobs"}
        replace
      />
    );
  }

  const handleChange = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleFileChange = (file) => {
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Upload an image file.");
      return;
    }

    setSelectedFile(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");

    if (isRecruiter) {
      handleChange("companyLogo", "");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      let imageUrl = isRecruiter ? form.companyLogo : user?.avatar || "";

      if (selectedFile) {
        const uploadData = await uploadProfileImage({
          file: selectedFile,
          target: isRecruiter ? "companyLogo" : "avatar",
        });
        imageUrl = uploadData.imageUrl;
        updateUser(uploadData.user);
      }

      const payload = isRecruiter
        ? {
            companyProfile: {
              companyName: form.companyName,
              companyLogo: imageUrl || form.companyLogo,
              bio: form.bio,
              employeeCount: form.employeeCount,
              foundedYear: form.foundedYear,
              foundedBy: form.foundedBy,
            },
          }
        : {
            avatar: imageUrl,
            candidateProfile: {
              headline: form.headline,
              bio: form.bio,
              techStack: form.techStack,
              yearsOfExperience: form.yearsOfExperience,
              portfolioUrl: normalizeUrl(form.portfolioUrl),
              location: form.location,
            },
          };

      const data = await completeOnboarding(payload);
      updateUser(data.user);
      toast.success("Onboarding completed.");
      navigate(isRecruiter ? "/employer-dashboard" : "/find-jobs", {
        replace: true,
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to complete onboarding."));
    } finally {
      setIsSaving(false);
    }
  };

  const previewSource = previewUrl || (isRecruiter ? form.companyLogo : user?.avatar);
  const Icon = isRecruiter ? BriefcaseBusiness : UserRound;

  return (
    <AppShell
      eyebrow="Onboarding"
      title={isRecruiter ? "Set up your company profile" : "Set up your candidate profile"}
      description="Complete the core fields once so the platform can verify and route your profile cleanly."
      maxWidth="max-w-5xl"
    >
      {error ? <ErrorPanel message={error} /> : null}

      <section className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Profile {completedCount}/{totalCount} completed
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Complete all six fields to become Aidela Verified.
              </p>
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-secondary transition-all"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>

          <ImageUploader
            label={isRecruiter ? "Company logo" : "Profile image"}
            helper={isRecruiter ? "Required for recruiter verification" : "Optional, but it makes your profile feel complete"}
            icon={Icon}
            previewSource={previewSource}
            onFileChange={handleFileChange}
            onRemove={handleRemoveImage}
            isUploading={isSaving && Boolean(selectedFile)}
          />
        </aside>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {isRecruiter ? (
              <>
                <Field label="Company name" value={form.companyName} onChange={(value) => handleChange("companyName", value)} placeholder="Aidela Africa" />
                <AutoResizeTextArea label="Company bio" value={form.bio} onChange={(value) => handleChange("bio", value)} placeholder="What your company builds, who you serve, and why candidates should care." className="sm:col-span-2" />
                <SelectField label="Employee count" value={form.employeeCount} onChange={(value) => handleChange("employeeCount", value)} options={EMPLOYEE_COUNT_OPTIONS} icon={Users} />
                <SelectField label="Founded year" value={form.foundedYear} onChange={(value) => handleChange("foundedYear", value)} options={FOUNDED_YEAR_OPTIONS.map((year) => ({ label: year, value: year }))} icon={Calendar} />
                <Field label="Founder name" value={form.foundedBy} onChange={(value) => handleChange("foundedBy", value)} placeholder="Founder or founding team" />
              </>
            ) : (
              <>
                <HeadlineInput value={form.headline} onChange={(value) => handleChange("headline", value)} />
                <TechStackInput value={form.techStack} onChange={(value) => handleChange("techStack", value)} className="sm:col-span-2" />
                <AutoResizeTextArea label="Bio" value={form.bio} onChange={(value) => handleChange("bio", value)} placeholder="Summarize your strengths, the work you enjoy, and what you want next." className="sm:col-span-2" />
                <SelectField label="Years of experience" value={form.yearsOfExperience} onChange={(value) => handleChange("yearsOfExperience", value)} options={EXPERIENCE_OPTIONS} icon={BriefcaseBusiness} />
                <UrlInput label="Portfolio URL" value={form.portfolioUrl} onChange={(value) => handleChange("portfolioUrl", value)} />
                <CountrySelect value={form.location} onChange={(value) => handleChange("location", value)} className="sm:col-span-2" />
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {selectedFile ? <Upload className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Saving..." : "Finish onboarding"}
          </button>
        </form>
      </section>
    </AppShell>
  );
};

const inputShellClass =
  "w-full rounded-xl bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.18)] outline-none transition placeholder:text-slate-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(6,73,181,0.10),inset_0_0_0_1px_rgba(6,73,181,0.22)]";

const Field = ({ label, value, onChange, type = "text", placeholder = "", min }) => (
  <label className="block space-y-2">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <input
      type={type}
      min={min}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={inputShellClass}
    />
  </label>
);

const HeadlineInput = ({ value, onChange }) => (
  <label className="block space-y-2 sm:col-span-2">
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-slate-700">Headline</span>
      <span className="text-xs text-slate-500">
        {value.length}/{HEADLINE_MAX_LENGTH}
      </span>
    </div>
    <input
      value={value}
      maxLength={HEADLINE_MAX_LENGTH}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Frontend Developer specializing in React"
      className={inputShellClass}
    />
  </label>
);

const AutoResizeTextArea = ({
  label,
  value,
  onChange,
  placeholder,
  className = "",
}) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  return (
    <label className={`block space-y-2 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-xs text-slate-500">
          {value.length}/{BIO_MAX_LENGTH}
        </span>
      </div>
      <textarea
        ref={textareaRef}
        rows={4}
        maxLength={BIO_MAX_LENGTH}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`${inputShellClass} min-h-32 resize-none leading-6`}
      />
    </label>
  );
};

const SelectField = ({ label, value, onChange, options, icon: Icon }) => (
  <label className="block space-y-2">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <div className="relative">
      {Icon ? (
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      ) : null}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputShellClass} appearance-none ${Icon ? "pl-11" : ""} pr-10`}
      >
        <option value="">Select option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  </label>
);

const UrlInput = ({ label, value, onChange }) => {
  const isValid = isValidUrl(normalizeUrl(value));

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="relative">
        <Link2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={(event) => onChange(normalizeUrl(event.target.value))}
          placeholder="https://yourportfolio.com"
          className={`${inputShellClass} pl-11 ${
            !isValid
              ? "shadow-[0_0_0_3px_rgba(225,29,72,0.08),inset_0_0_0_1px_rgba(225,29,72,0.28)]"
              : ""
          }`}
        />
      </div>
      <p className={`text-xs ${isValid ? "text-slate-500" : "text-rose-600"}`}>
        {isValid ? "Use a public portfolio, GitHub profile, or personal site." : "Enter a valid URL."}
      </p>
    </label>
  );
};

const CountrySelect = ({ value, onChange, className = "" }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const filteredCountries = COUNTRIES.filter((country) =>
    country.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <label className={`relative block space-y-2 ${className}`}>
      <span className="text-sm font-medium text-slate-700">Country / location</span>
      <div className="relative">
        <Globe2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={isOpen ? query : value}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setQuery("");
            setIsOpen(true);
          }}
          onBlur={() => {
            window.setTimeout(() => setIsOpen(false), 120);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
              return;
            }

            if (event.key === "Enter" && isOpen && filteredCountries[0]) {
              event.preventDefault();
              onChange(filteredCountries[0]);
              setQuery("");
              setIsOpen(false);
            }
          }}
          placeholder="Search country"
          className={`${inputShellClass} pl-11 pr-10`}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="country-options"
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setQuery("");
            }}
            className="absolute right-10 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Clear selected country"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
        <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>

      {isOpen ? (
        <div
          id="country-options"
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-60 overflow-auto rounded-xl bg-white p-1 shadow-[0_18px_50px_rgba(15,23,42,0.14),inset_0_0_0_1px_rgba(148,163,184,0.16)]"
        >
          {filteredCountries.length ? (
            filteredCountries.map((country) => (
              <button
                type="button"
                key={country}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(country);
                  setQuery("");
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-secondary/5 hover:text-secondary"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                  {country.slice(0, 2).toUpperCase()}
                </span>
                {country}
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-sm text-slate-500">No country found.</p>
          )}
        </div>
      ) : null}
    </label>
  );
};

const ImageUploader = ({
  label,
  helper,
  icon: Icon,
  previewSource,
  onFileChange,
  onRemove,
  isUploading,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    onFileChange(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="mt-6">
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`block cursor-pointer rounded-xl bg-slate-50/80 p-5 text-center shadow-[inset_0_0_0_1px_rgba(148,163,184,0.22)] transition hover:bg-secondary/5 ${
          isDragging ? "bg-secondary/5 shadow-[0_0_0_3px_rgba(6,73,181,0.10),inset_0_0_0_1px_rgba(6,73,181,0.24)]" : ""
        }`}
      >
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => onFileChange(event.target.files?.[0])}
        />
        <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-white text-slate-500 shadow-[0_1px_10px_rgba(15,23,42,0.08),inset_0_0_0_1px_rgba(148,163,184,0.16)]">
          {previewSource ? (
            <img src={previewSource} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon className="h-8 w-8" />
          )}
        </div>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-secondary">
          <ImagePlus className="h-4 w-4" />
          {label}
        </span>
        <p className="mt-2 text-xs leading-5 text-slate-500">{helper}</p>
        {isUploading ? (
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-secondary" />
          </div>
        ) : null}
      </label>

      {previewSource ? (
        <button
          type="button"
          onClick={onRemove}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.18)] transition hover:text-rose-600"
        >
          <Trash2 className="h-4 w-4" />
          Remove image
        </button>
      ) : null}
    </div>
  );
};

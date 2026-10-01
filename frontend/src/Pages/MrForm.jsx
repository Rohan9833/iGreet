import { useState } from "react";

const SPECIALITIES = [
  "Cardiology",
  "Dermatology",
  "Paediatrics",
  "Orthopedics",
  "General Physician",
  "Neurology",
  "Nephrology",
  "Gastroenterology",
  "Pulmonology",
  "Endocrinology",
  "Oncology",
  "Psychiatry",
  "Urology",
  "Gynaecology",
  "Obstetrics",
  "ENT",
  "Ophthalmology",
  "Rheumatology",
  "Diabetology",
  "Hepatology",
  "Neurosurgery",
  "Cardiothoracic Surgery",
  "General Surgery",
  "Plastic Surgery",
  "Paediatric Surgery",
  "Orthopaedic Surgery",
  "Dentistry",
  "Dermatovenereology",
  "Internal Medicine",
  "Family Medicine",
  "Critical Care",
  "Emergency Medicine",
  "Infectious Disease",
  "Pain Medicine",
  "Other",
];

/* -------------------- Icons -------------------- */

const DoctorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
    <path
      d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M4 21c.8-4 3.45-6 8-6s7.2 2 8 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const StethoscopeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
    <path
      d="M6 3v5a5 5 0 0 0 10 0V3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M4 3h4M14 3h4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M16 13v2a4 4 0 0 0 8 0v-1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="23" cy="13" r="1.5" fill="currentColor" />
  </svg>
);

const IdCardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="8" cy="11" r="2" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M5.5 16c.5-1.5 1.35-2.2 2.5-2.2s2 .7 2.5 2.2M13 10h5M13 14h5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const HospitalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
    <path
      d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h3a1 1 0 0 1 1 1v11M2 21h20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M10 6v5M7.5 8.5h5M7 14h1M12 14h1M7 18h1M12 18h1"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
    <path
      d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const AreaIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
    <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 2v3M12 19v3M2 12h3M19 12h3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="m4 7 8 6 8-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
    <path
      d="M7 3h3l1.5 4-2 1.5a16 16 0 0 0 6 6L17 13l4 1.5v3c0 1.1-.9 2-2 2C10.7 19.5 4.5 13.3 4.5 5c0-1.1.9-2 2-2H7Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
    <path
      d="m6 9 6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
    <path
      d="M5 12h14M13 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* -------------------- Logo -------------------- */

const Logo = () => (
  <div className="flex items-center justify-center gap-3">
    <div className="relative h-10 w-10 sm:h-12 sm:w-12">
      <span className="absolute left-0 top-[12px] h-[16px] w-[16px] rounded-[5px] bg-orange-400 sm:top-[15px] sm:h-[18px] sm:w-[18px] sm:rounded-[6px]" />
      <span className="absolute left-[12px] top-0 h-[16px] w-[16px] rounded-[5px] bg-orange-400 sm:left-[15px] sm:h-[18px] sm:w-[18px] sm:rounded-[6px]" />
      <span className="absolute left-[24px] top-[12px] h-[16px] w-[16px] rounded-[5px] bg-orange-500 sm:left-[30px] sm:top-[15px] sm:h-[18px] sm:w-[18px] sm:rounded-[6px]" />
      <span className="absolute left-[12px] top-[24px] h-[16px] w-[16px] rounded-[5px] bg-orange-500 sm:left-[15px] sm:top-[30px] sm:h-[18px] sm:w-[18px] sm:rounded-[6px]" />
    </div>

    <div className="text-[26px] font-bold tracking-[-1.2px] text-slate-900 sm:text-[30px]">
      Medi<span className="text-orange-500">QR</span>
    </div>
  </div>
);

/* -------------------- Field Wrapper -------------------- */

const FormField = ({
  icon: Icon,
  label,
  required = false,
  children,
  error,
}) => {
  return (
    <div className="relative sm:grid sm:grid-cols-[35px_minmax(0,1fr)] sm:gap-3">
      <div className="mb-2 flex h-6 w-6 items-center justify-center text-slate-600 sm:mb-0 sm:mt-8 sm:h-7 sm:w-7">
        <Icon />
      </div>

      <div className="min-w-0">
        <label className="mb-2 block text-[16px] font-semibold text-[#213653] sm:text-[18px]">
          {label}

          {required && <span className="ml-1 text-red-500">*</span>}
        </label>

        {children}

        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
};

/* -------------------- Main Component -------------------- */

export default function MrForm() {
  const [formData, setFormData] = useState({
    doctorName: "",
    speciality: "",
    doctorCode: "",
    clinicName: "",
    city: "",
    area: "",
    email: "",
    mobile: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  };

  const handleMobileChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 10);

    setFormData((previous) => ({
      ...previous,
      mobile: value,
    }));

    if (errors.mobile) {
      setErrors((previous) => ({
        ...previous,
        mobile: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.doctorName.trim()) {
      newErrors.doctorName = "Doctor name is required";
    }

    if (!formData.speciality) {
      newErrors.speciality = "Please select a speciality";
    }

    if (!formData.doctorCode.trim()) {
      newErrors.doctorCode = "Doctor code is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Enter a valid email address";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      /*
       * API WILL BE CONNECTED HERE.
       *
       * Later we will send:
       *
       * {
       *   doctorName,
       *   speciality,
       *   doctorCode,
       *   clinicName,
       *   city,
       *   area,
       *   email,
       *   mobile,
       *   qrId
       * }
       */

      console.log("Doctor registration:", formData);

      await new Promise((resolve) => setTimeout(resolve, 700));

      alert("QR successfully assigned to the doctor.");
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fafb] px-4 py-8 font-sans sm:px-6 lg:py-12">
      {/* -------------------------------- */}
      {/* Background Decorations */}
      {/* -------------------------------- */}

      <div className="pointer-events-none absolute -left-40 top-20 h-72 w-72 rounded-full bg-orange-50" />

      <div className="pointer-events-none absolute -left-28 top-[250px] h-20 w-64 -rotate-[-12deg] rounded-[50%] border-t-[8px] border-orange-400" />

      <div className="pointer-events-none absolute -right-32 bottom-8 h-64 w-64 rounded-full bg-orange-50" />

      <div className="pointer-events-none absolute -right-24 bottom-[330px] h-24 w-64 rotate-[45deg] rounded-[50%] border-t-[8px] border-orange-300" />

      {/* Top right dots */}
      <div className="pointer-events-none absolute right-8 top-64 hidden h-24 w-20 opacity-60 sm:block">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(#f6cdb6 2.5px, transparent 2.5px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Bottom left dots */}
      <div className="pointer-events-none absolute bottom-16 left-8 hidden h-24 w-20 opacity-60 sm:block">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(#f6cdb6 2.5px, transparent 2.5px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* -------------------------------- */}
      {/* Main Card */}
      {/* -------------------------------- */}

      <section className="relative z-10 mx-auto w-full max-w-[745px] rounded-[22px] bg-white px-4 py-7 shadow-[0_24px_70px_rgba(24,45,69,0.10),0_4px_20px_rgba(24,45,69,0.04)] sm:rounded-[28px] sm:px-10 sm:py-8 lg:px-[50px]">
        {/* Logo */}

        <div className="mb-6">
          <Logo />
        </div>

        {/* Header */}

        <div className="mb-8 text-center">
          <h1 className="text-[28px] font-bold leading-[1.15] tracking-[-0.8px] text-[#11233d] sm:text-[36px] lg:text-[43px]">
            Assign QR to Doctor
          </h1>

          <p className="mx-auto mt-3 max-w-[480px] text-base leading-relaxed text-slate-500 sm:text-lg lg:text-xl">
            Enter the doctor's details to activate
            <br className="hidden sm:block" />
            this QR code.
          </p>
        </div>

        {/* Form */}

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Doctor Name */}

          <FormField
            icon={DoctorIcon}
            label="Doctor Name"
            required
            error={errors.doctorName}
          >
            <input
              type="text"
              name="doctorName"
              value={formData.doctorName}
              onChange={handleChange}
              placeholder="Enter doctor's full name"
              autoComplete="name"
              className={`h-14 w-full rounded-[13px] border bg-white px-5 text-[16px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${
                errors.doctorName ? "border-red-400" : "border-slate-300"
              }`}
            />
          </FormField>

          {/* Speciality */}

          <FormField
            icon={StethoscopeIcon}
            label="Speciality"
            required
            error={errors.speciality}
          >
            <div className="relative">
              <select
                name="speciality"
                value={formData.speciality}
                onChange={handleChange}
                className={`h-14 w-full cursor-pointer appearance-none rounded-[13px] border bg-white px-5 pr-12 text-[16px] text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${
                  formData.speciality ? "text-slate-800" : "text-slate-400"
                } ${errors.speciality ? "border-red-400" : "border-slate-300"}`}
              >
                <option value="">Select Speciality</option>

                {SPECIALITIES.map((speciality) => (
                  <option key={speciality} value={speciality}>
                    {speciality}
                  </option>
                ))}
              </select>

              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-800">
                <ChevronDownIcon />
              </div>
            </div>
          </FormField>

          {/* Doctor Code */}

          <FormField
            icon={IdCardIcon}
            label="MCL Code / Doctor Code"
            required
            error={errors.doctorCode}
          >
            <input
              type="text"
              name="doctorCode"
              value={formData.doctorCode}
              onChange={handleChange}
              placeholder="Enter MCL code or doctor code"
              className={`h-14 w-full rounded-[13px] border bg-white px-5 text-[16px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${
                errors.doctorCode ? "border-red-400" : "border-slate-300"
              }`}
            />
          </FormField>

          {/* Clinic / Hospital */}

          <FormField icon={HospitalIcon} label="Clinic / Hospital Name">
            <input
              type="text"
              name="clinicName"
              value={formData.clinicName}
              onChange={handleChange}
              placeholder="Enter clinic or hospital name"
              className="h-14 w-full rounded-[13px] border border-slate-300 bg-white px-5 text-[16px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </FormField>

          {/* City */}

          <FormField
            icon={LocationIcon}
            label="City"
            required
            error={errors.city}
          >
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter city name"
              className={`h-14 w-full rounded-[13px] border bg-white px-5 text-[16px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${
                errors.city ? "border-red-400" : "border-slate-300"
              }`}
            />
          </FormField>

          {/* Area */}

          <FormField icon={AreaIcon} label="Area / Locality">
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="Enter area or locality"
              className="h-14 w-full rounded-[13px] border border-slate-300 bg-white px-5 text-[16px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </FormField>

          {/* Email */}

          <FormField icon={EmailIcon} label="Email ID" error={errors.email}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              autoComplete="email"
              className={`h-14 w-full rounded-[13px] border bg-white px-5 text-[16px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${
                errors.email ? "border-red-400" : "border-slate-300"
              }`}
            />
          </FormField>

          {/* Mobile */}

          <FormField
            icon={PhoneIcon}
            label="Mobile Number"
            required
            error={errors.mobile}
          >
            <div className="grid grid-cols-[95px_minmax(0,1fr)] gap-2 sm:grid-cols-[120px_minmax(0,1fr)]">
              {/* Country code */}

              <div className="flex h-14 items-center justify-between rounded-[13px] border border-slate-300 bg-white px-4 text-[16px] text-slate-800">
                <span>+91</span>

                <ChevronDownIcon />
              </div>

              {/* Mobile number */}

              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleMobileChange}
                placeholder="Enter mobile number"
                inputMode="numeric"
                autoComplete="tel"
                className={`h-14 min-w-0 rounded-[13px] border bg-white px-4 text-[16px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 sm:px-5 ${
                  errors.mobile ? "border-red-400" : "border-slate-300"
                }`}
              />
            </div>
          </FormField>

          {/* Submit Button */}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-[13px] bg-gradient-to-r from-orange-500 to-orange-400 text-[17px] font-bold text-white shadow-[0_9px_24px_rgba(255,116,51,0.20)] transition hover:-translate-y-[1px] hover:shadow-[0_12px_28px_rgba(255,116,51,0.27)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:ml-[43px] sm:h-16 sm:w-[calc(100%-43px)] sm:rounded-[14px] sm:text-[20px]"
          >
            <span>
              {isSubmitting ? "Assigning QR..." : "Assign QR to Doctor"}
            </span>

            {!isSubmitting && <ArrowRightIcon />}
          </button>
        </form>
      </section>
    </main>
  );
}

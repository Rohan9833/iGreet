import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { registerDoctor } from "../api/doctor.api";
import {
  UserRound,
  Stethoscope,
  IdCard,
  Hospital,
  MapPin,
  LocateFixed,
  Mail,
  Phone,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

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

/* -------------------- Logo -------------------- */

const Logo = () => (
  <div className="flex items-center justify-center gap-3">
    <div className="relative h-8 w-8 sm:h-12 sm:w-12">
      <span className="absolute left-0 top-[10px] h-[13px] w-[13px] rounded-[4px] bg-orange-400 sm:top-[15px] sm:h-[18px] sm:w-[18px] sm:rounded-[6px]" />
      <span className="absolute left-[10px] top-0 h-[13px] w-[13px] rounded-[5px] bg-orange-400 sm:left-[15px] sm:h-[18px] sm:w-[18px] sm:rounded-[6px]" />
      <span className="absolute left-[20px] top-[10px] h-[13px] w-[13px] rounded-[5px] bg-orange-500 sm:left-[30px] sm:top-[15px] sm:h-[18px] sm:w-[18px] sm:rounded-[6px]" />
      <span className="absolute left-[10px] top-[20px] h-[13px] w-[13px] rounded-[5px] bg-orange-500 sm:left-[15px] sm:top-[30px] sm:h-[18px] sm:w-[18px] sm:rounded-[6px]" />
    </div>

    <div className="text-[26px] font-bold tracking-[-1.2px] text-slate-900 text-[22px] sm:text-[30px]">
      <span className="text-orange-500"> Medi</span>Greetings
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
    <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-2 sm:grid-cols-[35px_minmax(0,1fr)] sm:gap-3">
      <div className="mt-6 flex h-5 w-5 items-center justify-center text-slate-600 sm:mt-8 sm:h-7 sm:w-7">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>

      <div className="min-w-0">
        <label className="mb-1 block text-[13px] font-semibold text-[#213653] sm:mb-2 sm:text-[18px]">
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qrToken = searchParams.get("qrToken") || "";

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

    if (!qrToken) {
      alert("This registration page was not opened from a valid QR code.");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerDoctor({ qrToken, ...formData });
      // alert("QR successfully assigned to the doctor.");
      navigate(`/doctor?qrToken=${encodeURIComponent(qrToken)}`, {
        replace: true,
      });
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fafb] px-1.5 py-2 font-sans sm:px-6 sm:py-8 lg:py-12">
      <div className="pointer-events-none absolute -left-40 top-20 h-72 w-72 rounded-full bg-orange-50" />
      <div className="pointer-events-none absolute -left-28 top-[250px] h-20 w-64 -rotate-[-12deg] rounded-[50%] border-t-[8px] border-orange-400" />
      <div className="pointer-events-none absolute -right-32 bottom-8 h-64 w-64 rounded-full bg-orange-50" />
      <div className="pointer-events-none absolute -right-24 bottom-[330px] h-24 w-64 rotate-[45deg] rounded-[50%] border-t-[8px] border-orange-300" />

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

      <section className="relative z-10 mx-auto w-[85vw] max-w-[745px] rounded-[18px] bg-white px-3 py-3.5 shadow-[0_24px_70px_rgba(24,45,69,0.10),0_4px_20px_rgba(24,45,69,0.04)] sm:rounded-[28px] sm:px-10 sm:py-8 lg:px-[50px]">
        <div className="mb-2.5 sm:mb-6">
          <Logo />
        </div>

        <div className="mb-4 text-center sm:mb-8">
          <h1 className="text-[22px] font-bold leading-[1.15] tracking-[-0.8px] text-[#11233d] sm:text-[36px] lg:text-[43px]">
            Assign QR to Doctor
          </h1>

          <p className="mx-auto mt-1 max-w-[480px] text-[11px] leading-relaxed text-slate-500 sm:mt-3 sm:text-lg lg:text-xl">
            Enter the doctor's details to activate
            <br className="hidden sm:block" />
            this QR code.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-6">
          <FormField
            icon={UserRound}
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
              className={`h-10 w-full rounded-[9px] border bg-white px-3 text-[12px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 sm:h-14 sm:rounded-[13px] sm:px-5 sm:text-[16px] ${
                errors.doctorName ? "border-red-400" : "border-slate-300"
              }`}
            />
          </FormField>

          <FormField
            icon={Stethoscope}
            label="Speciality"
            required
            error={errors.speciality}
          >
            <div className="relative">
              <select
                name="speciality"
                value={formData.speciality}
                onChange={handleChange}
                className={`h-10 w-full cursor-pointer appearance-none rounded-[9px] border bg-white px-3 pr-9 text-[13px] text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 sm:h-14 sm:rounded-[13px] sm:px-5 sm:pr-12 sm:text-[16px] ${
                  formData.speciality ? "text-slate-800" : "text-slate-400"
                } ${
                  errors.speciality ? "border-red-400" : "border-slate-300"
                }`}
              >
                <option value="">Select Speciality</option>
                {SPECIALITIES.map((speciality) => (
                  <option key={speciality} value={speciality}>
                    {speciality}
                  </option>
                ))}
              </select>

              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-800 sm:right-4">
                <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
          </FormField>

          <FormField
            icon={IdCard}
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
              className={`h-[50px] w-full rounded-[11px] border bg-white px-4 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 sm:h-14 sm:rounded-[13px] sm:px-5 sm:text-[16px] ${
                errors.doctorCode ? "border-red-400" : "border-slate-300"
              }`}
            />
          </FormField>

          <FormField icon={Hospital} label="Clinic / Hospital Name">
            <input
              type="text"
              name="clinicName"
              value={formData.clinicName}
              onChange={handleChange}
              placeholder="Enter clinic or hospital name"
              className="h-10 w-full rounded-[9px] border border-slate-300 bg-white px-3 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 sm:h-14 sm:rounded-[13px] sm:px-5 sm:text-[16px]"
            />
          </FormField>

          <FormField
            icon={MapPin}
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
              className={`h-[50px] w-full rounded-[11px] border bg-white px-4 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 sm:h-14 sm:rounded-[13px] sm:px-5 sm:text-[16px] ${
                errors.city ? "border-red-400" : "border-slate-300"
              }`}
            />
          </FormField>

          <FormField icon={LocateFixed} label="Area / Locality">
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="Enter area or locality"
              className="h-10 w-full rounded-[9px] border border-slate-300 bg-white px-3 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 sm:h-14 sm:rounded-[13px] sm:px-5 sm:text-[16px]"
            />
          </FormField>

          <FormField icon={Mail} label="Email ID" error={errors.email}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              autoComplete="email"
              className={`h-[50px] w-full rounded-[11px] border bg-white px-4 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 sm:h-14 sm:rounded-[13px] sm:px-5 sm:text-[16px] ${
                errors.email ? "border-red-400" : "border-slate-300"
              }`}
            />
          </FormField>

          <FormField
            icon={Phone}
            label="Mobile Number"
            required
            error={errors.mobile}
          >
            <div className="grid grid-cols-[65px_minmax(0,1fr)] gap-2 sm:grid-cols-[120px_minmax(0,1fr)]">
              <div className="flex h[50px] items-center justify-between rounded-[9px] border border-slate-300 bg-white px-2.5 text-[13px] text-slate-800 sm:h-14 sm:rounded-[13px] sm:px-4 sm:text-[16px]">
                <span>+91</span>
                <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>

              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleMobileChange}
                placeholder="Enter mobile number"
                inputMode="numeric"
                autoComplete="tel"
                className={`h-[50px] min-w-0 rounded-[11px] border bg-white px-3 text-[12px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 sm:h-14 sm:rounded-[13px] sm:px-5 sm:text-[16px] ${
                  errors.mobile ? "border-red-400" : "border-slate-300"
                }`}
              />
            </div>
          </FormField>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-[9px] bg-gradient-to-r from-orange-500 to-orange-400 text-[14px] font-bold text-white shadow-[0_9px_24px_rgba(255,116,51,0.20)] transition hover:-translate-y-[1px] hover:shadow-[0_12px_28px_rgba(255,116,51,0.27)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:ml-[43px] sm:h-16 sm:w-[calc(100%-43px)] sm:rounded-[14px] sm:gap-3 sm:text-[20px]"
          >
            <span>
              {isSubmitting ? "Assigning QR..." : "Assign QR to Doctor"}
            </span>

            {!isSubmitting && <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />}
          </button>
        </form>
      </section>
    </main>
  );
}

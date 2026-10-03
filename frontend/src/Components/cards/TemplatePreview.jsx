// import React from "react";
// import TeachersDayCard from "./TeachersDayCard";
// import IndependenceDayCard from "./IndependenceDayCard";
// import DussehraCard from "./DussehraCard";
// import AnniversaryCard from "./AnniversaryCard";

// const TemplatePreview = ({
//   template,
//   width,
//   receiverName,
//   senderName,
//   imageUrl,
// }) => {
//   const common = { width, receiverName, senderName, imageUrl };

//   switch (template.id) {
//     case "teachers-day":
//       return <TeachersDayCard {...common} />;
//     case "independence-day":
//       return <IndependenceDayCard {...common} width={400} />;
//     case "dussehra":
//       return <DussehraCard {...common} />;
//     case "anniversary":
//       return <AnniversaryCard {...common} />;
//     default:
//       return null;
//   }
// };

// export default TemplatePreview;

import React from "react";
import TeachersDayCard from "./TeachersDayCard";
import IndependenceDayCard from "./IndependenceDayCard";
import DussehraCard from "./DussehraCard";
import AnniversaryCard from "./AnniversaryCard";

const TemplatePreview = ({
  template,
  width,
  receiverName,
  senderName,
  imageUrl,
}) => {
  const common = { width, receiverName, senderName, imageUrl };

  switch (template.id) {
    case "teachers-day":
      return <TeachersDayCard {...common} />;
    case "independence-day":
      // width override hata diya: preview me parent ki width, export me 900
      return <IndependenceDayCard {...common} />;
    case "dussehra":
      return <DussehraCard {...common} />;
    case "anniversary":
      return <AnniversaryCard {...common} />;
    default:
      return null;
  }
};

export default TemplatePreview;
import { formatDate } from '@angular/common';

export function AnnotationPropertyToDisplayObject(p) {
  switch (p[0]) {
    case "_id":
      return { name: "ID", value: p[1] };
      break;
    case "type":
      return { name: "Type", value: p[1] };
      break;
    case "annotator_id":
      return { name: "Annotator ID", value: p[1] };
      break;
    case "spans":
      return {
        name: "Spans", value: p[1].map(e =>
          e.start.toString() + ":" + e.end.toString() + " [\"" + e.segment + "\"]"
        ).join("\n")
      };
      break;
    case "attributes":
      return {
        name: "Attributes", value: p[1].map(e =>
          e.name + " - \"" + e.value + "\""
        ).join("\n")
      };
      break;
    case "document_attribute":
      return { name: "Document Attribute", value: p[1] };
      break;
    case "collection_setting":
      return { name: "Collection Setting", value: p[1] };
      break;
    case "document_setting":
      return { name: "Document Setting", value: p[1] };
      break;
    case "created_by":
      return { name: "Created By", value: p[1] };
      break;
    case "updated_by":
      return { name: "Updated By", value: p[1] };
      break;
    case "created_at":
      return {
        name: "Created At",
        value: formatDate(p[1], 'd/M/YYYY, HH:mm:ss', 'en-GB')
      };
      break;
    case "updated_at":
      return {
        name: "Updated At",
        value: formatDate(p[1], 'd/M/YYYY, HH:mm:ss', 'en-GB')
      };
      break;
    case "owner_id":
    case "document_id":
    case "collection_id":
      return null;
      break;
    default:
      return { name: p[0], value: JSON.stringify(p[1]) };
      break;
  }
}; /* AnnotationPropertyToDisplayObject */

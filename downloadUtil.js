/**
 * Download utilities for handling various file download scenarios
 * Supports URL downloads, base64 content, blob data, and data URLs
 */

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size string
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return "";
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Get appropriate file icon based on file extension
 * @param {string} fileName - Name of the file
 * @returns {string} Emoji icon for the file type
 */
export const getFileIcon = (fileName) => {
  if (!fileName) return "📎";

  const extension = fileName.split(".").pop()?.toLowerCase();
  const iconMap = {
    // Documents
    pdf: "📄",
    doc: "📝",
    docx: "📝",
    txt: "📃",
    rtf: "📃",

    // Spreadsheets
    xls: "📊",
    xlsx: "📊",
    csv: "📋",
    ods: "📊",

    // Presentations
    ppt: "📈",
    pptx: "📈",
    odp: "📈",

    // Images
    jpg: "🖼️",
    jpeg: "🖼️",
    png: "🖼️",
    gif: "🖼️",
    bmp: "🖼️",
    svg: "🖼️",
    webp: "🖼️",

    // Audio
    mp3: "🎵",
    wav: "🎵",
    flac: "🎵",
    aac: "🎵",
    ogg: "🎵",

    // Video
    mp4: "🎬",
    avi: "🎬",
    mkv: "🎬",
    mov: "🎬",
    wmv: "🎬",
    webm: "🎬",

    // Archives
    zip: "🗜️",
    rar: "🗜️",
    "7z": "🗜️",
    tar: "🗜️",
    gz: "🗜️",

    // Code files
    js: "💻",
    jsx: "💻",
    ts: "💻",
    tsx: "💻",
    py: "💻",
    java: "💻",
    cpp: "💻",
    c: "💻",
    html: "💻",
    css: "💻",
    php: "💻",
    rb: "💻",
    go: "💻",
    rs: "💻",

    // Data files
    json: "📊",
    xml: "📊",
    sql: "📊",
    db: "📊",

    // Others
    exe: "⚙️",
    dmg: "💿",
    iso: "💿",
    apk: "📱",
    ipa: "📱",
  };

  return iconMap[extension] || "📎";
};

/**
 * Get MIME type based on file extension
 * @param {string} fileName - Name of the file
 * @returns {string} MIME type
 */
export const getMimeType = (fileName) => {
  if (!fileName) return "application/octet-stream";

  const extension = fileName.split(".").pop()?.toLowerCase();
  const mimeMap = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain",
    csv: "text/csv",
    json: "application/json",
    xml: "application/xml",
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    svg: "image/svg+xml",
    mp3: "audio/mpeg",
    mp4: "video/mp4",
    avi: "video/x-msvideo",
  };

  return mimeMap[extension] || "application/octet-stream";
};

/**
 * Download file from URL with proper error handling
 * @param {string} url - File URL
 * @param {string} fileName - Desired file name
 * @returns {Promise<boolean>} Success status
 */
export const downloadFromUrl = async (url, fileName = "download") => {
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    // Append to body temporarily for Firefox compatibility
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error("Download from URL failed:", error);
    return false;
  }
};

/**
 * Download file from base64 content
 * @param {string} base64Content - Base64 encoded file content
 * @param {string} fileName - Desired file name
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<boolean>} Success status
 */
export const downloadFromBase64 = async (
  base64Content,
  fileName = "download",
  mimeType = "application/octet-stream"
) => {
  try {
    // Remove data URL prefix if present
    const cleanBase64 = base64Content.replace(/^data:[^;]+;base64,/, "");

    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    return downloadFromBlob(blob, fileName);
  } catch (error) {
    console.error("Download from base64 failed:", error);
    return false;
  }
};

/**
 * Download file from blob
 * @param {Blob} blob - File blob
 * @param {string} fileName - Desired file name
 * @returns {Promise<boolean>} Success status
 */
export const downloadFromBlob = async (blob, fileName = "download") => {
  try {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the object URL
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Download from blob failed:", error);
    return false;
  }
};

/**
 * Download file from data URL
 * @param {string} dataUrl - Data URL
 * @param {string} fileName - Desired file name
 * @returns {Promise<boolean>} Success status
 */
export const downloadFromDataUrl = async (dataUrl, fileName = "download") => {
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return downloadFromBlob(blob, fileName);
  } catch (error) {
    console.error("Download from data URL failed:", error);
    return false;
  }
};

/**
 * Main download handler that automatically detects the content type and handles accordingly
 * @param {Object} fileData - File data object
 * @param {string} fileData.name - File name
 * @param {string} fileData.url - File URL (optional)
 * @param {string} fileData.content - File content (base64 or data URL) (optional)
 * @param {string} fileData.contentType - MIME type (optional)
 * @param {string} fileData.type - File type/extension (optional)
 * @returns {Promise<boolean>} Success status
 */
export const downloadFile = async (fileData) => {
  try {
    const fileName = fileData.name || "download";
    const mimeType =
      fileData.contentType || fileData.type || getMimeType(fileName);

    // Priority 1: Direct URL download
    if (fileData.url) {
      return await downloadFromUrl(fileData.url, fileName);
    }

    // Priority 2: Content-based download
    if (fileData.content) {
      // Handle data URLs
      if (fileData.content.startsWith("data:")) {
        return await downloadFromDataUrl(fileData.content, fileName);
      }

      // Handle blob URLs
      if (fileData.content.startsWith("blob:")) {
        return await downloadFromUrl(fileData.content, fileName);
      }

      // Handle base64 content
      return await downloadFromBase64(fileData.content, fileName, mimeType);
    }

    throw new Error("No valid download source found (url or content)");
  } catch (error) {
    console.error("Download failed:", error);
    return false;
  }
};

/**
 * Validate file data structure
 * @param {Object} fileData - File data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateFileData = (fileData) => {
  const errors = [];

  if (!fileData || typeof fileData !== "object") {
    return { isValid: false, errors: ["File data must be an object"] };
  }

  if (!fileData.name && !fileData.url && !fileData.content) {
    errors.push("At least one of name, url, or content must be provided");
  }

  if (!fileData.url && !fileData.content) {
    errors.push("Either url or content must be provided for download");
  }

  if (fileData.content && fileData.content.length === 0) {
    errors.push("Content cannot be empty");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  formatFileSize,
  getFileIcon,
  getMimeType,
  downloadFromUrl,
  downloadFromBase64,
  downloadFromBlob,
  downloadFromDataUrl,
  downloadFile,
  validateFileData,
};

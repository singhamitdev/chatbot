import React, { useEffect, useRef, useState } from "react";

const HtmlDocumentViewer = ({ htmlContent }) => {
  const iframeRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState(500);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;

      doc.open();
      doc.write(htmlContent);
      doc.close();

      const adjustHeight = () => {
        const body = doc.body;
        const html = doc.documentElement;
        const height = Math.max(
          // body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight
        );
        setIframeHeight(height);
      };

      // Wait for content to render
      iframe.onload = adjustHeight;
      setTimeout(adjustHeight, 300); // fallback in case onload doesn't fire
    }
  }, [htmlContent]);

  return (
    <iframe
      ref={iframeRef}
      title="HTML Document"
      style={{
        width: "100%",
        height: `${iframeHeight}px`,
        border: "none",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
      }}
    />
  );
};

export default HtmlDocumentViewer;

import React, {
  forwardRef,
  useState,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { DrawIoEmbed } from "react-drawio";

const unwrapXml = (wrapped) => {
  try {
    console.log("🔍 Unwrapping XML:", wrapped);
    if (typeof wrapped !== "string" || !wrapped.includes("<mxfile")) {
      console.warn("unwrapXml received non-XML input.");
      return "";
    }
    
    const match = wrapped.match(/<diagram[^>]*>([\s\S]*?)<\/diagram>/);
    if (!match) return wrapped;

    const encoded = match[1];
    const decoded = decodeURIComponent(escape(atob(encoded)));
    return decoded;
  } catch (err) {
    console.error("Failed to unwrap XML:", err);
    return wrapped;
  }
};

const DndDrawioEditor = forwardRef(({ initialDiagram = {}, mode = "edit", onChange }, ref) => {
  const initialXml = typeof initialDiagram.xml === "string" ? initialDiagram.xml : "";
  const [xmlData, setXmlData] = useState(initialXml);
  const latestXmlRef = useRef(initialXml);
  const iframeRef = useRef(null);
  const hasInitialized = useRef(false);


  // Expose getXml to parent component
  useImperativeHandle(ref, () => ({
    getXml: () => unwrapXml(latestXmlRef.current),
  }));

  useEffect(() => {
    if (initialDiagram.xml) {
      setXmlData(initialDiagram.xml);
      latestXmlRef.current = initialDiagram.xml;
      hasInitialized.current = true;
    }
  }, [initialDiagram.xml]);

  const handleConfigure = () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const configMsg = {
      action: "configure",
      config: {
        page: true,
        pageScale: 1,
        pageWidth: 1169, // A4 landscape width (px)
        pageHeight: 827, // A4 landscape height (px)
        math: true,
        grid: true,
        guides: true,
        autoSaveDelay: 5,
      },
    };

    iframe.contentWindow.postMessage(configMsg, "*");
  };

  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
  
        if (data.event === "init") {
          handleConfigure(); // Configure page settings on init
        }
        
        if (
          event.origin.includes("draw.io") &&
          data &&
          typeof data === "object" &&
          (data.event === "save" || data.event === "autosave") &&
          typeof data.xml === "string"
        ) {
          latestXmlRef.current = data.xml;
          setXmlData(data.xml);
  
          if (typeof onChange === "function") {
            onChange({ xml: data.xml });
          }
        }
      } catch (err) {
        console.error("Failed to parse message data:", err);
      }
    };
  
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onChange]);
  
  const handleSave = (data) => {
    const xml = typeof data === "object" && data.xml ? data.xml : data;
  
    latestXmlRef.current = xml;
    setXmlData(xml);
  
    if (typeof onChange === "function") {
        onChange(xml);
    }
  };
  

  return (
    <>
      <div style={{ width: "100%", height: "700px", marginTop: "1rem" }}>
        <DrawIoEmbed
        ref={iframeRef}
        xml={xmlData}
        onSave={handleSave}
        config={{
          embed: 1,
          ui: mode === "view" ? "min" : "sketch",
          readOnly: mode === "view" ? 1 : 0,
          spin: 1,
          saveAndExit: 1,
          autosave: 1,
          libs: "general;flowchart;er",
        }}
        style={{ width: "100%", height: "100%" }} />
      </div>
    </>
  );
});

export default DndDrawioEditor;

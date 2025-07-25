import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";

const SAVE_INTERVAL_MS = 2000;

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];

export default function EditorPage() {
  const { id: documentId } = useParams();
  const wrapperRef = useRef();
  const socketRef = useRef();
  const quillRef = useRef();

  useEffect(() => {
    // ✅ Socket connect
    const socket = io("http://localhost:5000");
    socketRef.current = socket;

    // ✅ Quill setup
    const editorContainer = document.createElement("div");
    wrapperRef.current.innerHTML = "";
    wrapperRef.current.append(editorContainer);

    const quill = new Quill(editorContainer, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });
    quillRef.current = quill;

    quill.disable();
    quill.setText("Loading...");

    // ✅ Load document from backend
    socket.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
    });

    socket.emit("get-document", documentId);

    // ✅ Send changes
    quill.on("text-change", (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    });

    // ✅ Receive changes
    socket.on("receive-changes", (delta) => {
      quill.updateContents(delta);
    });

    // ✅ Save document every 2 seconds
    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, SAVE_INTERVAL_MS);

    // ✅ Clean-up
    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [documentId]); // ✅ include documentId dependency

  return <div className="container" ref={wrapperRef}></div>;
}

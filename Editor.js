import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Quill from "quill";

import "quill/dist/quill.snow.css"; // ✅ Quill ke design ke liye

let socket;
let quill;

export default function Editor() {
  const { id: documentId } = useParams();

  useEffect(() => {
    const quillContainer = document.createElement("div");
    document.body.appendChild(quillContainer);

    quill = new Quill(quillContainer, {
      theme: "snow",
    });

    quillContainer.style.margin = "50px";

    return () => {
      document.body.removeChild(quillContainer);
    };
  }, []);

  useEffect(() => {
    socket = io("http://localhost:5000");

    socket.on("connect", () => {
      socket.emit("get-document", documentId);
    });

    socket.on("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
    });

    return () => {
      socket.disconnect();
    };
  }, [documentId]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };

    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, []);

  useEffect(() => {
    if (socket == null || quill == null) return;

    socket.on("receive-changes", (delta) => {
      quill.updateContents(delta);
    });

    return () => {
      socket.off("receive-changes");
    };
  }, []);

  return <div id="editor" style={{ margin: "20px" }} />;
}
  useEffect(() => {
    if (socket == null || quill == null) return;

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, 2000); // ⏱ Har 2 second me save karega

    return () => {
      clearInterval(interval);
    };
  }, []);

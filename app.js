import React, { useEffect, useRef, useState } from "react";
import Quill from "quill";
import { io } from "socket.io-client";
import "quill/dist/quill.snow.css";

const SAVE_INTERVAL_MS = 2000;

function App() {
  const editorRef = useRef(null);
  const socketRef = useRef();
  const [quill, setQuill] = useState();

  useEffect(() => {
    socketRef.current = io("http://localhost:3001");
    return () => socketRef.current.disconnect();
  }, []);

  useEffect(() => {
    if (!socketRef.current || !quill) return;

    const handler = delta => {
      quill.updateContents(delta);
    };

    socketRef.current.on("receive-changes", handler);

    return () => {
      socketRef.current.off("receive-changes", handler);
    };
  }, [quill]);

  useEffect(() => {
    if (!socketRef.current || !quill) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socketRef.current.emit("send-changes", delta);
    };

    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [quill]);

  useEffect(() => {
    const q = new Quill(editorRef.current, {
      theme: "snow",
    });
    q.disable();
    q.setText("Loading...");
    setQuill(q);
  }, []);

  return <div className="container" ref={editorRef}></div>;
}

export default App;

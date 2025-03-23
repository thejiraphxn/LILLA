"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "/node_modules/react-syntax-highlighter";
import { dracula } from "/node_modules/react-syntax-highlighter/dist/esm/styles/prism";

type Message = {
  text: string;
  sender: "user" | "bot";
};

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await fetch("http://127.0.0.1:5001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessage = "";
      setMessages([...newMessages, { text: "", sender: "bot" }]); // Add empty bot message
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        try {
          const jsonObjects = chunk.split("\n").filter((line) => line.trim() !== "").map(JSON.parse);
          jsonObjects.forEach((jsonObj) => {
            if (jsonObj.response) {
              botMessage += jsonObj.response;
              setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages];
                updatedMessages[updatedMessages.length - 1] = { text: botMessage, sender: "bot" };
                return updatedMessages;
              });
            }
          });
        } catch (e) {
          console.error("Error parsing JSON stream:", e);
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      setMessages([...newMessages, { text: "Error connecting to the bot.", sender: "bot" }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col max-w-screen mx-auto h-screen p-4 bg-zinc-800">
      <div className="grid grid-cols-1 bg-zinc-800 pb-4 justify-items-center">
        <h3 className="text-white">
          LILLA Chat (Llama 3.2 Model)
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto rounded-lg p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-3xl my-2 ${msg.sender === "user" ? "bg-zinc-600 text-white justify-self-end" : "bg-gray-300 text-black justify-self-start"} px-4 py-3`}
          >
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter style={dracula} language={match[1]} PreTag="div" {...props}>
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-zinc-700 px-2 py-1 rounded-lg text-white text-sm font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {msg.text}
            </ReactMarkdown>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex mt-4 p-4">
        <input
          type="text"
          className="flex-1 p-5 bg-zinc-600 rounded-2xl text-white focus:outline-none focus:ring-0"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your question here"
        />
        <button hidden className="ml-2 p-5 bg-zinc-600 text-white rounded-2xl hover:bg-zinc-700 ease-in ease-out duration-200 cursor-pointer" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;

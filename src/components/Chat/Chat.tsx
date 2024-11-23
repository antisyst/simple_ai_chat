import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Message from "../Message/Message";
import styles from "./Chat.module.scss";

interface Message {
  prompt: string;
  response: string;
  isGenerating: boolean;
  hasAnimated: boolean;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("chatHistory");
    if (saved) {
      const parsed: Message[] = JSON.parse(saved);
      return parsed.map((msg) => ({ ...msg, hasAnimated: true }));
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const newMessage: Message = { prompt: input, response: "", isGenerating: true, hasAnimated: false };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsGenerating(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch("https://api.cohere.ai/v1/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer fXzcYyUOXqbUqzarYPhzFp2C21qGhj1V3orIzslW`,
        },
        body: JSON.stringify({
          prompt: input,
          model: "command-xlarge-nightly",
          max_tokens: 500,
        }),
        signal: controller.signal,
      });

      const data = await response.json();
      const generatedText = data.generations[0].text.trim();

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          response: generatedText,
          isGenerating: false,
        };
        return updated;
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            response: "Generation stopped by user.",
            isGenerating: false,
          };
          return updated;
        });
      } else {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            response: "Error generating response.",
            isGenerating: false,
          };
          return updated;
        });
      }
    } finally {
      setIsGenerating(false);
      setAbortController(null);
    }
  };

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem("chatHistory");
  };

  return (
    <div className={styles.chat}>
      <header className={styles.header}>
        <span>AI Chat Bot</span>
        {messages.length > 0 && (
          <button onClick={handleClearChat} className={styles.clearButton}>
            Clear Chat
          </button>
        )}
      </header>
      <motion.div className={styles.messages}>
        {messages.length === 0 ? (
          <div className={styles.emptyChat}>Chat is empty</div>
        ) : (
          messages.map((msg, index) => (
            <Message
              key={index}
              prompt={msg.prompt}
              response={msg.response}
              isGenerating={msg.isGenerating}
              hasAnimated={msg.hasAnimated}
              onAnimationComplete={() => {
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[index] = { ...updated[index], hasAnimated: true };
                  return updated;
                });
              }}
            />
          ))
        )}
        <div ref={chatEndRef} />
      </motion.div>
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className={styles.input}
          disabled={isGenerating}
        />
        <button
          onClick={isGenerating ? handleStop : handleSend}
          className={styles.sendButton}         
        >
          {isGenerating ? "Stop" : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Chat;

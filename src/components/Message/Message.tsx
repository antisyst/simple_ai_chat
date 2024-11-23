import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import styles from "./Message.module.scss";

interface MessageProps {
  prompt: string;
  response: string;
  isGenerating: boolean;
  hasAnimated: boolean;
  onAnimationComplete: () => void;
}

const Message: React.FC<MessageProps> = ({ prompt, response, isGenerating, hasAnimated, onAnimationComplete }) => {
  const [displayedResponse, setDisplayedResponse] = useState("");

  useEffect(() => {
    if (!isGenerating && !hasAnimated && response !== "Error generating response.") {
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedResponse((prev) => prev + response.charAt(index));
        index++;
        if (index >= response.length) {
          clearInterval(interval);
          onAnimationComplete();
        }
      }, 0.1); 
      return () => clearInterval(interval);
    } else if (hasAnimated || response === "Error generating response.") {
      setDisplayedResponse(response);
    }
  }, [response, isGenerating, hasAnimated, onAnimationComplete]);

  const [dots, setDots] = useState(".");
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length < 3 ? prev + "." : "."));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const formattedResponse = displayedResponse.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br />");

  return (
    <>
      <motion.div
        className={`${styles.message} ${styles.userMessage}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {prompt}
      </motion.div>
      <motion.div
        className={`${styles.message} ${styles.botMessage}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {isGenerating ? (
          <div className={styles.generating}>Generating{dots}</div>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: formattedResponse }} />
        )}
      </motion.div>
    </>
  );
};

export default Message;
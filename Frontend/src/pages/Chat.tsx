import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MainLayout, PageContainer } from "../layouts/MainLayout";
import { Button, Input, Card } from "../components/ui";
import { useChatStore } from "../store";
import { MOCK_ARTWORKS } from "../data/mockData";

const Chat: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { currentSession, createSession, addMessage, botResponse } = useChatStore();
  const [suggestedArtworks, setSuggestedArtworks] = useState<typeof MOCK_ARTWORKS>([]);

  useEffect(() => {
    createSession();
    // Initial bot greeting
    const greeting: any = {
      id: "initial",
      sender: "bot" as const,
      content: "Hi! I'm your AI art companion. Tell me what kind of art you're interested in, and I'll help you discover amazing pieces! 🎨",
      timestamp: new Date().toISOString(),
    };
    addMessage(greeting);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || isLoading) return;

    setIsLoading(true);
    const userMsg = messageInput;
    setMessageInput("");

    try {
      // Add user message
      addMessage({
        id: `msg_${Date.now()}`,
        sender: "user",
        content: userMsg,
        timestamp: new Date().toISOString(),
      });

      // Simulate bot response
      await botResponse(userMsg);

      // Suggest artworks
      const suggested = MOCK_ARTWORKS.slice(
        Math.floor(Math.random() * MOCK_ARTWORKS.length),
        Math.floor(Math.random() * MOCK_ARTWORKS.length) + 3
      );
      setSuggestedArtworks(suggested);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <PageContainer className="pt-20 pb-12">
        <div className="h-screen flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              AI Art Assistant
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Get personalized art recommendations powered by AI
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
            {/* Chat Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 flex flex-col bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {currentSession?.messages.map((message, idx) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-3 rounded-lg ${
                          message.sender === "user"
                            ? "bg-indigo-600 text-white rounded-br-none"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2"
                  >
                    <div className="w-3 h-3 rounded-full bg-gray-400 animate-bounce" />
                    <div className="w-3 h-3 rounded-full bg-gray-400 animate-bounce delay-100" />
                    <div className="w-3 h-3 rounded-full bg-gray-400 animate-bounce delay-200" />
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Artworks Mini Preview */}
              {suggestedArtworks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-6 py-4 bg-indigo-50 dark:bg-indigo-900/20 border-t border-gray-200 dark:border-gray-700"
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Suggestions:
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {suggestedArtworks.map((art) => (
                      <motion.div
                        key={art.id}
                        whileHover={{ scale: 1.05 }}
                        className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-600"
                      >
                        <img
                          src={art.image}
                          alt={art.title}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Input Area */}
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                onSubmit={handleSendMessage}
                className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about art, style, or find recommendations..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="md"
                    disabled={isLoading || !messageInput.trim()}
                  >
                    Send
                  </Button>
                </div>
              </motion.form>
            </motion.div>

            {/* Quick Actions Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1 space-y-4 max-h-96 lg:max-h-none overflow-y-auto"
            >
              <Card className="p-6">
                <h3 className="font-bold mb-4 text-gray-900 dark:text-white">
                  Quick Questions
                </h3>
                <div className="space-y-2">
                  {[
                    "What art styles are trending now?",
                    "Show me affordable artworks",
                    "Find abstract digital art",
                    "Artists with most followers",
                    "Best artwork for portfolios",
                  ].map((question, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ x: 4 }}
                      onClick={() => {
                        setMessageInput(question);
                        setTimeout(
                          () =>
                            handleSendMessage({
                              preventDefault: () => {},
                            } as any),
                          0
                        );
                      }}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-all"
                    >
                      {question}
                    </motion.button>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold mb-4 text-gray-900 dark:text-white">
                  💡 Tips
                </h3>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
                  <li>• Be specific about your preferences</li>
                  <li>• Ask for recommendations by budget</li>
                  <li>• Search by artist or style</li>
                  <li>• Compare artworks easily</li>
                </ul>
              </Card>
            </motion.div>
          </div>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default Chat;

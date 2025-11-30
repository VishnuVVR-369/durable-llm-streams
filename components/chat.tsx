"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { ArrowUp, Bot, MessageSquarePlus, User, Zap } from "lucide-react";
import { nanoid } from "nanoid";
import { useQueryState } from "nuqs";
import { useEffect, useMemo, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import { createResumableTransport } from "@/components/transports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Chat({
  initialHistory,
}: {
  initialHistory: Record<string, UIMessage[]>;
}) {
  const [input, setInput] = useState("");
  const [messageId, setMessageId] = useQueryState("messageId");
  const [chatId, setChatId] = useQueryState("chatId", { defaultValue: "" });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const history = initialHistory[chatId] || [];

  useEffect(() => {
    if (!chatId) {
      setChatId(nanoid());
    }
  }, [chatId, setChatId]);

  const handleNewChat = () => {
    setChatId(nanoid());
    setMessageId(null);
    setInput("");
  };

  const suggestionPrompts = [
    {
      index: 0,
      title: "AI Basics",
      prompt: "What is artificial intelligence?",
    },
    { index: 1, title: "Agents", prompt: "What are AI Agents?" },
    {
      index: 2,
      title: "React Dev",
      prompt: "Best practices in modern React development",
    },
    {
      index: 3,
      title: "Cloud",
      prompt: "Explain cloud computing and its benefits",
    },
  ];

  const { messages, sendMessage, status } = useChat({
    id: chatId ?? undefined,
    resume: Boolean(history.at(-1)?.id === messageId),
    messages: history,
    transport: createResumableTransport({ messageId, setChatId, setMessageId }),
  });

  const handleSuggestionClick = (prompt: string) => {
    if (!isLoading) {
      sendMessage({
        id: nanoid(),
        role: "user",
        parts: [{ type: "text", text: prompt }],
      });
    }
  };

  const isLoading =
    status === "submitted" ||
    (status === "streaming" &&
      !messages[messages.length - 1]?.parts.some(
        (part) => part.type === "text" && Boolean(part.text),
      ));

  const visibleMessages = useMemo(
    () =>
      messages.filter((message) =>
        message.parts.some(
          (part) => part.type === "text" && Boolean(part.text),
        ),
      ),
    [messages],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  });

  return (
    <div className="relative flex flex-col w-full h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 font-sans selection:bg-slate-500/20">
      {/* Ambient Background with Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle Grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(148 163 184) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(148 163 184) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />

        {/* Floating Orbs */}
        <div
          className="absolute top-[10%] left-[15%] w-96 h-96 bg-slate-700/5 rounded-full blur-[100px] animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute bottom-[15%] right-[10%] w-[500px] h-[500px] bg-slate-600/5 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "10s", animationDelay: "2s" }}
        />
        <div
          className="absolute top-[50%] left-[50%] w-64 h-64 bg-slate-500/3 rounded-full blur-[80px] animate-pulse"
          style={{ animationDuration: "12s", animationDelay: "4s" }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex-shrink-0 border-b border-white/5 bg-slate-950/40 backdrop-blur-2xl transition-all duration-500">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-white/10 shadow-lg shadow-slate-900/20 group-hover:shadow-slate-700/30 transition-all duration-500 group-hover:scale-105">
              <Zap className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="transition-all duration-300">
              <h1 className="text-sm font-semibold text-slate-100 tracking-tight group-hover:text-white transition-colors">
                Durable Streams
              </h1>
              <p className="text-xs text-slate-500 font-medium group-hover:text-slate-400 transition-colors">
                Resilient AI Conversations
              </p>
            </div>
          </div>

          <Button
            onClick={handleNewChat}
            variant="ghost"
            className="group h-9 px-4 rounded-xl bg-slate-800/30 hover:bg-slate-700/50 border border-white/5 hover:border-white/10 text-slate-300 hover:text-slate-100 transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-sm font-medium">New Chat</span>
          </Button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="relative z-10 flex-1 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent hover:scrollbar-thumb-slate-600/50 transition-colors">
        <div className="max-w-3xl mx-auto px-4 py-12">
          {visibleMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[65vh] animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {/* Hero Icon */}
              <div className="relative mb-10 group">
                <div className="absolute inset-0 bg-slate-600/10 blur-3xl rounded-full group-hover:bg-slate-500/15 transition-all duration-700" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Bot className="w-12 h-12 text-slate-300 group-hover:text-slate-100 transition-colors duration-500" />
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>

              {/* Welcome Text */}
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-slate-100 via-slate-200 to-slate-400 text-center mb-4 tracking-tight animate-in fade-in duration-1000 delay-200">
                Welcome to Durable Streams
              </h2>
              <p className="text-slate-400 text-center max-w-lg mb-14 text-base leading-relaxed animate-in fade-in duration-1000 delay-300">
                Experience resilient LLM streaming with seamless conversation
                persistence across network interruptions.
              </p>
              <p className="text-slate-400 text-center max-w-lg mb-14 text-base leading-relaxed animate-in fade-in duration-1000 delay-300">
                I built this demo to showcase how we can use redis streams to
                create durable and resumable AI chat experiences.
              </p>

              {/* Suggestions Grid */}
              <h3 className="text-lg font-semibold text-slate-200 mb-6 tracking-tight">
                Suggestions
              </h3>
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in duration-1000 delay-500">
                {suggestionPrompts.map((item, index) => (
                  <Button
                    key={item.index}
                    onClick={() => handleSuggestionClick(item.prompt)}
                    disabled={isLoading}
                    style={{ animationDelay: `${600 + index * 100}ms` }}
                    className="cursor-pointer h-auto animate-in slide-in-from-bottom-4 fade-in flex flex-col text-left p-5 rounded-2xl bg-slate-800/20 hover:bg-slate-700/30 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-lg hover:shadow-slate-900/20"
                  >
                    <span className="text-sm font-bold text-slate-400 mb-2 group-hover:text-slate-300 transition-colors uppercase tracking-wide">
                      {item.title}
                    </span>
                    <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors leading-relaxed">
                      {item.prompt}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {visibleMessages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } animate-in fade-in slide-in-from-bottom-4 duration-700`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* AI Avatar */}
                  {message.role !== "user" && (
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700/40 to-slate-800/40 backdrop-blur-sm border border-white/10 flex items-center justify-center mt-1 shadow-lg hover:scale-110 transition-transform duration-300">
                      <Bot className="w-5 h-5 text-slate-300" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`relative max-w-[80%] rounded-2xl px-5 py-4 shadow-lg transition-all duration-300 hover:shadow-xl ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-slate-700/80 to-slate-800/80 text-slate-50 backdrop-blur-xl border border-white/10 rounded-tr-md hover:border-white/20"
                        : "bg-slate-800/30 border border-white/5 text-slate-100 rounded-tl-md backdrop-blur-xl hover:bg-slate-800/40 hover:border-white/10"
                    }`}
                  >
                    {message.role === "user" ? (
                      <div className="whitespace-pre-wrap text-[15px] font-medium leading-relaxed">
                        {message.parts
                          .filter((part) => part.type === "text")
                          .map((part) =>
                            part.type === "text" ? part.text : "",
                          )
                          .join("")}
                      </div>
                    ) : (
                      <div className="font-mono prose prose-invert prose-slate max-w-none prose-p:leading-7 prose-p:text-slate-200 prose-headings:text-slate-100 prose-strong:text-slate-100 prose-code:text-slate-300 prose-pre:bg-slate-950/60 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-pre:shadow-inner">
                        <Streamdown>
                          {message.parts
                            .filter((part) => part.type === "text")
                            .map((part) =>
                              part.type === "text" ? part.text : "",
                            )
                            .join("")}
                        </Streamdown>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-slate-600/40 to-slate-700/40 backdrop-blur-sm border border-white/10 flex items-center justify-center mt-1 shadow-lg hover:scale-110 transition-transform duration-300">
                      <User className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3 animate-in fade-in duration-500">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700/40 to-slate-800/40 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-lg">
                    <Bot className="w-5 h-5 text-slate-300 animate-pulse" />
                  </div>
                  <div className="flex items-center px-5 py-4 rounded-2xl bg-slate-800/30 border border-white/5 backdrop-blur-xl">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-px" />
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="relative z-20 flex-shrink-0 px-4 pb-6 pt-4 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim() && !isLoading) {
                sendMessage({
                  id: nanoid(),
                  role: "user",
                  parts: [{ type: "text", text: input }],
                });
                setInput("");
              }
            }}
            className="relative group"
          >
            <div className="relative flex items-end gap-3 p-3 bg-slate-800/20 backdrop-blur-2xl border border-white/8 rounded-2xl focus-within:border-white/20 focus-within:bg-slate-800/30 focus-within:shadow-lg focus-within:shadow-slate-900/50 transition-all duration-300 shadow-xl shadow-slate-950/40 hover:border-white/12 hover:bg-slate-800/25">
              <Input
                type="text"
                value={input}
                placeholder="Ask anything..."
                className="font-mono flex-1 min-h-[48px] px-5 py-3 bg-transparent border-0 ring-0 focus-visible:ring-0 text-slate-100 placeholder:text-slate-500 text-base resize-none"
                autoFocus
                disabled={isLoading}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim() && !isLoading) {
                      sendMessage({
                        id: nanoid(),
                        role: "user",
                        parts: [{ type: "text", text: input }],
                      });
                      setInput("");
                    }
                  }
                }}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                size="icon"
                className={`h-10 w-10 rounded-xl flex-shrink-0 transition-all duration-300 hover:scale-105 active:scale-95 ${
                  input.trim()
                    ? "bg-gradient-to-br from-slate-700/60 to-slate-800/60 hover:from-slate-600/80 hover:to-slate-700/80 text-slate-200 hover:text-white border border-white/10 hover:border-white/20 shadow-lg shadow-slate-900/30 hover:shadow-slate-700/40"
                    : "bg-slate-800/30 text-slate-500 border border-white/5 hover:bg-slate-800/40 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-300 rounded-full animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-[-2px]" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

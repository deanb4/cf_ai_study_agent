import { useState, useEffect, useRef } from "react";
import { useAgent } from "agents/react";
import { useAgentChat } from "@cloudflare/ai-chat/react";
import "./App.css";

function stripMarkdown(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/g, "") 
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .trim();
}

export default function App() {
  const agent = useAgent({ agent: "ChatAgent" });
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, clearHistory, status } = useAgentChat({
    agent,
    onToolCall: async ({ toolCall, addToolOutput }) => {
      if (toolCall.toolName === "generateQuestion") {
        addToolOutput({
          toolCallId: toolCall.toolCallId,
          output: {
            status: "ok",
            message: "Question generated. Now write the full question for the user based on the topic and difficulty provided.",
          },
        });
      }

      if (toolCall.toolName === "checkAnswer") {
        const inp = toolCall.input as { correct: boolean; explanation: string };

        setScore(s => ({
          correct: s.correct + (inp.correct ? 1 : 0),
          total: s.total + 1,
        }));

        addToolOutput({
          toolCallId: toolCall.toolCallId,
          output: { correct: inp.correct, explanation: inp.explanation },
        });
      }
    },
  });



  useEffect(() => {
    if (status !== "streaming") {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [status]);

  useEffect(() => {
    setTimeout(() => {
      (agent.stub as any).getScore().then((s: any) => {
        console.log("loaded score:", s);
        if (s) setScore(s);
      });
    }, 500);
  }, [agent]);

 
  const send = () => {
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-left">
          <span className="app__eyebrow">Computer Science</span>
          <h1 className="app__title">Study</h1>
        </div>
        <div className="app__header-right">
          <div className="app__score-block">
            <span className="app__score-label">Score</span>
            <span className="app__score-value">
              {score.correct}<span className="app__score-sep">/</span>{score.total}
            </span>
          </div>
          <button
            className="app__reset"
            onClick={() => {
              (agent.stub as any).resetScore();
              clearHistory();
              setScore({ correct: 0, total: 0 });
            }}
          >
            Reset
          </button>
        </div>
      </header>

      <main className="app__main">
        <div className="app__messages">
          {messages.length === 0 && (
            <div className="app__empty">
              <p className="app__empty-title">Ready to study?</p>
              <p className="app__empty-sub">
                Ask a question or say <em>"quiz me on binary trees"</em> to begin.
              </p>
            </div>
          )}

          {(messages as any[]).map((msg) => (
            <div key={msg.id} className={`app__message app__message--${msg.role}`}>
              {msg.parts?.map((part: any, i: number) => {
                if (part.type === "text") {
                  return (
                    <div key={i} className={`app__bubble app__bubble--${msg.role}`}>
                      {msg.role === "assistant" ? stripMarkdown(part.text ?? "") : part.text}
                    </div>
                  );
                }
                if (
                  part.type === "tool" &&
                  part.toolName === "checkAnswer" &&
                  part.state === "output-available"
                ) {
                  const correct = part.output?.correct as boolean;
                  const s = part.output?.newScore as { correct: number; total: number };
                  return (
                    <div key={i} className={`app__verdict app__verdict--${correct ? "correct" : "wrong"}`}>
                      <span className="app__verdict-icon">{correct ? "✓" : "✗"}</span>
                      <span className="app__verdict-text">{correct ? "Correct" : "Incorrect"}</span>
                      {s && <span className="app__verdict-score">{s.correct}/{s.total}</span>}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          ))}

          {status === "streaming" && (
            <div className="app__message app__message--assistant">
              <div className="app__thinking">
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="app__footer">
        <div className="app__input-row">
          <input
            ref={inputRef}
            autoFocus
            className="app__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Answer or ask anything…"
            disabled={status === "streaming"}
          />
          <button className="app__send" onClick={send} disabled={status === "streaming"}>
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}